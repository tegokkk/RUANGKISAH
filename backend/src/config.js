import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

export function loadConfig(overrides = {}) {
  const production = process.env.NODE_ENV === 'production';
  const vercel = process.env.VERCEL === '1';
  const previewUrl =
    vercel && process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
      ? 'https://' + process.env.VERCEL_URL
      : undefined;
  const config = {
    production,
    vercel,
    port: Number(process.env.PORT || 4000),
    host: process.env.HOST || '127.0.0.1',
    dataDir: resolve(process.env.DATA_DIR || '.data'),
    publicUrl: process.env.PUBLIC_URL || previewUrl || 'http://localhost:5173',
    secret: process.env.AUTH_SECRET,
    mailMode: process.env.MAIL_MODE || (production || vercel ? 'smtp' : 'file'),
    smtpUrl: process.env.SMTP_URL,
    mailFrom: process.env.MAIL_FROM,
    databaseProvider:
      process.env.DATABASE_PROVIDER || (process.env.DATABASE_URL ? 'postgres' : 'sqlite'),
    databaseUrl: process.env.DATABASE_URL,
    databaseSsl: process.env.DATABASE_SSL !== 'false',
    databaseCa: process.env.DATABASE_CA_CERT,
    databasePoolMax: Number(process.env.DATABASE_POOL_MAX || 1),
    serveFrontend: process.env.SERVE_FRONTEND === 'true',
    frontendDir: fileURLToPath(new URL('../../frontend/dist', import.meta.url)),
    autoMigrate: !production && !vercel && !process.env.DATABASE_URL,
    test: false,
    trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || (vercel ? 1 : 0)),
    ...overrides,
  };
  if (!['postgres', 'sqlite'].includes(config.databaseProvider))
    throw new Error('DATABASE_PROVIDER harus postgres atau sqlite.');
  if ((config.production || config.vercel) && config.databaseProvider !== 'postgres')
    throw new Error('Produksi/Vercel memerlukan PostgreSQL melalui DATABASE_URL.');
  if (config.databaseProvider === 'postgres') {
    let url;
    try {
      url = new URL(config.databaseUrl);
    } catch {
      throw new Error('DATABASE_URL PostgreSQL wajib dan harus valid.');
    }
    if (!['postgres:', 'postgresql:'].includes(url.protocol))
      throw new Error('DATABASE_URL harus berupa koneksi PostgreSQL.');
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (
      (!config.databaseSsl || ['disable', 'no-verify'].includes(url.searchParams.get('sslmode'))) &&
      !local
    )
      throw new Error('Database remote memerlukan TLS dengan verifikasi sertifikat.');
    if (
      !Number.isInteger(config.databasePoolMax) ||
      config.databasePoolMax < 1 ||
      config.databasePoolMax > 5
    )
      throw new Error('DATABASE_POOL_MAX harus 1 sampai 5.');
  }
  if ((config.production || config.vercel) && config.autoMigrate)
    throw new Error('Migrasi produksi harus dijalankan eksplisit, bukan saat request.');
  if (!config.secret) {
    if (config.production || config.vercel)
      throw new Error('AUTH_SECRET wajib diatur pada produksi.');
    mkdirSync(config.dataDir, { recursive: true, mode: 0o700 });
    const secretPath = resolve(config.dataDir, 'auth-secret');
    if (!existsSync(secretPath))
      writeFileSync(secretPath, randomBytes(48).toString('base64url'), { mode: 0o600, flag: 'wx' });
    config.secret = readFileSync(secretPath, 'utf8').trim();
  }
  if (config.secret.length < 32) throw new Error('AUTH_SECRET minimal 32 karakter.');
  if (config.databaseProvider === 'sqlite')
    mkdirSync(config.dataDir, { recursive: true, mode: 0o700 });
  if (![0, 1].includes(config.trustProxyHops)) throw new Error('TRUST_PROXY_HOPS hanya 0 atau 1.');
  let publicUrl;
  try {
    publicUrl = new URL(config.publicUrl);
  } catch {
    throw new Error('PUBLIC_URL tidak valid.');
  }
  if (publicUrl.origin !== config.publicUrl || publicUrl.username || publicUrl.password)
    throw new Error('PUBLIC_URL harus origin tanpa path atau credential.');
  if ((config.production || config.vercel) && publicUrl.protocol !== 'https:')
    throw new Error('PUBLIC_URL HTTPS wajib pada produksi.');
  if (!['file', 'smtp'].includes(config.mailMode))
    throw new Error('MAIL_MODE harus file atau smtp.');
  if ((config.production || config.vercel) && config.mailMode !== 'smtp')
    throw new Error('Produksi memerlukan pengiriman email SMTP.');
  if (config.mailMode === 'smtp' && (!config.smtpUrl || !config.mailFrom))
    throw new Error('SMTP_URL dan MAIL_FROM wajib untuk pengiriman email.');
  if (config.mailMode === 'smtp') {
    let smtp;
    try {
      smtp = new URL(config.smtpUrl);
    } catch {
      throw new Error('SMTP_URL tidak valid.');
    }
    if (!['smtp:', 'smtps:'].includes(smtp.protocol))
      throw new Error('SMTP_URL harus memakai smtp:// atau smtps://.');
  }
  config.origins =
    config.production || config.vercel
      ? [publicUrl.origin]
      : [
          publicUrl.origin,
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:4173',
          'http://localhost:4173',
        ];
  return config;
}
