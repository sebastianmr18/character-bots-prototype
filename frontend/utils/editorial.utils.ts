import type {
  CharacterEditorial,
  CharacterEditorialSectionName,
  CharacterEditorialSectionResponse,
  EditorialBlock,
  EditorialCharacter,
  EditorialContextCard,
  EditorialFact,
  EditorialGalleryImage,
  EditorialPrompt,
  EditorialQuote,
  EditorialRelationship,
  EditorialTimelineEntry,
  EditorialUiCopy,
} from '@/types/editorial.types'
import { normalizeBackendCharacter } from '@/utils/message.utils'

type UnknownRecord = Record<string, unknown>

type BackendEditorialCharacter = UnknownRecord
type BackendEditorialResponse = {
  character?: BackendEditorialCharacter
  editorial?: UnknownRecord
}

const SECTION_EDITORIAL_FIELDS: Record<CharacterEditorialSectionName, Array<keyof CharacterEditorial>> = {
  hero: ['quotes', 'uiCopies'],
  overview: ['facts', 'contextCards', 'editorialBlocks', 'uiCopies'],
  timeline: ['timelineEntries', 'uiCopies'],
  relations: ['contextCards', 'relationships', 'prompts', 'editorialBlocks', 'uiCopies'],
  gallery: ['galleryImages', 'uiCopies'],
}

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {}

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

const sortByOrder = <T extends { sortOrder: number }>(items: T[]): T[] =>
  [...items].sort((left, right) => left.sortOrder - right.sortOrder)

const mergeByKey = <T extends { sortOrder: number }>(
  base: T[],
  incoming: T[] | undefined,
  getKey: (item: T) => string,
): T[] => {
  if (!incoming) {
    return base
  }

  const merged = new Map<string, T>()

  for (const item of base) {
    merged.set(getKey(item), item)
  }

  for (const item of incoming) {
    merged.set(getKey(item), item)
  }

  return sortByOrder(Array.from(merged.values()))
}

const readValue = (record: UnknownRecord, camelKey: string, snakeKey: string): unknown =>
  record[camelKey] ?? record[snakeKey]

const normalizeRelationship = (value: unknown): EditorialRelationship | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const name = asString(record.name)

  if (!id || !name) {
    return null
  }

  return {
    id,
    name,
    role: asString(record.role),
    dynamic: asString(record.dynamic),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
  }
}

const normalizeEditorialCharacter = (value: unknown): EditorialCharacter => {
  const record = asRecord(value)
  const normalizedCharacter = normalizeBackendCharacter(record as never)

  return {
    ...normalizedCharacter,
    keyTraits: asStringArray(readValue(record, 'keyTraits', 'key_traits')),
    speechTics: Array.isArray(readValue(record, 'speechTics', 'speech_tics'))
      ? (readValue(record, 'speechTics', 'speech_tics') as unknown[])
      : [],
    ambientLabel: asString(readValue(record, 'ambientLabel', 'ambient_label')),
    contentVariant: asString(readValue(record, 'contentVariant', 'content_variant')),
    epoch: asString(record.epoch),
    quote: asString(record.quote),
    badge: asString(record.badge),
    createdAt: asString(readValue(record, 'createdAt', 'created_at')),
    userId: asString(readValue(record, 'userId', 'user_id')),
    isPublic: asBoolean(readValue(record, 'isPublic', 'is_public')),
    topics: asStringArray(record.topics),
  }
}

export const createEmptyEditorial = (): CharacterEditorial => ({
  quotes: [],
  facts: [],
  contextCards: [],
  timelineEntries: [],
  relationships: [],
  prompts: [],
  galleryImages: [],
  editorialBlocks: [],
  uiCopies: [],
})

const normalizeQuote = (value: unknown): EditorialQuote | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const text = asString(record.text)

  if (!id || !text) {
    return null
  }

  return {
    id,
    text,
    attribution: asString(record.attribution),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
    isFeatured: asBoolean(readValue(record, 'isFeatured', 'is_featured')),
  }
}

const normalizeFact = (value: unknown): EditorialFact | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const label = asString(record.label)
  const factValue = asString(record.value)
  const sectionKey = asString(readValue(record, 'sectionKey', 'section_key'))

  if (!id || !label || !factValue || !sectionKey) {
    return null
  }

  return {
    id,
    label,
    value: factValue,
    sectionKey,
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
  }
}

const normalizeContextCard = (value: unknown): EditorialContextCard | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const title = asString(record.title)
  const body = asString(record.body)

  if (!id || !title || !body) {
    return null
  }

  return {
    id,
    eyebrow: asString(record.eyebrow),
    title,
    body,
    iconKey: asString(readValue(record, 'iconKey', 'icon_key')),
    pageKey: asString(readValue(record, 'pageKey', 'page_key')),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
  }
}

const normalizeTimelineEntry = (value: unknown): EditorialTimelineEntry | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const yearLabel = asString(readValue(record, 'yearLabel', 'year_label'))
  const title = asString(record.title)
  const description = asString(record.description)

  if (!id || !yearLabel || !title || !description) {
    return null
  }

  const relationships = Array.isArray(record.relationships)
    ? sortByOrder(
        record.relationships
          .map(normalizeRelationship)
          .filter((relationship): relationship is EditorialRelationship => relationship !== null),
      )
    : []

  return {
    id,
    yearLabel,
    phaseLabel: asString(readValue(record, 'phaseLabel', 'phase_label')),
    title,
    description,
    narrativeText: asString(readValue(record, 'narrativeText', 'narrative_text')),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
    relationships,
  }
}

const normalizePrompt = (value: unknown): EditorialPrompt | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const prompt = asString(record.prompt)

  if (!id || !prompt) {
    return null
  }

  return {
    id,
    label: asString(record.label),
    prompt,
    note: asString(record.note),
    ctaLabel: asString(readValue(record, 'ctaLabel', 'cta_label')),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
  }
}

const normalizeGalleryImage = (value: unknown): EditorialGalleryImage | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const imageUrl = asString(readValue(record, 'imageUrl', 'image_url'))

  if (!id || !imageUrl) {
    return null
  }

  return {
    id,
    imageUrl,
    alt: asString(record.alt),
    caption: asString(record.caption),
    credit: asString(record.credit),
    sourceUrl: asString(readValue(record, 'sourceUrl', 'source_url')),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
    isCover: asBoolean(readValue(record, 'isCover', 'is_cover')),
  }
}

const normalizeEditorialBlock = (value: unknown): EditorialBlock | null => {
  const record = asRecord(value)
  const id = asString(record.id)
  const blockKey = asString(readValue(record, 'blockKey', 'block_key'))
  const body = asString(record.body)

  if (!id || !blockKey || !body) {
    return null
  }

  return {
    id,
    blockKey,
    title: asString(record.title),
    body,
    pageKey: asString(readValue(record, 'pageKey', 'page_key')),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
  }
}

const normalizeUiCopy = (value: unknown): EditorialUiCopy | null => {
  const record = asRecord(value)
  const copyKey = asString(readValue(record, 'copyKey', 'copy_key'))
  const text = asString(record.text)

  if (!copyKey || !text) {
    return null
  }

  return {
    copyKey,
    text,
    pageKey: asString(readValue(record, 'pageKey', 'page_key')),
    sortOrder: asNumber(readValue(record, 'sortOrder', 'sort_order')),
    source: asString(record.source),
  }
}

const normalizeEditorial = (value: unknown): CharacterEditorial => {
  const record = asRecord(value)

  return {
    quotes: sortByOrder((Array.isArray(record.quotes) ? record.quotes : [])
      .map(normalizeQuote)
      .filter((quote): quote is EditorialQuote => quote !== null)),
    facts: sortByOrder((Array.isArray(record.facts) ? record.facts : [])
      .map(normalizeFact)
      .filter((fact): fact is EditorialFact => fact !== null)),
    contextCards: sortByOrder((Array.isArray(readValue(record, 'contextCards', 'context_cards'))
      ? (readValue(record, 'contextCards', 'context_cards') as unknown[])
      : [])
      .map(normalizeContextCard)
      .filter((card): card is EditorialContextCard => card !== null)),
    timelineEntries: sortByOrder((Array.isArray(readValue(record, 'timelineEntries', 'timeline_entries'))
      ? (readValue(record, 'timelineEntries', 'timeline_entries') as unknown[])
      : [])
      .map(normalizeTimelineEntry)
      .filter((entry): entry is EditorialTimelineEntry => entry !== null)),
    relationships: sortByOrder((Array.isArray(record.relationships) ? record.relationships : [])
      .map(normalizeRelationship)
      .filter((relationship): relationship is EditorialRelationship => relationship !== null)),
    prompts: sortByOrder((Array.isArray(record.prompts) ? record.prompts : [])
      .map(normalizePrompt)
      .filter((prompt): prompt is EditorialPrompt => prompt !== null)),
    galleryImages: sortByOrder((Array.isArray(readValue(record, 'galleryImages', 'gallery_images'))
      ? (readValue(record, 'galleryImages', 'gallery_images') as unknown[])
      : [])
      .map(normalizeGalleryImage)
      .filter((image): image is EditorialGalleryImage => image !== null)),
    editorialBlocks: sortByOrder((Array.isArray(readValue(record, 'editorialBlocks', 'editorial_blocks'))
      ? (readValue(record, 'editorialBlocks', 'editorial_blocks') as unknown[])
      : [])
      .map(normalizeEditorialBlock)
      .filter((block): block is EditorialBlock => block !== null)),
    uiCopies: sortByOrder((Array.isArray(readValue(record, 'uiCopies', 'ui_copies'))
      ? (readValue(record, 'uiCopies', 'ui_copies') as unknown[])
      : [])
      .map(normalizeUiCopy)
      .filter((copy): copy is EditorialUiCopy => copy !== null)),
  }
}

const pickEditorialSection = (
  editorial: CharacterEditorial,
  section: CharacterEditorialSectionName,
): Partial<CharacterEditorial> => {
  const allowedFields = SECTION_EDITORIAL_FIELDS[section]

  return allowedFields.reduce<Partial<CharacterEditorial>>((accumulator, field) => {
    accumulator[field] = editorial[field] as never
    return accumulator
  }, {})
}

export const normalizeBackendEditorialCharacter = (value: unknown): EditorialCharacter | null => {
  const record = asRecord(value)

  if (Object.keys(record).length === 0) {
    return null
  }

  return normalizeEditorialCharacter(record)
}

export const normalizeBackendEditorialSectionPayload = (
  section: CharacterEditorialSectionName,
  payload: BackendEditorialResponse,
): CharacterEditorialSectionResponse => ({
  character: normalizeBackendEditorialCharacter(payload.character) ?? undefined,
  editorial: pickEditorialSection(normalizeEditorial(payload.editorial), section),
})

export const mergeEditorialContent = (
  base: CharacterEditorial,
  incoming: Partial<CharacterEditorial>,
): CharacterEditorial => ({
  quotes: mergeByKey(base.quotes, incoming.quotes, (quote) => quote.id),
  facts: mergeByKey(base.facts, incoming.facts, (fact) => fact.id),
  contextCards: mergeByKey(base.contextCards, incoming.contextCards, (card) => card.id),
  timelineEntries: mergeByKey(base.timelineEntries, incoming.timelineEntries, (entry) => entry.id),
  relationships: mergeByKey(base.relationships, incoming.relationships, (relationship) => relationship.id),
  prompts: mergeByKey(base.prompts, incoming.prompts, (prompt) => prompt.id),
  galleryImages: mergeByKey(base.galleryImages, incoming.galleryImages, (image) => image.id),
  editorialBlocks: mergeByKey(base.editorialBlocks, incoming.editorialBlocks, (block) => block.id),
  uiCopies: mergeByKey(base.uiCopies, incoming.uiCopies, (copy) => `${copy.pageKey ?? ''}:${copy.copyKey}`),
})