import type {
  AiMessagePayload,
  Character,
  ComponentBlock,
  Message,
  MessageBlock,
  MessageSchemaVersion,
  TextBlock,
} from "@/types/chat.types"

const BLOCK_ALLOWED_TYPES = new Set(["text", "component"])
const FORBIDDEN_PROP_KEYS = new Set(["dangerouslySetInnerHTML", "__proto__", "prototype", "constructor"])

type BackendTextBlock = {
  id?: string
  type?: "text" | string
  content?: unknown
}

type BackendComponentBlock = {
  id?: string
  type?: "component" | string
  componentName?: string
  component_name?: string
  props?: unknown
}

type BackendMessageBlock = BackendTextBlock | BackendComponentBlock

type BackendMessage = {
  id: number | string
  role: "user" | "assistant"
  content?: string
  schemaVersion?: MessageSchemaVersion
  schema_version?: MessageSchemaVersion
  blocks?: BackendMessageBlock[]
  audioPath?: string | null
  audio_path?: string | null
  audioUrl?: string | null
  audio_url?: string | null
  audioStorageId?: string | null
  audio_storage_id?: string | null
  mediaType?: string | null
  media_type?: string | null
  durationMs?: number | null
  duration_ms?: number | null
  timestamp?: string
  metadata?: Record<string, unknown>
  conversationId?: string
  conversation_id?: string
  speakerId?: string | null
  speaker_character_id?: string | null
  speakerName?: string | null
  speaker_name?: string | null
}

type BackendCharacter = Omit<Character, "voiceId" | "vectorDbName" | "imageUrl" | "backgroundImageUrl"> & {
  voiceId?: string | null
  voice_id?: string | null
  vectorDbName?: string | null
  vector_db_name?: string | null
  theme_color?: string | null
  theme_color_light?: string | null
  imageUrl?: string | null
  image_url?: string | null
  backgroundImageUrl?: string | null
  background_image_url?: string | null
}

const sanitizeValue = (value: unknown): unknown => {
  if (value == null) return value

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (typeof value === "object") {
    const sanitized: Record<string, unknown> = {}

    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (!FORBIDDEN_PROP_KEYS.has(key)) {
        sanitized[key] = sanitizeValue(nestedValue)
      }
    })

    return sanitized
  }

  return null
}

const normalizeBackendBlock = (block: BackendMessageBlock): MessageBlock | null => {
  const rawType = typeof block.type === "string" ? block.type : null
  if (!rawType || !BLOCK_ALLOWED_TYPES.has(rawType)) {
    return null
  }

  if (rawType === "text") {
    if (typeof (block as BackendTextBlock).content !== "string") {
      return null
    }

    const normalizedTextBlock: TextBlock = {
      id: block.id,
      type: "text",
      content: (block as BackendTextBlock).content as string,
    }

    return normalizedTextBlock
  }

  const componentBlock = block as BackendComponentBlock
  const componentName = componentBlock.componentName ?? componentBlock.component_name

  if (!componentName) {
    return null
  }

  const normalizedComponentBlock: ComponentBlock = {
    id: block.id,
    type: "component",
    componentName,
    props: sanitizeValue(componentBlock.props) as Record<string, unknown> | undefined,
  }

  return normalizedComponentBlock
}

const normalizeBackendBlocks = (blocks: BackendMessageBlock[] | undefined): MessageBlock[] | undefined => {
  if (!Array.isArray(blocks)) {
    return undefined
  }

  const normalizedBlocks = blocks
    .map(normalizeBackendBlock)
    .filter((block): block is MessageBlock => block !== null)

  return normalizedBlocks.length > 0 ? normalizedBlocks : undefined
}

const blocksToTextFallback = (blocks: MessageBlock[] | undefined): string => {
  if (!blocks) return ""

  return blocks
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.content)
    .join("\n")
    .trim()
}

export const normalizeBackendMessage = (message: BackendMessage): Message => {
  const normalizedBlocks = normalizeBackendBlocks(message.blocks)

  return {
    id: message.id,
    role: message.role,
    content: message.content ?? blocksToTextFallback(normalizedBlocks),
    schemaVersion: message.schemaVersion ?? message.schema_version,
    blocks: normalizedBlocks,
    metadata: sanitizeValue(message.metadata) as Record<string, unknown> | undefined,
    audioPath: message.audioPath ?? message.audio_path ?? null,
    audioUrl: message.audioUrl ?? message.audio_url ?? null,
    audioStorageId: message.audioStorageId ?? message.audio_storage_id ?? null,
    mediaType: message.mediaType ?? message.media_type ?? null,
    durationMs: message.durationMs ?? message.duration_ms ?? null,
    timestamp: message.timestamp,
    conversationId: message.conversationId ?? message.conversation_id,
    speakerId: message.speakerId ?? message.speaker_character_id ?? null,
    speakerName: message.speakerName ?? message.speaker_name ?? null,
  }
}

export const normalizeBackendMessages = (messages: BackendMessage[] = []): Message[] => {
  return messages.map(normalizeBackendMessage)
}

export const normalizeBackendCharacter = (character: BackendCharacter): Character => ({
  ...character,
  voiceId: character.voiceId ?? character.voice_id ?? null,
  vectorDbName: character.vectorDbName ?? character.vector_db_name ?? null,
  themeColor: character.themeColor ?? character.theme_color ?? null,
  themeColorLight: character.themeColorLight ?? character.theme_color_light ?? null,
  imageUrl: character.imageUrl ?? character.image_url ?? null,
  backgroundImageUrl: character.backgroundImageUrl ?? character.background_image_url ?? null,
})

export const normalizeBackendCharacters = (characters: BackendCharacter[] = []): Character[] => {
  return characters.map(normalizeBackendCharacter)
}

// ---------------------------------------------------------------------------
// Message collection helpers (used by useWebSocket and useMessagePolling)
// ---------------------------------------------------------------------------

export const hasAssistantAudio = (message: Message): boolean =>
  Boolean(message.audioUrl || message.audioPath || message.audioStorageId)

const hasMessageChanged = (current: Message, incoming: Message): boolean => {
  const currentBlocks = JSON.stringify(current.blocks ?? [])
  const incomingBlocks = JSON.stringify(incoming.blocks ?? [])
  return (
    current.content !== incoming.content ||
    current.schemaVersion !== incoming.schemaVersion ||
    currentBlocks !== incomingBlocks ||
    current.audioPath !== incoming.audioPath ||
    current.audioUrl !== incoming.audioUrl ||
    current.audioStorageId !== incoming.audioStorageId ||
    current.mediaType !== incoming.mediaType ||
    current.durationMs !== incoming.durationMs ||
    current.timestamp !== incoming.timestamp
  )
}

const mergeMessagesSafely = (current: Message, incoming: Message): Message => {
  const shouldReplaceContent =
    incoming.content.trim().length > 0 || current.content.trim().length === 0
  return {
    ...current,
    ...incoming,
    content: shouldReplaceContent ? incoming.content : current.content,
    schemaVersion: incoming.schemaVersion ?? current.schemaVersion,
    blocks: incoming.blocks ?? current.blocks,
    metadata: incoming.metadata ?? current.metadata,
    audioPath: incoming.audioPath ?? current.audioPath,
    audioUrl: incoming.audioUrl ?? current.audioUrl,
    audioStorageId: incoming.audioStorageId ?? current.audioStorageId,
    mediaType: incoming.mediaType ?? current.mediaType,
    durationMs: incoming.durationMs ?? current.durationMs,
    timestamp: incoming.timestamp ?? current.timestamp,
  }
}

export const mergeMessageCollection = (
  prev: Message[],
  incomingMessages: Message[],
): Message[] => {
  if (incomingMessages.length === 0) return prev

  const next = [...prev]
  let didChange = false

  incomingMessages.forEach((incoming) => {
    const byIdIndex = next.findIndex(
      (message) => String(message.id) === String(incoming.id),
    )

    if (byIdIndex >= 0) {
      const merged = mergeMessagesSafely(next[byIdIndex], incoming)
      if (hasMessageChanged(next[byIdIndex], merged)) {
        next[byIdIndex] = merged
        didChange = true
      }
      return
    }

    const byRoleContentIndex = next.findIndex(
      (message) =>
        message.role === incoming.role && message.content === incoming.content,
    )

    if (byRoleContentIndex >= 0) {
      const merged = mergeMessagesSafely(next[byRoleContentIndex], incoming)
      if (hasMessageChanged(next[byRoleContentIndex], merged)) {
        next[byRoleContentIndex] = merged
        didChange = true
      }
      return
    }

    next.push(incoming)
    didChange = true
  })

  return didChange ? next : prev
}

export const normalizeAiMessagePayload = (payload: AiMessagePayload): Message => {
  const messageText = payload.text ?? payload.content ?? ""
  const messageId = payload.message_id ?? payload.messageId ?? `ws-${Date.now()}`

  return normalizeBackendMessage({
    id: messageId,
    role: "assistant",
    content: messageText,
    schemaVersion: payload.schemaVersion,
    schema_version: payload.schema_version,
    blocks: payload.blocks,
    audioPath: payload.audioPath,
    audio_path: payload.audio_path,
    audioUrl: payload.audioUrl,
    audio_url: payload.audio_url,
    mediaType: payload.mediaType,
    media_type: payload.media_type,
    metadata: payload.metadata,
  })
}
