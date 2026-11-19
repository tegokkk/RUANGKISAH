import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename } from 'node:path';
import { createApplication } from '../src/app.js';
import { migrateDatabase } from '../src/schema.js';
import { startTestPostgres } from './helpers/postgres.js';

test(
  'upgrade persetujuan menjaga pengelola, mengunci siswa lama dan tidak menyetujui pendaftaran baru saat migrasi diulang',
  { timeout: 120000 },
  async () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'ruangkisah-approval-'));
    const postgres =
      process.env.TEST_DATABASE_PROVIDER === 'postgres' ? await startTestPostgres() : null;
    let service;
    try {
      service = await createApplication({
        databaseProvider: postgres ? 'postgres' : 'sqlite',
        databaseUrl: postgres?.url,
        databaseSsl: false,
        autoMigrate: true,
        test: true,
        dataDir: directory,
        mailMode: 'file',
      });
      const ids = {};
      for (const [name, role] of [
        ['student', 'siswa'],
        ['owner', 'superadmin'],
      ]) {
        const registered = await service.auth.api.signUpEmail({
          body: {
            name: 'Akun Lama ' + name,
            email: name + '@migration.example.test',
            password: 'Migration-Test-Password-123!',
            termsAccepted: true,
          },
        });
        ids[name] = registered.user.id;
        await service.db
          .updateTable('user')
          .set({ role, approvalStatus: 'approved', emailVerified: service.database.boolean(true) })
          .where('id', '=', registered.user.id)
          .execute();
        await service.auth.api.signInEmail({
          body: {
            email: name + '@migration.example.test',
            password: 'Migration-Test-Password-123!',
          },
        });
      }
      assert.equal((await service.db.selectFrom('session').select('id').execute()).length, 2);
      await service.db.deleteFrom('app_migrations').execute();
      await service.db
        .insertInto('app_migrations')
        .values({ version: 1, appliedAt: new Date().toISOString() })
        .execute();
      await service.db.schema.alterTable('user').dropColumn('approvalStatus').execute();
      await migrateDatabase(service.database, service.auth, service.config);
      const users = await service.db.selectFrom('user').select(['id', 'approvalStatus']).execute();
      assert.equal(users.find((user) => user.id === ids.student).approvalStatus, 'pending');
      assert.equal(users.find((user) => user.id === ids.owner).approvalStatus, 'approved');
      assert.equal(
        (
          await service.db
            .selectFrom('session')
            .select('id')
            .where('userId', '=', ids.student)
            .execute()
        ).length,
        0,
      );
      assert.equal(
        (
          await service.db
            .selectFrom('session')
            .select('id')
            .where('userId', '=', ids.owner)
            .execute()
        ).length,
        1,
      );
      const pending = await service.auth.api.signUpEmail({
        body: {
          name: 'Pendaftar Baru',
          email: 'new@migration.example.test',
          password: 'Migration-Test-Password-123!',
          termsAccepted: true,
        },
      });
      await migrateDatabase(service.database, service.auth, service.config);
      assert.equal(
        (
          await service.db
            .selectFrom('user')
            .select('approvalStatus')
            .where('id', '=', pending.user.id)
            .executeTakeFirst()
        ).approvalStatus,
        'pending',
      );
      assert.equal((await service.db.selectFrom('app_migrations').selectAll().execute()).length, 2);
    } finally {
      await service?.close();
      await postgres?.close();
      if (
        dirname(directory) === resolve(tmpdir()) &&
        basename(directory).startsWith('ruangkisah-approval-')
      )
        rmSync(directory, { recursive: true, force: true });
    }
  },
);
