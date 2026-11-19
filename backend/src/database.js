import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { resolve } from 'node:path';
import { SUPABASE_ROOT_CA_2021 } from './supabase-ca.js';

export const DATABASE_SCHEMA = 'ruangkisah';

function normalizePemCert(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');
  const match = cleaned.match(/-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/);
  if (!match) return cleaned;
  const body = match[1].replace(/\s+/g, '');
  const lines = body.match(/.{1,64}/g) || [];
  return '-----BEGIN CERTIFICATE-----\n' + lines.join('\n') + '\n-----END CERTIFICATE-----';
}

export async function openDatabase(config) {
  let dialect;
  if (config.databaseProvider === 'postgres') {
    // SSL URL parameters override pg's ssl object, so normalize them in one place.
    const url = new URL(config.databaseUrl);
    for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl'])
      url.searchParams.delete(key);
    const customCa = normalizePemCert(config.databaseCa);
    const isSupabase = /(?:^|\.)supabase\.(?:co|com)$/i.test(url.hostname);
    const caList = [
      ...(customCa ? [customCa] : []),
      ...(isSupabase ? [SUPABASE_ROOT_CA_2021] : []),
    ];
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
            ...(caList.length ? { ca: caList } : {}),
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
