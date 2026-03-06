'use server'

import { getTranslations } from 'next-intl/server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'
import { createNotification } from '@/src/features/notifications/lib/notification-service'

import {
  createSwapOffer,
  getSwapRequestById,
  updateOfferStatus,
  updateSwapStatus,
  validateSameArea,
  validateSwapEligibility,
} from '@/src/entities/swap'

export async function createSwapOfferAction(
  swapRequestId: string,
  offeredShiftId: string,
  note?: string
): Promise<ActionResult> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)

    if (!organizationId) return { success: false, error: tSwap('errors.noOrganization') }

    const request = await getSwapRequestById(swapRequestId, organizationId)
    if (!request) return { success: false, error: tSwap('errors.requestNotFound') }

    if (request.type !== 'OPEN' || request.status !== 'PENDING_PEER')
      return { success: false, error: tSwap('errors.invalidStatus') }

    if (request.requesterId === session.id)
      return { success: false, error: tSwap('errors.cannotOfferOwnRequest') }

    const offeredShift = await prisma.shift.findFirst({
      where: { id: offeredShiftId, userId: session.id, organizationId },
    })
    if (!offeredShift) return { success: false, error: tSwap('errors.shiftNotFound') }

    const eligibility = await validateSwapEligibility(offeredShiftId, organizationId)
    if (!eligibility.valid) return { success: false, error: tSwap(`errors.${eligibility.error}`) }

    const sameArea = await validateSameArea(request.requesterShiftId, offeredShiftId)
    if (!sameArea.valid) return { success: false, error: tSwap('errors.different_area') }

    await createSwapOffer({
      swapRequestId,
      offererId: session.id,
      offeredShiftId,
      note,
    })

    if (request.status === 'PENDING_PEER')
      await updateSwapStatus(swapRequestId, organizationId, {
        status: 'PENDING_SELECTION',
      })

    const tNotif = await getTranslations('notifications')
    await createNotification({
      userId: request.requesterId,
      actorId: session.id,
      organizationId,
      type: 'SWAP_OFFER_RECEIVED',
      title: tNotif('types.SWAP_OFFER_RECEIVED'),
      description: tNotif('descriptions.SWAP_OFFER_RECEIVED', { name: session.name }),
      actionUrl: '/dashboard/requests',
    })

    revalidatePaths('/dashboard/requests')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'createSwapOfferAction', 'Error al crear oferta')
  }
}

export async function withdrawSwapOfferAction(offerId: string): Promise<ActionResult> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const offer = await prisma.shiftSwapOffer.findUnique({
      where: { id: offerId },
      include: { swapRequest: { select: { organizationId: true } } },
    })
    if (!offer) return { success: false, error: tSwap('errors.offerNotFound') }

    if (offer.offererId !== session.id)
      return { success: false, error: tSwap('errors.unauthorized') }

    if (offer.status !== 'PENDING') return { success: false, error: tSwap('errors.invalidStatus') }

    await updateOfferStatus(offerId, 'WITHDRAWN')

    revalidatePaths('/dashboard/requests')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'withdrawSwapOfferAction', 'Error al retirar oferta')
  }
}

export async function selectSwapOfferAction(offerId: string): Promise<ActionResult> {
  try {
    const session = await requireDashboardUser()
    const tSwap = await getTranslations('swap')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)

    if (!organizationId) return { success: false, error: tSwap('errors.noOrganization') }

    const offer = await prisma.shiftSwapOffer.findUnique({
      where: { id: offerId },
      include: {
        swapRequest: true,
        offeredShift: { select: { userId: true } },
      },
    })
    if (!offer) return { success: false, error: tSwap('errors.offerNotFound') }

    if (offer.swapRequest.requesterId !== session.id)
      return { success: false, error: tSwap('errors.unauthorized') }

    if (offer.status !== 'PENDING') return { success: false, error: tSwap('errors.invalidStatus') }

    if (
      offer.swapRequest.status !== 'PENDING_PEER' &&
      offer.swapRequest.status !== 'PENDING_SELECTION'
    )
      return { success: false, error: tSwap('errors.invalidStatus') }

    await prisma.$transaction(async (tx) => {
      await tx.shiftSwapOffer.updateMany({
        where: {
          swapRequestId: offer.swapRequestId,
          id: { not: offerId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      })

      await tx.shiftSwapOffer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      })

      await tx.shiftSwapRequest.update({
        where: { id: offer.swapRequestId },
        data: {
          status: 'PENDING_CHIEF',
          targetUserId: offer.offererId,
          targetShiftId: offer.offeredShiftId,
          peerRespondedAt: new Date(),
        },
      })
    })

    const tNotif = await getTranslations('notifications')
    await createNotification({
      userId: offer.offererId,
      actorId: session.id,
      organizationId,
      type: 'SWAP_PEER_ACCEPTED',
      title: tNotif('types.SWAP_PEER_ACCEPTED'),
      description: tNotif('descriptions.SWAP_OFFER_SELECTED'),
      actionUrl: '/dashboard/requests',
    })

    revalidatePaths('/dashboard/requests')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'selectSwapOfferAction', 'Error al seleccionar oferta')
  }
}
