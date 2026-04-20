'use client'

import { Brain, Lightbulb, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { EditorialBlock, EditorialCharacter, EditorialContextCard, EditorialFact } from '@/types/editorial.types'

interface OverviewPageProps {
  character: EditorialCharacter
  themeColor: string
  quickFacts: EditorialFact[]
  overviewIntro: EditorialBlock | undefined
  overviewCards: EditorialContextCard[]
  hasOverviewResolved: boolean
  isLoading: boolean
}

export function OverviewPageSkeleton() {
  return (
    <div className="space-y-4 pb-1">
      <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
        <CardContent className="space-y-3 px-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
            <CardContent className="px-4 py-4">
              <div className="flex items-start gap-3.5">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export function OverviewPage({
  character,
  themeColor,
  quickFacts,
  overviewIntro,
  overviewCards,
  hasOverviewResolved,
  isLoading,
}: OverviewPageProps) {
  return (
    <div className="space-y-4 pb-1">
      <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
        <CardContent className="space-y-3 px-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <Brain className="h-4 w-4 text-primary" />
            Antes de iniciar la conversación
          </div>
          {isLoading && !overviewIntro && quickFacts.length === 0 ? (
            <p className="text-[13px] leading-5 text-muted-foreground">Cargando contexto editorial...</p>
          ) : null}
          {overviewIntro ? (
            <p className="text-[13px] leading-5 text-muted-foreground">{overviewIntro.body}</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{fact.label}</p>
                <p className="mt-1.5 text-[13px] font-medium leading-5 text-foreground">{fact.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {hasOverviewResolved && !isLoading && overviewCards.length === 0 ? (
          <Card className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
            <CardContent className="px-4 py-4 text-[13px] leading-5 text-muted-foreground">
              Esta sección todavía no tiene tarjetas editoriales cargadas.
            </CardContent>
          </Card>
        ) : null}
        {overviewCards.map((card) => {
          const Icon = card.iconKey === 'sparkles' ? Sparkles : Lightbulb

          return (
            <Card key={card.title} className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
              <CardContent className="px-4 py-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    {card.eyebrow ? (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{card.eyebrow}</p>
                    ) : null}
                    <h3 className="mt-1 text-[15px] font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{card.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {character.biography ? (
        <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
          <CardContent className="space-y-3 px-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Biografía base actual
            </div>
            <p className="text-[13px] leading-5 text-muted-foreground">{character.biography}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
