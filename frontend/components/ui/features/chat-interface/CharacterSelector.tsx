"use client"

import type React from "react"
import type { Character } from "@/types/chat.types"

interface CharacterSelectorProps {
  availableCharacters: Character[]
  selectedCharacterId: string | null
  onCharacterChange: (characterId: string) => void
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  availableCharacters,
  selectedCharacterId,
  onCharacterChange,
}) => {
  return (
    <div className="mt-4 flex items-center gap-3 px-6">
      <label htmlFor="character-select" className="text-sm font-medium text-blue-100">
        Personaje:
      </label>
      <select
        id="character-select"
        value={selectedCharacterId || ""}
        onChange={(e) => onCharacterChange(e.target.value)}
        disabled={availableCharacters.length === 0}
        className="bg-white/20 border border-white/30 text-white text-sm rounded-lg 
                   focus:ring-blue-300 focus:border-blue-300 block p-2.5 
                   dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
      >
        {availableCharacters.length === 0 && <option value="">Cargando...</option>}
        {availableCharacters.map((char) => (
          <option key={char.id} value={char.id}>
            {char.name}
          </option>
        ))}
      </select>
    </div>
  )
}
