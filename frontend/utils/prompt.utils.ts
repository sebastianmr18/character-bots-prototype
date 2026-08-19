import type { ParsedSystemPrompt } from '@/types/prompt.types'

/**
 * Extrae las secciones `system_identity` y `behavior_rules` del prompt XML.
 */
export function parseSystemPrompt(raw: string): ParsedSystemPrompt {
  const identityMatch = raw.match(/<system_identity>\n([\s\S]*?)\n<\/system_identity>/)
  const rulesMatch = raw.match(/<behavior_rules>\n([\s\S]*?)\n<\/behavior_rules>/)

  return {
    identity: identityMatch?.[1]?.trim() ?? raw.trim(),
    behaviorRules: rulesMatch?.[1]?.trim() ?? '',
  }
}

export const PROMPT_MODE_LABELS: Record<'interview' | 'call' | 'debate', string> = {
  interview: 'Entrevista',
  call: 'Llamada en vivo',
  debate: 'Debate',
}
