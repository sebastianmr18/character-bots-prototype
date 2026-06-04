import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases CSS condicionales y resuelve conflictos de Tailwind con `tailwind-merge`.
 *
 * @param inputs - Clases en formato `clsx` (strings, objetos, arrays).
 * @returns Cadena de clases fusionada lista para `className`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
