'use server'

import { requireAuth } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'
import { prisma } from '@/src/shared/lib/db'
import { handleActionError } from '@/src/shared/lib/utils'

export async function syncPrimaryEmailAction(): Promise<ActionResult<{ synced: boolean }>> {
  try {
    const user = await requireAuth()

    const existingPrimaryInEmails = await prisma.userEmail.findFirst({
      where: {
        userId: user.id,
        email: user.email,
      },
    })

    if (existingPrimaryInEmails) {
      if (!existingPrimaryInEmails.isPrimary)
        await prisma.userEmail.update({
          where: { id: existingPrimaryInEmails.id },
          data: { isPrimary: true },
        })

      return {
        success: true,
        data: { synced: false },
      }
    }

    const hasOtherPrimary = await prisma.userEmail.findFirst({
      where: {
        userId: user.id,
        isPrimary: true,
      },
    })

    if (hasOtherPrimary)
      await prisma.userEmail.update({
        where: { id: hasOtherPrimary.id },
        data: { isPrimary: false },
      })

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'google',
      },
    })

    await prisma.userEmail.create({
      data: {
        userId: user.id,
        email: user.email,
        isPrimary: true,
        isVerified: !!account,
        provider: account ? 'GOOGLE' : 'CREDENTIALS',
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
