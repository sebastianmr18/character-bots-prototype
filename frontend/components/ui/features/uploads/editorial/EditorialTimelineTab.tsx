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
import type { EditorialTimelineEntry } from '@/types/editorial.types'

type Props = {
  characterId: string
  items: EditorialTimelineEntry[]
  onRefresh: () => void
}

type FormData = { yearLabel: string; title: string; description: string; phaseLabel: string; narrativeText: string; sortOrder: string }

const empty: FormData = { yearLabel: '', title: '', description: '', phaseLabel: '', narrativeText: '', sortOrder: '0' }

export function EditorialTimelineTab({ characterId, items, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EditorialTimelineEntry | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openCreate() { setEditing(null); setForm(empty); setError(null); setIsOpen(true) }
  function openEdit(item: EditorialTimelineEntry) {
    setEditing(item)
    setForm({ yearLabel: item.yearLabel, title: item.title, description: item.description, phaseLabel: item.phaseLabel ?? '', narrativeText: item.narrativeText ?? '', sortOrder: String(item.sortOrder) })
    setError(null); setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.yearLabel.trim() || !form.title.trim() || !form.description.trim()) { setError('Año, título y descripción son obligatorios.'); return }
    setIsSubmitting(true); setError(null)
    const payload = { yearLabel: form.yearLabel.trim(), title: form.title.trim(), description: form.description.trim(), phaseLabel: form.phaseLabel.trim() || null, narrativeText: form.narrativeText.trim() || null, sortOrder: Number(form.sortOrder) }
    const url = editing ? `/api/characters/${characterId}/timeline/${editing.id}` : `/api/characters/${characterId}/timeline`
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { setError(await getErrorMessage(res)); return }
      setIsOpen(false); onRefresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally { setIsSubmitting(false) }
  }

  async function handleDelete(id: string) {
    try { await fetch(`/api/characters/${characterId}/timeline/${id}`, { method: 'DELETE' }); onRefresh() } finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={openCreate}><Plus className="mr-1 h-3 w-3" />Añadir entrada</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Sin entradas de línea de tiempo aún.</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between rounded border p-2 text-sm">
          <div><p className="font-medium">{item.yearLabel} — {item.title}</p><p className="text-muted-foreground text-xs line-clamp-2">{item.description}</p></div>
          <div className="flex gap-1 ml-2 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(item.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Editar entrada' : 'Nueva entrada'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Año/período *</Label><Input value={form.yearLabel} onChange={(e) => setForm({ ...form, yearLabel: e.target.value })} placeholder="ej: 1950-1960" /></div>
              <div className="space-y-1"><Label>Fase</Label><Input value={form.phaseLabel} onChange={(e) => setForm({ ...form, phaseLabel: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1"><Label>Descripción *</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1"><Label>Texto narrativo</Label><Textarea rows={2} value={form.narrativeText} onChange={(e) => setForm({ ...form, narrativeText: e.target.value })} /></div>
            <div className="space-y-1"><Label>Orden</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar entrada?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletingId && void handleDelete(deletingId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
