import { Skeleton } from '@/components/ui/skeleton'

export function CallModeSkeleton() {
  return (
    <div className="relative flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background">
      {/* Dark overlay - same as CallMode */}
      <div className="absolute inset-0 bg-foreground/70" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            {/* Character name */}
            <Skeleton className="h-6 w-40 bg-background/20" />
            {/* Status text */}
            <Skeleton className="h-4 w-48 bg-background/15" />
          </div>

          {/* Status badge */}
          <Skeleton className="h-6 w-24 rounded-full bg-background/20" />
        </div>

        {/* Center area with avatar */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-background/20 border-4 border-background/30" />
          </div>

          {/* Biography lines */}
          <div className="flex flex-col items-center gap-2 max-w-sm w-full px-4">
            <Skeleton className="h-4 w-full max-w-[280px] bg-background/15" />
            <Skeleton className="h-4 w-full max-w-[240px] bg-background/15" />
          </div>

          {/* Action button */}
          <Skeleton className="h-10 w-40 rounded-full bg-background/20" />
        </div>

        {/* Transcription panel */}
        <div className="bg-background/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 max-h-44 overflow-y-auto border border-background/15">
          {/* Panel title */}
          <Skeleton className="h-3 w-40 mb-3 bg-background/20" />

          {/* Transcript lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-background/15" />
            <Skeleton className="h-4 w-5/6 bg-background/15" />
            <Skeleton className="h-4 w-4/5 bg-background/15" />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-background/20" />
          <Skeleton className="h-12 w-12 rounded-full bg-background/20" />
          <Skeleton className="h-12 w-12 rounded-full bg-background/20" />
        </div>
      </div>
    </div>
  )
}
