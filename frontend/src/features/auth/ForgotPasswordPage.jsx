import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { authStore } from '@/data/authStore';
import styles from './AuthPages.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sentResult, setSentResult] = useState(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    setError('');
    setPending(true);
    const res = await authStore.requestPasswordReset(email);
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setSentResult({
      message:
        'Jika email tersebut terdaftar, instruksi pemulihan akan dikirim melalui layanan email yang tersedia.',
    });
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="forgot-title">
        <div className={styles.accentStrip} aria-hidden="true" />

        {!sentResult ? (
          <>
            <h1 id="forgot-title" className={styles.title}>
              Pemulihan kata sandi.
            </h1>
            <p className={styles.lead}>
              Masukkan email akunmu. Kami akan menyiapkan instruksi pengaturan ulang kata sandi.
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Field
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="nama@contoh.id"
                error={error}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                pending={pending}
                pendingText="Memproses..."
              >
                Kirim instruksi reset
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 id="forgot-title" className={styles.title}>
              Periksa emailmu.
            </h1>
            <Notice variant="info">{sentResult.message}</Notice>
            <p className={styles.lead}>
              Demi privasi akun, pesan ini sama baik email terdaftar maupun tidak.
            </p>
          </>
        )}

        <div className={styles.footerLinks}>
          <TextLink to="/masuk">Kembali ke halaman Masuk</TextLink>
        </div>
      </section>
    </div>
  );
}
