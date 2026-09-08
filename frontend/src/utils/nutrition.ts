import type { ActivityLevel, Food, Goal, NutritionTargets, Sex, UserProfileInput } from '@/types';

/** Kilocalorías por gramo de cada macronutriente. */
export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

/** Equivalencia energética de 1 kg de grasa corporal. */
export const KCAL_PER_KG_FAT = 7700;

/** Multiplicadores de actividad para el cálculo del TDEE. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Gramos de proteína por kg de peso corporal. */
const PROTEIN_G_PER_KG = 2;

/** Gramos de grasa por kg de peso corporal. */
const FAT_G_PER_KG = 0.8;

/**
 * Tasa metabólica basal (Mifflin-St Jeor).
 *
 *   Hombre: (10 × peso) + (6.25 × altura) − (5 × edad) + 5
 *   Mujer:  (10 × peso) + (6.25 × altura) − (5 × edad) − 161
 */
export function calcBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/** Gasto energético total diario: BMR × factor de actividad. */
export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activityLevel];
}

/**
 * Objetivo calórico diario a partir del TDEE, el objetivo y el ritmo semanal.
 * El ajuste diario es `(kg_por_semana × 7700) / 7`.
 */
export function calcTargetCalories(tdee: number, goal: Goal, kgPerWeek: number): number {
  const dailyAdjustment = (kgPerWeek * KCAL_PER_KG_FAT) / 7;

  switch (goal) {
    case 'lose':
      return tdee - dailyAdjustment;
    case 'gain':
      return tdee + dailyAdjustment;
    case 'maintain':
      return tdee;
  }
}

/**
 * Reparto de macros:
 *   proteína = 2 g/kg, grasa = 0.8 g/kg, y los carbohidratos absorben el resto
 *   de las calorías del objetivo.
 *
 * Con un objetivo calórico muy bajo y un peso alto, proteína + grasa pueden
 * superar el total; en ese caso los carbohidratos se recortan a 0 en lugar de
 * devolver un valor negativo.
 */
export function calcMacros(
  weightKg: number,
  targetCal: number,
): Pick<NutritionTargets, 'protein_g' | 'carbs_g' | 'fat_g'> {
  const protein_g = PROTEIN_G_PER_KG * weightKg;
  const fat_g = FAT_G_PER_KG * weightKg;
  const remainingCal = targetCal - protein_g * KCAL_PER_GRAM.protein - fat_g * KCAL_PER_GRAM.fat;

  return {
    protein_g,
    fat_g,
    carbs_g: Math.max(0, remainingCal / KCAL_PER_GRAM.carbs),
  };
}

/**
 * Calcula de una vez los objetivos completos (BMR, TDEE, calorías y macros)
 * a partir del perfil del usuario.
 */
export function calcNutritionTargets(profile: UserProfileInput): NutritionTargets {
  const bmr = calcBMR(profile.weight_kg, profile.height_cm, profile.age, profile.sex);
  const tdee = calcTDEE(bmr, profile.activity_level);
  const target_cal = calcTargetCalories(tdee, profile.goal, profile.kg_per_week);
  const macros = calcMacros(profile.weight_kg, target_cal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target_cal: Math.round(target_cal),
    protein_g: Math.round(macros.protein_g),
    carbs_g: Math.round(macros.carbs_g),
    fat_g: Math.round(macros.fat_g),
  };
}

/**
 * Valores nutricionales de una ración: `valor_por_100g × (gramos / 100)`.
 */
export function calcServing(food: Food, grams: number) {
  const ratio = grams / 100;
  return {
    cal: food.cal_100g * ratio,
    protein: food.protein_100g * ratio,
    carbs: food.carbs_100g * ratio,
    fat: food.fat_100g * ratio,
  };
}
