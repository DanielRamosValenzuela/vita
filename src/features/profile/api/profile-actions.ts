'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/src/shared/lib/auth/session'
import {
  updateUserProfile,
  changeUserPassword,
  updateUserDocument,
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  getUserOrganizations,
} from '../lib/profile-helpers'
import { updateProfileSchema, changePasswordSchema, updateDocumentSchema } from '../lib/schemas'
import type { ActionResult } from '@/src/shared/lib/types'
import type { Country } from '@prisma/client'

export async function updateProfileAction(data: {
  name: string
  email: string
}): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()

    const validation = updateProfileSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const result = await updateUserProfile(user.id, validation.data)

    if (result.success) {
      revalidatePath('/dashboard/profile')
    }

    return result
  } catch (error) {
    console.error('[updateProfileAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el perfil',
    }
  }
}

export async function changePasswordAction(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()

    const validation = changePasswordSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    return await changeUserPassword(
      user.id,
      validation.data.currentPassword,
      validation.data.newPassword
    )
  } catch (error) {
    console.error('[changePasswordAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar la contraseña',
    }
  }
}

export async function updateDocumentAction(data: {
  country: Country
  docNumber: string
}): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()

    const validation = updateDocumentSchema(data.country).safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const result = await updateUserDocument(
      user.id,
      validation.data.country,
      validation.data.docNumber
    )

    if (result.success) {
      revalidatePath('/dashboard/profile')
    }

    return result
  } catch (error) {
    console.error('[updateDocumentAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el documento',
    }
  }
}

export async function getPendingInvitationsAction(): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()
    const invitations = await getPendingInvitations(user.id)
    return { success: true, data: invitations }
  } catch (error) {
    console.error('[getPendingInvitationsAction] Error:', error)
    return { success: false, error: 'Error al obtener invitaciones pendientes.' }
  }
}

export async function acceptInvitationAction(invitationId: string): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()

    const result = await acceptInvitation(invitationId, user.id)

    if (result.success) {
      revalidatePath('/dashboard/profile')
      revalidatePath('/dashboard')
    }

    return result
  } catch (error) {
    console.error('[acceptInvitationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al aceptar la invitación',
    }
  }
}

export async function rejectInvitationAction(invitationId: string): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()

    const result = await rejectInvitation(invitationId, user.id)

    if (result.success) {
      revalidatePath('/dashboard/profile')
    }

    return result
  } catch (error) {
    console.error('[rejectInvitationAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al rechazar la invitación',
    }
  }
}

export async function getUserOrganizationsAction(): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()
    const data = await getUserOrganizations(user.id)
    return { success: true, data }
  } catch (error) {
    console.error('[getUserOrganizationsAction] Error:', error)
    return { success: false, error: 'Error al obtener organizaciones.' }
  }
}
