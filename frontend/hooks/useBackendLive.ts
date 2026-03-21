// frontend/hooks/useBackendLive.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useCallback, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'
import { Transcription, ConnectionStatus } from '@/types/live.types'
import { playAudio, clearAudioQueue } from '@/utils/live-audio.utils'
import { useAudioContext } from '@/hooks/useAudioContext'

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:8000'

export const useBackendLive = (systemInstruction: string) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const [history, setHistory] = useState<Transcription[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)

  const { contextRef: audioContextRef, init: initAudio } = useAudioContext(
    16000,
    '/worklets/audio-processor.js',
  )

  const socketRef = useRef<Socket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<AudioWorkletNode | null>(null)
  const isSessionActiveRef = useRef(false)
  const isInterruptedRef = useRef(false)

  const handleSetIsMuted = useCallback((value: boolean) => {
    isMutedRef.current = value
    setIsMuted(value)
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
  }, [])

  const startAudioCapture = useCallback(() => {
    if (!audioContextRef.current || !mediaStreamRef.current || !socketRef.current) {
      console.warn('[AudioCapture] Prerequisites not ready')
      return
    }

    const context = audioContextRef.current
    const source = context.createMediaStreamSource(mediaStreamRef.current)
    sourceRef.current = source

    const workletNode = new AudioWorkletNode(context, 'audio-processor')
    processorRef.current = workletNode

    workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (!isSessionActiveRef.current || isMutedRef.current || isInterruptedRef.current) return
      if (!socketRef.current?.connected) return
      socketRef.current.emit('audio', event.data)
    }

    source.connect(workletNode)
    workletNode.connect(context.destination)
  }, [audioContextRef])

  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING)
      await initAudio()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: true })
      socketRef.current = socket

      socket.on('connect', () => {
        socket.emit('start', { systemInstruction })
      })

      socket.on('session-ready', () => {
        setStatus(ConnectionStatus.CONNECTED)
        isSessionActiveRef.current = true
        isInterruptedRef.current = false
        startAudioCapture()
      })

      socket.on('transcription', (data) => {
        setHistory((prev) => [
          ...prev.slice(-19),
          { role: data.role, text: data.text, timestamp: new Date() },
        ])
      })

      socket.on('audio', (data) => {
        if (data.audio && audioContextRef.current && !isInterruptedRef.current) {
          playAudio(data.audio, audioContextRef.current)
        }
      })

      socket.on('interrupted', () => {
        isInterruptedRef.current = true
        clearAudioQueue()
        setTimeout(() => {
          isInterruptedRef.current = false
        }, 500)
      })

      socket.on('error', (data) => {
        console.error('[BackendLive] Error del backend:', data.message)
        setStatus(ConnectionStatus.ERROR)
        isSessionActiveRef.current = false
        clearAudioQueue()
      })

      socket.on('disconnect', () => {
        setStatus(ConnectionStatus.DISCONNECTED)
        isSessionActiveRef.current = false
        clearAudioQueue()
        cleanupAudio()
      })
    } catch (error) {
      console.error('[BackendLive] Error al conectar:', error)
      setStatus(ConnectionStatus.ERROR)
    }
  }, [systemInstruction, initAudio, startAudioCapture, cleanupAudio, audioContextRef])

  const disconnect = useCallback(() => {
    isSessionActiveRef.current = false
    isInterruptedRef.current = false
    socketRef.current?.disconnect()
    clearAudioQueue()
    cleanupAudio()
    setStatus(ConnectionStatus.DISCONNECTED)
  }, [cleanupAudio])

  useEffect(() => {
    return () => {
      isSessionActiveRef.current = false
      isInterruptedRef.current = false
      socketRef.current?.disconnect()
      clearAudioQueue()
      cleanupAudio()
    }
  }, [cleanupAudio])

  return {
    status,
    history,
    isMuted,
    setIsMuted: handleSetIsMuted,
    connect,
    disconnect,
  }
}
