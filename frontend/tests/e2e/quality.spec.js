import { expect, test } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

async function saveJournal(page, text) {
  await page.goto('/jurnal-perasaan');
  await page.getByLabel(/Apa yang terjadi/i).fill(text);
  await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
}

test('fallback IndexedDB: dua tab tanpa Web Locks menulis aman dan gagal tertutup bila koordinasi diblokir', async ({
  context,
}) => {
  await context.addInitScript(() =>
    Object.defineProperty(navigator, 'locks', { value: undefined })
  );
  const a = await context.newPage(),
    b = await context.newPage();
  await a.goto('/jurnal-perasaan');
  await b.goto('/jurnal-perasaan');
  for (const [page, text] of [
    [a, 'FALLBACK_A'],
    [b, 'FALLBACK_B'],
  ]) {
    await page.getByLabel(/Apa yang terjadi/i).fill(text);
    await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
    await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  }
  await Promise.all(
    [a, b].map((page) => page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click())
  );
  await expect(a.getByText(/Tersimpan di browser perangkat ini/i)).toBeVisible();
  await expect(b.getByText(/Tersimpan di browser perangkat ini/i)).toBeVisible();
  const values = await a.evaluate(() =>
    JSON.parse(localStorage.getItem(window.__TEST_STORAGE_KEY))
      .journals.map((record) => record.situation)
      .sort()
  );
  expect(values).toEqual(['FALLBACK_A', 'FALLBACK_B']);
  const blocked = await context.newPage();
  await blocked.addInitScript(() =>
    Object.defineProperty(window, 'indexedDB', { get: () => undefined })
  );
  await saveJournal(blocked, 'MUST_NOT_SAVE');
  await expect(
    blocked.getByText(/Browser tidak dapat mengoordinasikan penyimpanan/i)
  ).toBeVisible();
  expect(
    await blocked.evaluate(() => localStorage.getItem(window.__TEST_STORAGE_KEY))
  ).not.toContain('MUST_NOT_SAVE');
});

test('storage penuh mempertahankan draf dan mengonfirmasi sebelum pindah ke catatan', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === window.__TEST_STORAGE_KEY) throw new DOMException('Quota', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await saveJournal(page, 'DRAF_MASIH_ADA');
  await expect(
    page.getByText(/Belum tersimpan. Penyimpanan browser tidak tersedia atau penuh/i)
  ).toBeVisible();
  await expect(page.getByText('DRAF_MASIH_ADA')).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navigasi utama' })
    .getByRole('link', { name: 'Pusat Bantuan' })
    .click();
  await expect(page.getByRole('dialog', { name: /Tinggalkan isian sementara/i })).toBeVisible();
  await page.getByRole('button', { name: /Tetap mengisi/i }).click();
  await expect(page.getByText('DRAF_MASIH_ADA')).toBeVisible();
});

test('halaman lupa kata sandi memberi panduan bantuan tanpa pengiriman SMTP', async ({ page }) => {
  await page.goto('/lupa-kata-sandi');
  await expect(page.getByRole('heading', { name: /Pemulihan kata sandi/i })).toBeVisible();
  await expect(
    page.getByText(/Pengiriman email reset otomatis sedang tidak digunakan/i)
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Buka Pusat Bantuan/i })).toBeVisible();
});

test('batas koleksi: menuju Catatan Saya tidak membuang draf tanpa konfirmasi', async ({
  page,
}) => {
  await saveJournal(page, 'SEED_KOLEKSI');
  await expect(page.getByText(/Tersimpan di browser perangkat ini/i)).toBeVisible();
  await page.evaluate(() => {
    const doc = JSON.parse(localStorage.getItem(window.__TEST_STORAGE_KEY));
    doc.journals = Array.from({ length: 50 }, (_, index) => ({
      ...doc.journals[0],
      id: 'limit-fixture-' + index,
    }));
    localStorage.setItem(window.__TEST_STORAGE_KEY, JSON.stringify(doc));
  });
  await saveJournal(page, 'DRAF_BATAS_KOLEKSI');
  await expect(page.getByRole('link', { name: 'Buka Catatan Saya' })).toBeVisible();
  await page.getByRole('link', { name: 'Buka Catatan Saya' }).click();
  await expect(page.getByRole('dialog', { name: /Tinggalkan isian sementara/i })).toBeVisible();
  await page.getByRole('button', { name: /Tetap mengisi/i }).click();
  await expect(page.getByText('DRAF_BATAS_KOLEKSI')).toBeVisible();
});

test('aksesibilitas panel pengelola, profil, dan dialog penghapusan', async ({ page, request }) => {
  test.setTimeout(90000);
  const email = 'a11y-' + Date.now() + '@example.test';
  await request.post('/api/auth/sign-up/email', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: {
      name: 'Siswa Aksesibilitas',
      email,
      password: 'A11y-Only-Password-123!',
      termsAccepted: true,
    },
  });
  await page.goto('/masuk');
  await page.getByLabel(/Email/i).fill('owner@example.test');
  await page.getByLabel(/^Kata sandi/i).fill('E2E-Only-Password-123!');
  await page.getByRole('button', { name: /^Masuk$/ }).click();
  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
  for (const route of ['/superadmin', '/admin', '/akun']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {}))
      )
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((item) => ({
        id: item.id,
        targets: item.nodes.map((node) => node.target),
      })),
      route
    ).toEqual([]);
  }
  await page.goto('/superadmin');
  await page.getByRole('button', { name: /Kelola Akun Siswa/i }).click();
  await page.getByLabel(/Cari nama atau email/i).fill(email);
  await page
    .locator('table tr', { hasText: email })
    .getByRole('button', { name: /^Hapus$/ })
    .click();
  await expect(page.getByRole('dialog', { name: /Hapus akun/i })).toBeVisible();
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {}))
    )
  );
  const dialogScan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(
    dialogScan.violations.map((item) => ({
      id: item.id,
      targets: item.nodes.map((node) => node.target),
    }))
  ).toEqual([]);
  await page.keyboard.press('Escape');
});

test('aksesibilitas otomatis, keyboard dan reduced motion pada layar publik', async ({ page }) => {
  test.setTimeout(120000);
  const violations = [];
  for (const route of [
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
    '/reset-kata-sandi',
    '/tidak-diizinkan',
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    // Audit the settled UI, rather than a frame midway through the entrance fade.
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {}))
      )
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    if (result.violations.length)
      violations.push({
        route,
        violations: result.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      });
  }
  expect(violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Menu RUANGKISAH/i });
  await expect(dialog.getByRole('button', { name: /Tutup menu/i })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  const motion = await page
    .locator('main')
    .evaluate((node) => node.getAnimations().filter((a) => a.playState === 'running').length);
  expect(motion).toBe(0);
  await page.screenshot({
    path: '../docs/testing/screenshots/2026-11-19-home-mobile.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: '../docs/testing/screenshots/2026-11-19-home-desktop.png',
    fullPage: true,
  });
});
