import { APP_CONFIG } from '@/config/appConfig';
import { FEELING_IDS, GOAL_STATUSES } from '@/data/schema';
import { isFutureLocalDate, isValidISODate } from '@/utils/date';

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isString(val) {
  return typeof val === 'string';
}

function isValidBaseRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  return (
    isNonEmptyString(record.id) &&
    isNonEmptyString(record.createdAt) &&
    isNonEmptyString(record.updatedAt) &&
    Number.isInteger(record.revision) &&
    record.revision >= 1 &&
    isString(record.contentVersion) &&
    isNonEmptyString(record.storageAcknowledgedAt) &&
    isString(record.privacyNoticeVersion)
  );
}

export function validateReflectionPayload(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.answers)) {
    return { ok: false, message: 'Format jawaban Kenali Diriku tidak valid.' };
  }
  let hasNonEmpty = false;
  for (const item of payload.answers) {
    if (
      !item ||
      typeof item !== 'object' ||
      !isNonEmptyString(item.questionId) ||
      !isString(item.answer)
    ) {
      return { ok: false, message: 'Format item jawaban tidak valid.' };
    }
    if (item.answer.length > APP_CONFIG.limits.reflectionAnswerMax) {
      return {
        ok: false,
        message: `Setiap jawaban maksimal ${APP_CONFIG.limits.reflectionAnswerMax.toLocaleString('id-ID')} karakter.`,
      };
    }
    if (item.answer.trim().length > 0) {
      hasNonEmpty = true;
    }
  }
  if (!hasNonEmpty) {
    return {
      ok: false,
      message: 'Isi setidaknya satu jawaban untuk melihat rangkuman, atau akhiri tanpa menyimpan.',
    };
  }
  return { ok: true };
}

export function validateJournalPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Format Jurnal Perasaan tidak valid.' };
  }
  if (!isValidISODate(payload.entryDate)) {
    return { ok: false, message: 'Tanggal jurnal tidak valid.' };
  }
  if (isFutureLocalDate(payload.entryDate)) {
    return { ok: false, message: 'Tanggal jurnal tidak boleh di masa depan.' };
  }
  if (!Array.isArray(payload.feelings)) {
    return { ok: false, message: 'Pilihan perasaan tidak valid.' };
  }
  for (const f of payload.feelings) {
    if (!FEELING_IDS.includes(f)) {
      return { ok: false, message: 'Pilihan perasaan tidak dikenali.' };
    }
  }
  const fields = ['situation', 'response', 'needs', 'smallAction'];
  let totalLength = 0;
  let hasText = false;
  for (const field of fields) {
    const val = payload[field] ?? '';
    if (!isString(val)) {
      return { ok: false, message: 'Format teks jurnal tidak valid.' };
    }
    totalLength += val.length;
    if (val.trim().length > 0) {
      hasText = true;
    }
  }
  if (totalLength > APP_CONFIG.limits.journalTotalTextMax) {
    return {
      ok: false,
      message: `Total teks jurnal maksimal ${APP_CONFIG.limits.journalTotalTextMax.toLocaleString('id-ID')} karakter.`,
    };
  }
  if (payload.feelings.length === 0 && !hasText) {
    return {
      ok: false,
      message:
        'Pilih minimal satu perasaan atau isi salah satu kolom cerita sebelum melihat rangkuman.',
    };
  }
  return { ok: true };
}

export function validateGoalPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Format target Langkah Berani tidak valid.' };
  }
  const title = payload.title ?? '';
  const firstStep = payload.firstStep ?? '';
  const reason = payload.reason ?? '';
  const support = payload.support ?? '';
  const targetDate = payload.targetDate ?? '';
  const afterReflection = payload.afterReflection ?? '';
  const status = payload.status ?? 'planned';

  if (!isString(title) || title.trim().length === 0) {
    return { ok: false, message: 'Judul target wajib diisi.' };
  }
  if (title.length > APP_CONFIG.limits.goalTitleMax) {
    return {
      ok: false,
      message: `Judul target maksimal ${APP_CONFIG.limits.goalTitleMax} karakter.`,
    };
  }
  if (!isString(firstStep) || firstStep.trim().length === 0) {
    return { ok: false, message: 'Langkah pertama wajib diisi.' };
  }
  if (firstStep.length > APP_CONFIG.limits.goalFirstStepMax) {
    return {
      ok: false,
      message: `Langkah pertama maksimal ${APP_CONFIG.limits.goalFirstStepMax} karakter.`,
    };
  }
  if (!isString(reason) || reason.length > APP_CONFIG.limits.goalReasonMax) {
    return {
      ok: false,
      message: `Alasan maksimal ${APP_CONFIG.limits.goalReasonMax} karakter.`,
    };
  }
  if (!isString(support) || support.length > APP_CONFIG.limits.goalSupportMax) {
    return {
      ok: false,
      message: `Dukungan maksimal ${APP_CONFIG.limits.goalSupportMax} karakter.`,
    };
  }
  if (targetDate && !isValidISODate(targetDate)) {
    return { ok: false, message: 'Tanggal target tidak valid.' };
  }
  if (!GOAL_STATUSES.includes(status)) {
    return { ok: false, message: 'Status langkah tidak valid.' };
  }
  if (
    !isString(afterReflection) ||
    afterReflection.length > APP_CONFIG.limits.goalAfterReflectionMax
  ) {
    return {
      ok: false,
      message: `Refleksi setelah mencoba maksimal ${APP_CONFIG.limits.goalAfterReflectionMax.toLocaleString('id-ID')} karakter.`,
    };
  }
  return { ok: true };
}

export function getUtf8ByteSize(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return new Blob([str]).size;
}

/**
 * Memvalidasi seluruh LocalDocument saat dibaca maupun sebelum ditulis.
 * @param {unknown} doc
 * @returns {{ ok: true, document: object } | { ok: false, errorCode: string, message: string }}
 */
export function validateLocalDocument(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return {
      ok: false,
      errorCode: 'CORRUPT_DATA',
      message: 'Data tersimpan tidak dapat dibaca.',
    };
  }

  if (doc.schemaVersion !== APP_CONFIG.schemaVersion) {
    return {
      ok: false,
      errorCode: 'UNSUPPORTED_VERSION',
      message: 'Versi data tersimpan tidak didukung oleh aplikasi ini.',
    };
  }

  if (!Number.isInteger(doc.documentRevision) || doc.documentRevision < 0) {
    return {
      ok: false,
      errorCode: 'CORRUPT_DATA',
      message: 'Struktur revisi data tidak valid.',
    };
  }

  if (
    !Array.isArray(doc.reflections) ||
    !Array.isArray(doc.journals) ||
    !Array.isArray(doc.goals)
  ) {
    return {
      ok: false,
      errorCode: 'CORRUPT_DATA',
      message: 'Daftar catatan di penyimpanan lokal tidak lengkap.',
    };
  }

  if (
    doc.reflections.length > APP_CONFIG.maxItemsPerType ||
    doc.journals.length > APP_CONFIG.maxItemsPerType ||
    doc.goals.length > APP_CONFIG.maxItemsPerType
  ) {
    return {
      ok: false,
      errorCode: 'LIMIT_EXCEEDED',
      message:
        'Penyimpanan aplikasi mencapai batas. Hapus catatan yang tidak diperlukan sebelum menyimpan lagi.',
    };
  }

  for (const r of doc.reflections) {
    if (!isValidBaseRecord(r) || !validateReflectionPayload(r).ok) {
      return { ok: false, errorCode: 'CORRUPT_DATA', message: 'Data Kenali Diriku tidak valid.' };
    }
  }

  for (const j of doc.journals) {
    if (!isValidBaseRecord(j) || !validateJournalPayload(j).ok) {
      return { ok: false, errorCode: 'CORRUPT_DATA', message: 'Data Jurnal Perasaan tidak valid.' };
    }
  }

  for (const g of doc.goals) {
    if (!isValidBaseRecord(g) || !validateGoalPayload(g).ok) {
      return { ok: false, errorCode: 'CORRUPT_DATA', message: 'Data Langkah Berani tidak valid.' };
    }
  }

  const serialized = JSON.stringify(doc);
  if (getUtf8ByteSize(serialized) > APP_CONFIG.maxDocumentBytes) {
    return {
      ok: false,
      errorCode: 'LIMIT_EXCEEDED',
      message:
        'Penyimpanan aplikasi mencapai batas ukuran data. Hapus catatan yang tidak diperlukan sebelum menyimpan lagi.',
    };
  }

  return { ok: true, document: doc };
}
