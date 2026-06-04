/**
 * Call Mode Panel: componente del modo llamada: Call Mode.
 */
"use client"


/**
 * Componente del modo llamada: Call Mode.
 */

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Mic, MicOff, Pause, Play, Phone, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCharacterById } from "@/hooks/useCharacterById"
import { useBackendLive } from "@/hooks/useBackendLive"
import { StreamingText } from "@/components/ui/features/characters/shared/StreamingText"
import { CallModeSkeleton } from "@/components/ui/features/skeletons/CallModeSkeleton"
import { ConnectionStatus } from "@/types/live.types"
import { useAnimatedEntryKeys } from "@/hooks/useAnimatedEntryKeys"

interface CallModePanelProps {
  characterId: string | null
  onEndCall: () => void
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

const getConnectionLabel = (status: ConnectionStatus, isPaused: boolean) => {
  if (status === ConnectionStatus.CONNECTING) return "Conectando"
  if (status === ConnectionStatus.ERROR) return "Error"
  if (status !== ConnectionStatus.CONNECTED) return "Desconectada"
  return isPaused ? "Pausada" : "Activa"
}

const getSceneCopy = (
  status: ConnectionStatus,
  isPaused: boolean,
  isMuted: boolean,
  isSearching: boolean,
  characterName: string,
) => {
  if (status === ConnectionStatus.CONNECTING) {
    return {
      title: `Conectando con ${characterName}`,
      description: "Preparando microfono, audio y sesion en tiempo real.",
    }
  }

  if (status === ConnectionStatus.ERROR) {
    return {
      title: "La llamada no pudo iniciarse",
      description: "Reintenta la conexion para volver a hablar con el personaje.",
    }
  }

  if (status !== ConnectionStatus.CONNECTED) {
    return {
      title: `Listo para hablar con ${characterName}`,
      description: "Inicia la llamada para conversar por voz y ver la transcripcion en vivo.",
    }
  }

  if (isPaused) {
    return {
      title: "Llamada en pausa",
      description: "El microfono esta silenciado hasta que reanudes la conversacion.",
    }
  }

  if (isSearching) {
    return {
      title: `${characterName} esta pensando`,
      description: "Consultando contexto para responder con mas precision.",
    }
  }

  if (isMuted) {
    return {
      title: "Microfono silenciado",
      description: "Puedes seguir escuchando, pero tu voz no se esta enviando.",
    }
  }

  return {
    title: `${characterName} te esta escuchando`,
    description: "Habla con naturalidad. La transcripcion aparecerá en tiempo real.",
  }
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

  const { status, history, isMuted, setIsMuted, connect, disconnect, isSearching } = useBackendLive(
    systemInstruction,
    characterId ?? ""
  )

  const isConnected = status === ConnectionStatus.CONNECTED
  const canConnect = Boolean(characterId && character)
  const connectionLabel = getConnectionLabel(status, isPaused)
  const sceneCopy = getSceneCopy(status, isPaused, isMuted, isSearching, character?.name ?? "el personaje")
  const themeColor = character?.themeColor ?? "rgba(59, 130, 246, 0.85)"
  const themeColorLight = character?.themeColorLight ?? "rgba(59, 130, 246, 0.18)"
  const avatarInitial = character?.name.charAt(0).toUpperCase() ?? "?"

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

  const getTranscriptAnimationKey = useCallback(
    (item: (typeof history)[number]) => `${item.role}:${item.timestamp.toISOString()}:${item.text}`,
    [],
  )

  const animatedTranscriptKeys = useAnimatedEntryKeys(
    history,
    getTranscriptAnimationKey,
    () => true,
  )

  const transcriptLines = history.slice(-8).map((item) => ({
    ...item,
    prefix: item.role === "user" ? "Tú" : (character?.name ?? "Personaje"),
  }))

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
    return <CallModeSkeleton />
  }

  if (error || !character) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <p className="text-sm text-destructive">No se pudo cargar el personaje para la llamada.</p>
      </div>
    )
  }

  return (
    <div
      className="relative flex-1 min-h-0 overflow-hidden rounded-2xl border border-border bg-background"
      style={{
        background: `linear-gradient(180deg, ${themeColorLight} 0%, color-mix(in srgb, var(--color-background) 92%, transparent) 24%, var(--color-background) 100%)`,
      }}
    >
      {character.backgroundImageUrl ? (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${character.backgroundImageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_35%)]" />

      <div className="relative z-10 flex h-full flex-col gap-4 p-4 text-foreground sm:gap-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card/85 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold sm:text-2xl">{character.name}</h2>
              <span className="rounded-full border border-border bg-muted/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {character.role}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isConnected ? `En llamada desde ${formatDuration(callDuration)}` : "Llamada de voz con transcripcion en vivo"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isMuted ? (
              <span className="rounded-full border border-border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
                Microfono apagado
              </span>
            ) : null}
            {isSearching ? (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                Consultando contexto
              </span>
            ) : null}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : status === ConnectionStatus.ERROR ? "bg-destructive" : "bg-muted-foreground/40"}`}
              />
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{connectionLabel}</span>
            </div>
          </div>
        </div>

        <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-5">
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-border bg-card/80 px-6 py-8 text-center shadow-sm backdrop-blur-md sm:px-8">
            <div className="relative mb-6">
              {(isConnected || status === ConnectionStatus.CONNECTING) && !isPaused ? (
                <>
                  <div className="absolute inset-0 -m-5 rounded-full border border-primary/25 animate-ping" />
                  <div className="absolute inset-0 -m-10 rounded-full border border-primary/15 animate-ping [animation-delay:400ms]" />
                </>
              ) : null}

              <div
                className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-background shadow-[0_18px_45px_rgba(0,0,0,0.16)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)] sm:h-44 sm:w-44"
                style={{ backgroundColor: themeColor }}
              >
                {character.imageUrl ? (
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    fill
                    unoptimized
                    sizes="176px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-5xl font-bold text-primary-foreground sm:text-6xl">{avatarInitial}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="max-w-xl space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Modo llamada</p>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{sceneCopy.title}</h3>
              <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                {sceneCopy.description}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
              {character.years ? (
                <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5">{character.years}</span>
              ) : null}
              {character.category ? (
                <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5">{character.category}</span>
              ) : null}
            </div>

            <p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground line-clamp-3">{character.biography}</p>

            {!isConnected ? (
              <Button
                size="lg"
                onClick={handleConnect}
                disabled={!canConnect || status === ConnectionStatus.CONNECTING}
                className="mt-6 rounded-full px-8 text-base shadow-lg"
              >
                <Phone className="h-4 w-4" />
                {status === ConnectionStatus.CONNECTING ? "Conectando..." : "Iniciar llamada"}
              </Button>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur-md sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Estado actual</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="text-sm font-medium text-foreground">{connectionLabel}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{sceneCopy.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Microfono</p>
                    <p className="mt-1 text-sm text-foreground">{isMuted ? "Silenciado" : "Activo"}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Duracion</p>
                    <p className="mt-1 text-sm text-foreground">{formatDuration(callDuration)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur-md sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Transcripcion en tiempo real</p>
                  <p className="mt-1 text-sm text-muted-foreground">Ultimos intercambios de la llamada.</p>
                </div>
                <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {transcriptLines.length} lineas
                </span>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {transcriptLines.length > 0 ? (
                  transcriptLines.map((item) => {
                    const isUser = item.role === "user"

                    return (
                      <div
                        key={getTranscriptAnimationKey(item)}
                        className={`rounded-2xl border p-3 text-sm leading-6 ${
                          isUser
                            ? "ml-6 border-primary/15 bg-primary/10 text-foreground"
                            : "mr-6 border-border bg-muted/35 text-foreground"
                        }`}
                      >
                        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item.prefix}</p>
                        <StreamingText
                          text={item.text}
                          animate={animatedTranscriptKeys.has(getTranscriptAnimationKey(item))}
                        />
                      </div>
                    )
                  })
                ) : (
                  <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 p-6 text-center">
                    <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                      Aun no hay transcripciones. Cuando empiece la llamada, aqui veras el ida y vuelta en tiempo real.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-card/90 p-3 shadow-sm backdrop-blur-xl sm:p-4">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon-lg"
                variant="outline"
                className="rounded-full border-border bg-background text-foreground hover:bg-muted"
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isConnected}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{isMuted ? "Activar" : "Silenciar"}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon-lg"
                variant="outline"
                className="rounded-full border-border bg-background text-foreground hover:bg-muted"
                onClick={handleTogglePause}
                disabled={!isConnected}
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{isPaused ? "Reanudar" : "Pausar"}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon-lg"
                variant="destructive"
                className="rounded-full shadow-lg"
                onClick={handleEndCall}
                disabled={!isConnected && status !== ConnectionStatus.CONNECTING}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Finalizar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
