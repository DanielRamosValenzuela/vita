import { ShiftStatus } from '@prisma/client'

export const SHIFT_STATUS = {
  SCHEDULED: 'SCHEDULED' as ShiftStatus,
  IN_PROGRESS: 'IN_PROGRESS' as ShiftStatus,
  COMPLETED: 'COMPLETED' as ShiftStatus,
  CANCELLED: 'CANCELLED' as ShiftStatus,
  NO_SHOW: 'NO_SHOW' as ShiftStatus,
} as const
