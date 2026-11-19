import { Notice } from '@/components/ui/Notice';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

export function ProtectedRoute({ allowedRoles = null, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div role="status" aria-live="polite">
        <Notice variant="info" title="Memeriksa sesi akun">
          Menyiapkan akses aktivitasmu...
        </Notice>
      </div>
    );

  if (!isAuthenticated) {
    return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return <Navigate to="/tidak-diizinkan" replace />;
  }

  return children;
}
