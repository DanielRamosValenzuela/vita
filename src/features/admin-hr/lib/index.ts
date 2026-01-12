import type { Area, ShiftType, Rate } from '@/src/shared/lib/types'

export interface AdminHRDashboardStats {
  totalAreas: number
  totalShiftTypes: number
  totalStaff: number
  totalRates: number
  activeShifts: number
}

export type { Area, ShiftType, Rate }
export * from './schemas'
export * from './area-helpers'
export * from './types'
