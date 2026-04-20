'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCharacterEditorialSection } from '@/hooks/useCharacterEditorialSection'
import type { CharacterEditorial, EditorialCharacter, EditorialUiCopy } from '@/types/editorial.types'
import { createEmptyEditorial, mergeEditorialContent } from '@/utils/editorial.utils'
import { HeroPage, HeroPageSkeleton } from '@/components/ui/features/characters/context-prototypes/editorial/pages/HeroPage'
import { OverviewPage, OverviewPageSkeleton } from '@/components/ui/features/characters/context-prototypes/editorial/pages/OverviewPage'
import { TimelinePage, TimelinePageSkeleton } from '@/components/ui/features/characters/context-prototypes/editorial/pages/TimelinePage'
import { ConversationPage, ConversationPageSkeleton } from '@/components/ui/features/characters/context-prototypes/editorial/pages/ConversationPage'
import { GalleryPage, GalleryPageSkeleton } from '@/components/ui/features/characters/context-prototypes/editorial/pages/GalleryPage'

interface CharacterEditorialPanelProps {
  character: EditorialCharacter
  heroEditorial: CharacterEditorial
  themeColor: string
  themeColorLight: string
  characterImageUrl: string | null
  avatarImageError: boolean
  isHeroLoading: boolean
  onAvatarImageError: () => void
}

export function CharacterEditorialPanel({
  character,
  heroEditorial,
  themeColor,
  themeColorLight,
  characterImageUrl,
  avatarImageError,
  isHeroLoading,
  onAvatarImageError,
}: CharacterEditorialPanelProps) {
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
          'Figura clave de la historia intelectual moderna, con ideas y debates que marcaron su época.',
        ),
        content: (
          <HeroPage
            character={character}
            themeColor={themeColor}
            themeColorLight={themeColorLight}
            characterImageUrl={characterImageUrl}
            avatarImageError={avatarImageError}
            onAvatarImageError={onAvatarImageError}
            featuredQuotes={featuredQuotes}
          />
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
          <OverviewPage
            character={character}
            themeColor={themeColor}
            quickFacts={quickFacts}
            overviewIntro={overviewIntro}
            overviewCards={overviewCards}
            hasOverviewResolved={hasOverviewResolved}
            isLoading={overviewSection.isLoading}
          />
        ),
        skeleton: <OverviewPageSkeleton />,
        isLoading: isOverviewPageLoading,
      },
      {
        id: 'timeline',
        eyebrow: 'Etapa 3',
        title: getCopy('timeline_section_title', 'Hitos e ideas fundamentales'),
        description: 'Momentos decisivos para entender cómo evolucionaron sus ideas y su impacto histórico.',
        content: (
          <TimelinePage
            timelineEntries={timelineEntries}
            currentTimelineIndex={currentTimelineIndex}
            setCurrentTimelineIndex={setCurrentTimelineIndex}
            activeTimelineEntry={activeTimelineEntry}
            activeTimelineRelationships={activeTimelineRelationships}
            themeColor={themeColor}
            isLoading={timelineSection.isLoading}
          />
        ),
        skeleton: <TimelinePageSkeleton />,
        isLoading: isTimelinePageLoading,
      },
      {
        id: 'conversation',
        eyebrow: 'Etapa 4',
        title: getCopy('relations_section_title', 'Relaciones, controversias y preguntas'),
        description: 'Personas, tensiones intelectuales y preguntas iniciales que revelan distintas facetas del personaje.',
        content: (
          <ConversationPage
            conversationCards={conversationCards}
            character={character}
            voiceDescription={voiceDescription}
            prompts={editorial.prompts}
            themeColor={themeColor}
            hasRelationsResolved={hasRelationsResolved}
            isLoading={relationsSection.isLoading}
          />
        ),
        skeleton: <ConversationPageSkeleton />,
        isLoading: isConversationPageLoading,
      },
      {
        id: 'gallery',
        eyebrow: 'Etapa 5',
        title: getCopy('gallery_section_title', 'Galeria visual'),
        description: 'Un recorrido por retratos e imágenes de archivo que sitúan al personaje en distintos momentos de su trayectoria pública.',
        content: (
          <GalleryPage
            galleryImages={galleryImages}
            currentGalleryIndex={currentGalleryIndex}
            setCurrentGalleryIndex={setCurrentGalleryIndex}
            characterName={character.name}
            getCopy={getCopy}
            goToChat={goToChat}
            isLoading={gallerySection.isLoading}
          />
        ),
        skeleton: <GalleryPageSkeleton />,
        isLoading: isGalleryPageLoading,
      },
    ],
    [
      character,
      avatarImageError,
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