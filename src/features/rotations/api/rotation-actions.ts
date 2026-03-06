'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

import {
  chiefHasAreaAccess,
  getChiefAccessibleAreaIds,
  resolveChiefOrganizationId,
} from '@/src/shared/lib/auth/chief-access'
import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChief } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'

import { getPatternSummary } from '@/src/entities/rotation'

import { createRotationSchema, updateRotationSchema } from '../lib/rotation-schemas'
import type {
  GetRotationsParams,
  GetRotationsResult,
  RotationListItem,
  RotationWithRelations,
} from '../types/rotation-types'

const rotationInclude = {
  area: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  steps: {
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      order: true,
      isRestDay: true,
      shiftType: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
  },
  shiftConfigs: {
    select: {
      id: true,
      shiftTypeId: true,
      startTime: true,
      shiftType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  groups: {
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      cycleOffset: true,
      members: {
        where: { leftAt: null },
        select: {
          id: true,
          userId: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: { where: { leftAt: null } },
        },
      },
    },
  },
  _count: {
    select: {
      shifts: true,
    },
  },
} as const

export const createRotationAction = async (
  data: z.infer<typeof createRotationSchema>
): Promise<ActionResult<RotationWithRelations>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = createRotationSchema.parse(data)

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, validatedData.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas',
        }
    }

    const area = await prisma.area.findUnique({
      where: { id: validatedData.areaId, organizationId, isActive: true },
    })
    if (!area)
      return { success: false, error: 'El área no está activa o no pertenece a tu organización' }

    const nonRestSteps = validatedData.steps.filter((s) => !s.isRestDay)
    for (const step of nonRestSteps)
      if (!step.shiftTypeId)
        return { success: false, error: 'Cada paso no libre debe tener un tipo de turno asignado' }

    const shiftTypeIds = [
      ...new Set(nonRestSteps.map((s) => s.shiftTypeId).filter(Boolean) as string[]),
    ]

    if (shiftTypeIds.length > 0) {
      const activeShiftTypes = await prisma.shiftType.findMany({
        where: { id: { in: shiftTypeIds }, organizationId, isActive: true },
        select: { id: true },
      })
      const activeIds = new Set(activeShiftTypes.map((st) => st.id))
      const invalidId = shiftTypeIds.find((id) => !activeIds.has(id))
      if (invalidId)
        return {
          success: false,
          error: 'Uno o más tipos de turno no están activos o no pertenecen a tu organización',
        }

      const areaAssignments = await prisma.areaShiftType.findMany({
        where: { areaId: validatedData.areaId, shiftTypeId: { in: shiftTypeIds } },
        select: { shiftTypeId: true },
      })
      const assignedIds = new Set(areaAssignments.map((a) => a.shiftTypeId))
      const unassignedId = shiftTypeIds.find((id) => !assignedIds.has(id))
      if (unassignedId)
        return { success: false, error: 'Uno o más tipos de turno no están asignados a esta área' }
    }

    const rotation = await prisma.$transaction(async (tx) => {
      const created = await tx.rotation.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          areaId: validatedData.areaId,
          organizationId,
          status: 'DRAFT',
          startDate: validatedData.startDate,
        },
      })

      await tx.rotationStep.createMany({
        data: validatedData.steps.map((step) => ({
          rotationId: created.id,
          order: step.order,
          isRestDay: step.isRestDay,
          shiftTypeId: step.shiftTypeId ?? null,
        })),
      })

      if (validatedData.shiftConfigs.length > 0)
        await tx.rotationShiftConfig.createMany({
          data: validatedData.shiftConfigs.map((cfg) => ({
            rotationId: created.id,
            shiftTypeId: cfg.shiftTypeId,
            startTime: cfg.startTime,
          })),
        })

      await tx.rotationGroup.createMany({
        data: validatedData.groups.map((group, index) => ({
          rotationId: created.id,
          name: group.name,
          color: group.color,
          icon: group.icon,
          cycleOffset: index,
        })),
      })

      return tx.rotation.findUniqueOrThrow({
        where: { id: created.id },
        include: rotationInclude,
      })
    })

    revalidatePath('/dashboard/rotations')

    return {
      success: true,
      data: rotation as RotationWithRelations,
      message: 'Rotativa creada exitosamente',
    }
  } catch (error) {
    console.error('[createRotationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear rotativa',
    }
  }
}

export const getRotationsAction = async (
  params: GetRotationsParams
): Promise<ActionResult<GetRotationsResult>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const { page = 1, pageSize = 20, areaId, status, search } = params

    let chiefAreaIds: string[] | null = null
    if (isChiefArea(session)) {
      chiefAreaIds = await getChiefAccessibleAreaIds(session.id)

      if (chiefAreaIds.length === 0)
        return {
          success: true,
          data: { rotations: [], total: 0, page: 1, pageSize, totalPages: 0 },
        }
    }

    const where: Prisma.RotationWhereInput = {
      organizationId,
    }

    if (chiefAreaIds !== null) where.areaId = { in: chiefAreaIds }

    if (areaId) {
      if (chiefAreaIds !== null && !chiefAreaIds.includes(areaId))
        return {
          success: true,
          data: { rotations: [], total: 0, page: 1, pageSize, totalPages: 0 },
        }
      where.areaId = areaId
    }

    if (status) where.status = status

    if (search) where.name = { contains: search, mode: 'insensitive' }

    const skip = (page - 1) * pageSize

    const [rawRotations, total] = await Promise.all([
      prisma.rotation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          area: {
            select: {
              id: true,
              name: true,
            },
          },
          steps: {
            orderBy: { order: 'asc' },
            select: {
              isRestDay: true,
              shiftType: {
                select: { name: true },
              },
            },
          },
          groups: {
            select: {
              id: true,
              _count: {
                select: { members: { where: { leftAt: null } } },
              },
            },
          },
          _count: {
            select: {
              groups: true,
              shifts: true,
            },
          },
        },
      }),
      prisma.rotation.count({ where }),
    ])

    const rotations: RotationListItem[] = rawRotations.map((r) => {
      const totalMembers = r.groups.reduce((sum, g) => sum + g._count.members, 0)
      const patternSummary = getPatternSummary(
        r.steps.map((s) => ({
          isRestDay: s.isRestDay,
          shiftTypeName: s.shiftType?.name,
        }))
      )

      return {
        id: r.id,
        name: r.name,
        status: r.status,
        createdAt: r.createdAt,
        area: r.area,
        _count: r._count,
        patternSummary,
        totalMembers,
      }
    })

    return {
      success: true,
      data: {
        rotations,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('[getRotationsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener rotativas',
    }
  }
}

export const getRotationAction = async (
  rotationId: string
): Promise<ActionResult<RotationWithRelations>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const rotation = await prisma.rotation.findFirst({
      where: { id: rotationId, organizationId },
      include: rotationInclude,
    })

    if (!rotation) return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, rotation.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes ver rotativas de las áreas que tienes asignadas',
        }
    }

    return { success: true, data: rotation as RotationWithRelations }
  } catch (error) {
    console.error('[getRotationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener rotativa',
    }
  }
}

export const deleteRotationAction = async (
  rotationId: string,
  deleteLinkedShifts: boolean
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const rotation = await prisma.rotation.findFirst({
      where: { id: rotationId, organizationId },
      select: { id: true, areaId: true },
    })
    if (!rotation) return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, rotation.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes eliminar rotativas de las áreas que tienes asignadas',
        }
    }

    if (deleteLinkedShifts) await prisma.shift.deleteMany({ where: { rotationId } })
    else
      await prisma.shift.updateMany({
        where: { rotationId },
        data: { rotationId: null, rotationGroupId: null },
      })

    await prisma.rotation.delete({ where: { id: rotationId } })

    revalidatePath('/dashboard/rotations')

    return { success: true, data: null, message: 'Rotativa eliminada exitosamente' }
  } catch (error) {
    console.error('[deleteRotationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar rotativa',
    }
  }
}

export const updateRotationAction = async (
  rotationId: string,
  data: z.infer<typeof updateRotationSchema>
): Promise<ActionResult<RotationWithRelations>> => {
  try {
    const session = await requireAdminHROrChief()

    const derivedOrgId = isChiefArea(session)
      ? await resolveChiefOrganizationId(session.id, session.organizationId ?? null)
      : (session.organizationId ?? null)
    if (!derivedOrgId) return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = updateRotationSchema.parse(data)

    const existing = await prisma.rotation.findFirst({
      where: { id: rotationId, organizationId },
      select: { id: true, areaId: true },
    })
    if (!existing) return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const hasAccess = await chiefHasAreaAccess(session.id, existing.areaId)
      if (!hasAccess)
        return {
          success: false,
          error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas',
        }
    }

    if (validatedData.status === 'ACTIVE') {
      const groupsWithMembers = await prisma.rotationGroup.findMany({
        where: { rotationId },
        select: {
          id: true,
          _count: { select: { members: { where: { leftAt: null } } } },
        },
      })

      const groupsWithMembersCount = groupsWithMembers.filter((g) => g._count.members > 0).length

      if (groupsWithMembersCount < 2)
        return {
          success: false,
          error: 'Para activar una rotativa necesitas al menos 2 grupos con miembros',
        }
    }

    const rotation = await prisma.$transaction(async (tx) => {
      if (validatedData.steps) {
        await tx.rotationStep.deleteMany({ where: { rotationId } })
        await tx.rotationShiftConfig.deleteMany({ where: { rotationId } })

        await tx.rotationStep.createMany({
          data: validatedData.steps.map((step) => ({
            rotationId,
            order: step.order,
            isRestDay: step.isRestDay,
            shiftTypeId: step.shiftTypeId ?? null,
          })),
        })

        if (validatedData.shiftConfigs && validatedData.shiftConfigs.length > 0)
          await tx.rotationShiftConfig.createMany({
            data: validatedData.shiftConfigs.map((cfg) => ({
              rotationId,
              shiftTypeId: cfg.shiftTypeId,
              startTime: cfg.startTime,
            })),
          })
      } else if (validatedData.shiftConfigs) {
        await tx.rotationShiftConfig.deleteMany({ where: { rotationId } })

        if (validatedData.shiftConfigs.length > 0)
          await tx.rotationShiftConfig.createMany({
            data: validatedData.shiftConfigs.map((cfg) => ({
              rotationId,
              shiftTypeId: cfg.shiftTypeId,
              startTime: cfg.startTime,
            })),
          })
      }

      await tx.rotation.update({
        where: { id: rotationId },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          status: validatedData.status,
          startDate: validatedData.startDate,
        },
      })

      return tx.rotation.findUniqueOrThrow({
        where: { id: rotationId },
        include: rotationInclude,
      })
    })

    revalidatePath('/dashboard/rotations')

    return {
      success: true,
      data: rotation as RotationWithRelations,
      message: 'Rotativa actualizada exitosamente',
    }
  } catch (error) {
    console.error('[updateRotationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar rotativa',
    }
  }
}
