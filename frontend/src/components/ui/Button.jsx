import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  pending = false,
  pendingText = 'Memproses...',
  disabled = false,
  type = 'button',
  to,
  className = '',
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant] || styles.primary,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
