import { ShiftStatus } from '@prisma/client'

export const SHIFT_STATUS = {
  SCHEDULED: 'SCHEDULED' as ShiftStatus,
  IN_PROGRESS: 'IN_PROGRESS' as ShiftStatus,
  COMPLETED: 'COMPLETED' as ShiftStatus,
  CANCELLED: 'CANCELLED' as ShiftStatus,
  NO_SHOW: 'NO_SHOW' as ShiftStatus,
} as const

export const SHIFT_STATUS_COLORS: Record<ShiftStatus, string> = {
  SCHEDULED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
}

export const SHIFT_STATUS_COLORS_HOVER: Record<ShiftStatus, string> = {
  SCHEDULED: 'bg-green-100 text-green-800 hover:bg-green-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  COMPLETED: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
  NO_SHOW: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
}

export const SHIFT_STATUS_I18N_KEYS: Record<ShiftStatus, string> = {
  SCHEDULED: 'status.scheduled',
  IN_PROGRESS: 'status.inProgress',
  COMPLETED: 'status.completed',
  CANCELLED: 'status.cancelled',
  NO_SHOW: 'status.noShow',
}
