'use server'

import { prisma } from '@/src/shared/lib/db'
import { requireAdminHRWithOrg, requireAdminHROrChiefArea } from '@/src/shared/lib/auth'
import { ROLES } from '@/src/shared/lib/constants'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'

import {
  createArea,
  deleteArea,
  getAreas,
  updateArea,
} from '@/src/entities/area'
import {
  getCreateAreaSchema,
  getUpdateAreaSchema,
  type CreateAreaInput,
  type UpdateAreaInput,
} from '../lib/schemas'

const AREA_PATHS = ['/dashboard/areas', '/dashboard/admin-hr'] as const

export async function createAreaAction(data: CreateAreaInput) {
  try {
    const user = await requireAdminHRWithOrg()

    const locale = await getLocaleFromHeaders()
    const createAreaSchema = await getCreateAreaSchema(locale)
    const validatedData = createAreaSchema.parse(data)
    const area = await createArea(validatedData, user.organizationId)

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      data: area,
      message: 'Área creada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'createAreaAction', 'Error al crear el área')
  }
}

export async function updateAreaAction(id: string, data: UpdateAreaInput) {
  try {
    const user = await requireAdminHROrChiefArea()
    const orgId = user.organizationId
    if (!orgId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    if (user.role === ROLES.CHIEF_AREA) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: user.id, areaId: id },
      })
      if (!chiefArea)
        return {
          success: false,
          error: 'No tienes permiso para editar esta área',
        }
    }

    const locale = await getLocaleFromHeaders()
    const updateAreaSchema = await getUpdateAreaSchema(locale)
    const validatedData = updateAreaSchema.parse(data)
    const area = await updateArea(id, validatedData, orgId)

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      data: area,
      message: 'Área actualizada exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'updateAreaAction',
      'Error al actualizar el área'
    )
  }
}

export async function deleteAreaAction(id: string) {
  try {
    const user = await requireAdminHRWithOrg()

    await deleteArea(id, user.organizationId)

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      message: 'Área eliminada exitosamente',
    }
  } catch (error) {
    return handleActionError(
      error,
      'deleteAreaAction',
      'Error al eliminar el área'
    )
  }
}

export async function getAreasAction() {
  try {
    const user = await requireAdminHROrChiefArea()
    const orgId = user.organizationId
    if (!orgId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    if (user.role === ROLES.CHIEF_AREA) {
      const chiefAreas = await prisma.userArea.findMany({
        where: { userId: user.id },
        select: { areaId: true },
      })
      const areaIds = chiefAreas.map((a) => a.areaId)
      if (areaIds.length === 0)
        return { success: true, data: [] }
      const areas = await prisma.area.findMany({
        where: { id: { in: areaIds }, organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        include: {
          shiftTypes: {
            include: {
              shiftType: { select: { id: true, name: true, durationMinutes: true } },
            },
          },
          _count: { select: { shiftTypes: true, userAreas: true, contracts: true } },
        },
      })
      return { success: true, data: areas }
    }

    const areas = await getAreas(orgId)
    return {
      success: true,
      data: areas,
    }
  } catch (error) {
    return handleActionError(
      error,
      'getAreasAction',
      'Error al obtener las áreas'
    )
  }
}

export interface ChiefOption {
  id: string
  name: string
  email: string
  docNumber: string | null
}

export interface GetChiefsForAreaResult {
  chiefs: ChiefOption[]
  assignedChiefIds: string[]
}

export async function getChiefsForAreaAction(areaId: string) {
  try {
    const user = await requireAdminHRWithOrg()

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: user.organizationId },
    })
    if (!area)
      return {
        success: false,
        error: 'Área no encontrada',
      }

    const [orgChiefs, assignedUserAreas] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId: user.organizationId,
          role: ROLES.CHIEF_AREA,
        },
        select: { id: true, name: true, email: true, docNumber: true },
        orderBy: { name: 'asc' },
      }),
      prisma.userArea.findMany({
        where: { areaId },
        select: { userId: true },
      }),
    ])

    const assignedChiefIds = new Set(assignedUserAreas.map((ua) => ua.userId))

    return {
      success: true,
      data: {
        chiefs: orgChiefs,
        assignedChiefIds: Array.from(assignedChiefIds),
      },
    }
  } catch (error) {
    return handleActionError(
      error,
      'getChiefsForAreaAction',
      'Error al obtener jefes'
    )
  }
}

export async function assignChiefsToAreaAction(
  areaId: string,
  chiefUserIds: string[]
) {
  try {
    const user = await requireAdminHRWithOrg()

    const area = await prisma.area.findFirst({
      where: { id: areaId, organizationId: user.organizationId },
    })
    if (!area)
      return {
        success: false,
        error: 'Área no encontrada',
      }

    const validChiefs = await prisma.user.findMany({
      where: {
        id: { in: chiefUserIds },
        organizationId: user.organizationId,
        role: ROLES.CHIEF_AREA,
      },
      select: { id: true },
    })
    const validIds = validChiefs.map((u) => u.id)

    await prisma.$transaction([
      prisma.userArea.deleteMany({ where: { areaId } }),
      ...validIds.map((userId) =>
        prisma.userArea.create({ data: { areaId, userId } })
      ),
    ])

    revalidatePaths(...AREA_PATHS)

    return {
      success: true,
      message: 'Jefes de área actualizados',
    }
  } catch (error) {
    return handleActionError(
      error,
      'assignChiefsToAreaAction',
      'Error al asignar jefes'
    )
  }
}
