import { PageHeader } from '@/components/ui/PageHeader';
import { useHeadingFocus } from '@/hooks/useHeadingFocus';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@/assets/icons/Icons';
import {
  CorruptDataDialog,
  DeleteConfirmDialog,
  LeaveDraftDialog,
  SaveConfirmDialog,
} from '@/components/reflection/ActionDialogs';
import { RecordRow } from '@/components/reflection/RecordRow';
import { StorageNotice } from '@/components/reflection/StorageNotice';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { APP_CONFIG } from '@/config/appConfig';
import { FEELING_OPTIONS, JOURNAL_PROMPTS } from '@/content/feelingOptions';
import { REFLECTION_QUESTIONS } from '@/content/reflectionQuestions';
import { RECORD_TYPES, RECORD_TYPE_LABELS } from '@/data/schema';
import {
  validateGoalPayload,
  validateJournalPayload,
  validateReflectionPayload,
} from '@/data/validators';
import { subscribeDataChanges } from '@/data/writeCoordinator';
import { GoalDetailView } from '@/features/courage-goals/components/GoalDetailView';
import { useAppData } from '@/features/demo/AppDataContext';
import { JournalSummaryView } from '@/features/feeling-journal/components/JournalSummaryView';
import { ReflectionSummaryView } from '@/features/self-reflection/components/ReflectionSummaryView';
import { useUnsavedDraftGuard } from '@/hooks/useUnsavedDraftGuard';
import { formatIndonesianDate, getLocalTodayISO } from '@/utils/date';
import styles from './SavedRecordsPage.module.css';

export function SavedRecordsPage() {
  const { isDemo, repository } = useAppData();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [corruptError, setCorruptError] = useState('');
  const [corruptDialogOpen, setCorruptDialogOpen] = useState(false);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveBackOpen, setLeaveBackOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [operationNotice, setOperationNotice] = useState(null);
  const [tabConflict, setTabConflict] = useState(null);
  const [deletedElsewhere, setDeletedElsewhere] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const headingRoot = useHeadingFocus((selectedRecord?.id || 'list') + ':' + isEditing);

  const loadList = useCallback(() => {
    const res = repository.listRecordSummaries();
    if (!res.ok) {
      if (res.errorCode === 'CORRUPT_DATA' || res.errorCode === 'UNSUPPORTED_VERSION') {
        setCorruptError(res.message);
        setCorruptDialogOpen(true);
      }
      return;
    }
    setCorruptError('');
    setRecords(res.records);
  }, [repository]);

  useEffect(() => {
    setSelectedRecord(null);
    setSelectedType(null);
    setEditDraft(null);
    setIsEditing(false);
    setOperationNotice(null);
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (isDemo) return undefined;
    return subscribeDataChanges(() => {
      loadList();
      if (selectedRecord && selectedType) {
        const latest = repository.getRecordById(selectedType, selectedRecord.id);
        if (!latest.ok && latest.errorCode === 'NOT_FOUND') {
          setDeletedElsewhere(true);
        }
      }
    });
  }, [isDemo, loadList, repository, selectedRecord, selectedType]);

  const isDirtyGoal =
    selectedType === RECORD_TYPES.GOAL &&
    selectedRecord &&
    editDraft &&
    (editDraft.status !== selectedRecord.status ||
      (editDraft.afterReflection || '') !== (selectedRecord.afterReflection || ''));

  const isDirty = (isEditing && Boolean(editDraft)) || Boolean(isDirtyGoal);
  const blocker = useUnsavedDraftGuard(isDirty);

  const handleOpenRecord = (summary) => {
    const res = repository.getRecordById(summary.type, summary.id);
    if (!res.ok) {
      loadList();
      return;
    }
    setSelectedType(summary.type);
    setSelectedRecord(res.record);
    setEditDraft(structuredClone(res.record));
    setIsEditing(false);
    setDeletedElsewhere(false);
    setTabConflict(null);
    setOperationNotice(null);
    setValidationError('');
  };

  const handleBackToList = () => {
    if (isDirty) {
      setLeaveBackOpen(true);
    } else {
      setSelectedRecord(null);
      setSelectedType(null);
      setEditDraft(null);
      setIsEditing(false);
      setDeletedElsewhere(false);
      setTabConflict(null);
      setOperationNotice(null);
      loadList();
    }
  };

  const handleRequestSave = () => {
    let check = { ok: true };
    if (selectedType === RECORD_TYPES.REFLECTION) {
      check = validateReflectionPayload(editDraft);
    } else if (selectedType === RECORD_TYPES.JOURNAL) {
      check = validateJournalPayload(editDraft);
    } else if (selectedType === RECORD_TYPES.GOAL) {
      check = validateGoalPayload(editDraft);
    }

    if (!check.ok) {
      setValidationError(check.message);
      return;
    }
    setValidationError('');
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedRecord || !selectedType || !editDraft) return;
    setSaving(true);

    const payload =
      selectedType === RECORD_TYPES.REFLECTION
        ? { answers: editDraft.answers }
        : selectedType === RECORD_TYPES.JOURNAL
          ? {
              entryDate: editDraft.entryDate,
              feelings: editDraft.feelings,
              situation: editDraft.situation,
              response: editDraft.response,
              needs: editDraft.needs,
              smallAction: editDraft.smallAction,
            }
          : {
              title: editDraft.title,
              firstStep: editDraft.firstStep,
              reason: editDraft.reason || '',
              targetDate: editDraft.targetDate || '',
              support: editDraft.support || '',
              status: editDraft.status,
              afterReflection: editDraft.afterReflection || '',
            };

    const res = await repository.updateRecord(
      selectedType,
      selectedRecord.id,
      selectedRecord.revision,
      payload
    );

    setSaving(false);
    setSaveDialogOpen(false);

    if (res.ok) {
      setSelectedRecord(res.record);
      setEditDraft(structuredClone(res.record));
      setIsEditing(false);
      setTabConflict(null);
      setOperationNotice({
        variant: 'success',
        message: isDemo
          ? 'Simulasi selesai. Tidak ada data disimpan.'
          : 'Perubahan tersimpan di browser perangkat ini.',
      });
      loadList();
      return;
    }

    if (res.errorCode === 'TAB_CONFLICT') {
      setTabConflict(res.latestRecord);
      return;
    }

    if (res.errorCode === 'DELETED_ELSEWHERE') {
      setDeletedElsewhere(true);
      return;
    }

    setOperationNotice({ variant: 'warning', message: res.message });
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord || !selectedType) return;
    setDeleting(true);
    const res = await repository.deleteRecord(selectedType, selectedRecord.id);
    setDeleting(false);
    setDeleteDialogOpen(false);

    if (res.ok) {
      setSelectedRecord(null);
      setSelectedType(null);
      setEditDraft(null);
      setIsEditing(false);
      loadList();
      setOperationNotice({
        variant: 'success',
        message: isDemo
          ? 'Simulasi hapus selesai pada contoh fiktif.'
          : 'Catatan telah dihapus dari browser perangkat ini.',
      });
      return;
    }

    setOperationNotice({ variant: 'danger', message: res.message });
  };

  if (selectedRecord && selectedType && editDraft) {
    return (
      <div ref={headingRoot} className={styles.page}>
        <div className={styles.topBar}>
          <Button variant="ghost" onClick={handleBackToList}>
            <ArrowLeftIcon size={18} />
            <span>Kembali ke daftar</span>
          </Button>
          <StorageNotice status={isDirty ? 'dirty' : isDemo ? 'demo' : 'saved'} />
        </div>

        {deletedElsewhere && (
          <Notice
            variant="warning"
            title="Catatan ini sudah dihapus dari browser ini."
            actions={
              <Button variant="primary" onClick={handleBackToList}>
                Kembali ke daftar
              </Button>
            }
          >
            Catatan ini dihapus dari tab lain.
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
                    setSelectedRecord(tabConflict);
                    setEditDraft(structuredClone(tabConflict));
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

        {operationNotice && (
          <Notice variant={operationNotice.variant}>{operationNotice.message}</Notice>
        )}

        {!deletedElsewhere && selectedType === RECORD_TYPES.GOAL && !isEditing && (
          <GoalDetailView
            goal={editDraft}
            isSaved
            isDirty={Boolean(isDirtyGoal)}
            isDemo={isDemo}
            reflectionError={validationError}
            onChangeStatus={(status) => setEditDraft((p) => ({ ...p, status }))}
            onChangeReflection={(val) => {
              setEditDraft((p) => ({ ...p, afterReflection: val }));
              setValidationError('');
            }}
            onEditFields={() => setIsEditing(true)}
            onOpenSave={handleRequestSave}
            onCancelEdit={() => {
              setEditDraft(structuredClone(selectedRecord));
              setValidationError('');
            }}
            onOpenDelete={() => setDeleteDialogOpen(true)}
          />
        )}
        {!deletedElsewhere && selectedType === RECORD_TYPES.GOAL && isEditing && (
          <section className={styles.detailCard}>
            <h1 className={styles.title}>Ubah target kecilmu.</h1>
            {[
              ['title', 'Judul target', 120, true],
              ['firstStep', 'Langkah pertama', 500, true],
              ['reason', 'Kenapa ini berarti buatmu?', 500, false],
              ['support', 'Dukungan yang kamu butuhkan', 500, false],
            ].map(([key, label, maxCount, required]) => (
              <Field
                key={key}
                label={label}
                required={required}
                optional={!required}
                multiline={key !== 'title'}
                value={editDraft[key] || ''}
                maxCount={maxCount}
                showCounter
                onChange={(event) => {
                  setEditDraft((prev) => ({ ...prev, [key]: event.target.value }));
                  setValidationError('');
                }}
              />
            ))}
            <Field
              label="Tanggal target"
              optional
              type="date"
              value={editDraft.targetDate || ''}
              onChange={(event) =>
                setEditDraft((prev) => ({ ...prev, targetDate: event.target.value }))
              }
            />
            {validationError && <Notice variant="warning">{validationError}</Notice>}
            <div className={styles.actionsRow}>
              <Button onClick={handleRequestSave}>Simpan perubahan</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditDraft(structuredClone(selectedRecord));
                  setIsEditing(false);
                  setValidationError('');
                }}
              >
                Batal mengubah
              </Button>
            </div>
          </section>
        )}

        {!deletedElsewhere && selectedType !== RECORD_TYPES.GOAL && (
          <>
            <PageHeader
              title={RECORD_TYPE_LABELS[selectedType]}
              description={'Terakhir diperbarui ' + formatIndonesianDate(selectedRecord.updatedAt)}
            >
              <TextLink to="/privasi">Kelola privasi &amp; data</TextLink>
            </PageHeader>

            {!isEditing ? (
              <>
                {selectedType === RECORD_TYPES.REFLECTION ? (
                  <ReflectionSummaryView answers={selectedRecord.answers} />
                ) : (
                  <JournalSummaryView entry={selectedRecord} />
                )}

                <div className={styles.actionsRow}>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Ubah catatan
                  </Button>
                  <Button variant="secondary" onClick={handleBackToList}>
                    Kembali ke daftar
                  </Button>
                </div>

                <div className={styles.dangerZone}>
                  <Button variant="dangerOutline" onClick={() => setDeleteDialogOpen(true)}>
                    Hapus catatan
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.detailCard}>
                {selectedType === RECORD_TYPES.REFLECTION &&
                  REFLECTION_QUESTIONS.map((q) => {
                    const current =
                      editDraft.answers.find((a) => a.questionId === q.id)?.answer ?? '';
                    return (
                      <Field
                        key={q.id}
                        label={q.theme}
                        helper={q.question}
                        optional
                        multiline
                        value={current}
                        maxCount={APP_CONFIG.limits.reflectionAnswerMax}
                        showCounter
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditDraft((prev) => {
                            const exists = prev.answers.some((a) => a.questionId === q.id);
                            const nextAnswers = exists
                              ? prev.answers.map((a) =>
                                  a.questionId === q.id ? { ...a, answer: val } : a
                                )
                              : [...prev.answers, { questionId: q.id, answer: val }];
                            return { ...prev, answers: nextAnswers };
                          });
                          setValidationError('');
                        }}
                      />
                    );
                  })}

                {selectedType === RECORD_TYPES.JOURNAL && (
                  <>
                    <Field
                      label="Tanggal jurnal"
                      type="date"
                      max={getLocalTodayISO()}
                      value={editDraft.entryDate}
                      onChange={(e) => {
                        setEditDraft((p) => ({ ...p, entryDate: e.target.value }));
                        setValidationError('');
                      }}
                    />

                    <div>
                      <p className={styles.lead} style={{ marginBottom: '0.5rem' }}>
                        Perasaan yang paling dekat denganmu
                      </p>
                      <div className={styles.chipsGrid}>
                        {FEELING_OPTIONS.map((f) => (
                          <Chip
                            key={f.id}
                            label={f.label}
                            icon={f.icon}
                            selected={editDraft.feelings.includes(f.id)}
                            onToggle={() => {
                              setEditDraft((prev) => {
                                const has = prev.feelings.includes(f.id);
                                return {
                                  ...prev,
                                  feelings: has
                                    ? prev.feelings.filter((x) => x !== f.id)
                                    : [...prev.feelings, f.id],
                                };
                              });
                              setValidationError('');
                            }}
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
                        value={editDraft[prompt.id] || ''}
                        onChange={(e) => {
                          setEditDraft((p) => ({ ...p, [prompt.id]: e.target.value }));
                          setValidationError('');
                        }}
                      />
                    ))}
                  </>
                )}

                {validationError && <Notice variant="warning">{validationError}</Notice>}

                <div className={styles.actionsRow}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditDraft(structuredClone(selectedRecord));
                      setIsEditing(false);
                      setValidationError('');
                    }}
                  >
                    Batal mengubah
                  </Button>
                  <Button variant="primary" onClick={handleRequestSave}>
                    {isDemo ? 'Coba simpan perubahan (simulasi)' : 'Simpan perubahan'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <SaveConfirmDialog
          open={saveDialogOpen}
          isEdit
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
          isEdit
          onStay={() => setLeaveBackOpen(false)}
          onLeave={() => {
            setLeaveBackOpen(false);
            setSelectedRecord(null);
            setSelectedType(null);
            setEditDraft(null);
            setIsEditing(false);
          }}
        />

        <LeaveDraftDialog
          open={blocker.state === 'blocked'}
          isEdit
          onStay={() => blocker.reset?.()}
          onLeave={() => blocker.proceed?.()}
        />
      </div>
    );
  }

  return (
    <div ref={headingRoot} className={styles.page}>
      <PageHeader
        title="Catatan di browser ini."
        description="Catatan lokal akunmu berada pada browser dan perangkat ini. Perhatikan orang di sekitarmu sebelum membuka isinya."
      >
        <TextLink to="/privasi">Kelola privasi &amp; data</TextLink>
      </PageHeader>

      {operationNotice && (
        <Notice variant={operationNotice.variant}>{operationNotice.message}</Notice>
      )}

      {corruptError && (
        <Notice
          variant="warning"
          title="Data tersimpan tidak dapat dibaca."
          actions={
            <Button to="/privasi" variant="primary">
              Tinjau pilihan hapus data
            </Button>
          }
        >
          {corruptError}
        </Notice>
      )}

      {!corruptError && records.length === 0 && (
        <EmptyState
          title="Belum ada catatan tersimpan di browser ini."
          description="Tidak semua aktivitas harus disimpan. Kamu bisa mulai berefleksi kapan saja, lalu memilih apakah ingin menyimpannya di perangkat ini."
          action={
            <Button to="/kenali-diriku" variant="primary">
              Mulai refleksi
            </Button>
          }
        />
      )}

      {!corruptError && records.length > 0 && (
        <>
          <div className={styles.filters}>
            <label htmlFor="record-type">
              Jenis catatan
              <select
                id="record-type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">Semua jenis</option>
                {Object.entries(RECORD_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Dari tanggal"
              type="date"
              optional
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <Field
              label="Sampai tanggal"
              type="date"
              optional
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setTypeFilter('all');
                setFromDate('');
                setToDate('');
              }}
            >
              Reset filter
            </Button>
          </div>
          <div className={styles.list}>
            {records
              .filter((rec) => {
                const date = new Date(rec.updatedAt);
                const localDate = [
                  date.getFullYear(),
                  String(date.getMonth() + 1).padStart(2, '0'),
                  String(date.getDate()).padStart(2, '0'),
                ].join('-');
                return (
                  (typeFilter === 'all' || rec.type === typeFilter) &&
                  (!fromDate || localDate >= fromDate) &&
                  (!toDate || localDate <= toDate)
                );
              })
              .map((rec) => (
                <RecordRow key={rec.id} recordSummary={rec} onOpen={handleOpenRecord} />
              ))}
            {records.every((rec) => {
              const date = new Date(rec.updatedAt);
              const localDate = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0'),
                String(date.getDate()).padStart(2, '0'),
              ].join('-');
              return (
                (typeFilter !== 'all' && rec.type !== typeFilter) ||
                (fromDate && localDate < fromDate) ||
                (toDate && localDate > toDate)
              );
            }) && (
              <EmptyState
                compact
                title="Tidak ada catatan yang sesuai filter."
                description="Coba jenis atau rentang tanggal lain, atau tampilkan semua catatan."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setTypeFilter('all');
                      setFromDate('');
                      setToDate('');
                    }}
                  >
                    Tampilkan semua catatan
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}

      <CorruptDataDialog
        open={corruptDialogOpen}
        message={corruptError}
        onClose={() => setCorruptDialogOpen(false)}
        onReviewReset={() => {
          setCorruptDialogOpen(false);
          navigate('/privasi');
        }}
      />
    </div>
  );
}
