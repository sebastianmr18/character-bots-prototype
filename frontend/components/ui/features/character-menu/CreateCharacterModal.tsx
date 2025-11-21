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
  
  // 🔑 Nuevos estados que coinciden con models.py
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [biography, setBiography] = useState('')
  const [keyTraits, setKeyTraits] = useState('') // String separado por comas para simular lista JSON
  const [speechTics, setSpeechTics] = useState('') // String separado por comas para simular lista JSON

  const isFormValid = name.trim() && role.trim() && biography.trim();

  const handleCreate = async () => {
    if (!isFormValid) {
      alert('El Nombre, Rol y Biografía son obligatorios.');
      return;
    }
    
    // 🔑 Transformar los campos de texto separados por comas a arrays (simulando JSONField)
    const traitsArray = keyTraits.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const ticsArray = speechTics.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const characterData = { 
        name, 
        role, 
        biography, 
        key_traits: traitsArray, 
        speech_tics: ticsArray 
    };

    setIsSubmitting(true);
    console.log('Simulando llamada POST a /api/characters/ con:', characterData);
        alert("Crear nuevo personaje función por implementar")

    // --- Simulación de POST ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular latencia

    try {
      // 💡 Aquí iría la llamada fetch(API_BASE_URL/characters/, { method: 'POST', body: JSON.stringify(characterData)})
      
      console.log('Personaje creado (simulado) exitosamente.');
      onCharacterCreated(); // Actualizar lista
      
      // Limpiar estados
      setName('');
      setRole('');
      setBiography('');
      setKeyTraits('');
      setSpeechTics('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error simulado al crear personaje:', error);
      alert('Error al crear personaje. Ver consola.');
    } finally {
      setIsSubmitting(false);
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

          {/* Rasgos Clave (key_traits) */}
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

          {/* Muletillas (speech_tics) */}
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
          
        </div>
        
        {/* Botón de Acción */}
        <div className='flex justify-end pt-4 border-t dark:border-gray-700'>
          <Button 
            onClick={handleCreate} 
            disabled={isSubmitting || !isFormValid} // Se requiere Nombre, Rol y Biografía
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