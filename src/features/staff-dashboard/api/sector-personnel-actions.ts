'use server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import type {
  PersonnelShift,
  SectorAreaPersonnel,
  SectorPersonnelResult,
} from '../types/staff-dashboard-types'
import { detectRelays } from '../lib/relay-detection'

export async function getSectorPersonnelForShiftAction(params: {
  shiftId: string
}): Promise<ActionResult<SectorPersonnelResult>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: false, error: 'No organization found' }

    const shift = await prisma.shift.findUnique({
      where: { id: params.shiftId },
      include: {
        area: { select: { id: true, name: true, color: true, icon: true } },
        shiftType: { select: { name: true, color: true } },
        rotation: { select: { name: true } },
      },
    })

    if (!shift)
      return { success: false, error: 'NOT_FOUND' }

    if (shift.userId !== session.id || shift.organizationId !== organizationId)
      return { success: false, error: 'FORBIDDEN' }

    const sectorArea = await prisma.sectorArea.findFirst({
      where: { areaId: shift.areaId },
      include: {
        sector: { select: { id: true, name: true, color: true } },
      },
    })

    let areaIds: string[]
    let sectorInfo: { id: string; name: string; color: string } | null = null

    if (sectorArea) {
      sectorInfo = sectorArea.sector
      const sectorAreas = await prisma.sectorArea.findMany({
        where: { sectorId: sectorArea.sectorId },
        select: { areaId: true },
      })
      areaIds = sectorAreas.map((sa) => sa.areaId)
    } else
      areaIds = [shift.areaId]

    const overlappingShifts = await prisma.shift.findMany({
      where: {
        organizationId,
        areaId: { in: areaIds },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        OR: [
          { startTime: { lte: shift.startTime }, endTime: { gt: shift.startTime } },
          { startTime: { lt: shift.endTime }, endTime: { gte: shift.endTime } },
          { startTime: { gte: shift.startTime }, endTime: { lte: shift.endTime } },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        area: { select: { id: true, name: true, icon: true, color: true } },
        shiftType: { select: { name: true, color: true } },
      },
      orderBy: [{ areaId: 'asc' }, { startTime: 'asc' }],
    })

    const areaMap = new Map<string, { area: SectorAreaPersonnel['area']; shifts: PersonnelShift[] }>()

    for (const s of overlappingShifts) {
      if (!areaMap.has(s.areaId))
        areaMap.set(s.areaId, {
          area: {
            id: s.area.id,
            name: s.area.name,
            icon: s.area.icon ?? 'Building2',
            color: s.area.color,
          },
          shifts: [],
        })

      areaMap.get(s.areaId)!.shifts.push({
        id: s.id,
        userId: s.user.id,
        userName: s.user.name,
        shiftTypeName: s.shiftType.name,
        shiftTypeColor: s.shiftType.color,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        isExtra: s.isExtra,
      })
    }

    const areas: SectorAreaPersonnel[] = []
    for (const [, entry] of areaMap)
      areas.push({
        area: entry.area,
        shifts: detectRelays(entry.shifts),
      })

    const uniqueUsers = new Set(overlappingShifts.map((s) => s.user.id))

    return {
      success: true,
      data: {
        shift: {
          id: shift.id,
          startTime: shift.startTime,
          endTime: shift.endTime,
          status: shift.status,
          area: {
            id: shift.area.id,
            name: shift.area.name,
            color: shift.area.color,
            icon: shift.area.icon ?? 'Building2',
          },
          shiftType: shift.shiftType,
          isExtra: shift.isExtra,
          rotation: shift.rotation,
        },
        sector: sectorInfo,
        areas,
        totalStaff: uniqueUsers.size,
      },
    }
  } catch (error) {
    return handleActionError(
      error,
      'getSectorPersonnelForShiftAction',
      'Error al obtener personal del sector'
    )
  }
}
