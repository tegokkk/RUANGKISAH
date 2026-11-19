import { expect, test } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

async function expectCursorOn(nav, label, role = 'link') {
  await expect
    .poll(async () => {
      const link = await nav.getByRole(role, { name: label, exact: true }).boundingBox();
      const cursor = await nav.locator('[data-slide-cursor]').boundingBox();
      return link && cursor
        ? Math.max(
            Math.abs(link.x - cursor.x),
            Math.abs(link.y - cursor.y),
            Math.abs(link.width - cursor.width),
            Math.abs(link.height - cursor.height)
          )
        : 999;
    })
    .toBeLessThan(1.5);
}

test('slide tabs: hover/fokus, reset ke halaman aktif, navigasi keyboard, refresh dan resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
  await expectCursorOn(nav, 'Beranda');
  await nav.getByRole('link', { name: 'Jurnal Perasaan', exact: true }).hover();
  await expectCursorOn(nav, 'Jurnal Perasaan');
  await page.mouse.move(0, 0);
  await expectCursorOn(nav, 'Beranda');
  await nav.getByRole('link', { name: 'Beranda', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'Kenali Diriku', exact: true })).toBeFocused();
  await expectCursorOn(nav, 'Kenali Diriku');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/kenali-diriku/);
  await expect(nav.getByRole('link', { name: 'Kenali Diriku', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await page.reload();
  await expectCursorOn(nav, 'Kenali Diriku');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible();
  await expect(nav).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectCursorOn(nav, 'Kenali Diriku');
  await page.goto('/tentang');
  await expect(nav.locator('[aria-current=page]')).toHaveCount(0);
  await expect(nav.locator('[data-slide-cursor]')).toHaveCSS('opacity', '0');
});

test('slide tabs: reduced motion, aksesibilitas header dan perlindungan draf saat navigasi', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/jurnal-perasaan');
  const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
  await expectCursorOn(nav, 'Jurnal Perasaan');
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page })
    .include('header')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations.map((item) => item.id)).toEqual([]);
  await page.getByLabel(/Apa yang terjadi/i).fill('Draf uji navigasi');
  await nav.getByRole('link', { name: 'Kenali Diriku', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/jurnal-perasaan/);
  await expect(nav.getByRole('link', { name: 'Jurnal Perasaan', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await page.keyboard.press('Escape');
  await expect(page.getByLabel(/Apa yang terjadi/i)).toHaveValue('Draf uji navigasi');
});

test('slide tabs: header siswa/Admin/Superadmin tetap muat tanpa overlap', async ({ page }) => {
  for (const role of ['siswa', 'admin', 'superadmin']) {
    await page.route('**/api/me', (route) =>
      route.fulfill({
        json: {
          user: {
            id: 'nav-layout',
            name: 'Pengguna Uji',
            displayName: 'Pengguna Uji',
            emailVerified: true,
            approvalStatus: 'approved',
            status: 'active',
            role,
          },
        },
      })
    );
    for (const width of [1200, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.getByRole('button', { name: 'Keluar', exact: true })).toBeVisible();
      const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
      const navBox = await nav.boundingBox();
      const recordsBox = await page
        .getByRole('link', { name: 'Catatan Saya', exact: true })
        .boundingBox();
      const logoutBox = await page
        .getByRole('button', { name: 'Keluar', exact: true })
        .boundingBox();
      expect(recordsBox.x - navBox.x - navBox.width, role).toBeGreaterThanOrEqual(8);
      expect(logoutBox.x + logoutBox.width, role).toBeLessThanOrEqual(width - 16);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
      ).toBe(true);
    }
    await page.unroute('**/api/me');
  }
});

test('footer slide tabs: hover/fokus bergeser, link aktif dan tombol demo tetap bekerja', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/privasi');
  const nav = page.getByRole('navigation', { name: 'Navigasi footer', exact: true });
  await nav.scrollIntoViewIfNeeded();
  await expectCursorOn(nav, 'Privasi & Data');
  await nav.getByRole('link', { name: 'Tentang & Cara Pakai', exact: true }).hover();
  await expectCursorOn(nav, 'Tentang & Cara Pakai');
  await page.mouse.move(0, 0);
  await expectCursorOn(nav, 'Privasi & Data');
  await nav.getByRole('link', { name: 'Privasi & Data', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'Tentang & Cara Pakai', exact: true })).toBeFocused();
  await expectCursorOn(nav, 'Tentang & Cara Pakai');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button', { name: 'Lihat contoh fiktif', exact: true })).toBeFocused();
  await expectCursorOn(nav, 'Lihat contoh fiktif', 'button');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/catatan-saya/);
  await expect(page.getByText(/Contoh fiktif - bukan data siswa/i)).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Lihat contoh fiktif', exact: true })).toHaveCount(
    0
  );
});

test('footer slide tabs: responsif dua baris, indikator menyesuaikan posisi/tinggi dan aksesibel', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tentang');
    const nav = page.getByRole('navigation', { name: 'Navigasi footer', exact: true });
    await nav.scrollIntoViewIfNeeded();
    await expectCursorOn(nav, 'Tentang & Cara Pakai');
    await nav.getByRole('button', { name: 'Lihat contoh fiktif', exact: true }).focus();
    await expectCursorOn(nav, 'Lihat contoh fiktif', 'button');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true
    );
    await nav.getByRole('link', { name: 'Pusat Bantuan', exact: true }).click();
    await expect(page).toHaveURL(/pusat-bantuan/);
    await nav.scrollIntoViewIfNeeded();
    await expectCursorOn(nav, 'Pusat Bantuan');
  }
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page })
    .include('footer')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations.map((item) => item.id)).toEqual([]);
});
