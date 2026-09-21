import { createContext, use } from 'react';
import type { Account, Credentials } from '@/types';

/** Contrato de la sesión: quién ha entrado y cómo entrar o salir. */
export interface Auth {
  /** Cuenta con la sesión abierta, o `null` si no hay ninguna. */
  account: Account | null;
  /** Comprobación inicial contra el servidor en curso. */
  checking: boolean;

  login(credentials: Credentials): Promise<void>;
  register(credentials: Credentials): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<Auth | null>(null);

/** Acceso a la sesión. Lanza si se usa fuera del provider. */
export function useAuth(): Auth {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
