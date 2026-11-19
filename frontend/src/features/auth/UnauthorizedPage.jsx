import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './AuthPages.module.css';
export function UnauthorizedPage() {
  return (
    <div className={styles.page}>
      <EmptyState
        headingAs="h1"
        title="Halaman ini belum bisa kamu buka."
        description="Akunmu tidak memiliki akses ke halaman ini. Kamu tetap dapat menggunakan aktivitas yang tersedia untuk akunmu."
        action={
          <div className={styles.linksRow}>
            <Button to="/" variant="primary">
              Kembali ke Beranda
            </Button>
            <Button to="/akun" variant="secondary">
              Buka Akun Saya
            </Button>
          </div>
        }
      />
    </div>
  );
}
