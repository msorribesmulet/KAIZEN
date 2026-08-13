import { createContext, use } from 'react';
import type { DailySummary, Food, FoodInput, LogEntry, User, UserProfileInput } from '@/types';

/**
 * Contrato del store de la aplicación.
 *
 * Hoy lo implementa `AppDataProvider` sobre datos mock en memoria. Cuando
 * conectes el backend, la firma no cambia: solo la implementación (los métodos
 * pasarán a ser `async` y harán fetch).
 */
export interface AppData {
  /** Catálogo completo de alimentos. */
  foods: Food[];
  /** Perfil del usuario. */
  user: User;

  /** Registros de una fecha, ya resueltos con su alimento y sus macros. */
  getEntriesByDate(date: string): LogEntry[];
  /** Totales nutricionales de una fecha. */
  getSummary(date: string): DailySummary;

  addLog(date: string, foodId: number, grams: number): void;
  deleteLog(logId: number): void;

  createFood(input: FoodInput): void;
  updateFood(id: number, input: FoodInput): void;
  deleteFood(id: number): void;

  updateProfile(input: UserProfileInput): void;
}

export const AppDataContext = createContext<AppData | null>(null);

/** Acceso al store. Lanza si se usa fuera del provider. */
export function useAppData(): AppData {
  const ctx = use(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData debe usarse dentro de <AppDataProvider>');
  }
  return ctx;
}
