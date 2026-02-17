'use server'

import { revalidatePath } from 'next/cache'
import type { DayType } from '@prisma/client'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'

import { calendarDaySchema, importHolidaysSchema, type ImportHolidaysInput } from '../lib/calendar-schemas'

export interface OrganizationCalendarDay {
  id: string
  date: Date
  type: DayType
  name: string | null
  description: string | null
  multiplier: number
  isRecurring: boolean
}

export interface CalendarDayData {
  date: Date
  type: DayType
  name?: string
  description?: string
  multiplier?: number
  isRecurring?: boolean
}

export async function getOrganizationCalendarAction(
  year: number,
  month: number
): Promise<ActionResult<OrganizationCalendarDay[]>> {
  try {
    const session = await requireAdminHRWithOrg()

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const calendarDays = await prisma.organizationCalendar.findMany({
      where: {
        organizationId: session.organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    return {
      success: true,
      data: calendarDays,
    }
  } catch (error) {
    return handleActionError(
      error,
      'getOrganizationCalendarAction',
      'Error al cargar el calendario'
    )
  }
}

export async function upsertCalendarDayAction(
  data: CalendarDayData
): Promise<ActionResult<OrganizationCalendarDay>> {
  try {
    const session = await requireAdminHRWithOrg()

    const validated = calendarDaySchema.parse({
      date: data.date,
      type: data.type,
      name: data.name,
      description: data.description,
      multiplier: data.multiplier ?? 1.0,
      isRecurring: data.isRecurring,
    })

    const calendarDay = await prisma.organizationCalendar.upsert({
      where: {
        organizationId_date: {
          organizationId: session.organizationId,
          date: validated.date,
        },
      },
      create: {
        organizationId: session.organizationId,
        date: validated.date,
        type: validated.type,
        name: validated.name,
        description: validated.description,
        multiplier: validated.multiplier,
        isRecurring: validated.isRecurring || false,
      },
      update: {
        type: validated.type,
        name: validated.name,
        description: validated.description,
        multiplier: validated.multiplier,
        isRecurring: validated.isRecurring || false,
      },
    })

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/shifts')

    return {
      success: true,
      data: calendarDay,
      message: 'Día especial guardado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'upsertCalendarDayAction', 'Error al guardar el día especial')
  }
}

export async function deleteCalendarDayAction(dayId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireAdminHRWithOrg()

    await prisma.organizationCalendar.delete({
      where: {
        id: dayId,
        organizationId: session.organizationId,
      },
    })

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/shifts')

    return {
      success: true,
      message: 'Día especial eliminado',
    }
  } catch (error) {
    return handleActionError(error, 'deleteCalendarDayAction', 'Error al eliminar el día especial')
  }
}

export async function bulkMarkDaysAction(
  dates: Date[],
  type: DayType,
  multiplier?: number,
  name?: string
): Promise<ActionResult<number>> {
  try {
    const session = await requireAdminHRWithOrg()

    const results = await Promise.all(
      dates.map((date) =>
        prisma.organizationCalendar.upsert({
          where: {
            organizationId_date: {
              organizationId: session.organizationId,
              date,
            },
          },
          create: {
            organizationId: session.organizationId,
            date,
            type,
            multiplier: multiplier || 1.0,
            name,
          },
          update: {
            type,
            multiplier: multiplier || 1.0,
            name,
          },
        })
      )
    )

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/shifts')

    return {
      success: true,
      data: results.length,
      message: `${results.length} días marcados exitosamente`,
    }
  } catch (error) {
    return handleActionError(error, 'bulkMarkDaysAction', 'Error al marcar los días')
  }
}

export async function importNationalHolidaysAction(
  data: ImportHolidaysInput
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  try {
    const session = await requireAdminHRWithOrg()
    const validated = importHolidaysSchema.parse(data)

    let imported = 0
    let skipped = 0

    for (const holiday of validated.selectedHolidays) {
      const [yearStr, monthStr, dayStr] = holiday.date.split('-')
      const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr))
      const dayType: DayType = holiday.inalienable ? 'IRRENUNCIABLE' : 'HOLIDAY'
      const multiplier = holiday.inalienable ? 2.5 : 1.5

      const existing = await prisma.organizationCalendar.findUnique({
        where: {
          organizationId_date: {
            organizationId: session.organizationId,
            date,
          },
        },
      })

      if (existing) {
        skipped++
        continue
      }

      await prisma.organizationCalendar.create({
        data: {
          organizationId: session.organizationId,
          date,
          type: dayType,
          name: holiday.title,
          multiplier,
          isRecurring: false,
        },
      })
      imported++
    }

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/shifts')

    return {
      success: true,
      data: { imported, skipped },
    }
  } catch (error) {
    return handleActionError(
      error,
      'importNationalHolidaysAction',
      'Error al importar feriados'
    )
  }
}
