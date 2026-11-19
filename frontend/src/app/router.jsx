import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { ROLES } from '@/data/authStore';
const AdminPanelPage = lazy(() =>
  import('@/features/admin/AdminPanelPage').then((module) => ({ default: module.AdminPanelPage }))
);
const AccountPage = lazy(() =>
  import('@/features/auth/AccountPage').then((module) => ({ default: module.AccountPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage }))
);
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
const UnauthorizedPage = lazy(() =>
  import('@/features/auth/UnauthorizedPage').then((module) => ({
    default: module.UnauthorizedPage,
  }))
);
const CourageGoalsPage = lazy(() =>
  import('@/features/courage-goals/CourageGoalsPage').then((module) => ({
    default: module.CourageGoalsPage,
  }))
);
const FeelingJournalPage = lazy(() =>
  import('@/features/feeling-journal/FeelingJournalPage').then((module) => ({
    default: module.FeelingJournalPage,
  }))
);
const HelpPage = lazy(() =>
  import('@/features/help/HelpPage').then((module) => ({ default: module.HelpPage }))
);
const PrivacyPage = lazy(() =>
  import('@/features/privacy/PrivacyPage').then((module) => ({ default: module.PrivacyPage }))
);
const SavedRecordsPage = lazy(() =>
  import('@/features/saved-records/SavedRecordsPage').then((module) => ({
    default: module.SavedRecordsPage,
  }))
);
const SelfReflectionPage = lazy(() =>
  import('@/features/self-reflection/SelfReflectionPage').then((module) => ({
    default: module.SelfReflectionPage,
  }))
);
const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage }))
);
import { HomePage } from '@/pages/HomePage';
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

export const appRoutes = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/kenali-diriku',
        element: (
          <ProtectedRoute>
            <SelfReflectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/jurnal-perasaan',
        element: (
          <ProtectedRoute>
            <FeelingJournalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/langkah-berani',
        element: (
          <ProtectedRoute>
            <CourageGoalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/catatan-saya',
        element: (
          <ProtectedRoute>
            <SavedRecordsPage />
          </ProtectedRoute>
        ),
      },
      { path: '/pusat-bantuan', element: <HelpPage /> },
      { path: '/privasi', element: <PrivacyPage /> },
      { path: '/tentang', element: <AboutPage /> },
      { path: '/masuk', element: <LoginPage /> },
      { path: '/daftar', element: <RegisterPage /> },
      { path: '/lupa-kata-sandi', element: <ForgotPasswordPage /> },
      { path: '/reset-kata-sandi', element: <ResetPasswordPage /> },
      { path: '/tidak-diizinkan', element: <UnauthorizedPage /> },
      {
        path: '/akun',
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPERADMIN]}>
            <AdminPanelPage mode="admin" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/superadmin',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <AdminPanelPage mode="superadmin" />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
