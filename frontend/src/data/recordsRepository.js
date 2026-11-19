import { APP_CONFIG } from '@/config/appConfig';
import { CONTENT_PACKAGE_META } from '@/content/contentVersions';
import { createEmptyDocument, RECORD_TYPES, RECORD_TYPE_LABELS } from '@/data/schema';
import {
  validateGoalPayload,
  validateJournalPayload,
  validateLocalDocument,
  validateReflectionPayload,
} from '@/data/validators';
import { broadcastDataChange, runCoordinatedWrite } from '@/data/writeCoordinator';
import { generateLocalId } from '@/utils/id';

function getCollectionKey(type) {
  if (type === RECORD_TYPES.REFLECTION) return 'reflections';
  if (type === RECORD_TYPES.JOURNAL) return 'journals';
  if (type === RECORD_TYPES.GOAL) return 'goals';
  throw new Error(`Jenis catatan tidak dikenal: ${type}`);
}

function validatePayloadByType(type, payload) {
  if (type === RECORD_TYPES.REFLECTION) return validateReflectionPayload(payload);
  if (type === RECORD_TYPES.JOURNAL) return validateJournalPayload(payload);
  if (type === RECORD_TYPES.GOAL) return validateGoalPayload(payload);
  return { ok: false, message: 'Jenis catatan tidak dikenal.' };
}

export function createRecordsRepository(adapter) {
  function readDocument() {
    const rawResult = adapter.readRaw();
    if (!rawResult.ok) {
      return rawResult;
    }

    if (rawResult.value === null || rawResult.value === undefined || rawResult.value === '') {
      return { ok: true, document: createEmptyDocument(), isEmpty: true };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawResult.value);
    } catch {
      return {
        ok: false,
        errorCode: 'CORRUPT_DATA',
        message: 'Data tersimpan tidak dapat dibaca.',
      };
    }

    const validated = validateLocalDocument(parsed);
    if (!validated.ok) {
      return validated;
    }

    return { ok: true, document: validated.document, isEmpty: false };
  }

  function listRecordSummaries() {
    const docResult = readDocument();
    if (!docResult.ok) {
      return docResult;
    }

    const { document } = docResult;
    const rows = [
      ...document.reflections.map((r) => ({
        id: r.id,
        type: RECORD_TYPES.REFLECTION,
        typeLabel: RECORD_TYPE_LABELS[RECORD_TYPES.REFLECTION],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        revision: r.revision,
      })),
      ...document.journals.map((j) => ({
        id: j.id,
        type: RECORD_TYPES.JOURNAL,
        typeLabel: RECORD_TYPE_LABELS[RECORD_TYPES.JOURNAL],
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
        revision: j.revision,
        entryDate: j.entryDate,
      })),
      ...document.goals.map((g) => ({
        id: g.id,
        type: RECORD_TYPES.GOAL,
        typeLabel: RECORD_TYPE_LABELS[RECORD_TYPES.GOAL],
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        revision: g.revision,
      })),
    ];

    rows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return {
      ok: true,
      records: rows,
      documentRevision: document.documentRevision,
    };
  }

  function listGoals() {
    const docResult = readDocument();
    if (!docResult.ok) return docResult;
    const goals = [...docResult.document.goals].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return { ok: true, goals, documentRevision: docResult.document.documentRevision };
  }

  function getRecordById(type, id) {
    const docResult = readDocument();
    if (!docResult.ok) return docResult;

    const key = getCollectionKey(type);
    const record = docResult.document[key].find((item) => item.id === id);
    if (!record) {
      return {
        ok: false,
        errorCode: 'NOT_FOUND',
        message: 'Catatan ini sudah dihapus atau tidak ditemukan di browser ini.',
      };
    }

    return {
      ok: true,
      record,
      type,
      documentRevision: docResult.document.documentRevision,
    };
  }

  async function saveNewRecord(type, payload) {
    const payloadCheck = validatePayloadByType(type, payload);
    if (!payloadCheck.ok) {
      return { ok: false, errorCode: 'VALIDATION_ERROR', message: payloadCheck.message };
    }

    return runCoordinatedWrite(adapter, () => {
      const docResult = readDocument();
      if (!docResult.ok) {
        return docResult;
      }

      const doc = structuredClone(docResult.document);
      const key = getCollectionKey(type);

      if (doc[key].length >= APP_CONFIG.maxItemsPerType) {
        return {
          ok: false,
          errorCode: 'LIMIT_EXCEEDED',
          message:
            'Penyimpanan aplikasi mencapai batas. Hapus catatan yang tidak diperlukan sebelum menyimpan lagi.',
        };
      }

      const now = new Date().toISOString();
      const newRecord = {
        ...payload,
        id: generateLocalId(type.slice(0, 3)),
        createdAt: now,
        updatedAt: now,
        revision: 1,
        contentVersion: CONTENT_PACKAGE_META.version,
        storageAcknowledgedAt: now,
        privacyNoticeVersion: APP_CONFIG.privacyNoticeVersion,
      };

      doc[key].push(newRecord);
      doc.documentRevision += 1;

      const docCheck = validateLocalDocument(doc);
      if (!docCheck.ok) {
        return docCheck;
      }

      const writeRes = adapter.writeRaw(JSON.stringify(doc));
      if (!writeRes.ok) {
        return writeRes;
      }

      if (adapter.kind === 'local') {
        broadcastDataChange({ action: 'create', type, id: newRecord.id });
      }

      return { ok: true, record: newRecord, documentRevision: doc.documentRevision };
    });
  }

  async function updateRecord(type, id, expectedRevision, payload) {
    const payloadCheck = validatePayloadByType(type, payload);
    if (!payloadCheck.ok) {
      return { ok: false, errorCode: 'VALIDATION_ERROR', message: payloadCheck.message };
    }

    return runCoordinatedWrite(adapter, () => {
      const docResult = readDocument();
      if (!docResult.ok) {
        return docResult;
      }

      const doc = structuredClone(docResult.document);
      const key = getCollectionKey(type);
      const index = doc[key].findIndex((item) => item.id === id);

      if (index === -1) {
        return {
          ok: false,
          errorCode: 'DELETED_ELSEWHERE',
          message: 'Catatan ini sudah dihapus dari browser ini.',
        };
      }

      const existing = doc[key][index];
      if (typeof expectedRevision === 'number' && existing.revision !== expectedRevision) {
        return {
          ok: false,
          errorCode: 'TAB_CONFLICT',
          message: 'Catatan berubah di tab lain.',
          latestRecord: existing,
        };
      }

      const now = new Date().toISOString();
      const updatedRecord = {
        ...existing,
        ...payload,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
        revision: existing.revision + 1,
        contentVersion: CONTENT_PACKAGE_META.version,
        storageAcknowledgedAt: now,
        privacyNoticeVersion: APP_CONFIG.privacyNoticeVersion,
      };

      doc[key][index] = updatedRecord;
      doc.documentRevision += 1;

      const docCheck = validateLocalDocument(doc);
      if (!docCheck.ok) {
        return docCheck;
      }

      const writeRes = adapter.writeRaw(JSON.stringify(doc));
      if (!writeRes.ok) {
        return writeRes;
      }

      if (adapter.kind === 'local') {
        broadcastDataChange({ action: 'update', type, id: updatedRecord.id });
      }

      return { ok: true, record: updatedRecord, documentRevision: doc.documentRevision };
    });
  }

  async function deleteRecord(type, id) {
    return runCoordinatedWrite(adapter, () => {
      const docResult = readDocument();
      if (!docResult.ok) {
        return docResult;
      }

      const doc = structuredClone(docResult.document);
      const key = getCollectionKey(type);
      const nextList = doc[key].filter((item) => item.id !== id);

      if (nextList.length === doc[key].length) {
        return {
          ok: false,
          errorCode: 'NOT_FOUND',
          message: 'Catatan ini sudah dihapus dari browser ini.',
        };
      }

      doc[key] = nextList;
      doc.documentRevision += 1;

      const writeRes = adapter.writeRaw(JSON.stringify(doc));
      if (!writeRes.ok) {
        return writeRes;
      }

      if (adapter.kind === 'local') {
        broadcastDataChange({ action: 'delete', type, id });
      }

      return { ok: true, documentRevision: doc.documentRevision };
    });
  }

  async function clearAllData() {
    return runCoordinatedWrite(adapter, () => {
      const removeRes = adapter.removeKey();
      if (!removeRes.ok) {
        return removeRes;
      }

      if (adapter.kind === 'local') {
        broadcastDataChange({ action: 'clear_all' });
      }

      return { ok: true };
    });
  }

  return {
    kind: adapter.kind,
    readDocument,
    listRecordSummaries,
    listGoals,
    getRecordById,
    saveNewRecord,
    updateRecord,
    deleteRecord,
    clearAllData,
  };
}
