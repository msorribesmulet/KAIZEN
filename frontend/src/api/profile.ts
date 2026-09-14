import { api } from '@/api/client';
import type { User, UserProfileInput } from '@/types';

export function getProfile(): Promise<User> {
  return api.get<User>('/profile');
}

export function saveProfile(input: UserProfileInput): Promise<User> {
  return api.put<User>('/profile', input);
}
