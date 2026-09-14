import { api } from '@/api/client';
import type { Food, FoodInput } from '@/types';

export function getFoods(): Promise<Food[]> {
  return api.get<Food[]>('/foods');
}

export function createFood(input: FoodInput): Promise<Food> {
  return api.post<Food>('/foods', input);
}

export function updateFood(id: number, input: FoodInput): Promise<Food> {
  return api.put<Food>(`/foods/${id}`, input);
}

export async function deleteFood(id: number): Promise<void> {
  await api.delete<{ ok: boolean }>(`/foods/${id}`);
}
