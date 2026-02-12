'use server'

import { EmailProvider } from '@prisma/client'

import { requireAuth } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'
import { AUTH_PROVIDERS } from '@/src/shared/lib/constants'

export async function syncPrimaryEmailAction(): Promise<ActionResult<{ synced: boolean }>> {
  try {
    const user = await requireAuth()

    const existingEmail = await prisma.userEmail.findFirst({
      where: {
        userId: user.id,
        email: user.email,
      },
    })

    if (existingEmail?.isPrimary)
      return {
        success: true,
        data: { synced: false },
      }

    if (existingEmail && !existingEmail.isPrimary) {
      await prisma.$transaction([
        prisma.userEmail.updateMany({
          where: {
            userId: user.id,
            isPrimary: true,
            NOT: { id: existingEmail.id },
          },
          data: { isPrimary: false },
        }),
        prisma.userEmail.update({
          where: { id: existingEmail.id },
          data: { isPrimary: true },
        }),
      ])

      return {
        success: true,
        data: { synced: false },
      }
    }

    const currentPrimary = await prisma.userEmail.findFirst({
      where: {
        userId: user.id,
        isPrimary: true,
      },
    })

    if (currentPrimary)
      await prisma.userEmail.update({
        where: { id: currentPrimary.id },
        data: { isPrimary: false },
      })

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: AUTH_PROVIDERS.GOOGLE,
      },
    })

    await prisma.userEmail.create({
      data: {
        userId: user.id,
        email: user.email,
        isPrimary: true,
        isVerified: !!account,
        provider: account ? EmailProvider.GOOGLE : EmailProvider.CREDENTIALS,
      },
    })

    return {
      success: true,
      data: { synced: true },
      message: 'Email principal sincronizado',
    }
  } catch (error) {
    return handleActionError(error, 'syncPrimaryEmailAction', 'Error al sincronizar email principal')
  }
}
