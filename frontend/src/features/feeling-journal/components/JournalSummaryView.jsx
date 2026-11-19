import { FeelingIcon } from '@/assets/icons/Icons';
import { SummaryBlock } from '@/components/reflection/SummaryBlock';
import { FEELING_OPTIONS, JOURNAL_PROMPTS } from '@/content/feelingOptions';
import { formatIndonesianDate } from '@/utils/date';
import styles from '../FeelingJournalPage.module.css';

export function JournalSummaryView({ entry }) {
  const feelingMap = new Map(FEELING_OPTIONS.map((f) => [f.id, f]));
  const selectedFeelings = (entry.feelings || []).map((id) => feelingMap.get(id)).filter(Boolean);

  return (
    <div className={styles.summaryList}>
      <div className={styles.summaryMetaCard}>
        <div>
          <p className={styles.metaLabel}>Tanggal jurnal</p>
          <p className={styles.metaDate}>{formatIndonesianDate(entry.entryDate)}</p>
        </div>

        <div>
          <p className={styles.metaLabel}>Perasaan yang dipilih</p>
          {selectedFeelings.length > 0 ? (
            <div className={styles.feelingTags}>
              {selectedFeelings.map((f) => (
                <span key={f.id} className={styles.feelingTag}>
                  <FeelingIcon name={f.icon} size={16} />
                  <span>{f.label}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.closingNote}>Belum dipilih</p>
          )}
        </div>
      </div>

      {JOURNAL_PROMPTS.map((prompt) => (
        <SummaryBlock
          key={prompt.id}
          title={prompt.label}
          content={entry[prompt.id] || ''}
          emptyText="Belum diisi"
        />
      ))}
    </div>
  );
}
