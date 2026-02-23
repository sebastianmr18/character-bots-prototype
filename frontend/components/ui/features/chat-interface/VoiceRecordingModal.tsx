"use client"

// 1. Imports añadidos
import type React from "react"
import { motion } from "framer-motion"
import { Mic, X, StopCircle } from "lucide-react"

interface VoiceRecordingModalProps {
  isOpen: boolean
  isRecording: boolean
  audioLevel: number
  transcription: string
  onClose: () => void
  onSend: (text: string) => void
  onToggleRecording: () => void
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  isOpen,
  isRecording,
  audioLevel,
  transcription,
  onClose,
  onSend,
  onToggleRecording,
}) => {
  if (!isOpen) return null

  const hasTranscription = !isRecording && transcription.length > 0;

  const handleSendClick = () => {
    if (isRecording) {
      onToggleRecording()
    } else if (hasTranscription) {
      onSend(transcription)
      onClose()
    }
  }

  const handleCancelClick = () => {
    if (isRecording) {
      onToggleRecording()
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={!isRecording && hasTranscription ? onClose : () => { }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
      >

        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">

            {isRecording && (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.3 + audioLevel * 0.4, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 1, // Duración de 1 segundo para el ciclo completo
                    repeat: Infinity, // Animación infinita
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  }}
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2 + audioLevel * 0.3, 1],
                  }}
                  transition={{
                    duration: 0.8, // Ligeramente más rápido para un efecto dinámico
                    repeat: Infinity, // Animación infinita
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  }}
                  className="absolute inset-2 rounded-full border-2 border-red-400 bg-red-50 dark:bg-red-900/20"
                />
              </>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className={`rounded-full p-4 text-white shadow-lg transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 dark:bg-gray-700'
                  }`}
              >
                {isRecording ? (
                  <StopCircle className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isRecording
              ? "Grabando... Presiona Enviar para detener."
              : hasTranscription
                ? "Presiona Enviar para continuar."
                : "Procesando audio..."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancelClick}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancelar
          </button>

          <button
            onClick={handleSendClick}
            disabled={!isRecording && !hasTranscription}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold 
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
          >
            Enviar
          </button>
        </div>

        {/* Mensaje de procesamiento/grabación si no hay transcripción */}
        {!hasTranscription && (
          <p className="mt-4 text-center text-sm text-blue-500 dark:text-blue-400">
            {isRecording ? "Grabando, presiona Enviar para detener." : "Procesando audio en el servidor..."}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}