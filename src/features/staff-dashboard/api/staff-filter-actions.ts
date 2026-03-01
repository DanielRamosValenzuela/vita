'use server'

import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireDashboardUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

export interface AreaFilterOption {
  id: string
  name: string
  color: string
}

export interface SectorFilterOption {
  id: string
  name: string
  color: string
  areaIds: string[]
}

export interface FilterOptions {
  areas: AreaFilterOption[]
  sectors: SectorFilterOption[]
}

export async function getMyAreasAndSectorsAction(): Promise<ActionResult<FilterOptions>> {
  try {
    const session = await requireDashboardUser()

    const organizationId = isChief(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : session.organizationId ?? null

    if (!organizationId)
      return { success: true, data: { areas: [], sectors: [] } }

    const [userAreas, userSectors] = await Promise.all([
      prisma.userArea.findMany({
        where: { userId: session.id },
        include: {
          area: {
            select: { id: true, name: true, color: true, organizationId: true },
          },
        },
      }),
      prisma.userSector.findMany({
        where: { userId: session.id },
        include: {
          sector: {
            select: {
              id: true,
              name: true,
              color: true,
              organizationId: true,
              sectorAreas: { select: { areaId: true } },
            },
          },
        },
      }),
    ])

    const sectors: SectorFilterOption[] = userSectors
      .filter((us) => us.sector.organizationId === organizationId)
      .map((us) => ({
        id: us.sector.id,
        name: us.sector.name,
        color: us.sector.color,
        areaIds: us.sector.sectorAreas.map((sa) => sa.areaId),
      }))

    const directAreaMap = new Map<string, AreaFilterOption>()
    for (const ua of userAreas)
      if (ua.area.organizationId === organizationId)
        directAreaMap.set(ua.area.id, { id: ua.area.id, name: ua.area.name, color: ua.area.color })

    const sectorAreaIds = new Set(sectors.flatMap((s) => s.areaIds))
    if (sectorAreaIds.size > 0) {
      const missingIds = [...sectorAreaIds].filter((id) => !directAreaMap.has(id))
      if (missingIds.length > 0) {
        const sectorAreas = await prisma.area.findMany({
          where: { id: { in: missingIds }, organizationId },
          select: { id: true, name: true, color: true },
        })
        for (const a of sectorAreas)
          directAreaMap.set(a.id, { id: a.id, name: a.name, color: a.color })
      }
    }

    const areas = Array.from(directAreaMap.values())

    return { success: true, data: { areas, sectors } }
  } catch (error) {
    return handleActionError(error, 'getMyAreasAndSectorsAction', 'Error al obtener filtros')
  }
}
