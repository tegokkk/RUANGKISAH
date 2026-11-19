import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { ACCOUNT_STATUS_LABELS, authStore, ROLE_LABELS, ROLES } from '@/data/authStore';
import { useAuth } from '@/features/auth/AuthContext';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { formatIndonesianDate } from '@/utils/date';
import styles from './AuthPages.module.css';

export function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [passwordPending, setPasswordPending] = useState(false);

  if (!user) return null;

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Nama tampilan minimal 2 karakter.');
      return;
    }
    setError('');
    const res = await updateProfile({ displayName });
    if (res.ok) {
      setSavedNotice('Nama tampilan berhasil diperbarui.');
    } else {
      setError(res.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'Kata sandi saat ini wajib diisi.';
    }
    if (newPassword.length < 10 || newPassword.length > 128) {
      errs.newPassword = 'Kata sandi baru harus 10-128 karakter.';
    } else if (newPassword === currentPassword) {
      errs.newPassword = 'Kata sandi baru harus berbeda dari kata sandi saat ini.';
    }
    if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Konfirmasi kata sandi baru tidak sama.';
    }

    setPasswordErrors(errs);
    setPasswordFeedback(null);
    if (Object.keys(errs).length > 0) return;

    setPasswordPending(true);
    const res = await authStore.changeOwnPassword({ currentPassword, newPassword });
    setPasswordPending(false);

    if (!res.ok) {
      setPasswordFeedback({ variant: 'danger', message: res.message });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback({
      variant: 'success',
      message: 'Kata sandi berhasil diperbarui. Sesi pada perangkat lain telah dikeluarkan.',
    });
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.ok) navigate('/');
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="account-title">
        <div className={styles.accentStrip} aria-hidden="true" />
        <h1 id="account-title" className={styles.title}>
          Akun Saya
        </h1>
        <p className={styles.lead}>
          Kelola informasi dasar akunmu. Catatan refleksi pribadimu tetap dikelola langsung olehmu
          di browser perangkat ini.
        </p>

        <div className={styles.metaGrid}>
          <div className={styles.metaBox}>
            <p className={styles.metaLabel}>Email</p>
            <p className={styles.metaValue}>{user.email}</p>
          </div>
          <div className={styles.metaBox}>
            <p className={styles.metaLabel}>Peran</p>
            <p className={styles.metaValue}>{ROLE_LABELS[user.role]}</p>
          </div>
          <div className={styles.metaBox}>
            <p className={styles.metaLabel}>Status</p>
            <p className={styles.metaValue}>{ACCOUNT_STATUS_LABELS[user.status]}</p>
          </div>
          <div className={styles.metaBox}>
            <p className={styles.metaLabel}>Tanggal daftar</p>
            <p className={styles.metaValue}>{formatIndonesianDate(user.createdAt)}</p>
          </div>
        </div>

        {savedNotice && <Notice variant="success">{savedNotice}</Notice>}

        <form className={styles.form} onSubmit={handleSaveName}>
          <Field
            label="Nama tampilan"
            required
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError('');
              setSavedNotice('');
            }}
            error={error}
          />
          <Button type="submit" variant="primary">
            Simpan nama tampilan
          </Button>
        </form>

        <div className={styles.linksRow}>
          {user.role === ROLES.ADMIN && (
            <Button to="/admin" variant="secondary">
              Buka Panel Admin
            </Button>
          )}
          {user.role === ROLES.SUPERADMIN && (
            <Button to="/superadmin" variant="secondary">
              Buka Panel Superadmin
            </Button>
          )}
          <Button variant="secondary" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="change-password-title">
        <h2 id="change-password-title" className={styles.title}>
          Ubah Kata Sandi
        </h2>
        <p className={styles.lead}>
          Perbarui kata sandimu secara berkala untuk menjaga keamanan akun.
        </p>

        {passwordFeedback && (
          <Notice variant={passwordFeedback.variant}>{passwordFeedback.message}</Notice>
        )}

        <form className={styles.form} onSubmit={handleChangePassword} noValidate>
          <PasswordField
            label="Kata sandi saat ini"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
              setPasswordFeedback(null);
            }}
            error={passwordErrors.currentPassword}
          />

          <PasswordField
            label="Kata sandi baru"
            required
            autoComplete="new-password"
            helper="Gunakan 10-128 karakter."
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
              setPasswordFeedback(null);
            }}
            error={passwordErrors.newPassword}
          />

          <PasswordField
            label="Konfirmasi kata sandi baru"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
              setPasswordFeedback(null);
            }}
            error={passwordErrors.confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            pending={passwordPending}
            pendingText="Menyimpan kata sandi..."
          >
            Simpan kata sandi baru
          </Button>
        </form>
      </section>
    </div>
  );
}
