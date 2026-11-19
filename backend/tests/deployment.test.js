import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename } from 'node:path';
import { importSqliteAccounts } from '../src/import-sqlite.js';
import { createAuth } from '../src/auth.js';
import { test } from 'node:test';
import { EventEmitter } from 'node:events';
import assert from 'node:assert/strict';
import { sql } from 'kysely';
import { loadConfig } from '../src/config.js';
import { createApplication } from '../src/app.js';
import { openDatabase } from '../src/database.js';
import { migrateDatabase } from '../src/schema.js';
import { consumeRateLimit } from '../src/rate-limit.js';
import { createVercelHandler } from '../src/vercel.js';
import { startTestPostgres } from './helpers/postgres.js';

test('konfigurasi produksi menolak SQLite, secret hilang, SMTP file, TLS remote nonaktif dan migrasi saat request', () => {
  const valid = {
    production: true,
    vercel: false,
    databaseProvider: 'postgres',
    databaseUrl: 'postgresql://runtime:placeholder@db.example.test/postgres',
    databaseSsl: true,
    autoMigrate: false,
    secret: 'test-only-configuration-secret-123456789',
    publicUrl: 'https://example.test',
    mailMode: 'smtp',
    smtpUrl: 'smtps://mail.example.test',
    mailFrom: 'noreply@example.test',
  };
  assert.equal(loadConfig(valid).databasePoolMax, 1);
  for (const invalid of [
    { databaseProvider: 'sqlite' },
    { secret: '' },
    { mailMode: 'file' },
    { databaseSsl: false },
    { autoMigrate: true },
    { publicUrl: 'http://example.test' },
    { databaseUrl: 'not-a-url' },
    { databasePoolMax: 20 },
  ])
    assert.throws(() => loadConfig({ ...valid, ...invalid }));
});

test('handler Vercel berbagi inisialisasi dan memulihkan kegagalan tanpa membocorkan secret', async () => {
  let calls = 0;
  const handler = createVercelHandler(async () => {
    calls += 1;
    await Promise.resolve();
    return { app: (_req, res) => res.end('ok') };
  });
  const response = () =>
    Object.assign(new EventEmitter(), {
      headers: {},
      setHeader(key, value) {
        this.headers[key] = value;
      },
      end(body) {
        this.body = body;
        this.emit('finish');
      },
    });
  const first = response(),
    second = response();
  await Promise.all([handler({}, first), handler({}, second)]);
  assert.equal(calls, 1);
  assert.equal(first.body, 'ok');
  let attempts = 0;
  const retrying = createVercelHandler(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('secret-database-url');
    return { app: (_req, res) => res.end('recovered') };
  });
  const failed = response();
  await retrying({}, failed);
  assert.equal(failed.statusCode, 503);
  assert.equal(failed.headers['Cache-Control'], 'no-store');
  assert.ok(!failed.body.includes('secret-database-url'));
  const recovered = response();
  await retrying({}, recovered);
  assert.equal(recovered.body, 'recovered');
});

test(
  'PostgreSQL: migrasi idempotent, schema privat/RLS, koneksi runtime terbatas dan rate limit atomik lintas instance',
  {
    skip: process.env.TEST_DATABASE_PROVIDER !== 'postgres',
    timeout: 120000,
  },
  async () => {
    const postgres = await startTestPostgres();
    const config = {
      databaseProvider: 'postgres',
      databaseUrl: postgres.url,
      databaseSsl: false,
      autoMigrate: true,
      test: true,
      secret: 'postgres-test-secret-only-1234567890',
      mailMode: 'file',
    };
    // mail outbox and data directory are isolated from normal development.
    const service = await createApplication({
      ...config,
      mailMode: 'smtp',
      smtpUrl: 'smtp://localhost:1',
      mailFrom: 'test@example.test',
    });
    let other, runtime;
    try {
      await migrateDatabase(service.database, service.auth, service.config);
      assert.equal((await service.db.selectFrom('app_migrations').selectAll().execute()).length, 1);
      const tables = await sql`select c.relname, c.relrowsecurity from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'ruangkisah' and c.relkind = 'r'`.execute(service.db);
      assert.equal(tables.rows.length, 7);
      assert.ok(tables.rows.every((row) => row.relrowsecurity));
      const publicTables =
        await sql`select tablename from pg_tables where schemaname = 'public'`.execute(service.db);
      assert.equal(publicTables.rows.length, 0);
      await sql`create role browser_fixture nologin`.execute(service.db);
      const access =
        await sql`select has_schema_privilege('browser_fixture', 'ruangkisah', 'usage') as allowed`.execute(
          service.db,
        );
      assert.equal(access.rows[0].allowed, false);
      await service.db.transaction().execute(async (transaction) => {
        await sql`set local role ruangkisah_app`.execute(transaction);
        await transaction.selectFrom('user').select('id').execute();
        // role has DML permission but cannot create/drop schema objects.
        const privilege =
          await sql`select has_schema_privilege(current_user, 'ruangkisah', 'create') as allowed`.execute(
            transaction,
          );
        assert.equal(privilege.rows[0].allowed, false);
      });
      const sourceDirectory = mkdtempSync(resolve(tmpdir(), 'ruangkisah-import-'));
      let source;
      try {
        source = await createApplication({
          databaseProvider: 'sqlite',
          dataDir: sourceDirectory,
          databaseUrl: undefined,
          autoMigrate: true,
          test: true,
          mailMode: 'file',
          secret: config.secret,
        });
        const password = 'Import-Test-Only-Strong-123!';
        const registered = await source.auth.api.signUpEmail({
          body: {
            name: 'Siswa Impor',
            email: 'import@example.test',
            password,
            termsAccepted: true,
          },
        });
        await source.db
          .updateTable('user')
          .set({ emailVerified: 1, approvalStatus: 'approved' })
          .where('id', '=', registered.user.id)
          .execute();
        await source.auth.api.signInEmail({ body: { email: 'import@example.test', password } });
        await source.close();
        source = undefined;
        const filename = resolve(sourceDirectory, 'accounts.sqlite');
        const before = readFileSync(filename);
        assert.equal((await importSqliteAccounts(service.database, filename)).users, 1);
        assert.deepEqual(readFileSync(filename), before);
        assert.equal((await service.db.selectFrom('session').selectAll().execute()).length, 0);
        const imported = await service.auth.api.signInEmail({
          body: { email: 'import@example.test', password },
        });
        assert.equal(imported.user.id, registered.user.id);
        await assert.rejects(
          importSqliteAccounts(service.database, filename),
          /Tujuan harus kosong/,
        );
      } finally {
        await source?.close();
        if (
          dirname(sourceDirectory) === resolve(tmpdir()) &&
          basename(sourceDirectory).startsWith('ruangkisah-import-')
        )
          rmSync(sourceDirectory, { recursive: true, force: true });
      }
      const loginPassword = new URL(postgres.url).password;
      await sql`create role runtime_fixture login password ${sql.lit(loginPassword)}`.execute(
        service.db,
      );
      await sql`grant ruangkisah_app to runtime_fixture`.execute(service.db);
      const runtimeUrl = new URL(postgres.url);
      runtimeUrl.username = 'runtime_fixture';
      runtime = await openDatabase({ ...service.config, databaseUrl: runtimeUrl.toString() });
      const runtimeAuth = await createAuth(runtime, service.config, async () => {});
      const createdByRuntime = await runtimeAuth.api.signUpEmail({
        body: {
          name: 'Siswa Runtime',
          email: 'runtime@example.test',
          password: 'Runtime-Test-Only-Strong-123!',
          termsAccepted: true,
        },
      });
      await runtime.db
        .updateTable('user')
        .set({ emailVerified: true, approvalStatus: 'approved' })
        .where('id', '=', createdByRuntime.user.id)
        .execute();
      const signedByRuntime = await runtimeAuth.api.signInEmail({
        body: { email: 'runtime@example.test', password: 'Runtime-Test-Only-Strong-123!' },
      });
      assert.equal(signedByRuntime.user.role, 'siswa');
      other = await openDatabase(service.config);
      const decisions = await Promise.all(
        Array.from({ length: 20 }, (_, index) =>
          consumeRateLimit(index % 2 ? service.db : other.db, 'same-test-ip', {
            window: 60,
            max: 7,
          }),
        ),
      );
      assert.equal(decisions.filter((decision) => decision.allowed).length, 7);
      assert.ok(
        decisions
          .filter((decision) => !decision.allowed)
          .every((decision) => decision.retryAfter > 0),
      );
      const rows = await service.db.selectFrom('request_limit').selectAll().execute();
      assert.equal(rows[0].count, 20);
      assert.ok(!rows[0].key.includes('same-test-ip'));
    } finally {
      await runtime?.close();
      await other?.close();
      await service.close();
      await postgres.close();
    }
  },
);
