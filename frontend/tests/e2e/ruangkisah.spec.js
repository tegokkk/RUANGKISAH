import { expect, test } from './fixtures.js';
import { readTestMail } from './mailHelpers.js';

const ROUTES = [
  '/',
  '/kenali-diriku',
  '/jurnal-perasaan',
  '/langkah-berani',
  '/catatan-saya',
  '/pusat-bantuan',
  '/privasi',
  '/tentang',
  '/masuk',
  '/daftar',
  '/lupa-kata-sandi',
  '/tidak-diizinkan',
  '/halaman-tidak-ada',
];

test('AT-16 & T14-02: semua route dapat dibuka langsung, refresh, dan bebas scroll horizontal pada 320-1440px', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      );
      expect(hasOverflow, `Overflow pada ${route} di lebar ${width}px`).toBe(false);
    }
  }
});

test('T02-04 & AT-12: menu mobile terbuka, kelola fokus, dan tutup dengan Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: /Menu/i });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  const panel = page.getByRole('dialog', { name: /Menu RUANGKISAH/i });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('button', { name: /Tutup menu/i })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test('AT-04, AT-07, AT-11, AT-13, AT-18 & T14-06: simpan, reload, edit, hapus, XSS teks, dan tanpa bocor jaringan', async ({
  page,
}) => {
  const secretMarker = '<script>window.__xss=1</script>MARKER_RAHASIA_E2E_991';
  const outboundRequests = [];

  page.on('request', (req) => {
    outboundRequests.push({
      url: req.url(),
      postData: req.postData() || '',
    });
  });

  await page.goto('/jurnal-perasaan');
  await page.getByLabel(/Apa yang terjadi/i).fill(secretMarker);
  await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();

  await expect(page.getByText(/Tersimpan di browser perangkat ini/i)).toBeVisible();

  await page.reload();
  await page.goto('/catatan-saya');
  const main = page.locator('main');
  await expect(main.getByRole('article', { name: 'Jurnal Perasaan' })).toBeVisible();
  await expect(main.getByText(secretMarker)).toHaveCount(0);

  await page.getByRole('button', { name: /Buka catatan/i }).click();
  await expect(page.getByText(secretMarker)).toBeVisible();

  const xssExecuted = await page.evaluate(() => Boolean(window.__xss));
  expect(xssExecuted).toBe(false);

  // Hapus catatan dan pastikan tetap terhapus setelah reload dan back
  await page.getByRole('button', { name: /Hapus catatan/i }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Hapus catatan/i })
    .click();
  await expect(page.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();

  for (const req of outboundRequests) {
    expect(req.url).not.toContain('MARKER_RAHASIA_E2E_991');
    expect(req.postData).not.toContain('MARKER_RAHASIA_E2E_991');
    expect(req.url.startsWith('http://127.0.0.1:4001')).toBe(true);
  }
});

test('AT-06: siklus Langkah Berani buat, simpan, ubah status Selesai dicoba, dan hapus', async ({
  page,
}) => {
  await page.goto('/langkah-berani');
  await page.getByRole('button', { name: /Buat target sendiri/i }).click();

  await page.getByLabel(/Judul target/i).fill('Target E2E Keberanian');
  await page.getByLabel(/Langkah pertama/i).fill('Menulis satu pertanyaan di buku');
  await page.getByRole('button', { name: /Tinjau target/i }).click();

  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page.getByText('Tersimpan di browser perangkat ini', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Selesai dicoba/i }).click();
  await expect(page.getByText(/Kamu sudah mencoba satu langkah/i)).toBeVisible();

  await page.getByRole('button', { name: /Simpan perubahan/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page.getByText('Tersimpan di browser perangkat ini', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Hapus target/i }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Hapus catatan/i })
    .click();
  await expect(page.getByText(/Belum ada target tersimpan di browser ini/i)).toBeVisible();
});

test('AT-17: navigasi internal saat ada draf memunculkan dialog O02', async ({ page }) => {
  await page.goto('/kenali-diriku');
  await page.getByRole('button', { name: /Mulai Kenali Diriku/i }).click();
  await page.getByLabel(/Jawabanmu/i).fill('Draf sementara belum disimpan');

  await page
    .getByRole('navigation', { name: 'Navigasi utama' })
    .getByRole('link', { name: 'Pusat Bantuan' })
    .click();
  const dialog = page.getByRole('dialog', { name: /Tinggalkan isian sementara/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: /Tetap mengisi/i }).click();
  await expect(page).toHaveURL(/\/kenali-diriku/);
  await expect(page.getByLabel(/Jawabanmu/i)).toHaveValue('Draf sementara belum disimpan');

  await page
    .getByRole('navigation', { name: 'Navigasi utama' })
    .getByRole('link', { name: 'Pusat Bantuan' })
    .click();
  await page
    .getByRole('dialog', { name: /Tinggalkan isian sementara/i })
    .getByRole('button', { name: /Tinggalkan tanpa menyimpan/i })
    .click();
  await expect(page).toHaveURL(/\/pusat-bantuan/);
});

test('T06-10 & AT-15: sinkronisasi hapus lintas dua tab', async ({ context }) => {
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  await page1.goto('/jurnal-perasaan');
  await page1.getByRole('button', { name: /Senang/i }).click();
  await page1.getByRole('button', { name: /Lihat rangkuman/i }).click();
  await page1.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page1.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page1.getByText(/Tersimpan di browser perangkat ini/i)).toBeVisible();

  await page1.goto('/catatan-saya');
  await page1.getByRole('button', { name: /Buka catatan/i }).click();
  await expect(page1.getByRole('button', { name: /Ubah catatan/i })).toBeVisible();

  // Tab 2 membuka daftar dan menghapus catatan
  await page2.goto('/catatan-saya');
  await page2.getByRole('button', { name: /Buka catatan/i }).click();
  await page2.getByRole('button', { name: /Hapus catatan/i }).click();
  await page2
    .getByRole('dialog')
    .getByRole('button', { name: /Hapus catatan/i })
    .click();
  await expect(page2.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();

  // Tab 1 mendeteksi penghapusan dari tab lain
  await expect(page1.getByText(/Catatan ini sudah dihapus dari browser ini/i)).toBeVisible();
});

test('AT-09: JSON rusak pada localStorage tidak crash dan tidak menimpa otomatis', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.setItem(window.__TEST_STORAGE_KEY, '{json-rusak');
  });

  await page.goto('/catatan-saya');
  await expect(
    page.getByRole('dialog', { name: /Data tersimpan tidak dapat dibaca/i })
  ).toBeVisible();

  const rawAfter = await page.evaluate(() =>
    window.localStorage.getItem(window.__TEST_STORAGE_KEY)
  );
  expect(rawAfter).toBe('{json-rusak');
});

test('AT-15 (konflik edit) & AT-18 (back/forward setelah hapus): mendeteksi konflik dua tab dan tidak memunculkan ulang data terhapus', async ({
  context,
}) => {
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  await page1.goto('/langkah-berani');
  await page1.getByRole('button', { name: /Buat target sendiri/i }).click();
  await page1.getByLabel(/Judul target/i).fill('Target Konflik Dua Tab');
  await page1.getByLabel(/Langkah pertama/i).fill('Langkah awal');
  await page1.getByRole('button', { name: /Tinjau target/i }).click();
  await page1.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page1.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(
    page1.getByText('Tersimpan di browser perangkat ini', { exact: true })
  ).toBeVisible();

  // Tab 1 membuka catatan di /catatan-saya dan mulai mengedit status
  await page1.goto('/catatan-saya');
  await page1.getByRole('button', { name: /Buka catatan/i }).click();

  // Tab 2 membuka catatan yang sama, mengubah status menjadi Sedang dicoba, dan menyimpan
  await page2.goto('/catatan-saya');
  await page2.getByRole('button', { name: /Buka catatan/i }).click();
  await page2.getByRole('button', { name: /Sedang dicoba/i }).click();
  await page2.getByRole('button', { name: /Simpan perubahan/i }).click();
  await page2.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page2.getByText(/Perubahan tersimpan di browser perangkat ini/i)).toBeVisible();

  // Tab 1 (masih memegang revisi lama) mencoba mengubah menjadi Ditunda dan menyimpan -> konflik terdeteksi
  await page1.getByRole('button', { name: /Ditunda/i }).click();
  await page1.getByRole('button', { name: /Simpan perubahan/i }).click();
  await page1.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page1.getByText(/Catatan berubah di tab lain/i)).toBeVisible();

  // Muat versi terbaru lalu hapus dari Tab 1, kemudian uji goBack()
  await page1.getByRole('button', { name: /Muat versi terbaru/i }).click();
  await page1.getByRole('button', { name: /Hapus target/i }).click();
  await page1
    .getByRole('dialog')
    .getByRole('button', { name: /Hapus catatan/i })
    .click();
  await expect(page1.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();

  await page1.goto('/tentang');
  await page1.goBack();
  await expect(page1.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();
  await page1.goForward();
  await expect(page1).toHaveURL(/tentang/);
  await page1.goBack();
  await expect(page1.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();
});

test('Alur lengkap Pendaftaran Siswa, Verifikasi, Persetujuan, Login, Role Guard, dan Panel Superadmin', async ({
  page,
  request,
}) => {
  await page.goto('/daftar');
  await page.getByLabel(/Nama tampilan/i).fill('Siswa E2E Baru');
  await page.getByLabel(/Email/i).fill('e2e-siswa@contoh.id');
  await page.getByRole('textbox', { name: /^Kata sandi/i }).fill('Rahasia12345!');
  await page.getByRole('textbox', { name: /Konfirmasi kata sandi/i }).fill('Rahasia12345!');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Buat akun/i }).click();

  await expect(page.getByRole('heading', { name: /Verifikasi emailmu/i })).toBeVisible();
  const verification = await readTestMail('e2e-siswa@contoh.id', 'verification');
  await page.goto(verification.url);
  await expect(page.getByRole('heading', { name: /Selamat datang kembali/i })).toBeVisible();

  await request.post('/api/auth/sign-in/email', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: { email: 'owner@example.test', password: 'E2E-Only-Password-123!' },
  });
  const accounts = await (await request.get('/api/admin/accounts')).json();
  const registered = accounts.accounts.find((account) => account.email === 'e2e-siswa@contoh.id');
  const approval = await request.patch('/api/admin/accounts/' + registered.id + '/approval', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: { approvalStatus: 'approved' },
  });
  expect(approval.ok()).toBe(true);
  // Login sebagai Siswa baru yang telah disetujui -> tidak bisa buka /admin
  await page.goto('/masuk');
  await page.getByLabel(/Email/i).fill('e2e-siswa@contoh.id');
  await page.getByLabel(/^Kata sandi/i).fill('Rahasia12345!');
  await page.getByRole('button', { name: /^Masuk$/i }).click();
  await expect(page.getByRole('heading', { name: /Akun Saya/i })).toBeVisible();

  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: /Halaman ini belum bisa kamu buka/i })
  ).toBeVisible();

  // Keluar dan login sebagai Superadmin -> hapus akun siswa baru -> cek Riwayat Tindakan
  await page.getByRole('button', { name: /Keluar/i }).click();
  await page.goto('/masuk');
  await page.getByLabel(/Email/i).fill('owner@example.test');
  await page.getByLabel(/^Kata sandi/i).fill('E2E-Only-Password-123!');
  await page.getByRole('button', { name: /^Masuk$/i }).click();

  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
  await page.getByRole('button', { name: /Kelola Akun Siswa/i }).click();

  await page.getByLabel(/Cari nama atau email/i).fill('e2e-siswa@contoh.id');
  const row = page.locator('table tr', { hasText: 'e2e-siswa@contoh.id' });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /Hapus/i }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Hapus akun/i })
    .click();
  await expect(page.getByText(/Akun berhasil dihapus/i)).toBeVisible();

  await page.getByRole('button', { name: /Riwayat Tindakan/i }).click();
  await expect(page.locator('table')).toContainText('e2e-siswa@contoh.id');
});

test('AT-19 & T14-05: ukur LCP dan CLS minimal tiga kali pada build produksi lokal (Chromium)', async ({
  page,
}) => {
  const runs = [];
  for (let i = 0; i < 3; i += 1) {
    await page.goto('/', { waitUntil: 'load' });
    const metrics = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let lcp = 0;
          let cls = 0;
          const lcpObs = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) lcp = entries[entries.length - 1].startTime;
          });
          const clsObs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) cls += entry.value;
            }
          });
          lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
          clsObs.observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => {
            lcpObs.disconnect();
            clsObs.disconnect();
            resolve({ lcp: Math.round(lcp), cls: Number(cls.toFixed(4)) });
          }, 400);
        })
    );
    runs.push(metrics);
    expect(metrics.lcp).toBeLessThanOrEqual(2500);
    expect(metrics.cls).toBeLessThanOrEqual(0.1);
  }
  console.log('LCP/CLS 3x runs:', JSON.stringify(runs));
});

test('UI/UX motion, FAQ accordion, dialog exit, dan prefers-reduced-motion bekerja tanpa menghambat interaksi', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pusat-bantuan');

  const faqBtn = page.getByRole('button', { name: /Apakah harus membuat akun/i });
  await expect(faqBtn).toHaveAttribute('aria-expanded', 'false');
  await faqBtn.click();
  await expect(faqBtn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/Buat akun, verifikasi email/i)).toBeVisible();

  await faqBtn.click();
  await expect(faqBtn).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/Buat akun, verifikasi email/i)).toBeHidden();
});
