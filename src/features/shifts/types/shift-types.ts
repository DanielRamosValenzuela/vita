import type { Shift, ShiftStatus } from '@prisma/client'

export interface ShiftWithRelations extends Shift {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  area: {
    id: string
    name: string
    description?: string | null
  }
  shiftType: {
    id: string
    name: string
    color: string
    icon?: string | null
  }
}

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

export interface UpdateShiftData {
  title?: string
  status?: ShiftStatus
  userId?: string
  areaId?: string
  shiftTypeId?: string
  startTime?: Date
  endTime?: Date
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
