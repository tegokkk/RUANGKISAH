import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, ExternalLinkIcon } from '@/assets/icons/Icons';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { authStore, MATERIAL_CATEGORIES } from '@/data/authStore';
import { useHeadingFocus } from '@/hooks/useHeadingFocus';
import { formatIndonesianDate } from '@/utils/date';
import styles from './MaterialsPage.module.css';

export function MaterialsPage() {
  const headingRef = useHeadingFocus();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeMaterial, setActiveMaterial] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await authStore.listStudentMaterials();
      if (cancelled) return;
      if (res.ok) {
        setMaterials(res.materials || []);
        setError('');
      } else {
        setError(res.message || 'Gagal memuat daftar materi BK.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.summary.toLowerCase().includes(q) &&
        !item.content.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [materials, search, selectedCategory]);

  if (activeMaterial) {
    const paragraphs = activeMaterial.content
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);

    return (
      <div className={styles.page}>
        <div className={styles.backRow}>
          <Button variant="secondary" onClick={() => setActiveMaterial(null)}>
            <ArrowLeftIcon size={18} />
            <span>Kembali ke daftar materi</span>
          </Button>
        </div>

        <article className={styles.readerCard} aria-labelledby="material-reader-title">
          <div className={styles.readerMetaTop}>
            <span className={styles.categoryBadge}>{activeMaterial.category}</span>
            <span className={styles.metaText}>
              Diperbarui {formatIndonesianDate(activeMaterial.updatedAt)} · Oleh{' '}
              {activeMaterial.authorName}
            </span>
          </div>

          <h1 id="material-reader-title" className={styles.readerTitle}>
            {activeMaterial.title}
          </h1>
          <p className={styles.readerSummary}>{activeMaterial.summary}</p>

          <div className={styles.readerBody}>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={styles.readerParagraph}>
                {paragraph}
              </p>
            ))}
          </div>

          {activeMaterial.referenceUrl && (
            <div className={styles.referenceBox}>
              <div>
                <p className={styles.referenceLabel}>Tautan referensi tambahan</p>
                <p className={styles.referenceUrl}>{activeMaterial.referenceUrl}</p>
              </div>
              <a
                href={activeMaterial.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.referenceLink}
              >
                <span>Buka tautan</span>
                <ExternalLinkIcon size={16} />
              </a>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        headingRef={headingRef}
        eyebrow="MATERI BIMBINGAN & KONSELING"
        title="Materi BK"
        subtitle="Bacaan singkat, panduan refleksi, dan tips praktis dari Guru BK untuk mendampingi langkahmu."
      />

      {error && <Notice variant="danger">{error}</Notice>}

      <section className={styles.controlsCard} aria-label="Pencarian dan filter materi">
        <Field
          label="Cari materi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau topik materi..."
        />

        <div className={styles.categoryRow} role="group" aria-label="Filter kategori materi">
          <button
            type="button"
            className={`${styles.categoryChip} ${
              selectedCategory === 'all' ? styles.categoryChipActive : ''
            }`}
            aria-pressed={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          >
            Semua ({materials.length})
          </button>
          {MATERIAL_CATEGORIES.map((category) => {
            const count = materials.filter((item) => item.category === category).length;
            if (count === 0) return null;
            return (
              <button
                key={category}
                type="button"
                className={`${styles.categoryChip} ${
                  selectedCategory === category ? styles.categoryChipActive : ''
                }`}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <p role="status" className={styles.loadingText}>
          Memuat materi BK...
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpenIcon size={24} />}
          title={materials.length === 0 ? 'Belum ada materi BK tersedia' : 'Materi tidak ditemukan'}
          description={
            materials.length === 0
              ? 'Guru BK atau pengelola belum menayangkan materi baru. Cek kembali nanti atau mulai aktivitas refleksi di menu lain.'
              : 'Coba ubah kata kunci pencarian atau pilih kategori lain.'
          }
          action={
            materials.length > 0 ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
              >
                Reset filter
              </Button>
            ) : (
              <Button to="/kenali-diriku">Buka Kenali Diriku</Button>
            )
          }
        />
      ) : (
        <section className={styles.grid} aria-label="Daftar materi BK">
          {filtered.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.categoryBadge}>{item.category}</span>
                <span className={styles.cardDate}>{formatIndonesianDate(item.updatedAt)}</span>
              </div>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardSummary}>{item.summary}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardAuthor}>Oleh {item.authorName}</span>
                <button
                  type="button"
                  className={styles.readBtn}
                  onClick={() => setActiveMaterial(item)}
                >
                  <span>Baca materi</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
