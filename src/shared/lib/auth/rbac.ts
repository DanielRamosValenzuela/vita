import { Role } from '@prisma/client'

import type { CurrentUser } from './types'

function hasRole(user: CurrentUser | null, role: Role): boolean {
  if (!user) return false
  return user.role === role
}

export function isAdminHR(user: CurrentUser | null): boolean {
  return hasRole(user, Role.ADMIN_HR)
}

export function isChiefArea(user: CurrentUser | null): boolean {
  return hasRole(user, Role.CHIEF_AREA)
}
