import type { Role } from '@prisma/client'

import { prisma } from '@/src/shared/lib/auth/config'
import { ROLES } from '@/src/shared/lib/constants'

interface LimitAlert {
  organizationId: string
  organizationName: string
  role: Role
  currentCount: number
  maxLimit: number
  usagePercentage: number
  alertType: 'warning' | 'critical'
  message: string
}

interface UsageSummary {
  totalOrganizations: number
  organizationsWithWarnings: number
  organizationsWithCriticals: number
  alerts: LimitAlert[]
}

export async function getOrganizationsWithLimitAlerts(): Promise<UsageSummary> {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
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

  const alerts: LimitAlert[] = []
  let organizationsWithWarnings = 0
  let organizationsWithCriticals = 0

  for (const organization of organizations) {
    const userCounts = organization.users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<Role, number>
    )

    const roles: Array<{ role: Role; maxLimit: number }> = [
      { role: ROLES.ADMIN_HR, maxLimit: organization.maxAdminHR },
      { role: ROLES.CHIEF_AREA, maxLimit: organization.maxChiefs },
      { role: ROLES.STAFF_HEALTH, maxLimit: organization.maxStaff },
    ]

    let hasWarning = false
    let hasCritical = false

    for (const { role, maxLimit } of roles) {
      const currentCount = userCounts[role] || 0

      if (maxLimit === 0) continue

      const usagePercentage = (currentCount / maxLimit) * 100

      if (usagePercentage >= 100) {
        hasCritical = true
        alerts.push({
          organizationId: organization.id,
          organizationName: organization.name,
          role,
          currentCount,
          maxLimit,
          usagePercentage,
          alertType: 'critical',
          message: `${organization.name} ha alcanzado el límite de ${currentCount}/${maxLimit} para ${getRoleLabel(role)}`,
        })
      } else if (usagePercentage >= 80) {
        hasWarning = true
        alerts.push({
          organizationId: organization.id,
          organizationName: organization.name,
          role,
          currentCount,
          maxLimit,
          usagePercentage,
          alertType: 'warning',
          message: `${organization.name} está cerca del límite con ${currentCount}/${maxLimit} (${usagePercentage.toFixed(1)}%) para ${getRoleLabel(role)}`,
        })
      }
    }

    if (hasWarning) organizationsWithWarnings++
    if (hasCritical) organizationsWithCriticals++
  }

  return {
    totalOrganizations: organizations.length,
    organizationsWithWarnings,
    organizationsWithCriticals,
    alerts,
  }
}

function getRoleLabel(role: Role): string {
  switch (role) {
    case ROLES.ADMIN_HR:
      return 'Administradores RRHH'
    case ROLES.CHIEF_AREA:
      return 'Jefes de Área'
    case ROLES.STAFF_HEALTH:
      return 'Personal de Salud'
    default:
      return 'Desconocido'
  }
}

export async function getOrganizationLimitAlerts(organizationId: string): Promise<LimitAlert[]> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
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

  if (!organization) return []

  const userCounts = organization.users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<Role, number>
  )

  const alerts: LimitAlert[] = []

  const roles: Array<{ role: Role; maxLimit: number }> = [
    { role: ROLES.ADMIN_HR, maxLimit: organization.maxAdminHR },
    { role: ROLES.CHIEF_AREA, maxLimit: organization.maxChiefs },
    { role: ROLES.STAFF_HEALTH, maxLimit: organization.maxStaff },
  ]

  for (const { role, maxLimit } of roles) {
    const currentCount = userCounts[role] || 0

    if (maxLimit === 0) continue

    const usagePercentage = (currentCount / maxLimit) * 100

    if (usagePercentage >= 80) 
      alerts.push({
        organizationId: organization.id,
        organizationName: organization.name,
        role,
        currentCount,
        maxLimit,
        usagePercentage,
        alertType: usagePercentage >= 100 ? 'critical' : 'warning',
        message: `${usagePercentage >= 100 ? 'Límite alcanzado' : 'Cerca del límite'}: ${currentCount}/${maxLimit} para ${getRoleLabel(role)}`,
      })
    
  }

  return alerts.sort((a, b) => b.usagePercentage - a.usagePercentage)
}
