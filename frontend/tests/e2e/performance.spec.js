import { expect, test } from './fixtures.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

test('profil mobile lab: LCP/CLS tiga cold load, CPU 4x dan jaringan 9 Mbps', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      window.__vitals.lcp = list.getEntries().at(-1).startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 40,
    downloadThroughput: (9 * 1024 * 1024) / 8,
    uploadThroughput: (1.5 * 1024 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const runs = [];
  for (let i = 0; i < 3; i++) {
    await page.bringToFront();
    await page.goto('http://127.0.0.1:4001/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => window.__vitals.lcp > 0);
    await page.waitForTimeout(350);
    runs.push(
      await page.evaluate(() => ({
        lcp: Math.round(window.__vitals.lcp),
        cls: Number(window.__vitals.cls.toFixed(5)),
      }))
    );
  }
  await context.close();
  const medianLcp = [...runs].map((run) => run.lcp).sort((a, b) => a - b)[1];
  const medianCls = [...runs].map((run) => run.cls).sort((a, b) => a - b)[1];
  const report = {
    profile:
      'Chromium Windows, viewport 390x844, CPU 4x, download 9 Mbps, upload 1.5 Mbps, latency 40 ms, cache disabled; lab only',
    runs,
    medianLcp,
    medianCls,
  };
  mkdirSync(resolve('../docs/testing'), { recursive: true });
  writeFileSync(
    resolve('../docs/testing/2026-11-19-mobile-performance.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('Mobile lab metrics:', JSON.stringify(report));
  expect(runs.every((run) => run.lcp > 0)).toBe(true);
  expect(medianLcp).toBeLessThanOrEqual(2500);
  expect(medianCls).toBeLessThanOrEqual(0.1);
});
