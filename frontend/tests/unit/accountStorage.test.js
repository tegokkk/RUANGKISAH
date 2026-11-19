import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountStorageKey, createLocalStorageAdapter } from '@/data/localStorageAdapter';
import { migrateLegacyRecords } from '@/data/migrateLegacyRecords';
import { DEMO_FIXTURE_DOCUMENT } from '@/features/demo/fixtures';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
const legacy = () =>
  localStorage.setItem('ruangkisah:data:v1', JSON.stringify(DEMO_FIXTURE_DOCUMENT));
it('catatan akun terpisah; hapus akun A tidak menyentuh akun B', () => {
  const a = createLocalStorageAdapter(accountStorageKey('A'));
  const b = createLocalStorageAdapter(accountStorageKey('B'));
  a.writeRaw('catatan A');
  b.writeRaw('catatan B');
  expect(a.readRaw().value).toBe('catatan A');
  expect(b.readRaw().value).toBe('catatan B');
  a.removeKey();
  expect(b.readRaw().value).toBe('catatan B');
});
it('pemindahan eksplisit mempertahankan isi lalu menghapus sumber lama setelah tersimpan', async () => {
  legacy();
  const a = createLocalStorageAdapter(accountStorageKey('A'));
  const result = await migrateLegacyRecords(a);
  expect(result.ok).toBe(true);
  expect(JSON.parse(a.readRaw().value)).toEqual(DEMO_FIXTURE_DOCUMENT);
  expect(localStorage.getItem('ruangkisah:data:v1')).toBeNull();
});
it('pemindahan menolak menimpa catatan akun yang sudah berisi', async () => {
  legacy();
  const a = createLocalStorageAdapter(accountStorageKey('A'));
  a.writeRaw(JSON.stringify(DEMO_FIXTURE_DOCUMENT));
  const before = a.readRaw().value;
  const result = await migrateLegacyRecords(a);
  expect(result.ok).toBe(false);
  expect(a.readRaw().value).toBe(before);
  expect(localStorage.getItem('ruangkisah:data:v1')).not.toBeNull();
});
it('storage penuh saat pemindahan mempertahankan seluruh catatan lama', async () => {
  legacy();
  const a = createLocalStorageAdapter(accountStorageKey('A'));
  vi.spyOn(a, 'writeRaw').mockReturnValue({ ok: false, errorCode: 'STORAGE_FULL' });
  expect((await migrateLegacyRecords(a)).ok).toBe(false);
  expect(localStorage.getItem('ruangkisah:data:v1')).not.toBeNull();
  expect(a.readRaw().value).toBeNull();
});
