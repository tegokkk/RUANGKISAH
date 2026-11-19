import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { ROLES } from '@/data/authStore';
import { useAuth } from '@/features/auth/AuthContext';
import { PasswordField } from '@/features/auth/components/PasswordField';
import styles from './AuthPages.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authErrorCode, setAuthErrorCode] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email belum valid.';
    }
    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    }

    setFieldErrors(errors);
    setAuthError('');
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    const res = await login({ email, password });
    setPending(false);

    if (!res.ok) {
      setAuthError(res.message);
      setAuthErrorCode(res.errorCode);
      return;
    }

    const from = location.state?.from;

    if (
      typeof from === 'string' &&
      /^\/(?!\/)/.test(from) &&
      from !== '/masuk' &&
      from !== '/daftar'
    ) {
      navigate(from, { replace: true, state: location.state?.demo ? { startDemo: true } : null });
      return;
    }

    if (res.user.role === ROLES.SUPERADMIN) {
      navigate('/superadmin', { replace: true });
    } else if (res.user.role === ROLES.ADMIN) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/akun', { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.accentStrip} aria-hidden="true" />
        <h1 id="login-title" className={styles.title}>
          Selamat datang kembali.
        </h1>
        <p className={styles.lead}>
          Masuk ke akun RUANGKISAH.ID untuk menggunakan refleksi, jurnal, target, dan catatan.
        </p>

        {authError && (
          <Notice variant={authErrorCode === 'ACCOUNT_PENDING_APPROVAL' ? 'info' : 'danger'}>
            {authError}
          </Notice>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: '' }));
              setAuthError('');
            }}
            autoComplete="email"
            placeholder="nama@contoh.id"
            error={fieldErrors.email}
          />

          <PasswordField
            label="Kata sandi"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: '' }));
              setAuthError('');
            }}
            error={fieldErrors.password}
          />

          <div className={styles.linksRow}>
            <TextLink to="/lupa-kata-sandi">Lupa kata sandi?</TextLink>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            pending={pending}
            pendingText="Sedang masuk..."
          >
            Masuk
          </Button>
        </form>

        <div className={styles.footerLinks}>
          <div>
            Belum punya akun? <TextLink to="/daftar">Daftar</TextLink>
          </div>
          <div>
            <TextLink to="/">Kembali ke Beranda</TextLink>
          </div>
        </div>
      </section>
    </div>
  );
}
