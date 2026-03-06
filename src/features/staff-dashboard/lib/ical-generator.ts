import ical, { ICalCalendarMethod } from 'ical-generator'

interface ICalShift {
  id: string
  startTime: Date
  endTime: Date
  status: string
  areaName: string
  shiftTypeName: string
  rotationName?: string | null
  isExtra: boolean
  organizationName?: string
}

interface GenerateICalOptions {
  calendarName?: string
  timezone?: string
}

export function generateICalContent(
  shifts: ICalShift[],
  options: GenerateICalOptions = {}
): string {
  const { calendarName = 'VITA Turnos', timezone = 'America/Santiago' } = options

  const calendar = ical({
    name: calendarName,
    timezone,
    prodId: { company: 'VITA', product: 'TurnoMed' },
    method: ICalCalendarMethod.PUBLISH,
  })

  for (const shift of shifts) {
    const summary = shift.organizationName
      ? `${shift.shiftTypeName} - ${shift.areaName} (${shift.organizationName})`
      : `${shift.shiftTypeName} - ${shift.areaName}`

    const descriptionParts: string[] = []
    if (shift.rotationName) descriptionParts.push(`Rotativa: ${shift.rotationName}`)
    if (shift.isExtra) descriptionParts.push('Turno Extra')
    descriptionParts.push(`Estado: ${shift.status}`)

    calendar.createEvent({
      id: `shift-${shift.id}@vita.app`,
      start: shift.startTime,
      end: shift.endTime,
      timezone,
      summary,
      description: descriptionParts.join('\n'),
      location: shift.areaName,
    })
  }

  return calendar.toString()
}
