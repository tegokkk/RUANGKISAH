import { describe, expect, it } from 'vitest';
import {
  validateGoalPayload,
  validateJournalPayload,
  validateReflectionPayload,
} from '@/data/validators';
import { getLocalTodayISO } from '@/utils/date';

describe('validators', () => {
  it('menolak refleksi jika semua jawaban kosong atau melebihi 1.000 karakter', () => {
    const empty = validateReflectionPayload({
      answers: [{ questionId: 'q1', answer: '   ' }],
    });
    expect(empty.ok).toBe(false);

    const tooLong = validateReflectionPayload({
      answers: [{ questionId: 'q1', answer: 'a'.repeat(1001) }],
    });
    expect(tooLong.ok).toBe(false);

    const valid = validateReflectionPayload({
      answers: [
        { questionId: 'q1', answer: 'Jawaban valid' },
        { questionId: 'q2', answer: '' },
      ],
    });
    expect(valid.ok).toBe(true);
  });

  it('menolak jurnal tanggal masa depan, jurnal tanpa isi, dan teks > 5.000 karakter', () => {
    const future = validateJournalPayload({
      entryDate: '2099-01-01',
      feelings: ['senang'],
      situation: '',
      response: '',
      needs: '',
      smallAction: '',
    });
    expect(future.ok).toBe(false);

    const dateOnly = validateJournalPayload({
      entryDate: getLocalTodayISO(),
      feelings: [],
      situation: '   ',
      response: '',
      needs: '',
      smallAction: '',
    });
    expect(dateOnly.ok).toBe(false);

    const overTotal = validateJournalPayload({
      entryDate: getLocalTodayISO(),
      feelings: ['tenang'],
      situation: 'x'.repeat(2501),
      response: 'y'.repeat(2500),
      needs: '',
      smallAction: '',
    });
    expect(overTotal.ok).toBe(false);
  });

  it('memvalidasi target Langkah Berani dan menerima tanggal target lampau', () => {
    const missingTitle = validateGoalPayload({
      title: '  ',
      firstStep: 'Langkah satu',
      status: 'planned',
    });
    expect(missingTitle.ok).toBe(false);

    const validPastDate = validateGoalPayload({
      title: 'Bertanya di kelas',
      firstStep: 'Menulis pertanyaan di buku',
      targetDate: '2020-01-10',
      status: 'postponed',
    });
    expect(validPastDate.ok).toBe(true);
  });
});
