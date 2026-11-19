import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authStore } from '@/data/authStore';

import { AuthContext } from './AuthContext.js';

function notifySessionChange() {
  try {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('ruangkisah:auth');
    channel.postMessage({ type: 'SESSION_CHANGED' });
    channel.close();
  } catch {
    /* Session state remains valid when cross-tab notifications are unavailable. */
  }
}
export function AuthProvider({ children }) {
  const generation = useRef(0);
  const mutating = useRef(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const refreshSession = useCallback(async () => {
    if (mutating.current) return null;
    const started = generation.current;
    const current = await authStore.getSessionUser();
    if (started === generation.current && !mutating.current) {
      setUser(current);
      setLoading(false);
    }
    return current;
  }, []);

  useEffect(() => {
    let mounted = true;
    const started = generation.current;
    authStore.getSessionUser().then((current) => {
      if (mounted && started === generation.current && !mutating.current) {
        setUser(current);
        setLoading(false);
      }
    });
    const onFocus = () => {
      if (document.visibilityState === 'visible') refreshSession();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    let channel;
    try {
      if (typeof BroadcastChannel !== 'undefined')
        channel = new BroadcastChannel('ruangkisah:auth');
    } catch {
      channel = null;
    }
    if (channel) channel.onmessage = () => refreshSession();
    const interval = window.setInterval(onFocus, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
      channel?.close();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refreshSession]);

  const login = useCallback(async (credentials) => {
    generation.current += 1;
    mutating.current = true;
    const res = await authStore.login(credentials);
    generation.current += 1;
    mutating.current = false;
    setLoading(false);
    if (res.ok) {
      setUser(res.user);
      setSessionError('');
      notifySessionChange();
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    generation.current += 1;
    mutating.current = true;
    const result = await authStore.logout();
    generation.current += 1;
    mutating.current = false;
    if (result.ok) {
      setUser(null);
      setSessionError('');
      notifySessionChange();
    } else setSessionError(result.message);
    return result;
  }, []);

  const updateProfile = useCallback(
    async (payload) => {
      if (!user) return { ok: false, message: 'Belum masuk.' };
      const res = await authStore.updateOwnProfile(user.id, payload);
      if (res.ok) {
        setUser(res.user);
      }
      return res;
    },
    [user]
  );

  const approvedUser =
    user?.approvalStatus === 'approved' && user.status === 'active' ? user : null;
  const value = useMemo(
    () => ({
      user: approvedUser,
      loading,
      sessionError,
      isAuthenticated: Boolean(approvedUser),
      login,
      logout,
      refreshSession,
      updateProfile,
    }),
    [approvedUser, loading, sessionError, login, logout, refreshSession, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
