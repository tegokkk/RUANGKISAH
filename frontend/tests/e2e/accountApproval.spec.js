import { test, expect } from './fixtures.js';
import { readTestMail } from './mailHelpers.js';
import AxeBuilder from '@axe-core/playwright';

test.use({ authenticated: false });
for (const [width, managerEmail, managerRoute] of [
  [1440, 'owner@example.test', '/superadmin'],
  [390, 'admin@example.test', '/admin'],
]) {
  test(
    'persetujuan pendaftaran melalui ' + managerRoute + ' pada ' + width + 'px',
    async ({ page, browser }) => {
      const email = 'approval-' + width + '-' + Date.now() + '@example.test';
      const password = 'Approval-Only-Password-123!';
      await page.goto('/daftar');
      await page.getByLabel(/Nama tampilan/i).fill('Pendaftar Persetujuan');
      await page.getByLabel(/^Email/i).fill(email);
      await page.getByLabel(/^Kata sandi/i).fill(password);
      await page.getByLabel(/^Konfirmasi kata sandi/i).fill(password);
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Buat akun', exact: true }).click();
      await expect(page.getByText(/tunggu persetujuan Admin/i)).toBeVisible();
      const manager = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      });
      try {
        const signed = await manager.request.post('http://127.0.0.1:4001/api/auth/sign-in/email', {
          headers: { Origin: 'http://127.0.0.1:4001' },
          data: { email: managerEmail, password: 'E2E-Only-Password-123!' },
        });
        expect(signed.ok()).toBe(true);
        const panel = await manager.newPage();
        await panel.goto('http://127.0.0.1:4001' + managerRoute);
        await panel.getByRole('button', { name: /^Persetujuan Akun/ }).click();
        await panel.getByLabel('Cari permintaan akun').fill(email);
        const request = panel.getByRole('article', { name: 'Permintaan ' + email });
        await expect(
          request.getByRole('button', { name: 'Setujui akun', exact: true })
        ).toBeDisabled();
        await page.goto((await readTestMail(email, 'verification')).url);
        await page.getByLabel(/^Email/i).fill(email);
        await page.getByLabel(/^Kata sandi/i).fill(password);
        await page.getByRole('button', { name: 'Masuk', exact: true }).click();
        await expect(page.getByText(/Akunmu menunggu persetujuan Admin/)).toBeVisible();
        expect((await page.context().request.get('/api/me')).status()).toBe(401);
        await page.goto('/jurnal-perasaan');
        await expect(page).toHaveURL(/\/masuk$/);
        await panel.getByRole('button', { name: 'Muat ulang permintaan' }).click();
        await expect(
          request.getByRole('button', { name: 'Setujui akun', exact: true })
        ).toBeEnabled();
        await expect(request).toContainText('Menunggu persetujuan Admin');
        await panel.evaluate(() => document.fonts.ready);
        expect(
          (await new AxeBuilder({ page: panel }).withTags(['wcag2a', 'wcag2aa']).analyze())
            .violations
        ).toEqual([]);
        expect(await panel.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true
        );
        await panel.screenshot({
          path: '../docs/testing/screenshots/2026-11-19-approval-' + width + '.png',
          fullPage: true,
        });
        await request.getByRole('button', { name: 'Setujui akun', exact: true }).click();
        await panel.getByRole('dialog').getByRole('button', { name: 'Batal', exact: true }).click();
        await expect(
          request.getByRole('button', { name: 'Setujui akun', exact: true })
        ).toBeEnabled();
        await request.getByRole('button', { name: 'Setujui akun', exact: true }).click();
        await panel.getByRole('dialog').getByRole('button', { name: 'Ya, setujui akun' }).click();
        await expect(panel.getByText(/Pendaftaran Pendaftar Persetujuan disetujui/)).toBeVisible();
        await expect(request).toHaveCount(0);
        await page.goto('/masuk');
        await page.getByLabel(/^Email/i).fill(email);
        await page.getByLabel(/^Kata sandi/i).fill(password);
        await page.getByRole('button', { name: 'Masuk', exact: true }).click();
        await expect(page).toHaveURL(/\/jurnal-perasaan$/);
        await expect(page.getByLabel(/Apa yang terjadi/)).toBeVisible();
      } finally {
        await manager.close();
      }
    }
  );
}
