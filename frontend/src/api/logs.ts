import { api } from '@/api/client';
import type { Log, LogInput } from '@/types';

export function getLogs(date?: string): Promise<Log[]> {
  const query = date === undefined ? '' : `?${new URLSearchParams({ date }).toString()}`;
  return api.get<Log[]>(`/logs${query}`);
}

export function createLog(input: LogInput): Promise<Log> {
  return api.post<Log>('/logs', input);
}

export async function deleteLog(id: number): Promise<void> {
  await api.delete<{ ok: boolean }>(`/logs/${id}`);
}
