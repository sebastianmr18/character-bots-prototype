"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Mic, MicOff, Pause, Play, Phone, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCharacterById } from "@/hooks/useCharacterById"
import { useGeminiLive } from "@/hooks/useGeminiLive"
import { ConnectionStatus } from "@/types/live.types"

interface CallModePanelProps {
  characterId: string | null
  onEndCall: () => void
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

const buildSystemInstruction = (character: {
  name: string
  description: string
  role: string
  biography: string
} | null) => {
  if (!character) return ""

  return `Eres ${character.name}. ${character.description}

INFORMACION SOBRE TI:
- Nombre: ${character.name}
- Rol: ${character.role}
- Biografia: ${character.biography}

Comportamiento:
- Manten coherencia con tu personaje descrito arriba
- Se amable pero autentico en tu rol
- Si te piden informacion sobre ti, usa los detalles proporcionados
- Intenta ser conversacional y natural`
}

export function CallModePanel({ characterId, onEndCall }: CallModePanelProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const mutedBeforePauseRef = useRef(false)

  const { character, isLoading, error } = useCharacterById(characterId)
  const systemInstruction = useMemo(() => buildSystemInstruction(character), [character])

  const { status, history, isMuted, setIsMuted, connect, disconnect, isSearching } = useGeminiLive(
    systemInstruction,
    characterId ?? ""
  )

  const isConnected = status === ConnectionStatus.CONNECTED
  const canConnect = Boolean(characterId && character)

  useEffect(() => {
    if (!isConnected || isPaused) return

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected, isPaused])

  useEffect(() => {
    if (status !== ConnectionStatus.CONNECTED) {
      setIsPaused(false)
    }
  }, [status])

  useEffect(() => {
    return () => {
      void disconnect()
    }
  }, [disconnect])

  const transcriptLines = history.slice(-8).map((item) => {
    const prefix = item.role === "user" ? "Tú" : (character?.name ?? "Personaje")
    return `${prefix}: ${item.text}`
  })

  const handleTogglePause = () => {
    const nextPaused = !isPaused
    setIsPaused(nextPaused)

    if (nextPaused) {
      mutedBeforePauseRef.current = isMuted
      setIsMuted(true)
      return
    }

    setIsMuted(mutedBeforePauseRef.current)
  }

  const handleConnect = async () => {
    if (!canConnect || status === ConnectionStatus.CONNECTING) return
    setCallDuration(0)
    await connect()
  }

  const handleEndCall = async () => {
    await disconnect()
    setCallDuration(0)
    setIsPaused(false)
    onEndCall()
  }

  if (!characterId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <p className="text-sm text-muted-foreground">Selecciona un personaje antes de iniciar una llamada.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <p className="text-sm text-muted-foreground">Cargando informacion del personaje...</p>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <p className="text-sm text-destructive">No se pudo cargar el personaje para la llamada.</p>
      </div>
    )
  }

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background">
      <div className="absolute inset-0 bg-foreground/70" />

      <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 text-background">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{character.name}</h2>
            <p className="text-xs text-background/70">
              {isConnected ? `En llamada... ${formatDuration(callDuration)}` : "Lista para iniciar llamada"}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-background/40"}`}
            />
            <span className="text-[11px] uppercase tracking-wider text-background/80">
              {status === ConnectionStatus.CONNECTING
                ? "Conectando"
                : isConnected
                  ? isPaused
                    ? "Pausada"
                    : "Activa"
                  : "Desconectada"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            {isConnected && !isPaused && (
              <>
                <div className="absolute inset-0 -m-4 rounded-full border-2 border-background/25 animate-ping" />
                <div className="absolute inset-0 -m-8 rounded-full border border-background/20 animate-ping [animation-delay:350ms]" />
              </>
            )}

            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-background/80 shadow-2xl bg-primary/70 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-white">{character.name.charAt(0)}</span>
            </div>
          </div>

          <p className="max-w-sm text-center text-sm text-background/75 line-clamp-2">{character.biography}</p>

          {!isConnected && (
            <Button
              size="lg"
              onClick={handleConnect}
              disabled={!canConnect || status === ConnectionStatus.CONNECTING}
              className="rounded-full px-8"
            >
              <Phone className="h-4 w-4" />
              {status === ConnectionStatus.CONNECTING ? "Conectando..." : "Iniciar llamada"}
            </Button>
          )}

          {isSearching && (
            <div className="rounded-md border border-amber-200/60 bg-amber-100/20 px-3 py-1.5 text-xs text-amber-100 animate-pulse">
              {character.name} consultando contexto...
            </div>
          )}
        </div>

        <div className="bg-background/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 max-h-44 overflow-y-auto border border-background/15">
          <p className="text-[11px] text-background/60 mb-2 uppercase tracking-wider">Transcripcion en tiempo real</p>
          <div className="space-y-2">
            {transcriptLines.length > 0 ? (
              transcriptLines.map((line, idx) => (
                <p key={`${line}-${idx}`} className="text-sm text-background/90 leading-relaxed">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-background/70">Aun no hay transcripciones en esta llamada.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <Button
            size="icon-lg"
            variant="outline"
            className="rounded-full bg-background/20 border-background/30 text-background hover:bg-background/30"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isConnected}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            size="icon-lg"
            variant="outline"
            className="rounded-full bg-background/20 border-background/30 text-background hover:bg-background/30"
            onClick={handleTogglePause}
            disabled={!isConnected}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>

          <Button
            size="icon-lg"
            variant="destructive"
            className="rounded-full"
            onClick={handleEndCall}
            disabled={!isConnected && status !== ConnectionStatus.CONNECTING}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
