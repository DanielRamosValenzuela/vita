'use server'

import { revalidatePath } from 'next/cache'
import type { Country } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHR } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'

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

    if (!search || search.trim().length === 0) {
      return {
        success: false,
        error: 'Debes ingresar un RUT o email para buscar',
      }
    }

    const user = await searchUserByDocumentOrEmail({ search: search.trim(), country })

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado. El usuario debe registrarse primero en la plataforma.',
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('[searchUserAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al buscar usuario',
    }
  }
}

export const inviteChiefAction = async (
  organizationId: string,
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireAdminHR()

    if (session.organizationId !== organizationId) {
      return {
        success: false,
        error: 'No tienes permisos para invitar a esta organización',
      }
    }

    const limitCheck = await checkOrganizationLimit(organizationId, 'CHIEF_AREA')
    if (!limitCheck.success) {
      return limitCheck
    }

    if (!limitCheck.canAddMore) {
      return {
        success: false,
        error: `Se ha alcanzado el límite máximo de ${limitCheck.maxLimit} jefes para esta organización`,
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      }
    }

    if (user.role === 'CHIEF_AREA' && user.organizationId === organizationId) {
      return {
        success: false,
        error: 'Este usuario ya es jefe de esta organización',
      }
    }

    const invitationResult = await createInvitation(
      organizationId,
      userId,
      'CHIEF_AREA',
      session.id
    )

    if (!invitationResult.success) {
      return invitationResult
    }

    revalidatePath(`/dashboard/admin-hr/organization`)
    revalidatePath('/dashboard/admin-hr/invitations')

    return {
      success: true,
      data: invitationResult.data,
    }
  } catch (error) {
    console.error('[inviteChiefAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar invitación',
    }
  }
}

export const inviteStaffAction = async (
  organizationId: string,
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireAdminHR()

    if (session.organizationId !== organizationId) {
      return {
        success: false,
        error: 'No tienes permisos para invitar a esta organización',
      }
    }

    const limitCheck = await checkOrganizationLimit(organizationId, 'STAFF_HEALTH')
    if (!limitCheck.success) {
      return limitCheck
    }

    if (!limitCheck.canAddMore) {
      return {
        success: false,
        error: `Se ha alcanzado el límite máximo de ${limitCheck.maxLimit} staff para esta organización`,
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      }
    }

    if (user.role === 'STAFF_HEALTH' && user.organizationId === organizationId) {
      return {
        success: false,
        error: 'Este usuario ya es staff de esta organización',
      }
    }

    const invitationResult = await createInvitation(
      organizationId,
      userId,
      'STAFF_HEALTH',
      session.id
    )

    if (!invitationResult.success) {
      return invitationResult
    }

    revalidatePath(`/dashboard/admin-hr/organization`)
    revalidatePath('/dashboard/admin-hr/invitations')

    return {
      success: true,
      data: invitationResult.data,
    }
  } catch (error) {
    console.error('[inviteStaffAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar invitación',
    }
  }
}

export const cancelInvitationAction = async (
  invitationId: string
): Promise<ActionResult<unknown>> => {
  try {
    await requireAdminHR()

    const result = await deleteInvitation(invitationId)

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      }
    }

    if (result.data?.organizationId) {
      revalidatePath(`/dashboard/admin-hr/organization`)
    }
    revalidatePath('/dashboard/admin-hr/invitations')

    return {
      success: true,
    }
  } catch (error) {
    console.error('[cancelInvitationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar invitación',
    }
  }
}
