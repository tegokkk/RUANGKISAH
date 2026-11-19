import { useMemo, useState } from 'react';
import { accountStorageKey, createLocalStorageAdapter } from '@/data/localStorageAdapter';
import { createMemoryAdapter } from '@/data/memoryAdapter';
import { createRecordsRepository } from '@/data/recordsRepository';
import { DEMO_FIXTURE_DOCUMENT } from '@/features/demo/fixtures';
import { useAuth } from '@/features/auth/AuthContext';
import { DemoContext } from './AppDataContext.js';

export function DemoProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [demo, setDemo] = useState({ ownerId: null, active: false, version: 0 });
  const isDemo = Boolean(user && demo.ownerId === user.id && demo.active);
  const storageAdapter = useMemo(
    () => (userId ? createLocalStorageAdapter(accountStorageKey(userId)) : createMemoryAdapter()),
    [userId]
  );
  const personalRepository = useMemo(
    () => createRecordsRepository(storageAdapter),
    [storageAdapter]
  );
  const demoRepository = useMemo(() => {
    void demo.version;
    return createRecordsRepository(createMemoryAdapter(structuredClone(DEMO_FIXTURE_DOCUMENT)));
  }, [demo.version]);
  const enterDemo = () => {
    if (!user) return false;
    setDemo((previous) => ({ ownerId: user.id, active: true, version: previous.version + 1 }));
    return true;
  };
  const exitDemo = () =>
    setDemo((previous) => ({ ...previous, active: false, version: previous.version + 1 }));
  return (
    <DemoContext.Provider
      value={{
        isDemo,
        enterDemo,
        exitDemo,
        storageAdapter,
        personalRepository,
        repository: isDemo ? demoRepository : personalRepository,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
