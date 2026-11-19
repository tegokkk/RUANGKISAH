import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

/**
 * O01: Konfirmasi simpan awal atau simpan perubahan ke browser perangkat ini.
 */
export function SaveConfirmDialog({
  open,
  isEdit = false,
  isDemo = false,
  pending = false,
  onCancel,
  onConfirm,
}) {
  const title = isDemo
    ? 'Coba alur simpan (simulasi)?'
    : isEdit
      ? 'Simpan perubahan di browser ini?'
      : 'Simpan di browser perangkat ini?';

  return (
    <Dialog
      open={open}
      title={title}
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
            {isDemo ? 'Jalankan simulasi simpan' : 'Ya, simpan di perangkat ini'}
          </Button>
        </>
      }
    >
      {isDemo ? (
        <p>
          Ini adalah simulasi pada mode contoh fiktif. Tidak ada data yang ditulis ke penyimpanan
          browser pribadimu.
        </p>
      ) : (
        <>
          <p>
            Catatan ini disimpan untuk akunmu hanya di browser perangkat yang sedang kamu pakai.
            Aplikasi tidak mengirim atau menyinkronkan catatan ke server maupun perangkat lain.
          </p>
          <p>
            Orang lain yang memakai profil browser yang sama mungkin dapat membukanya. Catatan
            bertahan sampai kamu menghapusnya di <strong>Catatan Saya</strong> atau{' '}
            <strong>Privasi &amp; Data</strong>, atau saat data browser dibersihkan.
          </p>
          <p>
            <Link to="/privasi">Pelajari lebih lanjut di Privasi &amp; Data</Link>
          </p>
        </>
      )}
    </Dialog>
  );
}

/**
 * O02: Konfirmasi meninggalkan isian sementara atau perubahan yang belum disimpan.
 */
export function LeaveDraftDialog({ open, isEdit = false, onStay, onLeave }) {
  return (
    <Dialog
      open={open}
      title={isEdit ? 'Tinggalkan perubahan yang belum disimpan?' : 'Tinggalkan isian sementara?'}
      onClose={onStay}
      actions={
        <>
          <Button variant="primary" onClick={onStay}>
            Tetap mengisi
          </Button>
          <Button variant="secondary" onClick={onLeave}>
            Tinggalkan tanpa menyimpan
          </Button>
        </>
      }
    >
      {isEdit ? (
        <p>
          Perubahan baru yang belum disimpan akan dibuang. Versi catatan yang sebelumnya sudah
          tersimpan tetap aman dan tidak berubah.
        </p>
      ) : (
        <p>Isian yang belum disimpan akan dibuang jika kamu meninggalkan aktivitas ini.</p>
      )}
    </Dialog>
  );
}

/**
 * O03 / O04: Konfirmasi hapus satu catatan atau hapus semua data RUANGKISAH.
 */
export function DeleteConfirmDialog({
  open,
  mode = 'single', // 'single' | 'all'
  pending = false,
  onCancel,
  onConfirm,
}) {
  const isAll = mode === 'all';

  return (
    <Dialog
      open={open}
      title={isAll ? 'Hapus semua catatan akun ini di browser ini?' : 'Hapus catatan ini?'}
      onClose={onCancel}
      closeDisabled={pending}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} pending={pending} pendingText="Menghapus...">
            {isAll ? 'Hapus semua data' : 'Hapus catatan'}
          </Button>
        </>
      }
    >
      {isAll ? (
        <p>
          Seluruh catatan dan target RUANGKISAH yang tersimpan di browser ini akan dihapus dan tidak
          dapat dikembalikan melalui aplikasi. Data situs lain dan pesan yang pernah kamu kirim di
          kanal luar tidak ikut terhapus.
        </p>
      ) : (
        <p>
          Catatan ini akan dihapus dari browser perangkat ini dan tidak dapat dikembalikan melalui
          aplikasi.
        </p>
      )}
    </Dialog>
  );
}

/**
 * O05: Pemberitahuan sebelum membuka kanal luar (WhatsApp / email).
 */
export function ExternalChannelDialog({ open, channel, onCancel, onProceed }) {
  if (!channel) return null;
  const isWhatsapp = channel.type === 'whatsapp';

  return (
    <Dialog
      open={open}
      title="Lanjut ke kanal luar?"
      onClose={onCancel}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Tetap di RUANGKISAH
          </Button>
          <Button variant="primary" onClick={onProceed}>
            {isWhatsapp ? 'Lanjut ke WhatsApp' : 'Lanjut ke email'}
          </Button>
        </>
      }
    >
      <p>
        {isWhatsapp
          ? 'WhatsApp dapat menampilkan nomor teleponmu.'
          : 'Layanan email dapat menampilkan alamat emailmu.'}{' '}
        Isi jurnalmu tidak dilampirkan otomatis. Kanal tersebut memiliki kebijakan privasinya
        sendiri.
      </p>
    </Dialog>
  );
}

/**
 * O06: Data tersimpan rusak atau versi tidak didukung.
 */
export function CorruptDataDialog({ open, message, onClose, onReviewReset }) {
  return (
    <Dialog
      open={open}
      title="Data tersimpan tidak dapat dibaca."
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Kembali
          </Button>
          <Button variant="dangerOutline" onClick={onReviewReset}>
            Tinjau pilihan hapus data
          </Button>
        </>
      }
    >
      <p>
        {message ||
          'Sebagian data lokal memiliki format yang rusak atau versi yang tidak didukung aplikasi ini. Data lama tidak ditimpa otomatis.'}
      </p>
      <p>
        Jika kamu ingin membersihkan data RUANGKISAH yang rusak di browser ini, kamu dapat meninjau
        pilihan hapus data pada langkah berikutnya.
      </p>
    </Dialog>
  );
}
