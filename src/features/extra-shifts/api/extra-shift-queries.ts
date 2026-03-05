'use server'

import { getChiefAccessibleAreaIds, resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import {
  getApplicationsByUser,
  getApplicationsForShift,
  type ShiftApplicationWithRelations,
} from '@/src/entities/shift-application'

interface ExtraShiftForList {
  id: string
  startTime: Date
  endTime: Date
  coverageStatus: string
  area: { id: string; name: string; color: string }
  shiftType: { id: string; name: string; color: string; icon: string | null }
  _count: { applications: number }
}

export async function getExtraShiftsForAreaAction(): Promise<
  ActionResult<{ shifts: ExtraShiftForList[] }>
> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { shifts: [] } }

    let areaIds: string[]
    if (isChief(session))
      areaIds = await getChiefAccessibleAreaIds(session.id)
    else {
      const userAreas = await prisma.userArea.findMany({
        where: { userId: session.id },
        select: { areaId: true },
      })
      areaIds = userAreas.map((ua) => ua.areaId)
    }

    if (areaIds.length === 0)
      return { success: true, data: { shifts: [] } }

    const shifts = await prisma.shift.findMany({
      where: {
        organizationId,
        areaId: { in: areaIds },
        coverageStatus: 'OPEN_FOR_APPLICATIONS',
        status: 'SCHEDULED',
        startTime: { gte: new Date() },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        coverageStatus: true,
        area: { select: { id: true, name: true, color: true } },
        shiftType: { select: { id: true, name: true, color: true, icon: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    return { success: true, data: { shifts } }
  } catch (error) {
    return handleActionError(error, 'getExtraShiftsForAreaAction', 'Error al obtener turnos extra')
  }
}

export async function getMyApplicationsAction(): Promise<
  ActionResult<{ applications: ShiftApplicationWithRelations[] }>
> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { applications: [] } }

    const applications = await getApplicationsByUser(session.id, organizationId)
    return { success: true, data: { applications } }
  } catch (error) {
    return handleActionError(error, 'getMyApplicationsAction', 'Error al obtener postulaciones')
  }
}

export async function getApplicationsForShiftAction(
  shiftId: string
): Promise<ActionResult<{ applications: ShiftApplicationWithRelations[] }>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { applications: [] } }

    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId },
      select: { areaId: true },
    })
    if (!shift)
      return { success: false, error: 'Turno no encontrado' }

    if (isChief(session)) {
      const areaIds = await getChiefAccessibleAreaIds(session.id)
      if (!areaIds.includes(shift.areaId))
        return { success: false, error: 'Sin acceso al área' }
    }

    const applications = await getApplicationsForShift(shiftId, organizationId)
    return { success: true, data: { applications } }
  } catch (error) {
    return handleActionError(error, 'getApplicationsForShiftAction', 'Error al obtener postulaciones')
  }
}
