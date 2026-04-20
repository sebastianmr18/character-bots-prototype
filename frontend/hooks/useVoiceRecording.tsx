"use client"

import { useRef, useState, useCallback, useEffect } from "react"

const AUDIO_MIME_TYPE = "audio/webm;codecs=opus"

export const getMediaRecorder = (stream: MediaStream): MediaRecorder => {
  if (!MediaRecorder.isTypeSupported(AUDIO_MIME_TYPE)) {
    throw new Error(`El formato ${AUDIO_MIME_TYPE} no está soportado en este navegador.`)
  }

  return new MediaRecorder(stream, { mimeType: AUDIO_MIME_TYPE })
}

export const useVoiceRecording = () => {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const analyser = useRef<AnalyserNode | null>(null)
  const animationFrameId = useRef<number | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const clearError = useCallback(() => setErrorMessage(null), [])

  const cleanupResources = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    analyser.current = null

    if (mediaRecorder.current) {
      mediaRecorder.current.ondataavailable = null
      mediaRecorder.current.onstop = null
      mediaRecorder.current.stream?.getTracks().forEach((track) => track.stop())
      mediaRecorder.current = null
    }

    audioChunks.current = []
    setIsRecording(false)
    setAudioLevel(0)
  }, [])

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices) {
      setErrorMessage("Tu navegador no soporta grabación de audio.")
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = getMediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.start()
      setIsRecording(true)

      const updateLevel = () => {
        if (analyser.current) {
          const dataArray = new Uint8Array(analyser.current.frequencyBinCount)
          analyser.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(average / 255, 1))
        }
        animationFrameId.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()
      return true
    } catch (err) {
      console.error("Error al acceder al micrófono:", err)
      setErrorMessage("Necesitas dar permiso al micrófono o usar un navegador compatible con audio/webm;codecs=opus.")
      return false
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) {
        resolve("")
        return
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })
        const reader = new FileReader()

        reader.onload = () => {
          const audioBase64 = reader.result as string
          const base64Data = audioBase64.split(",")[1] || ""
          resolve(base64Data)
        }

        reader.readAsDataURL(audioBlob)

        cleanupResources()
      }

      mediaRecorder.current.stop()
      setIsRecording(false)
      setAudioLevel(0)
    })
  }, [cleanupResources])

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop()
      }
      cleanupResources()
    }
  }, [cleanupResources])

  return { isRecording, audioLevel, startRecording, stopRecording, errorMessage, clearError }
}
