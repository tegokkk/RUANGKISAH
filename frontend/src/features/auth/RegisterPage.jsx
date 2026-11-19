import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { apiRequest, authStore } from '@/data/authStore';
import { PasswordField } from '@/features/auth/components/PasswordField';
import styles from './AuthPages.module.css';

export function RegisterPage() {
  const [phase, setPhase] = useState('form'); // 'form' | 'verify' | 'success'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);
  const [localMail, setLocalMail] = useState(false);
  useEffect(() => {
    apiRequest('/api/config').then((result) => setLocalMail(result.mailMode === 'file'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!displayName.trim() || displayName.trim().length < 2) {
      errors.displayName = 'Nama tampilan minimal 2 karakter.';
    } else if (displayName.trim().length > 60) {
      errors.displayName = 'Nama tampilan maksimal 60 karakter.';
    }

    if (!email.trim()) {
      errors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email belum valid.';
    }

    if (password.length < 10 || password.length > 128) {
      errors.password = 'Kata sandi harus 10-128 karakter.';
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = 'Konfirmasi kata sandi tidak sama.';
    }

    if (!agreed) {
      errors.agreed =
        'Kamu perlu menyetujui ketentuan penggunaan dan kebijakan privasi terlebih dahulu.';
    }

    setFieldErrors(errors);
    setSubmitError('');
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    const res = await authStore.registerStudent({ displayName, email, password, agreed });
    setPending(false);

    if (!res.ok) {
      setSubmitError(res.message);
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setPhase('verify');
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="register-title">
        <div className={styles.accentStrip} aria-hidden="true" />

        {phase === 'form' && (
          <>
            <h1 id="register-title" className={styles.title}>
              Mulai langkah kecilmu.
            </h1>
            <p className={styles.lead}>
              Pendaftaran ini membuat akun <strong>Siswa</strong> tanpa meminta NISN, alamat, atau
              nomor telepon. Terbuka untuk siswa/siswi lintas sekolah. Pengelola platform tidak
              memiliki akses ke isi jurnal pribadimu. Email perlu diverifikasi dan akun perlu
              disetujui Admin sebelum dapat digunakan.
            </p>

            {submitError && <Notice variant="danger">{submitError}</Notice>}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Field
                label="Nama tampilan"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setFieldErrors((f) => ({ ...f, displayName: '' }));
                }}
                placeholder="Boleh menggunakan nama panggilan"
                error={fieldErrors.displayName}
              />

              <Field
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((f) => ({ ...f, email: '' }));
                  setSubmitError('');
                }}
                autoComplete="email"
                placeholder="nama@contoh.id"
                error={fieldErrors.email}
              />

              <PasswordField
                label="Kata sandi"
                required
                autoComplete="new-password"
                helper="Gunakan 10-128 karakter."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((f) => ({ ...f, password: '' }));
                }}
                error={fieldErrors.password}
              />

              <PasswordField
                label="Konfirmasi kata sandi"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((f) => ({ ...f, confirmPassword: '' }));
                }}
                error={fieldErrors.confirmPassword}
              />

              <div>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      setFieldErrors((f) => ({ ...f, agreed: '' }));
                    }}
                  />
                  <span>
                    Saya memahami cara kerja akun dan menyetujui ketentuan penggunaan serta{' '}
                    <Link to="/privasi">kebijakan privasi</Link>.
                  </span>
                </label>
                {fieldErrors.agreed && (
                  <p className={styles.errorText} role="alert" style={{ marginTop: '0.35rem' }}>
                    {fieldErrors.agreed}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                pending={pending}
                pendingText="Memproses pendaftaran..."
              >
                Buat akun
              </Button>
            </form>

            <div className={styles.footerLinks}>
              <div>
                Sudah punya akun? <TextLink to="/masuk">Masuk</TextLink>
              </div>
            </div>
          </>
        )}

        {phase === 'verify' && (
          <>
            <h1 id="register-title" className={styles.title}>
              Verifikasi emailmu.
            </h1>
            <p className={styles.lead}>
              Periksa instruksi verifikasi untuk <strong>{email}</strong>, termasuk folder spam.
              Setelah memverifikasi email melalui tautan tersebut, tunggu persetujuan Admin. Akun
              hanya dapat digunakan setelah email terverifikasi dan pendaftaran disetujui.
            </p>
            {submitError && <Notice variant="danger">{submitError}</Notice>}
            {localMail && (
              <Notice variant="warning">
                Mode pengembangan: email belum dikirim ke alamat nyata. Pengelola dapat memeriksa
                kotak pesan lokal server.
              </Notice>
            )}
            <Button to="/masuk" variant="primary" fullWidth>
              Kembali ke Masuk
            </Button>
          </>
        )}

        {phase === 'success' && (
          <>
            <h1 id="register-title" className={styles.title}>
              Akun berhasil dibuat.
            </h1>
            <Notice variant="success">
              Email yang sudah terverifikasi tetap memerlukan persetujuan Admin sebelum akun Siswa
              dapat digunakan.
            </Notice>
            <Button to="/masuk" variant="primary" fullWidth>
              Masuk ke akun
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
