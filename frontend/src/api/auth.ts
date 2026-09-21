import { api } from './client';
import type { Account, Credentials } from '@/types';

export function register(credentials: Credentials): Promise<Account> {
  return api.post<Account>('/auth/register', credentials);
}

export function login(credentials: Credentials): Promise<Account> {
  return api.post<Account>('/auth/login', credentials);
}

export function logout(): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>('/auth/logout', {});
}

export function me(): Promise<Account> {
  return api.get<Account>('/auth/me');
}
