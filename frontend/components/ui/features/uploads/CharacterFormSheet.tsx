'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/utils/api.utils'
import { EditorialQuotesTab } from './editorial/EditorialQuotesTab'
import { EditorialFactsTab } from './editorial/EditorialFactsTab'
import { EditorialPromptsTab } from './editorial/EditorialPromptsTab'
import { EditorialContextCardsTab } from './editorial/EditorialContextCardsTab'
import { EditorialTimelineTab } from './editorial/EditorialTimelineTab'
import { EditorialRelationshipsTab } from './editorial/EditorialRelationshipsTab'
import { EditorialGalleryTab } from './editorial/EditorialGalleryTab'
import { EditorialBlocksTab } from './editorial/EditorialBlocksTab'
import type { Character } from '@/types/chat.types'
import type { CharacterEditorial } from '@/types/editorial.types'

type Props = {
  mode: 'create' | 'edit'
  character?: Character
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}

type BasicFormData = {
  name: string
  role: string
  biography: string
  description: string
  publicSlug: string
  keyTraits: string
  speechTics: string
  quote: string
  badge: string
  topics: string
  voiceId: string
  vectorDbName: string
  themeColor: string
  themeColorLight: string
  imageUrl: string
  backgroundImageUrl: string
  ambientLabel: string
  contentVariant: string
  years: string
  category: string
  epoch: string
  isPublic: boolean
}

const emptyForm: BasicFormData = {
  name: '', role: '', biography: '', description: '', publicSlug: '',
  keyTraits: '', speechTics: '', quote: '', badge: '', topics: '',
  voiceId: '', vectorDbName: '', themeColor: '', themeColorLight: '',
  imageUrl: '', backgroundImageUrl: '', ambientLabel: '', contentVariant: '',
  years: '', category: '', epoch: '', isPublic: false,
}

function characterToForm(c: Character): BasicFormData {
  const ec = c as Character & Record<string, unknown>
  return {
    name: c.name ?? '',
    role: c.role ?? '',
    biography: c.biography ?? '',
    description: c.description ?? '',
    publicSlug: c.publicSlug ?? '',
    keyTraits: Array.isArray(ec.keyTraits) ? (ec.keyTraits as string[]).join(', ') : String(ec.keyTraits ?? ''),
    speechTics: Array.isArray(ec.speechTics) ? (ec.speechTics as string[]).join(', ') : String(ec.speechTics ?? ''),
    quote: String(ec.quote ?? ''),
    badge: String(ec.badge ?? ''),
    topics: Array.isArray(c.topics) ? c.topics.join(', ') : '',
    voiceId: c.voiceId ?? '',
    vectorDbName: c.vectorDbName ?? '',
    themeColor: c.themeColor ?? '',
    themeColorLight: c.themeColorLight ?? '',
    imageUrl: c.imageUrl ?? '',
    backgroundImageUrl: c.backgroundImageUrl ?? '',
    ambientLabel: String(ec.ambientLabel ?? ''),
    contentVariant: String(ec.contentVariant ?? ''),
    years: c.years ?? '',
    category: c.category ?? '',
    epoch: String(ec.epoch ?? ''),
    isPublic: Boolean(ec.isPublic ?? false),
  }
}

function splitTrimmed(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

export function CharacterFormSheet({ mode, character, open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState<BasicFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorial, setEditorial] = useState<CharacterEditorial | null>(null)
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && character) {
      setForm(characterToForm(character))
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [open, mode, character])

  const loadEditorial = useCallback(async () => {
    if (!character?.id) return
    setIsLoadingEditorial(true)
    try {
      const res = await fetch(`/api/characters/${character.id}/editorial`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { editorial: CharacterEditorial }
      setEditorial(data.editorial)
    } finally {
      setIsLoadingEditorial(false)
    }
  }, [character?.id])

  useEffect(() => {
    if (open && mode === 'edit') {
      void loadEditorial()
    }
  }, [open, mode, loadEditorial])

  async function handleBasicSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim() || !form.biography.trim()) {
      setError('Nombre, rol y biografía son obligatorios.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      role: form.role.trim(),
      biography: form.biography.trim(),
      ...(form.description.trim() && { description: form.description.trim() }),
      ...(form.publicSlug.trim() && { publicSlug: form.publicSlug.trim() }),
      ...(form.keyTraits.trim() && { keyTraits: splitTrimmed(form.keyTraits) }),
      ...(form.speechTics.trim() && { speechTics: splitTrimmed(form.speechTics) }),
      ...(form.quote.trim() && { quote: form.quote.trim() }),
      ...(form.badge.trim() && { badge: form.badge.trim() }),
      ...(form.topics.trim() && { topics: splitTrimmed(form.topics) }),
      ...(form.voiceId.trim() && { voiceId: form.voiceId.trim() }),
      ...(form.vectorDbName.trim() && { vectorDbName: form.vectorDbName.trim() }),
      ...(form.themeColor.trim() && { themeColor: form.themeColor.trim() }),
      ...(form.themeColorLight.trim() && { themeColorLight: form.themeColorLight.trim() }),
      ...(form.imageUrl.trim() && { imageUrl: form.imageUrl.trim() }),
      ...(form.backgroundImageUrl.trim() && { backgroundImageUrl: form.backgroundImageUrl.trim() }),
      ...(form.ambientLabel.trim() && { ambientLabel: form.ambientLabel.trim() }),
      ...(form.contentVariant.trim() && { contentVariant: form.contentVariant.trim() }),
      ...(form.years.trim() && { years: form.years.trim() }),
      ...(form.category.trim() && { category: form.category.trim() }),
      ...(form.epoch.trim() && { epoch: form.epoch.trim() }),
      isPublic: form.isPublic,
    }

    const url = mode === 'edit' && character ? `/api/characters/${character.id}` : '/api/characters'
    const method = mode === 'edit' ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setError(await getErrorMessage(res))
        return
      }
      onSuccess()
      if (mode === 'create') onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const f = form
  const set = (patch: Partial<BasicFormData>) => setForm((prev) => ({ ...prev, ...patch }))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-3 border-b shrink-0">
          <SheetTitle className="font-serif text-xl">
            {mode === 'create' ? 'Nuevo personaje' : `Editar: ${character?.name ?? ''}`}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="basico" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-3 shrink-0 flex-wrap h-auto gap-1 justify-start bg-transparent">
            <TabsTrigger value="basico">Datos básicos</TabsTrigger>
            {mode === 'edit' && (
              <>
                <TabsTrigger value="quotes">Citas</TabsTrigger>
                <TabsTrigger value="facts">Hechos</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="context-cards">Tarjetas</TabsTrigger>
                <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
                <TabsTrigger value="relationships">Relaciones</TabsTrigger>
                <TabsTrigger value="gallery">Galería</TabsTrigger>
                <TabsTrigger value="blocks">Bloques</TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 py-4">
              <TabsContent value="basico" className="mt-0">
                <form onSubmit={handleBasicSubmit} className="space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Campos requeridos</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Nombre *</Label><Input value={f.name} onChange={(e) => set({ name: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Rol *</Label><Input value={f.role} onChange={(e) => set({ role: e.target.value })} placeholder="ej: Científico, Filósofo" /></div>
                  </div>
                  <div className="space-y-1"><Label>Biografía *</Label><Textarea rows={4} value={f.biography} onChange={(e) => set({ biography: e.target.value })} /></div>

                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">Contenido</p>
                  <div className="space-y-1"><Label>Descripción</Label><Textarea rows={2} value={f.description} onChange={(e) => set({ description: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Cita destacada</Label><Input value={f.quote} onChange={(e) => set({ quote: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Rasgos clave (separados por coma)</Label><Input value={f.keyTraits} onChange={(e) => set({ keyTraits: e.target.value })} placeholder="ej: curioso, analítico, sarcástico" /></div>
                  <div className="space-y-1"><Label>Tics del habla (separados por coma)</Label><Input value={f.speechTics} onChange={(e) => set({ speechTics: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Temas (separados por coma)</Label><Input value={f.topics} onChange={(e) => set({ topics: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Badge</Label><Input value={f.badge} onChange={(e) => set({ badge: e.target.value })} /></div>

                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">Clasificación</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1"><Label>Categoría</Label><Input value={f.category} onChange={(e) => set({ category: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Época</Label><Input value={f.epoch} onChange={(e) => set({ epoch: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Años</Label><Input value={f.years} onChange={(e) => set({ years: e.target.value })} placeholder="ej: 1879-1955" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Variante de contenido</Label><Input value={f.contentVariant} onChange={(e) => set({ contentVariant: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Slug público</Label><Input value={f.publicSlug} onChange={(e) => set({ publicSlug: e.target.value })} /></div>
                  </div>

                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">Visual</p>
                  <div className="space-y-1"><Label>URL de imagen</Label><Input value={f.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://..." /></div>
                  <div className="space-y-1"><Label>URL de imagen de fondo</Label><Input value={f.backgroundImageUrl} onChange={(e) => set({ backgroundImageUrl: e.target.value })} placeholder="https://..." /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1"><Label>Color tema</Label><div className="flex gap-2"><Input type="color" className="w-10 p-1 h-9" value={f.themeColor || '#000000'} onChange={(e) => set({ themeColor: e.target.value })} /><Input value={f.themeColor} onChange={(e) => set({ themeColor: e.target.value })} placeholder="#rrggbb" /></div></div>
                    <div className="space-y-1"><Label>Color tema claro</Label><div className="flex gap-2"><Input type="color" className="w-10 p-1 h-9" value={f.themeColorLight || '#ffffff'} onChange={(e) => set({ themeColorLight: e.target.value })} /><Input value={f.themeColorLight} onChange={(e) => set({ themeColorLight: e.target.value })} placeholder="#rrggbb" /></div></div>
                    <div className="space-y-1"><Label>Etiqueta ambiental</Label><Input value={f.ambientLabel} onChange={(e) => set({ ambientLabel: e.target.value })} /></div>
                  </div>

                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">IA</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Voice ID</Label><Input value={f.voiceId} onChange={(e) => set({ voiceId: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Vector DB Name</Label><Input value={f.vectorDbName} onChange={(e) => set({ vectorDbName: e.target.value })} /></div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="isPublic" checked={f.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="h-4 w-4" />
                    <Label htmlFor="isPublic">Personaje público</Label>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {mode === 'create' ? 'Crear personaje' : 'Guardar cambios'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {mode === 'edit' && character && (
                <>
                  <TabsContent value="quotes" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialQuotesTab characterId={character.id} items={editorial?.quotes ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="facts" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialFactsTab characterId={character.id} items={editorial?.facts ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="prompts" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialPromptsTab characterId={character.id} items={editorial?.prompts ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="context-cards" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialContextCardsTab characterId={character.id} items={editorial?.contextCards ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="timeline" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialTimelineTab characterId={character.id} items={editorial?.timelineEntries ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="relationships" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialRelationshipsTab characterId={character.id} items={editorial?.relationships ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="gallery" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialGalleryTab characterId={character.id} items={editorial?.galleryImages ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                  <TabsContent value="blocks" className="mt-0">
                    {isLoadingEditorial ? <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : <EditorialBlocksTab characterId={character.id} items={editorial?.editorialBlocks ?? []} onRefresh={loadEditorial} />}
                  </TabsContent>
                </>
              )}
            </div>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
