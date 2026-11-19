import { test, expect } from './fixtures.js';
test('UI-02: rangkuman jurnal dan kembali mengisi memfokuskan judul tanpa kehilangan draf', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/jurnal-perasaan');
  await page.getByLabel(/Apa yang terjadi/i).fill('Draf uji fokus');
  await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
  const heading = page.locator('main h1');
  await expect(heading).toBeFocused();
  const box = await heading.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  await page.getByRole('button', { name: /Ubah catatan/i }).click();
  await expect(page.locator('main h1')).toBeFocused();
  await expect(page.getByLabel(/Apa yang terjadi/i)).toHaveValue('Draf uji fokus');
});
test('UI-01/03/12: riwayat mobile terlihat, selected stabil saat hover dan akun menunggu email tidak diberi aktivasi palsu', async ({
  page,
  request,
}) => {
  const created = await request.post('/api/auth/sign-up/email', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: {
      name: 'Akun Audit UI',
      email: 'ui-fix-' + Date.now() + '@example.test',
      password: 'UI-Fix-Password-123!',
      termsAccepted: true,
    },
  });
  const target = (await created.json()).user;
  await page.context().request.post('/api/auth/sign-in/email', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: { email: 'owner@example.test', password: 'E2E-Only-Password-123!' },
  });
  const changed = await page
    .context()
    .request.patch('/api/admin/accounts/' + target.id + '/status', {
      headers: { Origin: 'http://127.0.0.1:4001' },
      data: { status: 'disabled' },
    });
  expect(changed.ok()).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/superadmin');
  await page.getByRole('button', { name: 'Riwayat Tindakan', exact: true }).click();
  const article = page.locator('main article').filter({ hasText: target.email });
  await expect(article).toBeVisible();
  await expect(article).toContainText('Ubah status akun');
  await expect(article).toContainText('Berhasil');
  const selected = page.getByRole('button', { name: 'Riwayat Tindakan', exact: true });
  await expect(selected).toHaveCSS('background-color', 'rgb(24, 36, 32)');
  const before = await selected.evaluate((node) => getComputedStyle(node).backgroundColor);
  await selected.hover();
  expect(await selected.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(before);
  // Return the unverified account to active status; verification still remains pending.
  await page.context().request.patch('/api/admin/accounts/' + target.id + '/status', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: { status: 'active' },
  });
  await page.reload();
  await page.getByRole('button', { name: 'Kelola Akun Siswa', exact: true }).click();
  await page.getByLabel(/Cari nama atau email/i).fill(target.email);
  await expect(
    page.getByRole('button', { name: 'Menunggu verifikasi email' }).filter({ visible: true })
  ).toBeDisabled();
});
