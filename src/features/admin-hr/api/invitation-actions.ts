'use server'

import type { Country } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'
import { requireAdminHR, requireAdminHRWithOrg } from '@/src/shared/lib/auth'
import type { ActionResult } from '@/src/shared/lib/types'
import { ROLES } from '@/src/shared/lib/constants'
import { handleActionError } from '@/src/shared/lib/utils'
import { revalidatePaths } from '@/src/shared/lib/utils/revalidate-paths'

import {
  checkOrganizationLimit,
  createInvitation,
} from '../data/invitation-repository'
import { searchUserByDocumentOrEmail } from '@/src/entities/user'
import { deleteInvitation } from '@/src/entities/invitation'

export const searchUserAction = async (
  search: string,
  country?: Country
): Promise<ActionResult<unknown>> => {
  try {
    await requireAdminHR()

    if (!search || search.trim().length === 0) 
      return {
        success: false,
        error: 'Debes ingresar un RUT o email para buscar',
      }
    

    const user = await searchUserByDocumentOrEmail({ search: search.trim(), country })

    if (!user) 
      return {
        success: false,
        error: 'Usuario no encontrado. El usuario debe registrarse primero en la plataforma.',
      }
    

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    return handleActionError(error, 'searchUserAction', 'Error al buscar usuario')
  }
}

const INVITATION_PATHS = ['/dashboard/admin-hr/organization', '/dashboard/admin-hr/invitations'] as const

export const inviteChiefAction = async (
  organizationId: string,
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireAdminHR()

    if (session.organizationId !== organizationId) 
      return {
        success: false,
        error: 'No tienes permisos para invitar a esta organización',
      }
    

    const limitCheck = await checkOrganizationLimit(organizationId, ROLES.CHIEF_AREA)
    if (!limitCheck.success) 
      return limitCheck
    

    if (!limitCheck.canAddMore) 
      return {
        success: false,
        error: `Se ha alcanzado el límite máximo de ${limitCheck.maxLimit} jefes para esta organización`,
      }
    

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
      },
    })

    if (!user) 
      return {
        success: false,
        error: 'Usuario no encontrado',
      }
    

    if (user.role === ROLES.CHIEF_AREA && user.organizationId === organizationId) 
      return {
        success: false,
        error: 'Este usuario ya es jefe de esta organización',
      }
    

    const invitationResult = await createInvitation(
      organizationId,
      userId,
      ROLES.CHIEF_AREA,
      session.id
    )

    if (!invitationResult.success) 
      return invitationResult
    

    revalidatePaths(...INVITATION_PATHS)

    return {
      success: true,
      data: invitationResult.data,
      message: 'Invitación enviada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'inviteChiefAction', 'Error al enviar invitación')
  }
}

export const inviteStaffAction = async (
  organizationId: string,
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireAdminHRWithOrg()

    if (session.organizationId !== organizationId) 
      return {
        success: false,
        error: 'No tienes permisos para invitar a esta organización',
      }
    

    const limitCheck = await checkOrganizationLimit(organizationId, ROLES.STAFF_HEALTH)
    if (!limitCheck.success) 
      return limitCheck
    

    if (!limitCheck.canAddMore) 
      return {
        success: false,
        error: `Se ha alcanzado el límite máximo de ${limitCheck.maxLimit} staff para esta organización`,
      }
    

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
      },
    })

    if (!user) 
      return {
        success: false,
        error: 'Usuario no encontrado',
      }
    

    if (user.role === ROLES.STAFF_HEALTH && user.organizationId === organizationId) 
      return {
        success: false,
        error: 'Este usuario ya es staff de esta organización',
      }
    

    const invitationResult = await createInvitation(
      organizationId,
      userId,
      ROLES.STAFF_HEALTH,
      session.id
    )

    if (!invitationResult.success) 
      return invitationResult
    

    revalidatePaths(...INVITATION_PATHS)

    return {
      success: true,
      data: invitationResult.data,
      message: 'Invitación enviada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'inviteStaffAction', 'Error al enviar invitación')
  }
}

export const cancelInvitationAction = async (
  invitationId: string
): Promise<ActionResult<unknown>> => {
  try {
    await requireAdminHR()

    const result = await deleteInvitation(invitationId)

    if (!result.success) 
      return {
        success: false,
        error: result.error,
      }
    

    revalidatePaths(...INVITATION_PATHS)

    return {
      success: true,
      message: 'Invitación cancelada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'cancelInvitationAction', 'Error al cancelar invitación')
  }
}

export const removeUserFromOrganizationAction = async (
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireAdminHRWithOrg()
    const orgId = session.organizationId
    if (!orgId)
      return { success: false, error: 'No tienes una organización asignada' }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true, name: true },
    })

    if (!target)
      return { success: false, error: 'Usuario no encontrado' }

    if (target.organizationId !== orgId)
      return { success: false, error: 'El usuario no pertenece a tu organización' }

    if (target.role === ROLES.ADMIN_HR)
      return { success: false, error: 'No puedes desvincular a un administrador RRHH desde aquí' }

    await prisma.$transaction([
      prisma.userArea.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { organizationId: null },
      }),
    ])

    revalidatePaths(...INVITATION_PATHS)

    return {
      success: true,
      message: `${target.name} ha sido desvinculado de la organización`,
    }
  } catch (error) {
    return handleActionError(error, 'removeUserFromOrganizationAction', 'Error al desvincular usuario')
  }
}
