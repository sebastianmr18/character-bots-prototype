'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Atom, Brain, Clock3, Lightbulb, MapPin, MessageSquare, Quote, Sparkles, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useCharacterEditorialSection } from '@/hooks/useCharacterEditorialSection'
import type { CharacterEditorial, EditorialCharacter, EditorialUiCopy } from '@/types/editorial.types'
import { createEmptyEditorial, mergeEditorialContent } from '@/utils/editorial.utils'

interface EinsteinContextPanelProps {
  character: EditorialCharacter
  heroEditorial: CharacterEditorial
  themeColor: string
  themeColorLight: string
  characterImageUrl: string | null
  avatarImageError: boolean
  isHeroLoading: boolean
  onAvatarImageError: () => void
}

function HeroPageSkeleton() {
  return (
    <div className="space-y-4 pb-1">
      <div className="overflow-hidden rounded-[28px] border border-border bg-background">
        <div className="space-y-4 px-4 pb-5 pt-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Skeleton className="mx-auto h-28 w-28 rounded-full sm:mx-0 sm:h-32 sm:w-32" />
            <div className="min-w-0 flex-1 rounded-[24px] border border-border/70 bg-card/85 p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
            </div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="gap-3 rounded-[24px] border-border/70 bg-card/85 py-3 shadow-xl backdrop-blur-md">
                <CardContent className="px-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="mt-1 h-8 w-8 rounded-full" />
                    <div className="w-full space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-10/12" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

function OverviewPageSkeleton() {
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

function TimelinePageSkeleton() {
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

function ConversationPageSkeleton() {
  return (
    <div className="space-y-4 pb-1">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
          <CardContent className="px-4 py-4">
            <div className="flex items-start gap-3.5">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
          <CardContent className="space-y-3 px-4">
            <Skeleton className="h-5 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-7 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-5 w-56" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="gap-0 rounded-[22px] border-border/70 bg-card py-0">
              <CardContent className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function GalleryPageSkeleton() {
  return (
    <div className="space-y-4 pb-1">
      <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
        <CardContent className="space-y-4 px-4">
          <div className="overflow-hidden rounded-[20px] border border-border bg-background">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 border-t border-border px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>

          <div className="rounded-[20px] border border-border/70 bg-muted/25 px-4 py-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-10 w-40 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function EinsteinContextPanel({
  character,
  heroEditorial,
  themeColor,
  themeColorLight,
  characterImageUrl,
  avatarImageError,
  isHeroLoading,
  onAvatarImageError,
}: EinsteinContextPanelProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

  const overviewSection = useCharacterEditorialSection(character.id, 'overview', true)
  const timelineSection = useCharacterEditorialSection(character.id, 'timeline', true)
  const relationsSection = useCharacterEditorialSection(character.id, 'relations', true)
  const gallerySection = useCharacterEditorialSection(character.id, 'gallery', true)

  const editorialSections = useMemo(
    () => [
      heroEditorial,
      overviewSection.data?.editorial,
      timelineSection.data?.editorial,
      relationsSection.data?.editorial,
      gallerySection.data?.editorial,
    ].filter((section): section is CharacterEditorial => Boolean(section)),
    [
      gallerySection.data?.editorial,
      heroEditorial,
      overviewSection.data?.editorial,
      relationsSection.data?.editorial,
      timelineSection.data?.editorial,
    ],
  )

  const editorial = useMemo(
    () => editorialSections.reduce(
      (accumulator, sectionEditorial) => mergeEditorialContent(accumulator, sectionEditorial),
      createEmptyEditorial(),
    ),
    [editorialSections],
  )

  const copiesByKey = useMemo(
    () => Object.fromEntries(editorial.uiCopies.map((copy: EditorialUiCopy) => [copy.copyKey, copy.text])),
    [editorial.uiCopies],
  )
  const quickFacts = useMemo(
    () => editorial.facts.filter((fact) => fact.sectionKey === 'quick_facts'),
    [editorial.facts],
  )
  const overviewCards = useMemo(
    () => editorial.contextCards.filter((card) => card.pageKey === 'overview'),
    [editorial.contextCards],
  )
  const conversationCards = useMemo(
    () => editorial.contextCards.filter((card) => card.pageKey === 'conversation'),
    [editorial.contextCards],
  )
  const featuredQuotes = useMemo(() => {
    if (editorial.quotes.length > 0) {
      return editorial.quotes
    }

    return character.quote
      ? [
          {
            id: 'legacy-quote',
            text: character.quote,
            attribution: character.name,
            sortOrder: 0,
            isFeatured: true,
          },
        ]
      : []
  }, [character.name, character.quote, editorial.quotes])
  const timelineEntries = editorial.timelineEntries
  const galleryImages = editorial.galleryImages
  const overviewIntro = editorial.editorialBlocks.find((block) => block.blockKey === 'overview_intro')
  const voiceDescription = editorial.editorialBlocks.find((block) => block.blockKey === 'voice_description')
  const activeTimelineEntry = timelineEntries[currentTimelineIndex] ?? null
  const activeTimelineRelationships = useMemo(
    () => activeTimelineEntry?.relationships ?? [],
    [activeTimelineEntry],
  )
  const hasOverviewResolved = Boolean(overviewSection.data) || Boolean(overviewSection.error)
  const hasRelationsResolved = Boolean(relationsSection.data) || Boolean(relationsSection.error)
  const isOverviewPageLoading = overviewSection.isLoading && !hasOverviewResolved
  const isTimelinePageLoading = timelineSection.isLoading && timelineEntries.length === 0
  const isConversationPageLoading = relationsSection.isLoading && !hasRelationsResolved
  const isGalleryPageLoading = gallerySection.isLoading && galleryImages.length === 0

  useEffect(() => {
    setCurrentTimelineIndex((prev) => {
      if (timelineEntries.length === 0) {
        return 0
      }

      return Math.min(prev, timelineEntries.length - 1)
    })
  }, [timelineEntries.length])

  useEffect(() => {
    setCurrentGalleryIndex((prev) => {
      if (galleryImages.length === 0) {
        return 0
      }

      return Math.min(prev, galleryImages.length - 1)
    })
  }, [galleryImages.length])

  const getCopy = useCallback(
    (key: string, fallback: string) => copiesByKey[key] ?? fallback,
    [copiesByKey],
  )

  const goToChat = () => {
    const input = document.querySelector('textarea, input[type="text"]') as HTMLTextAreaElement | HTMLInputElement | null
    input?.focus()
  }

  const pages = useMemo(
    () => [
      {
        id: 'hero',
        eyebrow: 'Etapa 1',
        title: getCopy('page_title', character.name),
        description: getCopy(
          'page_subtitle',
          'Fisico nacido en 1879, figura central de la relatividad y una de las voces intelectuales más influyentes del siglo XX.',
        ),
        content: (
          <div className="space-y-4 pb-1">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-background">
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(circle at top left, ${themeColorLight} 0%, transparent 42%),
                    radial-gradient(circle at 85% 18%, color-mix(in srgb, ${themeColor} 24%, var(--card)) 0%, transparent 28%),
                    linear-gradient(145deg, color-mix(in srgb, ${themeColorLight} 50%, var(--card)) 0%, color-mix(in srgb, var(--card) 82%, transparent) 48%, color-mix(in srgb, ${themeColor} 10%, var(--background)) 100%)
                  `,
                }}
              />

              <div className="absolute inset-0 opacity-40">
                <svg className="h-full w-full" viewBox="0 0 600 320" fill="none" preserveAspectRatio="none">
                  <path d="M20 240C120 170 210 280 310 220C390 175 470 110 580 135" stroke={themeColor} strokeOpacity="0.26" strokeWidth="2" />
                  <path d="M40 86H140M300 94H380M420 250H520" stroke={themeColor} strokeOpacity="0.20" strokeWidth="2" strokeDasharray="8 10" />
                  <circle cx="118" cy="82" r="42" stroke={themeColor} strokeOpacity="0.12" />
                  <circle cx="465" cy="220" r="58" stroke={themeColor} strokeOpacity="0.12" />
                </svg>
              </div>

              <div className="relative z-10 space-y-4 px-4 pb-5 pt-4 sm:px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {character.role ?? character.category ?? 'Perfil'}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {character.ambientLabel ?? 'Sin contexto editorial'}
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="relative mx-auto w-fit sm:mx-0">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl"
                      style={{ backgroundColor: themeColor, opacity: 0.24 }}
                    />
                    <div
                      className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-background shadow-2xl sm:h-32 sm:w-32"
                      style={{ backgroundColor: themeColor }}
                    >
                      {characterImageUrl && !avatarImageError ? (
                        <img
                          src={characterImageUrl}
                          alt={character.name}
                          className="h-full w-full object-cover"
                          onError={onAvatarImageError}
                        />
                      ) : (
                        <span className="font-serif text-4xl font-bold text-white sm:text-5xl">{character.name[0]}</span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 rounded-[24px] border border-border/70 bg-card/85 p-4 backdrop-blur-md">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span
                          className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-medium text-foreground"
                        >
                          {character.category ?? 'Ciencia'}
                        </span>
                        <span>{character.years ?? '1879 - '}</span>
                      </div>
                      <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">{character.name}</h1>
                      <p className="max-w-xl text-[13px] leading-5 text-foreground/85">{character.description}</p>
                    </div>
                  </div>
                </div>

                <section className="grid gap-3 sm:grid-cols-2">
                  {featuredQuotes.map((quoteItem, index) => (
                    <Card key={`${quoteItem.text}-${index}`} className="gap-3 rounded-[24px] border-border/70 bg-card/85 py-3 shadow-xl backdrop-blur-md">
                      <CardContent className="px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: themeColor }}
                          >
                            <Quote className="h-4 w-4" />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[13px] leading-5 text-foreground">“{quoteItem.text}”</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{quoteItem.attribution}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </section>
              </div>
            </div>
          </div>
        ),
        skeleton: <HeroPageSkeleton />,
        isLoading: isHeroLoading,
      },
      {
        id: 'overview',
        eyebrow: 'Etapa 2',
        title: getCopy('overview_section_title', 'Contexto biografico e intelectual'),
        description: 'Una síntesis de los rasgos, obsesiones y preguntas que atravesaron su vida y su obra científica.',
        content: (
          <div className="space-y-4 pb-1">
            <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
              <CardContent className="space-y-3 px-4">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  <Brain className="h-4 w-4 text-primary" />
                  Antes de hablar con Einstein
                </div>
                {overviewSection.isLoading && !overviewIntro && quickFacts.length === 0 ? (
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
              {hasOverviewResolved && !overviewSection.isLoading && overviewCards.length === 0 ? (
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
        ),
        skeleton: <OverviewPageSkeleton />,
        isLoading: isOverviewPageLoading,
      },
      {
        id: 'timeline',
        eyebrow: 'Etapa 3',
        title: getCopy('timeline_section_title', 'Hitos e ideas fundamentales'),
        description: 'Del annus mirabilis a Princeton: momentos decisivos para entender cómo cambió la física moderna.',
        content: (
          <div className="space-y-4 pb-1">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Timeline conversacional
              </div>
              <div className="space-y-4">
                {timelineSection.isLoading && timelineEntries.length === 0 ? (
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
                          <div
                            className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                            style={{ backgroundColor: themeColor }}
                          >
                            {activeTimelineEntry.yearLabel}
                          </div>
                        </div>

                        <p className="text-[13px] leading-5 text-muted-foreground">
                          {activeTimelineEntry.description}
                        </p>

                        {activeTimelineEntry.narrativeText ? (
                          <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Lectura del momento
                            </p>
                            <p className="mt-2 text-[13px] leading-5 text-foreground/85">
                              {activeTimelineEntry.narrativeText}
                            </p>
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
        ),
        skeleton: <TimelinePageSkeleton />,
        isLoading: isTimelinePageLoading,
      },
      {
        id: 'conversation',
        eyebrow: 'Etapa 4',
        title: getCopy('relations_section_title', 'Relaciones, controversias y preguntas'),
        description: 'Personas, tensiones intelectuales y preguntas iniciales que revelan distintas facetas de Einstein.',
        content: (
          <div className="space-y-4 pb-1">
            <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              {conversationCards[0] ? (
                <Card className="gap-0 rounded-[24px] border-border/70 bg-card py-0 shadow-sm">
                  <CardContent className="px-4 py-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Atom className="h-5 w-5" />
                      </div>
                      <div>
                        {conversationCards[0].eyebrow ? (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {conversationCards[0].eyebrow}
                          </p>
                        ) : null}
                        <h3 className="mt-1 text-[15px] font-semibold text-foreground">
                          {conversationCards[0].title}
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
                          {conversationCards[0].body}
                        </p>
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
                      <span
                        key={pill}
                        className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-foreground/75"
                      >
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
              {relationsSection.isLoading && editorial.prompts.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
                  Cargando recursos conversacionales...
                </div>
              ) : null}
              <div className="grid gap-3">
                {editorial.prompts.map((promptCard) => (
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
                        <div
                          className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          {promptCard.ctaLabel ?? 'Inicio'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {hasRelationsResolved && !relationsSection.isLoading && editorial.prompts.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
                Esta sección todavía no tiene preguntas iniciales cargadas.
              </div>
            ) : null}
          </div>
        ),
        skeleton: <ConversationPageSkeleton />,
        isLoading: isConversationPageLoading,
      },
      {
        id: 'gallery',
        eyebrow: 'Etapa 5',
        title: getCopy('gallery_section_title', 'Galeria visual'),
        description: 'Un recorrido por retratos e imágenes de archivo que sitúan a Einstein en distintos momentos de su vida pública.',
        content: (
          <div className="space-y-4 pb-1">
            {gallerySection.isLoading && galleryImages.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
                Cargando galería editorial...
              </div>
            ) : null}
            <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
              <CardContent className="space-y-4 px-4">
                <div className="overflow-hidden rounded-[20px] border border-border bg-background">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {galleryImages[currentGalleryIndex] ? (
                      <img
                        src={galleryImages[currentGalleryIndex].imageUrl}
                        alt={galleryImages[currentGalleryIndex].alt ?? character.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-[13px] text-muted-foreground">
                        No hay imágenes editoriales cargadas para este personaje.
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-border px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-foreground">
                        Imagen {Math.min(currentGalleryIndex + 1, Math.max(galleryImages.length, 1))} de {Math.max(galleryImages.length, 1)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setCurrentGalleryIndex((prev) => (galleryImages.length === 0 ? 0 : prev === 0 ? galleryImages.length - 1 : prev - 1))}
                          aria-label="Imagen anterior"
                          className="rounded-full"
                          disabled={galleryImages.length === 0}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setCurrentGalleryIndex((prev) => (galleryImages.length === 0 ? 0 : (prev + 1) % galleryImages.length))}
                          aria-label="Imagen siguiente"
                          className="rounded-full"
                          disabled={galleryImages.length === 0}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {galleryImages[currentGalleryIndex]?.caption ? (
                      <p className="text-[13px] leading-5 text-muted-foreground">
                        {galleryImages[currentGalleryIndex].caption}
                      </p>
                    ) : null}
                    {galleryImages[currentGalleryIndex]?.credit ? (
                      <footer className="text-[11px] leading-4 text-muted-foreground">
                        {galleryImages[currentGalleryIndex].credit}
                      </footer>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border/70 bg-muted/25 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{getCopy('image_prompt_title', 'Conversa a partir de una imagen')}</p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      {getCopy('image_prompt_body', 'Usa el retrato o el contexto histórico de esta foto para abrir una conversación más situada y concreta.')}
                    </p>
                  </div>
                  <Button type="button" onClick={goToChat} className="rounded-full">
                    {getCopy('start_conversation_label', 'Iniciar conversación')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
        skeleton: <GalleryPageSkeleton />,
        isLoading: isGalleryPageLoading,
      },
    ],
    [
      avatarImageError,
      character.biography,
      character.category,
      character.description,
      character.name,
      character.years,
      character.role,
      character.ambientLabel,
      character.keyTraits,
      characterImageUrl,
      editorial.prompts,
      gallerySection.isLoading,
      hasOverviewResolved,
      hasRelationsResolved,
      isConversationPageLoading,
      isGalleryPageLoading,
      isHeroLoading,
      isOverviewPageLoading,
      isTimelinePageLoading,
      onAvatarImageError,
      overviewSection.isLoading,
      relationsSection.isLoading,
      themeColor,
      themeColorLight,
      timelineSection.isLoading,
      currentGalleryIndex,
      currentTimelineIndex,
      activeTimelineEntry,
      activeTimelineRelationships,
      conversationCards,
      featuredQuotes,
      galleryImages,
      getCopy,
      overviewCards,
      overviewIntro,
      quickFacts,
      timelineEntries,
      voiceDescription,
    ],
  )

  const currentPage = pages[currentPageIndex]
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === pages.length - 1

  const goToPreviousPage = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0))
  }

  const goToNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(prev + 1, pages.length - 1))
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background lg:h-[calc(100vh-8rem)]">
      <div className="flex min-h-0 flex-1 flex-col px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{currentPage.title}</h2>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{currentPage.description}</p>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {currentPageIndex + 1} / {pages.length}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {currentPage.isLoading ? currentPage.skeleton : currentPage.content}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousPage}
            disabled={isFirstPage}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {pages.map((page, index) => (
              <button
                key={page.id}
                type="button"
                aria-label={`Ir a ${page.title}`}
                aria-current={currentPageIndex === index ? 'page' : undefined}
                onClick={() => setCurrentPageIndex(index)}
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  currentPageIndex === index ? 'w-8' : 'w-2.5 bg-border'
                )}
                style={currentPageIndex === index ? { backgroundColor: themeColor } : undefined}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={goToNextPage}
            disabled={isLastPage}
            className="rounded-full"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}