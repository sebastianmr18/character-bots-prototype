'use client'

import { Atom, MessageSquare, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { EditorialBlock, EditorialCharacter, EditorialContextCard, EditorialPrompt } from '@/types/editorial.types'

interface ConversationPageProps {
  conversationCards: EditorialContextCard[]
  character: EditorialCharacter
  voiceDescription: EditorialBlock | undefined
  prompts: EditorialPrompt[]
  themeColor: string
  hasRelationsResolved: boolean
  isLoading: boolean
}

export function ConversationPageSkeleton() {
  return (
    <div className="space-y-4 pb-1">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
          <CardContent className="px-4 py-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-muted" />
              <div className="w-full space-y-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-11/12 rounded bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
          <CardContent className="space-y-3 px-4">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-7 w-20 rounded-full bg-muted" />
              ))}
            </div>
            <div className="h-20 w-full rounded-2xl bg-muted" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="h-5 w-56 rounded bg-muted" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="gap-0 rounded-[22px] border-border/70 bg-card py-0">
              <CardContent className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full space-y-2">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-10/12 rounded bg-muted" />
                  </div>
                  <div className="h-6 w-14 rounded-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export function ConversationPage({
  conversationCards,
  character,
  voiceDescription,
  prompts,
  themeColor,
  hasRelationsResolved,
  isLoading,
}: ConversationPageProps) {
  return (
    <div className="space-y-4 pb-1">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        {conversationCards[0] ? (
          <Card className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
            <CardContent className="px-4 py-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: themeColor }}>
                  <Atom className="h-5 w-5" />
                </div>
                <div>
                  {conversationCards[0].eyebrow ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{conversationCards[0].eyebrow}</p>
                  ) : null}
                  <h3 className="mt-1 text-[15px] font-semibold text-foreground">{conversationCards[0].title}</h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{conversationCards[0].body}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
            <CardContent className="px-4 py-4 text-[13px] leading-5 text-muted-foreground">
              No hay tarjetas editoriales cargadas para esta sección.
            </CardContent>
          </Card>
        )}

        <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
          <CardContent className="space-y-3 px-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              Su voz intelectual
            </div>
            <div className="flex flex-wrap gap-2">
              {(character.keyTraits ?? []).map((pill) => (
                <span key={pill} className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-foreground/75">
                  {pill}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-muted/25 p-3.5 text-[13px] leading-5 text-muted-foreground">
              {voiceDescription?.body ?? 'Este personaje todavía no tiene una descripción editorial de voz cargada.'}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Preguntas para iniciar la conversación
        </div>
        {isLoading && prompts.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
            Cargando recursos conversacionales...
          </div>
        ) : null}
        <div className="grid gap-3">
          {prompts.map((promptCard) => (
            <Card key={promptCard.prompt} className="gap-0 rounded-[22px] border-border/70 bg-card py-0 transition-colors hover:bg-muted/20">
              <CardContent className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {promptCard.label ? (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{promptCard.label}</p>
                    ) : null}
                    <p className="mt-1.5 text-[13px] font-medium leading-5 text-foreground">{promptCard.prompt}</p>
                    {promptCard.note ? <p className="mt-1 text-[13px] text-muted-foreground">{promptCard.note}</p> : null}
                  </div>
                  <div className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white" style={{ backgroundColor: themeColor }}>
                    {promptCard.ctaLabel ?? 'Inicio'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {hasRelationsResolved && !isLoading && prompts.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
          Esta sección todavía no tiene preguntas iniciales cargadas.
        </div>
      ) : null}
    </div>
  )
}
