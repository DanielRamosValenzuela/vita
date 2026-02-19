'use server'

import { revalidatePath } from 'next/cache'
import type { Country } from '@prisma/client'

import { requireAuth } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils'
import { getLocaleFromHeaders } from '@/src/shared/lib/utils/get-locale'

import {
  acceptInvitation,
  changeUserPassword,
  getPendingInvitations,
  getUserOrganizations,
  rejectInvitation,
  updateUserDocument,
} from '../data/profile-repository'
import {
  getChangePasswordSchema,
  getUpdateDocumentSchema,
} from '../lib/schemas'

export async function changePasswordAction(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()
    const locale = await getLocaleFromHeaders()
    const changePasswordSchema = await getChangePasswordSchema(locale)

    const validation = changePasswordSchema.safeParse(data)
    if (!validation.success)
      return {
        success: false,
        error: validation.error.issues[0].message,
      }

    return await changeUserPassword(
      user.id,
      validation.data.currentPassword,
      validation.data.newPassword
    )
  } catch (error) {
    return handleActionError(error, 'changePasswordAction', 'Error al cambiar la contraseña')
  }
}

export async function updateDocumentAction(data: {
  country: Country
  docNumber: string
}): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()
    const locale = await getLocaleFromHeaders()
    const updateDocumentSchema = await getUpdateDocumentSchema(locale, data.country)

    const validation = updateDocumentSchema.safeParse(data)
    if (!validation.success)
      return {
        success: false,
        error: validation.error.issues[0].message,
      }

    const result = await updateUserDocument(
      user.id,
      validation.data.country,
      validation.data.docNumber
    )

    if (result.success) revalidatePath('/dashboard/profile')

    return result
  } catch (error) {
    return handleActionError(error, 'updateDocumentAction', 'Error al actualizar el documento')
  }
}

export async function getPendingInvitationsAction(): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()
    const invitations = await getPendingInvitations(user.id)
    return { success: true, data: invitations }
  } catch (error) {
    return handleActionError(
      error,
      'getPendingInvitationsAction',
      'Error al obtener invitaciones pendientes'
    )
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
    return handleActionError(error, 'acceptInvitationAction', 'Error al aceptar la invitación')
  }
}

export async function rejectInvitationAction(invitationId: string): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()

    const result = await rejectInvitation(invitationId, user.id)

    if (result.success) revalidatePath('/dashboard/profile')

    return result
  } catch (error) {
    return handleActionError(error, 'rejectInvitationAction', 'Error al rechazar la invitación')
  }
}

export async function getUserOrganizationsAction(): Promise<ActionResult<unknown>> {
  try {
    const user = await requireAuth()
    const data = await getUserOrganizations(user.id)
    return { success: true, data }
  } catch (error) {
    return handleActionError(error, 'getUserOrganizationsAction', 'Error al obtener organizaciones')
  }
}
