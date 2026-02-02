import { Country } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from '@/src/shared/lib/db'
import { INVITATION_STATUS } from '@/src/shared/lib/constants'
import type { ActionResult } from '@/src/shared/lib/types'
import {
  acceptInvitation as acceptInvitationEntity,
  getPendingInvitationsForUser,
  rejectInvitation as rejectInvitationEntity,
} from '@/src/entities/invitation'

export async function updateUserProfile(
  userId: string,
  data: { name: string; email: string }
): Promise<ActionResult<unknown>> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) 
      return { success: false, error: 'Usuario no encontrado' }
    

    if (data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (emailExists) 
        return { success: false, error: 'Este email ya está en uso' }
      
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[updateUserProfile] Error:', error)
    return { success: false, error: 'Error al actualizar el perfil' }
  }
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ActionResult<unknown>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: { provider: 'credentials' },
        },
      },
    })

    if (!user) 
      return { success: false, error: 'Usuario no encontrado' }
    

    const credentialsAccount = user.accounts[0]

    if (!credentialsAccount) 
      return { success: false, error: 'No se encontró cuenta con credenciales' }
    

    if (!credentialsAccount.access_token) 
      return { success: false, error: 'No se encontró contraseña almacenada' }
    

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      credentialsAccount.access_token
    )

    if (!isCurrentPasswordValid) 
      return { success: false, error: 'La contraseña actual es incorrecta' }
    

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.account.update({
      where: { id: credentialsAccount.id },
      data: {
        access_token: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[changeUserPassword] Error:', error)
    return { success: false, error: 'Error al cambiar la contraseña' }
  }
}

export async function updateUserDocument(
  userId: string,
  country: Country,
  docNumber: string
): Promise<ActionResult<unknown>> {
  try {
    const cleanDocNumber = docNumber.replace(/[^0-9A-Za-z]/g, '')

    const existingDoc = await prisma.user.findFirst({
      where: {
        country,
        docNumber: cleanDocNumber,
        id: { not: userId },
      },
    })

    if (existingDoc) 
      return { success: false, error: 'Este número de documento ya está en uso' }
    

    await prisma.user.update({
      where: { id: userId },
      data: {
        country,
        docNumber: cleanDocNumber,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[updateUserDocument] Error:', error)
    return { success: false, error: 'Error al actualizar el número de documento' }
  }
}

export async function getPendingInvitations(userId: string) {
  return await getPendingInvitationsForUser(userId)
}

export async function acceptInvitation(invitationId: string, userId: string) {
  return await acceptInvitationEntity(invitationId, userId)
}

export async function rejectInvitation(invitationId: string, userId: string) {
  return await rejectInvitationEntity(invitationId, userId)
}

export async function getUserOrganizations(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          taxId: true,
          status: true,
        },
      },
      invitations: {
        where: {
          status: INVITATION_STATUS.ACCEPTED,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              taxId: true,
              status: true,
            },
          },
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      },
    },
  })
}
