import { createServer } from 'node:http';
import { createVercelHandler } from '../src/vercel.js';
import { startTestPostgres } from '../tests/helpers/postgres.js';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createApplication } from '../src/app.js';

if (process.env.NODE_ENV === 'production')
  throw new Error('Server fixture khusus pengujian lokal.');
const parent = resolve('.data');
mkdirSync(parent, { recursive: true });
const dataDir = mkdtempSync(resolve(parent, 'e2e-'));
const postgres = process.env.E2E_DATABASE_PROVIDER === 'sqlite' ? null : await startTestPostgres();
const service = await createApplication({
  databaseProvider: postgres ? 'postgres' : 'sqlite',
  databaseUrl: postgres?.url,
  databaseSsl: false,
  autoMigrate: true,
  dataDir,
  test: true,
  publicUrl: 'http://127.0.0.1:4001',
  mailMode: 'file',
  port: 4001,
  serveFrontend: true,
  frontendDir: resolve('../frontend/dist'),
});
for (const [email, role] of [
  ['owner@example.test', 'superadmin'],
  ['admin@example.test', 'admin'],
  ['student@example.test', 'siswa'],
]) {
  const result = await service.auth.api.signUpEmail({
    body: {
      name: 'Pengelola Pengujian',
      email,
      password: 'E2E-Only-Password-123!',
      termsAccepted: true,
    },
  });
  await service.db
    .updateTable('user')
    .set({ role, approvalStatus: 'approved', emailVerified: service.database.boolean(true) })
    .where('id', '=', result.user.id)
    .execute();
}
// Exposed only to the test process through stdout. No HTTP endpoint can read mail.
console.log('E2E_DATA_DIR=' + dataDir);
const server = createServer(createVercelHandler(async () => service)).listen(
  4001,
  '127.0.0.1',
  () => console.log('E2E application ready'),
);
function close() {
  server.close(async () => {
    await service.close();
    await postgres?.close();
    if (dirname(dataDir) === parent) rmSync(dataDir, { recursive: true, force: true });
    process.exit(0);
  });
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
