export type MessageSchemaVersion = "v1_plain" | "v2_blocks"

export type UIComponentName = "InfoCard"

export interface TextBlock {
  id?: string
  type: "text"
  content: string
}

export interface ComponentBlock {
  id?: string
  type: "component"
  componentName: UIComponentName | string
  props?: Record<string, unknown>
}

export type MessageBlock = TextBlock | ComponentBlock

export interface Message {
  id: number | string
  role: "user" | "assistant" | "system"
  content: string
  schemaVersion?: MessageSchemaVersion
  blocks?: MessageBlock[]
  metadata?: Record<string, unknown>
  audioPath?: string | null
  audioUrl?: string | null
  audioStorageId?: string | null
  mediaType?: string | null
  durationMs?: number | null
  timestamp?: string
  conversationId?: string
  speakerId?: string | null
  speakerName?: string | null
}

export interface CharacterReference {
    id: string;
    name: string;
}

export interface Character {
  id: string
  name: string
  description: string
  role: string
  biography: string
  voiceId?: string | null
  vectorDbName?: string | null
  themeColor?: string | null
  themeColorLight?: string | null
  years?: string | null
  category?: string | null
  topics?: string[] | null
  imageUrl?: string | null
  backgroundImageUrl?: string | null
}

export interface Conversation {
  id: string
  createdAt: string
  characterId?: string
  character: Character
  messages: Message[]
  mode?: "single" | "debate" | "interview"
  secondaryCharacter?: Character | null
}

export interface SuggestionsPayload {
  conversationId: string
  suggestions: string[]
}

export type DebateTurnOrder = "A" | "B" | "forced"

export type DebateSkipReason =
  | "manual_user"
  | "auto_low_confidence"
  | "not_applicable"
  | "strategy"
  | "unknown"

export interface DebateWarningPayload {
  code: string
  message: string
  stage: string
  retryable: boolean
}

export interface DebateMessageMetadata extends Record<string, unknown> {
  debateTraceId?: string
  turnOrder?: DebateTurnOrder | null
  warning?: DebateWarningPayload | null
  isForced?: boolean
  isSkipped?: boolean
  skipReason?: DebateSkipReason
  skipReasonDetail?: string | null
  skipConfidence?: number | null
}

export interface DebateStartedPayload {
  conversationId: string
  traceId: string
}

export interface DebateUserAckPayload {
  conversationId: string
  traceId: string
  user_message_id: number | string
  user_text: string
}

export interface DebateTypingPayload {
  conversationId: string
  traceId: string
  speaker_id: string
  speaker_name: string
  turn_order: DebateTurnOrder
  is_forced?: boolean
}

export interface DebateTurnPayload {
  conversationId: string
  traceId: string
  message_id: number | string
  text: string
  speaker_id: string
  speaker_name: string
  turn_order: DebateTurnOrder
  is_forced?: boolean
  audio?: string | null
  warning?: DebateWarningPayload | null
}

export interface DebateTurnSkippedPayload {
  conversationId: string
  traceId: string
  speaker_id: string
  speaker_name: string
  turn_order: DebateTurnOrder
  is_forced?: boolean
  reason: DebateSkipReason
  reason_detail?: string
  confidence?: number
}

export interface DebateRoundCompletePayload {
  conversationId: string
  traceId: string
  responses_count?: number
  skips_count?: number
  next_speaker_id?: string
  warnings?: DebateWarningPayload[]
}

export interface DebateErrorPayload {
  traceId: string
  message: string
  code: string
  stage: string
  retryable: boolean
}

export interface WebSocketMessage {
  type: "init" | "status" | "transcription_result" | "text_response" | "audio_response" | "error"
  conversation_id?: string
  character_id?: string
  message?: string
  text?: string
  audio?: string
}

export interface AiMessagePayload {
  message_id?: number | string
  messageId?: number | string
  text?: string
  content?: string
  schemaVersion?: MessageSchemaVersion
  schema_version?: MessageSchemaVersion
  blocks?: MessageBlock[]
  audio?: string
  audioPath?: string | null
  audio_path?: string | null
  audioUrl?: string | null
  audio_url?: string | null
  mediaType?: string | null
  media_type?: string | null
  metadata?: Record<string, unknown>
  suggestions?: string[]
  suggested_questions?: string[]
}

export interface StatusDisplayConfig {
  color: string
  icon: string
  bg: string
}

export interface CharacterKnowledgeBaseUploadResponse {
  message: string
  characterId: string
  collectionName: string
  fileName: string
  mimeType: string
  chunksIndexed: number
  indexedAt: string
}

export type UserRole = 'admin' | 'user'

export interface MeProfile {
  id: string
  username: string
  role: UserRole
  createdAt: string
}
