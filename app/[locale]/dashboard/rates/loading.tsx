import { Skeleton } from '@/src/shared/ui/skeleton'

export default function RatesLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in duration-300">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <div className="ml-auto flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
