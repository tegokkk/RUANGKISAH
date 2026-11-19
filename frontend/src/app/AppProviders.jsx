import { AuthProvider } from '@/features/auth/AuthProvider';
import { DemoProvider } from '@/features/demo/DemoProvider';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <DemoProvider>{children}</DemoProvider>
    </AuthProvider>
  );
}
