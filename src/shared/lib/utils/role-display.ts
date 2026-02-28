import type { Role } from '@prisma/client'

import { ROLES } from '@/src/shared/lib/constants'

interface RoleDisplayMeta {
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
    case ROLES.CHIEF_SECTOR:
      return { icon: '🏥', color: 'teal', translationKey: 'roles.CHIEF_SECTOR' }
    case ROLES.STAFF:
      return { icon: '⚕️', color: 'purple', translationKey: 'roles.STAFF' }
    default:
      return { icon: '❓', color: 'gray', translationKey: 'roles.unknown' }
  }
}

interface UsageBadgeInput {
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
