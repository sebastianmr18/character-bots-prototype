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
