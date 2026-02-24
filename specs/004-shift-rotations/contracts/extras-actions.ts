/**
 * Server Action Contracts: Extra Shift Candidates + Assignment
 *
 * These are type signatures and Zod schemas only.
 * Implementation goes in src/features/rotations/api/extras-actions.ts
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

export const getExtraCandidatesSchema = z.object({
  areaId: z.string().min(1),
  date: z.date(),
  shiftTypeId: z.string().min(1), // the "extra" shift type to fill (e.g., "Largo Extra")
  rotationGroupId: z.string().optional(), // the understaffed group (to exclude its members)
})

export const assignExtraShiftSchema = z.object({
  userId: z.string().min(1),
  areaId: z.string().min(1),
  shiftTypeId: z.string().min(1), // extra shift type (e.g., "Noche Extra")
  startTime: z.date(),
  endTime: z.date(),
  rotationId: z.string().optional(), // link to source rotation for context
  notes: z.string().optional(),
})

// ============================================================
// Types
// ============================================================

/** Recommendation tier for extra candidates */
export type ExtraTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'NEVER_RECOMMEND'

/** Warning about a candidate's assignment */
export type CandidateWarning = {
  type: 'max_consecutive_hours' | 'min_rest_hours' | 'noche_to_largo' | 'came_from_noche'
  message: string
  severity: 'warning' | 'error' // error = NEVER_RECOMMEND
}

/** A candidate for an extra shift */
export type ExtraCandidate = {
  userId: string
  userName: string
  userEmail: string
  tier: ExtraTier
  tierLabel: string // e.g., "Extending from Largo", "Rested - available", "Coming off Noche"
  isFromSameArea: boolean
  currentStatus: 'on_largo' | 'on_noche' | 'libre_rested' | 'libre_from_noche' | 'other'
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
  areas: Array<{ id: string; name: string }> // all areas this person belongs to
}

export type GetExtraCandidatesResult = {
  candidates: ExtraCandidate[] // sorted by tier (TIER_1 first, NEVER_RECOMMEND last)
  totalAvailable: number
  understaffingGap: number // how many more people needed
  shiftType: {
    id: string
    name: string
    minStaffRequired: number
    currentStaffCount: number
  }
}

// ============================================================
// Action Signatures
// ============================================================

/** Get available candidates for an extra shift, ordered by smart tiers */
export declare function getExtraCandidatesAction(
  data: z.infer<typeof getExtraCandidatesSchema>
): Promise<ActionResult<GetExtraCandidatesResult>>

/**
 * Assign an extra shift to a candidate.
 * Creates a regular Shift with the extra ShiftType.
 * Sends EXTRA_SHIFT_ASSIGNED notification to the user.
 * The tariff system handles payment via existing RateComponent/ShiftType linkage.
 */
export declare function assignExtraShiftAction(
  data: z.infer<typeof assignExtraShiftSchema>
): Promise<ActionResult<{ shiftId: string }>>
