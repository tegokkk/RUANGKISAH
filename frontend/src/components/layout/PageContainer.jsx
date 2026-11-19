import { readMotionConfig } from '@/config/motionConfig';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DemoBanner } from '@/features/demo/DemoBanner';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileMenu } from './MobileMenu';
import styles from './PageContainer.module.css';

const ROUTE_TITLES = {
  '/': 'Beranda - RUANGKISAH.ID',
  '/kenali-diriku': 'Kenali Diriku - RUANGKISAH.ID',
  '/jurnal-perasaan': 'Jurnal Perasaan - RUANGKISAH.ID',
  '/langkah-berani': 'Langkah Berani - RUANGKISAH.ID',
  '/catatan-saya': 'Catatan Saya - RUANGKISAH.ID',
  '/pusat-bantuan': 'Pusat Bantuan - RUANGKISAH.ID',
  '/privasi': 'Privasi & Data - RUANGKISAH.ID',
  '/tentang': 'Tentang & Cara Pakai - RUANGKISAH.ID',
  '/masuk': 'Masuk - RUANGKISAH.ID',
  '/daftar': 'Daftar - RUANGKISAH.ID',
  '/lupa-kata-sandi': 'Pemulihan Kata Sandi - RUANGKISAH.ID',
  '/reset-kata-sandi': 'Atur Ulang Kata Sandi - RUANGKISAH.ID',
  '/akun': 'Akun Saya - RUANGKISAH.ID',
  '/admin': 'Panel Admin - RUANGKISAH.ID',
  '/superadmin': 'Panel Superadmin - RUANGKISAH.ID',
  '/tidak-diizinkan': 'Akses Tidak Diizinkan - RUANGKISAH.ID',
};

export function PageContainer({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mainRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const motion = readMotionConfig();
    const title = ROUTE_TITLES[location.pathname] || 'Halaman tidak ditemukan - RUANGKISAH.ID';
    document.title = title;
    window.scrollTo({ top: 0, behavior: 'auto' });
    mainRef.current?.focus({ preventScroll: true });
    if (
      !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches &&
      mainRef.current?.animate
    ) {
      mainRef.current.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: motion.base, easing: motion.ease }
      );
      const nodes = mainRef.current.querySelectorAll('[data-reveal]');
      if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries)
              if (entry.isIntersecting) {
                entry.target.animate(
                  [
                    { opacity: 0, transform: 'translateY(12px)' },
                    { opacity: 1, transform: 'translateY(0)' },
                  ],
                  { duration: motion.reveal, easing: motion.ease }
                );
                observer.unobserve(entry.target);
              }
          },
          { threshold: 0.12 }
        );
        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
      }
    }
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Langsung ke isi utama
      </a>

      <DemoBanner />
      <Header
        menuOpen={menuOpen}
        menuButtonRef={menuButtonRef}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <main id="main-content" ref={mainRef} tabIndex={-1} className={styles.main}>
        {children}
      </main>

      <Footer />

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusRef={menuButtonRef}
      />
    </div>
  );
}
