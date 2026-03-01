import { Role } from '@prisma/client'

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN' as Role,
  ADMIN_HR: 'ADMIN_HR' as Role,
  CHIEF_AREA: 'CHIEF_AREA' as Role,
  CHIEF_SECTOR: 'CHIEF_SECTOR' as Role,
  STAFF: 'STAFF' as Role,
} as const
