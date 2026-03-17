"use client"

import type React from "react"

interface VoiceRecordingButtonProps {
  isRecording: boolean
  isConnected: boolean
  onToggleRecording: () => void
}

export const VoiceRecordingButton: React.FC<VoiceRecordingButtonProps> = ({
  isRecording,
  isConnected,
  onToggleRecording,
}) => {
  return (
    <button
      onClick={onToggleRecording}
      disabled={!isConnected}
      className={`w-full p-4 rounded-xl font-semibold text-white transition-all duration-300 
        flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.98]
        ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        } 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isRecording ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        )}
      </svg>
      <span>{isRecording ? "Detener Grabación" : "Iniciar Grabación de Voz"}</span>
      {isRecording && (
        <span className="flex gap-1">
          <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
          <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
        </span>
      )}
    </button>
  )
}
