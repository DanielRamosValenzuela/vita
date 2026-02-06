'use server'

import { env } from '@/src/shared/config'
import { requireAuth } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'

export async function initiateGoogleLinkAction(
  emailId: string
): Promise<ActionResult<{ authUrl: string }>> {
  try {
    const user = await requireAuth()

    const userEmail = await prisma.userEmail.findUnique({
      where: { id: emailId },
    })

    if (!userEmail)
      return {
        success: false,
        error: 'Email no encontrado',
      }

    if (userEmail.userId !== user.id)
      return {
        success: false,
        error: 'No tienes permisos para vincular este email',
      }

    if (userEmail.provider === 'GOOGLE' && userEmail.isVerified)
      return {
        success: false,
        error: 'Este email ya está vinculado con Google',
      }

    if (!userEmail.email.endsWith('@gmail.com'))
      return {
        success: false,
        error: 'Solo puedes vincular emails de Gmail',
      }

    const state = Buffer.from(JSON.stringify({ emailId, userId: user.id })).toString('base64')

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_LINK_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    })

    return {
      success: true,
      data: {
        authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      },
    }
  } catch (error) {
    return handleActionError(error, 'initiateGoogleLinkAction', 'Error al iniciar vinculación con Google')
  }
}

export async function unlinkGoogleAction(emailId: string): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()

    const userEmail = await prisma.userEmail.findUnique({
      where: { id: emailId },
    })

    if (!userEmail)
      return {
        success: false,
        error: 'Email no encontrado',
      }

    if (userEmail.userId !== user.id)
      return {
        success: false,
        error: 'No tienes permisos para desvincular este email',
      }

    if (userEmail.provider !== 'GOOGLE')
      return {
        success: false,
        error: 'Este email no está vinculado con Google',
      }

    await prisma.userEmail.update({
      where: { id: emailId },
      data: {
        provider: 'CREDENTIALS',
        isVerified: false,
      },
    })

    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'google',
        providerAccountId: userEmail.email,
      },
    })

    if (googleAccount)
      await prisma.account.delete({
        where: { id: googleAccount.id },
      })

    return {
      success: true,
      data: null,
      message: 'Vinculación con Google eliminada exitosamente',
    }
  } catch (error) {
    return handleActionError(error, 'unlinkGoogleAction', 'Error al desvincular Google')
  }
}

export async function checkGoogleLinkStatusAction(
  emailId: string
): Promise<ActionResult<{ canLink: boolean; reason?: string }>> {
  try {
    const user = await requireAuth()

    const userEmail = await prisma.userEmail.findUnique({
      where: { id: emailId },
    })

    if (!userEmail || userEmail.userId !== user.id)
      return {
        success: true,
        data: { canLink: false, reason: 'Email no encontrado' },
      }

    if (!userEmail.email.endsWith('@gmail.com'))
      return {
        success: true,
        data: { canLink: false, reason: 'No es email de Gmail' },
      }

    if (userEmail.provider === 'GOOGLE' && userEmail.isVerified)
      return {
        success: true,
        data: { canLink: false, reason: 'Ya vinculado' },
      }

    return {
      success: true,
      data: { canLink: true },
    }
  } catch (error) {
    return handleActionError(error, 'checkGoogleLinkStatusAction', 'Error al verificar estado de vinculación')
  }
}
