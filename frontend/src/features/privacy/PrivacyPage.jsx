import { Dialog } from '@/components/ui/Dialog';
import { migrateLegacyRecords } from '@/data/migrateLegacyRecords';
import { useAuth } from '@/features/auth/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCallback, useEffect, useState } from 'react';
import { DeleteConfirmDialog } from '@/components/reflection/ActionDialogs';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { localStorageAdapter } from '@/data/localStorageAdapter';
import { subscribeDataChanges } from '@/data/writeCoordinator';
import { useAppData } from '@/features/demo/AppDataContext';
import styles from './PrivacyPage.module.css';

export function PrivacyPage() {
  const { user } = useAuth();
  const { isDemo, repository, storageAdapter } = useAppData();
  const [legacyAvailable, setLegacyAvailable] = useState(false);
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  const checkStored = useCallback(() => {
    if (!user) {
      setHasStoredData(false);
      setLegacyAvailable(false);
      return;
    }
    if (isDemo) {
      const res = repository.readDocument();
      setHasStoredData(
        res.ok &&
          (res.document.reflections.length > 0 ||
            res.document.journals.length > 0 ||
            res.document.goals.length > 0)
      );
      return;
    }

    const raw = storageAdapter.readRaw();
    const legacy = user ? localStorageAdapter.readRaw() : { value: null };
    setLegacyAvailable(Boolean(legacy.ok && legacy.value));
    setHasStoredData(Boolean(raw.ok && raw.value && raw.value.trim().length > 0));
  }, [isDemo, repository, storageAdapter, user]);

  useEffect(() => {
    checkStored();
    if (isDemo) return undefined;
    return subscribeDataChanges(checkStored);
  }, [checkStored, isDemo]);

  const handleConfirmDeleteAll = async () => {
    if (!user) return;
    setDeleting(true);
    const res = await repository.clearAllData();
    setDeleting(false);
    setConfirmOpen(false);

    if (res.ok) {
      checkStored();
      setStatusNotice({
        variant: 'success',
        message: isDemo
          ? 'Simulasi selesai. Data contoh di memori dibersihkan tanpa menyentuh catatan pribadimu.'
          : 'Catatan lokal akun ini telah dihapus dari browser ini.',
      });
    } else {
      setStatusNotice({
        variant: 'danger',
        message: res.message || 'Data belum berhasil dihapus. Coba lagi.',
      });
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Kamu yang menentukan pilihan data."
        description="Login diperlukan untuk beraktivitas. Isi catatan tetap berada di perangkatmu dan tidak dikirim ke server."
      ></PageHeader>

      <div data-reveal className={styles.compareGrid}>
        <section className={styles.compareCard}>
          <h2 className={styles.cardTitle}>Tanpa menyimpan (default)</h2>
          <ul className={styles.list}>
            <li>Isian baru hanya berada di memori tab browser saat ini.</li>
            <li>Tidak tersedia lagi setelah halaman di-refresh atau ditutup.</li>
            <li>Tidak dikirim sebagai catatan ke server aplikasi.</li>
          </ul>
        </section>

        <section className={`${styles.compareCard} ${styles.frostCard}`}>
          <h2 className={styles.cardTitle}>Simpan di perangkat ini</h2>
          <ul className={styles.list}>
            <li>Tersimpan untuk akun yang sedang masuk, pada browser dan perangkat ini.</li>
            <li>Tidak tersinkronkan ke perangkat lain dan bukan backup permanen.</li>
            <li>Tidak terenkripsi secara khusus oleh aplikasi.</li>
            <li>Orang lain pada profil browser yang sama mungkin dapat membukanya.</li>
          </ul>
        </section>
      </div>

      <section data-reveal className={styles.detailsCard}>
        <div id="ketentuan">
          <h2 className={styles.subHeading}>Ketentuan penggunaan</h2>
          <p className={styles.paragraph}>
            RUANGKISAH menyediakan kegiatan refleksi edukatif yang dapat diikuti secara sukarela.
            Kamu boleh melewati pertanyaan atau berhenti. Media ini bukan alat diagnosis, layanan
            konseling langsung, atau layanan yang memantau jurnal. Gunakan akun milikmu sendiri dan
            hindari memasukkan identitas orang lain ke catatan. Jika memerlukan pendampingan,
            hubungi Guru BK di sekolahmu atau orang dewasa tepercaya.
          </p>
        </div>
        <div>
          <h2 className={styles.subHeading}>Akun dan sesi login</h2>
          <p className={styles.paragraph}>
            Akun hanya dapat digunakan setelah email terverifikasi dan Admin menyetujui pendaftaran.
            Login memakai cookie sesi HttpOnly dengan masa sesi paling lama 24 jam. Login membatasi
            akses fitur dan memisahkan catatan per akun pada perangkat ini. Catatan tidak
            disinkronkan dan login bukan enkripsi. Admin hanya mengelola identitas dasar akun; isi
            jurnal tidak masuk ke server. Akun disimpan sampai dihapus. Riwayat tindakan pengelola
            disimpan hingga 180 hari dan dibersihkan pada startup atau permintaan API berikutnya.
            Pada situs publik, email verifikasi dan pemulihan dikirim melalui penyedia email
            pengelola.
          </p>
        </div>
        <div>
          <h2 className={styles.subHeading}>Apa yang disimpan</h2>
          <p className={styles.paragraph}>
            Hanya hasil Kenali Diriku, Jurnal Perasaan, dan target Langkah Berani yang secara
            eksplisit kamu setujui untuk disimpan, beserta waktu perubahan lokal. Isinya tetap
            lokal. Akun menyimpan nama tampilan, email, status verifikasi, persetujuan Admin, peran,
            serta sesi pada server. Kata sandi di-hash oleh layanan autentikasi; pengelola tidak
            dapat melihatnya. Pendaftaran tidak meminta NISN atau sekolah.
          </p>
        </div>

        <div>
          <h2 className={styles.subHeading}>Siapa yang bisa mengakses</h2>
          <p className={styles.paragraph}>
            Catatan dipisahkan menurut akun pada perangkat ini. Login bukan enkripsi; pemilik akses
            perangkat masih dapat membaca penyimpanan browser. Guru BK tidak otomatis membaca
            catatanmu. Pada perangkat bersama atau komputer sekolah, disarankan memilih akhiri tanpa
            menyimpan.
          </p>
        </div>

        <div>
          <h2 className={styles.subHeading}>Berapa lama tersimpan</h2>
          <p className={styles.paragraph}>
            Catatan lokal tidak memiliki masa kedaluwarsa otomatis dan bertahan sampai kamu
            menghapusnya atau membersihkan data situs di browser.
          </p>
        </div>

        <div>
          <h2 className={styles.subHeading}>Cara menghapus</h2>
          <p className={styles.paragraph}>
            Kamu dapat menghapus satu catatan tertentu di halaman detail pada Catatan Saya, atau
            menghapus seluruh catatan lokal melalui tombol di bawah ini. Penghapusan catatan lokal
            tidak menghapus akun server. Admin dapat menghapus akun dan mencabut sesinya, tetapi
            tidak dapat menghapus catatan pada perangkatmu dari jarak jauh.
          </p>
        </div>

        <div>
          <h2 className={styles.subHeading}>Saat membuka kanal luar</h2>
          <p className={styles.paragraph}>
            Jika kamu memilih menghubungi Guru BK melalui WhatsApp atau email, aplikasi membawamu ke
            layanan luar yang memiliki kebijakan privasi masing-masing dan dapat menampilkan nomor
            telepon atau alamat emailmu. Isi jurnal tidak dilampirkan otomatis.
          </p>
        </div>

        <div>
          <h2 className={styles.subHeading}>Log teknis situs</h2>
          <p className={styles.paragraph}>
            Penyedia hosting dapat mencatat log teknis akses standar (seperti alamat IP, waktu
            akses, dan alamat halaman). Log tersebut tidak menerima isi refleksi atau jurnalmu
            karena isian tidak dikirim ke server.
          </p>
        </div>
      </section>

      <section data-reveal className={styles.dangerCard} aria-labelledby="delete-all-heading">
        <h2 id="delete-all-heading" className={styles.cardTitle}>
          Hapus catatan akun ini di perangkat ini
        </h2>
        <p className={styles.paragraph}>
          Tindakan ini hanya menghapus catatan lokal akun yang sedang masuk pada browser ini.
          Catatan akun lain, data situs lain dan pesan yang sudah dikirim melalui kanal luar tidak
          ikut terhapus.
        </p>

        {statusNotice && <Notice variant={statusNotice.variant}>{statusNotice.message}</Notice>}

        {!hasStoredData ? (
          <Notice variant="info">Tidak ada data tersimpan untuk dihapus di browser ini.</Notice>
        ) : null}

        {user ? (
          <Button
            variant="dangerOutline"
            disabled={!hasStoredData}
            onClick={() => setConfirmOpen(true)}
          >
            Hapus semua data di browser ini
          </Button>
        ) : (
          <Button to="/masuk" state={{ from: '/privasi' }}>
            Masuk untuk mengelola data
          </Button>
        )}
      </section>

      {user && !isDemo && legacyAvailable && (
        <section className={styles.detailsCard}>
          <h2 className={styles.cardTitle}>Catatan dari versi sebelumnya</h2>
          <p className={styles.paragraph}>
            Catatan lama di perangkat ini belum terhubung ke akun. Pindahkan hanya jika catatan itu
            milikmu. Tidak ada catatan yang dikirim ke server.
          </p>
          {hasStoredData ? (
            <Notice variant="info">
              Akun ini sudah memiliki catatan. Catatan lama tetap dipertahankan dan tidak digabung
              atau ditimpa otomatis.
            </Notice>
          ) : (
            <Button variant="secondary" onClick={() => setMigrationOpen(true)}>
              Pindahkan catatan lama
            </Button>
          )}
        </section>
      )}
      <Dialog
        open={migrationOpen}
        title="Pindahkan catatan lama ke akun ini?"
        onClose={() => !migrating && setMigrationOpen(false)}
        closeDisabled={migrating}
        actions={
          <>
            <Button
              variant="secondary"
              disabled={migrating}
              onClick={() => setMigrationOpen(false)}
            >
              Batal
            </Button>
            <Button
              pending={migrating}
              onClick={async () => {
                setMigrating(true);
                const result = await migrateLegacyRecords(storageAdapter);
                setMigrating(false);
                setMigrationOpen(false);
                setStatusNotice({
                  variant: result.ok ? (result.sourceRetained ? 'warning' : 'success') : 'danger',
                  message: result.message,
                });
                checkStored();
              }}
            >
              Ya, pindahkan catatan milikku
            </Button>
          </>
        }
      >
        <p>
          Pastikan catatan yang dibuat sebelum login diwajibkan memang milikmu. Catatan akan
          dipindahkan ke akun yang sedang masuk di perangkat ini. Salinan lama dihapus hanya setelah
          penyimpanan baru berhasil. Akun ini harus belum memiliki catatan lokal.
        </p>
      </Dialog>

      <DeleteConfirmDialog
        open={confirmOpen}
        mode="all"
        pending={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDeleteAll}
      />
    </div>
  );
}
