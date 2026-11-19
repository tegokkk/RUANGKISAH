import { expect, test } from './fixtures.js';

const gardenSelector = '.emb-root[data-background="true"]';

test('hero background: taman mengisi slide pertama, teks/CTA terbaca dan tidak mengunci navigasi', async ({
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

test('hero background: jeda, reduced motion, dan keluar viewport menghentikan gerak taman', async ({
  page,
}) => {
  await page.goto('/');
  const garden = page.locator(gardenSelector);
  const stem = garden.locator('.emb-stem').last();
  await expect(stem).toHaveAttribute('d', /M/);
  await page.getByRole('button', { name: 'Jeda animasi', exact: true }).click();
  await expect(garden).toHaveAttribute('data-paused', 'true');
  await expect(garden).toHaveAttribute('data-motion', 'still');
  const pausedStem = await stem.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await stem.getAttribute('d')).toBe(pausedStem);
  await page.getByRole('button', { name: 'Lanjutkan animasi' }).click();
  await expect.poll(() => stem.getAttribute('d')).not.toBe(pausedStem);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(garden).toHaveAttribute('data-motion', 'still');
  const stillStem = await stem.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await stem.getAttribute('d')).toBe(stillStem);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => stem.getAttribute('d')).not.toBe(stillStem);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(garden).toHaveAttribute('data-suspended', 'true');
  const offscreenStem = await stem.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await stem.getAttribute('d')).toBe(offscreenStem);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(garden).toHaveAttribute('data-suspended', 'false');
  await expect.poll(() => stem.getAttribute('d')).not.toBe(offscreenStem);
});

async function activeSparks(garden) {
  return garden
    .locator('.emb-spark')
    .evaluateAll(
      (nodes) => nodes.filter((node) => Number(node.getAttribute('opacity')) > 0).length
    );
}

test('hero interaction: klik meniup bunga, kontrol tidak memicu partikel, dan latar tetap tampil', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: /Kenali diri.*Tumbuh berani/i });
  const garden = page.locator(gardenSelector);
  await expect(garden).toHaveAttribute('data-motion', 'running');
  expect(await activeSparks(garden)).toBe(0);
  await page.getByRole('button', { name: 'Senja Hangat' }).click();
  expect(await activeSparks(garden)).toBe(0);

  const box = await hero.boundingBox();
  const point = { x: box.x + box.width * 0.84, y: box.y + box.height * 0.6 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.click(point.x, point.y);
  await expect.poll(() => activeSparks(garden)).toBeGreaterThan(0);
  await expect.poll(() => activeSparks(garden), { timeout: 6000 }).toBe(0);
  await expect(garden).toHaveAttribute('data-phase', 'hold');
  await expect(page.getByRole('heading', { name: /Kenali diri.*Tumbuh berani/i })).toBeVisible();

  await page.getByRole('button', { name: 'Jeda animasi', exact: true }).click();
  await expect(garden).toHaveAttribute('data-motion', 'still');
  await page.mouse.click(point.x, point.y);
  expect(await activeSparks(garden)).toBe(0);
  await page.getByRole('button', { name: 'Lanjutkan animasi' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(garden).toHaveAttribute('data-motion', 'still');
  await page.mouse.click(point.x, point.y);
  expect(await activeSparks(garden)).toBe(0);
  await page.getByRole('link', { name: 'Mulai refleksi', exact: true }).click();
  await expect(page).toHaveURL(/kenali-diriku/);
});

test('hero interaction: sentuhan ponsel memunculkan partikel di lokasi ketukan dan halaman tetap dapat digulir', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 900 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const hero = page.getByRole('region', { name: /Kenali diri.*Tumbuh berani/i });
    const garden = page.locator(gardenSelector);
    await expect(garden).toHaveAttribute('data-motion', 'running');
    const box = await hero.boundingBox();
    const point = { x: box.x + box.width * 0.78, y: box.y + box.height * 0.68 };
    await page.touchscreen.tap(point.x, point.y);
    await expect.poll(() => activeSparks(garden)).toBeGreaterThan(0);
    const spark = garden.locator('.emb-spark').first();
    const particleBox = await spark.boundingBox();
    expect(Math.abs(particleBox.x + particleBox.width / 2 - point.x)).toBeLessThan(70);
    expect(Math.abs(particleBox.y + particleBox.height / 2 - point.y)).toBeLessThan(70);
    await expect(garden).toHaveAttribute('data-phase', 'hold');
    await page
      .getByRole('heading', { name: /Mulai dari yang kamu butuhkan/i })
      .scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await expect(
      page.getByRole('heading', { name: /Mulai dari yang kamu butuhkan/i })
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
