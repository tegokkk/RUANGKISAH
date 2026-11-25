import { useAuth } from '@/features/auth/AuthContext';
import {
  ArrowRightIcon,
  BookOpenIcon,
  FootprintIcon,
  HeartNoteIcon,
  ShieldIcon,
} from '@/assets/icons/Icons';
import { ActivityCard } from '@/components/reflection/ActivityCard';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import styles from './HomePage.module.css';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} aria-hidden="true" />
            <span>SELFCARE-BK · RUANG REFLEKSI</span>
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            Kenali diri.
            <br />
            <span className={styles.heroAccent}>Tumbuh berani.</span>
          </h1>

          <p className={styles.heroSub}>
            Ruang untuk memahami perasaan, mengenali kekuatan, dan mencoba langkah kecil sesuai
            kesiapanmu.
          </p>

          <div className={styles.heroActions}>
            <Button to="/kenali-diriku" variant="pistachio">
              <span>Mulai refleksi</span>
              <ArrowRightIcon size={18} />
            </Button>
            <TextLink to="/tentang" onDark>
              Lihat cara pakai
            </TextLink>
          </div>

          <p className={styles.heroNote}>
            {isAuthenticated
              ? 'Kamu sudah masuk. Catatan hanya disimpan jika kamu memilihnya.'
              : 'Masuk untuk mulai. Kamu yang memilih apakah ingin menyimpan catatan.'}
          </p>
        </div>
      </section>

      <section data-reveal className={styles.section} aria-labelledby="modules-heading">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Modul utama</p>
            <h2 id="modules-heading" className={styles.sectionTitle}>
              Mulai dari yang kamu butuhkan.
            </h2>
          </div>
          <p className={styles.sectionSub}>
            Setiap ruang dirancang tanpa tekanan durasi dan tidak harus dikerjakan berurutan.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <ActivityCard
            number="01"
            title="Kenali Diriku"
            description="Kenali kekuatan, minat, nilai diri, dan tujuan kecilmu melalui enam pertanyaan yang boleh dilewati."
            metaLabel="6 pertanyaan · ~5-10 menit"
            ctaLabel="Buka Kenali Diriku"
            to="/kenali-diriku"
            tone="pistachio"
            icon={<BookOpenIcon size={20} />}
          />

          <ActivityCard
            number="02"
            title="Jurnal Perasaan"
            description="Ungkapkan apa yang sedang kamu alami tanpa penilaian, lengkap dengan pilihan perasaan yang netral."
            metaLabel="Sesuai waktumu"
            ctaLabel="Tulis Jurnal"
            to="/jurnal-perasaan"
            tone="frost"
            icon={<HeartNoteIcon size={20} />}
          />

          <ActivityCard
            number="03"
            title="Langkah Berani"
            description="Pilih contoh latihan atau buat target kecil sendiri untuk melatih keberanian sesuai kesiapanmu."
            metaLabel="Sesuai waktumu"
            ctaLabel="Pilih Langkah"
            to="/langkah-berani"
            tone="denim"
            icon={<FootprintIcon size={20} />}
          />
        </div>
      </section>

      <section data-reveal className={styles.stepsPanel} aria-labelledby="howto-heading">
        <div>
          <p className={styles.eyebrow}>Cara pakai</p>
          <h2 id="howto-heading" className={styles.sectionTitle}>
            Tiga langkah sederhana
          </h2>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>1</span>
            <h3 className={styles.stepTitle}>Pilih ruangmu</h3>
            <p className={styles.stepDesc}>
              Mulai dari mengenali diri, mencatat perasaan hari ini, atau menentukan target kecil.
            </p>
          </div>

          <div className={styles.stepItem}>
            <span className={styles.stepNum}>2</span>
            <h3 className={styles.stepTitle}>Isi sesuai kesiapanmu</h3>
            <p className={styles.stepDesc}>
              Tidak ada jawaban benar atau salah. Kamu boleh melewati pertanyaan yang belum ingin
              dijawab.
            </p>
          </div>

          <div className={styles.stepItem}>
            <span className={`${styles.stepNum} ${styles.stepNumHighlight}`}>3</span>
            <h3 className={styles.stepTitle}>Tinjau dan tentukan pilihanmu</h3>
            <p className={styles.stepDesc}>
              Baca rangkuman jawabanmu, lalu pilih apakah ingin menyimpan di browser ini atau akhiri
              tanpa menyimpan.
            </p>
          </div>
        </div>
      </section>

      <section data-reveal className={styles.privacyPanel} aria-labelledby="privacy-home-heading">
        <div className={styles.privacyLeft}>
          <ShieldIcon size={24} />
          <h2 id="privacy-home-heading" className={styles.privacyTitle}>
            Cerita ini tetap dalam kendalimu.
          </h2>
          <TextLink to="/privasi">Kenali pilihan data</TextLink>
        </div>

        <div className={styles.privacyRight}>
          <div className={styles.privacyBox}>
            <h3 className={styles.privacyBoxTitle}>Tanpa menyimpan (default)</h3>
            <p className={styles.privacyBoxText}>
              Isian baru bersifat sementara di memori halaman. Jika diakhiri atau di-refresh, isian
              sementara dibersihkan.
            </p>
          </div>

          <div className={styles.privacyBox}>
            <h3 className={styles.privacyBoxTitle}>Simpan di perangkat ini</h3>
            <p className={styles.privacyBoxText}>
              Hanya tersimpan di browser ini setelah konfirmasimu. Tidak dikirim ke server atau
              dibaca otomatis oleh Guru BK.
            </p>
          </div>
        </div>
      </section>

      <section data-reveal className={styles.helpPanel} aria-labelledby="help-home-heading">
        <div className={styles.helpText}>
          <h2 id="help-home-heading" className={styles.helpTitle}>
            Butuh teman bicara?
          </h2>
          <p className={styles.helpDesc}>
            RUANGKISAH adalah media pendamping BK. Jika kamu ingin berbicara lebih lanjut, Guru BK
            dapat mendampingimu melalui jalur yang tersedia di sekolah.
          </p>
        </div>

        <Button to="/pusat-bantuan" variant="ink">
          <span>Buka Pusat Bantuan</span>
          <ArrowRightIcon size={18} />
        </Button>
      </section>
    </div>
  );
}
