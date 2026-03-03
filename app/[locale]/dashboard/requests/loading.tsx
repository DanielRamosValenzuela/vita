import { Skeleton } from '@/src/shared/ui/skeleton'

export default function RequestsLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in duration-300">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
        <Skeleton className="h-10 w-80" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
