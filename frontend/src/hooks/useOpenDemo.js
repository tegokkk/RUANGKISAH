import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useAppData } from '@/features/demo/AppDataContext';
export function useOpenDemo() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enterDemo } = useAppData();
  return () => {
    if (!isAuthenticated) {
      navigate('/masuk', { state: { from: '/catatan-saya', demo: true } });
    } else {
      enterDemo();
      navigate('/catatan-saya');
    }
  };
}
