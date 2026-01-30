import { ROLES } from '@/src/shared/lib/constants'

export interface UserCountsByRole {
  ADMIN_HR: number
  CHIEF_AREA: number
  STAFF_HEALTH: number
}

export function countUsersByRole(users: Array<{ role: string }>): UserCountsByRole {
  const counts: UserCountsByRole = {
    ADMIN_HR: 0,
    CHIEF_AREA: 0,
    STAFF_HEALTH: 0,
  }

  users.forEach((user) => {
    if (user.role === ROLES.ADMIN_HR) counts.ADMIN_HR++
    else if (user.role === ROLES.CHIEF_AREA) counts.CHIEF_AREA++
    else if (user.role === ROLES.STAFF_HEALTH) counts.STAFF_HEALTH++
  })

  return counts
}
