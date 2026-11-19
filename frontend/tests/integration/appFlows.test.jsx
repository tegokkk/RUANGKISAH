import { authStore } from '@/data/authStore';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/AppProviders';
import { appRoutes } from '@/app/router';

function renderAt(initialPath = '/') {
  const memoryRouter = createMemoryRouter(appRoutes, {
    initialEntries: [initialPath],
  });
  return render(
    <AppProviders>
      <RouterProvider router={memoryRouter} />
    </AppProviders>
  );
}

describe('RUANGKISAH.ID integration flows', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    vi.spyOn(authStore, 'getSessionUser').mockResolvedValue({
      id: 'integration-student',
      name: 'Siswa Uji',
      displayName: 'Siswa Uji',
      email: 'test@example.test',
      role: 'siswa',
      status: 'active',
      emailVerified: true,
      approvalStatus: 'approved',
    });
    window.localStorage.clear();
  });

  it('menjalankan Kenali Diriku tanpa simpan dan membersihkan draf', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await screen.findByRole('button', { name: 'Keluar', exact: true });

    await user.click(screen.getByRole('link', { name: /Mulai refleksi/i }));
    expect(
      await screen.findByRole('heading', { name: /Pelan-pelan, kenali dirimu/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mulai Kenali Diriku/i }));
    const textarea = screen.getByLabelText(/Jawabanmu/i);
    await user.type(textarea, '<script>alert("xss")</script> Aku menyelesaikan tugas kelompok.');

    await user.click(screen.getByRole('button', { name: /Berikutnya/i }));
    for (let i = 0; i < 5; i += 1) {
      await user.click(screen.getByRole('button', { name: /Lewati/i }));
    }

    expect(
      screen.getByRole('heading', { name: /Yang kamu temukan tentang dirimu/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/<script>alert\("xss"\)<\/script>/)).toBeInTheDocument();
    expect(screen.getAllByText('Belum diisi').length).toBe(5);

    await user.click(screen.getByRole('button', { name: /Akhiri tanpa menyimpan/i }));
    expect(
      screen.getByRole('heading', { name: /Isian sementara telah dibersihkan dari aplikasi/i })
    ).toBeInTheDocument();
    expect(
      window.localStorage.getItem('ruangkisah:account:integration-student:data:v1')
    ).toBeNull();
  }, 15000);

  it('menyimpan Jurnal Perasaan setelah konfirmasi dan menyembunyikan isi di daftar Catatan Saya', async () => {
    const user = userEvent.setup();
    renderAt('/jurnal-perasaan');
    await screen.findByRole('button', { name: 'Keluar', exact: true });

    await user.click(await screen.findByRole('button', { name: /Tenang/i }));
    await user.type(screen.getByLabelText(/Apa yang terjadi/i), 'RAHASIA_PRIBADI_SISWA');
    await user.click(screen.getByRole('button', { name: /Lihat rangkuman/i }));

    await user.click(screen.getByRole('button', { name: /Simpan di perangkat ini/i }));
    const dialog = screen.getByRole('dialog', { name: /Simpan di browser perangkat ini/i });
    await user.click(within(dialog).getByRole('button', { name: /Ya, simpan di perangkat ini/i }));

    expect(screen.getByText(/Tersimpan di browser perangkat ini/i)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Buka Catatan Saya/i }));

    const main = screen.getByRole('main');
    expect(
      await within(main).findByRole('article', { name: 'Jurnal Perasaan' })
    ).toBeInTheDocument();
    expect(within(main).queryByText(/RAHASIA_PRIBADI_SISWA/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Buka catatan/i }));
    expect(screen.getByText(/RAHASIA_PRIBADI_SISWA/)).toBeInTheDocument();
  });

  it('mengisolasi Mode Demonstrasi dari penyimpanan lokal pribadi', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('other_site_key', 'safe');
    renderAt('/');
    await screen.findByRole('button', { name: 'Keluar', exact: true });

    await user.click(screen.getByRole('button', { name: /Lihat contoh fiktif/i }));
    expect(screen.getByText(/Contoh fiktif - bukan data siswa/i)).toBeInTheDocument();
    expect((await screen.findAllByRole('button', { name: /Buka catatan/i })).length).toBe(3);

    await user.click(screen.getByRole('button', { name: /Keluar contoh/i }));
    expect(screen.queryByText(/Contoh fiktif - bukan data siswa/i)).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem('ruangkisah:account:integration-student:data:v1')
    ).toBeNull();
    expect(window.localStorage.getItem('other_site_key')).toBe('safe');
  });
});
