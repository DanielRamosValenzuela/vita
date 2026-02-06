'use server'

import { revalidatePath } from 'next/cache'
import type { Country } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { ROLES } from '@/src/shared/lib/constants'
import { checkDocumentExistsInOrganization } from '@/src/shared/lib/validation/document-validation'
import { handleActionError } from '@/src/shared/lib/utils'

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

export const inviteAdminHRAction = async (
  organizationId: string,
  userId: string
): Promise<ActionResult<unknown>> => {
  try {
    const session = await requireSuperAdmin()

    const limitCheck = await checkOrganizationAdminHRLimit(organizationId)
    if (!limitCheck.success) 
      return limitCheck
    

    if (!limitCheck.canAddMore) 
      return {
        success: false,
        error: `Se ha alcanzado el límite máximo de ${limitCheck.maxLimit} administradores RRHH para esta organización`,
      }
    

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
        country: true,
        docType: true,
        docNumber: true,
      },
    })

    if (!user) 
      return {
        success: false,
        error: 'Usuario no encontrado',
      }
    

    if (user.role === ROLES.ADMIN_HR && user.organizationId === organizationId) 
      return {
        success: false,
        error: 'Este usuario ya es ADMIN_HR de esta organización',
      }
    

    if (user.country && user.docType && user.docNumber) {
      const docExists = await checkDocumentExistsInOrganization(
        user.country,
        user.docType,
        user.docNumber,
        organizationId,
        userId
      )

      if (docExists) 
        return {
          success: false,
          error: `El documento ${user.docNumber} ya está registrado en esta organización por otro usuario`,
        }
      
    }

    const invitationResult = await createAdminHRInvitation(organizationId, userId, session.id)

    if (!invitationResult.success) 
      return invitationResult
    

    revalidatePath(`/dashboard/organizations/${organizationId}`)
    revalidatePath('/dashboard/organizations')

    return {
      success: true,
      data: invitationResult.data,
      message: 'Invitación enviada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'inviteAdminHRAction', 'Error al enviar invitación')
  }
}

export const cancelInvitationAction = async (
  invitationId: string
): Promise<ActionResult<unknown>> => {
  try {
    await requireSuperAdmin()

    const result = await deleteInvitation(invitationId)

    if (!result.success) 
      return {
        success: false,
        error: result.error,
      }
    

    if (result.data?.organizationId) 
      revalidatePath(`/dashboard/organizations/${result.data.organizationId}`)
    
    revalidatePath('/dashboard/organizations')

    return {
      success: true,
      message: 'Invitación cancelada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'cancelInvitationAction', 'Error al cancelar invitación')
  }
}
