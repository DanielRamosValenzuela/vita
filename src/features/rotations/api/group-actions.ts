'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'

import { addMembersBulkSchema, removeMemberSchema } from '../lib/rotation-schemas'
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
        rotationGroup: {
          rotation: { organizationId },
        },
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

export const addMembersBulkAction = async (
  data: z.infer<typeof addMembersBulkSchema>
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

    const validatedData = addMembersBulkSchema.parse(data)

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

    const targetUsers = await prisma.user.findMany({
      where: { id: { in: validatedData.userIds }, organizationId, role: 'STAFF_HEALTH' },
      select: { id: true, name: true },
    })

    if (targetUsers.length === 0)
      return { success: false, error: 'No se encontraron usuarios válidos' }

    const validUserIds = targetUsers.map((u) => u.id)

    const userAreas = await prisma.userArea.findMany({
      where: { userId: { in: validUserIds }, areaId: group.rotation.areaId },
      select: { userId: true },
    })
    const usersInArea = new Set(userAreas.map((ua) => ua.userId))

    const existingMemberships = await prisma.rotationMember.findMany({
      where: {
        userId: { in: validUserIds },
        leftAt: null,
        rotationGroup: {
          rotation: { organizationId },
        },
      },
      select: { userId: true },
    })
    const alreadyInRotation = new Set(existingMemberships.map((m) => m.userId))

    const eligibleUserIds = validUserIds.filter(
      (id) => usersInArea.has(id) && !alreadyInRotation.has(id)
    )

    if (eligibleUserIds.length === 0)
      return { success: false, error: 'Ninguno de los usuarios seleccionados es elegible' }

    const previousMembers = await prisma.rotationMember.findMany({
      where: {
        rotationGroupId: validatedData.rotationGroupId,
        userId: { in: eligibleUserIds },
        leftAt: { not: null },
      },
      select: { id: true, userId: true },
    })
    const previousUserIds = new Set(previousMembers.map((m) => m.userId))

    if (previousMembers.length > 0)
      await prisma.rotationMember.updateMany({
        where: { id: { in: previousMembers.map((m) => m.id) } },
        data: { leftAt: null },
      })

    const newUserIds = eligibleUserIds.filter((id) => !previousUserIds.has(id))
    if (newUserIds.length > 0)
      await prisma.rotationMember.createMany({
        data: newUserIds.map((userId) => ({
          rotationGroupId: validatedData.rotationGroupId,
          userId,
        })),
      })

    await prisma.notification.createMany({
      data: eligibleUserIds.map((userId) => ({
        type: 'ROTATION_ASSIGNED' as const,
        userId,
        actorId: session.id,
        organizationId,
        title: 'Has sido asignado a una rotativa',
        actionUrl: `/dashboard/rotations/${group.rotation.id}`,
      })),
    })

    const updatedRotation = await prisma.rotation.findUniqueOrThrow({
      where: { id: group.rotation.id },
      include: rotationInclude,
    })

    revalidatePath('/dashboard/rotations')

    return {
      success: true,
      data: updatedRotation as RotationWithRelations,
      message: `${eligibleUserIds.length} miembros añadidos exitosamente`,
    }
  } catch (error) {
    console.error('[addMembersBulkAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al añadir miembros',
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
