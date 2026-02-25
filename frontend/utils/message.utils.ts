import type { Message } from "@/types/chat.types"

type BackendMessage = {
  id: number | string
  role: "user" | "assistant"
  content: string
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
  conversationId?: string
  conversation_id?: string
}

export const normalizeBackendMessage = (message: BackendMessage): Message => ({
  id: message.id,
  role: message.role,
  content: message.content,
  audioPath: message.audioPath ?? message.audio_path ?? null,
  audioUrl: message.audioUrl ?? message.audio_url ?? null,
  audioStorageId: message.audioStorageId ?? message.audio_storage_id ?? null,
  mediaType: message.mediaType ?? message.media_type ?? null,
  durationMs: message.durationMs ?? message.duration_ms ?? null,
  timestamp: message.timestamp,
  conversationId: message.conversationId ?? message.conversation_id,
})

export const normalizeBackendMessages = (messages: BackendMessage[] = []): Message[] => {
  return messages.map(normalizeBackendMessage)
}
