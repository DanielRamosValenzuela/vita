'use client'

const SHIFT_COLORS = [
  'bg-blue-400',
  'bg-emerald-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-cyan-400',
  'bg-pink-400',
  'bg-indigo-400',
]

const SHIFTS: { row: number; col: number; span: number; color: number }[] = [
  { row: 0, col: 0, span: 2, color: 0 },
  { row: 0, col: 3, span: 2, color: 1 },
  { row: 0, col: 6, span: 1, color: 2 },
  { row: 1, col: 1, span: 3, color: 3 },
  { row: 1, col: 5, span: 2, color: 4 },
  { row: 2, col: 0, span: 2, color: 5 },
  { row: 2, col: 3, span: 2, color: 0 },
  { row: 2, col: 6, span: 1, color: 6 },
  { row: 3, col: 0, span: 3, color: 2 },
  { row: 3, col: 4, span: 2, color: 1 },
]

export function HeroDashboardMockup() {
  return (
    <div className="animate-hero-scale-in-delay-2 animate-hero-glow-pulse rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-slate-900 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-red-400/70" />
          <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
          <div className="h-2 w-2 rounded-full bg-green-400/70" />
          <div className="ml-3 h-2 w-20 rounded-full bg-white/10" />
        </div>

        <div className="flex">
          <div className="flex w-10 flex-col items-center gap-2 border-r border-white/10 bg-slate-900/50 py-3">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-blue-400 to-indigo-500" />
            <div className="mt-1 h-4 w-4 rounded bg-white/20" />
            <div className="h-4 w-4 rounded bg-white/10" />
            <div className="h-4 w-4 rounded bg-white/10" />
            <div className="h-4 w-4 rounded bg-white/10" />
          </div>

          <div className="flex-1 p-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-white/20" />
              <div className="ml-auto h-2 w-10 rounded-full bg-white/10" />
            </div>

            <div className="grid grid-cols-7 gap-px">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`h-${i}`} className="pb-1 text-center">
                  <div className="mx-auto h-1.5 w-3 rounded-full bg-white/20" />
                </div>
              ))}

              {Array.from({ length: 28 }).map((_, i) => (
                <div key={`c-${i}`} className="h-6 rounded bg-white/[0.04]" />
              ))}
            </div>

            <div className="relative -mt-[calc(6*4px+3*1px+6px)] ml-0">
              <div className="grid grid-cols-7 gap-px">
                {Array.from({ length: 28 }).map((_, i) => {
                  const row = Math.floor(i / 7)
                  const col = i % 7
                  const shift = SHIFTS.find((s) => s.row === row && col >= s.col && col < s.col + s.span)

                  if (!shift || col !== shift.col) return <div key={`s-${i}`} className="h-6" />

                  return (
                    <div
                      key={`s-${i}`}
                      className={`${SHIFT_COLORS[shift.color]} h-6 rounded opacity-70`}
                      style={{ gridColumn: `span ${shift.span}` }}
                    />
                  )
                })}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 p-2">
                <div className="mb-1.5 h-1.5 w-8 rounded-full bg-white/15" />
                <div className="font-mono text-sm font-bold text-blue-400">{247}</div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-blue-400/60" />
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 p-2">
                <div className="mb-1.5 h-1.5 w-8 rounded-full bg-white/15" />
                <div className="font-mono text-sm font-bold text-emerald-400">{89}</div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/10">
                  <div className="h-full w-3/5 rounded-full bg-emerald-400/60" />
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 p-2">
                <div className="mb-1.5 h-1.5 w-8 rounded-full bg-white/15" />
                <div className="font-mono text-sm font-bold text-purple-400">{156}</div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/10">
                  <div className="h-full w-4/5 rounded-full bg-purple-400/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
