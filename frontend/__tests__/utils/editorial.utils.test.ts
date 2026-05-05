import {
  createEmptyEditorial,
  mergeEditorialContent,
  normalizeBackendEditorialCharacter,
  normalizeBackendEditorialSectionPayload,
} from '@/utils/editorial.utils'

describe('createEmptyEditorial', () => {
  it('returns an object with all array fields empty', () => {
    const result = createEmptyEditorial()
    expect(result.quotes).toEqual([])
    expect(result.facts).toEqual([])
    expect(result.contextCards).toEqual([])
    expect(result.timelineEntries).toEqual([])
    expect(result.relationships).toEqual([])
    expect(result.prompts).toEqual([])
    expect(result.galleryImages).toEqual([])
    expect(result.editorialBlocks).toEqual([])
    expect(result.uiCopies).toEqual([])
  })
})

describe('mergeEditorialContent', () => {
  it('returns base when incoming is empty', () => {
    const base = createEmptyEditorial()
    base.quotes = [{ id: 'q1', text: 'Hola', attribution: null, sortOrder: 0, isFeatured: false }]
    const result = mergeEditorialContent(base, {})
    expect(result.quotes).toHaveLength(1)
    expect(result.quotes[0].id).toBe('q1')
  })

  it('adds new items from incoming', () => {
    const base = createEmptyEditorial()
    const incoming = createEmptyEditorial()
    incoming.quotes = [{ id: 'q2', text: 'Mundo', attribution: null, sortOrder: 1, isFeatured: false }]
    const result = mergeEditorialContent(base, incoming)
    expect(result.quotes).toHaveLength(1)
    expect(result.quotes[0].id).toBe('q2')
  })

  it('overwrites base items with same key from incoming', () => {
    const base = createEmptyEditorial()
    base.quotes = [{ id: 'q1', text: 'Old', attribution: null, sortOrder: 0, isFeatured: false }]
    const incoming = createEmptyEditorial()
    incoming.quotes = [{ id: 'q1', text: 'New', attribution: null, sortOrder: 0, isFeatured: false }]
    const result = mergeEditorialContent(base, incoming)
    expect(result.quotes).toHaveLength(1)
    expect(result.quotes[0].text).toBe('New')
  })

  it('merges base and incoming without duplicates', () => {
    const base = createEmptyEditorial()
    base.quotes = [
      { id: 'q1', text: 'First', attribution: null, sortOrder: 0, isFeatured: false },
      { id: 'q2', text: 'Second', attribution: null, sortOrder: 1, isFeatured: false },
    ]
    const incoming = createEmptyEditorial()
    incoming.quotes = [
      { id: 'q2', text: 'Updated', attribution: null, sortOrder: 1, isFeatured: false },
      { id: 'q3', text: 'Third', attribution: null, sortOrder: 2, isFeatured: false },
    ]
    const result = mergeEditorialContent(base, incoming)
    expect(result.quotes).toHaveLength(3)
    expect(result.quotes.find((q) => q.id === 'q2')?.text).toBe('Updated')
  })

  it('sorts merged items by sortOrder', () => {
    const base = createEmptyEditorial()
    base.facts = [
      { id: 'f2', label: 'B', value: 'val', sectionKey: 'sec', sortOrder: 2 },
      { id: 'f1', label: 'A', value: 'val', sectionKey: 'sec', sortOrder: 1 },
    ]
    const incoming = createEmptyEditorial()
    incoming.facts = []
    const result = mergeEditorialContent(base, incoming)
    expect(result.facts[0].id).toBe('f1')
    expect(result.facts[1].id).toBe('f2')
  })

  it('uses pageKey:copyKey composite key for uiCopies deduplication', () => {
    const base = createEmptyEditorial()
    base.uiCopies = [{ copyKey: 'title', text: 'Old', pageKey: 'hero', sortOrder: 0, source: null }]
    const incoming = createEmptyEditorial()
    incoming.uiCopies = [{ copyKey: 'title', text: 'New', pageKey: 'hero', sortOrder: 0, source: null }]
    const result = mergeEditorialContent(base, incoming)
    expect(result.uiCopies).toHaveLength(1)
    expect(result.uiCopies[0].text).toBe('New')
  })
})

describe('normalizeBackendEditorialCharacter', () => {
  it('returns null for empty object', () => {
    expect(normalizeBackendEditorialCharacter({})).toBeNull()
  })

  it('returns null for null', () => {
    expect(normalizeBackendEditorialCharacter(null)).toBeNull()
  })

  it('normalizes a character with camelCase fields', () => {
    const raw = {
      id: 'char-1',
      name: 'Einstein',
      description: 'Physicist',
      role: 'Scientist',
      biography: 'Born 1879',
      keyTraits: ['curious', 'persistent'],
      epoch: '19th century',
      quote: 'Imagination is more important than knowledge.',
      badge: 'Nobel Prize',
    }
    const result = normalizeBackendEditorialCharacter(raw)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Einstein')
    expect(result!.keyTraits).toEqual(['curious', 'persistent'])
    expect(result!.epoch).toBe('19th century')
    expect(result!.quote).toBe('Imagination is more important than knowledge.')
    expect(result!.badge).toBe('Nobel Prize')
  })

  it('normalizes snake_case fields', () => {
    const raw = {
      id: 'char-1',
      name: 'Newton',
      description: 'Mathematician',
      role: 'Scientist',
      biography: 'Born 1642',
      key_traits: ['analytical'],
      ambient_label: 'Classical',
      content_variant: 'science',
      is_public: true,
    }
    const result = normalizeBackendEditorialCharacter(raw)
    expect(result!.keyTraits).toEqual(['analytical'])
    expect(result!.ambientLabel).toBe('Classical')
    expect(result!.contentVariant).toBe('science')
    expect(result!.isPublic).toBe(true)
  })
})

describe('normalizeBackendEditorialSectionPayload', () => {
  it('returns only hero fields for hero section', () => {
    const payload = {
      character: undefined,
      editorial: {
        quotes: [{ id: 'q1', text: 'Test quote', sort_order: 0, is_featured: true }],
        facts: [{ id: 'f1', label: 'Fact', value: 'Val', section_key: 'sec', sort_order: 0 }],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('hero', payload)
    expect(result.editorial.quotes).toHaveLength(1)
    expect(result.editorial.facts).toBeUndefined()
  })

  it('normalizes quote fields from snake_case', () => {
    const payload = {
      editorial: {
        quotes: [{ id: 'q1', text: 'Hello', sort_order: 5, is_featured: true, attribution: 'Author' }],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('hero', payload)
    const quote = result.editorial.quotes![0]
    expect(quote.sortOrder).toBe(5)
    expect(quote.isFeatured).toBe(true)
    expect(quote.attribution).toBe('Author')
  })

  it('filters out facts with missing required fields', () => {
    const payload = {
      editorial: {
        facts: [
          { id: 'f1', label: 'Label', value: 'Val', section_key: 'sec', sort_order: 0 },
          { id: 'f2', label: 'Missing value' },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('overview', payload)
    expect(result.editorial.facts).toHaveLength(1)
    expect(result.editorial.facts![0].id).toBe('f1')
  })

  it('normalizes contextCards from snake_case', () => {
    const payload = {
      editorial: {
        context_cards: [
          { id: 'c1', title: 'Card', body: 'Body text', icon_key: 'brain', page_key: 'overview', sort_order: 0 },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('overview', payload)
    const card = result.editorial.contextCards![0]
    expect(card.iconKey).toBe('brain')
    expect(card.pageKey).toBe('overview')
  })

  it('normalizes timelineEntries with nested relationships', () => {
    const payload = {
      editorial: {
        timeline_entries: [
          {
            id: 'te1',
            year_label: '1905',
            title: 'Special Relativity',
            description: 'Published paper',
            sort_order: 0,
            relationships: [{ id: 'r1', name: 'Mileva', role: 'Wife', dynamic: 'Partner', sort_order: 0 }],
          },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('timeline', payload)
    const entry = result.editorial.timelineEntries![0]
    expect(entry.yearLabel).toBe('1905')
    expect(entry.relationships).toHaveLength(1)
    expect(entry.relationships[0].name).toBe('Mileva')
  })

  it('normalizes galleryImages from snake_case', () => {
    const payload = {
      editorial: {
        gallery_images: [
          { id: 'g1', image_url: 'https://img.com/1.jpg', alt: 'Photo', sort_order: 0, is_cover: true },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('gallery', payload)
    const image = result.editorial.galleryImages![0]
    expect(image.imageUrl).toBe('https://img.com/1.jpg')
    expect(image.isCover).toBe(true)
  })

  it('normalizes prompts from snake_case', () => {
    const payload = {
      editorial: {
        prompts: [
          { id: 'p1', prompt: 'What do you think?', label: 'Question', cta_label: 'Ask', sort_order: 0 },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('relations', payload)
    const prompt = result.editorial.prompts![0]
    expect(prompt.prompt).toBe('What do you think?')
    expect(prompt.ctaLabel).toBe('Ask')
  })

  it('normalizes editorialBlocks from snake_case', () => {
    const payload = {
      editorial: {
        editorial_blocks: [
          { id: 'b1', block_key: 'intro', body: 'Block body', title: 'Block Title', page_key: 'overview', sort_order: 0 },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('overview', payload)
    const block = result.editorial.editorialBlocks![0]
    expect(block.blockKey).toBe('intro')
    expect(block.pageKey).toBe('overview')
  })

  it('normalizes uiCopies from snake_case', () => {
    const payload = {
      editorial: {
        ui_copies: [
          { copy_key: 'title', text: 'My Title', page_key: 'hero', sort_order: 0 },
        ],
      },
    }
    const result = normalizeBackendEditorialSectionPayload('hero', payload)
    const copy = result.editorial.uiCopies![0]
    expect(copy.copyKey).toBe('title')
    expect(copy.pageKey).toBe('hero')
  })

  it('handles empty editorial payload gracefully', () => {
    const result = normalizeBackendEditorialSectionPayload('hero', { editorial: {} })
    expect(result.editorial.quotes).toEqual([])
    expect(result.editorial.uiCopies).toEqual([])
  })
})
