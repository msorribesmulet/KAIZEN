import { api } from '@/api/client';
import type { DailySummary } from '@/types';

export function getSummary(date: string): Promise<DailySummary> {
  return api.get<DailySummary>(`/summary/${date}`);
}
