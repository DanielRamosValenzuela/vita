# Research: Shift Rotations (Rotativas)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2026-02-24

## Research Summary

All technical unknowns from the Technical Context have been resolved through codebase exploration, database analysis, and domain research.

---

## R-001: Rotation Pattern Model Design

**Question**: How to model a flexible cyclic rotation pattern that supports any combination of shift types and rest days?

**Decision**: Ordered list of RotationStep records, each referencing either a ShiftType or marking a rest day (isRestDay boolean). Pattern length = number of steps = cycle duration in days.

**Rationale**: This is the simplest model that supports arbitrary patterns. The "cuarto turno" (Largo, Noche, Libre, Libre) becomes 4 steps: [ShiftType=Largo, ShiftType=Noche, isRestDay=true, isRestDay=true]. A 3-day pattern, a 7-day pattern, or any other length works identically.

**Alternatives considered**:
- JSON array in Rotation record: Rejected - loses referential integrity to ShiftType, harder to query/validate.
- Template-based patterns: Deferred to future iteration per user decision.
- Bitmask pattern: Rejected - too complex for variable-length patterns with different shift types.

---

## R-002: Group Offset Mechanism

**Question**: How do group offsets work to ensure continuous coverage?

**Decision**: Each RotationGroup has a `cycleOffset` integer (0-based). On any given day, a group's position in the pattern = `(daysSinceStart + cycleOffset) % patternLength`. Groups are automatically offset by 1 position each.

**Rationale**: This is the standard approach for cyclic schedules. For "cuarto turno" with 4 groups:
- Day 0: Group A=step[0]=Largo, B=step[1]=Noche, C=step[2]=Libre, D=step[3]=Libre
- Day 1: Group A=step[1]=Noche, B=step[2]=Libre, C=step[3]=Libre, D=step[0]=Largo
- Pattern repeats every 4 days.

**Alternatives considered**:
- Manual offset assignment: User could set any offset. Kept for flexibility but default auto-increment.
- Start date per group: More complex, same result. Offset is simpler and the standard approach.

---

## R-003: Shift Time Configuration per Rotation

**Question**: Where do generated shift start/end times come from?

**Decision**: New RotationShiftConfig model. Each rotation defines the start time (HH:mm) for each ShiftType it uses. End time = startTime + ShiftType.durationMinutes. This is per-rotation, not global on ShiftType.

**Rationale**: User explicitly corrected that shift times are per-rotation, not global. Different areas may use "Largo" starting at 07:00 or 08:00. The ShiftType only defines duration (720 min for Largo), and each rotation configures when that shift starts.

**Alternatives considered**:
- Default start time on ShiftType: User explicitly rejected (Option A→corrected to Option B in clarification).
- Start time on RotationStep: Would duplicate for same ShiftType used in multiple steps. Separate config is cleaner.

---

## R-004: Shift Generation Algorithm

**Question**: How to efficiently generate shifts for all members across all groups for a date range?

**Decision**: Batch generation algorithm:
1. For each day in the date range
2. For each group in the rotation
3. Calculate pattern position: `(dayIndex + group.cycleOffset) % patternLength`
4. If step is a rest day → skip
5. If step is a shift type → for each member in the group:
   a. Look up RotationShiftConfig for the shift type's start time
   b. Calculate endTime = startTime + durationMinutes
   c. Check conflicts with existing shifts
   d. Create shift record with rotation/group linkage

Total shifts generated = (days × groups × avgActiveSteps/pattern × membersPerGroup). For "cuarto turno" March: 31 days × 4 groups × 2/4 active × 10 members = ~620 shifts.

**Rationale**: Straightforward iteration. Conflict checking uses existing `checkShiftConflicts()`. Shifts created with `rotationId` + `rotationGroupId` for traceability.

**Alternatives considered**:
- Bulk insert without individual conflict check: Faster but loses conflict detection. Rejected per FR-008.
- Background job/queue: Overkill for ~620 records. Can be optimized later if needed.
- Pre-calculate full year: Too many shifts, user prefers manual generation per period (clarification Q4).

---

## R-005: Extra Shift Smart Tier Logic

**Question**: How to implement the smart tier recommendation system for extras?

**Decision**: Pure function in `entities/rotation/lib/extra-tier-engine.ts` that takes candidate info and returns a tier + warnings:

```
Tier 1 (BEST): Person on Largo today → extend to Noche Extra (same area)
  - Condition: candidate has Largo shift ending around when Noche starts
  - Rationale: Already at work, just extending

Tier 2 (GOOD): Person on Libre, did NOT come from Noche
  - Condition: candidate has no shift today AND previous shift was NOT Noche
  - Rationale: Well-rested, available

Tier 3 (AVAILABLE): Person on Libre, came from Noche
  - Condition: candidate has no shift today AND previous shift WAS Noche
  - Rationale: Available but less rested

NEVER: Person coming off Noche → Largo Extra
  - Condition: candidate's last shift was Noche AND requested extra is Largo/DAY type
  - Rationale: Night-to-day 24h is dangerous. Show warning but DON'T recommend
```

Additional warnings:
- Area limit violations: compare cumulative hours vs `area.maxConsecutiveHours` and rest gap vs `area.minRestHours`
- Cross-area: candidates must have UserArea assignment to the target area

**Rationale**: User defined these exact tiers in clarification session 2. The logic is pure domain rules (no DB queries) - the caller passes candidate shift history, and the engine returns tier + warnings.

**Alternatives considered**:
- Hard block on violations: User explicitly wants warnings only, CHIEF decides.
- Simpler availability check: User wants smart ordering from day 1 (full MVP).

---

## R-006: Cross-Area Candidate Discovery

**Question**: How to find extra candidates across areas?

**Decision**: Query all STAFF_HEALTH users who:
1. Have UserArea assignment to the target area (MANDATORY - no exceptions)
2. Are not already working a shift at the requested time (check across ALL their areas)
3. Are not in the same rotation group that needs filling

Then for each candidate, determine their tier using the extra-tier-engine based on their shift history in the past 24-48 hours.

**Rationale**: User clarified that "cross-area" simply means the person must be assigned to the area via UserArea. The system checks their availability across ALL their rotations in ALL their areas.

**Alternatives considered**:
- Only suggest people from the same rotation: Too restrictive, defeats the purpose of extras.
- Allow anyone in the organization: User explicitly requires UserArea assignment.

---

## R-007: Notification Types for Rotations

**Question**: What new notification types are needed?

**Decision**: Add 3 new NotificationType enum values:
- `ROTATION_ASSIGNED` - Staff added to a rotation group
- `ROTATION_SHIFTS_GENERATED` - Shifts generated for a rotation (batch notification per member)
- `EXTRA_SHIFT_ASSIGNED` - Extra shift assigned to fill understaffing

**Rationale**: Follows existing pattern (SHIFT_CREATED, AREA_ASSIGNED). Staff needs to know when they're added to a rotation and when shifts are generated.

**Alternatives considered**:
- Reuse SHIFT_CREATED for generated shifts: Would spam with hundreds of individual notifications. Better to batch per member.
- No rotation-specific notifications: User specified notifications in FR-013 and clarification Q10.

---

## R-008: Existing Codebase Integration Points

**Question**: What existing code/patterns to reuse?

**Decision**:

| Integration Point | Existing Code | How to Reuse |
|---|---|---|
| Auth guards | `requireAdminHROrChiefArea()` in `src/shared/lib/auth/session.ts` | Direct reuse for all rotation Server Actions |
| Org derivation | Pattern from `shift-actions.ts` lines 35-48 | Copy pattern for CHIEF_AREA organizationId derivation |
| Area access check | Pattern from `shift-actions.ts` lines 52-61 | Verify CHIEF has UserArea for rotation's area |
| Conflict detection | `checkShiftConflicts()` in `src/entities/shift/lib/` | Call during generation for each candidate shift |
| Notifications | `createNotification()` in `src/features/notifications/lib/` | Use with new notification types |
| Sidebar nav | `getNavItems()` in `src/widgets/dashboard-sidebar/constants.ts` | Add rotation entry for ADMIN_HR + CHIEF_AREA |
| Form patterns | `useFormAction` + Zod + `isPending` + `AlertDialog` | Follow existing shift form patterns |
| Tariff alignment | `RateComponentApplicableType` links to ShiftType | Extra shift types (Largo Extra, Noche Extra) work automatically via existing tariff system |

**Rationale**: Maximum code reuse, minimum new patterns. The rotation feature follows the same architectural patterns as the existing shift management feature.

---

## R-009: Prisma Schema Design Decisions

**Question**: How to structure the 5 new models and extend Shift?

**Decision**: See [data-model.md](./data-model.md) for full schema. Key decisions:
- All new models have `organizationId` for multi-tenant isolation
- Composite indexes on `(organizationId, ...)` for performance
- Shift extended with optional `rotationId` + `rotationGroupId` + `isManuallyModified`
- RotationStatus enum: ACTIVE, INACTIVE, DRAFT
- Cascade deletes: Rotation → Steps, Configs, Groups → Members (matching existing patterns)
- RotationMember has soft reference (no unique constraint across rotations to allow flexibility, but warning on double-assignment per FR-004)

**Alternatives considered**:
- Separate "generated shift" model: Rejected - generated shifts ARE regular shifts, just with rotation linkage.
- Soft deletes: Not used elsewhere in codebase, not introducing now.

---

## R-010: UI Architecture

**Question**: How to structure the rotation management UI?

**Decision**: Single dedicated page at `/dashboard/rotations` with sub-views:
1. **List view** (default): Table of rotations with filters (area, status, search)
2. **Detail view** (dialog or expandable): Shows rotation config + groups + coverage overview
3. **Form dialog**: Create/edit rotation with pattern builder (drag-and-drop step ordering)
4. **Generation dialog**: Date range picker → conflict preview → confirm
5. **Extras dialog**: Triggered from coverage overview understaffing icon → candidate list with tiers

**Rationale**: Follows the existing patterns from `/dashboard/shifts` (table + form dialog + filters). Coverage overview is the unique new element that adds a calendar-like grid.

**Alternatives considered**:
- Sub-routes (/rotations/[id]): Overkill for MVP. Dialog-based detail view keeps it simpler.
- Embed in shifts page: User explicitly requested dedicated page (clarification Q2).
