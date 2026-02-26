# Tasks: Sectores (Agrupación de Áreas)

**Input**: Design documents from `/specs/001-area-sectors/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sector-actions.md, quickstart.md

**Tests**: No automated tests requested. Verification via `npm run build` + `npm run lint` + manual UI testing.

**Organization**: Tasks grouped by user story. US1 and US2 are both P1 but US2 depends on US1 (sectors must exist to assign areas). US3 depends on US1+US2. US4 depends on US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

## Path Conventions

- **FSD monolith**: `src/entities/`, `src/features/`, `src/shared/`, `src/widgets/`
- **Routes**: `app/[locale]/dashboard/`
- **i18n**: `messages/es.json`, `messages/en.json`
- **Schema**: `prisma/schema.prisma`

---

## Phase 1: Setup (Database & Schema)

**Purpose**: Create database tables and Prisma models for Sector and SectorArea

- [ ] T001 Apply Supabase migration to create `Sector` table and `SectorArea` junction table with indexes and constraints per `data-model.md`
- [ ] T002 Add `Sector` and `SectorArea` models to `prisma/schema.prisma` with back-relations on `Organization` and `Area` models per `data-model.md`
- [ ] T003 Run `npx prisma generate` and verify `npm run build` still passes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entity repository, schemas, types, translations, and navigation — required before any user story

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create entity repository at `src/entities/sector/lib/sector-repository.ts` with functions: `getSectors(orgId)`, `getSectorById(id, orgId)`, `createSector(data, orgId)`, `updateSector(id, data, orgId)`, `deleteSector(id, orgId)` — follow `area-repository.ts` patterns with organizationId filtering, _count includes, and sectorAreas relation
- [ ] T005 Create entity barrel exports at `src/entities/sector/lib/index.ts` and `src/entities/sector/index.ts`
- [ ] T006 [P] Create types at `src/features/sector/lib/types.ts` with `CreateSectorInput` and `UpdateSectorInput` interfaces per contracts/sector-actions.md
- [ ] T007 [P] Create Zod schemas at `src/features/sector/lib/schemas/sector-schema.ts` with `createSectorSchema(messages)` and `createUpdateSectorSchema(messages)` — name (2-100 chars), description (max 500), icon (optional), color (hex regex)
- [ ] T008 [P] Create server validation messages at `src/features/sector/lib/validation/server/sector-messages.ts` with `getSectorValidationMessages(locale)` async function
- [ ] T009 [P] Create client validation messages at `src/features/sector/lib/validation/client/sector-messages.ts` with `useSectorValidationMessages()` hook
- [ ] T010 Create server schema helpers at `src/features/sector/lib/helpers/server/sector-schemas.ts` and `src/features/sector/lib/helpers/server/index.ts` with `getCreateSectorSchema(locale)` and `getUpdateSectorSchema(locale)`
- [ ] T011 Create client schema helpers at `src/features/sector/lib/helpers/client/sector-schemas.ts` and `src/features/sector/lib/helpers/client/index.ts` with `useCreateSectorSchema()` and `useUpdateSectorSchema()`
- [ ] T012 Create feature lib barrel exports at `src/features/sector/lib/index.ts`
- [ ] T013 Add i18n translation keys to `messages/es.json`: `sectors.*` (title, description, create, edit, delete, empty, table columns, form labels, validation, staff query labels), `dashboard.sectors` sidebar label, `validation.sector.*`
- [ ] T014 Add matching i18n translation keys to `messages/en.json` with identical structure
- [ ] T015 Add "Sectores" navigation item in `src/widgets/dashboard-sidebar/constants.ts` with icon `Layers`, href `/dashboard/sectors`, roles `[ADMIN_HR, CHIEF_AREA, STAFF_HEALTH]`, positioned after "Áreas"

**Checkpoint**: Foundation ready — entity layer, schemas, translations, and navigation in place. User story implementation can now begin.

---

## Phase 3: User Story 1 - Crear y gestionar Sectores (Priority: P1) MVP

**Goal**: ADMIN_HR can create, edit, list, and delete sectors with name, description, icon, and color

**Independent Test**: Create a sector "USI" with description and color, verify it appears in the list. Edit its name. Delete it and verify it's gone. Try creating a duplicate name — should fail.

### Implementation for User Story 1

- [ ] T016 [US1] Create CRUD Server Actions at `src/features/sector/api/sector-actions.ts`: `createSectorAction`, `updateSectorAction`, `deleteSectorAction`, `getSectorsAction` — all with `requireAdminHRWithOrg()` auth (getSectors also supports CHIEF_AREA/STAFF_HEALTH with role-filtered results via UserArea join), duplicate name check, `handleActionError`, `revalidatePaths`, per contracts/sector-actions.md
- [ ] T017 [US1] Create API barrel exports at `src/features/sector/api/index.ts`
- [ ] T018 [P] [US1] Create `src/features/sector/ui/create-sector-form.tsx` — client component with useFormAction + Zod resolver, fields: name (Input), description (Textarea), icon (IconPicker), color (color input). Follow `create-area-form.tsx` pattern. Redirect to `/dashboard/sectors` on success
- [ ] T019 [P] [US1] Create `src/features/sector/ui/sectors-table.tsx` — client component with DataTableToolbar (search), DataTablePagination, useClientPagination hook, delete confirmation AlertDialog. Columns: name+icon+color, description, areas count, actions (edit/delete/staff). Follow `areas-table.tsx` pattern
- [ ] T020 [P] [US1] Create `src/features/sector/ui/sector-basic-info-card.tsx` — client component Card with edit form for name, description, icon, color. Uses updateSectorAction. Follow `area-basic-info-card.tsx` pattern
- [ ] T021 [US1] Create UI barrel exports at `src/features/sector/ui/index.ts` and `src/features/sector/index.ts`
- [ ] T022 [P] [US1] Create list page at `app/[locale]/dashboard/sectors/page.tsx` — Server Component with generateMetadata, requireAdminHROrChiefArea auth, call getSectorsAction, render SectorsTable. ADMIN_HR sees create button
- [ ] T023 [P] [US1] Create form page at `app/[locale]/dashboard/sectors/new/page.tsx` — Server Component with requireAdminHRWithOrg auth, render CreateSectorForm
- [ ] T024 [US1] Create edit page at `app/[locale]/dashboard/sectors/[id]/edit/page.tsx` — Server Component with requireAdminHRWithOrg auth, fetch sector by id, render SectorBasicInfoCard (and later SectorAreasCard from US2)

**Checkpoint**: ADMIN_HR can create, list, edit, and delete sectors. Full CRUD functional and testable independently.

---

## Phase 4: User Story 2 - Asignar áreas a Sectores (Priority: P1)

**Goal**: ADMIN_HR can assign/remove areas to/from a sector using a multi-select interface on the sector edit page

**Independent Test**: Open sector "USI" edit page, assign 3 areas, save. Verify areas appear listed. Remove one area. Verify count updates. Assign same area to another sector — should work (many-to-many).

**Depends on**: US1 (sector must exist to assign areas)

### Implementation for User Story 2

- [ ] T025 [US2] Add `assignAreasToSectorAction` to `src/features/sector/api/sector-actions.ts` — requireAdminHRWithOrg, input `{ sectorId, areaIds[] }`, transaction: deleteMany existing SectorArea for sector then createMany new ones, validate all areaIds belong to same org, revalidatePaths
- [ ] T026 [US2] Create `src/features/sector/ui/sector-areas-card.tsx` — client component Card showing assigned areas list with name/icon/color, multi-select checkbox to add/remove areas (fetches org areas via getAreasAction from area feature), save button calls assignAreasToSectorAction. Show area staff count and active rotation indicator
- [ ] T027 [US2] Update edit page `app/[locale]/dashboard/sectors/[id]/edit/page.tsx` to also fetch organization areas and render SectorAreasCard below SectorBasicInfoCard
- [ ] T028 [US2] Update `src/features/sector/ui/index.ts` to export SectorAreasCard

**Checkpoint**: Full sector management: CRUD + area assignment. ADMIN_HR can create sectors, assign areas, and manage the many-to-many relationship.

---

## Phase 5: User Story 3 - Consultar personal de turno en un Sector (Priority: P2)

**Goal**: Any user with access can query a sector to see all staff on shift for a specific date and time range, grouped by area

**Independent Test**: Select sector "USI" and date range 08:00-20:00 today. Verify the query returns all shifts from all areas in the sector that overlap with the range. Verify results are grouped by area with staff name, shift type, and time shown. Verify STAFF_HEALTH pre-fill with their current shift times.

**Depends on**: US1+US2 (sector with areas must exist, shifts must be scheduled)

### Implementation for User Story 3

- [ ] T029 [US3] Create staff query Server Action at `src/features/sector/api/sector-staff-actions.ts`: `getSectorStaffAction` — accepts `{ sectorId, date, startTime, endTime }`, validates access (ADMIN_HR/CHIEF_AREA/STAFF_HEALTH via UserArea join), fetches sectorArea IDs, queries shifts with three-part OR overlap clause, status IN (SCHEDULED, IN_PROGRESS), groups results by area. Returns `SectorStaffResult` per contracts
- [ ] T030 [US3] Update `src/features/sector/api/index.ts` to export `getSectorStaffAction`
- [ ] T031 [US3] Add staff query i18n keys to `messages/es.json` and `messages/en.json`: `sectors.staffQuery.*` (title, description, dateLabel, startTimeLabel, endTimeLabel, searchButton, noResults, totalStaff, areaGroup headers, extraBadge, shiftTime format labels)
- [ ] T032 [US3] Create `src/features/sector/ui/sector-staff-query.tsx` — client component with: sector selector (if multiple), date picker (Input type="date"), start time picker (Input type="time"), end time picker (Input type="time"), search button, results display grouped by area with Cards. Each area card shows staff list with name, shiftType badge (colored), time range, isExtra badge. Empty state message. For STAFF_HEALTH: auto-detect current shift and pre-fill date/times
- [ ] T033 [US3] Create staff query page at `app/[locale]/dashboard/sectors/[id]/staff/page.tsx` — Server Component with auth check (all roles with sector access), fetch sector data, render SectorStaffQuery component
- [ ] T034 [US3] Update `src/features/sector/ui/index.ts` to export SectorStaffQuery
- [ ] T035 [US3] Add "Ver personal" action button in `src/features/sector/ui/sectors-table.tsx` that links to `/dashboard/sectors/[id]/staff` for each sector row

**Checkpoint**: Core feature complete. Users can query who's on shift across a sector for any date and time range.

---

## Phase 6: User Story 4 - Visualización de Sectores en lista (Priority: P3)

**Goal**: Sectors list page shows enhanced summary with area count and current on-shift staff count

**Independent Test**: Access sectors list. Verify each sector shows name, icon, area count, and number of staff currently on shift. Verify CHIEF_AREA only sees sectors containing their areas.

**Depends on**: US1 (sectors list must exist)

### Implementation for User Story 4

- [ ] T036 [US4] Enhance `getSectorsAction` in `src/features/sector/api/sector-actions.ts` to include a `currentStaffCount` field — for each sector, count shifts with status SCHEDULED/IN_PROGRESS where startTime <= now <= endTime across all sector areas
- [ ] T037 [US4] Update `src/features/sector/ui/sectors-table.tsx` to display `currentStaffCount` column showing number of staff currently on shift per sector, with appropriate empty state and loading indicators

**Checkpoint**: All user stories complete. Full feature functional.

---

## Phase 7: Polish & Verification

**Purpose**: Build verification and cross-cutting quality checks

- [ ] T038 Run `npx prisma generate` — verify no errors
- [ ] T039 Run `npm run build` — verify clean compilation (TypeScript + ESLint + i18n key completeness)
- [ ] T040 Run `npm run lint` — verify no ESLint errors
- [ ] T041 Manual browser verification: create sector, assign areas, query staff, delete sector — full flow walkthrough per spec acceptance scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 - CRUD)**: Depends on Phase 2
- **Phase 4 (US2 - Area assignment)**: Depends on Phase 3 (US1 must provide sector edit page)
- **Phase 5 (US3 - Staff query)**: Depends on Phase 2 (foundational) — can start after Phase 2 but needs US1+US2 data for testing
- **Phase 6 (US4 - Summary view)**: Depends on Phase 3 (US1 must provide sectors table)
- **Phase 7 (Polish)**: Depends on all desired phases being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1 - CRUD) ←── MVP STOP POINT
    ↓              ↘
Phase 4 (US2)    Phase 6 (US4) [can parallel]
    ↓
Phase 5 (US3)
    ↓
Phase 7 (Polish)
```

- **US1 (P1)**: After Phase 2 — no story dependencies
- **US2 (P1)**: After US1 — needs sector edit page
- **US3 (P2)**: After Phase 2 — technically independent but needs US1+US2 data for meaningful testing
- **US4 (P3)**: After US1 — needs sectors table component

### Within Each User Story

- Server Actions before UI components
- UI components before route pages
- API exports before UI imports

### Parallel Opportunities

- **Phase 2**: T006, T007, T008, T009 can all run in parallel (different files, no dependencies)
- **Phase 3**: T018, T019, T020 can run in parallel (different UI components); T022, T023 can run in parallel (different pages)
- **Phase 5 + Phase 6**: US3 and US4 can run in parallel (different concerns, different files)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch parallel foundational tasks (different files):
Task: "Create types at src/features/sector/lib/types.ts"
Task: "Create Zod schemas at src/features/sector/lib/schemas/sector-schema.ts"
Task: "Create server validation messages at src/features/sector/lib/validation/server/sector-messages.ts"
Task: "Create client validation messages at src/features/sector/lib/validation/client/sector-messages.ts"
```

## Parallel Example: Phase 3 (US1 - CRUD UI)

```bash
# Launch parallel UI components (different files):
Task: "Create create-sector-form.tsx"
Task: "Create sectors-table.tsx"
Task: "Create sector-basic-info-card.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (migration + schema)
2. Complete Phase 2: Foundational (repository, schemas, translations, nav)
3. Complete Phase 3: US1 - CRUD Sectores
4. **STOP and VALIDATE**: Create/edit/delete sectors works end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. + Phase 3 (US1) → CRUD functional → **MVP!**
3. + Phase 4 (US2) → Area assignment → **Full management**
4. + Phase 5 (US3) → Staff query → **Core value delivered**
5. + Phase 6 (US4) → Summary view → **Complete feature**
6. Phase 7 → Verified and polished

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps each task to its user story for traceability
- All Server Actions use `requireAdminHRWithOrg()` for writes, custom role check for reads
- All strings via `useTranslations`/`getTranslations` — no literal text in JSX
- All Prisma queries include `organizationId` filtering
- Junction table operations use `prisma.$transaction()` for atomicity
- Overlap query uses three-part OR clause per `shift-validation.ts` pattern
- Follow existing `area` feature patterns for all file structures
