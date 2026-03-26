function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Genera un color oklch determinístico a partir del nombre del personaje.
 * Si el personaje tiene `themeColor` en sus datos, ese valor tiene prioridad.
 */
export function colorFromName(name: string): string {
  const hue = hashString(name) % 360
  return `oklch(0.40 0.10 ${hue})`
}

/**
 * Versión clara del color derivado del nombre (fondos, áreas ambient).
 */
export function lightColorFromName(name: string): string {
  const hue = hashString(name) % 360
  return `oklch(0.92 0.03 ${hue})`
}

/**
 * Convierte el nombre de un personaje a un slug URL-safe.
 * Ejemplo: "Simón Bolívar" → "simon-bolivar"
 */
export function toSlug(name: string): string {
  return name
    .normalize('NFD')                      // descompone caracteres con diacríticos
    .replace(/[\u0300-\u036f]/g, '')       // elimina marcas de diacríticos (tildes, etc.)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')         // elimina caracteres especiales (excepto espacios y guiones)
    .replace(/\s+/g, '-')                  // reemplaza espacios por guiones
    .replace(/-+/g, '-')                   // colapsa guiones consecutivos
}

/**
 * Busca un personaje en una lista por slug derivado de su nombre.
 */
export function findCharacterBySlug<T extends { name: string }>(
  characters: T[],
  slug: string,
): T | undefined {
  return characters.find((c) => toSlug(c.name) === slug)
}
