import { Link } from 'react-router-dom';
import { DeviceIcon } from '@/assets/icons/Icons';
import styles from './StorageNotice.module.css';

export function StorageNotice({ status = 'temporary', showPrivacyLink = true }) {
  const labelMap = {
    temporary: 'Belum disimpan',
    saved: 'Tersimpan di browser ini',
    dirty: 'Perubahan belum disimpan',
    demo: 'Simulasi contoh fiktif',
  };

  const cls = [
    styles.badge,
    status === 'saved' ? styles.saved : '',
    status === 'dirty' ? styles.dirty : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <DeviceIcon size={16} />
      <span>{labelMap[status] || labelMap.temporary}</span>
      {showPrivacyLink && (
        <Link to="/privasi" className={styles.link}>
          Pelajari pilihan data
        </Link>
      )}
    </div>
  );
}
