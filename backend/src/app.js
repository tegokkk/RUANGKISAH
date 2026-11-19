import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { loadConfig } from './config.js';
import { createAuth } from './auth.js';
import { openDatabase } from './database.js';
import { assertSchemaReady, migrateDatabase } from './schema.js';
import { consumeRateLimit } from './rate-limit.js';

const PUBLIC_FIELDS = [
  'id',
  'name',
  'email',
  'role',
  'status',
  'emailVerified',
  'approvalStatus',
  'createdAt',
  'updatedAt',
];
export function publicAccount(user) {
  return {
    id: user.id,
    displayName: user.name,
    email: user.email,
    role: user.role,
    status:
      user.status === 'disabled'
        ? 'disabled'
        : user.approvalStatus !== 'approved'
          ? 'pending_approval'
          : 'active',
    emailVerified: Boolean(user.emailVerified),
    approvalStatus: user.approvalStatus,
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString(),
  };
}

export async function createApplication(overrides = {}) {
  const config = loadConfig(overrides);
  const database = await openDatabase(config);
  const { db } = database;
  let auth;
  try {
    auth = await createAuth(database, config);
    if (config.autoMigrate) await migrateDatabase(database, auth, config);
    await assertSchemaReady(db);
  } catch (error) {
    await database.close();
    throw error;
  }
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxyHops) app.set('trust proxy', config.trustProxyHops);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          ...(!config.production ? { upgradeInsecureRequests: null } : {}),
        },
      },
      strictTransportSecurity: config.production,
    }),
  );
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.get('/api/health', async (_req, res) => {
    await assertSchemaReady(db);
    res.json({ ok: true, service: 'ruangkisah-api' });
  });
  let lastPruned = 0;
  let pruning;
  async function pruneExpired() {
    if (Date.now() - lastPruned < 60000) return;
    if (!pruning)
      pruning = (async () => {
        await db.deleteFrom('session').where('expiresAt', '<', database.date()).execute();
        await db.deleteFrom('verification').where('expiresAt', '<', database.date()).execute();
        await db
          .deleteFrom('audit_log')
          .where('timestamp', '<', new Date(Date.now() - 180 * 86400000).toISOString())
          .execute();
        await db.deleteFrom('request_limit').where('resetAt', '<', Date.now()).execute();
        lastPruned = Date.now();
      })().finally(() => {
        pruning = null;
      });
    await pruning;
  }
  app.use('/api', async (req, res, next) => {
    if (
      ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) &&
      !config.origins.includes(req.get('origin'))
    )
      return res.status(403).json({ ok: false, message: 'Origin permintaan tidak diizinkan.' });
    await pruneExpired();
    if (!config.test) {
      const decision = await consumeRateLimit(db, 'api:' + req.ip, { window: 60, max: 150 });
      if (!decision.allowed)
        return res
          .status(429)
          .set('Retry-After', String(decision.retryAfter))
          .json({ ok: false, message: 'Terlalu banyak permintaan. Coba sebentar lagi.' });
    }
    next();
  });
  app.get('/api/config', (_req, res) => res.json({ emailVerificationRequired: false }));
  app.all('/api/auth/*splat', toNodeHandler(auth));
  app.use(express.json({ limit: '16kb' }));
  async function requireSession(req, res, next) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    const user =
      session?.user &&
      (await db
        .selectFrom('user')
        .select(PUBLIC_FIELDS)
        .where('id', '=', session.user.id)
        .executeTakeFirst());
    if (!user || user.status !== 'active' || user.approvalStatus !== 'approved')
      return res.status(401).json({ ok: false, message: 'Silakan masuk kembali.' });
    req.account = user;
    next();
  }
  app.get('/api/me', requireSession, (req, res) =>
    res.json({ ok: true, user: publicAccount(req.account) }),
  );
  app.use('/api/admin', requireSession, (req, res, next) => {
    if (!['admin', 'superadmin'].includes(req.account.role))
      return res.status(403).json({ ok: false, message: 'Akses tidak diizinkan.' });
    next();
  });
  app.get('/api/admin/accounts', async (req, res) => {
    let query = db.selectFrom('user').select(PUBLIC_FIELDS).orderBy('createdAt', 'desc');
    if (req.account.role !== 'superadmin') query = query.where('role', '=', 'siswa');
    res.json({ ok: true, accounts: (await query.execute()).map(publicAccount) });
  });
  app.get('/api/admin/audit', async (req, res) => {
    if (req.account.role !== 'superadmin')
      return res.status(403).json({ ok: false, message: 'Akses tidak diizinkan.' });
    const logs = await db
      .selectFrom('audit_log')
      .select(['id', 'actorEmail', 'actorRole', 'action', 'targetEmail', 'result', 'timestamp'])
      .orderBy('timestamp', 'desc')
      .limit(500)
      .execute();
    res.json({ ok: true, logs });
  });
  async function manageAccount(req, res, operation) {
    const value = operation === 'role' ? req.body?.role : req.body?.status;
    if (
      (operation === 'role' && !['siswa', 'admin'].includes(value)) ||
      (operation === 'status' && !['active', 'disabled'].includes(value)) ||
      (operation === 'approval' && req.body?.approvalStatus !== 'approved')
    )
      return res.status(400).json({ ok: false, message: 'Nilai perubahan akun tidak valid.' });
    const denied = (status, message) => ({ status, body: { ok: false, message } });
    try {
      const result = await db.transaction().execute(async (transaction) => {
        // Deterministic locking prevents concurrent role changes from bypassing authorization.
        let query = transaction
          .selectFrom('user')
          .select(PUBLIC_FIELDS)
          .where('id', 'in', [...new Set([req.account.id, req.params.id])])
          .orderBy('id');
        if (config.databaseProvider === 'postgres') query = query.forUpdate();
        const accounts = await query.execute();
        const actor = accounts.find((row) => row.id === req.account.id);
        const target = accounts.find((row) => row.id === req.params.id);
        if (
          !actor ||
          actor.status !== 'active' ||
          actor.approvalStatus !== 'approved' ||
          !['admin', 'superadmin'].includes(actor.role)
        )
          return denied(403, 'Akses tidak diizinkan.');
        if (!target) return denied(404, 'Akun tidak ditemukan.');
        if (actor.role === 'admin' && (target.role !== 'siswa' || operation === 'role'))
          return denied(403, 'Admin hanya dapat mengelola akun siswa.');
        if (target.id === actor.id)
          return denied(409, 'Tindakan pada akun pengelola sendiri tidak diizinkan.');
        if (target.role === 'superadmin')
          return denied(
            409,
            'Akun Superadmin dilindungi. Superadmin terakhir tidak boleh dihapus atau dinonaktifkan.',
          );
        if (operation === 'approval') {
          if (target.approvalStatus === 'approved') return denied(409, 'Akun ini sudah disetujui.');
          if (target.status !== 'active')
            return denied(409, 'Aktifkan kembali akun sebelum menyetujui pendaftaran.');
        }
        if (operation === 'role' && target.approvalStatus !== 'approved')
          return denied(409, 'Setujui pendaftaran akun sebelum mengubah perannya.');
        await transaction.deleteFrom('session').where('userId', '=', target.id).execute();
        if (operation === 'delete') {
          await transaction.deleteFrom('account').where('userId', '=', target.id).execute();
          await transaction.deleteFrom('verification').where('value', '=', target.id).execute();
          await transaction.deleteFrom('user').where('id', '=', target.id).execute();
        } else {
          await transaction
            .updateTable('user')
            .set({
              [operation === 'approval'
                ? 'approvalStatus'
                : operation === 'role'
                  ? 'role'
                  : 'status']: operation === 'approval' ? 'approved' : value,
              updatedAt: database.date(),
            })
            .where('id', '=', target.id)
            .execute();
        }
        await transaction
          .insertInto('audit_log')
          .values({
            id: randomUUID(),
            actorId: actor.id,
            actorEmail: actor.email,
            actorRole: actor.role,
            action:
              operation === 'delete'
                ? 'Hapus akun'
                : operation === 'role'
                  ? 'Ubah peran Admin'
                  : operation === 'approval'
                    ? 'Setujui pendaftaran akun'
                    : 'Ubah status akun',
            targetId: target.id,
            targetEmail: target.email,
            result: 'Berhasil',
            timestamp: new Date().toISOString(),
          })
          .execute();
        const updated =
          operation !== 'delete' &&
          (await transaction
            .selectFrom('user')
            .select(PUBLIC_FIELDS)
            .where('id', '=', target.id)
            .executeTakeFirst());
        return {
          status: 200,
          body: { ok: true, ...(updated ? { account: publicAccount(updated) } : {}) },
        };
      });
      return res.status(result.status).json(result.body);
    } catch {
      return res.status(409).json({
        ok: false,
        message: 'Perubahan belum tersimpan. Muat ulang daftar lalu coba lagi.',
      });
    }
  }
  app.delete('/api/admin/accounts/:id', (req, res) => manageAccount(req, res, 'delete'));
  app.patch('/api/admin/accounts/:id/status', (req, res) => manageAccount(req, res, 'status'));
  app.patch('/api/admin/accounts/:id/approval', (req, res) => manageAccount(req, res, 'approval'));
  app.patch('/api/admin/accounts/:id/role', (req, res) => manageAccount(req, res, 'role'));
  app.use('/api', (_req, res) =>
    res.status(404).json({ ok: false, message: 'Endpoint tidak ditemukan.' }),
  );
  if (config.serveFrontend) {
    if (!existsSync(resolve(config.frontendDir, 'index.html'))) {
      await database.close();
      throw new Error('Build frontend belum tersedia.');
    }
    app.use(express.static(config.frontendDir, { index: false, maxAge: '1h' }));
    app.get('/{*path}', (_req, res) => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(resolve(config.frontendDir, 'index.html'));
    });
  }
  app.use((error, _req, res, _next) => {
    const status =
      error.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500;
    if (status === 500) console.error('RUANGKISAH request failed.');
    res.status(status).json({
      ok: false,
      message:
        status === 500 ? 'Layanan sementara bermasalah. Coba lagi.' : 'Permintaan tidak valid.',
    });
  });
  return { app, auth, db, database, config, close: database.close };
}
