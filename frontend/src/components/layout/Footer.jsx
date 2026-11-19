import { useOpenDemo } from '@/hooks/useOpenDemo';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { useAppData } from '@/features/demo/AppDataContext';
import styles from './Footer.module.css';

export function Footer() {
  const { isDemo } = useAppData();
  const handleStartDemo = useOpenDemo();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <span className={styles.wordmark}>RUANGKISAH.ID · Selfcare-BK</span>
            <p className={styles.purpose}>
              Media pendamping BK bagi siswa/siswi lintas sekolah untuk mengenali diri, memahami
              perasaan, dan mencoba langkah kecil sesuai kesiapan.
            </p>
          </div>

          <nav className={styles.linksCol} aria-label="Navigasi footer">
            <SlideTabs
              wrap
              items={[
                { to: '/privasi', label: 'Privasi & Data' },
                { to: '/tentang', label: 'Tentang & Cara Pakai' },
                { to: '/pusat-bantuan', label: 'Pusat Bantuan' },
                ...(!isDemo
                  ? [{ id: 'demo', label: 'Lihat contoh fiktif', onClick: handleStartDemo }]
                  : []),
              ]}
            />
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>Media pendamping BK, bukan pengganti konseling.</span>
          <span>Login untuk beraktivitas · Catatan tetap lokal</span>
        </div>
      </div>
    </footer>
  );
}
