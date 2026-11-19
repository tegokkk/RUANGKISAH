import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { ACCOUNT_STATUS_LABELS, ROLE_LABELS, ROLES } from '@/data/authStore';
import { useAuth } from '@/features/auth/AuthContext';
import { formatIndonesianDate } from '@/utils/date';
import styles from './AuthPages.module.css';

export function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

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
    </div>
  );
}
