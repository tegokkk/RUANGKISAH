import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ACCOUNT_STATUSES, ROLE_LABELS, ROLES } from '@/data/authStore';
import { PasswordField } from '@/features/auth/components/PasswordField';

export function DeleteAccountDialog({ open, account, pending = false, onCancel, onConfirm }) {
  if (!account) return null;

  return (
    <Dialog
      open={open}
      title="Hapus akun?"
      onClose={onCancel}
      closeDisabled={pending}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} pending={pending} pendingText="Menghapus...">
            Hapus akun
          </Button>
        </>
      }
    >
      <p>
        Akun sasaran: <strong>{account.displayName}</strong> ({account.email}) — peran{' '}
        <strong>{ROLE_LABELS[account.role]}</strong>.
      </p>
      <p>
        Penghapusan akun menghilangkan akses masuk akun ini dari sistem pengelola dan tidak dapat
        dibatalkan. Riwayat tindakan pengelola dapat tetap disimpan hingga 180 hari untuk
        pertanggungjawaban.
      </p>
      <p>
        <strong>Batas penghapusan:</strong> Menghapus akun tidak otomatis menghapus catatan lokal
        yang tersimpan di browser perangkat siswa.
      </p>
    </Dialog>
  );
}

export function ToggleStatusDialog({ open, account, pending = false, onCancel, onConfirm }) {
  if (!account) return null;
  const isDisabling = account.status === ACCOUNT_STATUSES.ACTIVE;

  return (
    <Dialog
      open={open}
      title={isDisabling ? 'Nonaktifkan akun?' : 'Aktifkan kembali akun?'}
      onClose={onCancel}
      closeDisabled={pending}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Batal
          </Button>
          <Button
            variant={isDisabling ? 'danger' : 'primary'}
            onClick={onConfirm}
            pending={pending}
            pendingText="Memproses..."
          >
            {isDisabling ? 'Nonaktifkan akun' : 'Aktifkan kembali'}
          </Button>
        </>
      }
    >
      <p>
        Akun sasaran: <strong>{account.displayName}</strong> ({account.email}).
      </p>
      <p>
        {isDisabling
          ? 'Pengguna tidak akan dapat masuk selama akun berstatus dinonaktifkan.'
          : 'Akun diaktifkan kembali. Login tetap memerlukan persetujuan Admin.'}
      </p>
    </Dialog>
  );
}

export function ApproveAccountDialog({ open, account, pending = false, onCancel, onConfirm }) {
  if (!account) return null;
  return (
    <Dialog
      open={open}
      title="Setujui pendaftaran akun?"
      onClose={onCancel}
      closeDisabled={pending}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            pending={pending}
            pendingText="Menyetujui..."
          >
            Ya, setujui akun
          </Button>
        </>
      }
    >
      <p>
        Akun sasaran: <strong>{account.displayName}</strong> ({account.email}).
      </p>
      <p>Persetujuan ini mengizinkan pengguna masuk dan menggunakan fitur RUANGKISAH.</p>
      <p>
        Tindakan dicatat dalam riwayat pengelola. Persetujuan tidak memberikan akses ke isi jurnal
        pengguna.
      </p>
    </Dialog>
  );
}

export function ChangeRoleDialog({
  open,
  account,
  targetRole,
  pending = false,
  onCancel,
  onConfirm,
}) {
  if (!account || !targetRole) return null;
  const isPromoting = targetRole === ROLES.ADMIN;

  return (
    <Dialog
      open={open}
      title={isPromoting ? 'Tetapkan sebagai Admin?' : 'Cabut peran Admin?'}
      onClose={onCancel}
      closeDisabled={pending}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            pending={pending}
            pendingText="Menyimpan..."
          >
            {isPromoting ? 'Ya, tetapkan Admin' : 'Ya, cabut peran Admin'}
          </Button>
        </>
      }
    >
      <p>
        Akun sasaran: <strong>{account.displayName}</strong> ({account.email}).
      </p>
      <p>
        Peran baru: <strong>{ROLE_LABELS[targetRole]}</strong>. Perubahan peran ini akan dicatat
        dalam riwayat tindakan pengelola.
      </p>
    </Dialog>
  );
}

export function ResetPasswordDialog({ open, account, pending = false, onCancel, onConfirm }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (!account) return null;

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onCancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (newPassword.length < 10 || newPassword.length > 128) {
      nextErrors.newPassword = 'Kata sandi baru harus 10-128 karakter.';
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi tidak sama.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const value = newPassword;
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onConfirm(value);
  };

  return (
    <Dialog
      open={open}
      title="Atur ulang kata sandi akun?"
      onClose={handleClose}
      closeDisabled={pending}
      actions={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={pending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="admin-reset-password-form"
            variant="primary"
            pending={pending}
            pendingText="Menyimpan..."
          >
            Simpan kata sandi baru
          </Button>
        </>
      }
    >
      <p>
        Akun sasaran: <strong>{account.displayName}</strong> ({account.email}) — peran{' '}
        <strong>{ROLE_LABELS[account.role]}</strong>.
      </p>
      <p>
        Sesi masuk aktif pada akun ini akan dicabut dan tindakan akan dicatat dalam riwayat
        pengelola tanpa menyimpan isi kata sandi.
      </p>
      <form
        id="admin-reset-password-form"
        onSubmit={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem' }}
      >
        <PasswordField
          label="Kata sandi baru"
          required
          autoComplete="new-password"
          helper="Gunakan 10-128 karakter."
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErrors((prev) => ({ ...prev, newPassword: '' }));
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
            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
        />
      </form>
    </Dialog>
  );
}
