import {
  normalizeBackendMessages,
  normalizeBackendCharacter,
  normalizeBackendCharacters,
  hasAssistantAudio,
  mergeMessageCollection,
  normalizeAiMessagePayload,
} from '@/utils/message.utils'
import type { Message } from '@/types/chat.types'

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: '1',
  role: 'assistant',
  content: 'Hello',
  audioUrl: null,
  audioPath: null,
  audioStorageId: null,
  ...overrides,
})

// ---------------------------------------------------------------------------
// normalizeBackendMessages
// ---------------------------------------------------------------------------
describe('normalizeBackendMessages', () => {
  it('returns an empty array when called with no arguments', () => {
    expect(normalizeBackendMessages()).toEqual([])
  })

  it('normalizes snake_case audio fields to camelCase', () => {
    const [msg] = normalizeBackendMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi',
        audio_path: '/audio/1.mp3',
        audio_url: 'https://example.com/1.mp3',
        audio_storage_id: 'storage-123',
        media_type: 'audio/mpeg',
        duration_ms: 5000,
        speaker_character_id: 'char-1',
        speaker_name: 'Einstein',
        conversation_id: 'conv-1',
      } as any,
    ])

    expect(msg.audioPath).toBe('/audio/1.mp3')
    expect(msg.audioUrl).toBe('https://example.com/1.mp3')
    expect(msg.audioStorageId).toBe('storage-123')
    expect(msg.mediaType).toBe('audio/mpeg')
    expect(msg.durationMs).toBe(5000)
    expect(msg.speakerId).toBe('char-1')
    expect(msg.speakerName).toBe('Einstein')
    expect(msg.conversationId).toBe('conv-1')
  })

  it('gives priority to camelCase fields over snake_case', () => {
    const [msg] = normalizeBackendMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi',
        audioUrl: 'https://camel.com/1.mp3',
        audio_url: 'https://snake.com/1.mp3',
      } as any,
    ])
    expect(msg.audioUrl).toBe('https://camel.com/1.mp3')
  })

  it('derives content from blocks text when content is absent', () => {
    const [msg] = normalizeBackendMessages([
      {
        id: '2',
        role: 'assistant',
        blocks: [{ type: 'text', content: 'Block text' }],
      } as any,
    ])
    expect(msg.content).toBe('Block text')
    expect(msg.blocks?.[0].type).toBe('text')
  })

  it('strips forbidden prop keys from component block props', () => {
    const [msg] = normalizeBackendMessages([
      {
        id: '3',
        role: 'assistant',
        content: '',
        blocks: [
          {
            type: 'component',
            componentName: 'InfoCard',
            props: { dangerouslySetInnerHTML: '<script>xss</script>', title: 'Safe' },
          },
        ],
      } as any,
    ])
    const block = msg.blocks?.[0] as any
    expect(block.props.dangerouslySetInnerHTML).toBeUndefined()
    expect(block.props.title).toBe('Safe')
  })

  it('returns null audio fields when not provided', () => {
    const [msg] = normalizeBackendMessages([{ id: '1', role: 'user', content: 'Hi' }])
    expect(msg.audioPath).toBeNull()
    expect(msg.audioUrl).toBeNull()
    expect(msg.audioStorageId).toBeNull()
  })

  it('normalizes event_type to eventType', () => {
    const [msg] = normalizeBackendMessages([
      { id: '1', role: 'event', content: '', event_type: 'mode_switch' } as any,
    ])
    expect(msg.eventType).toBe('mode_switch')
  })
})

// ---------------------------------------------------------------------------
// normalizeBackendCharacter
// ---------------------------------------------------------------------------
describe('normalizeBackendCharacter', () => {
  const baseChar = {
    id: 'char-1',
    name: 'Einstein',
    description: 'Physicist',
    role: 'scientist',
    biography: 'Born 1879',
  }

  it('normalizes snake_case character fields to camelCase', () => {
    const char = normalizeBackendCharacter({
      ...baseChar,
      voice_id: 'voice-123',
      vector_db_name: 'einstein_db',
      theme_color: 'oklch(0.4 0.1 200)',
      theme_color_light: 'oklch(0.9 0.02 200)',
      image_url: 'https://example.com/einstein.jpg',
      background_image_url: 'https://example.com/bg.jpg',
      public_slug: 'einstein',
    } as any)

    expect(char.voiceId).toBe('voice-123')
    expect(char.vectorDbName).toBe('einstein_db')
    expect(char.themeColor).toBe('oklch(0.4 0.1 200)')
    expect(char.themeColorLight).toBe('oklch(0.9 0.02 200)')
    expect(char.imageUrl).toBe('https://example.com/einstein.jpg')
    expect(char.backgroundImageUrl).toBe('https://example.com/bg.jpg')
    expect(char.publicSlug).toBe('einstein')
  })

  it('gives camelCase priority over snake_case', () => {
    const char = normalizeBackendCharacter({
      ...baseChar,
      voiceId: 'camel-voice',
      voice_id: 'snake-voice',
    } as any)
    expect(char.voiceId).toBe('camel-voice')
  })

  it('returns null for omitted optional fields', () => {
    const char = normalizeBackendCharacter(baseChar as any)
    expect(char.voiceId).toBeNull()
    expect(char.vectorDbName).toBeNull()
    expect(char.themeColor).toBeNull()
    expect(char.imageUrl).toBeNull()
  })
})

describe('normalizeBackendCharacters', () => {
  it('returns empty array when called with no arguments', () => {
    expect(normalizeBackendCharacters()).toEqual([])
  })

  it('normalizes every character in the array', () => {
    const result = normalizeBackendCharacters([
      { id: '1', name: 'A', description: '', role: '', biography: '', voice_id: 'v1' } as any,
      { id: '2', name: 'B', description: '', role: '', biography: '', voice_id: 'v2' } as any,
    ])
    expect(result[0].voiceId).toBe('v1')
    expect(result[1].voiceId).toBe('v2')
  })
})

// ---------------------------------------------------------------------------
// hasAssistantAudio
// ---------------------------------------------------------------------------
describe('hasAssistantAudio', () => {
  it('returns true when audioUrl is set', () => {
    expect(hasAssistantAudio(makeMessage({ audioUrl: 'https://example.com/audio.mp3' }))).toBe(true)
  })

  it('returns true when audioPath is set', () => {
    expect(hasAssistantAudio(makeMessage({ audioPath: '/audio/1.mp3' }))).toBe(true)
  })

  it('returns true when audioStorageId is set', () => {
    expect(hasAssistantAudio(makeMessage({ audioStorageId: 'storage-123' }))).toBe(true)
  })

  it('returns false when all audio fields are null', () => {
    expect(hasAssistantAudio(makeMessage({ audioUrl: null, audioPath: null, audioStorageId: null }))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// mergeMessageCollection
// ---------------------------------------------------------------------------
describe('mergeMessageCollection', () => {
  it('returns the same reference when incoming list is empty', () => {
    const prev = [makeMessage({ id: '1' })]
    expect(mergeMessageCollection(prev, [])).toBe(prev)
  })

  it('appends messages that are not present in prev', () => {
    const prev = [makeMessage({ id: '1' })]
    const result = mergeMessageCollection(prev, [makeMessage({ id: '2', content: 'New' })])
    expect(result).toHaveLength(2)
    expect(result[1].id).toBe('2')
  })

  it('merges messages matched by ID (updates audio fields)', () => {
    const prev = [makeMessage({ id: '1', content: 'Hi', audioUrl: null })]
    const incoming = [makeMessage({ id: '1', content: 'Hi', audioUrl: 'https://audio.com/1.mp3' })]
    const result = mergeMessageCollection(prev, incoming)
    expect(result).toHaveLength(1)
    expect(result[0].audioUrl).toBe('https://audio.com/1.mp3')
  })

  it('merges messages matched by role+content when IDs differ', () => {
    const prev = [makeMessage({ id: 'ws-temp', content: 'Hello', audioUrl: null })]
    const incoming = [makeMessage({ id: 'db-123', content: 'Hello', audioUrl: 'https://audio.com/1.mp3' })]
    const result = mergeMessageCollection(prev, incoming)
    expect(result).toHaveLength(1)
    expect(result[0].audioUrl).toBe('https://audio.com/1.mp3')
  })

  it('returns the same prev reference when nothing has changed', () => {
    const prev = [makeMessage({ id: '1', content: 'Hello' })]
    const result = mergeMessageCollection(prev, [makeMessage({ id: '1', content: 'Hello' })])
    expect(result).toBe(prev)
  })

  it('handles multiple incoming messages in one call', () => {
    const prev = [makeMessage({ id: '1', content: 'Original' })]
    const incoming = [
      makeMessage({ id: '1', content: 'Updated' }),
      makeMessage({ id: '2', content: 'New' }),
    ]
    const result = mergeMessageCollection(prev, incoming)
    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('Updated')
    expect(result[1].content).toBe('New')
  })

  it('preserves current content when incoming content is empty', () => {
    const prev = [makeMessage({ id: '1', content: 'Original text' })]
    const result = mergeMessageCollection(prev, [makeMessage({ id: '1', content: '' })])
    expect(result[0].content).toBe('Original text')
  })
})

// ---------------------------------------------------------------------------
// normalizeAiMessagePayload
// ---------------------------------------------------------------------------
describe('normalizeAiMessagePayload', () => {
  it('uses the text field as message content', () => {
    const msg = normalizeAiMessagePayload({ text: 'Hello AI' })
    expect(msg.content).toBe('Hello AI')
    expect(msg.role).toBe('assistant')
  })

  it('falls back to the content field when text is absent', () => {
    const msg = normalizeAiMessagePayload({ content: 'Fallback' })
    expect(msg.content).toBe('Fallback')
  })

  it('uses message_id as the message ID', () => {
    expect(normalizeAiMessagePayload({ message_id: 42, text: 'Hi' }).id).toBe(42)
  })

  it('uses camelCase messageId as the message ID', () => {
    expect(normalizeAiMessagePayload({ messageId: 'abc', text: 'Hi' }).id).toBe('abc')
  })

  it('generates a ws- prefixed ID when no message_id is provided', () => {
    expect(String(normalizeAiMessagePayload({ text: 'Hi' }).id)).toMatch(/^ws-/)
  })

  it('stores suggestions array in metadata', () => {
    const msg = normalizeAiMessagePayload({ text: 'Hi', suggestions: ['Q1', 'Q2'] })
    expect(msg.metadata?.suggestions).toEqual(['Q1', 'Q2'])
  })

  it('stores suggested_questions in metadata under the suggestions key', () => {
    const msg = normalizeAiMessagePayload({ text: 'Hi', suggested_questions: ['Q1', 'Q2'] })
    expect(msg.metadata?.suggestions).toEqual(['Q1', 'Q2'])
  })
})
