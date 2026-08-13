import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { MOCK_FOODS, MOCK_LOGS, MOCK_USER } from '@/data/mockData';
import type { Food, FoodInput, Log, LogEntry, User, UserProfileInput } from '@/types';
import { calcServing, summarize } from '@/utils/nutrition';
import { AppDataContext, type AppData } from './appDataContext';

/** Genera el siguiente id libre. Con el backend real, el id lo asigna el servidor. */
function nextId(items: readonly { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

/**
 * Store en memoria sobre los datos mock.
 *
 * Cada mutación lleva marcado el punto exacto donde va la llamada al backend.
 * El patrón recomendado al conectar: lanzar el fetch, y actualizar el estado
 * con lo que devuelva el servidor en lugar de con el objeto construido aquí.
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<Food[]>(MOCK_FOODS);
  const [logs, setLogs] = useState<Log[]>(MOCK_LOGS);
  const [user, setUser] = useState<User>(MOCK_USER);

  // Índice id -> alimento, para resolver los registros sin recorrer el array.
  const foodsById = useMemo(() => new Map(foods.map((food) => [food.id, food])), [foods]);

  const getEntriesByDate = useCallback(
    (date: string): LogEntry[] => {
      // TODO: conectar con API — GET /logs?date={date}
      // El backend puede devolver ya el alimento embebido; si no, mantén este
      // cruce contra el catálogo de alimentos.
      return logs
        .filter((log) => log.date === date)
        .flatMap((log) => {
          const food = foodsById.get(log.food_id);
          if (!food) return []; // registro huérfano: el alimento fue eliminado
          return [{ log, food, ...calcServing(food, log.grams) }];
        });
    },
    [logs, foodsById],
  );

  const getSummary = useCallback(
    (date: string) => {
      // TODO: conectar con API — GET /summary/{date}
      // El endpoint ya existe en el backend y devuelve los totales calculados
      // en servidor; entonces esta suma local deja de ser necesaria.
      return summarize(date, getEntriesByDate(date));
    },
    [getEntriesByDate],
  );

  const addLog = useCallback((date: string, foodId: number, grams: number) => {
    // TODO: conectar con API — POST /logs  body: { date, food_id, grams }
    setLogs((prev) => [...prev, { id: nextId(prev), date, food_id: foodId, grams }]);
  }, []);

  const deleteLog = useCallback((logId: number) => {
    // TODO: conectar con API — DELETE /logs/{logId}
    setLogs((prev) => prev.filter((log) => log.id !== logId));
  }, []);

  const createFood = useCallback((input: FoodInput) => {
    // TODO: conectar con API — POST /foods  body: FoodInput
    setFoods((prev) => [...prev, { id: nextId(prev), ...input }]);
  }, []);

  const updateFood = useCallback((id: number, input: FoodInput) => {
    // TODO: conectar con API — PUT /foods/{id}  body: FoodInput
    setFoods((prev) => prev.map((food) => (food.id === id ? { id, ...input } : food)));
  }, []);

  const deleteFood = useCallback((id: number) => {
    // TODO: conectar con API — DELETE /foods/{id}
    // Se borran también sus registros para no dejar logs huérfanos. Comprueba
    // si el backend ya lo hace en cascada antes de replicarlo aquí.
    setFoods((prev) => prev.filter((food) => food.id !== id));
    setLogs((prev) => prev.filter((log) => log.food_id !== id));
  }, []);

  const updateProfile = useCallback((input: UserProfileInput) => {
    // TODO: conectar con API — PUT /profile  body: UserProfileInput
    setUser((prev) => ({ ...prev, ...input }));
  }, []);

  const value = useMemo<AppData>(
    () => ({
      foods,
      user,
      getEntriesByDate,
      getSummary,
      addLog,
      deleteLog,
      createFood,
      updateFood,
      deleteFood,
      updateProfile,
    }),
    [
      foods,
      user,
      getEntriesByDate,
      getSummary,
      addLog,
      deleteLog,
      createFood,
      updateFood,
      deleteFood,
      updateProfile,
    ],
  );

  return <AppDataContext value={value}>{children}</AppDataContext>;
}
