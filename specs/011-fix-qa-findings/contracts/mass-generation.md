# Contract: Mass Shift Generation

## Server Action: `bulkGenerateShiftsAction`

**Location**: `src/features/rotations/api/generation-actions.ts`
**Auth**: `requireAdminHROrChief()`

### Input
```typescript
{
  rotationIds: string[]    // Selected rotation IDs (from checklist)
  startDate: Date          // Shared start date for all rotations
  endDate: Date            // Shared end date for all rotations
  overrideConflicts?: boolean  // Default: false
}
```

### Validation (Zod)
- `rotationIds` non-empty array of valid cuid strings
- `startDate` < `endDate`
- Range ≤ 90 days (prevent excessive generation)
- All rotations must belong to user's organization
- All rotations must have status ACTIVE

### Logic
1. Fetch all requested rotations in one query
2. Validate org ownership and ACTIVE status
3. For CHIEF: verify area access for all rotation areas
4. Process each rotation sequentially (reuse existing generation logic):
   a. Preview conflicts
   b. Generate shifts (using existing `generateShiftsAction` internal logic)
   c. Catch errors per rotation (isolate failures)
5. Aggregate results

### Output
```typescript
ActionResult<{
  totalShiftsCreated: number
  totalConflicts: number
  results: Array<{
    rotationId: string
    rotationName: string
    shiftsCreated: number
    shiftsSkipped: number
    conflictsDetected: number
    error?: string
  }>
}>
```

### Edge Cases
- Rotation with existing shifts in range → report conflicts per rotation, skip duplicates
- One rotation fails → continue with others, report error in results
- CHIEF with partial area access → reject rotations outside their areas

---

## Server Action: `getActiveRotationsForBulkAction`

**Location**: `src/features/rotations/api/generation-actions.ts`
**Auth**: `requireAdminHROrChief()`

### Output
```typescript
ActionResult<Array<{
  id: string
  name: string
  areaName: string
  memberCount: number
  lastGeneratedDate: Date | null
  status: string
}>>
```

### Logic
- Fetch all ACTIVE rotations for org (filtered by CHIEF area access if applicable)
- Include member count and last generated shift date
