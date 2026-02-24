# Quickstart: Shift Rotations (Rotativas)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)
**Date**: 2026-02-24

## Prerequisites

Before implementing this feature, ensure:

1. **Prisma schema** is up to date with current models (Shift, ShiftType, Area, UserArea, etc.)
2. **Existing features** work: shift CRUD, notifications, area management, staff management
3. **Test data** exists: at least 1 active area, 2+ shift types (Largo, Noche), 10+ staff with UserArea assignments

## Implementation Order

The feature should be implemented in this order to ensure each piece builds on the previous:

### Phase 1: Data Foundation (Schema + Entity Logic)

**Goal**: Prisma models exist, core business logic is testable.

1. **Prisma schema**: Add 5 new models + extend Shift + new NotificationType values (see [data-model.md](./data-model.md))
2. **Entity layer** (`src/entities/rotation/`):
   - `rotation-helpers.ts`: Pattern cycling function `getStepForDay(patternLength, cycleOffset, dayIndex) → stepIndex`
   - `coverage-calculator.ts`: Given rotation + date range → coverage data (which groups work which days)
   - `extra-tier-engine.ts`: Given candidate shift history → tier + warnings

### Phase 2: Server Actions (CRUD + Generation)

**Goal**: All backend logic works via Server Actions.

3. **Rotation CRUD** (`src/features/rotations/api/rotation-actions.ts`):
   - `createRotationAction`: Creates rotation + steps + configs + groups in a transaction
   - `updateRotationAction`: Updates config (replaces steps/configs atomically)
   - `deleteRotationAction`: Deletes rotation with option for linked shifts
   - `getRotationAction` / `getRotationsAction`: Read operations

4. **Group/Member Management** (`src/features/rotations/api/group-actions.ts`):
   - `addGroupAction` / `removeGroupAction`
   - `addMemberAction` / `removeMemberAction`
   - Validates: UserArea, active area, no double-assignment

5. **Shift Generation** (`src/features/rotations/api/generation-actions.ts`):
   - `previewGenerationAction`: Preview conflicts before generating
   - `generateShiftsAction`: Batch create shifts with rotation linkage
   - `getCoverageOverviewAction`: Coverage grid data for UI
   - `checkCoverageAlertsAction`: Proactive alerts for expiring coverage

6. **Extras** (`src/features/rotations/api/extras-actions.ts`):
   - `getExtraCandidatesAction`: Query candidates + run tier engine
   - `assignExtraShiftAction`: Create shift with extra type + notify

### Phase 3: UI Components

**Goal**: Full UI for rotation management.

7. **Types + Schemas** (`src/features/rotations/types/` + `lib/`):
   - TypeScript types for all rotation domain objects
   - Zod schemas for form validation

8. **Rotations Page** (`src/features/rotations/ui/`):
   - `rotations-page.tsx`: List with filters (area, status, search)
   - `rotation-form.tsx`: Create/edit with pattern builder
   - `rotation-detail.tsx`: Detail view with groups + coverage
   - `rotation-groups.tsx`: Group management (members CRUD)
   - `coverage-overview.tsx`: Calendar grid coverage view
   - `generation-dialog.tsx`: Date range + conflict preview + generate
   - `extras-dialog.tsx`: Smart tier candidate list + assign

9. **Route + Navigation**:
   - `app/[locale]/dashboard/rotations/page.tsx`: Server component page
   - `app/[locale]/dashboard/rotations/loading.tsx`: Skeleton loading
   - Add sidebar nav entry for ADMIN_HR + CHIEF_AREA

### Phase 4: i18n + Integration

10. **i18n keys**: Add all rotation-related keys to `messages/es.json` + `messages/en.json`
11. **Notification types**: Register new types in notification service
12. **Staff view**: Show rotation/group assignment in staff's shift views

## Key Patterns to Follow

### Auth Pattern (from shift-actions.ts)

```typescript
const session = await requireAdminHROrChiefArea()

let derivedOrgId: string | null = session.organizationId ?? null
if (isChiefArea(session) && !derivedOrgId) {
  const firstArea = await prisma.userArea.findFirst({
    where: { userId: session.id },
    select: { area: { select: { organizationId: true } } },
  })
  derivedOrgId = firstArea?.area?.organizationId ?? null
}
if (!derivedOrgId) return { success: false, error: '...' }
const organizationId = derivedOrgId

// CHIEF_AREA area access check
if (isChiefArea(session)) {
  const chiefArea = await prisma.userArea.findFirst({
    where: { userId: session.id, areaId: rotation.areaId },
  })
  if (!chiefArea) return { success: false, error: '...' }
}
```

### Generation Algorithm (pseudocode)

```
function generateShifts(rotation, startDate, endDate):
  patternLength = rotation.steps.length
  rotationStart = rotation.startDate ?? startDate

  for each day in [startDate..endDate]:
    dayIndex = daysBetween(rotationStart, day)

    for each group in rotation.groups:
      stepIndex = (dayIndex + group.cycleOffset) % patternLength
      step = rotation.steps[stepIndex]

      if step.isRestDay: continue

      config = rotation.shiftConfigs.find(c => c.shiftTypeId === step.shiftTypeId)
      shiftStart = combineDateAndTime(day, config.startTime)
      shiftEnd = addMinutes(shiftStart, step.shiftType.durationMinutes)

      for each member in group.members:
        conflict = checkShiftConflicts(member.userId, rotation.areaId, shiftStart, shiftEnd)
        if conflict and !overrideConflicts: skip + record conflict

        createShift({
          userId: member.userId,
          areaId: rotation.areaId,
          shiftTypeId: step.shiftTypeId,
          startTime: shiftStart,
          endTime: shiftEnd,
          organizationId: rotation.organizationId,
          rotationId: rotation.id,
          rotationGroupId: group.id,
          status: 'SCHEDULED',
        })
```

### Extra Tier Engine (pseudocode)

```
function calculateTier(candidate, requestedShiftType, targetDate):
  currentShift = candidate's shift on targetDate
  previousShift = candidate's most recent shift before targetDate

  // NEVER: Noche → Largo Extra
  if previousShift.classification == NIGHT and requestedShiftType.classification == DAY:
    return { tier: NEVER_RECOMMEND, warning: 'noche_to_largo' }

  // TIER 1: On Largo, extend to Noche Extra
  if currentShift exists and currentShift.classification == DAY and requestedShiftType.classification == NIGHT:
    return { tier: TIER_1, label: 'Extending from current shift' }

  // TIER 2: Libre, NOT from Noche
  if no currentShift and (no previousShift or previousShift.classification != NIGHT):
    return { tier: TIER_2, label: 'Rested and available' }

  // TIER 3: Libre, came from Noche
  if no currentShift and previousShift.classification == NIGHT:
    return { tier: TIER_3, label: 'Available but coming off night shift' }

  // Additional warnings
  checkMaxConsecutiveHours(candidate, targetDate, requestedShiftType)
  checkMinRestHours(candidate, targetDate, requestedShiftType)
```

## Files Summary

| Phase | File | Type |
|-------|------|------|
| 1 | `prisma/schema.prisma` | Modify |
| 1 | `src/entities/rotation/index.ts` | Create |
| 1 | `src/entities/rotation/lib/index.ts` | Create |
| 1 | `src/entities/rotation/lib/rotation-helpers.ts` | Create |
| 1 | `src/entities/rotation/lib/coverage-calculator.ts` | Create |
| 1 | `src/entities/rotation/lib/extra-tier-engine.ts` | Create |
| 2 | `src/features/rotations/api/index.ts` | Create |
| 2 | `src/features/rotations/api/rotation-actions.ts` | Create |
| 2 | `src/features/rotations/api/group-actions.ts` | Create |
| 2 | `src/features/rotations/api/generation-actions.ts` | Create |
| 2 | `src/features/rotations/api/extras-actions.ts` | Create |
| 2 | `src/features/rotations/lib/rotation-schemas.ts` | Create |
| 2 | `src/features/rotations/types/rotation-types.ts` | Create |
| 3 | `src/features/rotations/ui/index.ts` | Create |
| 3 | `src/features/rotations/ui/rotations-page.tsx` | Create |
| 3 | `src/features/rotations/ui/rotation-form.tsx` | Create |
| 3 | `src/features/rotations/ui/rotation-detail.tsx` | Create |
| 3 | `src/features/rotations/ui/rotation-groups.tsx` | Create |
| 3 | `src/features/rotations/ui/coverage-overview.tsx` | Create |
| 3 | `src/features/rotations/ui/generation-dialog.tsx` | Create |
| 3 | `src/features/rotations/ui/extras-dialog.tsx` | Create |
| 3 | `src/features/rotations/ui/rotation-filters.tsx` | Create |
| 3 | `app/[locale]/dashboard/rotations/page.tsx` | Create |
| 3 | `app/[locale]/dashboard/rotations/loading.tsx` | Create |
| 3 | `src/widgets/dashboard-sidebar/constants.ts` | Modify |
| 4 | `messages/es.json` | Modify |
| 4 | `messages/en.json` | Modify |
| 4 | `src/features/notifications/lib/notification-service.ts` | Modify |

**Total: ~27 files** (23 new + 4 modified)
