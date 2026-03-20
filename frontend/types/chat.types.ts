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
  role: "user" | "assistant"
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
}

export interface Conversation {
  id: string
  createdAt: string
  characterId?: string
  character: Character
  messages: Message[]
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
}

export interface StatusDisplayConfig {
  color: string
  icon: string
  bg: string
}
