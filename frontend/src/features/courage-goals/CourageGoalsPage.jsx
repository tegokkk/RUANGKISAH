import { useHeadingFocus } from '@/hooks/useHeadingFocus';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons/Icons';
import {
  CorruptDataDialog,
  DeleteConfirmDialog,
  LeaveDraftDialog,
  SaveConfirmDialog,
} from '@/components/reflection/ActionDialogs';
import { RecordRow } from '@/components/reflection/RecordRow';
import { StorageNotice } from '@/components/reflection/StorageNotice';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { APP_CONFIG } from '@/config/appConfig';
import { COURAGE_EXAMPLES } from '@/content/courageExamples';
import { RECORD_TYPES, RECORD_TYPE_LABELS } from '@/data/schema';
import { validateGoalPayload } from '@/data/validators';
import { subscribeDataChanges } from '@/data/writeCoordinator';
import { GoalDetailView } from '@/features/courage-goals/components/GoalDetailView';
import { useAppData } from '@/features/demo/AppDataContext';
import { useUnsavedDraftGuard } from '@/hooks/useUnsavedDraftGuard';
import styles from './CourageGoalsPage.module.css';

function createEmptyGoal() {
  return {
    title: '',
    firstStep: '',
    reason: '',
    targetDate: '',
    support: '',
    status: 'planned',
    afterReflection: '',
  };
}

export function CourageGoalsPage() {
  const { isDemo, repository } = useAppData();

  const [phase, setPhase] = useState('intro'); // 'intro' | 'form' | 'detail' | 'ended'
  const [draft, setDraft] = useState(createEmptyGoal);
  const [savedRecord, setSavedRecord] = useState(null);
  const [savedGoalsList, setSavedGoalsList] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [reflectionError, setReflectionError] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveBackOpen, setLeaveBackOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [tabConflict, setTabConflict] = useState(null);
  const [deletedElsewhere, setDeletedElsewhere] = useState(false);
  const [corruptOpen, setCorruptOpen] = useState(false);

  const headingRoot = useHeadingFocus(phase);

  const loadGoals = useCallback(() => {
    const res = repository.listGoals();
    if (res.ok) {
      setSavedGoalsList(res.goals);
    }
  }, [repository]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    if (isDemo) return undefined;
    return subscribeDataChanges(() => {
      loadGoals();
      if (savedRecord) {
        const latest = repository.getRecordById(RECORD_TYPES.GOAL, savedRecord.id);
        if (!latest.ok && latest.errorCode === 'NOT_FOUND') {
          setDeletedElsewhere(true);
        }
      }
    });
  }, [isDemo, loadGoals, repository, savedRecord]);

  const isSavedRecord = Boolean(savedRecord);
  const isDirtySaved =
    isSavedRecord &&
    (draft.title !== savedRecord.title ||
      draft.firstStep !== savedRecord.firstStep ||
      (draft.reason || '') !== (savedRecord.reason || '') ||
      (draft.targetDate || '') !== (savedRecord.targetDate || '') ||
      (draft.support || '') !== (savedRecord.support || '') ||
      draft.status !== savedRecord.status ||
      (draft.afterReflection || '') !== (savedRecord.afterReflection || ''));

  const hasNewUnsavedText =
    !isSavedRecord &&
    (phase === 'form' || phase === 'detail') &&
    (draft.title.trim().length > 0 || draft.firstStep.trim().length > 0) &&
    saveStatus !== 'saved';

  const shouldGuardNavigation = hasNewUnsavedText || isDirtySaved;
  const blocker = useUnsavedDraftGuard(shouldGuardNavigation);

  const handleUseExample = (example) => {
    setSavedRecord(null);
    setDeletedElsewhere(false);
    setTabConflict(null);
    setSaveStatus(null);
    setStorageError(null);
    setFieldErrors({});
    setDraft({
      ...createEmptyGoal(),
      title: example.title,
      firstStep: example.firstStep,
      reason: example.reason,
      support: example.support,
    });
    setPhase('form');
  };

  const handleCreateOwn = () => {
    setSavedRecord(null);
    setDeletedElsewhere(false);
    setTabConflict(null);
    setSaveStatus(null);
    setStorageError(null);
    setFieldErrors({});
    setDraft(createEmptyGoal());
    setPhase('form');
  };

  const validateFormFields = () => {
    const errors = {};
    const { limits } = APP_CONFIG;

    if (!draft.title.trim()) {
      errors.title = 'Judul target wajib diisi.';
    } else if (draft.title.length > limits.goalTitleMax) {
      errors.title = `Judul target maksimal ${limits.goalTitleMax} karakter.`;
    }

    if (!draft.firstStep.trim()) {
      errors.firstStep = 'Langkah pertama wajib diisi.';
    } else if (draft.firstStep.length > limits.goalFirstStepMax) {
      errors.firstStep = `Langkah pertama maksimal ${limits.goalFirstStepMax} karakter.`;
    }

    if (draft.reason.length > limits.goalReasonMax) {
      errors.reason = `Alasan maksimal ${limits.goalReasonMax} karakter.`;
    }

    if (draft.support.length > limits.goalSupportMax) {
      errors.support = `Dukungan maksimal ${limits.goalSupportMax} karakter.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validateFormFields()) return;
    setPhase('detail');
  };

  const handleOpenSavedGoal = (summary) => {
    const res = repository.getRecordById(RECORD_TYPES.GOAL, summary.id);
    if (!res.ok) {
      loadGoals();
      return;
    }
    setSavedRecord(res.record);
    setDeletedElsewhere(false);
    setTabConflict(null);
    setSaveStatus(null);
    setStorageError(null);
    setDraft({
      title: res.record.title,
      firstStep: res.record.firstStep,
      reason: res.record.reason || '',
      targetDate: res.record.targetDate || '',
      support: res.record.support || '',
      status: res.record.status,
      afterReflection: res.record.afterReflection || '',
    });
    setPhase('detail');
  };

  const handleConfirmSave = async () => {
    const check = validateGoalPayload(draft);
    if (!check.ok) {
      setReflectionError(check.message);
      setSaveDialogOpen(false);
      return;
    }

    setSaving(true);
    setStorageError(null);

    const result = isSavedRecord
      ? await repository.updateRecord(
          RECORD_TYPES.GOAL,
          savedRecord.id,
          savedRecord.revision,
          draft
        )
      : await repository.saveNewRecord(RECORD_TYPES.GOAL, draft);

    setSaving(false);
    setSaveDialogOpen(false);

    if (result.ok) {
      setSavedRecord(result.record);
      setSaveStatus(isDemo ? 'demo_saved' : 'saved');
      setTabConflict(null);
      loadGoals();
      return;
    }

    if (result.errorCode === 'TAB_CONFLICT') {
      setTabConflict(result.latestRecord);
      return;
    }

    if (result.errorCode === 'DELETED_ELSEWHERE') {
      setDeletedElsewhere(true);
      return;
    }

    if (result.errorCode === 'CORRUPT_DATA' || result.errorCode === 'UNSUPPORTED_VERSION') {
      setCorruptOpen(true);
      return;
    }

    setSaveStatus('error');
    setStorageError(result);
  };

  const handleConfirmDelete = async () => {
    if (!savedRecord) return;
    setDeleting(true);
    const result = await repository.deleteRecord(RECORD_TYPES.GOAL, savedRecord.id);
    setDeleting(false);
    setDeleteDialogOpen(false);

    if (result.ok) {
      setSavedRecord(null);
      setDraft(createEmptyGoal());
      loadGoals();
      setPhase('intro');
    } else {
      setSaveStatus('error');
      setStorageError(result);
    }
  };

  const handleEndWithoutSaving = () => {
    setSavedRecord(null);
    setDraft(createEmptyGoal());
    setSaveStatus(null);
    setStorageError(null);
    setPhase('ended');
  };

  return (
    <div ref={headingRoot} className={styles.page}>
      {phase === 'intro' && (
        <>
          <section className={styles.introBanner} aria-labelledby="courage-title">
            <h1 id="courage-title" className={styles.title}>
              Keberanian dimulai dari satu langkah.
            </h1>
            <p className={styles.lead}>
              Pilih langkah kecil yang sesuai kesiapanmu. Kamu boleh menyesuaikannya kapan saja.
            </p>
            <Button variant="ink" onClick={handleCreateOwn}>
              <span>Buat target sendiri</span>
              <ArrowRightIcon size={18} />
            </Button>
          </section>

          <section aria-labelledby="examples-heading">
            <h2 id="examples-heading" className={styles.sectionTitle}>
              Contoh latihan Langkah Berani
            </h2>
            <div className={styles.examplesGrid} style={{ marginTop: '1rem' }}>
              {COURAGE_EXAMPLES.map((ex) => (
                <article key={ex.id} className={styles.exampleCard}>
                  <div>
                    <h3 className={styles.exampleTitle}>{ex.title}</h3>
                    <p className={styles.exampleStep}>{ex.firstStep}</p>
                  </div>
                  <div>
                    <Button variant="secondary" onClick={() => handleUseExample(ex)}>
                      Pakai contoh ini
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="saved-goals-heading">
            <h2 id="saved-goals-heading" className={styles.sectionTitle}>
              Target yang kamu simpan
            </h2>
            <div className={styles.savedList} style={{ marginTop: '1rem' }}>
              {savedGoalsList.length === 0 ? (
                <EmptyState
                  title="Belum ada target tersimpan di browser ini."
                  description="Target yang kamu buat bersifat sementara sampai kamu memilih menyimpannya."
                />
              ) : (
                savedGoalsList.map((goal) => (
                  <RecordRow
                    key={goal.id}
                    recordSummary={{
                      id: goal.id,
                      type: RECORD_TYPES.GOAL,
                      typeLabel: RECORD_TYPE_LABELS[RECORD_TYPES.GOAL],
                      updatedAt: goal.updatedAt,
                    }}
                    onOpen={handleOpenSavedGoal}
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}

      {phase === 'form' && (
        <div className={styles.writingWrap}>
          <div className={styles.topBar}>
            <Button
              variant="ghost"
              onClick={() => {
                if (shouldGuardNavigation) {
                  setLeaveBackOpen(true);
                } else {
                  setPhase('intro');
                }
              }}
            >
              <ArrowLeftIcon size={18} />
              <span>Kembali ke pilihan</span>
            </Button>
            <StorageNotice
              status={
                isSavedRecord ? (isDirtySaved ? 'dirty' : 'saved') : isDemo ? 'demo' : 'temporary'
              }
            />
          </div>

          <form className={styles.card} onSubmit={handleSubmitForm} noValidate>
            <h1 className={styles.title}>Satu langkah yang ingin kamu coba.</h1>
            <p className={styles.lead}>
              Kamu bisa menyesuaikan target ini kapan saja sesuai kesiapanmu.
            </p>

            <Field
              label="Judul target"
              required
              value={draft.title}
              onChange={(e) => {
                setDraft((p) => ({ ...p, title: e.target.value }));
                setFieldErrors((fe) => ({ ...fe, title: '' }));
              }}
              placeholder="Contoh: Mengajukan satu pertanyaan di kelas"
              maxCount={APP_CONFIG.limits.goalTitleMax}
              showCounter
              error={fieldErrors.title}
            />

            <Field
              label="Langkah pertama"
              required
              multiline
              rows={3}
              value={draft.firstStep}
              onChange={(e) => {
                setDraft((p) => ({ ...p, firstStep: e.target.value }));
                setFieldErrors((fe) => ({ ...fe, firstStep: '' }));
              }}
              placeholder="Tindakan paling kecil yang bisa kamu lakukan lebih dulu..."
              maxCount={APP_CONFIG.limits.goalFirstStepMax}
              showCounter
              error={fieldErrors.firstStep}
            />

            <Field
              label="Kenapa ini berarti buatmu?"
              optional
              multiline
              rows={3}
              value={draft.reason}
              onChange={(e) => {
                setDraft((p) => ({ ...p, reason: e.target.value }));
                setFieldErrors((fe) => ({ ...fe, reason: '' }));
              }}
              maxCount={APP_CONFIG.limits.goalReasonMax}
              showCounter
              error={fieldErrors.reason}
            />

            <Field
              label="Tanggal target"
              optional
              type="date"
              value={draft.targetDate}
              onChange={(e) => setDraft((p) => ({ ...p, targetDate: e.target.value }))}
              helper="Bisa diubah kapan saja; melewati tanggal tidak memberi label gagal."
            />

            <Field
              label="Dukungan yang kamu butuhkan"
              optional
              multiline
              rows={3}
              value={draft.support}
              onChange={(e) => {
                setDraft((p) => ({ ...p, support: e.target.value }));
                setFieldErrors((fe) => ({ ...fe, support: '' }));
              }}
              maxCount={APP_CONFIG.limits.goalSupportMax}
              showCounter
              error={fieldErrors.support}
            />

            <div className={styles.actionsRow}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (shouldGuardNavigation) setLeaveBackOpen(true);
                  else setPhase('intro');
                }}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary">
                <span>Tinjau target</span>
                <ArrowRightIcon size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}

      {phase === 'detail' && (
        <>
          <div className={styles.writingWrap}>
            <div className={styles.topBar}>
              <Button
                variant="ghost"
                onClick={() => {
                  if (shouldGuardNavigation) setLeaveBackOpen(true);
                  else setPhase('intro');
                }}
              >
                <ArrowLeftIcon size={18} />
                <span>Kembali ke daftar target</span>
              </Button>
              <StorageNotice
                status={
                  isSavedRecord ? (isDirtySaved ? 'dirty' : 'saved') : isDemo ? 'demo' : 'temporary'
                }
              />
            </div>

            {deletedElsewhere && (
              <Notice
                variant="warning"
                title="Catatan ini sudah dihapus dari browser ini."
                actions={
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSavedRecord(null);
                      setDeletedElsewhere(false);
                      setPhase('intro');
                    }}
                  >
                    Kembali ke daftar
                  </Button>
                }
              >
                Target ini telah dihapus di tab lain.
              </Notice>
            )}

            {tabConflict && (
              <Notice
                variant="warning"
                title="Catatan berubah di tab lain."
                actions={
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSavedRecord(tabConflict);
                        setDraft({
                          title: tabConflict.title,
                          firstStep: tabConflict.firstStep,
                          reason: tabConflict.reason || '',
                          targetDate: tabConflict.targetDate || '',
                          support: tabConflict.support || '',
                          status: tabConflict.status,
                          afterReflection: tabConflict.afterReflection || '',
                        });
                        setTabConflict(null);
                      }}
                    >
                      Muat versi terbaru
                    </Button>
                    <Button variant="secondary" onClick={() => setTabConflict(null)}>
                      Batalkan perubahan
                    </Button>
                  </>
                }
              >
                Memuat versi terbaru akan mengganti perubahan yang sedang kamu tulis.
              </Notice>
            )}
          </div>

          {!deletedElsewhere && (
            <GoalDetailView
              goal={draft}
              isSaved={isSavedRecord}
              isDirty={isDirtySaved}
              isDemo={isDemo}
              reflectionError={reflectionError}
              onChangeStatus={(status) => {
                setDraft((p) => ({ ...p, status }));
                setSaveStatus(null);
              }}
              onChangeReflection={(val) => {
                setDraft((p) => ({ ...p, afterReflection: val }));
                if (val.length <= APP_CONFIG.limits.goalAfterReflectionMax) {
                  setReflectionError('');
                }
                setSaveStatus(null);
              }}
              onEditFields={() => setPhase('form')}
              onOpenSave={() => {
                if (draft.afterReflection.length > APP_CONFIG.limits.goalAfterReflectionMax) {
                  setReflectionError(
                    `Refleksi maksimal ${APP_CONFIG.limits.goalAfterReflectionMax.toLocaleString('id-ID')} karakter.`
                  );
                  return;
                }
                setSaveDialogOpen(true);
              }}
              onCancelEdit={() => {
                if (savedRecord) {
                  setDraft({
                    title: savedRecord.title,
                    firstStep: savedRecord.firstStep,
                    reason: savedRecord.reason || '',
                    targetDate: savedRecord.targetDate || '',
                    support: savedRecord.support || '',
                    status: savedRecord.status,
                    afterReflection: savedRecord.afterReflection || '',
                  });
                  setReflectionError('');
                }
              }}
              onEndWithoutSaving={handleEndWithoutSaving}
              onOpenDelete={() => setDeleteDialogOpen(true)}
              saveStatus={saveStatus}
              storageError={storageError}
              onRetrySave={() => setSaveDialogOpen(true)}
            />
          )}
        </>
      )}

      {phase === 'ended' && (
        <div className={styles.writingWrap}>
          <section className={styles.card}>
            <h1 className={styles.title}>Isian sementara telah dibersihkan dari aplikasi.</h1>
            <p className={styles.lead}>Tidak ada target baru yang disimpan di perangkat ini.</p>
            <div className={styles.actionsRow}>
              <Button to="/" variant="primary">
                Kembali ke Beranda
              </Button>
              <Button variant="secondary" onClick={() => setPhase('intro')}>
                Lihat contoh Langkah Berani
              </Button>
            </div>
          </section>
        </div>
      )}

      <SaveConfirmDialog
        open={saveDialogOpen}
        isEdit={isSavedRecord}
        isDemo={isDemo}
        pending={saving}
        onCancel={() => setSaveDialogOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        mode="single"
        pending={deleting}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <LeaveDraftDialog
        open={leaveBackOpen}
        isEdit={isSavedRecord}
        onStay={() => setLeaveBackOpen(false)}
        onLeave={() => {
          setLeaveBackOpen(false);
          setSavedRecord(null);
          setDraft(createEmptyGoal());
          setPhase('intro');
        }}
      />

      <LeaveDraftDialog
        open={blocker.state === 'blocked'}
        isEdit={isSavedRecord}
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />

      <CorruptDataDialog
        open={corruptOpen}
        onClose={() => setCorruptOpen(false)}
        onReviewReset={() => setCorruptOpen(false)}
      />
    </div>
  );
}
