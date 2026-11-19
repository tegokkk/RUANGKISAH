import { ArrowRightIcon } from '@/assets/icons/Icons';
import { Button } from '@/components/ui/Button';
import styles from './ActivityCard.module.css';

export function ActivityCard({
  number,
  title,
  description,
  metaLabel,
  ctaLabel,
  to,
  tone = 'pistachio',
  icon,
}) {
  return (
    <article className={`${styles.card} ${styles[tone] || styles.pistachio}`}>
      <div className={styles.top}>
        <span className={styles.badge}>{metaLabel}</span>
        <div className={styles.iconCircle}>{icon}</div>
      </div>

      <div className={styles.body}>
        <span className={styles.number}>{number}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      <Button to={to} variant={tone === 'frost' ? 'primary' : 'ink'} fullWidth>
        <span>{ctaLabel}</span>
        <ArrowRightIcon size={18} />
      </Button>
    </article>
  );
}
