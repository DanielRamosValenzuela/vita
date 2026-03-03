'use server'

import { getTranslations } from 'next-intl/server'

import { chiefHasAreaAccess } from '@/src/shared/lib/auth/chief-access'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

import { createNotification } from '@/src/features/notifications/lib/notification-service'

export async function publishExtraShiftAction(
  shiftId: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminHROrChief()
    const tExtra = await getTranslations('extraShifts')

    const organizationId = session.organizationId
    if (!organizationId)
      return { success: false, error: tExtra('errors.noOrganization') }

    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId },
      select: { id: true, areaId: true, status: true, startTime: true, coverageStatus: true },
    })
    if (!shift)
      return { success: false, error: tExtra('errors.shiftNotFound') }

    if (shift.status !== 'SCHEDULED')
      return { success: false, error: tExtra('errors.shiftNotScheduled') }

    if (session.role !== 'ADMIN_HR') {
      const hasAccess = await chiefHasAreaAccess(session.id, shift.areaId)
      if (!hasAccess)
        return { success: false, error: tExtra('errors.noAreaAccess') }
    }

    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    if (shift.startTime < twentyFourHoursFromNow)
      return { success: false, error: tExtra('errors.shiftTooSoon') }

    await prisma.shift.update({
      where: { id: shiftId },
      data: { coverageStatus: 'OPEN_FOR_APPLICATIONS' },
    })

    const areaStaff = await prisma.userArea.findMany({
      where: { areaId: shift.areaId },
      select: { userId: true },
    })

    const tNotif = await getTranslations('notifications')
    await Promise.all(
      areaStaff.map((ua) =>
        createNotification({
          userId: ua.userId,
          actorId: session.id,
          organizationId,
          type: 'EXTRA_SHIFT_AVAILABLE',
          title: tNotif('types.EXTRA_SHIFT_AVAILABLE'),
          description: tNotif('descriptions.EXTRA_SHIFT_AVAILABLE'),
          actionUrl: '/dashboard/requests',
        })
      )
    )

    revalidatePaths('/dashboard/requests', '/dashboard/shifts')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'publishExtraShiftAction', 'Error al publicar turno extra')
  }
}
