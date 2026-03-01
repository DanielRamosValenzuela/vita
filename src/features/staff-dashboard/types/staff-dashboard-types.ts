import type { ShiftStatus } from '@prisma/client'

export interface PersonnelShift {
  id: string
  userId: string
  userName: string
  shiftTypeName: string
  shiftTypeColor: string
  startTime: Date
  endTime: Date
  status: ShiftStatus
  isExtra: boolean
  relay?: {
    type: 'incoming' | 'outgoing'
    userId: string
    userName: string
  }
}

export interface SectorAreaPersonnel {
  area: { id: string; name: string; icon: string; color: string }
  shifts: PersonnelShift[]
}

export interface SectorPersonnelResult {
  shift: {
    id: string
    startTime: Date
    endTime: Date
    status: ShiftStatus
    area: { id: string; name: string; color: string; icon: string }
    shiftType: { name: string; color: string }
    isExtra: boolean
    rotation?: { name: string } | null
  }
  sector: {
    id: string
    name: string
    color: string
  } | null
  areas: SectorAreaPersonnel[]
  totalStaff: number
}

export interface FeedTokenInfo {
  id: string
  organizationId: string | null
  organizationName: string | null
  feedUrl: string
  isActive: boolean
  createdAt: Date
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  startTime: Date
  endTime: Date
  isAllDay: boolean
  color?: string
}
