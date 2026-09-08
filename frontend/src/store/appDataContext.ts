import { createContext, use } from 'react';
import type { Food, FoodInput, User, UserProfileInput } from '@/types';

/**
 * Contrato del store: lo global de la aplicación.
 *
 * Los datos que dependen de un día concreto (registros y resumen) no viven
 * aquí: los sirve el hook `useDayData(date)`.
 */
export interface AppData {
  /** Catálogo completo de alimentos. */
  foods: Food[];
  /** Perfil del usuario, o `null` si todavía no se ha creado. */
  user: User | null;
  /** Carga inicial en curso. */
  loading: boolean;
  /** Mensaje de error de la carga inicial, o `null`. */
  error: string | null;

  createFood(input: FoodInput): Promise<void>;
  updateFood(id: number, input: FoodInput): Promise<void>;
  deleteFood(id: number): Promise<void>;

  updateProfile(input: UserProfileInput): Promise<void>;
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
