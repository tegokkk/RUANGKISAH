import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/database.js';
import { createAuth } from '../src/auth.js';
import { migrateDatabase } from '../src/schema.js';

const config = loadConfig({
  databaseProvider: 'postgres',
  databaseUrl: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
  autoMigrate: false,
});
const database = await openDatabase(config);
try {
  const auth = await createAuth(database, config);
  await migrateDatabase(database, auth, config);
  console.log('Migrasi schema privat ruangkisah selesai. Credential tidak ditampilkan.');
} catch {
  console.error(
    'Migrasi gagal. Periksa koneksi/izin database dan versi schema; credential tidak dicetak.',
  );
  process.exitCode = 1;
} finally {
  await database.close();
}
