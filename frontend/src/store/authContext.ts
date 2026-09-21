import { createContext, use } from 'react';
import type { Account, Credentials } from '@/types';

export interface Auth {
  account: Account | null;
  checking: boolean;

  login(credentials: Credentials): Promise<void>;
  register(credentials: Credentials): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<Auth | null>(null);

export function useAuth(): Auth {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
