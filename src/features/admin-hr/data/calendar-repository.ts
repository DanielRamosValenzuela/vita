import { prisma } from '@/src/shared/lib/db'
import type { DayType } from '@prisma/client'

export async function getDayTypeForDate(
  organizationId: string,
  date: Date
): Promise<{ type: DayType; multiplier: number } | null> {
  const calendarDay = await prisma.organizationCalendar.findUnique({
    where: {
      organizationId_date: {
        organizationId,
        date,
      },
    },
    select: {
      type: true,
      multiplier: true,
    },
  })

  return calendarDay
}

export async function getYearCalendar(
  organizationId: string,
  year: number
): Promise<
  Array<{
    id: string
    date: Date
    type: DayType
    name: string | null
    multiplier: number
  }>
> {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59)

  const calendarDays = await prisma.organizationCalendar.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      date: true,
      type: true,
      name: true,
      multiplier: true,
    },
    orderBy: { date: 'asc' },
  })

  return calendarDays
}

export async function isSpecialDay(
  organizationId: string,
  date: Date
): Promise<boolean> {
  const count = await prisma.organizationCalendar.count({
    where: {
      organizationId,
      date,
      type: {
        not: 'NORMAL',
      },
    },
  })

  return count > 0
}
