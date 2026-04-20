"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Character } from "@/types/chat.types"
import { DebatePicker } from "@/components/ui/features/characters/modes/debate/DebatePicker"
import { DebateChatPanel } from "@/components/ui/features/characters/modes/debate/DebateChatPanel"
import { useCharacters } from "@/hooks/useCharacters"
import { getErrorMessage } from "@/utils/api.utils"
import { normalizeBackendCharacter } from "@/utils/message.utils"

interface DebatePanelProps {
  currentCharacterId: string | null
  existingConversationId?: string | null
  onConversationCreated?: (conversation: { id: string; mode?: "single" | "debate" }) => void
}

export const DebatePanel: React.FC<DebatePanelProps> = ({
  currentCharacterId,
  existingConversationId = null,
  onConversationCreated,
}) => {
  const { availableCharacters, isLoading: isLoadingCharacters } = useCharacters()
  const [debateConvId, setDebateConvId] = useState<string | null>(null)
  const [characterA, setCharacterA] = useState<Character | null>(null)
  const [characterB, setCharacterB] = useState<Character | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isLoadingExisting, setIsLoadingExisting] = useState(false)

  const currentCharacter = availableCharacters.find((c) => c.id === currentCharacterId) ?? null

  useEffect(() => {
    if (!existingConversationId) return

    const loadExistingDebate = async () => {
      try {
        setIsLoadingExisting(true)
        setCreateError(null)

        const response = await fetch(`/api/conversations/${existingConversationId}`)
        if (!response.ok) return

        const data = await response.json()
        if (data?.mode !== "debate" || !data?.secondaryCharacter || !data?.character) {
          return
        }

        setDebateConvId(existingConversationId)
        setCharacterA(normalizeBackendCharacter(data.character))
        setCharacterB(normalizeBackendCharacter(data.secondaryCharacter))
      } catch {
        // non-critical; fallback to picker
      } finally {
        setIsLoadingExisting(false)
      }
    }

    loadExistingDebate()
  }, [existingConversationId])

  const handleConfirmDebate = async (selectedCharacterB: Character) => {
    if (!currentCharacterId || !currentCharacter) return
    try {
      setIsCreating(true)
      setCreateError(null)

      const response = await fetch("/api/conversations/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterIdA: currentCharacterId,
          characterIdB: selectedCharacterB.id,
        }),
      })

      if (!response.ok) {
        const message = await getErrorMessage(response)
        throw new Error(message)
      }

      const data = await response.json()
      if (!data?.id) throw new Error("No se recibió el id de la conversación")

      setCharacterA(currentCharacter)
      setCharacterB(selectedCharacterB)
      setDebateConvId(data.id)
      window.dispatchEvent(
        new CustomEvent("conversation:created", {
          detail: { id: data.id, mode: "debate" },
        }),
      )
      onConversationCreated?.({ id: data.id, mode: "debate" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al crear el debate"
      setCreateError(message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleBack = () => {
    setDebateConvId(null)
    setCharacterA(null)
    setCharacterB(null)
    setCreateError(null)
  }

  if (debateConvId && characterA && characterB) {
    return (
      <DebateChatPanel
        conversationId={debateConvId}
        characterA={characterA}
        characterB={characterB}
        onBack={handleBack}
      />
    )
  }

  if (isLoadingExisting) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando debate...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DebatePicker
        currentCharacterId={currentCharacterId ?? ""}
        characters={availableCharacters}
        onConfirm={handleConfirmDebate}
        isLoading={isCreating}
        isLoadingCharacters={isLoadingCharacters}
      />
      {createError && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive text-center">{createError}</p>
        </div>
      )}
    </div>
  )
}
