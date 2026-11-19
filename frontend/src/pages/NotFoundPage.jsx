import { BookOpenIcon } from '@/assets/icons/Icons';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.iconWrap}>
          <BookOpenIcon size={24} />
        </div>
        <h1 className={styles.title}>Halaman ini belum ditemukan.</h1>
        <p className={styles.text}>
          Kamu bisa kembali ke Beranda untuk memilih ruang yang ingin dibuka.
        </p>
        <div className={styles.actions}>
          <Button to="/" variant="primary">
            Kembali ke Beranda
          </Button>
          <TextLink to="/pusat-bantuan">Pusat Bantuan</TextLink>
        </div>
      </section>
    </div>
  );
}
