'use server'

import { requireDashboardUser, isChiefArea, isStaffHealth } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'

interface SectorStaffInput {
  sectorId: string
  date: string
  startTime: string
  endTime: string
}

interface StaffShift {
  id: string
  userId: string
  userName: string
  shiftTypeName: string
  shiftTypeColor: string
  startTime: Date
  endTime: Date
  isExtra: boolean
  status: string
}

interface AreaStaffGroup {
  area: { id: string; name: string; icon: string | null; color: string }
  shifts: StaffShift[]
}

export interface SectorStaffResult {
  sector: { id: string; name: string; color: string }
  areas: AreaStaffGroup[]
  totalStaff: number
}

export async function getSectorStaffAction(input: SectorStaffInput) {
  try {
    const user = await requireDashboardUser()
    let orgId: string | null = user.organizationId ?? null

    if ((isChiefArea(user) || isStaffHealth(user)) && !orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: user.id },
        select: { area: { select: { organizationId: true } } },
      })
      orgId = firstArea?.area?.organizationId ?? null
    }

    if (!orgId) 
      return { success: false as const, error: 'No tienes una organización asignada' }
    

    const sector = await prisma.sector.findFirst({
      where: { id: input.sectorId, organizationId: orgId },
      include: {
        sectorAreas: {
          include: {
            area: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        },
      },
    })

    if (!sector) 
      return { success: false as const, error: 'Sector no encontrado' }
    

    if (isChiefArea(user) || isStaffHealth(user)) {
      const userAreas = await prisma.userArea.findMany({
        where: { userId: user.id },
        select: { areaId: true },
      })
      const userAreaIds = new Set(userAreas.map((ua) => ua.areaId))
      const hasSectorAccess = sector.sectorAreas.some((sa) => userAreaIds.has(sa.area.id))
      if (!hasSectorAccess)
        return { success: false as const, error: 'No tienes acceso a este sector' }
    }

    const sectorAreaIds = sector.sectorAreas.map((sa) => sa.area.id)

    const queryStart = new Date(`${input.date}T${input.startTime}:00`)
    const queryEnd = new Date(`${input.date}T${input.endTime}:00`)

    const shifts = await prisma.shift.findMany({
      where: {
        areaId: { in: sectorAreaIds },
        organizationId: orgId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        OR: [
          { startTime: { lte: queryStart }, endTime: { gt: queryStart } },
          { startTime: { lt: queryEnd }, endTime: { gte: queryEnd } },
          { startTime: { gte: queryStart }, endTime: { lte: queryEnd } },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        area: { select: { id: true, name: true, icon: true, color: true } },
        shiftType: { select: { name: true, color: true } },
      },
      orderBy: [{ area: { name: 'asc' } }, { startTime: 'asc' }],
    })

    const areaMap = new Map<string, AreaStaffGroup>()
    for (const sa of sector.sectorAreas) 
      areaMap.set(sa.area.id, { area: sa.area, shifts: [] })
    

    for (const shift of shifts) {
      const group = areaMap.get(shift.areaId)
      if (group) 
        group.shifts.push({
          id: shift.id,
          userId: shift.user.id,
          userName: shift.user.name,
          shiftTypeName: shift.shiftType?.name ?? '',
          shiftTypeColor: shift.shiftType?.color ?? '#6b7280',
          startTime: shift.startTime,
          endTime: shift.endTime,
          isExtra: shift.isExtra,
          status: shift.status,
        })
      
    }

    const areas = [...areaMap.values()].filter((g) => g.shifts.length > 0)
    const totalStaff = new Set(shifts.map((s) => s.userId)).size

    const result: SectorStaffResult = {
      sector: { id: sector.id, name: sector.name, color: sector.color },
      areas,
      totalStaff,
    }

    return { success: true as const, data: result }
  } catch (error) {
    return handleActionError(
      error,
      'getSectorStaffAction',
      'Error al consultar personal del sector'
    )
  }
}
