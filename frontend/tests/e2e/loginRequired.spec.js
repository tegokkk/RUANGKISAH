import { test, expect, signInTestContext } from './fixtures.js';
test.use({ authenticated: false });
async function login(page, email = 'student@example.test') {
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/^Kata sandi/i).fill('E2E-Only-Password-123!');
  await page.getByRole('button', { name: /^Masuk$/ }).click();
}
test('login wajib: URL fitur dilindungi, informasi publik tetap tersedia, tujuan login dipertahankan', async ({
  page,
}) => {
  for (const route of ['/kenali-diriku', '/jurnal-perasaan', '/langkah-berani', '/catatan-saya']) {
    await page.goto(route);
    await expect(page).toHaveURL(/masuk/);
    await expect(page.locator('main textarea')).toHaveCount(0);
  }
  for (const route of ['/', '/pusat-bantuan', '/privasi', '/tentang']) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(route === '/' ? '/$' : route));
  }
  await page.goto('/jurnal-perasaan');
  await expect(page).toHaveURL(/masuk/);
  await login(page);
  await expect(page).toHaveURL(/jurnal-perasaan/);
  await expect(page.getByLabel(/Apa yang terjadi/i)).toBeVisible();
});
test('contoh fiktif dari footer mewajibkan login dan dilanjutkan sebagai demo setelah masuk', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('footer').getByRole('button', { name: 'Lihat contoh fiktif' }).click();
  await expect(page).toHaveURL(/masuk/);
  await login(page);
  await expect(page).toHaveURL(/catatan-saya/);
  await expect(page.getByRole('region', { name: 'Status mode contoh fiktif' })).toBeVisible();
});
test('ganti akun: catatan A tidak muncul di B; logout mengunci akses dan login A memulihkan catatan A', async ({
  page,
}) => {
  await page.goto('/jurnal-perasaan');
  await login(page);
  await page.getByLabel(/Apa yang terjadi/i).fill('Catatan khusus akun A');
  await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await page.locator('header').getByRole('button', { name: 'Keluar', exact: true }).click();
  await page.goto('/catatan-saya');
  await expect(page).toHaveURL(/masuk/);
  await login(page, 'admin@example.test');
  await expect(page).toHaveURL(/catatan-saya/);
  await expect(page.getByText(/Belum ada catatan tersimpan di browser ini/i)).toBeVisible();
  await page.locator('header').getByRole('button', { name: 'Keluar', exact: true }).click();
  await page.goto('/catatan-saya');
  await login(page);
  await page.getByRole('button', { name: 'Buka catatan', exact: true }).click();
  await expect(page.getByText('Catatan khusus akun A')).toBeVisible();
});

test('sesi awal yang terlambat tidak menghapus input atau menimpa akun yang baru masuk', async ({
  page,
  context,
}) => {
  await signInTestContext(context);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let delayed = false;
  await page.route('**/api/me', async (route) => {
    if (delayed) return route.continue();
    delayed = true;
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page.goto('/masuk');
  await page.getByLabel(/Email/i).fill('owner@example.test');
  await page.getByLabel(/^Kata sandi/i).fill('E2E-Only-Password-123!');
  await page.getByRole('button', { name: /^Masuk$/ }).click();
  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
  const settled = page.waitForResponse((response) => response.url().endsWith('/api/me'));
  release();
  await settled;
  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
  await page.goto('/superadmin');
  await expect(page.getByRole('heading', { name: /Ringkasan Superadmin/i })).toBeVisible();
});

test('pemindahan catatan lama harus dikonfirmasi dan mempertahankan isi catatan', async ({
  page,
  context,
}) => {
  await signInTestContext(context);
  await page.goto('/jurnal-perasaan');
  await page.getByLabel(/Apa yang terjadi/i).fill('Catatan lama milikku');
  await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page.getByText('Tersimpan di browser perangkat ini', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem('ruangkisah:data:v1', localStorage.getItem(window.__TEST_STORAGE_KEY));
    localStorage.removeItem(window.__TEST_STORAGE_KEY);
  });
  await page.goto('/privasi');
  await page.getByRole('button', { name: 'Pindahkan catatan lama', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Batal', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem(window.__TEST_STORAGE_KEY))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('ruangkisah:data:v1'))).not.toBeNull();
  await page.getByRole('button', { name: 'Pindahkan catatan lama', exact: true }).click();
  await page.getByRole('button', { name: 'Ya, pindahkan catatan milikku' }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ruangkisah:data:v1')))
    .toBeNull();
  await page.goto('/catatan-saya');
  await page.getByRole('button', { name: 'Buka catatan', exact: true }).click();
  await expect(page.getByText('Catatan lama milikku')).toBeVisible();
});
