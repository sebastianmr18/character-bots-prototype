import type { Character } from '@/types/chat.types'

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

export interface EditorialQuote {
  id: string
  text: string
  attribution: string | null
  sortOrder: number
  isFeatured: boolean
}

export interface EditorialFact {
  id: string
  label: string
  value: string
  sectionKey: string
  sortOrder: number
}

export interface EditorialContextCard {
  id: string
  eyebrow: string | null
  title: string
  body: string
  iconKey: string | null
  pageKey: string | null
  sortOrder: number
}

export interface EditorialRelationship {
  id: string
  name: string
  role: string | null
  dynamic: string | null
  sortOrder: number
}

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

export interface EditorialPrompt {
  id: string
  label: string | null
  prompt: string
  note: string | null
  ctaLabel: string | null
  sortOrder: number
}

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

export interface EditorialBlock {
  id: string
  blockKey: string
  title: string | null
  body: string
  pageKey: string | null
  sortOrder: number
}

export interface EditorialUiCopy {
  copyKey: string
  text: string
  pageKey: string | null
  sortOrder: number
  source: string | null
}

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

export interface CharacterEditorialResponse {
  character: EditorialCharacter
  editorial: CharacterEditorial
}

export type CharacterEditorialSectionName = 'hero' | 'overview' | 'timeline' | 'relations' | 'gallery'

export interface CharacterEditorialSectionResponse {
  character?: EditorialCharacter
  editorial: Partial<CharacterEditorial>
}