'use server'

import { getTranslations } from 'next-intl/server'

import {
  getChiefAccessibleAreaIds,
  resolveChiefOrganizationId,
} from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief, requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'
import { createNotification } from '@/src/features/notifications/lib/notification-service'

import { createApplication, updateApplicationStatus } from '@/src/entities/shift-application'
import { validateNoShiftConflict } from '@/src/entities/swap'

export async function applyToExtraShiftAction(
  shiftId: string,
  note?: string
): Promise<ActionResult> {
  try {
    const session = await requireDashboardUser()
    const tExtra = await getTranslations('extraShifts')

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)

    if (!organizationId) return { success: false, error: tExtra('errors.noOrganization') }

    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, organizationId, coverageStatus: 'OPEN_FOR_APPLICATIONS' },
      select: { id: true, areaId: true, startTime: true, endTime: true },
    })
    if (!shift) return { success: false, error: tExtra('errors.shiftNotAvailable') }

    const userArea = await prisma.userArea.findUnique({
      where: { userId_areaId: { userId: session.id, areaId: shift.areaId } },
    })
    if (!userArea) return { success: false, error: tExtra('errors.notInArea') }

    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    if (shift.startTime < twentyFourHoursFromNow)
      return { success: false, error: tExtra('errors.shiftTooSoon') }

    const conflict = await validateNoShiftConflict(session.id, shift.startTime, shift.endTime)
    if (!conflict.valid) return { success: false, error: tExtra('errors.scheduleConflict') }

    const existing = await prisma.shiftApplication.findUnique({
      where: { shiftId_userId: { shiftId, userId: session.id } },
    })
    if (existing) return { success: false, error: tExtra('errors.alreadyApplied') }

    await createApplication({
      shiftId,
      userId: session.id,
      organizationId,
      note,
    })

    const chiefIds = await prisma.userArea.findMany({
      where: {
        areaId: shift.areaId,
        user: { role: { in: ['CHIEF_AREA', 'CHIEF_SECTOR'] } },
      },
      select: { userId: true },
    })

    const tNotif = await getTranslations('notifications')
    await Promise.all(
      chiefIds.map((c) =>
        createNotification({
          userId: c.userId,
          actorId: session.id,
          organizationId,
          type: 'EXTRA_SHIFT_APPLIED',
          title: tNotif('types.EXTRA_SHIFT_APPLIED'),
          description: tNotif('descriptions.EXTRA_SHIFT_APPLIED', { name: session.name }),
          actionUrl: '/dashboard/requests',
        })
      )
    )

    revalidatePaths('/dashboard/requests')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'applyToExtraShiftAction', 'Error al postularse')
  }
}

export async function withdrawApplicationAction(applicationId: string): Promise<ActionResult> {
  try {
    const session = await requireDashboardUser()
    const tExtra = await getTranslations('extraShifts')

    const app = await prisma.shiftApplication.findUnique({
      where: { id: applicationId },
    })
    if (!app) return { success: false, error: tExtra('errors.applicationNotFound') }

    if (app.userId !== session.id) return { success: false, error: tExtra('errors.unauthorized') }

    if (app.status !== 'PENDING') return { success: false, error: tExtra('errors.invalidStatus') }

    await updateApplicationStatus(applicationId, app.organizationId, 'WITHDRAWN')

    revalidatePaths('/dashboard/requests')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'withdrawApplicationAction', 'Error al retirar postulación')
  }
}

export async function approveApplicationAction(applicationId: string): Promise<ActionResult> {
  try {
    const session = await requireAdminHROrChief()
    const tExtra = await getTranslations('extraShifts')

    const organizationId = session.organizationId
    if (!organizationId) return { success: false, error: tExtra('errors.noOrganization') }

    const app = await prisma.shiftApplication.findUnique({
      where: { id: applicationId },
      include: { shift: { select: { id: true, areaId: true } } },
    })
    if (!app) return { success: false, error: tExtra('errors.applicationNotFound') }

    if (app.organizationId !== organizationId)
      return { success: false, error: tExtra('errors.unauthorized') }

    if (session.role !== 'ADMIN_HR') {
      const hasAccess = await prisma.userArea.findUnique({
        where: { userId_areaId: { userId: session.id, areaId: app.shift.areaId } },
      })
      if (!hasAccess) return { success: false, error: tExtra('errors.noAreaAccess') }
    }

    if (app.status !== 'PENDING') return { success: false, error: tExtra('errors.invalidStatus') }

    await prisma.$transaction(async (tx) => {
      await tx.shift.update({
        where: { id: app.shiftId },
        data: { userId: app.userId, coverageStatus: 'ASSIGNED' },
      })

      await tx.shiftApplication.update({
        where: { id: applicationId },
        data: { status: 'APPROVED', respondedBy: session.id },
      })

      await tx.shiftApplication.updateMany({
        where: {
          shiftId: app.shiftId,
          id: { not: applicationId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED', respondedBy: session.id },
      })
    })

    const tNotif = await getTranslations('notifications')
    await createNotification({
      userId: app.userId,
      actorId: session.id,
      organizationId,
      type: 'EXTRA_SHIFT_APPROVED',
      title: tNotif('types.EXTRA_SHIFT_APPROVED'),
      description: tNotif('descriptions.EXTRA_SHIFT_APPROVED'),
      actionUrl: '/dashboard/requests',
    })

    revalidatePaths('/dashboard/requests', '/dashboard/shifts', '/dashboard')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'approveApplicationAction', 'Error al aprobar postulación')
  }
}

export async function rejectApplicationAction(applicationId: string): Promise<ActionResult> {
  try {
    const session = await requireAdminHROrChief()
    const tExtra = await getTranslations('extraShifts')

    const organizationId = session.organizationId
    if (!organizationId) return { success: false, error: tExtra('errors.noOrganization') }

    const app = await prisma.shiftApplication.findUnique({
      where: { id: applicationId },
      include: { shift: { select: { areaId: true } } },
    })
    if (!app) return { success: false, error: tExtra('errors.applicationNotFound') }

    if (app.organizationId !== organizationId)
      return { success: false, error: tExtra('errors.unauthorized') }

    if (session.role !== 'ADMIN_HR') {
      const areaIds = await getChiefAccessibleAreaIds(session.id)
      if (!areaIds.includes(app.shift.areaId))
        return { success: false, error: tExtra('errors.noAreaAccess') }
    }

    await updateApplicationStatus(applicationId, organizationId, 'REJECTED', session.id)

    revalidatePaths('/dashboard/requests')
    return { success: true }
  } catch (error) {
    return handleActionError(error, 'rejectApplicationAction', 'Error al rechazar postulación')
  }
}
