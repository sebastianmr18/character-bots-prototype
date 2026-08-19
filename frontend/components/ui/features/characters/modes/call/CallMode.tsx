/**
 * Call Mode Panel: componente del modo llamada: Call Mode.
 */
"use client"


/**
 * Componente del modo llamada: Call Mode.
 */

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react"
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

const getConnectionLabel = (status: ConnectionStatus) => {
  if (status === ConnectionStatus.CONNECTING) return "Conectando"
  if (status === ConnectionStatus.ERROR) return "Error"
  if (status !== ConnectionStatus.CONNECTED) return "Desconectada"
  return "Activa"
}

const getSceneCopy = (
  status: ConnectionStatus,
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

function VoiceVisualizer({ isActive, isUser }: { isActive: boolean; isUser?: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${isUser ? "bg-primary" : "bg-foreground"}`}
          initial={{ height: "4px" }}
          animate={{
            height: isActive ? ["4px", "14px", "6px", "16px", "4px"] : "4px",
          }}
          transition={{
            duration: 0.8,
            repeat: isActive ? Infinity : 0,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

export function CallModePanel({ characterId, onEndCall }: CallModePanelProps) {
  const [callDuration, setCallDuration] = useState(0)

  const { character, isLoading, error } = useCharacterById(characterId)
  const systemInstruction = useMemo(() => buildSystemInstruction(character), [character])

  const { status, history, isMuted, setIsMuted, connect, disconnect, isSearching, isModelSpeaking } = useBackendLive(
    systemInstruction,
    characterId ?? ""
  )

  const isConnected = status === ConnectionStatus.CONNECTED
  const canConnect = Boolean(characterId && character)
  const connectionLabel = getConnectionLabel(status)
  const sceneCopy = getSceneCopy(status, isMuted, isSearching, character?.name ?? "el personaje")
  const themeColor = character?.themeColor ?? "rgba(59, 130, 246, 0.85)"
  const themeColorLight = character?.themeColorLight ?? "rgba(59, 130, 246, 0.18)"
  const avatarInitial = character?.name.charAt(0).toUpperCase() ?? "?"

  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

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

  const handleConnect = async () => {
    if (!canConnect || status === ConnectionStatus.CONNECTING) return
    setCallDuration(0)
    await connect()
  }

  const handleEndCall = async () => {
    await disconnect()
    setCallDuration(0)
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
              {character.years ? (
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {character.years}
                </span>
              ) : null}
              {character.category ? (
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {character.category}
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground mr-1">{sceneCopy.title}</span>
              <span className="hidden sm:inline">— {sceneCopy.description}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isConnected ? (
              <span className="rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-medium text-foreground">
                {formatDuration(callDuration)}
              </span>
            ) : null}
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

        <div className="flex flex-1 min-h-0 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur-md sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Transcripcion en tiempo real</p>
                  <p className="mt-1 text-sm text-muted-foreground">Ultimos intercambios de la llamada.</p>
                </div>
                {isConnected && isModelSpeaking ? (
                   <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
                     <VoiceVisualizer isActive={true} />
                     <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground">{character.name} hablando</span>
                   </div>
                ) : isConnected && !isMuted && !isSearching ? (
                   <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
                     <VoiceVisualizer isActive={true} isUser={true} />
                     <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Micrófono abierto</span>
                   </div>
                ) : null}
              </div>
              <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                {transcriptLines.length} lineas
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              {transcriptLines.length > 0 ? (
                transcriptLines.map((item) => {
                  const isUser = item.role === "user"

                  return (
                    <div
                      key={getTranscriptAnimationKey(item)}
                      className={`rounded-2xl border p-4 text-sm leading-relaxed ${
                        isUser
                          ? "ml-8 lg:ml-16 border-primary/15 bg-primary/10 text-foreground"
                          : "mr-8 lg:mr-16 border-border bg-muted/35 text-foreground"
                      }`}
                    >
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.prefix}</p>
                      <StreamingText
                        text={item.text}
                        animate={animatedTranscriptKeys.has(getTranscriptAnimationKey(item))}
                      />
                    </div>
                  )
                })
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border bg-muted/25 p-8 text-center">
                  {!isConnected ? (
                    <>
                      <div className="max-w-md space-y-2">
                        <p className="text-base font-medium text-foreground">Listo para hablar con {character.name}</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Inicia la llamada para conversar por voz. Aquí verás la transcripción en tiempo real de todo lo que hablen.
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={handleConnect}
                        disabled={!canConnect || status === ConnectionStatus.CONNECTING}
                        className="rounded-full px-8 text-base shadow-lg"
                      >
                        <Phone className="h-4 w-4" />
                        {status === ConnectionStatus.CONNECTING ? "Conectando..." : "Iniciar llamada"}
                      </Button>
                    </>
                  ) : (
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      Aun no hay transcripciones. Empieza a hablar y aqui veras el ida y vuelta en tiempo real.
                    </p>
                  )}
                </div>
              )}
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
