import { Link } from 'react-router-dom';
import { ExternalLinkIcon } from '@/assets/icons/Icons';
import styles from './TextLink.module.css';

export function TextLink({
  to,
  href,
  external = false,
  onDark = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [styles.link, onDark ? styles.onDark : '', className].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      <span>{children}</span>
      {external && <ExternalLinkIcon size={15} />}
    </a>
  );
}
