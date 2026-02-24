/**
 * Server Action Contracts: Shift Generation + Coverage
 *
 * These are type signatures and Zod schemas only.
 * Implementation goes in src/features/rotations/api/generation-actions.ts
 *
 * Auth: requireAdminHROrChiefArea() for all actions
 * Multi-tenant: organizationId derived from session
 * Area access: CHIEF_AREA verified via UserArea
 */

import { z } from 'zod'
import type { ActionResult } from '@/src/shared/lib/types'

// ============================================================
// Zod Schemas
// ============================================================

export const generateShiftsSchema = z.object({
  rotationId: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  overrideConflicts: z.boolean().default(false),
})

export const previewGenerationSchema = z.object({
  rotationId: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
})

export const regenerateShiftsSchema = z.object({
  rotationId: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  replaceExisting: z.boolean().default(false), // true = delete old generated shifts in range first
})

// ============================================================
// Types
// ============================================================

/** Conflict detail for preview */
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

/** Preview of what generation would produce */
export type GenerationPreview = {
  totalShiftsToCreate: number
  shiftsPerGroup: Array<{
    groupId: string
    groupName: string
    shiftCount: number
  }>
  conflicts: ShiftConflict[]
  dateRange: { start: Date; end: Date }
  daysInRange: number
}

/** Generation result summary */
export type GenerationResult = {
  shiftsCreated: number
  shiftsSkipped: number // due to conflicts (when overrideConflicts=false)
  conflictsDetected: number
  notificationsSent: number
}

/** Coverage data for the overview grid */
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
  hasGap: boolean // no group has a shift this day
}

export type CoverageOverview = {
  rotationId: string
  rotationName: string
  days: CoverageDay[]
  dateRange: { start: Date; end: Date }
  alerts: CoverageAlert[]
}

export type CoverageAlert = {
  type: 'coverage_expiring' | 'understaffed' | 'gap'
  message: string
  date?: Date
  severity: 'warning' | 'error'
}

// ============================================================
// Action Signatures
// ============================================================

/** Preview generation: show what shifts would be created + conflicts */
export declare function previewGenerationAction(
  data: z.infer<typeof previewGenerationSchema>
): Promise<ActionResult<GenerationPreview>>

/** Generate shifts for a rotation over a date range */
export declare function generateShiftsAction(
  data: z.infer<typeof generateShiftsSchema>
): Promise<ActionResult<GenerationResult>>

/** Regenerate: optionally replace existing generated shifts in range */
export declare function regenerateShiftsAction(
  data: z.infer<typeof regenerateShiftsSchema>
): Promise<ActionResult<GenerationResult>>

/** Get coverage overview for a rotation (calendar grid data) */
export declare function getCoverageOverviewAction(
  rotationId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResult<CoverageOverview>>

/** Check if any active rotation has expiring coverage (for proactive alerts) */
export declare function checkCoverageAlertsAction(
  areaId?: string
): Promise<ActionResult<CoverageAlert[]>>
