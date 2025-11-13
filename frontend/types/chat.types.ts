export interface Message {
  id: number
  role: "user" | "assistant"
  content: string
}

export interface Character {
  id: string
  name: string
  description: string
}

export interface WebSocketMessage {
  type: "init" | "status" | "transcription" | "text_response" | "audio_response" | "error"
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
