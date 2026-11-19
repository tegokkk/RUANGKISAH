import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const output = resolve('../docs/testing/' + (process.argv[2] || 'ui-review-after-2026-11-19'));
mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
let page;
const savedPath = resolve(output, 'measurements.json');
const saved = existsSync(savedPath) ? JSON.parse(readFileSync(savedPath, 'utf8')) : {};
const errors = saved.errors || [],
  results = saved.pages || [];
async function freshPage() {
  if (page) await page.close();
  page = await context.newPage();
  await page.route('**/api/me', (route) =>
    route.fulfill({
      json: {
        user: {
          id: 'ui-audit-student',
          name: 'Siswa Uji',
          displayName: 'Siswa Uji',
          email: 'student@example.test',
          role: 'siswa',
          status: 'active',
          emailVerified: true,
          approvalStatus: 'approved',
          createdAt: '2026-11-19T00:00:00.000Z',
        },
      },
    })
  );
  page.on('pageerror', (error) => errors.push({ url: page.url(), message: error.message }));
}
await freshPage();
const routes = [
  ['home', '/'],
  ['reflection', '/kenali-diriku'],
  ['journal', '/jurnal-perasaan'],
  ['goals', '/langkah-berani'],
  ['records-empty', '/catatan-saya'],
  ['help', '/pusat-bantuan'],
  ['privacy', '/privasi'],
  ['about', '/tentang'],
  ['login', '/masuk'],
  ['register', '/daftar'],
  ['forgot', '/lupa-kata-sandi'],
  ['reset-invalid', '/reset-kata-sandi'],
  ['unauthorized', '/tidak-diizinkan'],
  ['404', '/audit-page-not-found'],
];
function save() {
  writeFileSync(
    resolve(output, 'measurements.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        syntheticPrivateViews: true,
        errors,
        pages: results,
      },
      null,
      2
    )
  );
}
async function capture(name, width) {
  await page.locator('main h1').waitFor();
  await page
    .locator('header')
    .getByRole('button', { name: 'Keluar', exact: true, includeHidden: true })
    .waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  );
  const details = await page.evaluate(() => {
    const styleOf = (element) => {
      const style = getComputedStyle(element),
        box = element.getBoundingClientRect();
      return {
        text: (element.innerText || element.getAttribute('aria-label') || '').trim().slice(0, 95),
        tag: element.tagName,
        font: style.fontSize,
        weight: style.fontWeight,
        lineHeight: style.lineHeight,
        color: style.color,
        background: style.backgroundColor,
        padding: style.padding,
        radius: style.borderRadius,
        border: style.border,
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    };
    const visible = (el) =>
      el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
    const main = document.querySelector('main');
    return {
      headings: [...main.querySelectorAll('h1,h2,h3')].filter(visible).map(styleOf),
      controls: [...main.querySelectorAll('button,a,input,select,textarea')]
        .filter(visible)
        .map(styleOf),
      panels: [...main.querySelectorAll('section,article,aside')]
        .filter(visible)
        .slice(0, 12)
        .map(styleOf),
      headerHeight: Math.round(document.querySelector('header').getBoundingClientRect().height),
      mainWidth: Math.round(main.getBoundingClientRect().width),
      pageHeight: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  await page.screenshot({
    path: resolve(output, name + '-' + width + '-full.png'),
    fullPage: true,
  });
  await page.screenshot({ path: resolve(output, name + '-' + width + '.png') });
  const entry = { name, viewport: width, url: new URL(page.url()).pathname, ...details };
  const previous = results.findIndex((item) => item.name === name && item.viewport === width);
  if (previous < 0) results.push(entry);
  else results[previous] = entry;
  save();
}
async function visit(name, path, width) {
  await page.goto('http://localhost:5173' + path);
  await page.locator('main').waitFor();
  await capture(name, width);
}
try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const [name, route] of routes)
      if (!results.some((entry) => entry.name === name && entry.viewport === width))
        await visit(name, route, width);
    console.log('Captured public routes at ' + width);
  }
  let role = 'superadmin';
  const sampleUser = (role) => ({
    id: 'ui-audit-owner',
    name: 'Pengelola Uji',
    displayName: 'Pengelola Uji',
    email: 'owner@example.test',
    role,
    status: 'active',
    emailVerified: true,
    approvalStatus: 'approved',
    createdAt: '2026-11-19T00:00:00.000Z',
  });
  const accounts = [
    sampleUser('superadmin'),
    {
      ...sampleUser('admin'),
      id: 'ui-audit-admin',
      displayName: 'Admin Contoh',
      email: 'admin@example.test',
    },
    ...Array.from({ length: 6 }, (_, index) => ({
      id: 'ui-audit-' + index,
      displayName:
        index === 0
          ? 'Siswa dengan nama tampilan panjang untuk audit UI'
          : 'Siswa Contoh ' + (index + 1),
      email: 'siswa-audit-' + index + '@example.test',
      role: 'siswa',
      status: index === 1 ? 'disabled' : index === 2 ? 'pending_verification' : 'active',
      emailVerified: index !== 2,
      approvalStatus: index === 2 ? 'pending' : 'approved',
      createdAt: '2026-11-19T00:00:00.000Z',
    })),
  ];
  await page.route('**/api/me', (route) => route.fulfill({ json: { user: sampleUser(role) } }));
  await page.route('**/api/admin/accounts', (route) => route.fulfill({ json: { accounts } }));
  await page.route('**/api/admin/audit', (route) =>
    route.fulfill({
      json: {
        logs: [
          {
            id: 'audit-example',
            timestamp: '2026-11-19T00:00:00.000Z',
            actorEmail: 'owner@example.test',
            actorRole: 'superadmin',
            targetEmail: 'siswa-audit-1@example.test',
            action: 'Ubah status akun',
            result: 'Berhasil',
          },
        ],
      },
    })
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    role = 'siswa';
    await visit('account', '/akun', width);
    role = 'admin';
    await visit('admin-overview', '/admin', width);
    await page
      .locator('aside')
      .getByRole('button', { name: /Kelola Akun Siswa/i })
      .click();
    await capture('admin-students', width);
    role = 'superadmin';
    await visit('superadmin-overview', '/superadmin', width);
    await page
      .locator('aside')
      .getByRole('button', { name: /Kelola Admin/i })
      .click();
    await capture('superadmin-managers', width);
    await page
      .locator('aside')
      .getByRole('button', { name: /Riwayat Tindakan/i })
      .click();
    await capture('superadmin-audit', width);
    console.log('Captured synthetic account/admin UI at ' + width);
  }
  for (const width of [1440, 390]) {
    await freshPage();
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('http://localhost:5173/kenali-diriku');
    await page.locator('main').getByRole('button', { name: /Mulai/i }).click();
    await capture('reflection-question', width);
    await freshPage();
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('http://localhost:5173/jurnal-perasaan');
    await page
      .getByLabel(/Apa yang terjadi/i)
      .fill('Contoh fiktif untuk memeriksa tampilan rangkuman.');
    await page.getByRole('button', { name: /Lihat rangkuman/i }).click();
    await capture('journal-summary', width);
    await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
    await capture('save-dialog', width);
    await freshPage();
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('http://localhost:5173/langkah-berani');
    await page.getByRole('button', { name: /Buat target sendiri/i }).click();
    await capture('goal-form', width);
    await freshPage();
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('http://localhost:5173/');
    await page
      .locator('footer')
      .getByRole('button', { name: 'Lihat contoh fiktif', exact: true })
      .click();
    await capture('records-demo', width);
    await page.getByRole('button', { name: 'Buka catatan', exact: true }).first().click();
    await capture('record-detail-demo', width);
    console.log('Captured activity states at ' + width);
  }
  console.log('Complete: ' + results.length + ' views; page errors: ' + errors.length);
} finally {
  save();
  await browser.close();
}
