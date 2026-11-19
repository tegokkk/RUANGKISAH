import { expect, test } from './fixtures.js';

test('lintas engine: jurnal simpan, buka, dan hapus pada browser yang sama', async ({ page }) => {
  await page.goto('/jurnal-perasaan');
  await page.getByLabel(/Apa yang terjadi/i).fill('Catatan lintas engine');
  await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page.getByText(/Tersimpan di browser perangkat ini/i)).toBeVisible();
  await page.goto('/catatan-saya');
  await page.getByRole('button', { name: /Buka catatan/i }).click();
  await expect(page.getByText('Catatan lintas engine')).toBeVisible();
  await page.getByRole('button', { name: /Hapus catatan/i }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Hapus catatan/i })
    .click();
  await expect(page.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();
});

test('lintas engine: sesi server pulih setelah reload dan layout akun/panel tidak meluber', async ({
  page,
}) => {
  await page.goto('/masuk');
  await page.getByLabel(/Email/i).fill('owner@example.test');
  await page.getByLabel(/^Kata sandi/i).fill('E2E-Only-Password-123!');
  await page.getByRole('button', { name: /^Masuk$/ }).click();
  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  );
  await page.goto('/akun');
  await expect(page.getByRole('heading', { name: /Akun Saya/i })).toBeVisible();
});
