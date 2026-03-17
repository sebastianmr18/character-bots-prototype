"use client"

import type React from "react"
import { motion } from "framer-motion"
import { StopCircle, X, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => {}}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-xl"
      >
        {/* Pulsing mic animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-28 w-28">
            <motion.div
              animate={{
                scale: [1, 1.3 + audioLevel * 0.4, 1],
                opacity: [0.2, 0.08, 0.2],
              }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-destructive"
            />
            <motion.div
              animate={{ scale: [1, 1.15 + audioLevel * 0.25, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-3 rounded-full bg-destructive/20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-destructive p-4 text-white shadow-md">
                {isRecording ? (
                  <StopCircle className="h-7 w-7" />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          Grabando… Presiona <strong>Enviar</strong> para procesar o{" "}
          <strong>Cancelar</strong> para descartar.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleSendClick}
            disabled={!isRecording}
          >
            Enviar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}