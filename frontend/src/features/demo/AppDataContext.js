import { createContext, useContext } from 'react';

export const DemoContext = createContext(null);

export function useAppData() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useAppData harus digunakan di dalam DemoProvider.');
  }
  return ctx;
}
