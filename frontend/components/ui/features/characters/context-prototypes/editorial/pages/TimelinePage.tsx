'use client'

import { Clock3, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { EditorialRelationship, EditorialTimelineEntry } from '@/types/editorial.types'

interface TimelinePageProps {
  timelineEntries: EditorialTimelineEntry[]
  currentTimelineIndex: number
  setCurrentTimelineIndex: (value: number) => void
  activeTimelineEntry: EditorialTimelineEntry | null
  activeTimelineRelationships: EditorialRelationship[]
  themeColor: string
  isLoading: boolean
}

export function TimelinePageSkeleton() {
  return (
    <div className="space-y-4 pb-1">
      <section className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-4">
          <div className="rounded-[22px] border border-border/70 bg-card/70 px-3 py-4">
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex min-w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>

          <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4 shadow-sm">
            <CardContent className="space-y-4 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-full space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-56" />
                </div>
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-10/12" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export function TimelinePage({
  timelineEntries,
  currentTimelineIndex,
  setCurrentTimelineIndex,
  activeTimelineEntry,
  activeTimelineRelationships,
  themeColor,
  isLoading,
}: TimelinePageProps) {
  return (
    <div className="space-y-4 pb-1">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Clock3 className="h-4 w-4 text-primary" />
          Timeline conversacional
        </div>
        <div className="space-y-4">
          {isLoading && timelineEntries.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
              Cargando timeline editorial...
            </div>
          ) : null}
          <div className="relative overflow-hidden rounded-[22px] border border-border/70 bg-card/70 px-3 py-4">
            <div className="absolute left-6 right-6 top-[34px] h-px bg-border" />
            <div className="relative flex gap-2 overflow-x-auto pb-1">
              {timelineEntries.map((entry, index) => {
                const isActive = index === currentTimelineIndex

                return (
                  <button
                    key={`${entry.yearLabel}-${entry.title}`}
                    type="button"
                    onClick={() => setCurrentTimelineIndex(index)}
                    onMouseEnter={() => setCurrentTimelineIndex(index)}
                    onFocus={() => setCurrentTimelineIndex(index)}
                    className={cn(
                      'group relative z-10 flex min-w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-2 text-center transition-colors',
                      isActive ? 'bg-background shadow-sm' : 'hover:bg-background/70'
                    )}
                  >
                    <div
                      className={cn(
                        'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all',
                        isActive ? 'border-transparent text-white shadow-sm' : 'border-border bg-card text-muted-foreground'
                      )}
                      style={isActive ? { backgroundColor: themeColor } : undefined}
                    >
                      {entry.yearLabel}
                    </div>
                    <div className="min-w-0">
                      <p className={cn('text-[11px] font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                        {entry.phaseLabel ?? 'Hito'}
                      </p>
                      <p className={cn('line-clamp-2 text-[10px]', isActive ? 'text-foreground/80' : 'text-muted-foreground')}>
                        {entry.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4 shadow-sm">
            <CardContent className="space-y-4 px-4">
              {activeTimelineEntry ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {activeTimelineEntry.phaseLabel ?? 'Hito histórico'}
                      </p>
                      <h3 className="mt-1 text-[16px] font-semibold text-foreground">{activeTimelineEntry.title}</h3>
                    </div>
                    <div className="rounded-full px-3 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: themeColor }}>
                      {activeTimelineEntry.yearLabel}
                    </div>
                  </div>

                  <p className="text-[13px] leading-5 text-muted-foreground">{activeTimelineEntry.description}</p>

                  {activeTimelineEntry.narrativeText ? (
                    <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lectura del momento</p>
                      <p className="mt-2 text-[13px] leading-5 text-foreground/85">{activeTimelineEntry.narrativeText}</p>
                    </div>
                  ) : null}

                  {activeTimelineRelationships.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        Ecosistema humano del hito
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeTimelineRelationships.map((relationship) => (
                          <div key={relationship.id} className="rounded-2xl border border-border/70 bg-muted/35 p-3.5">
                            <p className="text-[13px] font-semibold text-foreground">{relationship.name}</p>
                            {relationship.role ? (
                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{relationship.role}</p>
                            ) : null}
                            {relationship.dynamic ? (
                              <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{relationship.dynamic}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
                  Este personaje todavía no tiene hitos editoriales cargados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
