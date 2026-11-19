import { sql } from 'kysely';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/database.js';
import { assertSchemaReady } from '../src/schema.js';

const password = process.env.RUNTIME_DB_PASSWORD;
if (!password || password.length < 32)
  throw new Error('Atur RUNTIME_DB_PASSWORD unik minimal 32 karakter melalui environment privat.');
const database = await openDatabase(
  loadConfig({
    databaseProvider: 'postgres',
    autoMigrate: false,
    databaseUrl: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
  }),
);
try {
  await assertSchemaReady(database.db);
  await database.db.transaction().execute(async (transaction) => {
    const existing = await sql`select 1 from pg_roles where rolname = 'ruangkisah_runtime'`.execute(
      transaction,
    );
    if (existing.rows.length) throw new Error('Role runtime sudah tersedia.');
    // DDL does not accept parameter placeholders here; sql.lit safely quotes the secret.
    await sql`create role ruangkisah_runtime login nosuperuser nocreatedb nocreaterole nobypassrls password ${sql.lit(password)}`.execute(
      transaction,
    );
    await sql`grant ruangkisah_app to ruangkisah_runtime`.execute(transaction);
  });
  console.log(
    'Role ruangkisah_runtime dibuat. Gunakan role ini pada DATABASE_URL Vercel; password tidak dicetak.',
  );
} catch {
  console.error(
    'Role runtime belum dibuat: periksa izin migrator atau apakah role sudah tersedia. Tidak ada rotasi otomatis.',
  );
  process.exitCode = 1;
} finally {
  await database.close();
}
