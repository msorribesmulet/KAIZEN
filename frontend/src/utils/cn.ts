/**
 * Une clases condicionalmente. Sin dependencias: los valores falsy se
 * descartan y el resto se concatena.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
