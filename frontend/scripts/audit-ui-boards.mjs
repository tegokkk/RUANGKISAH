import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const directory = resolve('../docs/testing/' + (process.argv[2] || 'ui-review-after-2026-11-19'));
const data = JSON.parse(readFileSync(resolve(directory, 'measurements.json'), 'utf8'));
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const entries = data.pages.filter((entry) => entry.viewport === width);
  const cellWidth = width === 1440 ? 384 : 250;
  const cellHeight = width === 1440 ? 267 : 541;
  const cards = entries
    .map((entry) => {
      const image = readFileSync(resolve(directory, entry.name + '-' + width + '.png')).toString(
        'base64'
      );
      return (
        '<article><h2>' +
        entry.name +
        ' · ' +
        width +
        '</h2><img src="data:image/png;base64,' +
        image +
        '"></article>'
      );
    })
    .join('');
  const html =
    '<!doctype html><html><head><style>body{margin:0;padding:20px;background:#dce4de;font:14px Arial}main{display:grid;grid-template-columns:repeat(5,' +
    cellWidth +
    'px);gap:14px}article{background:white;overflow:hidden;border-radius:10px}h2{font:600 14px Arial;margin:0;padding:10px;background:#182420;color:white}img{display:block;width:' +
    cellWidth +
    'px;height:' +
    cellHeight +
    'px;object-fit:contain}</style></head><body><main>' +
    cards +
    '</main></body></html>';
  writeFileSync(resolve(directory, 'overview-' + width + '.html'), html);
  const page = await browser.newPage({
    viewport: { width: cellWidth * 5 + 96, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html);
  await page.locator('img').last().waitFor();
  await page.screenshot({ path: resolve(directory, 'overview-' + width + '.png'), fullPage: true });
  await page.close();
}
await browser.close();
