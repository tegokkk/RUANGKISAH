import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import styles from './AuthPages.module.css';

export function ForgotPasswordPage() {
  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="forgot-title">
        <div className={styles.accentStrip} aria-hidden="true" />

        <h1 id="forgot-title" className={styles.title}>
          Pemulihan kata sandi.
        </h1>
        <Notice variant="info">
          Pengiriman email reset otomatis sedang tidak digunakan pada situs ini.
        </Notice>
        <p className={styles.lead}>
          Jika kamu lupa kata sandi, silakan hubungi Admin atau Guru BK untuk membantu mengelola
          akunmu, atau gunakan halaman Pusat Bantuan untuk melihat jalur bantuan yang tersedia.
        </p>

        <Button to="/pusat-bantuan" variant="primary" fullWidth>
          Buka Pusat Bantuan
        </Button>

        <div className={styles.footerLinks}>
          <TextLink to="/masuk">Kembali ke halaman Masuk</TextLink>
        </div>
      </section>
    </div>
  );
}
