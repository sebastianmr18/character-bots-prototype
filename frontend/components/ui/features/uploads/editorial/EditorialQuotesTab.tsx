'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { getErrorMessage } from '@/utils/api.utils'
import type { EditorialQuote } from '@/types/editorial.types'

type Props = {
  characterId: string
  items: EditorialQuote[]
  onRefresh: () => void
}

type FormData = { text: string; attribution: string; sortOrder: string; isFeatured: boolean }

const empty: FormData = { text: '', attribution: '', sortOrder: '0', isFeatured: false }

export function EditorialQuotesTab({ characterId, items, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EditorialQuote | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError(null)
    setIsOpen(true)
  }

  function openEdit(item: EditorialQuote) {
    setEditing(item)
    setForm({ text: item.text, attribution: item.attribution ?? '', sortOrder: String(item.sortOrder), isFeatured: item.isFeatured })
    setError(null)
    setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.text.trim()) { setError('El texto es obligatorio.'); return }
    setIsSubmitting(true)
    setError(null)
    const payload = { text: form.text.trim(), attribution: form.attribution.trim() || null, sortOrder: Number(form.sortOrder), isFeatured: form.isFeatured }
    const url = editing ? `/api/characters/${characterId}/quotes/${editing.id}` : `/api/characters/${characterId}/quotes`
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { setError(await getErrorMessage(res)); return }
      setIsOpen(false)
      onRefresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally { setIsSubmitting(false) }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/characters/${characterId}/quotes/${id}`, { method: 'DELETE' })
      onRefresh()
    } finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={openCreate}><Plus className="mr-1 h-3 w-3" />Añadir cita</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Sin citas aún.</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between rounded border p-2 text-sm">
          <div><p className="font-medium">"{item.text}"</p>{item.attribution && <p className="text-muted-foreground">— {item.attribution}</p>}</div>
          <div className="flex gap-1 ml-2 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(item.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar cita' : 'Nueva cita'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1"><Label>Texto *</Label><Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
            <div className="space-y-1"><Label>Atribución</Label><Input value={form.attribution} onChange={(e) => setForm({ ...form, attribution: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Orden</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
              <div className="flex items-end gap-2 pb-1"><input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /><Label htmlFor="featured">Destacada</Label></div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletingId && void handleDelete(deletingId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
