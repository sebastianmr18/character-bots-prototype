"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Character } from "@/types/chat.types"

interface CharacterSidebarProps {
  availableCharacters: Character[]
  selectedCharacterId: string | null
  onCharacterChange: (characterId: string) => void
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  availableCharacters,
  selectedCharacterId,
  onCharacterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <aside
      className={`
        flex flex-col h-full transition-all duration-300 ease-out
        border-r border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
        ${isExpanded ? "w-64" : "w-20"}
      `}
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {isExpanded && (
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            Personajes
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto h-8 w-8 p-0"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Characters list */}
      <ScrollArea className="flex-1">
        <div className={`flex flex-col gap-2 p-3 ${isExpanded ? "" : "items-center"}`}>
          {availableCharacters.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-gray-500">
              {isExpanded ? "Cargando personajes..." : "⏳"}
            </div>
          ) : (
            availableCharacters.map((character) => (
              <button
                key={character.id}
                onClick={() => onCharacterChange(character.id)}
                title={character.name}
                className={`
                  relative flex items-center gap-3 px-3 py-2 rounded-lg
                  transition-all duration-200 ease-out
                  ${
                    selectedCharacterId === character.id
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  dark:focus:ring-offset-gray-900
                  group
                `}
              >
                {/* Avatar */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-full overflow-hidden
                    flex items-center justify-center font-semibold text-sm
                    transition-all duration-200
                    ${
                      selectedCharacterId === character.id
                        ? "ring-2 ring-blue-500 bg-blue-500 text-white scale-105"
                        : "bg-gradient-to-br from-blue-400 to-blue-600 text-white ring-1 ring-gray-200 dark:ring-gray-700"
                    }
                  `}
                >
                  {character.name.charAt(0).toUpperCase()}
                </div>

                {/* Character name - shows when expanded */}
                {isExpanded && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{character.name}</p>
                    {character.description && (
                      <p className="text-xs opacity-75 truncate">{character.description}</p>
                    )}
                  </div>
                )}

                {/* Selection indicator - visible when selected */}
                {selectedCharacterId === character.id && !isExpanded && (
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer info */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {availableCharacters.length} personaje{availableCharacters.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </aside>
  )
}
