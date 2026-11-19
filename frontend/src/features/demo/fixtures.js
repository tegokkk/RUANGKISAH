import { APP_CONFIG } from '@/config/appConfig';

export const DEMO_FIXTURE_DOCUMENT = {
  schemaVersion: APP_CONFIG.schemaVersion,
  documentRevision: 3,
  reflections: [
    {
      id: 'demo_ref_1',
      createdAt: '2026-11-15T08:30:00.000Z',
      updatedAt: '2026-11-15T08:30:00.000Z',
      revision: 1,
      contentVersion: '1.0.0-draft',
      storageAcknowledgedAt: '2026-11-15T08:30:00.000Z',
      privacyNoticeVersion: APP_CONFIG.privacyNoticeVersion,
      answers: [
        {
          questionId: 'q1-success-experience',
          answer:
            '(Contoh fiktif) Menyelesaikan presentasi kelompok dengan membagi bagian penjelasan secara adil.',
        },
        {
          questionId: 'q2-strengths',
          answer: '(Contoh fiktif) Mau mendengarkan pendapat teman sebelum memutuskan alur kerja.',
        },
        {
          questionId: 'q3-interests',
          answer:
            '(Contoh fiktif) Tertarik mendalami fotografi kegiatan sekolah dan desain poster.',
        },
        {
          questionId: 'q4-personal-values',
          answer: '',
        },
        {
          questionId: 'q5-growth-area',
          answer: '(Contoh fiktif) Berlatih bertanya ketika belum paham materi di kelas.',
        },
        {
          questionId: 'q6-goal',
          answer: '(Contoh fiktif) Menulis satu pertanyaan sebelum pelajaran dimulai.',
        },
      ],
    },
  ],
  journals: [
    {
      id: 'demo_jou_1',
      createdAt: '2026-11-16T10:15:00.000Z',
      updatedAt: '2026-11-16T10:15:00.000Z',
      revision: 1,
      contentVersion: '1.0.0-draft',
      storageAcknowledgedAt: '2026-11-16T10:15:00.000Z',
      privacyNoticeVersion: APP_CONFIG.privacyNoticeVersion,
      entryDate: '2026-11-16',
      feelings: ['cemas', 'tenang'],
      situation:
        '(Contoh fiktif) Besok ada diskusi kelompok dan sempat merasa gugup untuk memulai.',
      response: '(Contoh fiktif) Menarik napas sebentar lalu mencatat poin yang ingin disampaikan.',
      needs: '(Contoh fiktif) Waktu tenang sebentar sebelum kelas dimulai.',
      smallAction: '(Contoh fiktif) Minum air putih dan mengulang catatan singkat.',
    },
  ],
  goals: [
    {
      id: 'demo_goa_1',
      createdAt: '2026-11-17T07:00:00.000Z',
      updatedAt: '2026-11-17T07:00:00.000Z',
      revision: 1,
      contentVersion: '1.0.0-draft',
      storageAcknowledgedAt: '2026-11-17T07:00:00.000Z',
      privacyNoticeVersion: APP_CONFIG.privacyNoticeVersion,
      title: '(Contoh fiktif) Menyampaikan satu pendapat di diskusi kelompok',
      firstStep: '(Contoh fiktif) Menulis dua poin singkat di buku sebelum diskusi dimulai.',
      reason: '(Contoh fiktif) Agar lebih nyaman berbagi ide bersama teman.',
      targetDate: '2026-11-20',
      support: '(Contoh fiktif) Duduk bersebelahan dengan teman kelompok yang suportif.',
      status: 'trying',
      afterReflection: '',
    },
  ],
};
