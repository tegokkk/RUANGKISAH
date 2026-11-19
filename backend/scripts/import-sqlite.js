import { resolve } from 'node:path';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/database.js';
import { assertSchemaReady } from '../src/schema.js';
import { importSqliteAccounts } from '../src/import-sqlite.js';

const sourceIndex = process.argv.indexOf('--source');
if (sourceIndex < 0 || !process.argv[sourceIndex + 1])
  throw new Error('Gunakan --source dengan path file SQLite yang akan dibaca.');
const config = loadConfig({
  databaseProvider: 'postgres',
  autoMigrate: false,
  databaseUrl: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
});
const database = await openDatabase(config);
try {
  await assertSchemaReady(database.db);
  const result = await importSqliteAccounts(database, resolve(process.argv[sourceIndex + 1]));
  console.log(
    'Impor selesai: ' +
      result.users +
      ' akun. ID/hash dipertahankan; semua pengguna perlu login ulang.',
  );
} catch {
  console.error('Impor gagal. Tujuan harus sudah dimigrasikan dan kosong; sumber tidak diubah.');
  process.exitCode = 1;
} finally {
  await database.close();
}
