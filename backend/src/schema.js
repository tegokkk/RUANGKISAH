import { sql } from 'kysely';
import { getMigrations } from 'better-auth/db/migration';
import { DATABASE_SCHEMA } from './database.js';

export const SCHEMA_VERSION = 2;

// Executed explicitly by db:migrate for PostgreSQL, never on a Vercel request.
export async function migrateDatabase(database, auth, config) {
  const { db } = database;
  if (config.databaseProvider === 'postgres')
    await db.schema.createSchema(DATABASE_SCHEMA).ifNotExists().execute();
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  await db.schema
    .createTable('audit_log')
    .ifNotExists()
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('actorId', 'text', (column) => column.notNull())
    .addColumn('actorEmail', 'text', (column) => column.notNull())
    .addColumn('actorRole', 'text', (column) => column.notNull())
    .addColumn('action', 'text', (column) => column.notNull())
    .addColumn('targetId', 'text', (column) => column.notNull())
    .addColumn('targetEmail', 'text', (column) => column.notNull())
    .addColumn('result', 'text', (column) => column.notNull())
    .addColumn('timestamp', 'text', (column) => column.notNull())
    .execute();
  await db.schema
    .createTable('request_limit')
    .ifNotExists()
    .addColumn('key', 'text', (column) => column.primaryKey())
    .addColumn('count', 'integer', (column) => column.notNull())
    .addColumn('resetAt', 'bigint', (column) => column.notNull())
    .execute();
  await db.schema
    .createTable('app_migrations')
    .ifNotExists()
    .addColumn('version', 'integer', (column) => column.primaryKey())
    .addColumn('appliedAt', 'text', (column) => column.notNull())
    .execute();
  for (const [table, field] of [
    ['audit_log', 'timestamp'],
    ['request_limit', 'resetAt'],
    ['session', 'expiresAt'],
    ['verification', 'expiresAt'],
  ]) {
    await db.schema
      .createIndex(table + '_' + field + '_cleanup')
      .ifNotExists()
      .on(table)
      .column(field)
      .execute();
  }
  if (config.databaseProvider === 'postgres') {
    // These tables are NOT Supabase Auth tables and must never be exposed via Data API.
    await sql`revoke all on schema ${sql.id(DATABASE_SCHEMA)} from public`.execute(db);
    await sql`do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'ruangkisah_app') then
        create role ruangkisah_app nologin nobypassrls;
      end if;
    end $$`.execute(db);
    await sql`grant usage on schema ${sql.id(DATABASE_SCHEMA)} to ruangkisah_app`.execute(db);
    for (const table of [
      'user',
      'account',
      'session',
      'verification',
      'audit_log',
      'request_limit',
      'app_migrations',
    ]) {
      const qualified = sql.id(DATABASE_SCHEMA, table);
      await sql`alter table ${qualified} enable row level security`.execute(db);
      await sql`revoke all on ${qualified} from public`.execute(db);
      await sql`grant select, insert, update, delete on ${qualified} to ruangkisah_app`.execute(db);
      await sql`drop policy if exists backend_access on ${qualified}`.execute(db);
      await sql`create policy backend_access on ${qualified} to ruangkisah_app using (true) with check (true)`.execute(
        db,
      );
    }
    // Supabase roles may not exist in a standalone PostgreSQL test cluster.
    await sql`do $$ declare browser_role text; begin
      foreach browser_role in array array['anon','authenticated','service_role'] loop
        if exists (select 1 from pg_roles where rolname = browser_role) then
          execute format('revoke all on schema ruangkisah from %I', browser_role);
          execute format('revoke all on all tables in schema ruangkisah from %I', browser_role);
        end if;
      end loop;
    end $$`.execute(db);
  }
  await db.transaction().execute(async (transaction) => {
    const applied = await transaction
      .selectFrom('app_migrations')
      .select('version')
      .where('version', '=', SCHEMA_VERSION)
      .executeTakeFirst();
    if (!applied) {
      // Existing appointed managers must be able to review the student queue.
      // Existing students, like new registrations, need an explicit approval.
      await transaction
        .updateTable('user')
        .set({ approvalStatus: 'approved' })
        .where('role', 'in', ['admin', 'superadmin'])
        .execute();
      await transaction
        .deleteFrom('session')
        .where(
          'userId',
          'in',
          transaction.selectFrom('user').select('id').where('approvalStatus', '!=', 'approved'),
        )
        .execute();
      await transaction
        .insertInto('app_migrations')
        .values({ version: SCHEMA_VERSION, appliedAt: new Date().toISOString() })
        .onConflict((conflict) => conflict.column('version').doNothing())
        .execute();
    }
  });
}

export async function assertSchemaReady(db) {
  const migration = await db
    .selectFrom('app_migrations')
    .select('version')
    .where('version', '=', SCHEMA_VERSION)
    .executeTakeFirst();
  if (!migration) throw new Error('Jalankan db:migrate sebelum menjalankan API.');
}
