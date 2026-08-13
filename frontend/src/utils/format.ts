import type { ActivityLevel, Goal, MacroKey, Sex } from '@/types';

/** Redondea a entero y formatea con separador de miles español. */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** `1.850 kcal` */
export function formatKcal(value: number): string {
  return `${formatNumber(value)} kcal`;
}

/** `31,5 g` — un decimal solo si aporta información. */
export function formatGrams(value: number): string {
  const decimals = Number.isInteger(value) ? 0 : 1;
  return `${formatNumber(value, decimals)} g`;
}

/** Fecha ISO `YYYY-MM-DD` de un objeto Date, en horario local. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Fecha ISO de hoy. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Convierte `YYYY-MM-DD` en un Date local (evita el desfase de UTC). */
export function fromISODate(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Suma (o resta) días a una fecha ISO y devuelve otra fecha ISO. */
export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** `Hoy`, `Ayer` o `martes, 12 de agosto`. */
export function formatDateLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Hoy';
  if (iso === addDays(today, -1)) return 'Ayer';
  if (iso === addDays(today, 1)) return 'Mañana';

  const date = fromISODate(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}

/** Etiquetas en español para los valores de los enums del backend. */
export const MACRO_LABELS: Record<MacroKey, string> = {
  protein: 'Proteínas',
  carbs: 'Carbohidratos',
  fat: 'Grasas',
};

export const SEX_LABELS: Record<Sex, string> = {
  male: 'Hombre',
  female: 'Mujer',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentario',
  light: 'Ligeramente activo (1-3 días/semana)',
  moderate: 'Moderadamente activo (3-5 días/semana)',
  active: 'Muy activo (6-7 días/semana)',
  very_active: 'Extremadamente activo',
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: 'Perder peso',
  maintain: 'Mantener peso',
  gain: 'Ganar peso',
};
