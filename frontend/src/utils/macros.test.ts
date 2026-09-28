import { describe, expect, it } from 'vitest';
import { MACRO_ORDER, macroKcal } from './macros';

describe('macroKcal', () => {
  it('proteína y carbohidratos aportan 4 kcal por gramo', () => {
    expect(macroKcal('protein', 10)).toBe(40);
    expect(macroKcal('carbs', 10)).toBe(40);
  });

  it('la grasa aporta 9 kcal por gramo', () => {
    expect(macroKcal('fat', 10)).toBe(90);
  });

  it('cero gramos son cero calorías', () => {
    expect(macroKcal('fat', 0)).toBe(0);
  });
});

describe('MACRO_ORDER', () => {
  it('mantiene el orden fijo de gráficos y leyendas', () => {
    expect(MACRO_ORDER).toEqual(['protein', 'carbs', 'fat']);
  });
});
