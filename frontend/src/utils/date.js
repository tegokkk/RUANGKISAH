const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Mengembalikan tanggal lokal perangkat dalam format YYYY-MM-DD.
 * @returns {string}
 */
export function getLocalTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Memeriksa apakah string adalah tanggal kalender YYYY-MM-DD yang valid.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/**
 * Memeriksa apakah tanggal YYYY-MM-DD berada di masa depan dibanding hari ini lokal.
 * @param {string} isoDate
 * @returns {boolean}
 */
export function isFutureLocalDate(isoDate) {
  if (!isValidISODate(isoDate)) return false;
  return isoDate > getLocalTodayISO();
}

/**
 * Memformat tanggal YYYY-MM-DD atau ISO timestamp menjadi teks tanggal Indonesia.
 * @param {string} dateInput
 * @returns {string}
 */
export function formatIndonesianDate(dateInput) {
  if (!dateInput || typeof dateInput !== 'string') return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput) && isValidISODate(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    return `${d} ${MONTHS_ID[m - 1]} ${y}`;
  }

  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getDate()} ${MONTHS_ID[parsed.getMonth()]} ${parsed.getFullYear()}`;
}
