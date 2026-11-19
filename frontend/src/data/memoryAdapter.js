import { createEmptyDocument } from '@/data/schema';

/**
 * Membuat adapter memori terpisah (khusus mode demonstrasi atau pengujian terisolasi).
 * Tidak pernah membaca atau menulis ke localStorage.
 */
export function createMemoryAdapter(initialDocument = null) {
  let raw = initialDocument
    ? JSON.stringify(initialDocument)
    : JSON.stringify(createEmptyDocument());

  return {
    kind: 'memory',

    readRaw() {
      return { ok: true, value: raw };
    },

    writeRaw(serialized) {
      raw = serialized;
      return { ok: true };
    },

    removeKey() {
      raw = null;
      return { ok: true };
    },
  };
}
