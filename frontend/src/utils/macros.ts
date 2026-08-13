import type { MacroKey } from '@/types';
import { KCAL_PER_GRAM } from './nutrition';

/**
 * Paleta de los macros.
 *
 * Validada sobre la superficie #131c30 para daltonismo (protanopia/deutanopia)
 * y contraste. Tres tonos de azul NO son válidos aquí: azul↔violeta se separan
 * solo ΔE 9.8 en visión normal, por debajo del suelo de 15, así que el tercer
 * macro sale del rango azul a propósito. El orden es fijo, nunca rotatorio.
 */
export const MACRO_COLORS: Record<MacroKey, string> = {
  protein: 'var(--color-macro-protein)', // azul  #3987e5
  carbs: 'var(--color-macro-carbs)', // aguamarina #199e70
  fat: 'var(--color-macro-fat)', // ámbar #d95926
};

/** Orden fijo en gráficos, leyendas y listas. */
export const MACRO_ORDER: readonly MacroKey[] = ['protein', 'carbs', 'fat'] as const;

/** Calorías que aporta una cantidad en gramos de un macro. */
export function macroKcal(macro: MacroKey, grams: number): number {
  return grams * KCAL_PER_GRAM[macro];
}
