import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { createApplication } from '../src/app.js';

import { startTestPostgres } from './helpers/postgres.js';
let service, server, base, postgres, approvalOwner;
const dir = mkdtempSync(resolve(tmpdir(), 'ruangkisah-test-'));
const origin = 'http://127.0.0.1:4173';
const password = 'Test-Only-Strong-Password-391!';
before(async () => {
  if (process.env.TEST_DATABASE_PROVIDER === 'postgres') postgres = await startTestPostgres();
  service = await createApplication({
    databaseProvider: postgres ? 'postgres' : 'sqlite',
    databaseUrl: postgres?.url,
    databaseSsl: false,
    autoMigrate: true,
    dataDir: dir,
    test: true,
    publicUrl: origin,
    mailMode: 'file',
  });
  server = service.app.listen(0, '127.0.0.1');
  await new Promise((done) => server.once('listening', done));
  base = 'http://127.0.0.1:' + server.address().port;
  const owner = await register('approval-owner@example.test');
  await service.db
    .updateTable('user')
    .set({
      role: 'superadmin',
      approvalStatus: 'approved',
      emailVerified: service.database.boolean(true),
    })
    .where('id', '=', owner.data.user.id)
    .execute();
  approvalOwner = (await login('approval-owner@example.test')).cookie;
});
after(async () => {
  await new Promise((done) => server.close(done));
  await service.close();
  await postgres?.close();
  if (dirname(resolve(dir)) === resolve(tmpdir()) && basename(dir).startsWith('ruangkisah-test-'))
    rmSync(dir, { recursive: true });
});
async function call(path, { method = 'GET', body, cookie, requestOrigin = origin } = {}) {
  const response = await fetch(base + path, {
    method,
    redirect: 'manual',
    headers: {
      Origin: requestOrigin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const data =
    text && response.headers.get('content-type')?.includes('application/json')
      ? JSON.parse(text)
      : null;
  return {
    response,
    data,
    cookie: response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; '),
  };
}
function lastMail(email, kind) {
  return readdirSync(resolve(dir, 'mail'))
    .map((name) => JSON.parse(readFileSync(resolve(dir, 'mail', name), 'utf8')))
    .filter((mail) => mail.to === email && mail.kind === kind)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .at(-1);
}
async function register(email, extra = {}) {
  return call('/api/auth/sign-up/email', {
    method: 'POST',
    body: {
      name: 'Siswa Pengujian',
      email,
      password,
      termsAccepted: true,
      callbackURL: origin + '/masuk?verified=1',
      ...extra,
    },
  });
}
async function verify(email) {
  const link = new URL(lastMail(email, 'verification').url);
  return call(link.pathname + link.search);
}
async function login(email, pass = password) {
  return call('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email, password: pass },
  });
}

test('registrasi publik selalu siswa, tidak membocorkan hash, menolak consent palsu dan login sebelum verifikasi', async () => {
  const denied = await register('consent@example.test', {
    termsAccepted: false,
  });
  assert.equal(denied.response.status, 400);
  const result = await register('student@example.test', {
    role: 'superadmin',
    status: 'active',
    approvalStatus: 'approved',
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.data.user.role, 'siswa');
  assert.equal(result.data.user.approvalStatus, 'pending');
  assert.equal(result.data.user.password, undefined);
  const stored = await service.db
    .selectFrom('account')
    .select('password')
    .where('userId', '=', result.data.user.id)
    .executeTakeFirst();
  assert.ok(stored.password.length > 50);
  assert.notEqual(stored.password, password);
  assert.equal((await login('student@example.test')).response.status, 403);
  assert.equal((await verify('student@example.test')).response.status, 302);
  const waiting = await login('student@example.test');
  assert.equal(waiting.response.status, 403);
  assert.equal(waiting.data.code, 'ACCOUNT_PENDING_APPROVAL');
  assert.equal(
    (
      await call('/api/admin/accounts/' + result.data.user.id + '/approval', {
        method: 'PATCH',
        cookie: approvalOwner,
        body: { approvalStatus: 'approved' },
      })
    ).response.status,
    200,
  );
});

test('sesi cookie HttpOnly, logout, origin asing dan penolakan akses pengelola di server', async () => {
  const signed = await login('student@example.test');
  assert.equal(signed.response.status, 200);
  assert.ok(signed.response.headers.getSetCookie().some((cookie) => cookie.includes('HttpOnly')));
  assert.equal((await call('/api/me', { cookie: signed.cookie })).data.user.role, 'siswa');
  assert.equal((await call('/api/admin/accounts', { cookie: signed.cookie })).response.status, 403);
  assert.equal((await call('/api/admin/accounts')).response.status, 401);
  assert.equal(
    (
      await call('/api/auth/sign-in/email', {
        method: 'POST',
        body: { email: 'student@example.test', password },
        requestOrigin: 'https://evil.example',
      })
    ).response.status,
    403,
  );
  await call('/api/auth/sign-out', {
    method: 'POST',
    cookie: signed.cookie,
    body: {},
  });
  assert.equal((await call('/api/me', { cookie: signed.cookie })).response.status, 401);
});

test('superadmin menetapkan admin; admin dibatasi siswa; nonaktif/hapus mencabut sesi; Superadmin dilindungi', async () => {
  const owner = await register('owner@example.test');
  await verify('owner@example.test');
  await service.db
    .updateTable('user')
    .set({ role: 'superadmin', approvalStatus: 'approved' })
    .where('id', '=', owner.data.user.id)
    .execute();
  const superSession = await login('owner@example.test');
  const manager = await register('manager@example.test');
  await verify('manager@example.test');
  await call('/api/admin/accounts/' + manager.data.user.id + '/approval', {
    method: 'PATCH',
    cookie: superSession.cookie,
    body: { approvalStatus: 'approved' },
  });
  const promoted = await call('/api/admin/accounts/' + manager.data.user.id + '/role', {
    method: 'PATCH',
    cookie: superSession.cookie,
    body: { role: 'admin' },
  });
  assert.equal(promoted.data.account.role, 'admin');
  const adminSession = await login('manager@example.test');
  const list = await call('/api/admin/accounts', {
    cookie: adminSession.cookie,
  });
  assert.ok(list.data.accounts.every((user) => user.role === 'siswa'));
  assert.equal(
    (await call('/api/admin/audit', { cookie: adminSession.cookie })).response.status,
    403,
  );
  assert.equal(
    (
      await call('/api/admin/accounts/' + owner.data.user.id, {
        method: 'DELETE',
        cookie: adminSession.cookie,
      })
    ).response.status,
    403,
  );
  assert.equal(
    (
      await call('/api/admin/accounts/' + owner.data.user.id, {
        method: 'DELETE',
        cookie: superSession.cookie,
      })
    ).response.status,
    409,
  );
  const student = await service.db
    .selectFrom('user')
    .select('id')
    .where('email', '=', 'student@example.test')
    .executeTakeFirst();
  const oldSession = await login('student@example.test');
  const disabled = await call('/api/admin/accounts/' + student.id + '/status', {
    method: 'PATCH',
    cookie: adminSession.cookie,
    body: { status: 'disabled' },
  });
  assert.equal(disabled.data.account.status, 'disabled');
  assert.equal((await call('/api/me', { cookie: oldSession.cookie })).response.status, 401);
  assert.equal((await login('student@example.test')).response.status, 403);
  await call('/api/admin/accounts/' + student.id + '/status', {
    method: 'PATCH',
    cookie: adminSession.cookie,
    body: { status: 'active' },
  });
  const beforeDelete = await login('student@example.test');
  assert.equal(
    (
      await call('/api/admin/accounts/' + student.id, {
        method: 'DELETE',
        cookie: adminSession.cookie,
      })
    ).response.status,
    200,
  );
  assert.equal((await call('/api/me', { cookie: beforeDelete.cookie })).response.status, 401);
  assert.equal(
    await service.db
      .selectFrom('account')
      .select('id')
      .where('userId', '=', student.id)
      .executeTakeFirst(),
    undefined,
  );
  const logs = await call('/api/admin/audit', { cookie: superSession.cookie });
  assert.ok(logs.data.logs.length >= 4);
  assert.ok(logs.data.logs.every((log) => !('password' in log) && !('journal' in log)));
});

test('reset netral, token sekali pakai, kata sandi baru bekerja dan sesi lama dicabut', async () => {
  const resetAccount = await register('reset@example.test');
  await verify('reset@example.test');
  await call('/api/admin/accounts/' + resetAccount.data.user.id + '/approval', {
    method: 'PATCH',
    cookie: approvalOwner,
    body: { approvalStatus: 'approved' },
  });
  const session = await login('reset@example.test');
  const known = await call('/api/auth/request-password-reset', {
    method: 'POST',
    body: {
      email: 'reset@example.test',
      redirectTo: origin + '/reset-kata-sandi',
    },
  });
  const unknown = await call('/api/auth/request-password-reset', {
    method: 'POST',
    body: {
      email: 'unknown@example.test',
      redirectTo: origin + '/reset-kata-sandi',
    },
  });
  assert.deepEqual(known.data, unknown.data);
  assert.equal(known.data.token, undefined);
  const mail = lastMail('reset@example.test', 'reset');
  const link = new URL(mail.url);
  const redirect = await call(link.pathname + link.search);
  const token = new URL(redirect.response.headers.get('location')).searchParams.get('token');
  const replacement = 'Replacement-Strong-Password-490!';
  const changed = await call('/api/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword: replacement },
  });
  assert.equal(changed.response.status, 200);
  assert.equal((await call('/api/me', { cookie: session.cookie })).response.status, 401);
  assert.equal((await login('reset@example.test')).response.status, 401);
  assert.equal((await login('reset@example.test', replacement)).response.status, 200);
  assert.equal(
    (
      await call('/api/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword: password },
      })
    ).response.status,
    400,
  );
});

test('persetujuan wajib di server: email saja, aktivasi, perubahan profil/role dan reset tidak melewati persetujuan; approve hanya oleh pengelola dan tercatat sekali', async () => {
  const registered = await register('pending@example.test', { approvalStatus: 'approved' });
  const id = registered.data.user.id;
  const approve = (cookie = approvalOwner) =>
    call('/api/admin/accounts/' + id + '/approval', {
      method: 'PATCH',
      cookie,
      body: { approvalStatus: 'approved' },
    });
  assert.equal((await approve()).response.status, 409); // cannot verify email for the student
  assert.equal(
    (
      await call('/api/admin/accounts/' + id + '/approval', {
        method: 'PATCH',
        body: { approvalStatus: 'approved' },
      })
    ).response.status,
    401,
  );
  await verify('pending@example.test');
  assert.equal((await login('pending@example.test', 'Wrong-Password-123!')).response.status, 401);
  assert.equal((await login('pending@example.test')).data.code, 'ACCOUNT_PENDING_APPROVAL');
  const ownerList = await call('/api/admin/accounts', { cookie: approvalOwner });
  assert.equal(
    ownerList.data.accounts.find((account) => account.id === id).status,
    'pending_approval',
  );
  await call('/api/admin/accounts/' + id + '/status', {
    method: 'PATCH',
    cookie: approvalOwner,
    body: { status: 'active' },
  });
  assert.equal((await login('pending@example.test')).response.status, 403);
  assert.equal(
    (
      await call('/api/admin/accounts/' + id + '/role', {
        method: 'PATCH',
        cookie: approvalOwner,
        body: { role: 'admin' },
      })
    ).response.status,
    409,
  );
  await call('/api/auth/request-password-reset', {
    method: 'POST',
    body: { email: 'pending@example.test', redirectTo: origin + '/reset-kata-sandi' },
  });
  const resetLink = new URL(lastMail('pending@example.test', 'reset').url);
  const redirected = await call(resetLink.pathname + resetLink.search);
  const token = new URL(redirected.response.headers.get('location')).searchParams.get('token');
  const newPassword = 'Pending-Replacement-Password-123!';
  assert.equal(
    (await call('/api/auth/reset-password', { method: 'POST', body: { token, newPassword } }))
      .response.status,
    200,
  );
  assert.equal(
    (await login('pending@example.test', newPassword)).data.code,
    'ACCOUNT_PENDING_APPROVAL',
  );
  const student = await register('approval-student@example.test');
  await verify('approval-student@example.test');
  await call('/api/admin/accounts/' + student.data.user.id + '/approval', {
    method: 'PATCH',
    cookie: approvalOwner,
    body: { approvalStatus: 'approved' },
  });
  const studentSession = await login('approval-student@example.test');
  assert.equal((await approve(studentSession.cookie)).response.status, 403);
  await call('/api/auth/update-user', {
    method: 'POST',
    cookie: studentSession.cookie,
    body: { approvalStatus: 'approved', role: 'superadmin' },
  });
  assert.equal((await call('/api/me', { cookie: studentSession.cookie })).data.user.role, 'siswa');
  const manager = await register('approval-admin@example.test');
  await verify('approval-admin@example.test');
  await call('/api/admin/accounts/' + manager.data.user.id + '/approval', {
    method: 'PATCH',
    cookie: approvalOwner,
    body: { approvalStatus: 'approved' },
  });
  await call('/api/admin/accounts/' + manager.data.user.id + '/role', {
    method: 'PATCH',
    cookie: approvalOwner,
    body: { role: 'admin' },
  });
  const adminSession = await login('approval-admin@example.test');
  const attempts = await Promise.all([approve(adminSession.cookie), approve(adminSession.cookie)]);
  assert.deepEqual(attempts.map((attempt) => attempt.response.status).sort(), [200, 409]);
  assert.equal((await login('pending@example.test', newPassword)).response.status, 200);
  const logs = await call('/api/admin/audit', { cookie: approvalOwner });
  assert.equal(
    logs.data.logs.filter(
      (log) =>
        log.targetEmail === 'pending@example.test' && log.action === 'Setujui pendaftaran akun',
    ).length,
    1,
  );
});
