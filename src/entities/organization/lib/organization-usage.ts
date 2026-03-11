import type { Role } from '@prisma/client'

import { ROLES } from '@/src/shared/lib/constants'
import { prisma } from '@/src/shared/lib/db'

interface RoleUsage {
  role: Role
  currentCount: number
  maxLimit: number
  usagePercentage: number
  canAddMore: boolean
  isNearLimit: boolean
  isAtLimit: boolean
  isOverLimit: boolean
}

interface OrganizationUsageSummary {
  totalUsers: number
  totalLimit: number
  usagePercentage: number
  roleUsage: RoleUsage[]
  hasWarnings: boolean
  hasCriticals: boolean
}

export async function getOrganizationUsageSummary(
  organizationId: string
): Promise<OrganizationUsageSummary> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      maxAdminHR: true,
      maxChiefs: true,
      maxStaff: true,
      users: {
        select: {
          role: true,
        },
      },
    },
  })

  if (!organization) throw new Error('Organization not found')

  const userCounts = organization.users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<Role, number>
  )

  const roles: Role[] = [ROLES.ADMIN_HR, ROLES.CHIEF_AREA, ROLES.STAFF]
  const roleUsage: RoleUsage[] = []

  for (const role of roles) {
    const currentCount = userCounts[role] || 0
    let maxLimit: number

    switch (role) {
      case ROLES.ADMIN_HR:
        maxLimit = organization.maxAdminHR
        break
      case ROLES.CHIEF_AREA:
        maxLimit = organization.maxChiefs
        break
      case ROLES.STAFF:
        maxLimit = organization.maxStaff
        break
      default:
        continue
    }

    const usagePercentage = maxLimit > 0 ? (currentCount / maxLimit) * 100 : 0
    const canAddMore = currentCount < maxLimit
    const isNearLimit = usagePercentage >= 80 && usagePercentage < 100
    const isAtLimit = usagePercentage >= 100
    const isOverLimit = usagePercentage > 100

    roleUsage.push({
      role,
      currentCount,
      maxLimit,
      usagePercentage,
      canAddMore,
      isNearLimit,
      isAtLimit,
      isOverLimit,
    })
  }

  const totalUsers = Object.values(userCounts).reduce((sum, count) => sum + count, 0)
  const totalLimit = organization.maxAdminHR + organization.maxChiefs + organization.maxStaff
  const usagePercentage = totalLimit > 0 ? (totalUsers / totalLimit) * 100 : 0

  const hasWarnings = roleUsage.some((usage) => usage.isNearLimit)
  const hasCriticals = roleUsage.some((usage) => usage.isAtLimit || usage.isOverLimit)

  return {
    totalUsers,
    totalLimit,
    usagePercentage,
    roleUsage,
    hasWarnings,
    hasCriticals,
  }
}
