import { BookOpenIcon } from '@/assets/icons/Icons';
import styles from './EmptyState.module.css';

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  headingAs = 'h2',
}) {
  const Heading = headingAs;
  return (
    <div className={[styles.empty, compact ? styles.compact : ''].join(' ')}>
      <div className={styles.iconWrap}>{icon || <BookOpenIcon size={24} />}</div>
      <Heading className={headingAs === 'h1' ? styles.pageTitle : styles.title}>{title}</Heading>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
