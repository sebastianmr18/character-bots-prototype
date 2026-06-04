/**
 * Call Mode Skeleton: esqueleto de carga para Call Mode.
 */
/**
 * Esqueleto de carga para Call Mode.
 */

import { Skeleton } from '@/components/ui/skeleton'

export function CallModeSkeleton() {
  return (
    <div className="relative flex-1 min-h-0 overflow-hidden rounded-2xl border border-border bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(59,130,246,0.08)_0%,transparent_22%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(59,130,246,0.06)_0%,transparent_22%,transparent_100%)]" />

      <div className="relative z-10 flex h-full flex-col gap-4 p-4 sm:gap-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card/85 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 bg-muted" />
            <Skeleton className="h-4 w-56 bg-muted/80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full bg-muted/80" />
            <Skeleton className="h-7 w-28 rounded-full bg-muted" />
          </div>
        </div>

        <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-5">
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-border bg-card/80 px-6 py-8 text-center shadow-sm backdrop-blur-md sm:px-8">
            <Skeleton className="h-36 w-36 rounded-full border-4 border-background bg-muted sm:h-44 sm:w-44" />
            <div className="mt-6 flex w-full max-w-xl flex-col items-center gap-3">
              <Skeleton className="h-3 w-28 bg-muted/80" />
              <Skeleton className="h-8 w-72 bg-muted" />
              <Skeleton className="h-4 w-full max-w-md bg-muted/80" />
              <Skeleton className="h-4 w-5/6 max-w-sm bg-muted/80" />
            </div>
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full bg-muted/80" />
              <Skeleton className="h-7 w-28 rounded-full bg-muted/80" />
            </div>
            <div className="mt-5 flex w-full max-w-lg flex-col items-center gap-2">
              <Skeleton className="h-4 w-full bg-muted/80" />
              <Skeleton className="h-4 w-11/12 bg-muted/80" />
              <Skeleton className="h-4 w-4/5 bg-muted/80" />
            </div>
            <Skeleton className="mt-6 h-11 w-44 rounded-full bg-muted" />
          </div>

          <div className="flex min-h-0 flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur-md sm:p-5">
              <Skeleton className="h-3 w-24 bg-muted/80" />
              <div className="mt-3 space-y-3">
                <Skeleton className="h-20 w-full rounded-xl bg-muted/80" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full rounded-xl bg-muted/80" />
                  <Skeleton className="h-16 w-full rounded-xl bg-muted/80" />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur-md sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-44 bg-muted/80" />
                  <Skeleton className="h-4 w-56 bg-muted/80" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full bg-muted/80" />
              </div>
              <div className="space-y-3">
                <Skeleton className="ml-6 h-20 w-[calc(100%-1.5rem)] rounded-2xl bg-muted/80" />
                <Skeleton className="mr-6 h-24 w-[calc(100%-1.5rem)] rounded-2xl bg-muted/80" />
                <Skeleton className="ml-6 h-16 w-[calc(100%-2rem)] rounded-2xl bg-muted/80" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-card/90 p-3 shadow-sm backdrop-blur-xl sm:p-4">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full bg-muted" />
              <Skeleton className="h-3 w-16 bg-muted/80" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full bg-muted" />
              <Skeleton className="h-3 w-16 bg-muted/80" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full bg-muted" />
              <Skeleton className="h-3 w-16 bg-muted/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
