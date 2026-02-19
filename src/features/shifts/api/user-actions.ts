'use server'

import { isChiefArea } from '@/src/shared/lib/auth/rbac'
import { requireAdminHROrChiefArea } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import type { ActionResult } from '@/src/shared/lib/types'

interface ShiftUser {
  id: string
  name: string
  email: string
  role: string
  areaIds?: string[]
}

export const getUsersForShiftsAction = async (): Promise<ActionResult<ShiftUser[]>> => {
  try {
    const session = await requireAdminHROrChiefArea()
    let organizationId: string | null = session.organizationId ?? null
    if (isChiefArea(session) && !organizationId) {
      const firstArea = await prisma.userArea.findFirst({
        where: { userId: session.id },
        select: { area: { select: { organizationId: true } } },
      })
      organizationId = firstArea?.area?.organizationId ?? null
    }
    if (!organizationId)
      return {
        success: false,
        error: 'No tienes una organización asignada',
      }

    const users = await prisma.user.findMany({
      where: {
        organizationId,
        role: {
          in: ['ADMIN_HR', 'CHIEF_AREA', 'STAFF_HEALTH'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        userAreas: { select: { areaId: true } },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    })

    const data: ShiftUser[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      ...(u.role === 'STAFF_HEALTH' && {
        areaIds: u.userAreas.map((ua) => ua.areaId),
      }),
    }))

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('[getUsersForShiftsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuarios',
    }
  }
}
