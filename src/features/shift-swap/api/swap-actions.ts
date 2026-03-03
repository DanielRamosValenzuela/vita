'use server'

import { getTranslations } from 'next-intl/server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

import {
  createSwapRequest,
  getSwapRequestById,
  updateSwapStatus,
  validateSwapEligibility,
  validateSameArea,
  type SwapRequestWithRelations,
} from '@/src/entities/swap'

import { createNotification } from '@/src/features/notifications/lib/notification-service'

export async function createDirectSwapAction(
  requesterShiftId: string,
  targetShiftId: string,
  reason?: string
): Promise<ActionResult<SwapRequestWithRelations>> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: false, error: tSwap('errors.noOrganization') }

    const requesterShift = await prisma.shift.findFirst({
      where: { id: requesterShiftId, userId: session.id, organizationId },
      select: { id: true, areaId: true, userId: true },
    })
    if (!requesterShift)
      return { success: false, error: tSwap('errors.shiftNotFound') }

    const eligibility = await validateSwapEligibility(requesterShiftId, organizationId)
    if (!eligibility.valid)
      return { success: false, error: tSwap(`errors.${eligibility.error}`) }

    const targetEligibility = await validateSwapEligibility(targetShiftId, organizationId)
    if (!targetEligibility.valid)
      return { success: false, error: tSwap(`errors.${targetEligibility.error}`) }

    const sameArea = await validateSameArea(requesterShiftId, targetShiftId)
    if (!sameArea.valid)
      return { success: false, error: tSwap('errors.different_area') }

    const targetShift = await prisma.shift.findFirst({
      where: { id: targetShiftId, organizationId },
      select: { userId: true },
    })
    if (!targetShift)
      return { success: false, error: tSwap('errors.shiftNotFound') }

    if (targetShift.userId === session.id)
      return { success: false, error: tSwap('errors.cannotSwapOwn') }

    const request = await createSwapRequest({
      organizationId,
      type: 'DIRECT',
      status: 'PENDING_PEER',
      requesterId: session.id,
      requesterShiftId,
      targetUserId: targetShift.userId,
      targetShiftId,
      areaId: requesterShift.areaId,
      reason,
    })

    const tNotif = await getTranslations('notifications')
    await createNotification({
      userId: targetShift.userId,
      actorId: session.id,
      organizationId,
      type: 'SWAP_REQUESTED',
      title: tNotif('types.SWAP_REQUESTED'),
      description: tNotif('descriptions.SWAP_REQUESTED', { name: session.name }),
      actionUrl: '/dashboard/requests',
    })

    revalidatePaths('/dashboard/requests')
    return { success: true, data: request }
  } catch (error) {
    return handleActionError(error, 'createDirectSwapAction', 'Error al crear solicitud de intercambio')
  }
}

export async function respondToSwapAction(
  requestId: string,
  accept: boolean
): Promise<ActionResult<SwapRequestWithRelations>> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: false, error: tSwap('errors.noOrganization') }

    const request = await getSwapRequestById(requestId, organizationId)
    if (!request)
      return { success: false, error: tSwap('errors.requestNotFound') }

    if (request.targetUserId !== session.id)
      return { success: false, error: tSwap('errors.unauthorized') }

    if (request.status !== 'PENDING_PEER')
      return { success: false, error: tSwap('errors.invalidStatus') }

    const tNotif = await getTranslations('notifications')

    if (accept) {
      const updated = await updateSwapStatus(requestId, organizationId, {
        status: 'PENDING_CHIEF',
        peerRespondedAt: new Date(),
      })

      await createNotification({
        userId: request.requesterId,
        actorId: session.id,
        organizationId,
        type: 'SWAP_PEER_ACCEPTED',
        title: tNotif('types.SWAP_PEER_ACCEPTED'),
        description: tNotif('descriptions.SWAP_PEER_ACCEPTED', { name: session.name }),
        actionUrl: '/dashboard/requests',
      })

      revalidatePaths('/dashboard/requests')
      return { success: true, data: updated }
    }

    const updated = await updateSwapStatus(requestId, organizationId, {
      status: 'REJECTED_BY_PEER',
      peerRespondedAt: new Date(),
    })

    await createNotification({
      userId: request.requesterId,
      actorId: session.id,
      organizationId,
      type: 'SWAP_REJECTED',
      title: tNotif('types.SWAP_REJECTED'),
      description: tNotif('descriptions.SWAP_REJECTED_BY_PEER', { name: session.name }),
      actionUrl: '/dashboard/requests',
    })

    revalidatePaths('/dashboard/requests')
    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(error, 'respondToSwapAction', 'Error al responder solicitud')
  }
}

export async function cancelSwapAction(
  requestId: string
): Promise<ActionResult<SwapRequestWithRelations>> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: false, error: tSwap('errors.noOrganization') }

    const request = await getSwapRequestById(requestId, organizationId)
    if (!request)
      return { success: false, error: tSwap('errors.requestNotFound') }

    if (request.requesterId !== session.id)
      return { success: false, error: tSwap('errors.unauthorized') }

    if (request.status === 'APPROVED' || request.status === 'CANCELLED')
      return { success: false, error: tSwap('errors.invalidStatus') }

    const updated = await updateSwapStatus(requestId, organizationId, {
      status: 'CANCELLED',
    })

    if (request.targetUserId) {
      const tNotif = await getTranslations('notifications')
      await createNotification({
        userId: request.targetUserId,
        actorId: session.id,
        organizationId,
        type: 'SWAP_REJECTED',
        title: tNotif('types.SWAP_REJECTED'),
        description: tNotif('descriptions.SWAP_CANCELLED'),
        actionUrl: '/dashboard/requests',
      })
    }

    revalidatePaths('/dashboard/requests')
    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(error, 'cancelSwapAction', 'Error al cancelar solicitud')
  }
}

export async function createOpenSwapAction(
  requesterShiftId: string,
  reason?: string,
  expiresInDays: number = 7
): Promise<ActionResult<SwapRequestWithRelations>> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: false, error: tSwap('errors.noOrganization') }

    const requesterShift = await prisma.shift.findFirst({
      where: { id: requesterShiftId, userId: session.id, organizationId },
      select: { id: true, areaId: true },
    })
    if (!requesterShift)
      return { success: false, error: tSwap('errors.shiftNotFound') }

    const eligibility = await validateSwapEligibility(requesterShiftId, organizationId)
    if (!eligibility.valid)
      return { success: false, error: tSwap(`errors.${eligibility.error}`) }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const request = await createSwapRequest({
      organizationId,
      type: 'OPEN',
      status: 'PENDING_PEER',
      requesterId: session.id,
      requesterShiftId,
      areaId: requesterShift.areaId,
      reason,
      expiresAt,
    })

    const areaStaff = await prisma.userArea.findMany({
      where: { areaId: requesterShift.areaId, userId: { not: session.id } },
      select: { userId: true },
    })

    const tNotif = await getTranslations('notifications')
    await Promise.all(
      areaStaff.map((ua) =>
        createNotification({
          userId: ua.userId,
          actorId: session.id,
          organizationId,
          type: 'SWAP_OPEN_PUBLISHED',
          title: tNotif('types.SWAP_OPEN_PUBLISHED'),
          description: tNotif('descriptions.SWAP_OPEN_PUBLISHED', { name: session.name }),
          actionUrl: '/dashboard/requests',
        })
      )
    )

    revalidatePaths('/dashboard/requests')
    return { success: true, data: request }
  } catch (error) {
    return handleActionError(error, 'createOpenSwapAction', 'Error al publicar turno para intercambio')
  }
}
