'use client'

import Image from 'next/image'
import { MapPin, Quote, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { EditorialCharacter, EditorialQuote } from '@/types/editorial.types'

interface HeroPageProps {
  character: EditorialCharacter
  themeColor: string
  themeColorLight: string
  characterImageUrl: string | null
  avatarImageError: boolean
  onAvatarImageError: () => void
  featuredQuotes: EditorialQuote[]
}

export function HeroPageSkeleton() {
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

export function HeroPage({
  character,
  themeColor,
  themeColorLight,
  characterImageUrl,
  avatarImageError,
  onAvatarImageError,
  featuredQuotes,
}: HeroPageProps) {
  return (
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
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ backgroundColor: themeColor, opacity: 0.24 }} />
              <div
                className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-background shadow-2xl sm:h-32 sm:w-32"
                style={{ backgroundColor: themeColor }}
              >
                {characterImageUrl && !avatarImageError ? (
                  <Image
                    src={characterImageUrl}
                    alt={character.name}
                    fill
                    unoptimized
                    sizes="128px"
                    className="object-cover"
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
                  <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-medium text-foreground">
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
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: themeColor }}>
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
  )
}
