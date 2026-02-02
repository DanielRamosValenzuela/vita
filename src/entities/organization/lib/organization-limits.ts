import type { Role } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'
import { ROLES } from '@/src/shared/lib/constants'

interface LimitCheckResult {
  success: boolean
  currentCount?: number
  maxLimit?: number
  canAddMore?: boolean
  error?: string
}

export async function checkOrganizationRoleLimit(
  organizationId: string,
  role: Role
): Promise<LimitCheckResult> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      maxAdminHR: true,
      maxChiefs: true,
      maxStaff: true,
      _count: {
        select: {
          users: {
            where: {
              role,
            },
          },
        },
      },
    },
  })

  if (!organization) return { success: false, error: 'Organization not found' }

  let maxLimit: number
  switch (role) {
    case ROLES.ADMIN_HR:
      maxLimit = organization.maxAdminHR
      break
    case ROLES.CHIEF_AREA:
      maxLimit = organization.maxChiefs
      break
    case ROLES.STAFF_HEALTH:
      maxLimit = organization.maxStaff
      break
    default:
      return { success: false, error: 'Invalid role for limit check' }
  }

  const currentCount = organization._count.users

  return {
    success: true,
    currentCount,
    maxLimit,
    canAddMore: currentCount < maxLimit,
  }
}
