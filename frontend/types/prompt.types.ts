export type PromptMode = 'interview' | 'call' | 'debate'

export interface SystemPromptResponse {
  characterId: string
  characterName: string
  mode: PromptMode
  systemPrompt: string
}

export interface ParsedSystemPrompt {
  identity: string
  behaviorRules: string
}
