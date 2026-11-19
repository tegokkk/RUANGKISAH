import { afterEach, describe, expect, it, vi } from 'vitest';
import { authStore } from '@/data/authStore';

afterEach(() => vi.unstubAllGlobals());
describe('server auth client boundaries', () => {
  it('mengirim registrasi dan consent melalui API tanpa menulis akun lokal', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ user: { id: 'new', role: 'siswa' } }) });
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.clear();
    await authStore.registerStudent({
      displayName: 'Siswa Baru',
      email: 'TEST@example.test',
      password: 'StrongPassword191!',
      agreed: true,
    });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/sign-up/email');
    expect(options.credentials).toBe('include');
    expect(JSON.parse(options.body)).toMatchObject({
      termsAccepted: true,
      email: 'test@example.test',
    });
    expect(JSON.parse(options.body).role).toBeUndefined();
    expect(window.localStorage.length).toBe(0);
  });
  it('gagal jaringan tidak dianggap login berhasil', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await authStore.login({
      email: 'a@example.test',
      password: 'StrongPassword191!',
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('NETWORK_ERROR');
  });
  it('tidak menerima sesi dari cache browser', async () => {
    window.localStorage.setItem('ruangkisah:session:v1', JSON.stringify({ role: 'superadmin' }));
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      })
    );
    expect(await authStore.getSessionUser()).toBeNull();
    window.localStorage.clear();
  });
  it('tidak mengekspos token reset dari permintaan netral', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: true }) })
    );
    const result = await authStore.requestPasswordReset('user@example.test');
    expect(result.demoToken).toBeUndefined();
    expect(result.token).toBeUndefined();
  });
});

it('membedakan verifikasi email dari persetujuan pengelola', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 'pending', emailVerified: true, status: 'active', approvalStatus: 'pending' },
      }),
    })
  );
  expect(await authStore.getSessionUser()).toBeNull();
  expect(
    (await authStore.login({ email: 'pending@example.test', password: 'Test-Password-123!' }))
      .errorCode
  ).toBe('ACCOUNT_PENDING_APPROVAL');
});
