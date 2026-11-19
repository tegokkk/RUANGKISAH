import { AlertTriangleIcon, CheckIcon, InfoIcon } from '@/assets/icons/Icons';
import styles from './Notice.module.css';

export function Notice({
  variant = 'info',
  title,
  children,
  actions,
  role = variant === 'danger' || variant === 'warning' ? 'alert' : 'status',
  className = '',
}) {
  const Icon =
    variant === 'success'
      ? CheckIcon
      : variant === 'warning' || variant === 'danger'
        ? AlertTriangleIcon
        : InfoIcon;

  return (
    <div className={`${styles.notice} ${styles[variant] || styles.info} ${className}`} role={role}>
      <span className={styles.icon}>
        <Icon size={20} />
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
