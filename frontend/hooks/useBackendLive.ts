import { useState, useRef, useCallback, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'
import { Transcription, ConnectionStatus } from '@/types/live.types'
import { useAudioContext } from '@/hooks/useAudioContext'
import { createClient } from '@/lib/supabase/client'
import { LIVE_WS_URL } from '@/constants/chat.constants'

const OUTPUT_SAMPLE_RATE = 24000

export const useBackendLive = (systemInstruction: string, characterId: string) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const [history, setHistory] = useState<Transcription[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const isMutedRef = useRef(false)

  const { contextRef: inputContextRef, init: initInputAudio } = useAudioContext(
    16000,
    '/worklets/audio-processor.js',
  )
  const { contextRef: outputContextRef, init: initOutputAudio } = useAudioContext(
    OUTPUT_SAMPLE_RATE,
  )

  const socketRef = useRef<Socket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<AudioWorkletNode | null>(null)
  const isSessionActiveRef = useRef(false)
  const isInterruptedRef = useRef(false)

  // Gapless playback scheduling refs
  const nextStartTimeRef = useRef(0)
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([])

  const scheduleAudioChunk = useCallback((base64Audio: string) => {
    const ctx = outputContextRef.current
    if (!ctx) return

    const binary = atob(base64Audio)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const pcm16 = new Int16Array(bytes.buffer)
    const float32 = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE)
    audioBuffer.copyToChannel(float32, 0)

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)

    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current)
    source.start(startTime)
    nextStartTimeRef.current = startTime + audioBuffer.duration

    activeSourcesRef.current.push(source)
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source)
    }
  }, [outputContextRef])

  const stopAllPlayback = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try { source.stop() } catch { /* already stopped */ }
    }
    activeSourcesRef.current = []
    nextStartTimeRef.current = 0
  }, [])

  const handleSetIsMuted = useCallback((value: boolean) => {
    isMutedRef.current = value
    setIsMuted(value)
    socketRef.current?.emit('live:mute', { muted: value })
  }, [])

  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    stopAllPlayback()
  }, [stopAllPlayback])

  const startAudioCapture = useCallback(() => {
    if (!inputContextRef.current || !mediaStreamRef.current || !socketRef.current) return

    const context = inputContextRef.current
    const source = context.createMediaStreamSource(mediaStreamRef.current)
    sourceRef.current = source

    const workletNode = new AudioWorkletNode(context, 'audio-processor')
    processorRef.current = workletNode

    workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (!isSessionActiveRef.current || isMutedRef.current || isInterruptedRef.current) return
      if (!socketRef.current?.connected) return
      socketRef.current.emit('live:audio', event.data)
    }

    source.connect(workletNode)
    workletNode.connect(context.destination)
  }, [inputContextRef])

  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING)

      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      if (!accessToken) {
        console.error('[BackendLive] No auth token available')
        setStatus(ConnectionStatus.ERROR)
        return
      }

      await Promise.all([initInputAudio(), initOutputAudio()])
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const socket = io(LIVE_WS_URL, {
        transports: ['websocket'],
        auth: { token: accessToken },
      })
      socketRef.current = socket

      socket.on('connect', () => {
        socket.emit('live:start', { characterId, systemInstruction })
      })

      socket.on('connect_error', (error) => {
        console.error('[BackendLive] Connection error:', error.message)
        setStatus(ConnectionStatus.ERROR)
      })

      socket.on('live:ready', () => {
        setStatus(ConnectionStatus.CONNECTED)
        isSessionActiveRef.current = true
        isInterruptedRef.current = false
        nextStartTimeRef.current = 0
        startAudioCapture()
      })

      socket.on('live:transcription', (data: { role: 'user' | 'model'; text: string; isFinal: boolean }) => {
        if (!data.isFinal) return
        setHistory((prev) => [
          ...prev.slice(-19),
          { role: data.role, text: data.text, timestamp: new Date() },
        ])
      })

      socket.on('live:audio', (data: { audio: string }) => {
        if (data.audio && !isInterruptedRef.current) {
          scheduleAudioChunk(data.audio)
        }
      })

      socket.on('live:interrupted', () => {
        isInterruptedRef.current = true
        stopAllPlayback()
        setTimeout(() => {
          isInterruptedRef.current = false
        }, 500)
      })

      socket.on('live:searching', (data: { isSearching: boolean }) => {
        setIsSearching(data.isSearching)
      })

      socket.on('live:error', (data: { code: string; message: string; retryable: boolean }) => {
        console.error('[BackendLive] Error:', data.code, data.message)
        setStatus(ConnectionStatus.ERROR)
        isSessionActiveRef.current = false
        stopAllPlayback()
      })

      socket.on('live:ended', () => {
        setStatus(ConnectionStatus.DISCONNECTED)
        isSessionActiveRef.current = false
        stopAllPlayback()
        cleanupAudio()
      })

      socket.on('disconnect', () => {
        setStatus(ConnectionStatus.DISCONNECTED)
        isSessionActiveRef.current = false
        stopAllPlayback()
        cleanupAudio()
      })
    } catch (error) {
      console.error('[BackendLive] Error connecting:', error)
      setStatus(ConnectionStatus.ERROR)
    }
  }, [systemInstruction, characterId, initInputAudio, initOutputAudio, startAudioCapture, cleanupAudio, scheduleAudioChunk, stopAllPlayback])

  const disconnect = useCallback(() => {
    isSessionActiveRef.current = false
    isInterruptedRef.current = false
    socketRef.current?.emit('live:stop')
    socketRef.current?.disconnect()
    stopAllPlayback()
    cleanupAudio()
    setStatus(ConnectionStatus.DISCONNECTED)
  }, [cleanupAudio, stopAllPlayback])

  useEffect(() => {
    return () => {
      isSessionActiveRef.current = false
      isInterruptedRef.current = false
      socketRef.current?.emit('live:stop')
      socketRef.current?.disconnect()
      stopAllPlayback()
      cleanupAudio()
    }
  }, [cleanupAudio, stopAllPlayback])

  return {
    status,
    history,
    isMuted,
    setIsMuted: handleSetIsMuted,
    connect,
    disconnect,
    isSearching,
  }
}
