import { Card, CardContent, CardHeader } from '@/src/shared/ui/card'
import { Skeleton } from '@/src/shared/ui/skeleton'

export default function ShiftTypesLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in duration-300">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <div className="ml-auto flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
