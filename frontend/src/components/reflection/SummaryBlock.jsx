import styles from './SummaryBlock.module.css';

export function SummaryBlock({ title, content, emptyText = 'Belum diisi' }) {
  const hasContent = typeof content === 'string' && content.trim().length > 0;

  return (
    <div className={styles.block}>
      <h3 className={styles.heading}>{title}</h3>
      {hasContent ? (
        <p className={styles.body}>{content}</p>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  );
}
