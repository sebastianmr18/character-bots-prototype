/**
 * Utilidades de presentación y enrutamiento para personajes (colores, slugs, búsqueda).
 */

/** Hash determinístico simple para derivar un matiz de color a partir de texto. */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Genera un color oklch determinístico a partir del nombre del personaje.
 *
 * @param name - Nombre del personaje.
 * @returns Cadena de color oklch oscuro.
 * @remarks Si el personaje define `themeColor` en sus datos, la UI debe preferir ese valor.
 */
export function colorFromName(name: string): string {
  const hue = hashString(name) % 360
  return `oklch(0.40 0.10 ${hue})`
}

/**
 * Versión clara del color derivado del nombre, apta para fondos y áreas ambientales.
 *
 * @param name - Nombre del personaje.
 * @returns Cadena de color oklch claro.
 */
export function lightColorFromName(name: string): string {
  const hue = hashString(name) % 360
  return `oklch(0.92 0.03 ${hue})`
}

/**
 * Convierte el nombre de un personaje a un slug seguro para URL.
 *
 * @param name - Nombre con posibles tildes y espacios.
 * @returns Slug en minúsculas; p. ej. "Simón Bolívar" → "simon-bolivar".
 */
export function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Busca un personaje en una lista comparando el slug derivado de su nombre.
 *
 * @param characters - Colección de objetos con al menos `name`.
 * @param slug - Slug de la ruta (segmento URL).
 * @returns El elemento coincidente o `undefined`.
 */
export function findCharacterBySlug<T extends { name: string }>(
  characters: T[],
  slug: string,
): T | undefined {
  return characters.find((c) => toSlug(c.name) === slug)
}
