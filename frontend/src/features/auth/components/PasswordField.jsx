import { useId, useState } from 'react';
import styles from '../AuthPages.module.css';

export function PasswordField({
  label = 'Kata sandi',
  value,
  onChange,
  error,
  helper,
  required = false,
  autoComplete = 'current-password',
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helper ? `${id}-helper` : undefined;

  return (
    <div className={styles.passwordWrap}>
      <div className={styles.passwordLabelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required ? ' *' : ''}
        </label>
      </div>

      {helper && (
        <p id={helperId} className={styles.helperText}>
          {helper}
        </p>
      )}

      <div className={styles.inputGroup}>
        <input
          required={required}
          minLength={autoComplete === 'new-password' ? 10 : undefined}
          maxLength={128}
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${styles.passwordInput} ${error ? styles.passwordInvalid : ''}`}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
        />
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`
          }
        >
          {visible ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>

      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
