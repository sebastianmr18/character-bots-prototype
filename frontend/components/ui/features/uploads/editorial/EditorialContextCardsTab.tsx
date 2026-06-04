'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { getErrorMessage } from '@/utils/api.utils'
import type { EditorialContextCard } from '@/types/editorial.types'

type Props = {
  characterId: string
  items: EditorialContextCard[]
  onRefresh: () => void
}

type FormData = { title: string; body: string; pageKey: string; eyebrow: string; iconKey: string; sortOrder: string }

const empty: FormData = { title: '', body: '', pageKey: '', eyebrow: '', iconKey: '', sortOrder: '0' }

export function EditorialContextCardsTab({ characterId, items, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EditorialContextCard | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openCreate() { setEditing(null); setForm(empty); setError(null); setIsOpen(true) }
  function openEdit(item: EditorialContextCard) {
    setEditing(item)
    setForm({ title: item.title, body: item.body, pageKey: item.pageKey ?? '', eyebrow: item.eyebrow ?? '', iconKey: item.iconKey ?? '', sortOrder: String(item.sortOrder) })
    setError(null); setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) { setError('Título y cuerpo son obligatorios.'); return }
    setIsSubmitting(true); setError(null)
    const payload = { title: form.title.trim(), body: form.body.trim(), pageKey: form.pageKey.trim() || null, eyebrow: form.eyebrow.trim() || null, iconKey: form.iconKey.trim() || null, sortOrder: Number(form.sortOrder) }
    const url = editing ? `/api/characters/${characterId}/context-cards/${editing.id}` : `/api/characters/${characterId}/context-cards`
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { setError(await getErrorMessage(res)); return }
      setIsOpen(false); onRefresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally { setIsSubmitting(false) }
  }

  async function handleDelete(id: string) {
    try { await fetch(`/api/characters/${characterId}/context-cards/${id}`, { method: 'DELETE' }); onRefresh() } finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={openCreate}><Plus className="mr-1 h-3 w-3" />Añadir tarjeta</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Sin tarjetas de contexto aún.</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between rounded border p-2 text-sm">
          <div><p className="font-medium">{item.title}</p><p className="text-muted-foreground text-xs line-clamp-2">{item.body}</p></div>
          <div className="flex gap-1 ml-2 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(item.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Editar tarjeta' : 'Nueva tarjeta'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1"><Label>Cuerpo *</Label><Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Clave de página</Label><Input value={form.pageKey} onChange={(e) => setForm({ ...form, pageKey: e.target.value })} /></div>
              <div className="space-y-1"><Label>Eyebrow</Label><Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} /></div>
              <div className="space-y-1"><Label>Icono</Label><Input value={form.iconKey} onChange={(e) => setForm({ ...form, iconKey: e.target.value })} /></div>
              <div className="space-y-1"><Label>Orden</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
            </div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletingId && void handleDelete(deletingId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
