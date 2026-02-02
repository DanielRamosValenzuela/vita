import type { Area, ShiftType } from '@/src/shared/lib/types'

export interface AdminHRDashboardStats {
  totalAreas: number
  totalShiftTypes: number
  totalStaff: number
  totalContracts: number
  activeShifts: number
}

export type { Area, ShiftType }

export type CreateAreaInput = {
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
}

export type UpdateAreaInput = {
  name?: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  maxConsecutiveHours?: number | null
  minRestHours?: number | null
}
