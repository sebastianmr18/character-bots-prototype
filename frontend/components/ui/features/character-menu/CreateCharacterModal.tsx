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
  onCharacterCreated: () => void; // Función para actualizar la lista después de la creación
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ onCharacterCreated }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Campos principales
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [biography, setBiography] = useState('')
  const [keyTraits, setKeyTraits] = useState('')
  const [speechTics, setSpeechTics] = useState('')

  // Opciones avanzadas
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [vectorDbName, setVectorDbName] = useState('')
  const [voiceId, setVoiceId] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const isFormValid = name.trim() && role.trim() && biography.trim();

  const handleCreate = async () => {
    setErrorMsg(null)
    if (!isFormValid) {
      setErrorMsg('El Nombre, Rol y Biografía son obligatorios.')
      return
    }

    // Transformar los campos de texto separados por comas a arrays
    const traitsArray = keyTraits.split(',').map(t => t.trim()).filter(t => t.length > 0)
    const ticsArray = speechTics.split(',').map(t => t.trim()).filter(t => t.length > 0)

    // Construir payload según API
    const characterData: Record<string, any> = {
      name,
      role,
      biography,
      keyTraits: traitsArray,
      speechTics: ticsArray,
    }
    if (showAdvanced) {
      if (vectorDbName.trim()) characterData.vectorDbName = vectorDbName.trim()
      if (voiceId.trim()) characterData.voiceId = voiceId.trim()
      characterData.isPublic = isPublic
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      })
      const data = await response.json()
      if (!response.ok) {
        setErrorMsg(data?.error || 'Error al crear personaje')
        return
      }
      // Éxito
      onCharacterCreated()
      setName('')
      setRole('')
      setBiography('')
      setKeyTraits('')
      setSpeechTics('')
      setVectorDbName('')
      setVoiceId('')
      setIsPublic(false)
      setShowAdvanced(false)
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
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej: Sheldon Cooper" 
              disabled={isSubmitting}
            />
          </div>

          {/* Rol (role) */}
          <div className="grid gap-2">
            <Label htmlFor="role">2. Rol (Resumen del Personaje)</Label>
            <Input 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
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
              value={biography} 
              onChange={(e) => setBiography(e.target.value)} 
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
              value={keyTraits}
              onChange={(e) => setKeyTraits(e.target.value)}
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
              value={speechTics}
              onChange={(e) => setSpeechTics(e.target.value)}
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
                  value={vectorDbName}
                  onChange={(e) => setVectorDbName(e.target.value)}
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
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
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
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
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