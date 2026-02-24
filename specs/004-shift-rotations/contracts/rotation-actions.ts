/**
 * Server Action Contracts: Rotation CRUD + Groups + Members
 *
 * These are type signatures and Zod schemas only.
 * Implementation goes in src/features/rotations/api/rotation-actions.ts
 *
 * Auth: requireAdminHROrChiefArea() for all actions
 * Multi-tenant: organizationId derived from session, filtered in all queries
 * Area access: CHIEF_AREA verified via UserArea for the rotation's area
 */

import { z } from 'zod'
import type { ActionResult } from '@/src/shared/lib/types'

// ============================================================
// Zod Schemas
// ============================================================

export const createRotationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  areaId: z.string().min(1),
  startDate: z.date().optional(),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(0),
        isRestDay: z.boolean(),
        shiftTypeId: z.string().optional(), // required when isRestDay=false
      })
    )
    .min(2)
    .max(8),
  shiftConfigs: z.array(
    z.object({
      shiftTypeId: z.string().min(1),
      startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm
    })
  ),
  groups: z
    .array(
      z.object({
        name: z.string().min(1).max(20),
      })
    )
    .min(2)
    .max(6),
})

export const updateRotationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
  startDate: z.date().optional().nullable(),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(0),
        isRestDay: z.boolean(),
        shiftTypeId: z.string().optional(),
      })
    )
    .min(2)
    .max(8)
    .optional(),
  shiftConfigs: z
    .array(
      z.object({
        shiftTypeId: z.string().min(1),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .optional(),
})

export const addGroupSchema = z.object({
  rotationId: z.string().min(1),
  name: z.string().min(1).max(20),
})

export const addMemberSchema = z.object({
  rotationGroupId: z.string().min(1),
  userId: z.string().min(1),
})

export const removeMemberSchema = z.object({
  rotationGroupId: z.string().min(1),
  userId: z.string().min(1),
})

// ============================================================
// Types
// ============================================================

/** Full rotation with all nested relations for detail view */
export type RotationWithRelations = {
  id: string
  name: string
  description: string | null
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  startDate: Date | null
  areaId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  area: { id: string; name: string; description: string | null }
  steps: Array<{
    id: string
    order: number
    isRestDay: boolean
    shiftType: { id: string; name: string; color: string; icon: string | null } | null
  }>
  shiftConfigs: Array<{
    id: string
    shiftTypeId: string
    startTime: string
    shiftType: { id: string; name: string }
  }>
  groups: Array<{
    id: string
    name: string
    cycleOffset: number
    members: Array<{
      id: string
      userId: string
      joinedAt: Date
      user: { id: string; name: string; email: string }
    }>
    _count: { members: number }
  }>
}

/** Rotation list item (lighter, no nested members) */
export type RotationListItem = {
  id: string
  name: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  area: { id: string; name: string }
  _count: { groups: number; shifts: number }
  patternSummary: string // e.g., "Largo → Noche → Libre → Libre"
  totalMembers: number
  createdAt: Date
}

export type GetRotationsParams = {
  page?: number
  pageSize?: number
  areaId?: string
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  search?: string
}

export type GetRotationsResult = {
  rotations: RotationListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// Action Signatures
// ============================================================

/** Create a new rotation with pattern, shift configs, and initial groups */
export declare function createRotationAction(
  data: z.infer<typeof createRotationSchema>
): Promise<ActionResult<RotationWithRelations>>

/** Update rotation config (pattern, name, status, shift configs) */
export declare function updateRotationAction(
  rotationId: string,
  data: z.infer<typeof updateRotationSchema>
): Promise<ActionResult<RotationWithRelations>>

/** Delete a rotation with option to handle linked shifts */
export declare function deleteRotationAction(
  rotationId: string,
  deleteLinkedShifts: boolean
): Promise<ActionResult<null>>

/** Get a single rotation with all relations */
export declare function getRotationAction(
  rotationId: string
): Promise<ActionResult<RotationWithRelations>>

/** List rotations with pagination and filters */
export declare function getRotationsAction(
  params: GetRotationsParams
): Promise<ActionResult<GetRotationsResult>>

/** Add a group to an existing rotation */
export declare function addGroupAction(
  data: z.infer<typeof addGroupSchema>
): Promise<ActionResult<RotationWithRelations>>

/** Remove a group (with option to delete linked shifts) */
export declare function removeGroupAction(
  groupId: string,
  deleteLinkedShifts: boolean
): Promise<ActionResult<null>>

/** Add a member to a rotation group */
export declare function addMemberAction(
  data: z.infer<typeof addMemberSchema>
): Promise<ActionResult<RotationWithRelations>>

/** Remove a member from a rotation group (with option for future shifts) */
export declare function removeMemberAction(
  data: z.infer<typeof removeMemberSchema>,
  cancelFutureShifts: boolean
): Promise<ActionResult<null>>
