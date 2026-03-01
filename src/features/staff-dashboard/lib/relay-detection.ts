import type { PersonnelShift } from '../types/staff-dashboard-types'

const RELAY_GAP_MINUTES = 30

export function detectRelays(shifts: PersonnelShift[]): PersonnelShift[] {
  if (shifts.length < 2) return shifts

  const result = [...shifts]

  for (let i = 0; i < result.length - 1; i++) {
    const current = result[i]
    const next = result[i + 1]
    const gapMs =
      new Date(next.startTime).getTime() - new Date(current.endTime).getTime()
    const gapMinutes = gapMs / (1000 * 60)

    if (gapMinutes <= RELAY_GAP_MINUTES && gapMinutes >= 0 && current.userId !== next.userId)  {
      result[i] = {
        ...current,
        relay: {
          type: 'outgoing',
          userId: next.userId,
          userName: next.userName,
        },
      }
      result[i + 1] = {
        ...next,
        relay: {
          type: 'incoming',
          userId: current.userId,
          userName: current.userName,
        },
      }
    }
  }

  return result
}
