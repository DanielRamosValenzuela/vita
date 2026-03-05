'use server'

import { getTranslations } from 'next-intl/server'

import { chiefHasAreaAccess } from '@/src/shared/lib/auth/chief-access'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

import {
  getSwapRequestById,
  updateSwapStatus,
  type SwapRequestWithRelations,
} from '@/src/entities/swap'

import { createNotification } from '@/src/features/notifications/lib/notification-service'

import { executeSwap } from '../lib/swap-execution'

export async function reviewSwapAction(
  requestId: string,
  approve: boolean,
  note?: string
): Promise<ActionResult<SwapRequestWithRelations>> {
  try {
    const session = await requireAdminHROrChief()
    const tSwap = await getTranslations('swap')

    const organizationId = session.organizationId
    if (!organizationId)
      return { success: false, error: tSwap('errors.noOrganization') }

    const request = await getSwapRequestById(requestId, organizationId)
    if (!request)
      return { success: false, error: tSwap('errors.requestNotFound') }

    if (request.status !== 'PENDING_CHIEF')
      return { success: false, error: tSwap('errors.invalidStatus') }

    const hasAccess = await chiefHasAreaAccess(session.id, request.areaId)
    if (!hasAccess && session.role !== 'ADMIN_HR')
      return { success: false, error: tSwap('errors.unauthorized') }

    if (!request.targetShiftId || !request.targetUserId)
      return { success: false, error: tSwap('errors.incompleteSwap') }

    const tNotif = await getTranslations('notifications')

    if (approve) {
      await executeSwap(request.requesterShiftId, request.targetShiftId)

      const updated = await updateSwapStatus(requestId, organizationId, {
        status: 'APPROVED',
        chiefId: session.id,
        chiefNote: note,
        chiefRespondedAt: new Date(),
      })

      await Promise.all([
        createNotification({
          userId: request.requesterId,
          actorId: session.id,
          organizationId,
          type: 'SWAP_APPROVED',
          title: tNotif('types.SWAP_APPROVED'),
          description: tNotif('descriptions.SWAP_APPROVED'),
          actionUrl: '/dashboard/requests',
        }),
        createNotification({
          userId: request.targetUserId,
          actorId: session.id,
          organizationId,
          type: 'SWAP_APPROVED',
          title: tNotif('types.SWAP_APPROVED'),
          description: tNotif('descriptions.SWAP_APPROVED'),
          actionUrl: '/dashboard/requests',
        }),
      ])

      revalidatePaths('/dashboard/requests', '/dashboard/shifts', '/dashboard')
      return { success: true, data: updated }
    }

    const updated = await updateSwapStatus(requestId, organizationId, {
      status: 'REJECTED_BY_CHIEF',
      chiefId: session.id,
      chiefNote: note,
      chiefRespondedAt: new Date(),
    })

    await Promise.all([
      createNotification({
        userId: request.requesterId,
        actorId: session.id,
        organizationId,
        type: 'SWAP_REJECTED',
        title: tNotif('types.SWAP_REJECTED'),
        description: tNotif('descriptions.SWAP_REJECTED_BY_CHIEF', { note: note ?? '' }),
        actionUrl: '/dashboard/requests',
      }),
      createNotification({
        userId: request.targetUserId,
        actorId: session.id,
        organizationId,
        type: 'SWAP_REJECTED',
        title: tNotif('types.SWAP_REJECTED'),
        description: tNotif('descriptions.SWAP_REJECTED_BY_CHIEF', { note: note ?? '' }),
        actionUrl: '/dashboard/requests',
      }),
    ])

    revalidatePaths('/dashboard/requests')
    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(error, 'reviewSwapAction', 'Error al revisar solicitud')
  }
}
