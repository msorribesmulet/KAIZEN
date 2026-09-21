import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { setUnauthorizedHandler } from '@/api/client';
import type { Account, Credentials } from '@/types';
import { AuthContext, type Auth } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authApi
      .me()
      .then((found) => {
        if (!cancelled) setAccount(found);
      })
      .catch(() => {
        if (!cancelled) setAccount(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setAccount(null));

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    setAccount(await authApi.login(credentials));
  }, []);

  const register = useCallback(async (credentials: Credentials) => {
    setAccount(await authApi.register(credentials));
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    setAccount(null);
  }, []);

  const value = useMemo<Auth>(
    () => ({ account, checking, login, register, logout }),
    [account, checking, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
