/**
 * Menghasilkan ID acak lokal tanpa informasi pribadi.
 * @param {string} [prefix]
 * @returns {string}
 */
export function generateLocalId(prefix = 'rec') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}
