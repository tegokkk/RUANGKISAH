import { BookOpenIcon, FootprintIcon, HeartNoteIcon } from '@/assets/icons/Icons';
import { Button } from '@/components/ui/Button';
import { RECORD_TYPES } from '@/data/schema';
import { formatIndonesianDate } from '@/utils/date';
import styles from './RecordRow.module.css';

function getIcon(type) {
  if (type === RECORD_TYPES.REFLECTION) return <BookOpenIcon size={20} />;
  if (type === RECORD_TYPES.JOURNAL) return <HeartNoteIcon size={20} />;
  return <FootprintIcon size={20} />;
}

/**
 * C-10 RecordRow: Hanya menampilkan ikon jenis, nama modul, tanggal, dan tombol Buka catatan.
 * Sengaja tidak menampilkan cuplikan isi, perasaan, judul target, atau status pribadi.
 */
export function RecordRow({ recordSummary, onOpen }) {
  const displayDate = formatIndonesianDate(recordSummary.updatedAt);

  return (
    <article className={styles.row} aria-label={recordSummary.typeLabel}>
      <div className={styles.info}>
        <div className={styles.iconBox}>{getIcon(recordSummary.type)}</div>
        <div className={styles.meta}>
          <span className={styles.moduleName}>{recordSummary.typeLabel}</span>
          <span className={styles.date}>Diperbarui {displayDate}</span>
        </div>
      </div>

      <Button variant="secondary" onClick={() => onOpen(recordSummary)}>
        Buka catatan
      </Button>
    </article>
  );
}
