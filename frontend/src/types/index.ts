/**
 * Modelos de datos de Kaizen.
 *
 * Estos tipos reflejan exactamente lo que devuelve/espera el backend
 * (FastAPI + Pydantic), de forma que al conectar la API solo haya que
 * sustituir la fuente de datos, no los tipos.
 */

/** Alimento con sus valores nutricionales por 100 g. */
export interface Food {
  id: number;
  name: string;
  cal_100g: number;
  protein_100g: number;
  carbs_100g: number;
  fat_100g: number;
  /** Oculto del catálogo, pero conservado para que los registros pasados sigan resolviendo. */
  is_deleted: boolean;
}

/** Payload de creación/edición de un alimento (el backend asigna el id y el borrado). */
export type FoodInput = Omit<Food, 'id' | 'is_deleted'>;

/** Registro de una comida: un alimento consumido en una fecha concreta. */
export interface Log {
  id: number;
  /** Fecha en formato ISO `YYYY-MM-DD`. */
  date: string;
  food_id: number;
  grams: number;
}

export type LogInput = Omit<Log, 'id'>;

/**
 * Lo que devuelve `GET /logs`: el registro con su alimento ya resuelto.
 * `food` es `null` si el alimento fue eliminado de verdad (registro huérfano).
 */
export interface LogWithFood extends Log {
  food: Food | null;
}

/** Bloque de calorías y macros, en las tres variantes que devuelve el resumen. */
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Resumen de un día: lo comido, el objetivo y lo que queda. */
export interface DailySummary {
  /** Fecha en formato ISO `YYYY-MM-DD`. */
  date: string;
  consumed: Macros;
  target: Macros;
  remaining: Macros;
}

export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

/** Perfil del usuario con los datos necesarios para calcular su objetivo. */
export interface User {
  id: number;
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: Sex;
  activity_level: ActivityLevel;
  goal: Goal;
  /** Ritmo de cambio de peso deseado, en kg por semana. */
  kg_per_week: number;
}

/** Datos editables del perfil (todo lo que no asigna el backend). */
export type UserProfileInput = Omit<User, 'id'>;

/** Objetivos calóricos y de macros derivados del perfil. */
export interface NutritionTargets {
  bmr: number;
  tdee: number;
  target_cal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Un registro del día ya resuelto con su alimento y sus macros calculadas. */
export interface LogEntry {
  log: Log;
  food: Food;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Las tres claves de macro, usadas para colores, leyendas y gráficos. */
export type MacroKey = 'protein' | 'carbs' | 'fat';
