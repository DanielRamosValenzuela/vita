'use server'

import {
  getChiefAccessibleAreaIds,
  resolveChiefOrganizationId,
} from '@/src/shared/lib/auth/chief-access'
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
  areaId?: string
  areaIds?: string[]
}

export async function getMyShiftsAction(
  params: GetMyShiftsParams
): Promise<ActionResult<{ shifts: ShiftWithRelations[] }>> {
  try {
    const session = await requireDashboardUser()

    const chiefMode = isChief(session)

    const organizationId = chiefMode
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)

    if (!organizationId) return { success: true, data: { shifts: [] } }

    const where: Record<string, unknown> = {
      organizationId,
      startTime: {
        gte: params.startDate,
        lt: params.endDate,
      },
    }

    if (chiefMode) {
      const chiefAreaIds = await getChiefAccessibleAreaIds(session.id)
      if (chiefAreaIds.length === 0) return { success: true, data: { shifts: [] } }

      if (params.areaId) {
        if (!chiefAreaIds.includes(params.areaId)) return { success: true, data: { shifts: [] } }
        where.areaId = params.areaId
      } else if (params.areaIds?.length) {
        const validIds = params.areaIds.filter((id) => chiefAreaIds.includes(id))
        if (validIds.length === 0) return { success: true, data: { shifts: [] } }
        where.areaId = { in: validIds }
      } else where.areaId = { in: chiefAreaIds }
    } else {
      where.userId = session.id

      if (params.areaId) where.areaId = params.areaId
      else if (params.areaIds?.length) where.areaId = { in: params.areaIds }
    }

    if (params.status) where.status = params.status

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

    const chiefMode = isChief(session)

    const organizationId = chiefMode
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)

    if (!organizationId) return { success: true, data: { shifts: [] } }

    const now = new Date()
    const sevenDaysLater = new Date(now)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const where: Record<string, unknown> = {
      organizationId,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      startTime: {
        gte: now,
        lt: sevenDaysLater,
      },
    }

    if (chiefMode) {
      const chiefAreaIds = await getChiefAccessibleAreaIds(session.id)
      if (chiefAreaIds.length === 0) return { success: true, data: { shifts: [] } }
      where.areaId = { in: chiefAreaIds }
    } else where.userId = session.id

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

  if (organizationId) where.organizationId = organizationId

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
