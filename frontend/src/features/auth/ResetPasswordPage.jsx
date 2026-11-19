import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { authStore } from '@/data/authStore';
import { PasswordField } from '@/features/auth/components/PasswordField';
import styles from './AuthPages.module.css';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token') || '');
  const [invalidToken, setInvalidToken] = useState(Boolean(searchParams.get('error')));
  const isTokenValid = Boolean(token) && !invalidToken;
  const [pending, setPending] = useState(false);
  useEffect(() => {
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, []);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (newPassword.length < 10 || newPassword.length > 128) {
      nextErrors.newPassword = 'Kata sandi baru harus 10-128 karakter.';
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi tidak sama.';
    }
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    const res = await authStore.resetPasswordWithToken(token, newPassword);
    setPending(false);
    if (!res.ok) {
      setSubmitError(res.message);
      if (res.errorCode === 'INVALID_TOKEN') setInvalidToken(true);
      return;
    }
    setDone(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-title">
        <div className={styles.accentStrip} aria-hidden="true" />

        {!isTokenValid && !done ? (
          <>
            <h1 id="reset-title" className={styles.title}>
              Tautan reset tidak berlaku.
            </h1>
            <Notice variant="warning">
              Tautan pengaturan ulang kata sandi tidak ditemukan, sudah digunakan, atau telah
              kedaluwarsa.
            </Notice>
            <Button to="/lupa-kata-sandi" variant="primary" fullWidth>
              Minta tautan baru
            </Button>
          </>
        ) : done ? (
          <>
            <h1 id="reset-title" className={styles.title}>
              Kata sandi diperbarui.
            </h1>
            <Notice variant="success">
              Kata sandi barumu sudah disimpan. Silakan masuk kembali.
            </Notice>
            <Button to="/masuk" variant="primary" fullWidth>
              Masuk sekarang
            </Button>
          </>
        ) : (
          <>
            <h1 id="reset-title" className={styles.title}>
              Atur kata sandi baru.
            </h1>
            {submitError && <Notice variant="danger">{submitError}</Notice>}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <PasswordField
                label="Kata sandi baru"
                required
                autoComplete="new-password"
                helper="Gunakan 10-128 karakter."
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((er) => ({ ...er, newPassword: '' }));
                }}
                error={errors.newPassword}
              />

              <PasswordField
                label="Konfirmasi kata sandi baru"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((er) => ({ ...er, confirmPassword: '' }));
                }}
                error={errors.confirmPassword}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                pending={pending}
                pendingText="Menyimpan..."
              >
                Simpan kata sandi baru
              </Button>
            </form>
          </>
        )}

        <div className={styles.footerLinks}>
          <TextLink to="/masuk">Kembali ke Masuk</TextLink>
        </div>
      </section>
    </div>
  );
}
