import { Skeleton } from '@/components/ui/skeleton'

interface ChatMessageSkeletonProps {
  variant?: 'user' | 'assistant'
}

export function ChatMessageSkeleton({ variant = 'assistant' }: ChatMessageSkeletonProps) {
  if (variant === 'user') {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full max-w-[70%]" />
        <Skeleton className="h-4 w-full max-w-[60%]" />
        <Skeleton className="h-4 w-full max-w-[50%]" />
      </div>
    </div>
  )
}

export function ChatMessagesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <ChatMessageSkeleton variant="assistant" />
      <ChatMessageSkeleton variant="user" />
      <ChatMessageSkeleton variant="assistant" />
    </div>
  )
}
