import { useId } from 'react';
import { AlertTriangleIcon } from '@/assets/icons/Icons';
import styles from './Field.module.css';

export function Field({
  label,
  optional = false,
  required = false,
  helper,
  error,
  value = '',
  onChange,
  multiline = false,
  maxCount,
  showCounter = false,
  type = 'text',
  id: providedId,
  inputRef,
  rows = 3,
  ...rest
}) {
  const autoId = useId();
  const id = providedId || autoId;
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  const length = typeof value === 'string' ? value.length : 0;
  const isOver = typeof maxCount === 'number' && length > maxCount;

  const controlClasses = [
    styles.control,
    multiline ? styles.textarea : '',
    error || isOver ? styles.invalid : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required ? ' *' : ''}
        </label>
        {optional && <span className={styles.optionalBadge}>Opsional</span>}
      </div>

      {helper && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}

      {multiline ? (
        <textarea
          required={required}
          ref={inputRef}
          id={id}
          rows={rows}
          className={controlClasses}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error || isOver)}
          aria-describedby={describedBy}
          {...rest}
        />
      ) : (
        <input
          required={required}
          ref={inputRef}
          id={id}
          type={type}
          className={controlClasses}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error || isOver)}
          aria-describedby={describedBy}
          {...rest}
        />
      )}

      {(error || showCounter) && (
        <div className={styles.metaRow}>
          {error && (
            <p id={errorId} className={styles.error} role="alert">
              <AlertTriangleIcon size={16} />
              <span>{error}</span>
            </p>
          )}
          {showCounter && typeof maxCount === 'number' && (
            <span className={`${styles.counter} ${isOver ? styles.counterOver : ''}`}>
              {length.toLocaleString('id-ID')}/{maxCount.toLocaleString('id-ID')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
