'use server'

import { revalidatePath } from 'next/cache'
import type { Country } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'

import {
  checkOrganizationAdminHRLimit,
  createAdminHRInvitation,
  deleteInvitation,
} from '../data/admin-hr-invitation-repository'
import { searchUserByDocumentOrEmail } from '@/src/entities/user'

export const searchUserAction = async (
  search: string,
  country?: Country
): Promise<ActionResult<unknown>> => {
  try {
    await requireSuperAdmin()

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

export const inviteAdminHRAction = async (
  organizationId: string,
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireSuperAdmin()

    const limitCheck = await checkOrganizationAdminHRLimit(organizationId)
    if (!limitCheck.success) {
      return limitCheck
    }

    if (!limitCheck.canAddMore) {
      return {
        success: false,
        error: `Se ha alcanzado el límite máximo de ${limitCheck.maxLimit} administradores RRHH para esta organización`,
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

    if (user.role === 'ADMIN_HR' && user.organizationId === organizationId) {
      return {
        success: false,
        error: 'Este usuario ya es ADMIN_HR de esta organización',
      }
    }

    const invitationResult = await createAdminHRInvitation(organizationId, userId, session.id)

    if (!invitationResult.success) {
      return invitationResult
    }

    revalidatePath(`/dashboard/organizations/${organizationId}`)
    revalidatePath('/dashboard/organizations')

    return {
      success: true,
      data: invitationResult.data,
    }
  } catch (error) {
    console.error('[inviteAdminHRAction] Error:', error)
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
    await requireSuperAdmin()

    const result = await deleteInvitation(invitationId)

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      }
    }

    if (result.data?.organizationId) {
      revalidatePath(`/dashboard/organizations/${result.data.organizationId}`)
    }
    revalidatePath('/dashboard/organizations')

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
