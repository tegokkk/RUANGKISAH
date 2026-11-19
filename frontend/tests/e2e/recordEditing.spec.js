import { expect, test } from './fixtures.js';

test('P1 filter catatan dan edit rincian target mempertahankan ID yang sama', async ({ page }) => {
  await page.goto('/langkah-berani');
  await page.getByRole('button', { name: /Buat target sendiri/i }).click();
  await page.getByLabel(/Judul target/i).fill('Target sebelum diedit');
  await page.getByLabel(/Langkah pertama/i).fill('Langkah awal');
  await page.getByRole('button', { name: /Tinjau target/i }).click();
  await page.getByRole('button', { name: /Simpan di perangkat ini/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page.getByText('Tersimpan di browser perangkat ini', { exact: true })).toBeVisible();
  const original = await page.evaluate(
    () => JSON.parse(localStorage.getItem(window.__TEST_STORAGE_KEY)).goals[0].id
  );
  await page.goto('/catatan-saya');
  await page.getByLabel('Jenis catatan').selectOption('journal');
  await expect(page.getByText(/Tidak ada catatan yang sesuai filter/i)).toBeVisible();
  await page.getByRole('button', { name: /Reset filter/i }).click();
  await expect(page.getByText('Target sebelum diedit')).toHaveCount(0);
  await page.getByRole('button', { name: /Buka catatan/i }).click();
  await page.getByRole('button', { name: /Ubah rincian target/i }).click();
  await page.getByLabel(/Judul target/i).fill('Target sesudah diedit');
  await page.getByRole('button', { name: /Simpan perubahan/i }).click();
  await page.getByRole('button', { name: /Ya, simpan di perangkat ini/i }).click();
  await expect(page.getByText(/Perubahan tersimpan di browser perangkat ini/i)).toBeVisible();
  const record = await page.evaluate(
    () => JSON.parse(localStorage.getItem(window.__TEST_STORAGE_KEY)).goals[0]
  );
  expect(record.id).toBe(original);
  expect(record.title).toBe('Target sesudah diedit');
});
