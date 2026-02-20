import { Skeleton } from '@/src/shared/ui/skeleton'

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in duration-300">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border-r p-2 last:border-r-0">
                <Skeleton className="mx-auto h-4 w-8" />
              </div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid grid-cols-7 border-b last:border-b-0">
              {Array.from({ length: 7 }).map((_, col) => (
                <div key={col} className="border-r p-2 last:border-r-0 min-h-20">
                  <Skeleton className="mb-1 h-4 w-6" />
                  {row % 2 === 0 && col % 3 === 0 && (
                    <Skeleton className="h-5 w-full rounded" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
