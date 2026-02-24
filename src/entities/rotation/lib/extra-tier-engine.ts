export type ShiftClassificationType = 'DAY' | 'NIGHT' | 'MIXED'

type ExtraTierType = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'NEVER_RECOMMEND'

export type CandidateWarningType = {
  type: 'max_consecutive_hours' | 'min_rest_hours' | 'noche_to_largo' | 'came_from_noche'
  message: string
  severity: 'warning' | 'error'
}

export type CandidateShiftHistory = {
  currentShift?: {
    classification: ShiftClassificationType
    startTime: Date
    endTime: Date
  }
  previousShift?: {
    classification: ShiftClassificationType
    endTime: Date
  }
}

type TierResult = {
  tier: ExtraTierType
  label: string
  warnings: CandidateWarningType[]
}

const ASSUMED_EXTRA_SHIFT_HOURS = 12
const MS_PER_HOUR = 1000 * 60 * 60

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / MS_PER_HOUR
}

function buildMaxConsecutiveWarning(): CandidateWarningType {
  return {
    type: 'max_consecutive_hours',
    message: 'Candidate would exceed maximum consecutive hours',
    severity: 'warning',
  }
}

function buildMinRestWarning(): CandidateWarningType {
  return {
    type: 'min_rest_hours',
    message: 'Candidate has insufficient rest since last shift',
    severity: 'warning',
  }
}

function checkMinRest(
  previousShiftEnd: Date | undefined,
  minRestHours: number | undefined,
  now: Date,
): CandidateWarningType | null {
  if (minRestHours === undefined || previousShiftEnd === undefined)
    return null
  const restHours = hoursBetween(previousShiftEnd, now)
  return restHours < minRestHours ? buildMinRestWarning() : null
}

export function calculateTier(
  candidateHistory: CandidateShiftHistory,
  requestedShiftClassification: ShiftClassificationType,
  maxConsecutiveHours?: number,
  minRestHours?: number,
): TierResult {
  const { currentShift, previousShift } = candidateHistory
  const now = new Date()

  if (
    previousShift?.classification === 'NIGHT' &&
    requestedShiftClassification === 'DAY'
  )
    return {
      tier: 'NEVER_RECOMMEND',
      label: 'Post-noche, no asignar turno diurno',
      warnings: [
        {
          type: 'noche_to_largo',
          message: 'Cannot assign day shift after night shift',
          severity: 'error',
        },
      ],
    }

  if (
    currentShift !== undefined &&
    currentShift.classification === 'DAY' &&
    requestedShiftClassification === 'NIGHT'
  ) {
    const warnings: CandidateWarningType[] = []

    if (maxConsecutiveHours !== undefined) {
      const projectedEnd = new Date(
        now.getTime() + ASSUMED_EXTRA_SHIFT_HOURS * MS_PER_HOUR,
      )
      const totalHours = hoursBetween(currentShift.startTime, projectedEnd)
      if (totalHours > maxConsecutiveHours)
        warnings.push(buildMaxConsecutiveWarning())
    }

    const minRestWarning = checkMinRest(previousShift?.endTime, minRestHours, currentShift.startTime)
    if (minRestWarning !== null)
      warnings.push(minRestWarning)

    return {
      tier: 'TIER_1',
      label: 'Extensión de turno actual',
      warnings,
    }
  }

  if (
    currentShift === undefined &&
    (previousShift === undefined || previousShift.classification !== 'NIGHT')
  ) {
    const warnings: CandidateWarningType[] = []

    const minRestWarning = checkMinRest(previousShift?.endTime, minRestHours, now)
    if (minRestWarning !== null)
      warnings.push(minRestWarning)

    if (maxConsecutiveHours !== undefined) {
      const projectedHours = ASSUMED_EXTRA_SHIFT_HOURS
      if (projectedHours > maxConsecutiveHours)
        warnings.push(buildMaxConsecutiveWarning())
    }

    return {
      tier: 'TIER_2',
      label: 'Descansado y disponible',
      warnings,
    }
  }

  if (currentShift === undefined && previousShift?.classification === 'NIGHT') {
    const warnings: CandidateWarningType[] = [
      {
        type: 'came_from_noche',
        message: 'Coming off night shift',
        severity: 'warning',
      },
    ]

    const minRestWarning = checkMinRest(previousShift.endTime, minRestHours, now)
    if (minRestWarning !== null)
      warnings.push(minRestWarning)

    return {
      tier: 'TIER_3',
      label: 'Disponible, viene de turno nocturno',
      warnings,
    }
  }

  return {
    tier: 'TIER_3',
    label: 'Disponible, viene de turno nocturno',
    warnings: [],
  }
}
