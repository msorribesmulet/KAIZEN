import { describe, expect, it } from 'vitest';
import type { Food, UserProfileInput } from '@/types';
import {
  calcBMR,
  calcMacros,
  calcNutritionTargets,
  calcServing,
  calcTargetCalories,
  calcTDEE,
} from './nutrition';

const profile: UserProfileInput = {
  weight_kg: 80,
  height_cm: 180,
  age: 30,
  sex: 'male',
  activity_level: 'moderate',
  goal: 'lose',
  kg_per_week: 0.5,
};

const food: Food = {
  id: 1,
  name: 'Arroz',
  cal_100g: 360,
  protein_100g: 7,
  carbs_100g: 79,
  fat_100g: 0.6,
  is_deleted: false,
};

describe('calcBMR', () => {
  it('suma 5 para un hombre', () => {
    expect(calcBMR(80, 180, 30, 'male')).toBe(1780);
  });

  it('resta 161 para una mujer', () => {
    expect(calcBMR(80, 180, 30, 'female')).toBe(1614);
  });

  it('la diferencia entre sexos es siempre 166', () => {
    expect(calcBMR(55, 160, 60, 'male') - calcBMR(55, 160, 60, 'female')).toBe(166);
  });
});

describe('calcTDEE', () => {
  it('multiplica por el factor de actividad', () => {
    expect(calcTDEE(1000, 'sedentary')).toBe(1200);
    expect(calcTDEE(1000, 'very_active')).toBe(1900);
  });
});

describe('calcTargetCalories', () => {
  it('perder medio kilo a la semana resta 550 al día', () => {
    expect(calcTargetCalories(2500, 'lose', 0.5)).toBe(1950);
  });

  it('ganar suma el mismo ajuste', () => {
    expect(calcTargetCalories(2500, 'gain', 0.5)).toBe(3050);
  });

  it('mantener ignora el ritmo semanal', () => {
    expect(calcTargetCalories(2500, 'maintain', 1)).toBe(2500);
  });

  it('un ritmo de cero no ajusta nada', () => {
    expect(calcTargetCalories(2500, 'lose', 0)).toBe(2500);
  });
});

describe('calcMacros', () => {
  it('reparte 2 g/kg de proteína, 0,8 g/kg de grasa y el resto en carbohidratos', () => {
    expect(calcMacros(80, 2209)).toEqual({ protein_g: 160, fat_g: 64, carbs_g: 248.25 });
  });

  it('las calorías de los tres macros suman el objetivo', () => {
    const { protein_g, carbs_g, fat_g } = calcMacros(70, 2400);
    expect(protein_g * 4 + carbs_g * 4 + fat_g * 9).toBeCloseTo(2400);
  });

  it('recorta los carbohidratos a cero si proteína y grasa ya superan el objetivo', () => {
    expect(calcMacros(100, 500).carbs_g).toBe(0);
  });
});

describe('calcNutritionTargets', () => {
  it('encadena las fórmulas y redondea cada resultado', () => {
    expect(calcNutritionTargets(profile)).toEqual({
      bmr: 1780,
      tdee: 2759,
      target_cal: 2209,
      protein_g: 160,
      carbs_g: 248,
      fat_g: 64,
    });
  });

  it('devuelve solo enteros', () => {
    const targets = calcNutritionTargets({ ...profile, weight_kg: 63.7, height_cm: 171.3 });
    for (const value of Object.values(targets)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe('calcServing', () => {
  it('100 g devuelve los valores por 100 g', () => {
    expect(calcServing(food, 100)).toEqual({ cal: 360, protein: 7, carbs: 79, fat: 0.6 });
  });

  it('escala en proporción a los gramos', () => {
    expect(calcServing(food, 250).cal).toBe(900);
  });

  it('cero gramos no aporta nada', () => {
    expect(calcServing(food, 0)).toEqual({ cal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});
