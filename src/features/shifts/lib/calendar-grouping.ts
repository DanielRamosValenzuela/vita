import { format } from 'date-fns'

import type { ShiftWithRelations } from '../types/shift-types'
import type { CalendarEvent, IndividualCalendarEvent, RotationGroupCalendarEvent } from '../ui/shift-calendar'

export function groupShiftsForCalendar(
  shifts: ShiftWithRelations[],
  noTitleLabel: string
): CalendarEvent[] {
  const individual: IndividualCalendarEvent[] = []
  const rotationMap = new Map<string, { shifts: ShiftWithRelations[]; first: ShiftWithRelations }>()

  for (const shift of shifts)
    if (!shift.rotationId)
      individual.push({
        kind: 'individual',
        id: shift.id,
        title: shift.title || noTitleLabel,
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: shift.status,
        userName: shift.user.name,
        areaName: shift.area.name,
        color: shift.shiftType.color,
        icon: shift.shiftType.icon ?? 'Clock',
      })
    else {
      const dateKey = format(shift.startTime, 'yyyy-MM-dd')
      const groupKey = `${dateKey}:${shift.rotationId}:${shift.shiftTypeId}`

      const existing = rotationMap.get(groupKey)
      if (existing)
        existing.shifts.push(shift)
      else
        rotationMap.set(groupKey, { shifts: [shift], first: shift })
    }

  const rotationGroups: RotationGroupCalendarEvent[] = []
  for (const [key, { shifts: groupShifts, first }] of rotationMap)
    rotationGroups.push({
      kind: 'rotation-group',
      id: `rg-${key}`,
      title: first.shiftType.name,
      startTime: first.startTime,
      endTime: first.endTime,
      color: first.shiftType.color,
      areaName: first.area.name,
      rotationId: first.rotationId!,
      shiftTypeId: first.shiftTypeId,
      personCount: groupShifts.length,
      shiftIds: groupShifts.map((s) => s.id),
    })

  const all: CalendarEvent[] = [...individual, ...rotationGroups]
  all.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  return all
}
