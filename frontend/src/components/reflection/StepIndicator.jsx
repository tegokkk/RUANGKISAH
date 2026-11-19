import styles from './StepIndicator.module.css';

export function StepIndicator({ currentStep, totalSteps = 6, theme }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.stepLabel}>
          Langkah {currentStep} dari {totalSteps}
        </span>
        {theme && <span className={styles.themeBadge}>{theme}</span>}
      </div>
      <div
        className={styles.segments}
        role="progressbar"
        aria-label={`Langkah ${currentStep} dari ${totalSteps}`}
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;
          const cls = [
            styles.segment,
            isActive ? styles.segmentActive : '',
            isDone ? styles.segmentDone : '',
          ]
            .filter(Boolean)
            .join(' ');
          return <div key={stepNumber} className={cls} />;
        })}
      </div>
    </div>
  );
}
