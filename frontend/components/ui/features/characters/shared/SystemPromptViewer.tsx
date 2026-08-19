'use client'

import { useState } from 'react'
import { ScrollText, RefreshCw } from 'lucide-react'
import type { PromptMode } from '@/types/prompt.types'
import { useSystemPrompt } from '@/hooks/useSystemPrompt'
import { parseSystemPrompt, PROMPT_MODE_LABELS } from '@/utils/prompt.utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface SystemPromptViewerProps {
  characterId: string | null
  mode: PromptMode
  characterName?: string
}

function PromptLine({ line }: { line: string }) {
  const isGuardrail = line.startsWith('GUARDRAIL:')
  const isLanguageRule = line.startsWith('IDIOMA OBLIGATORIO:')

  return (
    <span
      className={cn(
        isGuardrail && 'text-amber-600 dark:text-amber-400',
        isLanguageRule && 'text-sky-600 dark:text-sky-400',
      )}
    >
      {line}
      {'\n'}
    </span>
  )
}

function PromptSection({
  title,
  content,
}: {
  title: string
  content: string
}) {
  if (!content.trim()) {
    return null
  }

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <pre className="whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-foreground font-mono">
        {content.split('\n').map((line, index) => (
          <PromptLine key={`${index}-${line.slice(0, 12)}`} line={line} />
        ))}
      </pre>
    </section>
  )
}

/** Panel lateral que muestra el system prompt enviado al LLM según el modo activo. */
export function SystemPromptViewer({
  characterId,
  mode,
  characterName,
}: SystemPromptViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isLoading, error, reload } = useSystemPrompt(characterId, mode, isOpen)

  const parsed = data ? parseSystemPrompt(data.systemPrompt) : null
  const displayName = data?.characterName ?? characterName ?? 'Personaje'

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto shrink-0 gap-2"
          disabled={!characterId}
        >
          <ScrollText className="h-4 w-4" />
          <span className="hidden sm:inline">Ver prompt</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-left">System Prompt</SheetTitle>
          <SheetDescription className="text-left">
            Instrucciones que recibe el agente en modo{' '}
            <strong>{PROMPT_MODE_LABELS[mode]}</strong> para{' '}
            <strong>{displayName}</strong>.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between border-b border-border px-1 py-3">
          <p className="text-xs text-muted-foreground">
            Se genera dinámicamente a partir de los datos actuales del personaje.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void reload()}
            disabled={isLoading || !characterId}
            aria-label="Recargar prompt"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {isLoading && !data ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-sm font-medium text-destructive">No se pudo cargar el prompt</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : null}

          {parsed ? (
            <>
              <PromptSection title="Identidad del personaje" content={parsed.identity} />
              <PromptSection title="Reglas de comportamiento" content={parsed.behaviorRules} />
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
