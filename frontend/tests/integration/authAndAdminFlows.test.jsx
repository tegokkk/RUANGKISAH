import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/AppProviders';
import { appRoutes } from '@/app/router';
import { authStore } from '@/data/authStore';

function renderAt(initialPath = '/') {
  return render(
    <AppProviders>
      <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: [initialPath] })} />
    </AppProviders>
  );
}
describe('async account UI', () => {
  beforeEach(() => {
    let session = null;
    const students = [
      {
        id: 's1',
        displayName: 'Siswa Satu',
        email: 'siswa1@contoh.id',
        role: 'siswa',
        status: 'active',
        emailVerified: true,
        approvalStatus: 'approved',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's2',
        displayName: 'Siswa Dua',
        email: 'siswa2@contoh.id',
        role: 'siswa',
        status: 'active',
        emailVerified: true,
        approvalStatus: 'approved',
        createdAt: new Date().toISOString(),
      },
    ];
    vi.spyOn(authStore, 'getSessionUser').mockImplementation(async () => session);
    vi.spyOn(authStore, 'login').mockImplementation(async ({ email }) => {
      session = email.startsWith('superadmin')
        ? {
            id: 'owner',
            displayName: 'Pengelola',
            email,
            role: 'superadmin',
            status: 'active',
            emailVerified: true,
            approvalStatus: 'approved',
          }
        : students[0];
      return { ok: true, user: session };
    });
    vi.spyOn(authStore, 'listAccounts').mockImplementation(async () => ({
      ok: true,
      accounts: [...students],
    }));
    vi.spyOn(authStore, 'listAuditLogs').mockResolvedValue({ ok: true, logs: [] });
    vi.spyOn(authStore, 'deleteAccount').mockImplementation(async (_actor, id) => {
      students.splice(
        students.findIndex((item) => item.id === id),
        1
      );
      return { ok: true };
    });
  });
  afterEach(() => vi.restoreAllMocks());
  it('siswa masuk menuju Akun Saya', async () => {
    const user = userEvent.setup();
    renderAt('/masuk');
    await user.type(await screen.findByLabelText(/Email/i), 'siswa1@contoh.id');
    await user.type(screen.getByLabelText(/^Kata sandi/i), 'StrongPassword191!');
    await user.click(screen.getByRole('button', { name: /^Masuk$/i }));
    expect(await screen.findByRole('heading', { name: /Akun Saya/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Ringkasan Admin/i })).not.toBeInTheDocument();
  });
  it('pengelola menghapus akun melalui konfirmasi dan menunggu hasil API', async () => {
    const user = userEvent.setup();
    renderAt('/masuk');
    await user.type(await screen.findByLabelText(/Email/i), 'superadmin@example.test');
    await user.type(screen.getByLabelText(/^Kata sandi/i), 'StrongPassword191!');
    await user.click(screen.getByRole('button', { name: /^Masuk$/i }));
    expect(
      await screen.findByRole('heading', { name: /Ringkasan Superadmin/i })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Kelola Akun Siswa/i }));
    const table = screen.getByRole('table');
    const email = await within(table).findByText('siswa2@contoh.id');
    await user.click(within(email.closest('tr')).getByRole('button', { name: /Hapus/i }));
    const dialog = screen.getByRole('dialog', { name: /Hapus akun/i });
    expect(within(dialog).getByText(/tidak otomatis menghapus catatan lokal/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /Hapus akun/i }));
    expect(await screen.findByText(/Akun berhasil dihapus/i)).toBeInTheDocument();
    expect(within(table).queryByText('siswa2@contoh.id')).not.toBeInTheDocument();
  });
});
