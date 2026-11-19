import { useHeadingFocus } from '@/hooks/useHeadingFocus';
import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons/Icons';
import {
  CorruptDataDialog,
  LeaveDraftDialog,
  SaveConfirmDialog,
} from '@/components/reflection/ActionDialogs';
import { StorageNotice } from '@/components/reflection/StorageNotice';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { APP_CONFIG } from '@/config/appConfig';
import { FEELING_OPTIONS, JOURNAL_PROMPTS } from '@/content/feelingOptions';
import { RECORD_TYPES } from '@/data/schema';
import { validateJournalPayload } from '@/data/validators';
import { useAppData } from '@/features/demo/AppDataContext';
import { JournalSummaryView } from '@/features/feeling-journal/components/JournalSummaryView';
import { useUnsavedDraftGuard } from '@/hooks/useUnsavedDraftGuard';
import { getLocalTodayISO, isFutureLocalDate, isValidISODate } from '@/utils/date';
import styles from './FeelingJournalPage.module.css';

function createInitialJournal() {
  return {
    entryDate: getLocalTodayISO(),
    feelings: [],
    situation: '',
    response: '',
    needs: '',
    smallAction: '',
  };
}

export function FeelingJournalPage() {
  const { isDemo, repository } = useAppData();

  const [phase, setPhase] = useState('form'); // 'form' | 'summary' | 'ended'
  const [draft, setDraft] = useState(createInitialJournal);
  const [dateError, setDateError] = useState('');
  const [formError, setFormError] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [corruptOpen, setCorruptOpen] = useState(false);

  const headingRoot = useHeadingFocus(phase);

  const totalTextLength =
    draft.situation.length + draft.response.length + draft.needs.length + draft.smallAction.length;
  const maxTotal = APP_CONFIG.limits.journalTotalTextMax;
  const isOverTotal = totalTextLength > maxTotal;

  const hasContent =
    draft.feelings.length > 0 ||
    draft.situation.trim().length > 0 ||
    draft.response.trim().length > 0 ||
    draft.needs.trim().length > 0 ||
    draft.smallAction.trim().length > 0;

  const hasUnsavedDraft =
    (phase === 'form' || phase === 'summary') && hasContent && saveStatus !== 'saved';

  const blocker = useUnsavedDraftGuard(hasUnsavedDraft);

  const handleToggleFeeling = (id) => {
    setDraft((prev) => {
      const exists = prev.feelings.includes(id);
      return {
        ...prev,
        feelings: exists ? prev.feelings.filter((f) => f !== id) : [...prev.feelings, id],
      };
    });
    setFormError('');
  };

  const handleDateChange = (value) => {
    setDraft((prev) => ({ ...prev, entryDate: value }));
    if (!isValidISODate(value)) {
      setDateError('Tanggal jurnal tidak valid.');
    } else if (isFutureLocalDate(value)) {
      setDateError('Tanggal jurnal tidak boleh di masa depan.');
    } else {
      setDateError('');
    }
    setFormError('');
  };

  const handleTextChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setFormError('');
    if (saveStatus === 'error') {
      setSaveStatus(null);
      setStorageError(null);
    }
  };

  const handleViewSummary = (e) => {
    e.preventDefault();
    if (!isValidISODate(draft.entryDate)) {
      setDateError('Tanggal jurnal tidak valid.');
      return;
    }
    if (isFutureLocalDate(draft.entryDate)) {
      setDateError('Tanggal jurnal tidak boleh di masa depan.');
      return;
    }
    setDateError('');

    const check = validateJournalPayload(draft);
    if (!check.ok) {
      setFormError(check.message);
      return;
    }

    setFormError('');
    setPhase('summary');
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    setStorageError(null);
    const result = await repository.saveNewRecord(RECORD_TYPES.JOURNAL, draft);
    setSaving(false);
    setSaveDialogOpen(false);

    if (result.ok) {
      setSaveStatus(isDemo ? 'demo_saved' : 'saved');
      return;
    }

    if (result.errorCode === 'CORRUPT_DATA' || result.errorCode === 'UNSUPPORTED_VERSION') {
      setCorruptOpen(true);
      return;
    }

    setSaveStatus('error');
    setStorageError(result);
  };

  const handleEndWithoutSaving = () => {
    setDraft(createInitialJournal());
    setDateError('');
    setFormError('');
    setSaveStatus(null);
    setStorageError(null);
    setPhase('ended');
  };

  return (
    <div ref={headingRoot} className={styles.page}>
      {phase === 'form' && (
        <>
          <section className={styles.introBanner} aria-labelledby="journal-title">
            <div className={styles.topRow}>
              <h1 id="journal-title" className={styles.title}>
                Bagaimana perasaanmu hari ini?
              </h1>
              <StorageNotice status={isDemo ? 'demo' : 'temporary'} />
            </div>
            <p className={styles.lead}>
              Kamu boleh bercerita sedikit, banyak, atau melewati bagian yang belum ingin diisi.
            </p>
          </section>

          <form className={styles.formCard} onSubmit={handleViewSummary} noValidate>
            <Field
              label="Tanggal jurnal"
              type="date"
              value={draft.entryDate}
              max={getLocalTodayISO()}
              onChange={(e) => handleDateChange(e.target.value)}
              error={dateError}
              helper="Tanggal lokal perangkat. Kamu boleh memilih hari ini atau tanggal sebelumnya."
            />

            <div className={styles.chipsSection}>
              <div className={styles.chipsHeader}>
                <span className={styles.chipsLabel}>Perasaan yang paling dekat denganmu</span>
                <span className={styles.optionalBadge}>Opsional</span>
              </div>
              <p className={styles.chipsHelper}>Boleh pilih lebih dari satu.</p>
              <div className={styles.chipsGrid}>
                {FEELING_OPTIONS.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    selected={draft.feelings.includes(item.id)}
                    onToggle={() => handleToggleFeeling(item.id)}
                  />
                ))}
              </div>
            </div>

            {JOURNAL_PROMPTS.map((prompt) => (
              <Field
                key={prompt.id}
                label={prompt.label}
                optional
                multiline
                value={draft[prompt.id]}
                onChange={(e) => handleTextChange(prompt.id, e.target.value)}
                helper={prompt.helper}
                placeholder={prompt.placeholder}
              />
            ))}

            <div className={styles.totalCounterRow}>
              <span>Batas total seluruh teks cerita jurnal adalah 5.000 karakter.</span>
              <span className={isOverTotal ? styles.counterOver : ''}>
                {totalTextLength.toLocaleString('id-ID')}/{maxTotal.toLocaleString('id-ID')}{' '}
                karakter
              </span>
            </div>

            {formError && <Notice variant="warning">{formError}</Notice>}

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={handleEndWithoutSaving}>
                Akhiri tanpa menyimpan
              </Button>
              <Button type="submit" variant="primary">
                <span>Lihat rangkuman</span>
                <ArrowRightIcon size={18} />
              </Button>
            </div>
          </form>
        </>
      )}

      {phase === 'summary' && (
        <>
          <div className={styles.topRow}>
            <h1 className={styles.title}>Ruang untuk memahami perasaanmu.</h1>
            <StorageNotice
              status={saveStatus === 'saved' ? 'saved' : isDemo ? 'demo' : 'temporary'}
            />
          </div>

          <JournalSummaryView entry={draft} />

          <p className={styles.closingNote}>
            Kamu boleh kembali ke catatan ini untuk mengenali pengalamanmu.
          </p>

          {saveStatus === 'saved' && (
            <Notice
              variant="success"
              title="Tersimpan di browser perangkat ini"
              actions={
                <Button to="/catatan-saya" variant="primary">
                  Buka Catatan Saya
                </Button>
              }
            >
              Catatan tidak disinkronkan ke perangkat lain.
            </Notice>
          )}

          {saveStatus === 'demo_saved' && (
            <Notice variant="success" title="Simulasi selesai. Tidak ada data disimpan.">
              Pada mode contoh fiktif, tidak ada data yang ditulis ke penyimpanan pribadimu.
            </Notice>
          )}

          {saveStatus === 'error' && storageError && (
            <Notice
              variant="warning"
              title="Belum tersimpan"
              actions={
                <>
                  {storageError.errorCode === 'LIMIT_EXCEEDED' ? (
                    <Button to="/catatan-saya" variant="primary">
                      Buka Catatan Saya
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => setSaveDialogOpen(true)}>
                      Coba lagi
                    </Button>
                  )}
                  <Button variant="secondary" onClick={handleEndWithoutSaving}>
                    Lanjut tanpa menyimpan
                  </Button>
                </>
              }
            >
              {storageError.message}
            </Notice>
          )}

          {saveStatus !== 'saved' && (
            <>
              <div>
                <Button variant="ghost" onClick={() => setPhase('form')}>
                  <ArrowLeftIcon size={18} />
                  <span>Ubah catatan</span>
                </Button>
              </div>

              <div className={styles.finalChoices}>
                <Button variant="primary" onClick={() => setSaveDialogOpen(true)}>
                  {isDemo ? 'Coba alur simpan (simulasi)' : 'Simpan di perangkat ini'}
                </Button>
                <Button variant="secondary" onClick={handleEndWithoutSaving}>
                  Akhiri tanpa menyimpan
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {phase === 'ended' && (
        <section className={styles.formCard}>
          <h1 className={styles.title}>Isian sementara telah dibersihkan dari aplikasi.</h1>
          <p className={styles.lead}>Tidak ada catatan jurnal yang disimpan pada perangkat ini.</p>
          <div className={styles.formActions}>
            <Button to="/" variant="primary">
              Kembali ke Beranda
            </Button>
            <Button variant="secondary" onClick={() => setPhase('form')}>
              Tulis jurnal baru
            </Button>
          </div>
        </section>
      )}

      <SaveConfirmDialog
        open={saveDialogOpen}
        isDemo={isDemo}
        pending={saving}
        onCancel={() => setSaveDialogOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <LeaveDraftDialog
        open={blocker.state === 'blocked'}
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />

      <CorruptDataDialog
        open={corruptOpen}
        onClose={() => setCorruptOpen(false)}
        onReviewReset={() => {
          setCorruptOpen(false);
          handleEndWithoutSaving();
        }}
      />
    </div>
  );
}
