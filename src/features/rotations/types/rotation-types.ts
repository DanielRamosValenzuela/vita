import type { RotationStatus } from '@prisma/client'

export type RotationWithRelations = {
  id: string
  name: string
  description: string | null
  status: RotationStatus
  startDate: Date | null
  areaId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  area: {
    id: string
    name: string
    description: string | null
  }
  steps: Array<{
    id: string
    order: number
    isRestDay: boolean
    shiftType: {
      id: string
      name: string
      color: string
      icon: string | null
    } | null
  }>
  shiftConfigs: Array<{
    id: string
    shiftTypeId: string
    startTime: string
    shiftType: {
      id: string
      name: string
    }
  }>
  groups: Array<{
    id: string
    name: string
    color: string
    icon: string | null
    cycleOffset: number
    members: Array<{
      id: string
      userId: string
      joinedAt: Date
      user: {
        id: string
        name: string
        email: string
      }
    }>
    _count: {
      members: number
    }
  }>
}

export type RotationListItem = {
  id: string
  name: string
  status: RotationStatus
  area: {
    id: string
    name: string
  }
  _count: {
    groups: number
    shifts: number
  }
  patternSummary: string
  totalMembers: number
  createdAt: Date
}

export type GetRotationsParams = {
  page?: number
  pageSize?: number
  areaId?: string
  status?: RotationStatus
  search?: string
}

export type GetRotationsResult = {
  rotations: RotationListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ShiftConflict = {
  userId: string
  userName: string
  date: Date
  existingShift: {
    id: string
    shiftType: string
    startTime: Date
    endTime: Date
  }
  proposedShift: {
    shiftType: string
    startTime: Date
    endTime: Date
  }
}

export type GenerationPreview = {
  totalShiftsToCreate: number
  shiftsPerGroup: Array<{
    groupId: string
    groupName: string
    shiftCount: number
  }>
  conflicts: ShiftConflict[]
  dateRange: {
    start: Date
    end: Date
  }
  daysInRange: number
}

export type GenerationResult = {
  shiftsCreated: number
  shiftsSkipped: number
  conflictsDetected: number
  notificationsSent: number
}

export type CoverageDay = {
  date: Date
  groups: Array<{
    groupId: string
    groupName: string
    stepType: 'shift' | 'rest'
    shiftType?: {
      id: string
      name: string
      color: string
    }
    memberCount: number
    minStaffRequired: number
    isUnderstaffed: boolean
    hasGeneratedShifts: boolean
  }>
  totalOnDuty: number
  hasGap: boolean
}

export type CoverageAlert = {
  type: 'coverage_expiring' | 'understaffed' | 'gap'
  message: string
  date?: Date
  severity: 'warning' | 'error'
}

export type CoverageOverview = {
  rotationId: string
  rotationName: string
  days: CoverageDay[]
  dateRange: {
    start: Date
    end: Date
  }
  alerts: CoverageAlert[]
}

export type ExtraTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'NEVER_RECOMMEND'

export type CandidateWarning = {
  type:
    | 'max_consecutive_hours'
    | 'min_rest_hours'
    | 'noche_to_largo'
    | 'came_from_noche'
  message: string
  severity: 'warning' | 'error'
}

export type ExtraCandidate = {
  userId: string
  userName: string
  userEmail: string
  tier: ExtraTier
  tierLabel: string
  isFromSameArea: boolean
  currentStatus:
    | 'on_largo'
    | 'on_noche'
    | 'libre_rested'
    | 'libre_from_noche'
    | 'other'
  previousShift?: {
    shiftTypeName: string
    endTime: Date
  }
  currentShift?: {
    shiftTypeName: string
    startTime: Date
    endTime: Date
  }
  warnings: CandidateWarning[]
  areas: Array<{
    id: string
    name: string
  }>
}

export type GetExtraCandidatesResult = {
  candidates: ExtraCandidate[]
  totalAvailable: number
  understaffingGap: number
  shiftType: {
    id: string
    name: string
    minStaffRequired: number
    currentStaffCount: number
  }
}
