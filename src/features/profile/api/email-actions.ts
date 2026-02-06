'use server'

import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { prisma } from '@/src/shared/lib/db'
import { validateEmail } from '@/src/shared/lib/validation'
import { handleActionError } from '@/src/shared/lib/utils'

export async function getUserEmailsAction(): Promise<
  ActionResult<Array<{
    id: string
    email: string
    isPrimary: boolean
    isVerified: boolean
    provider: string | null
    createdAt: Date
  }>>
> {
  try {
    const user = await requireAuth()

    const emails = await prisma.userEmail.findMany({
      where: { userId: user.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    return {
      success: true,
      data: emails,
    }
  } catch (error) {
    return handleActionError(error, 'getUserEmailsAction', 'Error al obtener emails')
  }
}

export async function addEmailAction(email: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth()

    if (!validateEmail(email)) 
      return {
        success: false,
        error: 'Email inválido',
      }
    

    const existingEmail = await prisma.userEmail.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingEmail) 
      return {
        success: false,
        error: existingEmail.userId === user.id
          ? 'Este email ya está en tu cuenta'
          : 'Este email ya está en uso por otro usuario',
      }
    

    const existingPrimaryUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingPrimaryUser && existingPrimaryUser.id !== user.id) 
      return {
        success: false,
        error: 'Este email ya está registrado como email principal de otro usuario',
      }
    

    const hasEmails = await prisma.userEmail.count({
      where: { userId: user.id },
    })

    const newEmail = await prisma.userEmail.create({
      data: {
        userId: user.id,
        email: email.toLowerCase().trim(),
        isPrimary: hasEmails === 0,
        isVerified: false,
        provider: 'CREDENTIALS',
      },
    })

    revalidatePath('/dashboard/profile')

    return {
      success: true,
      data: { id: newEmail.id },
      message: 'Email agregado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'addEmailAction', 'Error al agregar email')
  }
}

export async function removeEmailAction(emailId: string): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()

    const email = await prisma.userEmail.findUnique({
      where: { id: emailId },
    })

    if (!email) 
      return {
        success: false,
        error: 'Email no encontrado',
      }
    

    if (email.userId !== user.id) 
      return {
        success: false,
        error: 'No tienes permisos para eliminar este email',
      }
    

    if (email.isPrimary) 
      return {
        success: false,
        error: 'No puedes eliminar tu email principal',
      }
    

    await prisma.userEmail.delete({
      where: { id: emailId },
    })

    revalidatePath('/dashboard/profile')

    return {
      success: true,
      data: null,
      message: 'Email eliminado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'removeEmailAction', 'Error al eliminar email')
  }
}

export async function setPrimaryEmailAction(emailId: string): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()

    const email = await prisma.userEmail.findUnique({
      where: { id: emailId },
    })

    if (!email) 
      return {
        success: false,
        error: 'Email no encontrado',
      }
    

    if (email.userId !== user.id) 
      return {
        success: false,
        error: 'No tienes permisos para modificar este email',
      }
    

    if (email.isPrimary) 
      return {
        success: false,
        error: 'Este email ya es tu email principal',
      }
    

    if (!email.isVerified) 
      return {
        success: false,
        error: 'Debes verificar este email antes de establecerlo como principal',
      }
    

    await prisma.$transaction([
      prisma.userEmail.updateMany({
        where: {
          userId: user.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      }),
      prisma.userEmail.update({
        where: { id: emailId },
        data: {
          isPrimary: true,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          email: email.email,
        },
      }),
    ])

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: null,
      message: 'Email principal actualizado exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'setPrimaryEmailAction', 'Error al establecer email principal')
  }
}
