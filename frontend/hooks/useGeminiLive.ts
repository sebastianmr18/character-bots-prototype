/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback } from 'react'
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai'
import { Transcription, ConnectionStatus, RAG_TOOLS } from '@/types/live.types'
import { decode, decodeAudioData, encode } from '@/utils/audio-codec.utils'
import { useAudioContext } from '@/hooks/useAudioContext'

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025'

export const useGeminiLive = (systemInstruction: string, characterId: string) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const [history, setHistory] = useState<Transcription[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  const [isSearching, setIsSearching] = useState(false)

  // Separate input (capture, 16 kHz + worklet) and output (playback, 24 kHz) contexts
  const { contextRef: inputContextRef, init: initInputAudio } = useAudioContext(
    16000,
    '/worklets/audio-processor.js',
  )
  const { contextRef: outputContextRef, init: initOutputAudio } = useAudioContext(24000)

  const activeSessionRef = useRef<any>(null)
  const sessionPromiseRef = useRef<Promise<any> | null>(null)
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set())
  const nextStartTimeRef = useRef<number>(0)
  const transcriptBufferRef = useRef<{ user: string; model: string }>({ user: '', model: '' })

  const handleSetIsMuted = useCallback((value: boolean) => {
    isMutedRef.current = value
    setIsMuted(value)
  }, [])

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach((source) => {
      try { source.stop() } catch { /* already stopped */ }
    })
    sourcesRef.current.clear()
    nextStartTimeRef.current = 0
  }, [])

  /**
   * Executes a RAG query against the /api/rag/query endpoint.
   * Works with any function name declared in RAG_TOOLS — no name check needed.
   */
  const executeRAGQuery = useCallback(async (args: any): Promise<string> => {
    if (!args.query) return 'Error: el argumento query es requerido.'
    setIsSearching(true)
    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: args.query, characterId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error en la consulta RAG')
      return data.context || 'No se encontró información relevante en la base de conocimientos.'
    } catch (error) {
      console.error('[GeminiLive] RAG query error:', error)
      return 'Lo siento, no pude acceder a la base de conocimientos en este momento.'
    } finally {
      setIsSearching(false)
    }
  }, [characterId])

  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    // 1. Interrupciones
    if (message.serverContent?.interrupted) {
      stopAllAudio()
      return
    }

    // 2. Tool calls (RAG)
    if (message.toolCall) {
      const functionCalls = message.toolCall.functionCalls
      if (functionCalls && functionCalls.length > 0) {
        functionCalls.forEach((functionCall) => {
          const { name, args, id } = functionCall
          const functionName = typeof name === 'string' ? name : ''
          const toolCallId = typeof id === 'string' ? id : ''
          if (!functionName || !toolCallId || !activeSessionRef.current) return

          void executeRAGQuery(args ?? {}).then((resultText) => {
            try {
              activeSessionRef.current?.sendToolResponse({
                functionResponses: {
                  id: toolCallId,
                  name: functionName,
                  response: { context: resultText },
                },
              })
            } catch (error) {
              console.error('[GeminiLive] Error enviando tool response:', error)
            }
          })
        })
      }
      return
    }

    // 3. Audio playback
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data
    if (base64Audio && outputContextRef.current) {
      const output = outputContextRef.current
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime)
      const audioBuffer = await decodeAudioData(decode(base64Audio), output, 24000, 1)
      const source = output.createBufferSource()
      source.buffer = audioBuffer
      source.connect(output.destination)
      source.addEventListener('ended', () => sourcesRef.current.delete(source))
      source.start(nextStartTimeRef.current)
      nextStartTimeRef.current += audioBuffer.duration
      sourcesRef.current.add(source)
    }

    // 4. Transcriptions
    if (message.serverContent?.inputTranscription) {
      transcriptBufferRef.current.user += message.serverContent.inputTranscription.text
    }
    if (message.serverContent?.outputTranscription) {
      transcriptBufferRef.current.model += message.serverContent.outputTranscription.text
    }

    // 5. Turn complete — flush transcript buffer
    if (message.serverContent?.turnComplete) {
      const { user: userText, model: modelText } = transcriptBufferRef.current
      setHistory((prev) => {
        const next = [...prev]
        if (userText) next.push({ role: 'user', text: userText, timestamp: new Date() })
        if (modelText) next.push({ role: 'model', text: modelText, timestamp: new Date() })
        return next.slice(-20)
      })
      transcriptBufferRef.current = { user: '', model: '' }
    }
  }, [stopAllAudio, executeRAGQuery, outputContextRef])

  const connect = async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING)
      await initInputAudio()
      await initOutputAudio()

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY || '' })
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction,
          tools: RAG_TOOLS,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED)
            const source = inputContextRef.current!.createMediaStreamSource(stream)
            const workletNode = new AudioWorkletNode(inputContextRef.current!, 'audio-processor')

            workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
              if (isMutedRef.current) return
              const pcmBlob = {
                data: encode(new Uint8Array(event.data)),
                mimeType: 'audio/pcm;rate=16000',
              }
              sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }))
            }

            source.connect(workletNode)
            workletNode.connect(inputContextRef.current!.destination)
          },
          onmessage: handleMessage,
          onerror: () => setStatus(ConnectionStatus.ERROR),
          onclose: () => setStatus(ConnectionStatus.DISCONNECTED),
        },
      })

      sessionPromiseRef.current = sessionPromise
      sessionPromise.then((session) => {
        activeSessionRef.current = session
      })
    } catch {
      setStatus(ConnectionStatus.ERROR)
    }
  }

  const disconnect = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current
      session.close()
      sessionPromiseRef.current = null
    }
    stopAllAudio()
    setStatus(ConnectionStatus.DISCONNECTED)
  }

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
