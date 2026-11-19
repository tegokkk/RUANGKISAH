import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { resolve } from 'node:path';

export const DATABASE_SCHEMA = 'ruangkisah';

export async function openDatabase(config) {
  let dialect;
  if (config.databaseProvider === 'postgres') {
    // SSL URL parameters override pg's ssl object, so normalize them in one place.
    const url = new URL(config.databaseUrl);
    for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl'])
      url.searchParams.delete(key);
    const pool = new Pool({
      connectionString: url.toString(),
      max: config.databasePoolMax,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      query_timeout: 15000,
      maxLifetimeSeconds: 60,
      ssl: config.databaseSsl
        ? {
            rejectUnauthorized: true,
            ...(config.databaseCa ? { ca: config.databaseCa.replace(/\\n/g, '\n') } : {}),
          }
        : false,
    });
    // Never log the Error object: connection errors can contain credentials.
    pool.on('error', () => console.error('PostgreSQL idle connection failed.'));
    if (config.vercel) attachDatabasePool(pool);
    dialect = new PostgresDialect({ pool });
  } else {
    // SQLite remains available only for local development/legacy data tools.
    const { DatabaseSync } = await import('node:sqlite');
    const { NodeSqliteDialect } = await import('@better-auth/kysely-adapter/node-sqlite-dialect');
    const native = new DatabaseSync(resolve(config.dataDir, 'accounts.sqlite'));
    native.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    dialect = new NodeSqliteDialect({ database: native });
  }
  const base = new Kysely({ dialect });
  const postgres = config.databaseProvider === 'postgres';
  return {
    db: postgres ? base.withSchema(DATABASE_SCHEMA) : base,
    authDatabase: {
      db: base,
      type: postgres ? 'postgres' : 'sqlite',
      transaction: true,
      ...(postgres ? { schemaName: DATABASE_SCHEMA } : {}),
    },
    date: (milliseconds = Date.now()) => (postgres ? new Date(milliseconds) : milliseconds),
    boolean: (value) => (postgres ? Boolean(value) : Number(Boolean(value))),
    close: () => base.destroy(),
  };
}
