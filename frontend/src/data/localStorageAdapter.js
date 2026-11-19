import { APP_CONFIG } from '@/config/appConfig';

export function createLocalStorageAdapter(storageKey = APP_CONFIG.storageKey) {
  return {
    storageKey,
    kind: 'local',

    readRaw() {
      try {
        const value = window.localStorage.getItem(storageKey);
        return { ok: true, value };
      } catch {
        return {
          ok: false,
          errorCode: 'STORAGE_UNAVAILABLE',
          message: 'Penyimpanan browser tidak tersedia.',
        };
      }
    },

    writeRaw(serialized) {
      try {
        window.localStorage.setItem(storageKey, serialized);
        return { ok: true };
      } catch (err) {
        const isQuota =
          err &&
          (err.name === 'QuotaExceededError' ||
            err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            err.code === 22);
        return {
          ok: false,
          errorCode: isQuota ? 'STORAGE_FULL' : 'STORAGE_UNAVAILABLE',
          message: 'Belum tersimpan. Penyimpanan browser tidak tersedia atau penuh.',
        };
      }
    },

    removeKey() {
      try {
        window.localStorage.removeItem(storageKey);
        return { ok: true };
      } catch {
        return {
          ok: false,
          errorCode: 'DELETE_FAILED',
          message: 'Data belum berhasil dihapus. Coba lagi.',
        };
      }
    },
  };
}
export const localStorageAdapter = createLocalStorageAdapter();
export function accountStorageKey(userId) {
  if (!userId) throw new Error('Akun diperlukan untuk penyimpanan catatan.');
  return 'ruangkisah:account:' + encodeURIComponent(userId) + ':data:v1';
}
