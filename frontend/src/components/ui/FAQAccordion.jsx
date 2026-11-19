import { useState } from 'react';
import { ChevronDownIcon } from '@/assets/icons/Icons';
import { usePresence } from '@/hooks/usePresence';
import styles from './FAQAccordion.module.css';

function FAQItem({ item, isOpen, onToggle }) {
  const present = usePresence(isOpen, 180);

  return (
    <div className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
      <button type="button" className={styles.trigger} aria-expanded={isOpen} onClick={onToggle}>
        <span>{item.question}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <ChevronDownIcon size={20} />
        </span>
      </button>
      {present && (
        <div
          className={`${styles.panel} ${!isOpen ? styles.panelClosing : ''}`}
          aria-hidden={!isOpen || undefined}
        >
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQAccordion({ items }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <FAQItem
            key={item.id}
            item={item}
            isOpen={isOpen}
            onToggle={() => setOpenId(isOpen ? null : item.id)}
          />
        );
      })}
    </div>
  );
}
