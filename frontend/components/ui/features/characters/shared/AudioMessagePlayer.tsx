"use client"

import { useEffect, useRef, useState } from "react"

interface AudioMessagePlayerProps {
  messageId: number | string
  initialAudioUrl?: string | null
  mediaType?: string | null
  resolveAudioUrl: (messageId: number | string, forceRefresh?: boolean) => Promise<{ audioUrl: string | null; mediaType?: string | null }>
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

  useEffect(() => {
    setAudioUrl(initialAudioUrl ?? null)
  }, [initialAudioUrl])

  useEffect(() => {
    setResolvedMediaType(mediaType ?? null)
  }, [mediaType])

  const toggleAudio = async () => {
    try {
      setError(null)

      if (!audioUrl) {
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
            await audioRef.current?.play()
            setIsPlaying(true)
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
        setIsPlaying(false)
      } else {
        await audioRef.current?.play()
        setIsPlaying(true)
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
        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        {isLoading ? "Cargando..." : isPlaying ? "Pausar audio" : "Reproducir audio"}
      </button>

      {error && <span className="text-xs text-red-500">{error}</span>}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onError={handleAudioError}
          preload="none"
          data-media-type={resolvedMediaType ?? undefined}
          className="hidden"
        />
      )}
    </div>
  )
}
