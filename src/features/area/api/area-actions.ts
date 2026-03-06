'use server'

import { getTranslations } from 'next-intl/server'

import { requireAdminHROrChief, requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'
import { createNotification } from '@/src/features/notifications/lib/notification-service'

import { createArea, deleteArea, getAreas, updateArea } from '@/src/entities/area'

import { getCreateAreaSchema, getUpdateAreaSchema } from '../lib/helpers/server'
import type { CreateAreaInput, UpdateAreaInput } from '../lib/types'

const AREA_PATHS = ['/dashboard/areas', '/dashboard/admin-hr'] as const

async function enrichAreasWithChiefsAndStaffCount(areaIds: string[]) {
  if (areaIds.length === 0)
    return { chiefsByArea: new Map<string, number>(), staffByArea: new Map<string, number>() }
  const [chiefsGroup, staffGroup] = await Promise.all([
    prisma.userArea.groupBy({
      by: ['areaId'],
      where: { areaId: { in: areaIds }, user: { role: ROLES.CHIEF_AREA } },
      _count: { userId: true },
    }),
    prisma.userArea.groupBy({
      by: ['areaId'],
      where: { areaId: { in: areaIds }, user: { role: ROLES.STAFF } },
      _count: { userId: true },
    }),
  ])
  const chiefsByArea = new Map(chiefsGroup.map((g) => [g.areaId, g._count.userId]))
  const staffByArea = new Map(staffGroup.map((g) => [g.areaId, g._count.userId]))
  return { chiefsByArea, staffByArea }
}

export async function createAreaAction(data: CreateAreaInput) {
  try {
    const user = await requireAdminHRWithOrg()
    const locale = await getLocaleFromHeaders()
    const createAreaSchema = await getCreateAreaSchema(locale)
    const validatedData = createAreaSchema.parse(data)
    const area = await createArea(validatedData, user.organizationId)
    revalidatePaths(...AREA_PATHS)
    return { success: true, data: area, message: 'Área creada exitosamente' }
  } catch (error) {
    return handleActionError(error, 'createAreaAction', 'Error al crear el área')
  }
}

export async function updateAreaAction(id: string, data: UpdateAreaInput) {
  try {
    const user = await requireAdminHROrChief()
    let orgId: string | null = user.organizationId ?? null
    if (isChiefArea(user) && !orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: user.id },
        select: { area: { select: { organizationId: true } } },
      })
      orgId = firstArea?.area?.organizationId ?? null
      if (!orgId) {
        const firstSector = await prisma.userSector.findFirst({
          where: { userId: user.id },
          select: { sector: { select: { organizationId: true } } },
        })
        orgId = firstSector?.sector?.organizationId ?? null
      }
    }
    if (!orgId) return { success: false, error: 'No tienes una organización asignada' }
    if (isChiefArea(user)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: user.id, areaId: id },
      })
      if (!chiefArea) {
        const isSectorChief = await prisma.userSector.findFirst({
          where: { userId: user.id, sector: { sectorAreas: { some: { areaId: id } } } },
        })
        if (!isSectorChief)
          return { success: false, error: 'No tienes permiso para editar esta área' }
      }
    }
    const locale = await getLocaleFromHeaders()
    const updateAreaSchema = await getUpdateAreaSchema(locale)
    const validatedData = updateAreaSchema.parse(data)
    const area = await updateArea(id, validatedData, orgId as string)
    revalidatePaths(...AREA_PATHS)
    return { success: true, data: area, message: 'Área actualizada exitosamente' }
  } catch (error) {
    return handleActionError(error, 'updateAreaAction', 'Error al actualizar el área')
  }
}

export async function deleteAreaAction(id: string) {
  try {
    const user = await requireAdminHRWithOrg()
    await deleteArea(id, user.organizationId)
    revalidatePaths(...AREA_PATHS)
    return { success: true, message: 'Área eliminada exitosamente' }
  } catch (error) {
    return handleActionError(error, 'deleteAreaAction', 'Error al eliminar el área')
  }
}

export async function getAreasAction() {
  try {
    const user = await requireAdminHROrChief()
    let orgId: string | null = user.organizationId ?? null
    if (isChiefArea(user) && !orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: user.id },
        select: { area: { select: { organizationId: true } } },
      })
      orgId = firstArea?.area?.organizationId ?? null
      if (!orgId) {
        const firstSector = await prisma.userSector.findFirst({
          where: { userId: user.id },
          select: { sector: { select: { organizationId: true } } },
        })
        orgId = firstSector?.sector?.organizationId ?? null
      }
    }
    if (!orgId) return { success: false, error: 'No tienes una organización asignada' }
    const effectiveOrgId = orgId as string
    if (isChiefArea(user)) {
      const [chiefAreas, sectorAreas] = await Promise.all([
        prisma.userArea.findMany({
          where: { userId: user.id },
          select: { areaId: true },
        }),
        prisma.sectorArea.findMany({
          where: { sector: { userSectors: { some: { userId: user.id } } } },
          select: { areaId: true },
        }),
      ])
      const areaIds = [
        ...new Set([...chiefAreas.map((a) => a.areaId), ...sectorAreas.map((sa) => sa.areaId)]),
      ]
      if (areaIds.length === 0) return { success: true, data: [] }
      const areas = await prisma.area.findMany({
        where: { id: { in: areaIds }, organizationId: effectiveOrgId },
        orderBy: { createdAt: 'desc' },
        include: {
          shiftTypes: {
            include: {
              shiftType: { select: { id: true, name: true, durationMinutes: true } },
            },
          },
          _count: { select: { shiftTypes: true } },
        },
      })
      const enriched = await enrichAreasWithChiefsAndStaffCount(areas.map((a) => a.id))
      const data = areas.map((a) => ({
        ...a,
        chiefsCount: enriched.chiefsByArea.get(a.id) ?? 0,
        staffCount: enriched.staffByArea.get(a.id) ?? 0,
      }))
      return { success: true, data }
    }
    const areas = await getAreas(effectiveOrgId)
    const enriched = await enrichAreasWithChiefsAndStaffCount(areas.map((a) => a.id))
    const data = areas.map((a) => ({
      ...a,
      chiefsCount: enriched.chiefsByArea.get(a.id) ?? 0,
      staffCount: enriched.staffByArea.get(a.id) ?? 0,
    }))
    return { success: true, data }
  } catch (error) {
    return handleActionError(error, 'getAreasAction', 'Error al obtener las áreas')
  }
}

export interface ChiefOption {
  id: string
  name: string
  email: string
  docNumber: string | null
}

export async function getChiefsForAreaAction(areaId: string) {
  try {
    const user = await requireAdminHROrChief()
    const area = await prisma.area.findFirst({
      where: { id: areaId },
      select: { id: true, organizationId: true },
    })
    if (!area) return { success: false, error: 'Área no encontrada' }
    if (isChiefArea(user)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: user.id, areaId },
      })
      if (!chiefArea) {
        const isSectorChief = await prisma.userSector.findFirst({
          where: { userId: user.id, sector: { sectorAreas: { some: { areaId } } } },
        })
        if (!isSectorChief) return { success: false, error: 'No tienes permiso para ver esta área' }
      }
    }
    const assignedUserAreas = await prisma.userArea.findMany({
      where: { areaId, user: { role: ROLES.CHIEF_AREA } },
      select: { userId: true },
    })
    const rawAssignedChiefIds = assignedUserAreas.map((ua) => ua.userId)

    if (isChiefArea(user)) {
      const isSectorChiefForArea = await prisma.userSector.findFirst({
        where: {
          userId: user.id,
          sector: { sectorAreas: { some: { areaId } } },
        },
      })

      if (isSectorChiefForArea) {
        const orgChiefs = await prisma.user.findMany({
          where: {
            organizationId: area.organizationId,
            role: ROLES.CHIEF_AREA,
          },
          select: { id: true, name: true, email: true, docNumber: true },
          orderBy: { name: 'asc' },
        })
        const assignedChiefIds = rawAssignedChiefIds.filter((id) =>
          orgChiefs.some((chief) => chief.id === id)
        )
        return {
          success: true,
          data: { chiefs: orgChiefs, assignedChiefIds },
        }
      }

      const chiefs = await prisma.user.findMany({
        where: {
          id: { in: rawAssignedChiefIds },
          role: ROLES.CHIEF_AREA,
        },
        select: { id: true, name: true, email: true, docNumber: true },
        orderBy: { name: 'asc' },
      })
      const assignedChiefIds = chiefs.map((c) => c.id)
      return {
        success: true,
        data: { chiefs, assignedChiefIds },
      }
    }
    const orgChiefs = await prisma.user.findMany({
      where: {
        organizationId: area.organizationId,
        role: ROLES.CHIEF_AREA,
      },
      select: { id: true, name: true, email: true, docNumber: true },
      orderBy: { name: 'asc' },
    })
    const assignedChiefIds = rawAssignedChiefIds.filter((id) =>
      orgChiefs.some((chief) => chief.id === id)
    )
    return {
      success: true,
      data: { chiefs: orgChiefs, assignedChiefIds },
    }
  } catch (error) {
    return handleActionError(error, 'getChiefsForAreaAction', 'Error al obtener jefes')
  }
}

export async function assignChiefsToAreaAction(areaId: string, chiefUserIds: string[]) {
  try {
    const user = await requireAdminHROrChief()
    let orgId: string | null = user.organizationId ?? null

    if (isChiefArea(user)) {
      if (!orgId) {
        const firstArea = await prisma.userArea.findFirst({
          where: { userId: user.id },
          select: { area: { select: { organizationId: true } } },
        })
        orgId = firstArea?.area?.organizationId ?? null
        if (!orgId) {
          const firstSector = await prisma.userSector.findFirst({
            where: { userId: user.id },
            select: { sector: { select: { organizationId: true } } },
          })
          orgId = firstSector?.sector?.organizationId ?? null
        }
      }
      if (!orgId) return { success: false, error: 'No tienes una organización asignada' }

      const isSectorChiefForArea = await prisma.userSector.findFirst({
        where: {
          userId: user.id,
          sector: { sectorAreas: { some: { areaId } } },
        },
      })
      if (!isSectorChiefForArea)
        return { success: false, error: 'No tienes permiso para asignar jefes a esta área' }
    } else if (!orgId) throw new Error('No estás vinculado a una organización')

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: orgId },
    })
    if (!area) return { success: false, error: 'Área no encontrada' }
    const validChiefs = await prisma.user.findMany({
      where: {
        id: { in: chiefUserIds },
        organizationId: orgId,
        role: ROLES.CHIEF_AREA,
      },
      select: { id: true },
    })
    const validIds = validChiefs.map((u) => u.id)

    const previousAssignments = await prisma.userArea.findMany({
      where: { areaId, user: { role: ROLES.CHIEF_AREA } },
      select: { userId: true },
    })
    const previousIds = new Set(previousAssignments.map((ua) => ua.userId))

    await prisma.$transaction([
      prisma.userArea.deleteMany({
        where: { areaId, user: { role: ROLES.CHIEF_AREA } },
      }),
      ...(validIds.length > 0
        ? [prisma.userArea.createMany({ data: validIds.map((userId) => ({ areaId, userId })) })]
        : []),
    ])

    const newlyAssigned = validIds.filter((id) => !previousIds.has(id))
    if (newlyAssigned.length > 0) {
      const tNotif = await getTranslations('notifications')
      await Promise.all(
        newlyAssigned.map((chiefId) =>
          createNotification({
            userId: chiefId,
            actorId: user.id,
            organizationId: orgId,
            type: 'AREA_ASSIGNED',
            title: tNotif('types.AREA_ASSIGNED', { actor: user.name, area: area.name }),
            actionUrl: '/dashboard/areas',
          })
        )
      )
    }

    revalidatePaths(...AREA_PATHS)
    return { success: true, message: 'Jefes de área actualizados' }
  } catch (error) {
    return handleActionError(error, 'assignChiefsToAreaAction', 'Error al asignar jefes')
  }
}

export async function assignChiefToSingleAreaAction(
  chiefUserId: string,
  areaId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await requireAdminHRWithOrg()
    const chief = await prisma.user.findFirst({
      where: {
        id: chiefUserId,
        organizationId: user.organizationId,
        role: ROLES.CHIEF_AREA,
      },
    })
    if (!chief) return { success: false, error: 'Jefe no encontrado o sin permisos' }
    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: user.organizationId },
    })
    if (!area) return { success: false, error: 'Área no encontrada' }
    await prisma.userArea.upsert({
      where: { userId_areaId: { userId: chiefUserId, areaId } },
      create: { userId: chiefUserId, areaId },
      update: {},
    })
    revalidatePaths(...AREA_PATHS)
    return { success: true, message: 'Jefe asignado al área exitosamente' }
  } catch (error) {
    return handleActionError(
      error,
      'assignChiefToSingleAreaAction',
      'Error al asignar jefe al área'
    )
  }
}

export async function removeChiefFromAreaAction(
  chiefUserId: string,
  areaId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await requireAdminHRWithOrg()
    const chief = await prisma.user.findFirst({
      where: {
        id: chiefUserId,
        organizationId: user.organizationId,
        role: ROLES.CHIEF_AREA,
      },
    })
    if (!chief) return { success: false, error: 'Jefe no encontrado o sin permisos' }
    await prisma.userArea.deleteMany({ where: { userId: chiefUserId, areaId } })
    revalidatePaths(...AREA_PATHS)
    return { success: true, message: 'Jefe desvinculado del área exitosamente' }
  } catch (error) {
    return handleActionError(
      error,
      'removeChiefFromAreaAction',
      'Error al desvincular jefe del área'
    )
  }
}

export interface StaffOption {
  id: string
  name: string
  email: string
  docNumber: string | null
}

export async function getStaffForAreaAction(areaId: string) {
  try {
    const user = await requireAdminHROrChief()
    let orgId: string | null = user.organizationId ?? null
    if (isChiefArea(user) && !orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: user.id },
        select: { area: { select: { organizationId: true } } },
      })
      orgId = firstArea?.area?.organizationId ?? null
      if (!orgId) {
        const firstSector = await prisma.userSector.findFirst({
          where: { userId: user.id },
          select: { sector: { select: { organizationId: true } } },
        })
        orgId = firstSector?.sector?.organizationId ?? null
      }
    }
    if (!orgId) return { success: false, error: 'No tienes una organización asignada' }

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: orgId },
    })
    if (!area) return { success: false, error: 'Área no encontrada' }

    if (isChiefArea(user)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: user.id, areaId },
      })
      if (!chiefArea) {
        const isSectorChief = await prisma.userSector.findFirst({
          where: { userId: user.id, sector: { sectorAreas: { some: { areaId } } } },
        })
        if (!isSectorChief)
          return { success: false, error: 'No tienes permiso para editar esta área' }
      }
    }

    const [orgStaff, assignedUserAreas] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId: orgId,
          role: ROLES.STAFF,
        },
        select: { id: true, name: true, email: true, docNumber: true },
        orderBy: { name: 'asc' },
      }),
      prisma.userArea.findMany({
        where: { areaId, user: { role: ROLES.STAFF } },
        select: { userId: true },
      }),
    ])

    const assignedStaffIds = assignedUserAreas.map((ua) => ua.userId)

    return {
      success: true,
      data: { staff: orgStaff, assignedStaffIds },
    }
  } catch (error) {
    return handleActionError(error, 'getStaffForAreaAction', 'Error al obtener personal del área')
  }
}

export async function assignStaffToAreaAction(areaId: string, staffUserIds: string[]) {
  try {
    const user = await requireAdminHROrChief()
    let orgId: string | null = user.organizationId ?? null
    if (isChiefArea(user) && !orgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: user.id },
        select: { area: { select: { organizationId: true } } },
      })
      orgId = firstArea?.area?.organizationId ?? null
      if (!orgId) {
        const firstSector = await prisma.userSector.findFirst({
          where: { userId: user.id },
          select: { sector: { select: { organizationId: true } } },
        })
        orgId = firstSector?.sector?.organizationId ?? null
      }
    }
    if (!orgId) return { success: false, error: 'No tienes una organización asignada' }

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: orgId },
    })
    if (!area) return { success: false, error: 'Área no encontrada' }

    if (isChiefArea(user)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: user.id, areaId },
      })
      if (!chiefArea) {
        const isSectorChief = await prisma.userSector.findFirst({
          where: { userId: user.id, sector: { sectorAreas: { some: { areaId } } } },
        })
        if (!isSectorChief)
          return { success: false, error: 'No tienes permiso para editar esta área' }
      }
    }

    const validStaff = await prisma.user.findMany({
      where: {
        id: { in: staffUserIds },
        organizationId: orgId,
        role: ROLES.STAFF,
      },
      select: { id: true },
    })
    const validIds = validStaff.map((u) => u.id)

    const previousAssignments = await prisma.userArea.findMany({
      where: { areaId, user: { role: ROLES.STAFF } },
      select: { userId: true },
    })
    const previousIds = new Set(previousAssignments.map((ua) => ua.userId))

    await prisma.$transaction([
      prisma.userArea.deleteMany({
        where: { areaId, user: { role: ROLES.STAFF } },
      }),
      ...(validIds.length > 0
        ? [prisma.userArea.createMany({ data: validIds.map((userId) => ({ areaId, userId })) })]
        : []),
    ])

    const newlyAssigned = validIds.filter((id) => !previousIds.has(id))
    if (newlyAssigned.length > 0) {
      const tNotif = await getTranslations('notifications')
      await Promise.all(
        newlyAssigned.map((staffId) =>
          createNotification({
            userId: staffId,
            actorId: user.id,
            organizationId: orgId,
            type: 'AREA_ASSIGNED',
            title: tNotif('types.AREA_ASSIGNED', { actor: user.name, area: area.name }),
            actionUrl: '/dashboard/areas',
          })
        )
      )
    }

    revalidatePaths(...AREA_PATHS)
    return { success: true, message: 'Personal del área actualizado' }
  } catch (error) {
    return handleActionError(error, 'assignStaffToAreaAction', 'Error al asignar personal al área')
  }
}
