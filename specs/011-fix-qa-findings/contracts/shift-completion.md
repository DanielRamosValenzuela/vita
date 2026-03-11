# Contract: Shift Completion

## Server Action: `completeShiftsByDayAction`

**Location**: `src/features/shifts/api/shift-actions.ts`
**Auth**: `requireAdminHROrChief()` — CHIEF_AREA must have area access

### Input
```typescript
{
  date: Date           // The day to complete (UTC, date only)
  areaId: string       // Area to scope the shifts
  excludeShiftIds?: string[]  // Shifts to exclude from batch
}
```

### Validation (Zod)
- `date` must be in the past (< today UTC)
- `areaId` must belong to the user's organization
- `excludeShiftIds` must be valid shift IDs in the area

### Logic
1. Find all shifts where `areaId`, `date` (startTime between day start/end), `status = SCHEDULED`, `id NOT IN excludeShiftIds`
2. For each shift:
   a. Update status to `COMPLETED`
   b. Find active contract for shift.userId + shift.areaId
   c. Calculate ShiftPayment using contract's RateTemplate components (PER_SHIFT types)
   d. Create `ShiftPayment` + `ShiftPaymentBreakdown` records
3. Return summary: `{ completed: number, skipped: number, errors: string[] }`

### Output
```typescript
ActionResult<{
  completed: number
  skipped: number
  totalPaymentAmount: number
  errors: string[]
}>
```

### Edge Cases
- Shift already COMPLETED → skip silently (don't error)
- Shift CANCELLED → skip
- No active contract → create ShiftPayment with $0 amounts, add warning to errors
- Future date → reject with error

---

## Server Action: `getPendingCompletionCountAction`

**Location**: `src/features/shifts/api/shift-actions.ts`
**Auth**: `requireAdminHROrChief()`

### Input
```typescript
{ areaIds?: string[] }  // Optional filter; CHIEF auto-filters by accessible areas
```

### Output
```typescript
ActionResult<{
  totalPending: number
  oldestPendingDate: Date | null
  byArea: Array<{ areaId: string, areaName: string, count: number }>
}>
```

### Logic
- Count shifts where `status = SCHEDULED`, `startTime < today`, grouped by areaId
- For CHIEF: filter by accessible areaIds
- For ADMIN_HR: all areas in org
