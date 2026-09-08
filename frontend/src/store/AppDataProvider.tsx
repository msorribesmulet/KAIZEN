import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '@/api/client';
import * as foodsApi from '@/api/foods';
import * as profileApi from '@/api/profile';
import type { Food, FoodInput, User, UserProfileInput } from '@/types';
import { AppDataContext, type AppData } from './appDataContext';

/** Un 404 en el perfil no es un fallo: es que todavía no se ha creado. */
function loadProfile(): Promise<User | null> {
  return profileApi.getProfile().catch((cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 404) return null;
    throw cause;
  });
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([foodsApi.getFoods(), loadProfile()])
      .then(([loadedFoods, loadedUser]) => {
        if (cancelled) return;
        setFoods(loadedFoods);
        setUser(loadedUser);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const createFood = useCallback(async (input: FoodInput) => {
    const created = await foodsApi.createFood(input);
    setFoods((prev) => [...prev, created]);
  }, []);

  const updateFood = useCallback(async (id: number, input: FoodInput) => {
    const updated = await foodsApi.updateFood(id, input);
    setFoods((prev) => prev.map((food) => (food.id === id ? updated : food)));
  }, []);

  const deleteFood = useCallback(async (id: number) => {
    await foodsApi.deleteFood(id);
    setFoods((prev) => prev.filter((food) => food.id !== id));
  }, []);

  const updateProfile = useCallback(async (input: UserProfileInput) => {
    setUser(await profileApi.saveProfile(input));
  }, []);

  const value = useMemo<AppData>(
    () => ({
      foods,
      user,
      loading,
      error,
      createFood,
      updateFood,
      deleteFood,
      updateProfile,
    }),
    [foods, user, loading, error, createFood, updateFood, deleteFood, updateProfile],
  );

  return <AppDataContext value={value}>{children}</AppDataContext>;
}
