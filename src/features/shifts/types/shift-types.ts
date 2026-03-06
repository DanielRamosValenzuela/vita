import type { ShiftStatus } from '@prisma/client'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'

export type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'

export interface CreateShiftFormData {
  title?: string
  userId: string
  areaId: string
  shiftTypeId: string
  startDate: Date
  startTime: string
  endDate?: string
  endTime: string
  notes?: string
}

export interface CreateShiftData {
  title?: string
  userId: string
  areaId: string
  shiftTypeId: string
  startTime: Date
  endTime: Date
  notes?: string
}

export interface GetShiftsParams {
  page?: number
  pageSize?: number
  status?: ShiftStatus | ''
  userId?: string | ''
  areaId?: string | ''
  shiftTypeId?: string | ''
  search?: string
  startDate?: Date
  endDate?: Date
}

export interface GetShiftsResult {
  shifts: ShiftWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
