import { localStorageAdapter } from '@/data/localStorageAdapter';
import { createRecordsRepository } from '@/data/recordsRepository';
import { runCoordinatedWrite, broadcastDataChange } from '@/data/writeCoordinator';
const hasRecords = (document) =>
  document.reflections.length + document.journals.length + document.goals.length > 0;
export async function migrateLegacyRecords(targetAdapter) {
  if (!targetAdapter.storageKey?.startsWith('ruangkisah:account:'))
    return { ok: false, message: 'Masuk diperlukan untuk memindahkan catatan.' };
  return runCoordinatedWrite(targetAdapter, () => {
    const source = createRecordsRepository(localStorageAdapter).readDocument();
    const target = createRecordsRepository(targetAdapter).readDocument();
    if (!source.ok) return source;
    if (!target.ok) return target;
    if (!hasRecords(source.document))
      return { ok: false, message: 'Tidak ada catatan lama untuk dipindahkan.' };
    if (hasRecords(target.document))
      return {
        ok: false,
        message:
          'Akun ini sudah memiliki catatan lokal. Catatan lama tidak ditimpa atau digabung otomatis.',
      };
    const written = targetAdapter.writeRaw(JSON.stringify(source.document));
    if (!written.ok) return written;
    const removed = localStorageAdapter.removeKey();
    broadcastDataChange({ source: 'legacy-migration' });
    return {
      ok: true,
      sourceRetained: !removed.ok,
      message: removed.ok
        ? 'Catatan lama telah dipindahkan ke akun ini pada perangkat ini.'
        : 'Salinan tersimpan pada akun ini, tetapi catatan lama belum dapat dihapus. Data tetap ada; coba bersihkan salinan lama nanti.',
    };
  });
}
