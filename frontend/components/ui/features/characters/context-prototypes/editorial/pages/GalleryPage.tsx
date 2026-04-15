'use client'

import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { EditorialGalleryImage } from '@/types/editorial.types'

interface GalleryPageProps {
  galleryImages: EditorialGalleryImage[]
  currentGalleryIndex: number
  setCurrentGalleryIndex: (next: number) => void
  characterName: string
  getCopy: (key: string, fallback: string) => string
  goToChat: () => void
  isLoading: boolean
}

export function GalleryPageSkeleton() {
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

export function GalleryPage({
  galleryImages,
  currentGalleryIndex,
  setCurrentGalleryIndex,
  characterName,
  getCopy,
  goToChat,
  isLoading,
}: GalleryPageProps) {
  const activeImage = galleryImages[currentGalleryIndex]

  return (
    <div className="space-y-4 pb-1">
      {isLoading && galleryImages.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-background/70 p-4 text-[13px] leading-5 text-muted-foreground">
          Cargando galería editorial...
        </div>
      ) : null}
      <Card className="gap-4 rounded-[24px] border-border/70 bg-card py-4">
        <CardContent className="space-y-4 px-4">
          <div className="overflow-hidden rounded-[20px] border border-border bg-background">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {activeImage ? (
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.alt ?? characterName}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
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
                    onClick={() => setCurrentGalleryIndex(galleryImages.length === 0 ? 0 : currentGalleryIndex === 0 ? galleryImages.length - 1 : currentGalleryIndex - 1)}
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
                    onClick={() => setCurrentGalleryIndex(galleryImages.length === 0 ? 0 : (currentGalleryIndex + 1) % galleryImages.length)}
                    aria-label="Imagen siguiente"
                    className="rounded-full"
                    disabled={galleryImages.length === 0}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {activeImage?.caption ? (
                <p className="text-[13px] leading-5 text-muted-foreground">{activeImage.caption}</p>
              ) : null}
              {activeImage?.credit ? (
                <footer className="text-[11px] leading-4 text-muted-foreground">{activeImage.credit}</footer>
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
  )
}
