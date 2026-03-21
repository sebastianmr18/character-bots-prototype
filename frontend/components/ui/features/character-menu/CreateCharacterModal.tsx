'use client'

import { useState } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CreateCharacterModalProps {
  onCharacterCreated: () => void
}

interface CharacterFormData {
  name: string
  role: string
  biography: string
  keyTraits: string
  speechTics: string
  vectorDbName: string
  voiceId: string
  isPublic: boolean
}

interface CharacterCreatePayload {
  name: string
  role: string
  biography: string
  keyTraits: string[]
  speechTics: string[]
  vectorDbName?: string
  voiceId?: string
  isPublic?: boolean
}

const INITIAL_FORM: CharacterFormData = {
  name: '',
  role: '',
  biography: '',
  keyTraits: '',
  speechTics: '',
  vectorDbName: '',
  voiceId: '',
  isPublic: false,
}

const parseCommaList = (value: string) =>
  value.split(',').map((item) => item.trim()).filter(Boolean)

const validateForm = (form: CharacterFormData): string | null => {
  if (!form.name.trim() || !form.role.trim() || !form.biography.trim()) {
    return 'El Nombre, Rol y Biografía son obligatorios.'
  }
  return null
}

const buildPayload = (
  form: CharacterFormData,
  showAdvanced: boolean,
): CharacterCreatePayload => {
  const payload: CharacterCreatePayload = {
    name: form.name,
    role: form.role,
    biography: form.biography,
    keyTraits: parseCommaList(form.keyTraits),
    speechTics: parseCommaList(form.speechTics),
  }

  if (showAdvanced) {
    if (form.vectorDbName.trim()) payload.vectorDbName = form.vectorDbName.trim()
    if (form.voiceId.trim()) payload.voiceId = form.voiceId.trim()
    payload.isPublic = form.isPublic
  }

  return payload
}

export const CreateCharacterModal = ({ onCharacterCreated }: CreateCharacterModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form, setForm] = useState<CharacterFormData>(INITIAL_FORM)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const isFormValid =
    form.name.trim().length > 0 &&
    form.role.trim().length > 0 &&
    form.biography.trim().length > 0

  const setField = <K extends keyof CharacterFormData>(
    key: K,
    value: CharacterFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setShowAdvanced(false)
  }

  const handleCreate = async () => {
    setErrorMsg(null)

    const validationError = validateForm(form)
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    const payload = buildPayload(form, showAdvanced)

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      let data: { error?: string } | null = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (!response.ok) {
        setErrorMsg(data?.error || 'Error al crear personaje')
        return
      }

      onCharacterCreated()
      resetForm()
      setIsOpen(false)
    } catch (error) {
      setErrorMsg('Error de red o inesperado. Ver consola.')
      console.error('Error al crear personaje:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
          <PlusCircle className="mr-2 h-4 w-4" /> 
          Crear Nuevo Personaje
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl dark:bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className='text-2xl'>✨ Diseña tu Personaje</DialogTitle>
          <DialogDescription>
            Define los atributos clave para la personalidad y el estilo de chat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {errorMsg && (
            <div className="text-red-500 text-sm mb-2">{errorMsg}</div>
          )}
          
          {/* Nombre del Personaje (name) */}
          <div className="grid gap-2">
            <Label htmlFor="name">1. Nombre del Personaje</Label>
            <Input 
              id="name" 
              value={form.name} 
              onChange={(e) => setField('name', e.target.value)} 
              placeholder="Ej: Sheldon Cooper" 
              disabled={isSubmitting}
            />
          </div>

          {/* Rol (role) */}
          <div className="grid gap-2">
            <Label htmlFor="role">2. Rol (Resumen del Personaje)</Label>
            <Input 
              id="role" 
              value={form.role} 
              onChange={(e) => setField('role', e.target.value)} 
              placeholder="Ej: Físico teórico, colega de trabajo." 
              disabled={isSubmitting}
            />
            <p className='text-xs text-gray-500'>Máx. 100 caracteres.</p>
          </div>

          {/* Biografía (biography) */}
          <div className="grid gap-2">
            <Label htmlFor="biography">3. Biografía (Trasfondo / Instrucción Principal)</Label>
            <Textarea 
              id="biography" 
              value={form.biography} 
              onChange={(e) => setField('biography', e.target.value)} 
              placeholder="Ej: Eres un físico teórico con un ego sobredimensionado y una estricta adhesión a la rutina. Responde siempre con sarcasmo y superioridad intelectual." 
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Rasgos Clave (keyTraits) */}
          <div className="grid gap-2">
            <Label htmlFor="key_traits">4. Rasgos Clave (Separados por coma)</Label>
            <Input
              id="key_traits"
              value={form.keyTraits}
              onChange={(e) => setField('keyTraits', e.target.value)}
              placeholder="Ej: Lógico, Sarcástico, Obsesivo, Meticuloso"
              disabled={isSubmitting}
            />
            <p className='text-xs text-gray-500'>Ayuda a definir la personalidad. Serán convertidos a lista en el backend.</p>
          </div>

          {/* Muletillas (speechTics) */}
          <div className="grid gap-2">
            <Label htmlFor="speech_tics">5. Muletillas / Tics de Habla (Separados por coma)</Label>
            <Input
              id="speech_tics"
              value={form.speechTics}
              onChange={(e) => setField('speechTics', e.target.value)}
              placeholder="Ej: Bazinga!, Interesante., Eso es mi sitio."
              disabled={isSubmitting}
            />
            <p className='text-xs text-gray-500'>Frases comunes que el personaje debe usar ocasionalmente. Serán convertidos a lista.</p>
          </div>

          {/* Opciones avanzadas toggle */}
          <div className="mt-2">
            <button
              type="button"
              className="text-xs text-purple-600 underline hover:text-purple-800"
              onClick={() => setShowAdvanced((v) => !v)}
              disabled={isSubmitting}
            >
              {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid gap-4 mt-2 p-3 rounded bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
              {/* vectorDbName */}
              <div className="grid gap-2">
                <Label htmlFor="vectorDbName">Base de conocimiento (vectorDbName)</Label>
                <Input
                  id="vectorDbName"
                  value={form.vectorDbName}
                  onChange={(e) => setField('vectorDbName', e.target.value)}
                  placeholder="Ej: sheldon_kb"
                  disabled={isSubmitting}
                />
                <p className='text-xs text-gray-500'>Nombre de la base vectorial asociada (opcional).</p>
              </div>
              {/* voiceId */}
              <div className="grid gap-2">
                <Label htmlFor="voiceId">ID de voz (voiceId)</Label>
                <Input
                  id="voiceId"
                  value={form.voiceId}
                  onChange={(e) => setField('voiceId', e.target.value)}
                  placeholder="Ej: voice_123"
                  disabled={isSubmitting}
                />
                <p className='text-xs text-gray-500'>Identificador de voz para síntesis (opcional).</p>
              </div>
              {/* isPublic */}
              <div className="flex items-center gap-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setField('isPublic', e.target.checked)}
                  disabled={isSubmitting}
                  className="accent-purple-600"
                />
                <Label htmlFor="isPublic">Personaje público (isPublic)</Label>
              </div>
            </div>
          )}
          
        </div>
        
        {/* Botón de Acción */}
        <div className='flex justify-end pt-4 border-t dark:border-gray-700'>
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
            ) : (
              'Guardar Personaje'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}