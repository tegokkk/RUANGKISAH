import { CheckIcon } from '@/assets/icons/Icons';
import { GOAL_STATUSES, GOAL_STATUS_LABELS } from '@/data/schema';
import styles from './GoalStatus.module.css';

export function GoalStatusBadge({ status }) {
  return (
    <span className={styles.badge}>{GOAL_STATUS_LABELS[status] || GOAL_STATUS_LABELS.planned}</span>
  );
}

export function GoalStatusSelector({ value, onChange }) {
  return (
    <div className={styles.wrapper} role="group" aria-labelledby="goal-status-heading">
      <span id="goal-status-heading" className={styles.label}>
        Status langkahmu
      </span>
      <p className={styles.helper}>Status ini kamu tentukan sendiri.</p>
      <div className={styles.options}>
        {GOAL_STATUSES.map((status) => {
          const isSelected = value === status;
          return (
            <button
              key={status}
              type="button"
              className={`${styles.option} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
              onClick={() => onChange(status)}
            >
              {isSelected && <CheckIcon size={16} />}
              <span>{GOAL_STATUS_LABELS[status]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
