/**
 * Normaliza texto para buscar: minúsculas y sin tildes, de forma que
 * «platano» encuentre «Plátano».
 *
 * `NFD` separa cada letra acentuada en letra + diacrítico, y `\p{M}` (marcas
 * combinantes) elimina esos diacríticos sueltos.
 */
export function normalizeForSearch(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}
