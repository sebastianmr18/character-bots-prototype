"use client"

import { useState } from "react"
import type { Character } from "@/types/chat.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, Swords } from "lucide-react"
import { colorFromName } from "@/utils/character.utils"

interface DebatePickerProps {
  currentCharacterId: string
  characters: Character[]
  onConfirm: (character: Character) => Promise<void>
  isLoading: boolean
}

export function DebatePicker({ currentCharacterId, characters, onConfirm, isLoading }: DebatePickerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const availableCharacters = characters.filter((c) => c.id !== currentCharacterId)
  const currentCharacter = characters.find((c) => c.id === currentCharacterId)

  const filteredCharacters = availableCharacters.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const suggestedCharacters = currentCharacter
    ? availableCharacters
        .filter(
          (c) =>
            c.category === currentCharacter.category ||
            (currentCharacter.category === "Ciencia" && c.category === "Filosofia") ||
            (currentCharacter.category === "Filosofia" && c.category === "Ciencia"),
        )
        .slice(0, 3)
    : []

  const getThemeColor = (character: Character) =>
    character.themeColor ?? colorFromName(character.name)

  const getShortName = (character: Character) => character.name.split(" ")[0]
  const getEpoch = (character: Character) => character.years ?? ""

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Swords className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Modo Debate</h2>
          <p className="text-sm text-muted-foreground">
            Elige un oponente para {currentCharacter ? getShortName(currentCharacter) : "el personaje"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar personaje..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Suggestions */}
        {searchQuery === "" && suggestedCharacters.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Sugeridos para debatir
            </p>
            <div className="space-y-2">
              {suggestedCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => onConfirm(character)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-4 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: getThemeColor(character) }}
                  >
                    {getShortName(character)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{character.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {character.category}{character.category && getEpoch(character) ? " · " : ""}{getEpoch(character)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All characters */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {searchQuery ? "Resultados" : "Todos los personajes"}
          </p>
          <div className="space-y-2">
            {filteredCharacters.map((character) => (
              <button
                key={character.id}
                onClick={() => onConfirm(character)}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: getThemeColor(character) }}
                >
                  {getShortName(character)[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{character.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {character.category}{character.category && getEpoch(character) ? " · " : ""}{getEpoch(character)}
                  </p>
                </div>
              </button>
            ))}
            {filteredCharacters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No se encontraron personajes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {isLoading && (
          <p className="text-xs text-muted-foreground text-center mb-2">Creando debate...</p>
        )}
        <Button variant="outline" disabled={isLoading} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
