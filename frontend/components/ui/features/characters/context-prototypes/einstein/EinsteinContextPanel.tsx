'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Atom, Brain, Clock3, Lightbulb, MapPin, MessageSquare, Quote, Sparkles, Users } from 'lucide-react'
import type { Character } from '@/types/chat.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { einsteinPrototypeContent } from '@/components/ui/features/characters/context-prototypes/einstein/einstein-context.mock'

const TIMELINE_PHASE_LABELS = ['Descubrimientos', 'Nueva gravedad', 'Reconocimiento', 'Exilio', 'Responsabilidad']
const TIMELINE_RELATIONSHIP_MAP = [[0], [0], [0, 1], [1, 2], [2]]

interface EinsteinContextPanelProps {
  character: Character
  themeColor: string
  themeColorLight: string
  characterImageUrl: string | null
  avatarImageError: boolean
  onAvatarImageError: () => void
}

export function EinsteinContextPanel({
  character,
  themeColor,
  themeColorLight,
  characterImageUrl,
  avatarImageError,
  onAvatarImageError,
}: EinsteinContextPanelProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

  const activeTimelineEntry = einsteinPrototypeContent.timeline[currentTimelineIndex]
  const activeTimelineRelationships = useMemo(
    () => (TIMELINE_RELATIONSHIP_MAP[currentTimelineIndex] ?? [])
      .map((index: number) => einsteinPrototypeContent.relationships[index])
      .filter(Boolean),
    [currentTimelineIndex],
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
        title: 'Albert Einstein',
        description: 'Fisico nacido en 1879, figura central de la relatividad y una de las voces intelectuales más influyentes del siglo XX.',
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
                    {einsteinPrototypeContent.eyebrow}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {einsteinPrototypeContent.ambientLabel}
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
                        <span>{character.years ?? '1879 - 1955'}</span>
                      </div>
                      <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">{character.name}</h1>
                      <p className="text-[13px] text-muted-foreground">{character.role}</p>
                      <p className="max-w-xl text-[13px] leading-5 text-foreground/85">{einsteinPrototypeContent.summary}</p>
                    </div>
                  </div>
                </div>

                <section className="grid gap-3 sm:grid-cols-2">
                  {einsteinPrototypeContent.featuredQuotes.map((quoteItem, index) => (
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
      },
      {
        id: 'overview',
        eyebrow: 'Etapa 2',
        title: 'Contexto biografico e intelectual',
        description: 'Una síntesis de los rasgos, obsesiones y preguntas que atravesaron su vida y su obra científica.',
        content: (
          <div className="space-y-4 pb-1">
            <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
              <CardContent className="space-y-3 px-4">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  <Brain className="h-4 w-4 text-primary" />
                  Antes de hablar con Einstein
                </div>
                <p className="text-[13px] leading-5 text-muted-foreground">{einsteinPrototypeContent.atmosphere}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {einsteinPrototypeContent.quickFacts.map((fact) => (
                    <div key={fact.label} className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{fact.label}</p>
                      <p className="mt-1.5 text-[13px] font-medium leading-5 text-foreground">{fact.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-4">
              {einsteinPrototypeContent.contextCards.slice(1).map((card, index) => {
                const Icon = index === 0 ? Lightbulb : Sparkles

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
      },
      {
        id: 'timeline',
        eyebrow: 'Etapa 3',
        title: 'Hitos e ideas fundamentales',
        description: 'Del annus mirabilis a Princeton: momentos decisivos para entender cómo cambió la física moderna.',
        content: (
          <div className="space-y-4 pb-1">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Timeline conversacional
              </div>
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[22px] border border-border/70 bg-card/70 px-3 py-4">
                  <div className="absolute left-6 right-6 top-[34px] h-px bg-border" />
                  <div className="relative flex gap-2 overflow-x-auto pb-1">
                    {einsteinPrototypeContent.timeline.map((entry, index) => {
                      const isActive = index === currentTimelineIndex

                      return (
                        <button
                          key={`${entry.year}-${entry.title}`}
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
                            {entry.year}
                          </div>
                          <div className="min-w-0">
                            <p className={cn('text-[11px] font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                              {TIMELINE_PHASE_LABELS[index] ?? 'Hito'}
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
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {TIMELINE_PHASE_LABELS[currentTimelineIndex] ?? 'Hito histórico'}
                        </p>
                        <h3 className="mt-1 text-[16px] font-semibold text-foreground">{activeTimelineEntry.title}</h3>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        {activeTimelineEntry.year}
                      </div>
                    </div>

                    <p className="text-[13px] leading-5 text-muted-foreground">
                      {activeTimelineEntry.description}
                    </p>

                    <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Lectura del momento
                      </p>
                      <p className="mt-2 text-[13px] leading-5 text-foreground/85">
                        {currentTimelineIndex === 0 && 'En 1905, Einstein todavía trabajaba en la oficina de patentes de Berna. Desde fuera no parecía una figura central de la ciencia, pero ese año publicó artículos que cambiaron la manera de pensar la luz, el movimiento y el tiempo.'}
                        {currentTimelineIndex === 1 && 'La relatividad general cambió la imagen clásica del universo: la gravedad dejó de ser una fuerza entre masas para convertirse en geometría del espacio-tiempo. Fue una de las formulaciones más audaces de la física moderna.'}
                        {currentTimelineIndex === 2 && 'El Nobel y la fama internacional convirtieron a Einstein en algo más que un científico. Su imagen empezó a circular como símbolo del genio moderno y lo llevó a ocupar un lugar central en la cultura pública del siglo XX.'}
                        {currentTimelineIndex === 3 && 'El exilio transformó su vida intelectual y personal. La salida de Alemania no fue solo un desplazamiento geográfico: marcó una ruptura con Europa y una conciencia cada vez más intensa del vínculo entre ciencia e historia.'}
                        {currentTimelineIndex === 4 && 'Después de la Segunda Guerra Mundial, Einstein habló cada vez más sobre desarme, paz y responsabilidad. Su legado ya no se limitaba a las ecuaciones: también incluía una reflexión pública sobre el destino moral de la técnica.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        Ecosistema humano del hito
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeTimelineRelationships.map((relationship: (typeof einsteinPrototypeContent.relationships)[number]) => (
                          <div key={relationship.name} className="rounded-2xl border border-border/70 bg-muted/35 p-3.5">
                            <p className="text-[13px] font-semibold text-foreground">{relationship.name}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{relationship.role}</p>
                            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{relationship.dynamic}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        ),
      },
      {
        id: 'conversation',
        eyebrow: 'Etapa 4',
        title: 'Relaciones, controversias y preguntas',
        description: 'Personas, tensiones intelectuales y preguntas iniciales que revelan distintas facetas de Einstein.',
        content: (
          <div className="space-y-4 pb-1">
            <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {einsteinPrototypeContent.contextCards[0]?.eyebrow}
                      </p>
                      <h3 className="mt-1 text-[15px] font-semibold text-foreground">
                        {einsteinPrototypeContent.contextCards[0]?.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
                        {einsteinPrototypeContent.contextCards[0]?.body}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Su voz intelectual
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {einsteinPrototypeContent.tonePills.map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-foreground/75"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-dashed border-border bg-muted/25 p-3.5 text-[13px] leading-5 text-muted-foreground">
                    Cuando explica una idea, Einstein suele partir de una imagen concreta antes de llegar a la abstracción: un tren en movimiento, una luz que viaja, un observador que cae. Su tono combina paciencia didáctica, precisión conceptual y una ironía suave cuando discute límites o paradojas.
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Preguntas para iniciar la conversación
              </div>
              <div className="grid gap-3">
                {einsteinPrototypeContent.promptCards.map((promptCard) => (
                  <Card key={promptCard.prompt} className="gap-0 rounded-[22px] border-border/70 bg-card py-0 transition-colors hover:bg-muted/20">
                    <CardContent className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{promptCard.label}</p>
                          <p className="mt-1.5 text-[13px] font-medium leading-5 text-foreground">{promptCard.prompt}</p>
                          <p className="mt-1 text-[13px] text-muted-foreground">{promptCard.note}</p>
                        </div>
                        <div
                          className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          Inicio
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        ),
      },
      {
        id: 'gallery',
        eyebrow: 'Etapa 5',
        title: 'Galeria visual',
        description: 'Un recorrido por retratos e imágenes de archivo que sitúan a Einstein en distintos momentos de su vida pública.',
        content: (
          <div className="space-y-4 pb-1">
            <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
              <CardContent className="space-y-4 px-4">
                <div className="overflow-hidden rounded-[20px] border border-border bg-background">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={einsteinPrototypeContent.galleryImages[currentGalleryIndex]?.src}
                      alt={einsteinPrototypeContent.galleryImages[currentGalleryIndex]?.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 border-t border-border px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-foreground">
                        Imagen {currentGalleryIndex + 1} de {einsteinPrototypeContent.galleryImages.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setCurrentGalleryIndex((prev) => (prev === 0 ? einsteinPrototypeContent.galleryImages.length - 1 : prev - 1))}
                          aria-label="Imagen anterior"
                          className="rounded-full"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setCurrentGalleryIndex((prev) => (prev + 1) % einsteinPrototypeContent.galleryImages.length)}
                          aria-label="Imagen siguiente"
                          className="rounded-full"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-[13px] leading-5 text-muted-foreground">
                      {einsteinPrototypeContent.galleryImages[currentGalleryIndex]?.caption}
                    </p>
                    {einsteinPrototypeContent.galleryImages[currentGalleryIndex]?.credit ? (
                      <footer className="text-[11px] leading-4 text-muted-foreground">
                        {einsteinPrototypeContent.galleryImages[currentGalleryIndex]?.credit}
                      </footer>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border/70 bg-muted/25 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Conversa a partir de una imagen</p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      Usa el retrato o el contexto histórico de esta foto para abrir una conversación más situada y concreta.
                    </p>
                  </div>
                  <Button type="button" onClick={goToChat} className="rounded-full">
                    Iniciar conversación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      },
    ],
    [
      avatarImageError,
      character.biography,
      character.category,
      character.name,
      character.role,
      character.years,
      characterImageUrl,
      currentTimelineIndex,
      onAvatarImageError,
      themeColor,
      themeColorLight,
      currentGalleryIndex,
      activeTimelineEntry,
      activeTimelineRelationships,
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
          {currentPage.content}
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