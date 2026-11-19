import { useNavigate } from 'react-router-dom';
import { InfoIcon } from '@/assets/icons/Icons';
import { useAppData } from '@/features/demo/AppDataContext';
import styles from './DemoBanner.module.css';

export function DemoBanner() {
  const { isDemo, exitDemo } = useAppData();
  const navigate = useNavigate();

  if (!isDemo) return null;

  const handleExit = () => {
    exitDemo();
    navigate('/');
  };

  return (
    <div className={styles.banner} role="region" aria-label="Status mode contoh fiktif">
      <div className={styles.inner}>
        <div className={styles.labelWrap}>
          <InfoIcon size={18} />
          <span>Contoh fiktif - bukan data siswa</span>
        </div>
        <button type="button" className={styles.exitButton} onClick={handleExit}>
          Keluar contoh
        </button>
      </div>
    </div>
  );
}
