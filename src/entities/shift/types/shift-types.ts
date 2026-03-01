import type { Shift } from '@prisma/client'

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
  rotation?: {
    id: string
    name: string
  } | null
}
