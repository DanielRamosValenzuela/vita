'use server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import {
  createFeedToken,
  getUserFeedTokens,
  revokeFeedToken,
} from '@/src/entities/calendar-feed'

import { generateICalContent } from '../lib/ical-generator'
import { buildFeedUrl, generateFeedToken } from '../lib/feed-token'

interface GenerateIcsParams {
  month: number
  year: number
}

export async function generateIcsFileAction(
  params: GenerateIcsParams
): Promise<ActionResult<{ icsContent: string; filename: string }>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { icsContent: '', filename: '' } }

    const startDate = new Date(params.year, params.month, 1)
    const endDate = new Date(params.year, params.month + 1, 1)

    const shifts = await prisma.shift.findMany({
      where: {
        userId: session.id,
        organizationId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: { gte: startDate, lt: endDate },
      },
      include: {
        area: { select: { name: true } },
        shiftType: { select: { name: true } },
        rotation: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    const icsContent = generateICalContent(
      shifts.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        areaName: s.area.name,
        shiftTypeName: s.shiftType.name,
        rotationName: s.rotation?.name,
        isExtra: s.isExtra,
      }))
    )

    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ]
    const filename = `turnos-${monthNames[params.month]}-${params.year}.ics`

    return { success: true, data: { icsContent, filename } }
  } catch (error) {
    return handleActionError(error, 'generateIcsFileAction', 'Error al generar archivo iCal')
  }
}

export async function getMyFeedTokensAction(): Promise<
  ActionResult<{
    tokens: {
      id: string
      organizationId: string | null
      organizationName: string | null
      feedUrl: string
      isActive: boolean
      createdAt: Date
    }[]
  }>
> {
  try {
    const session = await requireDashboardUser()
    const tokens = await getUserFeedTokens(session.id)

    return {
      success: true,
      data: {
        tokens: tokens.map((t) => ({
          id: t.id,
          organizationId: t.organizationId,
          organizationName: t.organization?.name ?? null,
          feedUrl: buildFeedUrl(t.token),
          isActive: t.isActive,
          createdAt: t.createdAt,
        })),
      },
    }
  } catch (error) {
    return handleActionError(error, 'getMyFeedTokensAction', 'Error al obtener feeds')
  }
}

export async function createFeedTokenAction(params: {
  type: 'per-org' | 'unified'
}): Promise<ActionResult<{ feedUrl: string }>> {
  try {
    const session = await requireDashboardUser()

    let organizationId: string | null = null
    if (params.type === 'per-org') {
      organizationId = isChief(session)
        ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
        : session.organizationId ?? null

      if (!organizationId)
        return { success: false, error: 'No organization found' }
    }

    const token = generateFeedToken()
    await createFeedToken(session.id, organizationId, token)

    return { success: true, data: { feedUrl: buildFeedUrl(token) } }
  } catch (error) {
    return handleActionError(error, 'createFeedTokenAction', 'Error al crear feed')
  }
}

export async function revokeFeedTokenAction(params: {
  tokenId: string
}): Promise<ActionResult<void>> {
  try {
    const session = await requireDashboardUser()
    await revokeFeedToken(params.tokenId, session.id)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, 'revokeFeedTokenAction', 'Error al revocar feed')
  }
}
