import { Notice } from '@/components/ui/Notice';
import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useAppData } from '@/features/demo/AppDataContext';
import { PageContainer } from '@/components/layout/PageContainer';
export function RootLayout() {
  const { user } = useAuth();
  const { enterDemo } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();
  const resumed = useRef(null);
  useEffect(() => {
    if (user && location.state?.startDemo && resumed.current !== location.key) {
      resumed.current = location.key;
      enterDemo();
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [user, location, navigate, enterDemo]);
  const featureRoute = [
    '/kenali-diriku',
    '/jurnal-perasaan',
    '/langkah-berani',
    '/catatan-saya',
    '/akun',
    '/admin',
    '/superadmin',
  ].includes(location.pathname);
  return (
    <PageContainer>
      <Suspense
        fallback={<Notice title="Menyiapkan halaman">Sebentar, halaman sedang dimuat...</Notice>}
      >
        <Outlet
          key={featureRoute || location.pathname === '/privasi' ? user?.id || 'guest' : 'public'}
        />
      </Suspense>
    </PageContainer>
  );
}
