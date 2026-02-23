export interface Message {
  id: number
  role: "user" | "assistant"
  content: string
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

export interface StatusDisplayConfig {
  color: string
  icon: string
  bg: string
}
