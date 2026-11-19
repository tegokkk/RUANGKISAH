import styles from './PageHeader.module.css';
export function PageHeader({ title, description, eyebrow, children, id, className = '' }) {
  return (
    <header className={[styles.header, className].join(' ')}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </header>
  );
}
