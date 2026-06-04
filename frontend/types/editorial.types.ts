/**
 * Tipos del contenido editorial de personajes (hero, timeline, galería, etc.).
 */

import type { Character } from '@/types/chat.types'

/** Personaje con campos adicionales usados en paneles editoriales y administración. */
export interface EditorialCharacter extends Character {
  keyTraits?: string[] | null
  speechTics?: unknown[] | null
  ambientLabel?: string | null
  contentVariant?: string | null
  epoch?: string | null
  quote?: string | null
  badge?: string | null
  createdAt?: string | null
  userId?: string | null
  isPublic?: boolean
}

/** Cita destacada asociada al personaje. */
export interface EditorialQuote {
  id: string
  text: string
  attribution: string | null
  sortOrder: number
  isFeatured: boolean
}

/** Dato factual etiquetado (ficha, estadística, etc.). */
export interface EditorialFact {
  id: string
  label: string
  value: string
  sectionKey: string
  sortOrder: number
}

/** Tarjeta de contexto narrativo en una sección editorial. */
export interface EditorialContextCard {
  id: string
  eyebrow: string | null
  title: string
  body: string
  iconKey: string | null
  pageKey: string | null
  sortOrder: number
}

/** Relación entre personajes o figuras históricas vinculadas. */
export interface EditorialRelationship {
  id: string
  name: string
  role: string | null
  dynamic: string | null
  sortOrder: number
}

/** Entrada de línea temporal con relaciones anidadas opcionales. */
export interface EditorialTimelineEntry {
  id: string
  yearLabel: string
  phaseLabel: string | null
  title: string
  description: string
  narrativeText: string | null
  sortOrder: number
  relationships: EditorialRelationship[]
}

/** Prompt sugerido para iniciar conversación desde el panel editorial. */
export interface EditorialPrompt {
  id: string
  label: string | null
  prompt: string
  note: string | null
  ctaLabel: string | null
  sortOrder: number
}

/** Imagen de galería con metadatos de accesibilidad y crédito. */
export interface EditorialGalleryImage {
  id: string
  imageUrl: string
  alt: string | null
  caption: string | null
  credit: string | null
  sourceUrl: string | null
  sortOrder: number
  isCover: boolean
}

/** Bloque de texto libre agrupado por clave y página. */
export interface EditorialBlock {
  id: string
  blockKey: string
  title: string | null
  body: string
  pageKey: string | null
  sortOrder: number
}

/** Texto de interfaz configurable (copys por página). */
export interface EditorialUiCopy {
  copyKey: string
  text: string
  pageKey: string | null
  sortOrder: number
  source: string | null
}

/** Conjunto completo de contenido editorial de un personaje. */
export interface CharacterEditorial {
  quotes: EditorialQuote[]
  facts: EditorialFact[]
  contextCards: EditorialContextCard[]
  timelineEntries: EditorialTimelineEntry[]
  relationships: EditorialRelationship[]
  prompts: EditorialPrompt[]
  galleryImages: EditorialGalleryImage[]
  editorialBlocks: EditorialBlock[]
  uiCopies: EditorialUiCopy[]
}

/** Respuesta del backend con personaje y bloque editorial completo. */
export interface CharacterEditorialResponse {
  character: EditorialCharacter
  editorial: CharacterEditorial
}

/** Secciones editoriales que pueden cargarse de forma parcial (lazy). */
export type CharacterEditorialSectionName = 'hero' | 'overview' | 'timeline' | 'relations' | 'gallery'

/** Respuesta parcial al solicitar una sola sección editorial. */
export interface CharacterEditorialSectionResponse {
  character?: EditorialCharacter
  editorial: Partial<CharacterEditorial>
}
