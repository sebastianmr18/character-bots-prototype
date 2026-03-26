"use client"

import type React from "react"
import { motion } from "framer-motion"
import { StopCircle, X } from "lucide-react"

interface VoiceRecordingModalProps {
  isOpen: boolean
  isRecording: boolean
  audioLevel: number
  onClose: () => void
  onToggleRecording: () => void
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  isOpen,
  isRecording,
  audioLevel,
  onClose,
  onToggleRecording,
}) => {
  if (!isOpen) return null

  const handleSendClick = () => {
    if (isRecording) {
      onToggleRecording()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => {}}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative h-32 w-32">
            <motion.div
              animate={{
                scale: [1, 1.3 + audioLevel * 0.4, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
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
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
              className="absolute inset-2 rounded-full border-2 border-red-400 bg-red-50 dark:bg-red-900/20"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className="rounded-full bg-red-600 p-4 text-white shadow-lg transition-colors hover:bg-red-700"
              >
                <StopCircle className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Grabando... Presiona Enviar para detener y procesar.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X className="mr-2 inline h-4 w-4" />
            Cancelar
          </button>

          <button
            onClick={handleSendClick}
            disabled={!isRecording}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-blue-500 dark:text-blue-400">
          Grabando, presiona Enviar para detener y enviar al backend.
        </p>
      </motion.div>
    </motion.div>
  )
}