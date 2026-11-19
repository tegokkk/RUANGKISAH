import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const child = spawn(
  process.execPath,
  [
    '--test',
    '--test-concurrency=1',
    'tests/accounts.test.js',
    'tests/approval-migration.test.js',
    'tests/deployment.test.js',
  ],
  {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, TEST_DATABASE_PROVIDER: 'postgres' },
    stdio: 'inherit',
    windowsHide: true,
  },
);
child.on('error', () => {
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
