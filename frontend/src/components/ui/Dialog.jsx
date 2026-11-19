import { useEffect, useId, useRef } from 'react';
import { CloseIcon } from '@/assets/icons/Icons';
import { usePresence } from '@/hooks/usePresence';
import styles from './Dialog.module.css';

function getFocusableElements(container) {
  if (!container) return [];
  const nodes = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes);
}

export function Dialog({ open, title, onClose, children, actions, closeDisabled = false }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const present = usePresence(open);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const focusables = getFocusableElements(dialogRef.current);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      dialogRef.current?.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !closeDisabled) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const items = getFocusableElements(dialogRef.current);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose, closeDisabled]);

  if (!present) return null;

  return (
    <div
      className={styles.overlay}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      inert={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Tutup dialog"
            onClick={onClose}
            disabled={closeDisabled}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
