"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Pause, Play } from "lucide-react"

interface AudioMessagePlayerProps {
  messageId: number | string
  initialAudioUrl?: string | null
  mediaType?: string | null
  resolveAudioUrl: (messageId: number | string, forceRefresh?: boolean) => Promise<{ audioUrl: string | null; mediaType?: string | null }>
}

let activeAudioElement: HTMLAudioElement | null = null

const formatAudioDuration = (durationInSeconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationInSeconds))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const stopActiveAudio = (nextAudio?: HTMLAudioElement | null) => {
  if (!activeAudioElement || activeAudioElement === nextAudio) {
    return
  }

  activeAudioElement.pause()
  activeAudioElement.currentTime = 0
}

export const AudioMessagePlayer = ({
  messageId,
  initialAudioUrl,
  mediaType,
  resolveAudioUrl,
}: AudioMessagePlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl ?? null)
  const [resolvedMediaType, setResolvedMediaType] = useState<string | null>(mediaType ?? null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [didRetryRefresh, setDidRetryRefresh] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [remainingDuration, setRemainingDuration] = useState<number | null>(null)

  useEffect(() => {
    setAudioUrl(initialAudioUrl ?? null)
    setDidRetryRefresh(false)
    setAudioDuration(null)
    setRemainingDuration(null)
  }, [initialAudioUrl])

  useEffect(() => {
    setResolvedMediaType(mediaType ?? null)
  }, [mediaType])

  useEffect(() => {
    setAudioDuration(null)
    setRemainingDuration(null)
  }, [audioUrl])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden || activeAudioElement !== audioRef.current) {
        return
      }

      const currentAudio = audioRef.current
      if (!currentAudio) {
        return
      }

      currentAudio.pause()
      currentAudio.currentTime = 0
      if (audioDuration !== null) {
        setRemainingDuration(audioDuration)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [audioDuration])

  useEffect(() => {
    const currentAudio = audioRef.current

    return () => {
      if (activeAudioElement === currentAudio) {
        activeAudioElement = null
      }
    }
  }, [])

  const playCurrentAudio = async () => {
    const currentAudio = audioRef.current
    if (!currentAudio) {
      throw new Error("Elemento de audio no disponible")
    }

    stopActiveAudio(currentAudio)
    await currentAudio.play()
    activeAudioElement = currentAudio
    setIsPlaying(true)
  }

  const toggleAudio = async () => {
    try {
      setError(null)

      if (!audioUrl) {
        stopActiveAudio()
        setIsLoading(true)

        const resolved = await resolveAudioUrl(messageId)
        if (!resolved.audioUrl) {
          setError("Audio no disponible")
          setIsLoading(false)
          return
        }

        setAudioUrl(resolved.audioUrl)
        setResolvedMediaType(resolved.mediaType ?? null)

        setTimeout(async () => {
          try {
            await playCurrentAudio()
          } catch (playError) {
            console.error("No se pudo reproducir el audio:", playError)
            setError("No se pudo reproducir")
          } finally {
            setIsLoading(false)
          }
        }, 50)

        return
      }

      if (isPlaying) {
        audioRef.current?.pause()
        if (audioRef.current) {
          audioRef.current.currentTime = 0
        }
        if (activeAudioElement === audioRef.current) {
          activeAudioElement = null
        }
        setIsPlaying(false)
      } else {
        await playCurrentAudio()
      }
    } catch (audioError) {
      console.error("Error al cargar/reproducir audio:", audioError)
      setError("Error de reproducción")
      setIsLoading(false)
    }
  }

  const handleAudioError = async () => {
    if (didRetryRefresh) {
      setError("Audio expirado o no disponible")
      setIsPlaying(false)
      return
    }

    try {
      setIsLoading(true)

      const refreshed = await resolveAudioUrl(messageId, true)
      if (!refreshed.audioUrl) {
        setError("Audio no disponible")
        return
      }

      setDidRetryRefresh(true)
      setAudioUrl(refreshed.audioUrl)
      setResolvedMediaType(refreshed.mediaType ?? null)
      setError(null)
    } catch (refreshError) {
      console.error("No se pudo refrescar URL de audio:", refreshError)
      setError("Audio expirado o no disponible")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={toggleAudio}
        disabled={isLoading}
        aria-label={isLoading ? "Cargando audio" : isPlaying ? "Pausar audio" : "Reproducir audio"}
        title={isLoading ? "Cargando audio" : isPlaying ? "Pausar audio" : "Reproducir audio"}
        className="rounded-md border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      {audioDuration !== null && (
        <span className="text-xs text-muted-foreground">
          {formatAudioDuration(remainingDuration ?? audioDuration)}
        </span>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {
            const duration = audioRef.current?.duration

            if (typeof duration === "number" && Number.isFinite(duration)) {
              setAudioDuration(duration)
              setRemainingDuration(duration)
            }
          }}
          onTimeUpdate={() => {
            const currentAudio = audioRef.current
            if (!currentAudio || !Number.isFinite(currentAudio.duration)) {
              return
            }

            setRemainingDuration(Math.max(0, currentAudio.duration - currentAudio.currentTime))
          }}
          onPlay={() => {
            activeAudioElement = audioRef.current
            setIsPlaying(true)
          }}
          onEnded={() => {
            if (activeAudioElement === audioRef.current) {
              activeAudioElement = null
            }
            setIsPlaying(false)
            if (audioDuration !== null) {
              setRemainingDuration(audioDuration)
            }
          }}
          onPause={() => {
            if (activeAudioElement === audioRef.current) {
              activeAudioElement = null
            }
            setIsPlaying(false)
            if (audioDuration !== null) {
              setRemainingDuration(audioDuration)
            }
          }}
          onError={handleAudioError}
          preload="metadata"
          data-media-type={resolvedMediaType ?? undefined}
          className="hidden"
        />
      )}
    </div>
  )
}
