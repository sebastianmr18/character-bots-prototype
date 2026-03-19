"use client"

import React from "react"
import { CallModePanel } from "@/components/ui/features/characters/CallModePanel"

interface CallCanvasProps {
  characterId: string
}

export const CallCanvas: React.FC<CallCanvasProps> = ({ characterId }) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl min-h-[70vh] md:h-[85vh]">
        <CallModePanel characterId={characterId} onEndCall={() => undefined} />
      </div>
    </div>
  )
}
