import type { Role } from '@prisma/client'

import { ROLES } from '@/src/shared/lib/constants'

export interface RoleDisplayMeta {
  icon: string
  color: string
  translationKey: string
}

export function getRoleDisplayMeta(role: Role): RoleDisplayMeta {
  switch (role) {
    case ROLES.ADMIN_HR:
      return { icon: '👔', color: 'blue', translationKey: 'roles.ADMIN_HR' }
    case ROLES.CHIEF_AREA:
      return { icon: '🏥', color: 'green', translationKey: 'roles.CHIEF_AREA' }
    case ROLES.STAFF_HEALTH:
      return { icon: '⚕️', color: 'purple', translationKey: 'roles.STAFF_HEALTH' }
    default:
      return { icon: '❓', color: 'gray', translationKey: 'roles.unknown' }
  }
}

export interface UsageBadgeInput {
  isOverLimit: boolean
  isAtLimit: boolean
  isNearLimit: boolean
}

export function getUsageBadgeVariant(
  usage: UsageBadgeInput
): 'destructive' | 'secondary' | 'outline' {
  if (usage.isOverLimit) return 'destructive'
  if (usage.isAtLimit) return 'destructive'
  if (usage.isNearLimit) return 'secondary'
  return 'outline'
}
