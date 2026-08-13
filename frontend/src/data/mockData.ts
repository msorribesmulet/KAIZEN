import type { Food, Log, User } from '@/types';
import { addDays, todayISO } from '@/utils/format';

/**
 * Datos de ejemplo que sustituyen al backend mientras el frontend no está
 * conectado. Los tipos son exactamente los mismos que devolverá la API, así
 * que conectar consiste en cambiar la fuente, no la forma de los datos.
 *
 * TODO: conectar con API — reemplazar estos arrays por las respuestas de
 * GET /foods, GET /logs y GET /profile.
 */

/** Valores nutricionales por 100 g (datos reales aproximados). */
export const MOCK_FOODS: Food[] = [
  {
    id: 1,
    name: 'Pechuga de pollo',
    cal_100g: 165,
    protein_100g: 31,
    carbs_100g: 0,
    fat_100g: 3.6,
  },
  {
    id: 2,
    name: 'Arroz blanco cocido',
    cal_100g: 130,
    protein_100g: 2.7,
    carbs_100g: 28,
    fat_100g: 0.3,
  },
  { id: 3, name: 'Huevo entero', cal_100g: 155, protein_100g: 13, carbs_100g: 1.1, fat_100g: 11 },
  {
    id: 4,
    name: 'Copos de avena',
    cal_100g: 389,
    protein_100g: 16.9,
    carbs_100g: 66.3,
    fat_100g: 6.9,
  },
  { id: 5, name: 'Atún al natural', cal_100g: 116, protein_100g: 25.5, carbs_100g: 0, fat_100g: 1 },
  { id: 6, name: 'Salmón fresco', cal_100g: 208, protein_100g: 20, carbs_100g: 0, fat_100g: 13 },
  {
    id: 7,
    name: 'Lentejas cocidas',
    cal_100g: 116,
    protein_100g: 9,
    carbs_100g: 20,
    fat_100g: 0.4,
  },
  { id: 8, name: 'Plátano', cal_100g: 89, protein_100g: 1.1, carbs_100g: 22.8, fat_100g: 0.3 },
  { id: 9, name: 'Manzana', cal_100g: 52, protein_100g: 0.3, carbs_100g: 13.8, fat_100g: 0.2 },
  {
    id: 10,
    name: 'Yogur griego natural',
    cal_100g: 97,
    protein_100g: 9,
    carbs_100g: 3.6,
    fat_100g: 5,
  },
  {
    id: 11,
    name: 'Almendras crudas',
    cal_100g: 579,
    protein_100g: 21.2,
    carbs_100g: 21.6,
    fat_100g: 49.9,
  },
  {
    id: 12,
    name: 'Aceite de oliva virgen extra',
    cal_100g: 884,
    protein_100g: 0,
    carbs_100g: 0,
    fat_100g: 100,
  },
  { id: 13, name: 'Pan integral', cal_100g: 247, protein_100g: 13, carbs_100g: 41, fat_100g: 3.4 },
  { id: 14, name: 'Pasta cocida', cal_100g: 131, protein_100g: 5, carbs_100g: 25, fat_100g: 1.1 },
  {
    id: 15,
    name: 'Brócoli cocido',
    cal_100g: 35,
    protein_100g: 2.4,
    carbs_100g: 7.2,
    fat_100g: 0.4,
  },
  {
    id: 16,
    name: 'Patata cocida',
    cal_100g: 87,
    protein_100g: 1.9,
    carbs_100g: 20.1,
    fat_100g: 0.1,
  },
  {
    id: 17,
    name: 'Queso fresco batido 0%',
    cal_100g: 47,
    protein_100g: 8,
    carbs_100g: 3.5,
    fat_100g: 0.2,
  },
  { id: 18, name: 'Ternera magra', cal_100g: 187, protein_100g: 26, carbs_100g: 0, fat_100g: 9 },
  {
    id: 19,
    name: 'Garbanzos cocidos',
    cal_100g: 164,
    protein_100g: 8.9,
    carbs_100g: 27.4,
    fat_100g: 2.6,
  },
  { id: 20, name: 'Aguacate', cal_100g: 160, protein_100g: 2, carbs_100g: 8.5, fat_100g: 14.7 },
  {
    id: 21,
    name: 'Leche semidesnatada',
    cal_100g: 46,
    protein_100g: 3.1,
    carbs_100g: 4.7,
    fat_100g: 1.6,
  },
  {
    id: 22,
    name: 'Crema de cacahuete',
    cal_100g: 588,
    protein_100g: 25,
    carbs_100g: 20,
    fat_100g: 50,
  },
];

const today = todayISO();
const yesterday = addDays(today, -1);

/** Registros de ejemplo: un día de hoy completo y algo de ayer. */
export const MOCK_LOGS: Log[] = [
  { id: 1, date: today, food_id: 4, grams: 60 },
  { id: 2, date: today, food_id: 21, grams: 200 },
  { id: 3, date: today, food_id: 8, grams: 120 },
  { id: 4, date: today, food_id: 1, grams: 180 },
  { id: 5, date: today, food_id: 2, grams: 150 },
  { id: 6, date: today, food_id: 15, grams: 200 },
  { id: 7, date: today, food_id: 12, grams: 10 },
  { id: 8, date: today, food_id: 10, grams: 150 },
  { id: 9, date: yesterday, food_id: 3, grams: 120 },
  { id: 10, date: yesterday, food_id: 13, grams: 80 },
  { id: 11, date: yesterday, food_id: 5, grams: 140 },
  { id: 12, date: yesterday, food_id: 19, grams: 200 },
  { id: 13, date: yesterday, food_id: 20, grams: 75 },
];

/** Usuario de ejemplo. */
export const MOCK_USER: User = {
  id: 1,
  email: 'usuario@kaizen.app',
  weight_kg: 78,
  height_cm: 180,
  age: 29,
  sex: 'male',
  activity_level: 'moderate',
  goal: 'lose',
  kg_per_week: 0.5,
};
