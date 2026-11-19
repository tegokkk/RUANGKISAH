import { PageHeader } from '@/components/ui/PageHeader';
import { useOpenDemo } from '@/hooks/useOpenDemo';
import { ArrowRightIcon } from '@/assets/icons/Icons';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { useAppData } from '@/features/demo/AppDataContext';
import styles from './AboutPage.module.css';

export function AboutPage() {
  const { isDemo } = useAppData();
  const handleOpenDemo = useOpenDemo();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Ruang kecil untuk mengenali diri."
        description="RUANGKISAH.ID merupakan bagian dari program Selfcare-BK sebagai media pendamping Bimbingan dan Konseling bagi siswa/siswi lintas sekolah. Setelah email terverifikasi, akun disetujui Admin, dan kamu masuk, kamu dapat menggunakan aktivitas secara mandiri dari mana pun."
        eyebrow="Tentang &amp; Cara Pakai"
      ></PageHeader>

      <section data-reveal className={styles.card}>
        <h2 className={styles.cardTitle}>Tiga ruang refleksi mandiri</h2>
        <p className={styles.cardText}>
          Website ini membantumu mengenali kekuatan lewat <strong>Kenali Diriku</strong>,
          mengungkapkan pengalaman emosional melalui <strong>Jurnal Perasaan</strong>, serta mencoba
          tindakan kecil sesuai kesiapan melalui <strong>Langkah Berani</strong>.
        </p>
        <p className={styles.cardText}>
          Tidak ada kewajiban menyelesaikan ketiganya berurutan, dan tidak ada penilaian benar-salah
          atau skor psikologis.
        </p>
      </section>

      <section data-reveal className={styles.card}>
        <h2 className={styles.cardTitle}>Empat langkah penggunaan</h2>
        <ol className={styles.stepsList}>
          <li>
            <strong>Pilih aktivitas</strong> yang paling sesuai dengan kebutuhanmu saat ini.
          </li>
          <li>
            <strong>Isi sesuai kesiapanmu</strong>; kamu boleh melewati pertanyaan yang belum ingin
            dijawab.
          </li>
          <li>
            <strong>Tinjau rangkuman</strong> yang disusun dari jawabanmu sendiri.
          </li>
          <li>
            <strong>Pilih simpan atau akhiri</strong>: simpan di browser perangkat ini atau akhiri
            tanpa menyimpan.
          </li>
        </ol>
      </section>

      <section data-reveal className={styles.card}>
        <h2 className={styles.cardTitle}>Peran Guru BK dan batas layanan</h2>
        <p className={styles.cardText}>
          Media pendamping BK, bukan pengganti konseling. Catatan yang kamu simpan hanya berada di
          browser perangkatmu dan tidak dibaca otomatis oleh Guru BK. Jika kamu ingin berbicara
          lebih lanjut, gunakan halaman Pusat Bantuan atau temui Guru BK secara langsung di sekolah.
        </p>
        <Notice variant="info">
          Draf sementara yang belum disimpan akan hilang jika halaman di-refresh atau ditutup.
        </Notice>
      </section>

      <div className={styles.actions}>
        <Button to="/kenali-diriku" variant="primary">
          <span>Mulai Kenali Diriku</span>
          <ArrowRightIcon size={18} />
        </Button>
        <TextLink to="/pusat-bantuan">Pusat Bantuan</TextLink>
        <TextLink to="/privasi">Privasi &amp; Data</TextLink>
        {!isDemo && (
          <Button variant="secondary" onClick={handleOpenDemo}>
            Lihat contoh fiktif
          </Button>
        )}
      </div>
    </div>
  );
}
