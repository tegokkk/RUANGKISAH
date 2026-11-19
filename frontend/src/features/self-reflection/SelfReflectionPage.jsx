import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons/Icons';
import {
  CorruptDataDialog,
  LeaveDraftDialog,
  SaveConfirmDialog,
} from '@/components/reflection/ActionDialogs';
import { StepIndicator } from '@/components/reflection/StepIndicator';
import { StorageNotice } from '@/components/reflection/StorageNotice';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { TextLink } from '@/components/ui/TextLink';
import { APP_CONFIG } from '@/config/appConfig';
import { REFLECTION_QUESTIONS } from '@/content/reflectionQuestions';
import { RECORD_TYPES } from '@/data/schema';
import { validateReflectionPayload } from '@/data/validators';
import { useAppData } from '@/features/demo/AppDataContext';
import { ReflectionSummaryView } from '@/features/self-reflection/components/ReflectionSummaryView';
import { useUnsavedDraftGuard } from '@/hooks/useUnsavedDraftGuard';
import styles from './SelfReflectionPage.module.css';

function createInitialAnswers() {
  return REFLECTION_QUESTIONS.map((q) => ({ questionId: q.id, answer: '' }));
}

export function SelfReflectionPage() {
  const { isDemo, repository } = useAppData();

  const [phase, setPhase] = useState('intro'); // 'intro' | 'questions' | 'summary' | 'ended'
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(createInitialAnswers);
  const [stepError, setStepError] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [leaveToIntroOpen, setLeaveToIntroOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saved' | 'demo_saved' | 'error'
  const [storageError, setStorageError] = useState(null);
  const [corruptOpen, setCorruptOpen] = useState(false);
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
  }, [phase, stepIndex]);

  const hasAnyText = answers.some((item) => item.answer.trim().length > 0);
  const hasUnsavedDraft =
    (phase === 'questions' || phase === 'summary') && hasAnyText && saveStatus !== 'saved';

  const blocker = useUnsavedDraftGuard(hasUnsavedDraft);

  const currentQuestion = REFLECTION_QUESTIONS[stepIndex];
  const currentAnswer = answers[stepIndex]?.answer ?? '';
  const maxChars = APP_CONFIG.limits.reflectionAnswerMax;

  const handleAnswerChange = (value) => {
    setAnswers((prev) =>
      prev.map((item, idx) => (idx === stepIndex ? { ...item, answer: value } : item))
    );
    if (value.length <= maxChars) {
      setStepError('');
    }
    setSummaryError('');
    if (saveStatus === 'error') {
      setSaveStatus(null);
      setStorageError(null);
    }
  };

  const validateCurrentStep = () => {
    if (currentAnswer.length > maxChars) {
      setStepError(`Jawaban maksimal ${maxChars.toLocaleString('id-ID')} karakter.`);
      return false;
    }
    setStepError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (stepIndex < REFLECTION_QUESTIONS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    goToSummary();
  };

  const handleSkip = () => {
    setStepError('');
    if (stepIndex < REFLECTION_QUESTIONS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    goToSummary();
  };

  const handlePrev = () => {
    if (!validateCurrentStep()) return;
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  };

  const goToSummary = () => {
    const check = validateReflectionPayload({ answers });
    if (!check.ok) {
      setSummaryError(check.message);
      return;
    }
    setSummaryError('');
    setPhase('summary');
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    setStorageError(null);
    const result = await repository.saveNewRecord(RECORD_TYPES.REFLECTION, { answers });
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
    setAnswers(createInitialAnswers());
    setStepIndex(0);
    setStepError('');
    setSummaryError('');
    setSaveStatus(null);
    setStorageError(null);
    setPhase('ended');
  };

  const handleBackToIntro = () => {
    if (hasUnsavedDraft) {
      setLeaveToIntroOpen(true);
    } else {
      setPhase('intro');
    }
  };

  return (
    <div className={styles.page}>
      {phase === 'intro' && (
        <section className={styles.introCard} aria-labelledby="kenali-intro-title">
          <div className={styles.accentStrip} aria-hidden="true" />
          <h1 id="kenali-intro-title" className={styles.title}>
            Pelan-pelan, kenali dirimu.
          </h1>
          <p className={styles.lead}>
            Ruang ini membantumu mengenali pengalaman berhasil, kekuatan, minat, nilai pribadi, area
            berkembang, dan tujuan kecilmu.
          </p>

          <div className={styles.badges}>
            <span className={styles.badge}>6 pertanyaan</span>
            <span className={styles.badge}>Sekitar 5-10 menit</span>
            <span className={styles.badge}>Boleh dilewati</span>
          </div>

          <Notice variant="info">
            Tidak ada jawaban benar atau salah. Kamu boleh melewati pertanyaan yang belum ingin
            dijawab. Isianmu bersifat sementara dan tidak otomatis disimpan.
          </Notice>

          <div className={styles.navActions}>
            <Button
              variant="primary"
              onClick={() => {
                setPhase('questions');
                setStepIndex(0);
                setSaveStatus(null);
              }}
            >
              <span>Mulai Kenali Diriku</span>
              <ArrowRightIcon size={18} />
            </Button>
            <TextLink to="/pusat-bantuan">Pusat Bantuan</TextLink>
          </div>
        </section>
      )}

      {phase === 'questions' && (
        <>
          <div className={styles.topBar}>
            <button type="button" className={styles.backButton} onClick={handleBackToIntro}>
              <ArrowLeftIcon size={18} />
              <span>Kembali ke pengantar</span>
            </button>
            <StorageNotice status={isDemo ? 'demo' : 'temporary'} />
          </div>

          <StepIndicator
            currentStep={stepIndex + 1}
            totalSteps={REFLECTION_QUESTIONS.length}
            theme={currentQuestion.theme}
          />

          <section
            key={stepIndex}
            className={styles.questionCard}
            aria-labelledby="active-question-title"
            style={{ animation: 'rk-enter 220ms var(--motion-ease)' }}
          >
            <h1
              ref={headingRef}
              tabIndex={-1}
              id="active-question-title"
              className={styles.questionTitle}
            >
              {currentQuestion.question}
            </h1>
            <p className={styles.questionHelper}>{currentQuestion.helper}</p>

            <Field
              label="Jawabanmu"
              optional
              multiline
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              maxCount={maxChars}
              showCounter
              error={stepError}
            />

            <p className={styles.privacyHint}>
              Hindari menuliskan identitas pribadi seperti nama lengkap, NISN, atau nomor telepon.
            </p>

            {summaryError && (
              <Notice
                variant="warning"
                actions={
                  <Button variant="secondary" onClick={handleEndWithoutSaving}>
                    Akhiri tanpa menyimpan
                  </Button>
                }
              >
                {summaryError}
              </Notice>
            )}

            <div className={styles.navActions}>
              {stepIndex > 0 ? (
                <Button variant="secondary" onClick={handlePrev}>
                  <ArrowLeftIcon size={18} />
                  <span>Sebelumnya</span>
                </Button>
              ) : (
                <span />
              )}

              <div className={styles.navRight}>
                <Button variant="ghost" onClick={handleSkip}>
                  Lewati
                </Button>
                <Button variant="primary" onClick={handleNext}>
                  <span>
                    {stepIndex === REFLECTION_QUESTIONS.length - 1
                      ? 'Lihat rangkuman'
                      : 'Berikutnya'}
                  </span>
                  <ArrowRightIcon size={18} />
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {phase === 'summary' && (
        <>
          <div className={styles.topBar}>
            <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
              Yang kamu temukan tentang dirimu.
            </h1>
            <StorageNotice
              status={saveStatus === 'saved' ? 'saved' : isDemo ? 'demo' : 'temporary'}
            />
          </div>

          <p className={styles.lead}>Rangkuman ini berasal dari jawabanmu sendiri.</p>

          <ReflectionSummaryView answers={answers} />

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
              title={
                storageError.errorCode === 'LIMIT_EXCEEDED'
                  ? 'Batas penyimpanan tercapai'
                  : 'Belum tersimpan'
              }
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
            <div className={styles.summaryActions}>
              <div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPhase('questions');
                  }}
                >
                  <ArrowLeftIcon size={18} />
                  <span>Ubah jawaban</span>
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
            </div>
          )}
        </>
      )}

      {phase === 'ended' && (
        <section className={styles.introCard} aria-labelledby="ended-title">
          <h1 id="ended-title" className={styles.title}>
            Isian sementara telah dibersihkan dari aplikasi.
          </h1>
          <p className={styles.lead}>
            Tidak ada jawaban Kenali Diriku yang disimpan pada perangkat ini.
          </p>
          <div className={styles.navActions}>
            <Button to="/" variant="primary">
              Kembali ke Beranda
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPhase('intro');
              }}
            >
              Buka pengantar lagi
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
        open={leaveToIntroOpen}
        onStay={() => setLeaveToIntroOpen(false)}
        onLeave={() => {
          setLeaveToIntroOpen(false);
          setAnswers(createInitialAnswers());
          setStepIndex(0);
          setStepError('');
          setSummaryError('');
          setPhase('intro');
        }}
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
