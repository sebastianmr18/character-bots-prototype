"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mic, X } from "lucide-react"

interface VoiceRecordingModalProps {
  isOpen: boolean
  isRecording: boolean
  audioLevel: number
  transcription: string
  onClose: () => void
  onSend: () => void
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  isOpen,
  isRecording,
  audioLevel,
  transcription,
  onClose,
  onSend,
}) => {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
      >
        {isRecording && (
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              {/* Outer pulsing circle */}
              <motion.div
                animate={{
                  scale: [1, 1 + audioLevel * 0.3],
                  opacity: [0.3, 0.1],
                }}
                transition={{ duration: 0.1 }}
                className="absolute inset-0 rounded-full border-2 border-blue-500"
              />

              {/* Middle circle */}
              <motion.div
                animate={{
                  scale: [1, 1 + audioLevel * 0.2],
                }}
                transition={{ duration: 0.1 }}
                className="absolute inset-2 rounded-full border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              />

              {/* Center microphone icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1] }}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                  className="bg-blue-600 rounded-full p-4 text-white"
                >
                  <Mic className="w-6 h-6" />
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Transcription display */}
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">Transcripción:</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">{transcription}</p>
          </motion.div>
        )}

        {/* Status text */}
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isRecording ? "Grabando..." : transcription ? "Listo para enviar" : "Procesando..."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-all duration-200"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancelar
          </button>

          <button
            onClick={onSend}
            disabled={!transcription}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold 
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            Enviar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
