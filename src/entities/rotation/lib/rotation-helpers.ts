export function getStepForDay(
  patternLength: number,
  cycleOffset: number,
  dayIndex: number
): number {
  return (dayIndex + cycleOffset) % patternLength
}

export function getPatternSummary(
  steps: Array<{ isRestDay: boolean; shiftTypeName?: string }>
): string {
  return steps
    .map((step) => (step.isRestDay ? 'Libre' : (step.shiftTypeName ?? 'Libre')))
    .join(' → ')
}

export function combineDateAndTime(date: Date, timeString: string): Date {
  const [hoursStr, minutesStr] = timeString.split(':')
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes, 0, 0)
  )
}

export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60 * 1000)
}

export function daysBetween(start: Date, end: Date): number {
  const utcStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  const utcEnd = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  return Math.round((utcEnd - utcStart) / (1000 * 60 * 60 * 24))
}
