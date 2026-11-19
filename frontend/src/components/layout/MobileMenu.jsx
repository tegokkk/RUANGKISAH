import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CloseIcon } from '@/assets/icons/Icons';
import { ROLES } from '@/data/authStore';
import { useAuth } from '@/features/auth/AuthContext';
import { usePresence } from '@/hooks/usePresence';
import styles from './MobileMenu.module.css';

const PRIMARY_LINKS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/kenali-diriku', label: 'Kenali Diriku' },
  { to: '/jurnal-perasaan', label: 'Jurnal Perasaan' },
  { to: '/langkah-berani', label: 'Langkah Berani' },
  { to: '/pusat-bantuan', label: 'Pusat Bantuan' },
];

const SECONDARY_LINKS = [
  { to: '/catatan-saya', label: 'Catatan Saya' },
  { to: '/privasi', label: 'Privasi & Data' },
  { to: '/tentang', label: 'Tentang & Cara Pakai' },
];

export function MobileMenu({ open, onClose, returnFocusRef }) {
  const closeButtonRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const present = usePresence(open);

  useEffect(() => {
    if (!open) return undefined;

    const returnTarget = returnFocusRef?.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab') {
        const panel = document.getElementById('mobile-navigation-panel');
        const items = panel?.querySelectorAll('a[href], button:not([disabled])');
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      returnTarget?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!present) return null;

  return (
    <div
      className={styles.backdrop}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      inert={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="mobile-navigation-panel"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu RUANGKISAH"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Menu RUANGKISAH</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <CloseIcon size={18} />
            <span>Tutup menu</span>
          </button>
        </div>

        <nav className={styles.list} aria-label="Menu navigasi">
          {PRIMARY_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          <div className={styles.divider} />

          {SECONDARY_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          <div className={styles.divider} />

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/masuk"
                onClick={onClose}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                Masuk
              </NavLink>
              <NavLink
                to="/daftar"
                onClick={onClose}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                Daftar
              </NavLink>
            </>
          ) : (
            <>
              {user.role === ROLES.ADMIN && (
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ''}`
                  }
                >
                  Panel Admin
                </NavLink>
              )}
              {user.role === ROLES.SUPERADMIN && (
                <NavLink
                  to="/superadmin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ''}`
                  }
                >
                  Panel Superadmin
                </NavLink>
              )}
              <NavLink
                to="/akun"
                onClick={onClose}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                Akun Saya
              </NavLink>
              <button
                type="button"
                className={styles.link}
                style={{
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--color-danger)',
                }}
                onClick={async () => {
                  const result = await logout();
                  if (result.ok) {
                    onClose();
                    navigate('/');
                  }
                }}
              >
                Keluar
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
