import { useEffect, useMemo, useState } from 'react';
import { getLogs } from '@/api/logs';
import { getSummary } from '@/api/summary';
import type { DailySummary, Log, LogEntry } from '@/types';
import { calcServing } from '@/utils/nutrition';
import { useAppData } from './appDataContext';

export interface DayData {
  entries: LogEntry[];
  summary: DailySummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDayData(date: string): DayData {
  const { foods } = useAppData();

  const [logs, setLogs] = useState<Log[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([getLogs(date), getSummary(date)])
      .then(([dayLogs, daySummary]) => {
        if (cancelled) return;
        setLogs(dayLogs);
        setSummary(daySummary);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setSummary(null);
        setError(cause instanceof Error ? cause.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, reloadToken]);

  const foodsById = useMemo(() => new Map(foods.map((food) => [food.id, food])), [foods]);

  const entries = useMemo<LogEntry[]>(
    () =>
      logs.flatMap((log) => {
        const food = foodsById.get(log.food_id);
        if (!food) return [];
        return [{ log, food, ...calcServing(food, log.grams) }];
      }),
    [logs, foodsById],
  );

  return {
    entries,
    summary,
    loading,
    error,
    refresh: () => setReloadToken((token) => token + 1),
  };
}
