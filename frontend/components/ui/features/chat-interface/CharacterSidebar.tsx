"use client"

import type React from "react"
import Image from "next/image"
import { cn } from "@/utils/cn.utils"

interface Character {
  id: string
  name: string
  image?: string
  role?: string
}

interface CharacterSidebarProps {
  characters: Character[]
  selectedCharacterId: string
  onCharacterSelect: (characterId: string) => void
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  characters,
  selectedCharacterId,
  onCharacterSelect,
}) => {
  return (
    <aside className="w-24 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 space-y-4 shadow-lg">
      {characters.map((character) => (
        <button
          key={character.id}
          onClick={() => onCharacterSelect(character.id)}
          className={cn(
            "relative w-20 h-20 rounded-full overflow-hidden transition-all duration-300 ease-out",
            "hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-blue-500 hover:ring-offset-2",
            "dark:hover:ring-offset-gray-900",
            selectedCharacterId === character.id
              ? "ring-2 ring-blue-600 scale-110 shadow-lg"
              : "ring-1 ring-gray-200 dark:ring-gray-700"
          )}
          title={character.name}
        >
          {character.image ? (
            <Image
              src={character.image}
              alt={character.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {character.name.charAt(0)}
              </span>
            </div>
          )}
        </button>
      ))}
    </aside>
  )
}