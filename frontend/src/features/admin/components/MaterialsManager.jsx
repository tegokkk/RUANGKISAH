import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { authStore, MATERIAL_CATEGORIES } from '@/data/authStore';
import { formatIndonesianDate } from '@/utils/date';
import styles from '../AdminPanel.module.css';

const EMPTY_FORM = {
  title: '',
  category: MATERIAL_CATEGORIES[0],
  summary: '',
  content: '',
  referenceUrl: '',
  status: 'published',
};

export function MaterialsManager({ materials, loading, onReload, onFeedback }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredMaterials = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials.filter((item) => {
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.summary.toLowerCase().includes(q) &&
        !item.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [materials, search, categoryFilter, statusFilter]);

  const openCreate = () => {
    setEditingMaterial(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditingMaterial(item);
    setForm({
      title: item.title || '',
      category: item.category || MATERIAL_CATEGORIES[0],
      summary: item.summary || '',
      content: item.content || '',
      referenceUrl: item.referenceUrl || '',
      status: item.status === 'draft' ? 'draft' : 'published',
    });
    setFormError('');
    setEditorOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');
    const title = form.title.trim();
    const summary = form.summary.trim();
    const content = form.content.trim();
    const referenceUrl = form.referenceUrl.trim();
    if (title.length < 3 || title.length > 140) {
      setFormError('Judul materi harus 3-140 karakter.');
      return;
    }
    if (summary.length < 5 || summary.length > 300) {
      setFormError('Ringkasan materi harus 5-300 karakter.');
      return;
    }
    if (content.length < 10 || content.length > 12000) {
      setFormError('Isi materi harus 10-12.000 karakter.');
      return;
    }
    if (referenceUrl) {
      try {
        const parsed = new URL(referenceUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setFormError('Tautan referensi harus diawali http:// atau https://.');
          return;
        }
      } catch {
        setFormError('Format tautan referensi tidak valid.');
        return;
      }
    }

    setSaving(true);
    const payload = {
      title,
      category: form.category,
      summary,
      content,
      referenceUrl,
      status: form.status,
    };
    const res = editingMaterial
      ? await authStore.updateMaterial(editingMaterial.id, payload)
      : await authStore.createMaterial(payload);
    setSaving(false);

    if (!res.ok) {
      setFormError(res.message);
      return;
    }

    setEditorOpen(false);
    setEditingMaterial(null);
    onFeedback({
      variant: 'success',
      message: editingMaterial
        ? `Materi "${res.material.title}" berhasil diperbarui.`
        : `Materi "${res.material.title}" berhasil ditambahkan.`,
    });
    await onReload();
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    const res = await authStore.updateMaterial(item.id, {
      title: item.title,
      category: item.category,
      summary: item.summary,
      content: item.content,
      referenceUrl: item.referenceUrl || '',
      status: nextStatus,
    });
    if (res.ok) {
      onFeedback({
        variant: 'success',
        message:
          nextStatus === 'published'
            ? `Materi "${item.title}" sekarang tayang di halaman siswa.`
            : `Materi "${item.title}" dipindahkan ke draf.`,
      });
      await onReload();
    } else {
      onFeedback({ variant: 'danger', message: res.message });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await authStore.deleteMaterial(deleteTarget.id);
    setDeleting(false);
    const removedTitle = deleteTarget.title;
    setDeleteTarget(null);
    if (res.ok) {
      onFeedback({ variant: 'success', message: `Materi "${removedTitle}" berhasil dihapus.` });
      await onReload();
    } else {
      onFeedback({ variant: 'danger', message: res.message });
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="materials-admin-heading">
      <header className={styles.pageHeader}>
        <div className={styles.toolbarRow}>
          <div>
            <h1 id="materials-admin-heading" className={styles.title}>
              Kelola Materi BK
            </h1>
            <p className={styles.lead}>
              Tambahkan dan kelola materi Bimbingan &amp; Konseling. Materi berstatus{' '}
              <strong>Tayang</strong> akan langsung muncul di halaman siswa.
            </p>
          </div>
          <div className={styles.rowActions}>
            <Button to="/materi-bk" variant="secondary">
              Lihat tampilan siswa
            </Button>
            <Button onClick={openCreate}>+ Tambah Materi</Button>
          </div>
        </div>
      </header>

      <div className={styles.filtersGrid}>
        <Field
          label="Cari materi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Judul, ringkasan, atau kategori..."
        />

        <div className={styles.selectField}>
          <label htmlFor="material-category-filter" className={styles.selectLabel}>
            Kategori
          </label>
          <select
            id="material-category-filter"
            className={styles.selectControl}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua kategori</option>
            {MATERIAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectField}>
          <label htmlFor="material-status-filter" className={styles.selectLabel}>
            Status publikasi
          </label>
          <select
            id="material-status-filter"
            className={styles.selectControl}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua status</option>
            <option value="published">Tayang di siswa</option>
            <option value="draft">Draf</option>
          </select>
        </div>
      </div>

      {!loading && filteredMaterials.length === 0 ? (
        <Notice>
          {materials.length === 0
            ? 'Belum ada materi BK. Klik "+ Tambah Materi" untuk membuat materi pertama bagi siswa.'
            : 'Tidak ada materi yang sesuai filter pencarian.'}
        </Notice>
      ) : (
        <div className={styles.materialAdminList}>
          {filteredMaterials.map((item) => (
            <article key={item.id} className={styles.materialAdminCard}>
              <div className={styles.cardTop}>
                <div className={styles.materialMetaRow}>
                  <span className={styles.categoryPill}>{item.category}</span>
                  <span
                    className={`${styles.statusPill} ${
                      item.status === 'published' ? styles.statusActive : styles.statusPending
                    }`}
                  >
                    {item.status === 'published' ? 'Tayang' : 'Draf'}
                  </span>
                </div>
                <span className={styles.cardMeta}>
                  Diperbarui {formatIndonesianDate(item.updatedAt)} · oleh {item.authorName}
                </span>
              </div>

              <h2 className={styles.materialAdminTitle}>{item.title}</h2>
              <p className={styles.materialAdminSummary}>{item.summary}</p>

              <div className={styles.tableActions}>
                <button type="button" className={styles.smallBtn} onClick={() => openEdit(item)}>
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => handleToggleStatus(item)}
                >
                  {item.status === 'published' ? 'Jadikan Draf' : 'Tayangkan'}
                </button>
                <button
                  type="button"
                  className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                  onClick={() => setDeleteTarget(item)}
                >
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={editorOpen}
        onClose={() => !saving && setEditorOpen(false)}
        title={editingMaterial ? 'Edit Materi BK' : 'Tambah Materi BK Baru'}
        description="Materi berstatus Tayang akan langsung dapat dibaca oleh siswa yang sudah masuk."
      >
        <form className={styles.materialForm} onSubmit={handleSave} noValidate>
          {formError && <Notice variant="danger">{formError}</Notice>}

          <Field
            label="Judul materi"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Contoh: Cara Mengelola Cemas Sebelum Ujian"
            maxLength={140}
          />

          <div className={styles.materialFormRow}>
            <div className={styles.selectField}>
              <label htmlFor="material-editor-category" className={styles.selectLabel}>
                Kategori
              </label>
              <select
                id="material-editor-category"
                className={styles.selectControl}
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                {MATERIAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectField}>
              <label htmlFor="material-editor-status" className={styles.selectLabel}>
                Status publikasi
              </label>
              <select
                id="material-editor-status"
                className={styles.selectControl}
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="published">Tayang ke siswa</option>
                <option value="draft">Simpan sebagai draf</option>
              </select>
            </div>
          </div>

          <Field
            label="Ringkasan singkat"
            required
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
            placeholder="Ringkasan 1-2 kalimat yang tampil di kartu materi siswa."
            maxLength={300}
          />

          <Field
            label="Isi materi"
            required
            multiline
            rows={7}
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Tulis penjelasan, langkah praktis, atau refleksi singkat untuk siswa..."
            maxLength={12000}
          />

          <Field
            label="Tautan referensi tambahan (opsional)"
            type="url"
            value={form.referenceUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, referenceUrl: e.target.value }))}
            placeholder="https://..."
            maxLength={500}
          />

          <div className={styles.materialFormActions}>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => setEditorOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : editingMaterial ? 'Simpan Perubahan' : 'Simpan Materi'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Hapus materi ini?"
        description={
          deleteTarget
            ? `Materi "${deleteTarget.title}" akan dihapus permanen dan tidak lagi tampil di halaman siswa.`
            : ''
        }
        actions={
          <>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button variant="danger" disabled={deleting} onClick={handleConfirmDelete}>
              {deleting ? 'Menghapus...' : 'Ya, hapus materi'}
            </Button>
          </>
        }
      />
    </section>
  );
}
