type PayrollProgressStatus = 'generating' | 'completed' | 'failed'

interface PayrollProgress {
  current: number
  total: number
  status: PayrollProgressStatus
  startedAt: number
}

const progressStore = new Map<string, PayrollProgress>()

export function updateProgress(
  periodId: string,
  data: { current: number; total: number; status: PayrollProgressStatus }
) {
  const existing = progressStore.get(periodId)
  progressStore.set(periodId, {
    ...data,
    startedAt: existing?.startedAt ?? Date.now(),
  })
}

export function getProgress(periodId: string): PayrollProgress | null {
  return progressStore.get(periodId) ?? null
}

export function clearProgress(periodId: string) {
  progressStore.delete(periodId)
}
