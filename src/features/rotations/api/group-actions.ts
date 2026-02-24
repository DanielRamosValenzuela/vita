'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'

import { createNotification } from '@/src/features/notifications/lib/notification-service'

import { addGroupSchema, addMemberSchema, removeMemberSchema } from '../lib/rotation-schemas'
import type { RotationWithRelations } from '../types/rotation-types'

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
          members: true,
        },
      },
    },
  },
} as const

export type AvailableStaffMember = {
  id: string
  name: string
  email: string
}

export const getAvailableStaffAction = async (
  rotationId: string
): Promise<ActionResult<AvailableStaffMember[]>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const rotation = await prisma.rotation.findFirst({
      where: { id: rotationId, organizationId },
      select: { id: true, areaId: true },
    })
    if (!rotation)
      return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const activeMemberships = await prisma.rotationMember.findMany({
      where: {
        leftAt: null,
        rotationGroup: { rotationId },
      },
      select: { userId: true },
    })
    const excludedUserIds = activeMemberships.map((m) => m.userId)

    const userAreaRows = await prisma.userArea.findMany({
      where: {
        areaId: rotation.areaId,
        user: {
          organizationId,
          role: 'STAFF_HEALTH',
          ...(excludedUserIds.length > 0 ? { id: { notIn: excludedUserIds } } : {}),
        },
      },
      select: {
        userId: true,
      },
    })

    const userIds = userAreaRows.map((ua) => ua.userId)

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })

    const staff: AvailableStaffMember[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }))

    return { success: true, data: staff }
  } catch (error) {
    console.error('[getAvailableStaffAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener personal disponible',
    }
  }
}

export const addGroupAction = async (
  data: z.infer<typeof addGroupSchema>
): Promise<ActionResult<RotationWithRelations>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = addGroupSchema.parse(data)

    const rotation = await prisma.rotation.findFirst({
      where: { id: validatedData.rotationId, organizationId },
      select: { id: true, areaId: true },
    })
    if (!rotation)
      return { success: false, error: 'Rotativa no encontrada' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const existingGroups = await prisma.rotationGroup.findMany({
      where: { rotationId: validatedData.rotationId },
      select: { cycleOffset: true },
      orderBy: { cycleOffset: 'desc' },
    })

    if (existingGroups.length >= 6)
      return { success: false, error: 'Máximo 6 grupos por rotativa' }

    const cycleOffset = existingGroups.length > 0 ? (existingGroups[0].cycleOffset + 1) : 0

    await prisma.rotationGroup.create({
      data: {
        rotationId: validatedData.rotationId,
        name: validatedData.name,
        color: validatedData.color,
        icon: validatedData.icon,
        cycleOffset,
      },
    })

    const updatedRotation = await prisma.rotation.findUniqueOrThrow({
      where: { id: validatedData.rotationId },
      include: rotationInclude,
    })

    revalidatePath('/dashboard/rotations')

    return { success: true, data: updatedRotation as RotationWithRelations, message: 'Grupo añadido exitosamente' }
  } catch (error) {
    console.error('[addGroupAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al añadir grupo',
    }
  }
}

export const removeGroupAction = async (
  groupId: string,
  deleteLinkedShifts: boolean
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const group = await prisma.rotationGroup.findFirst({
      where: { id: groupId },
      select: {
        id: true,
        rotation: {
          select: {
            id: true,
            areaId: true,
            organizationId: true,
          },
        },
      },
    })

    if (!group || group.rotation.organizationId !== organizationId)
      return { success: false, error: 'Grupo no encontrado' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: group.rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const remainingGroupsCount = await prisma.rotationGroup.count({
      where: { rotationId: group.rotation.id },
    })

    if (remainingGroupsCount < 3)
      return { success: false, error: 'Una rotativa necesita al menos 2 grupos' }

    if (deleteLinkedShifts)
      await prisma.shift.deleteMany({ where: { rotationGroupId: groupId } })
    else
      await prisma.shift.updateMany({
        where: { rotationGroupId: groupId },
        data: { rotationGroupId: null },
      })

    await prisma.rotationGroup.delete({ where: { id: groupId } })

    revalidatePath('/dashboard/rotations')

    return { success: true, data: null, message: 'Grupo eliminado exitosamente' }
  } catch (error) {
    console.error('[removeGroupAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar grupo',
    }
  }
}

export const addMemberAction = async (
  data: z.infer<typeof addMemberSchema>
): Promise<ActionResult<RotationWithRelations>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = addMemberSchema.parse(data)

    const group = await prisma.rotationGroup.findFirst({
      where: { id: validatedData.rotationGroupId },
      select: {
        id: true,
        rotation: {
          select: {
            id: true,
            areaId: true,
            organizationId: true,
          },
        },
      },
    })

    if (!group || group.rotation.organizationId !== organizationId)
      return { success: false, error: 'Grupo no encontrado' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: group.rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: validatedData.userId, organizationId },
      select: { id: true, name: true, role: true },
    })

    if (!targetUser)
      return { success: false, error: 'Usuario no encontrado en la organización' }

    if (targetUser.role !== 'STAFF_HEALTH')
      return { success: false, error: 'Solo se pueden añadir usuarios con rol STAFF_HEALTH a una rotativa' }

    const userArea = await prisma.userArea.findFirst({
      where: { userId: validatedData.userId, areaId: group.rotation.areaId },
    })

    if (!userArea)
      return { success: false, error: 'El usuario no pertenece al área de esta rotativa' }

    const existingMembership = await prisma.rotationMember.findFirst({
      where: {
        userId: validatedData.userId,
        leftAt: null,
        rotationGroup: {
          rotationId: group.rotation.id,
        },
      },
    })

    if (existingMembership)
      return { success: false, error: 'Este usuario ya está asignado a otro grupo en esta rotativa' }

    const conflictingRotation = await prisma.rotationMember.findFirst({
      where: {
        userId: validatedData.userId,
        leftAt: null,
        rotationGroup: {
          rotation: {
            areaId: group.rotation.areaId,
            status: 'ACTIVE',
            id: { not: group.rotation.id },
          },
        },
      },
      select: { id: true },
    })

    await prisma.rotationMember.create({
      data: {
        rotationGroupId: validatedData.rotationGroupId,
        userId: validatedData.userId,
      },
    })

    await createNotification({
      type: 'ROTATION_ASSIGNED',
      userId: validatedData.userId,
      actorId: session.id,
      organizationId,
      title: 'Has sido asignado a una rotativa',
      actionUrl: `/dashboard/rotations/${group.rotation.id}`,
    })

    const updatedRotation = await prisma.rotation.findUniqueOrThrow({
      where: { id: group.rotation.id },
      include: rotationInclude,
    })

    revalidatePath('/dashboard/rotations')

    const message = conflictingRotation
      ? `Miembro añadido. Advertencia: ${targetUser.name} ya está en otra rotativa activa del área`
      : 'Miembro añadido exitosamente'

    return { success: true, data: updatedRotation as RotationWithRelations, message }
  } catch (error) {
    console.error('[addMemberAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al añadir miembro',
    }
  }
}

export const removeMemberAction = async (
  data: z.infer<typeof removeMemberSchema>,
  cancelFutureShifts: boolean
): Promise<ActionResult<null>> => {
  try {
    const session = await requireAdminHROrChiefArea()

    let derivedOrgId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !derivedOrgId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      derivedOrgId = firstArea?.area?.organizationId ?? null
    }
    if (!derivedOrgId)
      return { success: false, error: 'No tienes una organización asignada' }
    const organizationId = derivedOrgId

    const validatedData = removeMemberSchema.parse(data)

    const group = await prisma.rotationGroup.findFirst({
      where: { id: validatedData.rotationGroupId },
      select: {
        id: true,
        rotation: {
          select: {
            id: true,
            areaId: true,
            organizationId: true,
          },
        },
      },
    })

    if (!group || group.rotation.organizationId !== organizationId)
      return { success: false, error: 'Grupo no encontrado' }

    if (isChiefArea(session)) {
      const chiefArea = await prisma.userArea.findFirst({
        where: { userId: session.id, areaId: group.rotation.areaId },
      })
      if (!chiefArea)
        return { success: false, error: 'Solo puedes gestionar rotativas en las áreas que tienes asignadas' }
    }

    const member = await prisma.rotationMember.findFirst({
      where: {
        rotationGroupId: validatedData.rotationGroupId,
        userId: validatedData.userId,
        leftAt: null,
      },
      select: { id: true },
    })

    if (!member)
      return { success: false, error: 'El usuario no es miembro activo de este grupo' }

    await prisma.rotationMember.update({
      where: { id: member.id },
      data: { leftAt: new Date() },
    })

    if (cancelFutureShifts)
      await prisma.shift.deleteMany({
        where: {
          rotationGroupId: validatedData.rotationGroupId,
          userId: validatedData.userId,
          startTime: { gt: new Date() },
        },
      })

    revalidatePath('/dashboard/rotations')

    return { success: true, data: null, message: 'Miembro eliminado exitosamente' }
  } catch (error) {
    console.error('[removeMemberAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar miembro',
    }
  }
}
