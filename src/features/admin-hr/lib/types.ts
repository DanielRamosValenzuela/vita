import type { Area, Rate, ShiftType } from '@/src/shared/lib/types'

export interface AdminHRDashboardStats {
  totalAreas: number
  totalShiftTypes: number
  totalStaff: number
  totalRates: number
  activeShifts: number
}

export type { Area, ShiftType, Rate }

export type CreateAreaInput = {
  name: string
  description?: string
  isActive: boolean
}

export type UpdateAreaInput = {
  name?: string
  description?: string
  isActive?: boolean
}
