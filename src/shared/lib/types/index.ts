export interface Area {
  id: string
  name: string
  description: string | null
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface ShiftType {
  id: string
  name: string
  duration: number
  classification: 'DAY' | 'NIGHT' | 'MIXED'
  color: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Rate {
  id: string
  name: string
  dayHourlyRate: number
  nightHourlyRate: number
  weekendMultiplier: number
  holidayMultiplier: number
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
