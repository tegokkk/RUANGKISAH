import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Melindungi draf yang belum disimpan agar tidak hilang diam-diam saat navigasi internal
 * atau saat menutup/refresh tab (best effort).
 */
export function useUnsavedDraftGuard(shouldBlock) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      Boolean(shouldBlock) && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (!shouldBlock) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock]);

  return blocker;
}
