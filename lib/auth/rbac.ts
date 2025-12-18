import { Role } from '@prisma/client'
import type { CurrentUser } from './types'

export function hasRole(user: CurrentUser | null, role: Role): boolean {
  if (!user) return false
  return user.role === role
}

export function isSuperAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, Role.SUPER_ADMIN)
}

export function isAdminHR(user: CurrentUser | null): boolean {
  return hasRole(user, Role.ADMIN_HR)
}

export function isChiefArea(user: CurrentUser | null): boolean {
  return hasRole(user, Role.CHIEF_AREA)
}

export function isStaffHealth(user: CurrentUser | null): boolean {
  return hasRole(user, Role.STAFF_HEALTH)
}

export function canManageOrganization(user: CurrentUser | null): boolean {
  if (!user) return false
  return user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN_HR
}

export function canManageShifts(user: CurrentUser | null): boolean {
  if (!user) return false
  return (
    user.role === Role.SUPER_ADMIN ||
    user.role === Role.ADMIN_HR ||
    user.role === Role.CHIEF_AREA
  )
}

export function canViewShifts(user: CurrentUser | null): boolean {
  if (!user) return false
  return true
}

export function canManageStaff(user: CurrentUser | null): boolean {
  if (!user) return false
  return (
    user.role === Role.SUPER_ADMIN ||
    user.role === Role.ADMIN_HR ||
    user.role === Role.CHIEF_AREA
  )
}

export function canManageRates(user: CurrentUser | null): boolean {
  if (!user) return false
  return user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN_HR
}

