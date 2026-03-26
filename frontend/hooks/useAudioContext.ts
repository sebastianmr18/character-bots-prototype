/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback } from 'react'

/**
 * Creates and manages a single AudioContext instance.
 * - Handles `webkitAudioContext` fallback for older browsers.
 * - Optionally loads an AudioWorklet module on first creation.
 * - Auto-resumes a `suspended` context on each `init()` call.
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
