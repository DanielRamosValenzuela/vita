# Tasks: Shift Rotations (Rotativas)

**Input**: Design documents from `/specs/004-shift-rotations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested. Manual UI testing per Constitution IV. `npm run build` + `npm run lint` after each phase.

**Organization**: Tasks grouped by user story (7 stories: 3 P1, 3 P2, 1 P3). Each story is independently testable after its phase completes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Schema & Scaffolding)

**Purpose**: Prisma schema, FSD directory structure, base types and i18n namespace

- [x] T001 Add RotationStatus enum, 5 new models (Rotation, RotationStep, RotationShiftConfig, RotationGroup, RotationMember), extend Shift with rotationId/rotationGroupId/isManuallyModified, add 3 NotificationType values (ROTATION_ASSIGNED, ROTATION_SHIFTS_GENERATED, EXTRA_SHIFT_ASSIGNED), and add reverse relations on Organization, Area, User, ShiftType in `prisma/schema.prisma` (see data-model.md for full schema)
- [x] T002 Run `npx prisma generate` and `npx prisma db push` to apply schema changes
- [x] T003 [P] Create entity barrel: `src/entities/rotation/index.ts` exporting from `./lib`, and `src/entities/rotation/lib/index.ts` as empty barrel
- [x] T004 [P] Create feature scaffolding: `src/features/rotations/api/index.ts`, `src/features/rotations/ui/index.ts`, `src/features/rotations/types/rotation-types.ts`, `src/features/rotations/lib/rotation-schemas.ts` as empty barrels/stubs
- [x] T005 [P] Add rotation i18n base namespace to `messages/es.json` and `messages/en.json` under `rotations` key with placeholder structure for labels that will be filled per story (section keys: `list`, `form`, `groups`, `generation`, `coverage`, `extras`, `common`)
- [x] T006 [P] Add sidebar navigation i18n key `rotations` to `messages/es.json` ("Rotativas") and `messages/en.json` ("Rotations") under the existing `sidebar` namespace

**Checkpoint**: Schema applied, Prisma client generated, directory structure exists. Run `npm run build` to verify no breaking changes.

---

## Phase 2: Foundational (Entity Domain Logic + Types + Schemas)

**Purpose**: Pure domain logic in entities layer and shared types/schemas that ALL user stories depend on

**CRITICAL**: No user story UI/action work can begin until this phase is complete

- [x] T007 Define TypeScript types in `src/features/rotations/types/rotation-types.ts`: RotationWithRelations, RotationListItem, GetRotationsParams, GetRotationsResult, and all types from contracts/ (GenerationPreview, ShiftConflict, CoverageDay, CoverageOverview, CoverageAlert, ExtraCandidate, ExtraTier, CandidateWarning, GenerationResult, GetExtraCandidatesResult) — use Prisma generated types as base
- [x] T008 [P] Implement pattern cycling helpers in `src/entities/rotation/lib/rotation-helpers.ts`: `getStepForDay(patternLength, cycleOffset, dayIndex) → stepIndex`, `getPatternSummary(steps) → string` (e.g., "Largo → Noche → Libre → Libre"), `combineDateAndTime(date, timeString) → Date`, `calculateEndTime(startTime, durationMinutes) → Date`
- [x] T009 [P] Implement coverage calculator in `src/entities/rotation/lib/coverage-calculator.ts`: `calculateCoverage(rotation, startDate, endDate) → CoverageDay[]` — pure function that computes which group works which shift on each day using pattern cycling, detects gaps and understaffing by comparing member count vs ShiftType.minStaffRequired
- [x] T010 [P] Implement extra tier engine in `src/entities/rotation/lib/extra-tier-engine.ts`: `calculateTier(candidateShiftHistory, requestedShiftClassification, areaLimits) → { tier: ExtraTier, label: string, warnings: CandidateWarning[] }` — pure function implementing the 4-tier logic from spec (TIER_1: Largo→Noche extend, TIER_2: Libre not from Noche, TIER_3: Libre from Noche, NEVER: Noche→Largo)
- [x] T011 Update entity barrel `src/entities/rotation/lib/index.ts` to export all 3 modules, and `src/entities/rotation/index.ts` to export from `./lib`
- [x] T012 Define Zod schemas in `src/features/rotations/lib/rotation-schemas.ts`: createRotationSchema, updateRotationSchema, addGroupSchema, addMemberSchema, removeMemberSchema, generateShiftsSchema, previewGenerationSchema, regenerateShiftsSchema, getExtraCandidatesSchema, assignExtraShiftSchema (see contracts/ for exact shapes)

**Checkpoint**: Entity logic is testable in isolation. Types and schemas ready for Server Actions. Run `npm run build` + `npm run lint`.

---

## Phase 3: User Story 1 — Create a Rotation for an Area (Priority: P1) MVP

**Goal**: CHIEF_AREA/ADMIN_HR can create a rotation tied to an area with a pattern of shift types and rest days, see it in a list, and delete it.

**Independent Test**: Create a rotation named "Cuarto Turno Emergencias" for "Emergencias" with pattern [Largo, Noche, Libre, Libre], verify it appears in the rotations list with correct pattern summary.

### Implementation for User Story 1

- [x] T013 Implement `createRotationAction` in `src/features/rotations/api/rotation-actions.ts`: auth guard (requireAdminHROrChiefArea), org derivation, area access check for CHIEF_AREA, validate area is active, validate shiftTypes are active + assigned to area, create Rotation + RotationSteps + RotationShiftConfigs in a Prisma transaction, revalidatePath('/dashboard/rotations')
- [x] T014 Implement `getRotationsAction` in `src/features/rotations/api/rotation-actions.ts`: paginated list with filters (areaId, status, search), CHIEF_AREA scoped to their areas via UserArea, include pattern summary and group/shift counts
- [x] T015 Implement `getRotationAction` in `src/features/rotations/api/rotation-actions.ts`: single rotation with all nested relations (steps, shiftConfigs, groups with members)
- [x] T016 Implement `deleteRotationAction` in `src/features/rotations/api/rotation-actions.ts`: with `deleteLinkedShifts` boolean param — if true delete linked shifts, if false set rotationId/rotationGroupId to null on linked shifts. AlertDialog confirmation in UI. revalidatePath
- [x] T017 Update `src/features/rotations/api/index.ts` barrel to export all rotation actions
- [x] T018 [P] Add i18n keys for rotation list/create/delete in `messages/es.json` and `messages/en.json` under `rotations.list` and `rotations.form` (title, description, name, area, pattern, steps, restDay, shiftType, startTime, status, create, delete, confirmDelete, etc.)
- [x] T019 Implement `rotation-filters.tsx` in `src/features/rotations/ui/rotation-filters.tsx`: area selector (filtered by user's areas for CHIEF_AREA), status filter (DRAFT/ACTIVE/INACTIVE), search input — follow existing shift-filters.tsx pattern
- [x] T020 Implement `rotation-form.tsx` in `src/features/rotations/ui/rotation-form.tsx`: form dialog for creating a rotation — fields: name, description (optional), area selector, pattern builder (ordered list of steps: select ShiftType or mark as rest day, min 2 max 8 steps, drag to reorder), shift config section (for each unique ShiftType in pattern, input HH:mm start time), initial groups (min 2 max 6, name each group). Use Shadcn Dialog, Form, Select, Input, Button. useFormAction + Zod + isPending
- [x] T021 Implement `rotations-page.tsx` in `src/features/rotations/ui/rotations-page.tsx`: table listing rotations with columns (name, area, status, pattern summary, groups count, members count, generated shifts count, actions). Use Shadcn Table. Include create button opening rotation-form dialog. Follow shifts-page-content.tsx pattern
- [x] T022 Update `src/features/rotations/ui/index.ts` barrel to export RotationsPage, RotationForm, RotationFilters
- [x] T023 Create route page `app/[locale]/dashboard/rotations/page.tsx`: Server Component that imports RotationsPage from features/rotations/ui
- [x] T024 [P] Create loading skeleton `app/[locale]/dashboard/rotations/loading.tsx`: table skeleton with title + filters + 5 rows, using Skeleton component with animate-in fade-in pattern (follow existing calendar/loading.tsx or organizations/loading.tsx pattern)
- [x] T025 Add sidebar nav entry in `src/widgets/dashboard-sidebar/constants.ts`: `{ href: '/dashboard/rotations', label: t('rotations'), icon: RefreshCw, roles: [Role.ADMIN_HR, Role.CHIEF_AREA] }` after the shifts entry. Import RefreshCw from lucide-react

**Checkpoint**: Rotations can be created, listed, and deleted. Navigate to /dashboard/rotations, create "Cuarto Turno" with [Largo, Noche, Libre, Libre], verify it appears. Run `npm run build` + `npm run lint`.

---

## Phase 4: User Story 2 — Define Rotation Groups and Assign Staff (Priority: P1)

**Goal**: CHIEF_AREA can add groups (A, B, C, D) to a rotation and assign staff members to each group. Groups get auto-offset.

**Independent Test**: Add 4 groups to an existing rotation, assign 2-3 staff to each group, verify member lists and group offsets are correct.

**Depends on**: US1 (rotation must exist)

### Implementation for User Story 2

- [x] T026 Implement `addGroupAction` and `removeGroupAction` in `src/features/rotations/api/group-actions.ts`: auth + org + area access, validate rotation exists and belongs to org, auto-assign cycleOffset (next available), enforce min 2 / max 6 groups. removeGroupAction has deleteLinkedShifts param. revalidatePath
- [x] T027 Implement `addMemberAction` and `removeMemberAction` in `src/features/rotations/api/group-actions.ts`: validate user is STAFF_HEALTH + has UserArea for rotation's area, check if already active member of another group in same rotation (block) or another rotation in same area (warn but allow per FR-004), set leftAt on remove. removeMemberAction has cancelFutureShifts param. Send ROTATION_ASSIGNED notification on add. revalidatePath
- [x] T028 Update `src/features/rotations/api/index.ts` barrel to export group actions
- [x] T029 [P] Add i18n keys for groups/members in `messages/es.json` and `messages/en.json` under `rotations.groups` (groupName, cycleOffset, addGroup, removeGroup, members, addMember, removeMember, staffCount, alreadyAssigned, warningOtherRotation, confirmRemoveGroup, confirmRemoveMember, cancelFutureShifts, etc.)
- [x] T030 Implement `rotation-groups.tsx` in `src/features/rotations/ui/rotation-groups.tsx`: component showing groups as cards/tabs within rotation detail. Each group shows: name, offset, member count, member list with avatar + name. Add member button opens user selector (filtered to STAFF_HEALTH in area via UserArea, excluding already-assigned members). Remove member button with AlertDialog asking about future shifts. Add/remove group buttons. Use Shadcn Card, Avatar, Button, AlertDialog
- [x] T031 Implement `rotation-detail.tsx` in `src/features/rotations/ui/rotation-detail.tsx`: detail view (dialog or page section) showing rotation name, area, status, pattern visualization (colored step badges), shift configs (start times table), and embedded rotation-groups component. Include summary: total staff, staff per group, pattern length
- [x] T032 Update `rotations-page.tsx` to open rotation-detail when clicking a rotation row, and update ui barrel exports

**Checkpoint**: Groups and members can be managed. Open a rotation, add 4 groups, assign staff, verify member lists. Run `npm run build` + `npm run lint`.

---

## Phase 5: User Story 3 — Generate Shifts from Rotation (Priority: P1)

**Goal**: CHIEF_AREA generates individual shifts for all members of all groups over a date range. Shifts appear in existing calendar.

**Independent Test**: Select rotation with 4 groups of 2+ members, generate March 1-31, verify shifts appear in /dashboard/shifts and /dashboard/calendar with correct pattern offsets.

**Depends on**: US2 (groups must have members)

### Implementation for User Story 3

- [x] T033 Implement `previewGenerationAction` in `src/features/rotations/api/generation-actions.ts`: calculate total shifts, shifts per group, detect conflicts with existing shifts using checkShiftConflicts from `src/entities/shift`, return GenerationPreview
- [x] T034 Implement `generateShiftsAction` in `src/features/rotations/api/generation-actions.ts`: iterate days × groups × steps using rotation-helpers.getStepForDay, skip rest days, create Shift records in batch with rotationId + rotationGroupId + SCHEDULED status + contractId lookup (existing pattern from shift-actions.ts), send ROTATION_SHIFTS_GENERATED notification per member (batch: one notification per user summarizing their generated shifts), revalidatePath('/dashboard/shifts', '/dashboard/shifts/calendar', '/dashboard/rotations')
- [x] T035 [P] Add i18n keys for generation in `messages/es.json` and `messages/en.json` under `rotations.generation` (generateShifts, selectDateRange, startDate, endDate, preview, conflicts, conflictsFound, shiftsToCreate, shiftsPerGroup, overrideConflicts, generating, generated, shiftsCreated, shiftsSkipped, notificationsSent, etc.)
- [x] T036 Implement `generation-dialog.tsx` in `src/features/rotations/ui/generation-dialog.tsx`: Dialog with date range picker (start/end), preview button showing GenerationPreview (total shifts, per-group breakdown, conflicts list), override conflicts checkbox if conflicts found, generate button with isPending state. Use Shadcn Dialog, Calendar/DatePicker, Button, Table for conflict list
- [x] T037 Update rotation-detail.tsx to include "Generate Shifts" button that opens generation-dialog, and update ui barrel exports
- [x] T037b [US3] Modify `updateShiftAction` in `src/features/shifts/api/shift-actions.ts` to set `isManuallyModified=true` when updating a shift that has `rotationId` set (FR-014/FR-015: individually modified rotation shifts are excluded from future regeneration)

**Checkpoint**: Shifts generated from rotation. Create rotation + groups + members, generate for March, verify in /dashboard/shifts calendar. Edit a generated shift and verify isManuallyModified is set. Run `npm run build` + `npm run lint`.

---

## Phase 6: User Story 4 — View Rotation Coverage Overview (Priority: P2)

**Goal**: Calendar-like grid showing which group works which shift each day, with gap and understaffing warnings.

**Independent Test**: Open rotation with generated shifts, view coverage grid, verify groups are color-coded per day with correct shift types, understaffed days show warning icon.

**Depends on**: US1 (rotation config needed), benefits from US3 (generated shifts for hasGeneratedShifts flag)

### Implementation for User Story 4

- [x] T038 Implement `getCoverageOverviewAction` in `src/features/rotations/api/generation-actions.ts`: use coverage-calculator from entities layer, enrich with actual generated shift counts from DB, detect understaffing (member count vs minStaffRequired), return CoverageOverview with CoverageDay[] and CoverageAlert[]
- [x] T039 Implement `checkCoverageAlertsAction` in `src/features/rotations/api/generation-actions.ts`: for each active rotation in user's areas, check if generated shifts coverage is about to expire (<7 days remaining per FR-016), return alerts with severity
- [x] T040 [P] Add i18n keys for coverage in `messages/es.json` and `messages/en.json` under `rotations.coverage` (coverageOverview, group, shift, rest, gap, understaffed, staffCount, coverageExpiring, daysRemaining, noGaps, fillWithExtra, etc.)
- [x] T041 Implement `coverage-overview.tsx` in `src/features/rotations/ui/coverage-overview.tsx`: calendar grid component — rows = groups, columns = days. Each cell shows shift type name/color or "Libre". Understaffed cells show warning icon with tooltip (8/10). Gap days highlighted. Coverage alerts banner at top. "Fill with extra" button on understaffed cells (wired in US7). Use Shadcn Table, Badge, Tooltip, Alert
- [x] T042 Update rotation-detail.tsx to embed coverage-overview as a tab or section, and update ui barrel exports
- [x] T042b [US4] Display coverage expiring alerts on `rotations-page.tsx` (list view): call `checkCoverageAlertsAction` and render a warning banner or badge on rotations whose generated coverage is about to expire (<7 days remaining per FR-016), so the CHIEF sees the alert without opening each rotation

**Checkpoint**: Coverage overview visible. Open rotation, view coverage grid, verify group-day mapping matches pattern. Verify expiring coverage alerts appear on the rotations list page. Run `npm run build` + `npm run lint`.

---

## Phase 7: User Story 5 — Edit and Manage Rotation Configuration (Priority: P2)

**Goal**: CHIEF_AREA can edit rotation name/pattern/groups, deactivate, and regenerate shifts with comparison.

**Independent Test**: Edit an existing rotation's pattern, regenerate for a future period, verify new shifts reflect changes.

**Depends on**: US1 (rotation must exist)

### Implementation for User Story 5

- [x] T043 Implement `updateRotationAction` in `src/features/rotations/api/rotation-actions.ts`: update name, description, status. If steps or shiftConfigs provided, replace atomically in transaction (delete old + create new). Validate new pattern. revalidatePath
- [x] T044 Implement `regenerateShiftsAction` in `src/features/rotations/api/generation-actions.ts`: if replaceExisting=true, delete existing generated shifts (where isManuallyModified=false) in date range before generating new ones. Preserve manually modified shifts. Return GenerationResult with counts
- [x] T045 [P] Add i18n keys for edit/manage in `messages/es.json` and `messages/en.json` under `rotations.form` (edit, update, deactivate, activate, confirmDeactivate, regenerate, replaceExisting, preserveManual, comparison, whatWouldChange, etc.)
- [x] T046 Update `rotation-form.tsx` to support edit mode: pre-populate fields from existing rotation, detect changes (hasChanges pattern), submit calls updateRotationAction. Add status toggle (ACTIVE/INACTIVE) with confirmation. Add delete button with AlertDialog (existing from US1)
- [x] T047 Update `generation-dialog.tsx` to support regeneration mode: show checkbox "Replace existing generated shifts" with explanation that manually modified shifts are preserved

**Checkpoint**: Rotation can be edited, deactivated, regenerated. Edit pattern, regenerate, verify changes. Run `npm run build` + `npm run lint`.

---

## Phase 8: User Story 7 — Fill Understaffing with Extra Shifts (Priority: P2)

**Goal**: When a rotation group is understaffed, CHIEF_AREA sees warning and can assign extra shifts with smart tier recommendations.

**Independent Test**: Create rotation group with 8 members where minStaffRequired=10, view coverage, click "Fill with extra" on understaffed day, see candidate list ordered by tiers, assign one, verify shift created with extra ShiftType.

**Depends on**: US4 (coverage overview with understaffing detection)

### Implementation for User Story 7

- [x] T048 Implement `getExtraCandidatesAction` in `src/features/rotations/api/extras-actions.ts`: query STAFF_HEALTH users with UserArea for target area, exclude members of the understaffed group, check availability across ALL their areas (no conflicting shifts at requested time), fetch each candidate's recent shift history (last 48h), run extra-tier-engine.calculateTier for each, sort by tier (TIER_1 first, NEVER_RECOMMEND last), check area limits (maxConsecutiveHours, minRestHours) for warnings. Return GetExtraCandidatesResult
- [x] T049 Implement `assignExtraShiftAction` in `src/features/rotations/api/extras-actions.ts`: create regular Shift with the extra ShiftType (e.g., "Largo Extra"), link contractId via existing pattern, send EXTRA_SHIFT_ASSIGNED notification, revalidatePath. Tariff system handles payment automatically via existing RateComponent/ShiftType linkage
- [x] T050 Update `src/features/rotations/api/index.ts` barrel to export extras actions
- [x] T051 [P] Add i18n keys for extras in `messages/es.json` and `messages/en.json` under `rotations.extras` (fillWithExtra, candidates, tier1, tier2, tier3, neverRecommend, tierLabels, extendingFromShift, restedAvailable, comingOffNight, nocheToLargo, warningMaxHours, warningMinRest, assignExtra, selectShiftType, noCandidate, understaffingGap, crossArea, etc.)
- [x] T052 Implement `extras-dialog.tsx` in `src/features/rotations/ui/extras-dialog.tsx`: Dialog triggered from coverage-overview understaffed cell. Shows: understaffing gap (8/10), ShiftType selector for extra type (e.g., "Largo Extra", "Noche Extra"), candidate list as cards sorted by tier with tier badge (color-coded), warnings displayed as alert banners per candidate, assign button per candidate. Use Shadcn Dialog, Select, Card, Badge, Alert, Button
- [x] T053 Wire extras-dialog into coverage-overview.tsx: the "Fill with extra" button on understaffed cells opens extras-dialog with the correct date, area, and shift type context

**Checkpoint**: Extras workflow complete. Create understaffed scenario, click fill, see tiered candidates, assign extra. Verify shift created. Run `npm run build` + `npm run lint`.

---

## Phase 9: User Story 6 — Staff Views Their Rotation Assignment (Priority: P3)

**Goal**: STAFF_HEALTH can see which rotation and group they belong to, and rotation-generated shifts are visually distinguishable.

**Independent Test**: Log in as STAFF_HEALTH in a rotation, view shifts, verify rotation/group label visible and generated shifts have a distinct visual indicator.

**Depends on**: US3 (generated shifts must exist)

### Implementation for User Story 6

- [x] T054 [P] Add i18n keys for staff rotation view in `messages/es.json` and `messages/en.json` under `rotations.staff` (myRotation, group, rotationGenerated, manualShift, noRotation, etc.)
- [x] T055 Create a small server action `getMyRotationsAction` in `src/features/rotations/api/rotation-actions.ts`: returns the current user's active RotationMember records with rotation name, group name, and area name — for STAFF_HEALTH role
- [x] T056 Update shift calendar/list components to show a rotation badge on shifts that have `rotationId` set: add a small colored indicator (e.g., Shadcn Badge with rotation group letter) in `src/features/shifts/ui/shift-calendar.tsx` and `src/features/shifts/ui/shifts-page-content.tsx` — only if shift.rotationId is present

**Checkpoint**: Staff sees rotation context. Log in as STAFF_HEALTH, verify rotation badge on generated shifts. Run `npm run build` + `npm run lint`.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, i18n audit, build verification

- [x] T057 Run full i18n audit: verify all user-visible strings in `src/features/rotations/ui/` use translation keys, no JSX literals, all keys exist in both es.json and en.json with identical structure
- [x] T058 Run `npm run build` — fix any TypeScript errors or build failures
- [x] T059 Run `npm run lint` — fix any ESLint violations
- [x] T060 Manual smoke test: end-to-end flow as CHIEF_AREA — create rotation → add groups → assign staff → generate shifts → view coverage → fill extra → verify in calendar
- [x] T061 Manual smoke test: STAFF_HEALTH view — verify rotation badge on shifts, no broken UI for users without rotation
- [x] T062 Manual smoke test: ADMIN_HR supervisory access — verify can see/manage rotations across all areas in their org

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (Prisma schema must be applied)
- **Phase 3 (US1)**: Depends on Phase 2 — MVP delivery point
- **Phase 4 (US2)**: Depends on US1 (rotation must exist to add groups)
- **Phase 5 (US3)**: Depends on US2 (groups must have members to generate)
- **Phase 6 (US4)**: Depends on US1 (rotation config). Benefits from US3 for generated shift data
- **Phase 7 (US5)**: Depends on US1 (rotation must exist to edit)
- **Phase 8 (US7)**: Depends on US4 (coverage overview triggers extras flow)
- **Phase 9 (US6)**: Depends on US3 (generated shifts must exist for staff to see)
- **Phase 10 (Polish)**: Depends on all desired stories being complete

### User Story Dependencies

```
US1 (Create Rotation) ──► US2 (Groups & Staff) ──► US3 (Generate Shifts) ──► US6 (Staff View)
       │                                                    │
       ├──► US5 (Edit & Manage)                             │
       │                                                    │
       └──► US4 (Coverage Overview) ◄───────────────────────┘
                      │
                      └──► US7 (Extras)
```

- **Critical path**: US1 → US2 → US3 (the 3 P1 stories must be sequential)
- **US4, US5 can start after US1** in parallel with US2/US3
- **US7 requires US4** (extras triggered from coverage overview)
- **US6 requires US3** (staff needs generated shifts to see rotation context)

### Within Each User Story

- Server Actions before UI components
- i18n keys can be added in parallel with either
- UI wiring after both actions and components exist

### Parallel Opportunities

Within Phase 1:
- T003, T004, T005, T006 can all run in parallel (different files)

Within Phase 2:
- T008, T009, T010 can all run in parallel (different entity files)

Within each story:
- i18n tasks marked [P] can run alongside implementation
- Loading skeletons marked [P] can run alongside page components

Across stories (with sufficient team capacity):
- After US1 completes: US2, US4, US5 can start in parallel
- After US3 completes: US6 can start while US7 waits on US4

---

## Parallel Example: Phase 2 (Foundational)

```
# These 3 entity files have no dependencies on each other:
Task: "T008 Implement rotation-helpers.ts"
Task: "T009 Implement coverage-calculator.ts"
Task: "T010 Implement extra-tier-engine.ts"
```

## Parallel Example: User Story 1

```
# i18n and loading skeleton can run in parallel with server actions:
Task: "T018 Add i18n keys for rotation list/create/delete"
Task: "T024 Create loading skeleton for /dashboard/rotations"

# After server actions (T013-T016) are done, UI can proceed:
Task: "T019 Implement rotation-filters.tsx"
Task: "T020 Implement rotation-form.tsx"
Task: "T021 Implement rotations-page.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only — Phase 1 + 2 + 3)

1. Complete Phase 1: Setup (schema + scaffolding) — ~6 tasks
2. Complete Phase 2: Foundational (entity logic + types) — ~6 tasks
3. Complete Phase 3: User Story 1 (rotation CRUD + list page) — ~13 tasks
4. **STOP and VALIDATE**: Create a rotation, see it in list, delete it
5. Deploy/demo if ready — **25 tasks total for MVP**

### Incremental Delivery

1. Setup + Foundational → Schema and logic ready
2. US1 → Create/list/delete rotations → **MVP**
3. US2 → Groups and staff assignment → Rotation is now configurable
4. US3 → Generate shifts → **Core value delivered** (this is the big win)
5. US4 → Coverage overview → Visual verification
6. US5 → Edit and manage → Operational flexibility
7. US7 → Extras → Understaffing resolution
8. US6 → Staff view → Staff visibility
9. Polish → Final quality pass

### Recommended Execution

Single developer (sequential):
- **Week 1**: Phases 1-3 (Setup + Foundational + US1 MVP)
- **Week 2**: Phases 4-5 (US2 Groups + US3 Generation — the big feature)
- **Week 3**: Phases 6-8 (US4 Coverage + US5 Edit + US7 Extras)
- **Week 4**: Phase 9-10 (US6 Staff View + Polish)

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Each checkpoint includes `npm run build` + `npm run lint` validation
- i18n: NEVER delete existing keys, only add new ones under `rotations` namespace
- Multi-tenant: every new Server Action must filter by organizationId
- Area access: CHIEF_AREA actions must verify UserArea assignment
- Generated shifts are regular Shift records with optional rotationId/rotationGroupId linkage
- Extra shift types (Largo Extra, Noche Extra) are configured by the org as regular ShiftTypes — no special code needed for tariff integration
