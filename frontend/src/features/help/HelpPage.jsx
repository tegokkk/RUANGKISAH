import { PageHeader } from '@/components/ui/PageHeader';
import { useState } from 'react';
import { ExternalLinkIcon } from '@/assets/icons/Icons';
import { ExternalChannelDialog } from '@/components/reflection/ActionDialogs';
import { Button } from '@/components/ui/Button';
import { FAQAccordion } from '@/components/ui/FAQAccordion';
import { Notice } from '@/components/ui/Notice';
import { getHelpConfiguration } from '@/config/helpConfig';
import { HELP_FAQ } from '@/content/helpFaq';
import { useAppData } from '@/features/demo/AppDataContext';
import styles from './HelpPage.module.css';

export function HelpPage() {
  const { isDemo } = useAppData();
  const config = getHelpConfiguration({ isDemo });
  const [pendingChannel, setPendingChannel] = useState(null);

  const handleProceedExternal = () => {
    if (!pendingChannel) return;
    window.open(pendingChannel.href, '_blank', 'noopener,noreferrer');
    setPendingChannel(null);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        className={styles.intro}
        id="help-title"
        title="Kamu boleh mencari dukungan."
        description="Terbuka untuk siswa/siswi dari sekolah mana pun. Kamu dapat mencari dukungan Guru BK di sekolahmu atau pendamping tepercaya."
      />

      <Notice variant="info" title="Batas layanan">
        Website ini membantu refleksi mandiri dan tidak menyediakan percakapan langsung atau
        pemantauan jurnal. Guru BK tidak otomatis membaca catatanmu.
      </Notice>

      <section data-reveal className={styles.contactCard} aria-labelledby="contact-heading">
        <h2 id="contact-heading" className={styles.sectionTitle}>
          Pilihan pendampingan
        </h2>

        {isDemo && (
          <Notice variant="info">
            Dalam mode contoh fiktif, kontak Guru BK dinonaktifkan agar tidak mengarah ke kanal
            nyata.
          </Notice>
        )}

        {!config.isConfigured ? (
          <p className={styles.lead}>
            Kontak pendamping platform belum tersedia. Temui Guru BK di sekolahmu atau orang dewasa
            tepercaya untuk mendapatkan dukungan.
          </p>
        ) : (
          <>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Peran / Kontak</p>
                <p className={styles.metaValue}>
                  {config.contactLabel}
                  {config.schoolLabel ? ' · ' + config.schoolLabel : ''}
                </p>
              </div>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Jam layanan</p>
                <p className={styles.metaValue}>
                  {config.serviceHours || 'Tanyakan ketersediaan kepada pendamping'} (
                  {config.timeZone})
                </p>
              </div>
              {config.verifiedAt && (
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Terakhir diperiksa</p>
                  <p className={styles.metaValue}>{config.verifiedAt}</p>
                </div>
              )}
              {config.channels.map((ch) => (
                <div key={ch.id} className={styles.metaItem}>
                  <p className={styles.metaLabel}>{ch.label}</p>
                  <p className={styles.metaValue}>{ch.displayAddress}</p>
                </div>
              ))}
            </div>

            <div className={styles.channelActions}>
              {config.channels.map((ch) => (
                <Button key={ch.id} variant="primary" onClick={() => setPendingChannel(ch)}>
                  <span>{ch.actionLabel}</span>
                  <ExternalLinkIcon size={16} />
                </Button>
              ))}
            </div>

            <p className={styles.lead} style={{ fontSize: '0.875rem' }}>
              Membuka kanal luar memerlukan koneksi jaringan. Jika aplikasi tidak terpasang, kamu
              tetap dapat menyalin alamat kontak di atas secara manual.
            </p>
          </>
        )}
      </section>

      <section data-reveal aria-labelledby="faq-heading">
        <h2 id="faq-heading" className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>
          Pertanyaan yang sering ditanyakan
        </h2>
        <FAQAccordion items={HELP_FAQ} />
      </section>

      <ExternalChannelDialog
        open={Boolean(pendingChannel)}
        channel={pendingChannel}
        onCancel={() => setPendingChannel(null)}
        onProceed={handleProceedExternal}
      />
    </div>
  );
}
