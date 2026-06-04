/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback } from 'react'

/**
 * Crea y reutiliza una instancia de `AudioContext` (fallback `webkitAudioContext`).
 *
 * @param sampleRate - Frecuencia de muestreo del contexto.
 * @param workletUrl - URL opcional de AudioWorklet a registrar en la primera inicialización.
 * @returns Referencia al contexto y función `init` que reanuda si estaba suspendido.
 */
export const useAudioContext = (sampleRate: number, workletUrl?: string) => {
  const contextRef = useRef<AudioContext | null>(null)

  const init = useCallback(async () => {
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate })
      if (workletUrl) {
        await contextRef.current.audioWorklet.addModule(workletUrl)
      }
    }
    if (contextRef.current.state === 'suspended') {
      await contextRef.current.resume()
    }
  }, [sampleRate, workletUrl])

  return { contextRef, init }
}
