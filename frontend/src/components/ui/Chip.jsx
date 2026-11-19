import { CheckIcon, FeelingIcon } from '@/assets/icons/Icons';
import styles from './Chip.module.css';

export function Chip({ label, icon, selected = false, onToggle }) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <FeelingIcon name={icon} size={18} />
      <span>{label}</span>
      {selected && (
        <span className={styles.check}>
          <CheckIcon size={16} />
        </span>
      )}
    </button>
  );
}
