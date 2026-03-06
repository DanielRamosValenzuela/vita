'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { createNotification } from '@/src/features/notifications/lib/notification-service'

import {
  calculateTier,
  type CandidateShiftHistory,
  type ShiftClassificationType,
} from '@/src/entities/rotation'

import { assignExtraShiftSchema, getExtraCandidatesSchema } from '../lib/rotation-schemas'
import type { ExtraCandidate, GetExtraCandidatesResult } from '../types/rotation-types'

const TIER_ORDER: Record<string, number> = {
  TIER_1: 0,
  TIER_2: 1,
  TIER_3: 2,
  NEVER_RECOMMEND: 3,
}

function classifyShiftName(name: string): ShiftClassificationType {
  const lower = name.toLowerCase()
  if (lower.includes('noche')) return 'NIGHT'
  if (lower.includes('largo')) return 'DAY'
  return 'MIXED'
}

export const getExtraCandidatesAction = async (
  data: z.infer<typeof getExtraCandidatesSchema>
): Promise<ActionResult<GetExtraCandidatesResult>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = getExtraCandidatesSchema.parse(data)

    const shiftType = await prisma.shiftType.findFirst({
      where: { id: validatedData.shiftTypeId, organizationId },
      select: { id: true, name: true, durationMinutes: true, minStaffRequired: true },
    })
    if (!shiftType) return { success: false, error: 'Tipo de turno no encontrado' }

    let currentStaffCount = 0
    let excludedUserIds: string[] = []

    if (validatedData.rotationGroupId) {
      const group = await prisma.rotationGroup.findFirst({
        where: { id: validatedData.rotationGroupId, rotation: { organizationId } },
        select: {
          members: {
            where: { leftAt: null },
            select: { userId: true },
          },
        },
      })
      if (group) {
        currentStaffCount = group.members.length
        excludedUserIds = group.members.map((m) => m.userId)
      }
    }

    const understaffingGap = Math.max(0, shiftType.minStaffRequired - currentStaffCount)

    const staffUsers = await prisma.user.findMany({
      where: {
        organizationId,
        role: 'STAFF',
        id: { notIn: excludedUserIds },
        userAreas: {
          some: { areaId: validatedData.areaId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        userAreas: {
          select: {
            area: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    const now = new Date()
    const lookback48h = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    const candidates: ExtraCandidate[] = []

    for (const user of staffUsers) {
      const recentShifts = await prisma.shift.findMany({
        where: {
          userId: user.id,
          startTime: { gte: lookback48h },
        },
        orderBy: { startTime: 'asc' },
        select: {
          startTime: true,
          endTime: true,
          shiftType: {
            select: { name: true },
          },
        },
      })

      const activeShift = recentShifts.find((s) => s.startTime <= now && s.endTime > now)
      const previousShift = recentShifts
        .filter((s) => s.endTime <= now)
        .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0]

      let currentStatus: ExtraCandidate['currentStatus'] = 'other'

      if (activeShift) {
        const classification = classifyShiftName(activeShift.shiftType.name)
        if (classification === 'DAY') currentStatus = 'on_largo'
        else if (classification === 'NIGHT') currentStatus = 'on_noche'
        else currentStatus = 'other'
      } else if (previousShift) {
        const classification = classifyShiftName(previousShift.shiftType.name)
        if (classification === 'NIGHT') currentStatus = 'libre_from_noche'
        else currentStatus = 'libre_rested'
      } else currentStatus = 'libre_rested'

      const history: CandidateShiftHistory = {}

      if (activeShift)
        history.currentShift = {
          classification: classifyShiftName(activeShift.shiftType.name),
          startTime: activeShift.startTime,
          endTime: activeShift.endTime,
        }

      if (previousShift)
        history.previousShift = {
          classification: classifyShiftName(previousShift.shiftType.name),
          endTime: previousShift.endTime,
        }

      const requestedClassification = classifyShiftName(shiftType.name)
      const tierResult = calculateTier(history, requestedClassification, 24, 8)

      const userAreas = user.userAreas.map((ua) => ({
        id: ua.area.id,
        name: ua.area.name,
      }))

      const candidate: ExtraCandidate = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        tier: tierResult.tier,
        tierLabel: tierResult.label,
        isFromSameArea: userAreas.some((a) => a.id === validatedData.areaId),
        currentStatus,
        warnings: tierResult.warnings,
        areas: userAreas,
      }

      if (activeShift)
        candidate.currentShift = {
          shiftTypeName: activeShift.shiftType.name,
          startTime: activeShift.startTime,
          endTime: activeShift.endTime,
        }

      if (previousShift)
        candidate.previousShift = {
          shiftTypeName: previousShift.shiftType.name,
          endTime: previousShift.endTime,
        }

      candidates.push(candidate)
    }

    candidates.sort((a, b) => (TIER_ORDER[a.tier] ?? 3) - (TIER_ORDER[b.tier] ?? 3))

    return {
      success: true,
      data: {
        candidates,
        totalAvailable: candidates.length,
        understaffingGap,
        shiftType: {
          id: shiftType.id,
          name: shiftType.name,
          minStaffRequired: shiftType.minStaffRequired,
          currentStaffCount,
        },
      },
    }
  } catch (error) {
    console.error('[getExtraCandidatesAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener candidatos extra',
    }
  }
}

export const assignExtraShiftAction = async (
  data: z.infer<typeof assignExtraShiftSchema>
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = assignExtraShiftSchema.parse(data)

    const user = await prisma.user.findFirst({
      where: { id: validatedData.userId, organizationId, role: 'STAFF' },
      select: { id: true },
    })
    if (!user)
      return { success: false, error: 'Usuario no encontrado o no pertenece a esta organización' }

    const shiftType = await prisma.shiftType.findFirst({
      where: { id: validatedData.shiftTypeId, organizationId },
      select: { id: true },
    })
    if (!shiftType)
      return {
        success: false,
        error: 'Tipo de turno no encontrado o no pertenece a esta organización',
      }

    const contract = await prisma.contract.findFirst({
      where: {
        userId: validatedData.userId,
        organizationId,
        isActive: true,
        OR: [{ areaId: validatedData.areaId }, { areaId: null }],
      },
      orderBy: [{ areaId: 'desc' }, { startDate: 'desc' }],
      select: { id: true },
    })

    await prisma.shift.create({
      data: {
        userId: validatedData.userId,
        areaId: validatedData.areaId,
        shiftTypeId: validatedData.shiftTypeId,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        organizationId,
        contractId: contract?.id ?? null,
        status: 'SCHEDULED',
        notes: validatedData.notes ?? null,
        rotationId: validatedData.rotationId ?? null,
        isExtra: true,
      },
    })

    await createNotification({
      type: 'EXTRA_SHIFT_ASSIGNED',
      userId: validatedData.userId,
      actorId: session.id,
      organizationId,
      title: 'Se te ha asignado un turno extra',
      actionUrl: '/dashboard/shifts',
    })

    revalidatePath('/dashboard/shifts')
    revalidatePath('/dashboard/rotations')
    revalidatePath('/dashboard/calendar')

    return { success: true, data: null, message: 'Turno extra asignado exitosamente' }
  } catch (error) {
    console.error('[assignExtraShiftAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al asignar turno extra',
    }
  }
}
