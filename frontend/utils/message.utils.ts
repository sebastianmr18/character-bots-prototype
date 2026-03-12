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
}

type BackendCharacter = Omit<Character, "voiceId" | "vectorDbName"> & {
  voiceId?: string | null
  voice_id?: string | null
  vectorDbName?: string | null
  vector_db_name?: string | null
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
  }
}

export const normalizeBackendMessages = (messages: BackendMessage[] = []): Message[] => {
  return messages.map(normalizeBackendMessage)
}

export const normalizeBackendCharacter = (character: BackendCharacter): Character => ({
  ...character,
  voiceId: character.voiceId ?? character.voice_id ?? null,
  vectorDbName: character.vectorDbName ?? character.vector_db_name ?? null,
})

export const normalizeBackendCharacters = (characters: BackendCharacter[] = []): Character[] => {
  return characters.map(normalizeBackendCharacter)
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
