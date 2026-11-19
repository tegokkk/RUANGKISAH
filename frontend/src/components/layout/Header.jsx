import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MenuIcon } from '@/assets/icons/Icons';
import { ROLES } from '@/data/authStore';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { useAuth } from '@/features/auth/AuthContext';
import styles from './Header.module.css';

const MAIN_NAV_ITEMS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/kenali-diriku', label: 'Kenali Diriku' },
  { to: '/jurnal-perasaan', label: 'Jurnal Perasaan' },
  { to: '/langkah-berani', label: 'Langkah Berani' },
  { to: '/pusat-bantuan', label: 'Pusat Bantuan' },
];

export function Header({ onOpenMenu, menuButtonRef, menuOpen }) {
  const { user, isAuthenticated, logout, sessionError } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.ok) navigate('/');
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.noticeBar}>
        <div className={styles.noticeInner}>
          <span>
            {isAuthenticated
              ? 'Catatanmu tetap lokal di perangkat ini.'
              : 'Masuk untuk mulai berefleksi.'}
          </span>
          <Link to="/privasi" className={styles.noticeLink}>
            Privasi & data
          </Link>
        </div>
      </div>

      <div className={styles.bar}>
        <Link to="/" className={styles.brand}>
          <span className={styles.wordmark}>ruangkisah.</span>
          <span className={styles.program}>Selfcare-BK</span>
        </Link>

        <nav className={styles.nav} aria-label="Navigasi utama">
          <SlideTabs items={MAIN_NAV_ITEMS} />
        </nav>

        <div className={styles.desktopActions}>
          <NavLink
            to="/catatan-saya"
            className={({ isActive }) =>
              `${styles.recordsButton} ${isActive ? styles.recordsButtonActive : ''}`
            }
          >
            Catatan Saya
          </NavLink>

          {!isAuthenticated ? (
            <>
              <Link to="/masuk" className={styles.authLink}>
                Masuk
              </Link>
              <Link to="/daftar" className={styles.authPrimary}>
                Daftar
              </Link>
            </>
          ) : (
            <>
              {user.role === ROLES.ADMIN && (
                <Link to="/admin" className={styles.authLink}>
                  Panel Admin
                </Link>
              )}
              {user.role === ROLES.SUPERADMIN && (
                <Link to="/superadmin" className={styles.authLink}>
                  Panel Superadmin
                </Link>
              )}
              <Link to="/akun" className={styles.authLink}>
                Akun
              </Link>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Keluar
              </button>
            </>
          )}
        </div>

        <div className={styles.compactActions}>
          <Link to="/pusat-bantuan" className={styles.compactHelp}>
            Bantuan
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation-panel"
            onClick={onOpenMenu}
          >
            <MenuIcon size={18} />
            <span>Menu</span>
          </button>
        </div>
      </div>
      {sessionError && <p role="alert">{sessionError}</p>}
    </header>
  );
}
