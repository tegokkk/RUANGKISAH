import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ACCOUNT_STATUSES, ROLE_LABELS, ROLES } from '@/data/authStore';

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
