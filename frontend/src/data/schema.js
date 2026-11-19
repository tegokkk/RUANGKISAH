import { APP_CONFIG } from '@/config/appConfig';

export const RECORD_TYPES = {
  REFLECTION: 'reflection',
  JOURNAL: 'journal',
  GOAL: 'goal',
};

export const RECORD_TYPE_LABELS = {
  [RECORD_TYPES.REFLECTION]: 'Kenali Diriku',
  [RECORD_TYPES.JOURNAL]: 'Jurnal Perasaan',
  [RECORD_TYPES.GOAL]: 'Langkah Berani',
};

export const GOAL_STATUSES = ['planned', 'trying', 'tried', 'postponed'];

export const GOAL_STATUS_LABELS = {
  planned: 'Direncanakan',
  trying: 'Sedang dicoba',
  tried: 'Selesai dicoba',
  postponed: 'Ditunda',
};

export const FEELING_IDS = ['senang', 'sedih', 'cemas', 'marah', 'tenang', 'bingung', 'lainnya'];

export function createEmptyDocument() {
  return {
    schemaVersion: APP_CONFIG.schemaVersion,
    documentRevision: 0,
    reflections: [],
    journals: [],
    goals: [],
  };
}
