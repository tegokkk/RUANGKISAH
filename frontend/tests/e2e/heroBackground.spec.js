import { expect, test } from './fixtures.js';

test('hero beranda: tampilan bersih tanpa dekorasi bunga, teks/CTA terbaca dan tidak mengunci navigasi', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const hero = page.getByRole('region', { name: /Kenali diri.*Tumbuh berani/i });
    await expect(hero).toBeVisible();
    await expect(page.locator('.emb-root')).toHaveCount(0);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true
    );
    await page.getByRole('link', { name: 'Mulai refleksi', exact: true }).click();
    await expect(page).toHaveURL(/kenali-diriku/);
  }
  expect(errors).toEqual([]);
});
