'use server'

import { prisma } from '@/src/shared/lib/auth/config'
import { requireAdminHR } from '@/src/shared/lib/auth/session'
import type { ActionResult } from '@/src/shared/lib/types'

interface ShiftUser {
  id: string
  name: string
  email: string
  role: string
}

export const getUsersForShiftsAction = async (): Promise<ActionResult<ShiftUser[]>> => {
  try {
    const session = await requireAdminHR()
    if (!session.organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const users = await prisma.user.findMany({
      where: {
        organizationId: session.organizationId,
        role: {
          in: ['ADMIN_HR', 'CHIEF_AREA', 'STAFF_HEALTH'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    })

    return {
      success: true,
      data: users,
    }
  } catch (error) {
    console.error('[getUsersForShiftsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuarios',
    }
  }
}
