'use server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'

interface GetMyShiftsParams {
  startDate: Date
  endDate: Date
  status?: string
}

export async function getMyShiftsAction(
  params: GetMyShiftsParams
): Promise<ActionResult<{ shifts: ShiftWithRelations[] }>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { shifts: [] } }

    const where: Record<string, unknown> = {
      userId: session.id,
      organizationId,
      startTime: {
        gte: params.startDate,
        lt: params.endDate,
      },
    }

    if (params.status)
      where.status = params.status

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        area: {
          select: { id: true, name: true, description: true },
        },
        shiftType: {
          select: { id: true, name: true, color: true, icon: true },
        },
        rotation: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    return { success: true, data: { shifts: shifts as ShiftWithRelations[] } }
  } catch (error) {
    return handleActionError(error, 'getMyShiftsAction', 'Error al obtener turnos')
  }
}

export async function getUpcomingShiftsAction(): Promise<
  ActionResult<{ shifts: ShiftWithRelations[] }>
> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { shifts: [] } }

    const now = new Date()
    const sevenDaysLater = new Date(now)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const shifts = await prisma.shift.findMany({
      where: {
        userId: session.id,
        organizationId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: {
          gte: now,
          lt: sevenDaysLater,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        area: {
          select: { id: true, name: true, description: true },
        },
        shiftType: {
          select: { id: true, name: true, color: true, icon: true },
        },
        rotation: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 10,
    })

    return { success: true, data: { shifts: shifts as ShiftWithRelations[] } }
  } catch (error) {
    return handleActionError(error, 'getUpcomingShiftsAction', 'Error al obtener próximos turnos')
  }
}

export async function getShiftsForFeed(
  userId: string,
  organizationId: string | null,
  startDate: Date
) {
  const where: Record<string, unknown> = {
    userId,
    status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
    startTime: { gte: startDate },
  }

  if (organizationId)
    where.organizationId = organizationId

  return prisma.shift.findMany({
    where,
    include: {
      area: { select: { name: true } },
      shiftType: { select: { name: true } },
      rotation: { select: { name: true } },
      organization: { select: { name: true } },
    },
    orderBy: { startTime: 'asc' },
  })
}
