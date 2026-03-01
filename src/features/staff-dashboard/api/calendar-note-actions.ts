'use server'

import { z } from 'zod'

import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

interface CalendarNoteData {
  id: string
  date: string
  content: string
}

function toUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day))
}

function formatDateKey(date: Date): string {
  const d = new Date(date)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export async function getNotesForMonthAction(
  month: number,
  year: number
): Promise<ActionResult<{ notes: CalendarNoteData[] }>> {
  try {
    const session = await requireDashboardUser()

    const startDate = toUTCDate(year, month, 1)
    const endDate = toUTCDate(year, month + 1, 1)

    const notes = await prisma.calendarNote.findMany({
      where: {
        userId: session.id,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        id: true,
        date: true,
        content: true,
      },
      orderBy: { date: 'asc' },
    })

    return {
      success: true,
      data: {
        notes: notes.map((n) => ({
          id: n.id,
          date: formatDateKey(n.date),
          content: n.content,
        })),
      },
    }
  } catch (error) {
    return handleActionError(error, 'getNotesForMonthAction', 'Error al obtener notas')
  }
}

const upsertNoteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().min(1).max(500),
})

export async function upsertNoteAction(
  date: string,
  content: string
): Promise<ActionResult<{ note: CalendarNoteData }>> {
  try {
    const session = await requireDashboardUser()
    const parsed = upsertNoteSchema.parse({ date, content })

    const [yearStr, monthStr, dayStr] = parsed.date.split('-')
    const noteDate = toUTCDate(Number(yearStr), Number(monthStr) - 1, Number(dayStr))

    const note = await prisma.calendarNote.upsert({
      where: {
        userId_date: {
          userId: session.id,
          date: noteDate,
        },
      },
      update: { content: parsed.content },
      create: {
        userId: session.id,
        date: noteDate,
        content: parsed.content,
      },
      select: {
        id: true,
        date: true,
        content: true,
      },
    })

    return {
      success: true,
      data: {
        note: {
          id: note.id,
          date: formatDateKey(note.date),
          content: note.content,
        },
      },
    }
  } catch (error) {
    return handleActionError(error, 'upsertNoteAction', 'Error al guardar nota')
  }
}

export async function deleteNoteAction(
  noteId: string
): Promise<ActionResult<void>> {
  try {
    const session = await requireDashboardUser()

    const note = await prisma.calendarNote.findFirst({
      where: { id: noteId, userId: session.id },
    })

    if (!note)
      return { success: false, error: 'Nota no encontrada' }

    await prisma.calendarNote.delete({ where: { id: noteId } })

    return { success: true }
  } catch (error) {
    return handleActionError(error, 'deleteNoteAction', 'Error al eliminar nota')
  }
}
