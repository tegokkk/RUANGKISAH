import { expect, test } from './fixtures.js';

const gardenSelector = '.emb-root[data-background="true"]';

test('hero background: taman statis mengisi slide pertama, teks/CTA terbaca dan tidak mengunci navigasi', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const hero = page.getByRole('region', { name: /Kenali diri.*Tumbuh berani/i });
    const garden = page.locator(gardenSelector);
    await expect(garden).toHaveAttribute('data-phase', 'hold');
    await expect(garden).toHaveAttribute('data-paused', 'true');
    await expect(garden).toHaveAttribute('data-motion', 'still');
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    const heroBox = await hero.boundingBox();
    const gardenBox = await garden.boundingBox();
    expect(Math.abs(heroBox.width - gardenBox.width)).toBeLessThan(1);
    expect(Math.abs(heroBox.height - gardenBox.height)).toBeLessThan(1);
    expect(await garden.locator('[tabindex="0"]').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true
    );
    await page.getByRole('button', { name: 'Senja Hangat' }).click();
    await expect(page.getByRole('button', { name: 'Senja Hangat' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.getByRole('link', { name: 'Mulai refleksi', exact: true }).click();
    await expect(page).toHaveURL(/kenali-diriku/);
  }
  expect(errors).toEqual([]);
});

test('hero background: bunga tetap diam (statis) tanpa animasi gerak atau partikel saat diklik/disentuh', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: /Kenali diri.*Tumbuh berani/i });
  const garden = page.locator(gardenSelector);
  const stem = garden.locator('.emb-stem').last();
  await expect(stem).toHaveAttribute('d', /M/);
  await expect(garden).toHaveAttribute('data-paused', 'true');
  await expect(garden).toHaveAttribute('data-motion', 'still');

  const initialStem = await stem.getAttribute('d');
  const box = await hero.boundingBox();
  const point = { x: box.x + box.width * 0.84, y: box.y + box.height * 0.6 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(180);

  expect(await stem.getAttribute('d')).toBe(initialStem);
  const sparks = await garden
    .locator('.emb-spark')
    .evaluateAll(
      (nodes) => nodes.filter((node) => Number(node.getAttribute('opacity')) > 0).length
    );
  expect(sparks).toBe(0);
});
