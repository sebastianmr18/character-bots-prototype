import { Skeleton } from '@/components/ui/skeleton'

export function ConversationItemSkeleton() {
  return (
    <div className="w-full rounded-lg border border-border bg-background p-3">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-sm" />

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Title + badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>

          {/* Date */}
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}
