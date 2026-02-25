export interface Message {
  id: number | string
  role: "user" | "assistant"
  content: string
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
  voice_id: string
}

export interface Conversation {
  id: string
  createdAt: string
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
  text: string
  content?: string
  audio?: string
  audioPath?: string | null
  audio_path?: string | null
  audioUrl?: string | null
  audio_url?: string | null
  mediaType?: string | null
  media_type?: string | null
}

export interface StatusDisplayConfig {
  color: string
  icon: string
  bg: string
}
