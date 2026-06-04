'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { getErrorMessage } from '@/utils/api.utils'
import type { EditorialGalleryImage } from '@/types/editorial.types'

type Props = {
  characterId: string
  items: EditorialGalleryImage[]
  onRefresh: () => void
}

type FormData = { imageUrl: string; alt: string; caption: string; credit: string; sourceUrl: string; sortOrder: string; isCover: boolean }

const empty: FormData = { imageUrl: '', alt: '', caption: '', credit: '', sourceUrl: '', sortOrder: '0', isCover: false }

export function EditorialGalleryTab({ characterId, items, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EditorialGalleryImage | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openCreate() { setEditing(null); setForm(empty); setError(null); setIsOpen(true) }
  function openEdit(item: EditorialGalleryImage) {
    setEditing(item)
    setForm({ imageUrl: item.imageUrl, alt: item.alt ?? '', caption: item.caption ?? '', credit: item.credit ?? '', sourceUrl: item.sourceUrl ?? '', sortOrder: String(item.sortOrder), isCover: item.isCover })
    setError(null); setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.imageUrl.trim()) { setError('La URL de la imagen es obligatoria.'); return }
    setIsSubmitting(true); setError(null)
    const payload = { imageUrl: form.imageUrl.trim(), alt: form.alt.trim() || null, caption: form.caption.trim() || null, credit: form.credit.trim() || null, sourceUrl: form.sourceUrl.trim() || null, sortOrder: Number(form.sortOrder), isCover: form.isCover }
    const url = editing ? `/api/characters/${characterId}/gallery/${editing.id}` : `/api/characters/${characterId}/gallery`
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { setError(await getErrorMessage(res)); return }
      setIsOpen(false); onRefresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally { setIsSubmitting(false) }
  }

  async function handleDelete(id: string) {
    try { await fetch(`/api/characters/${characterId}/gallery/${id}`, { method: 'DELETE' }); onRefresh() } finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={openCreate}><Plus className="mr-1 h-3 w-3" />Añadir imagen</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Sin imágenes aún.</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between rounded border p-2 text-sm">
          <div className="flex gap-2 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.alt ?? ''} className="h-12 w-12 rounded object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div><p className="font-medium line-clamp-1">{item.alt ?? item.imageUrl}</p>{item.isCover && <span className="text-xs bg-primary/10 text-primary px-1 rounded">Portada</span>}</div>
          </div>
          <div className="flex gap-1 ml-2 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(item.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Editar imagen' : 'Nueva imagen'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1"><Label>URL de imagen *</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-1"><Label>Alt text</Label><Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} /></div>
            <div className="space-y-1"><Label>Caption</Label><Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Crédito</Label><Input value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} /></div>
              <div className="space-y-1"><Label>Orden</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>URL fuente</Label><Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="isCover" checked={form.isCover} onChange={(e) => setForm({ ...form, isCover: e.target.checked })} /><Label htmlFor="isCover">Imagen de portada</Label></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletingId && void handleDelete(deletingId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
