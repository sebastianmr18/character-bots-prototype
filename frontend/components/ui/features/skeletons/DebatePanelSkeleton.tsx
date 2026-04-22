import { Skeleton } from '@/components/ui/skeleton'

export function DebatePanelSkeleton() {
  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* Header with character avatars */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <Skeleton className="h-8 w-8 rounded-full" />

        <div className="flex items-center gap-3">
          <div className="space-y-2 text-right">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-4">
        {/* Message from character A */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[70%]" />
            <Skeleton className="h-4 w-full max-w-[60%]" />
          </div>
        </div>

        {/* Message from character B */}
        <div className="flex gap-3 justify-end">
          <div className="flex-1 space-y-2 flex flex-col items-end">
            <Skeleton className="h-4 w-full max-w-[70%]" />
            <Skeleton className="h-4 w-full max-w-[65%]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>

        {/* Message from character A */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[65%]" />
            <Skeleton className="h-4 w-full max-w-[55%]" />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border pt-4 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}
