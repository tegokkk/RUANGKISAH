import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '@/config/appConfig';
import { localStorageAdapter } from '@/data/localStorageAdapter';
import { createMemoryAdapter } from '@/data/memoryAdapter';
import { createRecordsRepository } from '@/data/recordsRepository';
import { RECORD_TYPES } from '@/data/schema';

describe('recordsRepository & adapters', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('menyimpan, memperbarui dengan ID sama, dan mendeteksi konflik revisi', async () => {
    const repo = createRecordsRepository(createMemoryAdapter());

    const created = await repo.saveNewRecord(RECORD_TYPES.GOAL, {
      title: 'Target kecil',
      firstStep: 'Langkah satu',
      reason: '',
      targetDate: '',
      support: '',
      status: 'planned',
      afterReflection: '',
    });

    expect(created.ok).toBe(true);
    expect(created.record.revision).toBe(1);

    const updated = await repo.updateRecord(RECORD_TYPES.GOAL, created.record.id, 1, {
      title: 'Target kecil',
      firstStep: 'Langkah satu',
      reason: '',
      targetDate: '',
      support: '',
      status: 'trying',
      afterReflection: 'Mulai mencoba',
    });

    expect(updated.ok).toBe(true);
    expect(updated.record.id).toBe(created.record.id);
    expect(updated.record.revision).toBe(2);

    // Simulasi tab lain mencoba update dengan revisi lama (1)
    const conflict = await repo.updateRecord(RECORD_TYPES.GOAL, created.record.id, 1, {
      title: 'Target kecil',
      firstStep: 'Langkah satu',
      reason: '',
      targetDate: '',
      support: '',
      status: 'postponed',
      afterReflection: '',
    });

    expect(conflict.ok).toBe(false);
    expect(conflict.errorCode).toBe('TAB_CONFLICT');
    expect(conflict.latestRecord.status).toBe('trying');
  });

  it('menangani JSON rusak dan versi tidak didukung tanpa menimpa data', () => {
    window.localStorage.setItem(APP_CONFIG.storageKey, '{rusak');
    const repo = createRecordsRepository(localStorageAdapter);

    const corrupt = repo.readDocument();
    expect(corrupt.ok).toBe(false);
    expect(corrupt.errorCode).toBe('CORRUPT_DATA');
    expect(window.localStorage.getItem(APP_CONFIG.storageKey)).toBe('{rusak');

    window.localStorage.setItem(
      APP_CONFIG.storageKey,
      JSON.stringify({
        schemaVersion: 99,
        documentRevision: 1,
        reflections: [],
        journals: [],
        goals: [],
      })
    );
    const unsupported = repo.readDocument();
    expect(unsupported.ok).toBe(false);
    expect(unsupported.errorCode).toBe('UNSUPPORTED_VERSION');
  });

  it('clearAllData hanya menghapus key RUANGKISAH dan tidak menyentuh key lain', async () => {
    window.localStorage.setItem('unrelated_key', 'keep_me');
    const repo = createRecordsRepository(localStorageAdapter);

    await repo.saveNewRecord(RECORD_TYPES.JOURNAL, {
      entryDate: '2026-11-18',
      feelings: ['tenang'],
      situation: '',
      response: '',
      needs: '',
      smallAction: '',
    });

    expect(window.localStorage.getItem(APP_CONFIG.storageKey)).not.toBeNull();

    const cleared = await repo.clearAllData();
    expect(cleared.ok).toBe(true);
    expect(window.localStorage.getItem(APP_CONFIG.storageKey)).toBeNull();
    expect(window.localStorage.getItem('unrelated_key')).toBe('keep_me');
  });

  it('menangani kegagalan storage penuh tanpa status sukses palsu', async () => {
    const failingAdapter = {
      kind: 'local',
      readRaw: () => ({ ok: true, value: null }),
      writeRaw: () => ({
        ok: false,
        errorCode: 'STORAGE_FULL',
        message: 'Belum tersimpan. Penyimpanan browser tidak tersedia atau penuh.',
      }),
      removeKey: () => ({ ok: true }),
    };

    const repo = createRecordsRepository(failingAdapter);
    const res = await repo.saveNewRecord(RECORD_TYPES.REFLECTION, {
      answers: [{ questionId: 'q1-success-experience', answer: 'Berhasil menyelesaikan tugas' }],
    });

    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe('STORAGE_FULL');
  });

  it('menolak menulis saat Web Locks dan IndexedDB tidak tersedia (ST-09)', async () => {
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined });
    window.localStorage.setItem(
      'ruangkisah:writer-lock',
      JSON.stringify({ tabId: 'tab_lain', expiresAt: Date.now() + 10000 })
    );
    const repo = createRecordsRepository(localStorageAdapter);
    const res = await repo.saveNewRecord(RECORD_TYPES.JOURNAL, {
      entryDate: '2026-11-18',
      feelings: ['tenang'],
      situation: '',
      response: '',
      needs: '',
      smallAction: '',
    });

    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe('SINGLE_TAB_WRITER_LOCKED');
    expect(window.localStorage.getItem(APP_CONFIG.storageKey)).toBeNull();
    window.localStorage.removeItem('ruangkisah:writer-lock');
  });
});
