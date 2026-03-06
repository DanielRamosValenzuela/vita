'use server'

import type { SwapRequestStatus } from '@prisma/client'

import { getChiefAccessibleAreaIds, resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import {
  getSwapRequestById,
  getSwapRequestsForUser,
  getSwapRequestsForChief,
  getPendingSwapCountForUser,
  type SwapRequestWithRelations,
} from '@/src/entities/swap'
import { getPendingApplicationCountForChief } from '@/src/entities/shift-application'

export async function getMySwapRequestsAction(
  filter?: { type?: 'sent' | 'received' | 'open'; status?: SwapRequestStatus }
): Promise<ActionResult<{ requests: SwapRequestWithRelations[] }>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { requests: [] } }

    const requests = await getSwapRequestsForUser(session.id, organizationId, filter)
    return { success: true, data: { requests } }
  } catch (error) {
    return handleActionError(error, 'getMySwapRequestsAction', 'Error al obtener solicitudes')
  }
}

export async function getSwapDetailAction(
  requestId: string
): Promise<ActionResult<SwapRequestWithRelations>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: false, error: 'Sin organización' }

    const request = await getSwapRequestById(requestId, organizationId)
    if (!request)
      return { success: false, error: 'Solicitud no encontrada' }

    const canView =
      request.requesterId === session.id ||
      request.targetUserId === session.id ||
      request.offers.some((o) => o.offererId === session.id)

    if (!canView && isChief(session)) {
      const areaIds = await getChiefAccessibleAreaIds(session.id)
      if (!areaIds.includes(request.areaId))
        return { success: false, error: 'Sin acceso' }
    } else if (!canView)
      return { success: false, error: 'Sin acceso' }

    return { success: true, data: request }
  } catch (error) {
    return handleActionError(error, 'getSwapDetailAction', 'Error al obtener detalle')
  }
}

export async function getPendingChiefSwapsAction(): Promise<
  ActionResult<{ requests: SwapRequestWithRelations[] }>
> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { requests: [] } }

    if (!isChief(session) && session.role !== 'ADMIN_HR')
      return { success: true, data: { requests: [] } }

    const areaIds = await getChiefAccessibleAreaIds(session.id)
    if (areaIds.length === 0 && session.role !== 'ADMIN_HR')
      return { success: true, data: { requests: [] } }

    const requests = await getSwapRequestsForChief(
      session.role === 'ADMIN_HR' ? [] : areaIds,
      organizationId
    )
    return { success: true, data: { requests } }
  } catch (error) {
    return handleActionError(error, 'getPendingChiefSwapsAction', 'Error al obtener aprobaciones')
  }
}

export async function getAvailableShiftsForSwapAction(
  areaId: string
): Promise<ActionResult<{ shifts: Array<{
  id: string
  startTime: Date
  endTime: Date
  user: { id: string; name: string }
  shiftType: { id: string; name: string; color: string; icon: string | null }
}> }>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { shifts: [] } }

    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const shifts = await prisma.shift.findMany({
      where: {
        organizationId,
        areaId,
        userId: { not: session.id },
        status: 'SCHEDULED',
        startTime: { gte: twentyFourHoursFromNow, lte: thirtyDaysFromNow },
        swapRequestsAsRequester: { none: { status: { in: ['PENDING_PEER', 'PENDING_SELECTION', 'PENDING_CHIEF'] } } },
        swapRequestsAsTarget: { none: { status: { in: ['PENDING_PEER', 'PENDING_SELECTION', 'PENDING_CHIEF'] } } },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        user: { select: { id: true, name: true } },
        shiftType: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    return { success: true, data: { shifts } }
  } catch (error) {
    return handleActionError(error, 'getAvailableShiftsForSwapAction', 'Error al obtener turnos disponibles')
  }
}

export async function getPendingRequestsCountAction(): Promise<
  ActionResult<{ count: number }>
> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { count: 0 } }

    let count = await getPendingSwapCountForUser(session.id, organizationId)

    if (isChief(session) || session.role === 'ADMIN_HR') {
      const areaIds = await getChiefAccessibleAreaIds(session.id)
      if (areaIds.length > 0) {
        const chiefSwapCount = await prisma.shiftSwapRequest.count({
          where: {
            organizationId,
            areaId: { in: areaIds },
            status: 'PENDING_CHIEF',
          },
        })
        const appCount = await getPendingApplicationCountForChief(areaIds, organizationId)
        count += chiefSwapCount + appCount
      }
    }

    return { success: true, data: { count } }
  } catch (error) {
    return handleActionError(error, 'getPendingRequestsCountAction', 'Error al obtener conteo')
  }
}
