import { APP_CONFIG } from '@/config/appConfig';

const CHANNEL_NAME = 'ruangkisah:sync';
export function broadcastDataChange(detail = {}) {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'DATA_CHANGED', ...detail, timestamp: Date.now() });
      channel.close();
    } catch {
      // Abaikan jika BroadcastChannel diblokir
    }
  }
}

export function subscribeDataChanges(onChange) {
  const cleanups = [];

  if (typeof window !== 'undefined') {
    const handleStorage = (event) => {
      if (
        event.key === APP_CONFIG.storageKey ||
        event.key?.startsWith('ruangkisah:account:') ||
        event.key === null
      ) {
        onChange({ source: 'storage' });
      }
    };
    window.addEventListener('storage', handleStorage);
    cleanups.push(() => window.removeEventListener('storage', handleStorage));
  }

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const handleMessage = (event) => {
        if (event.data?.type === 'DATA_CHANGED') {
          onChange({ source: 'broadcast', detail: event.data });
        }
      };
      channel.addEventListener('message', handleMessage);
      cleanups.push(() => {
        channel.removeEventListener('message', handleMessage);
        channel.close();
      });
    } catch {
      // Abaikan jika BroadcastChannel tidak tersedia
    }
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}

function runFallbackWrite(task) {
  // Read/write transactions on an empty store serialize across tabs.
  // Reflection drafts and account credentials never enter IndexedDB.
  return new Promise((resolve) => {
    let settled = false;
    const fail = () => {
      if (!settled) {
        settled = true;
        resolve({
          ok: false,
          errorCode: 'SINGLE_TAB_WRITER_LOCKED',
          message:
            'Browser tidak dapat mengoordinasikan penyimpanan. Coba browser yang mendukung penyimpanan aman atau lanjut tanpa menyimpan.',
        });
      }
    };
    if (typeof indexedDB === 'undefined') {
      fail();
      return;
    }
    let request;
    try {
      request = indexedDB.open('ruangkisah:coordination', 1);
    } catch {
      fail();
      return;
    }
    request.onupgradeneeded = () => request.result.createObjectStore('writer', { keyPath: 'id' });
    request.onerror = fail;
    request.onblocked = fail;
    request.onsuccess = () => {
      const db = request.result;
      if (settled) {
        db.close();
        return;
      }
      let result;
      try {
        const transaction = db.transaction('writer', 'readwrite');
        const store = transaction.objectStore('writer');
        const write = store.get('writer');
        write.onsuccess = () => {
          try {
            result = task();
            if (result && typeof result.then === 'function')
              throw new Error('Coordinated storage mutation must be synchronous.');
          } catch {
            transaction.abort();
          }
        };
        transaction.oncomplete = () => {
          db.close();
          if (!settled) {
            settled = true;
            resolve(result);
          }
        };
        transaction.onerror = () => {
          db.close();
          fail();
        };
        transaction.onabort = () => {
          db.close();
          fail();
        };
      } catch {
        db.close();
        fail();
      }
    };
  });
}

/**
 * Mengoordinasikan operasi baca-ubah-tulis agar tidak terjadi overwrite diam-diam lintas tab.
 * Menggunakan navigator.locks bila tersedia; jika tidak, memakai transaksi koordinasi IndexedDB dan gagal tertutup jika keduanya tidak tersedia.
 */
export async function runCoordinatedWrite(adapter, task) {
  if (adapter.kind === 'memory') {
    return task();
  }

  if (
    typeof navigator !== 'undefined' &&
    navigator.locks &&
    typeof navigator.locks.request === 'function'
  ) {
    return navigator.locks.request('ruangkisah:data:write', async () => {
      return task();
    });
  }

  return runFallbackWrite(task);
}
