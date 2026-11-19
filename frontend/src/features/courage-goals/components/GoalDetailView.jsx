import { GoalStatusBadge, GoalStatusSelector } from '@/components/reflection/GoalStatus';
import { SummaryBlock } from '@/components/reflection/SummaryBlock';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { APP_CONFIG } from '@/config/appConfig';
import { formatIndonesianDate } from '@/utils/date';
import styles from '../CourageGoalsPage.module.css';

export function GoalDetailView({
  goal,
  isSaved = false,
  isDirty = false,
  isDemo = false,
  reflectionError = '',
  onChangeStatus,
  onChangeReflection,
  onEditFields,
  onOpenSave,
  onCancelEdit,
  onEndWithoutSaving,
  onOpenDelete,
  saveStatus = null,
  storageError = null,
  onRetrySave,
}) {
  const maxRefl = APP_CONFIG.limits.goalAfterReflectionMax;

  return (
    <div className={styles.writingWrap}>
      <div className={styles.detailHeader}>
        <div className={styles.topBar}>
          <GoalStatusBadge status={goal.status} />
        </div>
        <h1 className={styles.detailTitle}>{goal.title}</h1>
      </div>

      <div className={styles.summaryBlocks}>
        <SummaryBlock title="Langkah pertama" content={goal.firstStep} />
        <SummaryBlock
          title="Kenapa ini berarti buatmu"
          content={goal.reason || ''}
          emptyText="Belum diisi"
        />
        <SummaryBlock
          title="Tanggal target"
          content={goal.targetDate ? formatIndonesianDate(goal.targetDate) : ''}
          emptyText="Belum ditentukan"
        />
        <SummaryBlock
          title="Dukungan yang kamu butuhkan"
          content={goal.support || ''}
          emptyText="Belum diisi"
        />
      </div>

      <section className={styles.card}>
        <GoalStatusSelector value={goal.status} onChange={onChangeStatus} />

        {goal.status === 'tried' && (
          <Notice variant="success">Kamu sudah mencoba satu langkah.</Notice>
        )}

        <Field
          label="Refleksi setelah mencoba"
          optional
          multiline
          value={goal.afterReflection || ''}
          onChange={(e) => onChangeReflection(e.target.value)}
          placeholder="Bagaimana rasanya setelah mencoba atau menyesuaikan target ini?"
          maxCount={maxRefl}
          showCounter
          error={reflectionError}
        />
      </section>

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
          Perubahan target tersimpan di browser perangkat ini.
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
                <Button variant="primary" onClick={onRetrySave}>
                  Coba lagi
                </Button>
              )}
            </>
          }
        >
          {storageError.message}
        </Notice>
      )}

      {!isSaved ? (
        <>
          {saveStatus !== 'saved' && (
            <>
              <div className={styles.actionsRow}>
                <Button variant="ghost" onClick={onEditFields}>
                  Ubah target
                </Button>
              </div>
              <div className={styles.finalChoices}>
                <Button variant="primary" onClick={onOpenSave}>
                  {isDemo ? 'Coba alur simpan (simulasi)' : 'Simpan di perangkat ini'}
                </Button>
                <Button variant="secondary" onClick={onEndWithoutSaving}>
                  Akhiri tanpa menyimpan
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className={styles.actionsRow}>
            <Button variant="ghost" onClick={onEditFields}>
              Ubah rincian target
            </Button>

            {isDirty && (
              <div className={styles.actionsRow}>
                <Button variant="secondary" onClick={onCancelEdit}>
                  Batal mengubah
                </Button>
                <Button variant="primary" onClick={onOpenSave}>
                  {isDemo ? 'Coba simpan perubahan (simulasi)' : 'Simpan perubahan'}
                </Button>
              </div>
            )}
          </div>

          <div className={styles.dangerZone}>
            <Button variant="dangerOutline" onClick={onOpenDelete}>
              Hapus target
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
