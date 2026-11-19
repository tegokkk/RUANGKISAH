import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import EmbeddedPostgres from 'embedded-postgres';
import { createServer } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename } from 'node:path';
import { randomBytes } from 'node:crypto';

export async function startTestPostgres() {
  const temporary = resolve(tmpdir());
  const directory = mkdtempSync(resolve(temporary, 'ruangkisah-pg-'));
  const probe = createServer();
  await new Promise((done) => probe.listen(0, '127.0.0.1', done));
  const port = probe.address().port;
  await new Promise((done) => probe.close(done));
  const password = randomBytes(24).toString('hex');
  const cluster = new EmbeddedPostgres({
    databaseDir: resolve(directory, 'cluster'),
    user: 'postgres',
    password,
    port,
    authMethod: 'scram-sha-256',
    persistent: true,
    createPostgresUser: false,
    autoRehydrateSymlinks: true,
    initdbFlags: ['--encoding=UTF8'],
    postgresFlags: ['-h', '127.0.0.1'],
    onLog: () => {},
    onError: () => {},
  });
  let nativeProcess, binaries;
  const stop = async () => {
    if (nativeProcess && nativeProcess.exitCode === null) {
      const closed = new Promise((done) => nativeProcess.once('close', done));
      await promisify(execFile)(
        binaries.pg_ctl,
        ['stop', '-D', resolve(directory, 'cluster'), '-m', 'fast', '-w'],
        { windowsHide: true, timeout: 30000 },
      );
      await closed;
    } else if (!nativeProcess) await cluster.stop();
  };
  try {
    await cluster.initialise();
    if (process.platform === 'win32') {
      // Use pg_ctl for graceful shutdown instead of the package's Windows taskkill path.
      binaries = await import('@embedded-postgres/windows-x64');
      await new Promise((done, reject) => {
        nativeProcess = spawn(
          binaries.postgres,
          ['-D', resolve(directory, 'cluster'), '-h', '127.0.0.1', '-p', String(port)],
          { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
        );
        nativeProcess.stdout.resume();
        nativeProcess.stderr.on('data', (chunk) => {
          if (chunk.toString().includes('database system is ready to accept connections')) done();
        });
        nativeProcess.once('error', reject);
        nativeProcess.once('exit', () =>
          reject(new Error('Test PostgreSQL stopped before becoming ready.')),
        );
      });
      const client = cluster.getPgClient('postgres', '127.0.0.1');
      await client.connect();
      try {
        await client.query('CREATE DATABASE ruangkisah_test');
      } finally {
        await client.end();
      }
    } else {
      await cluster.start();
      await cluster.createDatabase('ruangkisah_test');
    }
  } catch (error) {
    await stop().catch(() => {});
    throw error;
  }
  return {
    url: 'postgresql://postgres:' + password + '@127.0.0.1:' + port + '/ruangkisah_test',
    close: async () => {
      await stop();
      // Never clean a computed path unless it is our own named temporary directory.
      if (dirname(directory) !== temporary || !basename(directory).startsWith('ruangkisah-pg-'))
        throw new Error('Refusing to clean an unexpected fixture directory.');
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
