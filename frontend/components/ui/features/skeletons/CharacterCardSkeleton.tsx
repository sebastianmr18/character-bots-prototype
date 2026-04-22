import { Skeleton } from '@/components/ui/skeleton'

export function CharacterCardSkeleton() {
  return (
    <div className="group relative rounded-lg overflow-hidden bg-card border border-border">
      {/* Image area */}
      <div className="h-80 relative overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Role badge + biography */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 flex-1" />
        </div>
      </div>
    </div>
  )
}
