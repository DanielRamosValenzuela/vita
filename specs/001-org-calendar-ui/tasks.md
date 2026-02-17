# Tasks: UI para Gestión del Calendario Organizacional

**Input**: Design documents from `/specs/001-org-calendar-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Tests are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Since the feature is ~60% implemented, many tasks are modifications to existing files rather than new creations.

**Holiday Data Strategy**: National holidays come from a public API (`https://api.boostr.cl/holidays`) via a BFF that the user will create. A sample JSON mock is provided for development. No static TypeScript constant files are needed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- FSD structure: `src/shared/`, `src/entities/`, `src/features/`, `src/widgets/`
- Feature code: `src/features/admin-hr/`
- Widget: `src/widgets/calendar-view/`
- Route: `app/[locale]/dashboard/calendar/`
- i18n: `messages/es.json`, `messages/en.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Zod schemas, holiday API types/mock, and i18n keys that all user stories depend on.

- [ ] T001 [P] Create Zod validation schemas for calendar day and import forms in `src/features/admin-hr/lib/calendar-schemas.ts`. Include `calendarDaySchema` (date, type enum HOLIDAY|IRRENUNCIABLE|ORGANIZATION_HOLIDAY|CUSTOM, name max 100 optional, description max 500 optional, multiplier min 0.1) and `importHolidaysSchema` (year min 2024 max 2030, selectedHolidays array of objects with date string YYYY-MM-DD, title string, inalienable boolean, min 1 item). Export inferred types `CalendarDayInput` and `ImportHolidaysInput`.

- [ ] T002 [P] Create holiday API types at `src/shared/lib/types/holidays.ts`. Define `BoostrHoliday` interface matching the API shape: `{ date: string; title: string; type: string; inalienable: boolean; extra: string }`. Define `BoostrHolidaysResponse` as `{ status: string; data: BoostrHoliday[] }`. Export both. Also export a helper type `MappedHoliday` with `{ date: string; title: string; inalienable: boolean; dayType: 'HOLIDAY' | 'IRRENUNCIABLE'; defaultMultiplier: number }` used for UI display after mapping `inalienable` → `IRRENUNCIABLE` (2.5x) vs `HOLIDAY` (1.5x).

- [ ] T003 [P] Create sample holidays JSON mock at `src/shared/lib/constants/holidays-cl-sample.json`. Base it on the Boostr API response shape for Chilean holidays 2026. Include all ~16 official holidays with fields: `date` (YYYY-MM-DD), `title` (Spanish name), `type` ("Civil"), `inalienable` (boolean), `extra` ("Civil" or "Civil e Irrenunciable"). This mock is for development/fallback while the BFF is built. Wrap in `{ "status": "success", "data": [...] }`.

- [ ] T004 [P] Create a holiday fetcher service at `src/features/admin-hr/lib/holiday-service.ts`. Export an async function `fetchNationalHolidays(year: number): Promise<MappedHoliday[]>` that: (1) calls the BFF endpoint (configurable via env var `NEXT_PUBLIC_BFF_HOLIDAYS_URL` or fallback to a hardcoded path), (2) parses the `BoostrHolidaysResponse`, (3) maps each entry to `MappedHoliday` (mapping `inalienable: true` → `dayType: 'IRRENUNCIABLE'`, `defaultMultiplier: 2.5`; `false` → `dayType: 'HOLIDAY'`, `defaultMultiplier: 1.5`), (4) returns the mapped array. For now, if the BFF is not available, import and return the sample JSON from T003 as fallback. Add a `// TODO: Remove fallback once BFF is live` comment.

- [ ] T005 [P] Add i18n keys for weekday names and import UI to `messages/es.json` under `adminHR.calendar`. Add: `weekdays` object with `sun: "Dom"`, `mon: "Lun"`, `tue: "Mar"`, `wed: "Mié"`, `thu: "Jue"`, `fri: "Vie"`, `sat: "Sáb"`. Add `import` object with keys: `button: "Importar Feriados"`, `title: "Importar Feriados Nacionales"`, `description: "Selecciona los feriados nacionales que deseas importar al calendario de tu organización."`, `yearLabel: "Año"`, `selectAll: "Seleccionar todos"`, `deselectAll: "Deseleccionar todos"`, `alreadyImported: "Ya importado"`, `importButton: "Importar Seleccionados"`, `importing: "Importando..."`, `successMessage: "{count} feriados importados"`, `skippedMessage: "{skipped} ya existían"`, `noHolidays: "No hay datos de feriados disponibles para este año"`, `loadingHolidays: "Cargando feriados..."`, `errorLoading: "Error al cargar feriados. Intenta nuevamente."`. Add `summary` object with `title: "Resumen del Mes"`, `total: "{count} días especiales"`, `noSpecialDays: "Sin días especiales este mes"`.

- [ ] T006 [P] Add equivalent i18n keys to `messages/en.json` under `adminHR.calendar`. Mirror the same structure as T005 but with English translations: weekdays (Sun, Mon, Tue, Wed, Thu, Fri, Sat), import UI strings (Import Holidays, Import National Holidays, loading/error states), and summary strings.

**Checkpoint**: All shared infrastructure ready. Zod schemas, holiday API types/mock, fetcher service, and i18n keys available for all user stories.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix existing constitution violations and update Server Actions with Zod validation. These changes affect all user stories.

**⚠️ CRITICAL**: User story work depends on these fixes being in place.

- [ ] T007 Fix hardcoded Spanish weekday names in `src/widgets/calendar-view/organization-calendar-view.tsx` line 91. Replace the `['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(...)` array with i18n calls using `t('weekdays.sun')`, `t('weekdays.mon')`, etc. from the keys added in T005/T006.

- [ ] T008 Update `upsertCalendarDayAction` in `src/features/admin-hr/api/calendar-actions.ts` to use the `calendarDaySchema` from T001 for input validation. Import the schema, parse incoming data with `calendarDaySchema.parse(data)`, and replace the manual `parseFloat` + `isNaN` check. Ensure multiplier minimum is 0.1 (not 0). Keep the existing upsert logic, auth guard, and revalidation unchanged.

- [ ] T009 Update the `calendar-actions.ts` barrel export in `src/features/admin-hr/api/index.ts` to export the new types (`CalendarDayInput`, `ImportHolidaysInput`) if not already re-exported.

**Checkpoint**: Foundation ready — i18n compliant, Zod validation active. User story implementation can begin.

---

## Phase 3: User Story 1 — Visualizar y gestionar días especiales (Priority: P1) 🎯 MVP

**Goal**: ADMIN_HR can view the monthly calendar, create/edit special days via a Sheet (lateral drawer), and delete them with AlertDialog confirmation. Full CRUD cycle.

**Independent Test**: Open `/dashboard/calendar`, click a date, fill the Sheet form, save, see it on the calendar. Click it again, edit or delete. Verify persistence after page reload.

### Implementation for User Story 1

- [ ] T010 [US1] Migrate `CalendarDayForm` in `src/features/admin-hr/ui/calendar-day-form.tsx` from Dialog to Sheet. Replace all Dialog imports (`Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription`) with Sheet equivalents (`Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription`) from `@/src/shared/ui/sheet`. Use `side="right"` on `SheetContent`. Keep form fields, validation logic, and submit handler identical. Update the form to use the Zod schema from T001 for client-side validation of multiplier (min 0.1).

- [ ] T011 [US1] Add delete functionality to the Sheet form in `src/features/admin-hr/ui/calendar-day-form.tsx`. When `existingDay` is provided (editing mode), show a destructive "Delete" button at the bottom of the form. Clicking it opens an AlertDialog (from `@/src/shared/ui/alert-dialog`) with the confirmation message from i18n key `adminHR.calendar.delete.description` (already exists, uses `{name}` placeholder). On confirm, call `deleteCalendarDayAction(existingDay.id)`, show toast, close Sheet, and `router.refresh()`. The delete button must handle `isPending` state and be disabled while deleting. Pass `existingDay.id` as a new prop to the component.

- [ ] T012 [US1] Update `OrganizationCalendarPage` in `src/features/admin-hr/ui/organization-calendar-page.tsx` to pass the `id` field of the existing calendar day to `CalendarDayForm`. Currently `existingDay` is found by matching dates but the `id` is not passed. Add `id` to the matched day object so the form can use it for deletion.

**Checkpoint**: User Story 1 fully functional — CRUD via Sheet with delete confirmation. Independently testable.

---

## Phase 4: User Story 2 — Navegar entre meses y ver resumen (Priority: P2)

**Goal**: ADMIN_HR can navigate month-to-month and see a summary badge showing count of special days by type for the active month.

**Independent Test**: Navigate to future/past months, verify special days load correctly. Verify summary shows correct counts (e.g., "3 feriados, 1 día organizacional").

### Implementation for User Story 2

- [ ] T013 [US2] Update `OrganizationCalendarView` in `src/widgets/calendar-view/organization-calendar-view.tsx` to fetch new month data when navigating. Currently the component receives `calendarDays` as a prop from the server and uses `useState` for `currentDate`, but when the user navigates months the data doesn't refresh — only the grid changes. Add a callback prop `onMonthChange?: (year: number, month: number) => void` that the parent can use to fetch new data for the selected month.

- [ ] T014 [US2] Update `OrganizationCalendarPage` in `src/features/admin-hr/ui/organization-calendar-page.tsx` to handle month navigation. Implement a `handleMonthChange` callback that calls `getOrganizationCalendarAction(year, month)` when the user navigates, updates local state with the new calendar days, and passes them to `OrganizationCalendarView`. Use `useTransition` for loading state.

- [ ] T015 [US2] Add a month summary section to `OrganizationCalendarView` in `src/widgets/calendar-view/organization-calendar-view.tsx`. Below the navigation header (or above the legend), add a compact summary that counts special days by type for the current month's `calendarDays` data. Use i18n keys from `adminHR.calendar.summary.*` (T005/T006). Show badges like "3 Feriados · 1 Irrenunciable · 2 Organizacionales" or "Sin días especiales este mes" if empty. Compute counts client-side from the `calendarDays` prop.

**Checkpoint**: User Story 2 complete — month navigation fetches fresh data, summary displays accurate counts. Independently testable.

---

## Phase 5: User Story 3 — Importación masiva de feriados nacionales (Priority: P3)

**Goal**: ADMIN_HR can bulk-import national holidays fetched from the BFF (Boostr API proxy) for their organization. Supports duplicate detection.

**Independent Test**: Click "Import Holidays", see the list of Chilean holidays for the selected year, select holidays, import them. Verify they appear on the calendar. Try importing again — already-imported ones are marked.

### Implementation for User Story 3

- [ ] T016 [US3] Create `importNationalHolidaysAction` Server Action in `src/features/admin-hr/api/calendar-actions.ts`. Accept `ImportHolidaysInput` (from T001 Zod schema). Auth with `requireAdminHRWithOrg()`. For each selected holiday, parse the date string to construct a `Date` object. Use `prisma.organizationCalendar.createMany` with `skipDuplicates: true` to handle already-existing dates. Set `type` based on `inalienable` field: `true` → `IRRENUNCIABLE`, `false` → `HOLIDAY`. Set `multiplier` to 2.5 for IRRENUNCIABLE, 1.5 for HOLIDAY. Return `ActionResult<{ imported: number; skipped: number }>` with counts. Revalidate `/dashboard/calendar`.

- [ ] T017 [US3] Create `CalendarImportDialog` component at `src/features/admin-hr/ui/calendar-import-dialog.tsx`. Client component using Dialog (not Sheet — this is a modal workflow). Props: `existingDates: Date[]` (to detect already-imported). Features: year selector (default: current year). On year change, call `fetchNationalHolidays(year)` from the holiday service (T004) to load holidays asynchronously. Show a loading spinner while fetching (use i18n key `adminHR.calendar.import.loadingHolidays`). Handle fetch errors with retry button (i18n key `adminHR.calendar.import.errorLoading`). Render a checkbox list with columns: checkbox, date formatted, title, type badge (Feriado/Irrenunciable), default multiplier. Already-imported dates show disabled checkbox with "Ya importado" text. "Select All" / "Deselect All" toggle. "Import Selected" button calls `importNationalHolidaysAction`. Shows toast with imported/skipped counts. Use `useTransition` for pending state.

- [ ] T018 [US3] Add "Import Holidays" button and wire up the import dialog in `src/features/admin-hr/ui/organization-calendar-page.tsx`. Add a button (using i18n key `adminHR.calendar.import.button`) in the page header area. Clicking it opens the `CalendarImportDialog`. Pass the list of existing calendar day dates (extracted from current `calendarDays` state) to the dialog. After successful import, call `router.refresh()` or the `handleMonthChange` from T014 to refresh the data.

- [ ] T019 [US3] Export the new `CalendarImportDialog` component and `importNationalHolidaysAction` from their respective barrel files (`src/features/admin-hr/ui/index.ts` and `src/features/admin-hr/api/index.ts`).

**Checkpoint**: User Story 3 complete — bulk import works with BFF data and duplicate detection. All 3 user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final validation.

- [ ] T020 [P] Verify Shadcn Sheet component exists at `src/shared/ui/sheet.tsx`. If not present, install it using `npx shadcn@latest add sheet`. Similarly verify AlertDialog exists at `src/shared/ui/alert-dialog.tsx` and Checkbox at `src/shared/ui/checkbox.tsx`.

- [ ] T021 [P] Run `npm run lint` and fix any ESLint errors introduced by the changes. Ensure no `react/jsx-no-literals` violations exist in any modified or new files.

- [ ] T022 [P] Run `npm run build` and verify the build succeeds with no TypeScript errors.

- [ ] T023 Update `docs/vita-workflows.md` — in the "Gestión del Calendario Organizacional" section (currently marked with ✅ and ⏳), update the status to reflect the completed features: ✅ UI for marking special days (Sheet form), ✅ CRUD with delete confirmation, ✅ Month navigation with summary, ✅ Bulk import of national holidays (via BFF/Boostr API). Keep ⏳ for recurring days and auto-import.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. T001-T006 are parallelizable.
- **Foundational (Phase 2)**: Depends on T001 (Zod schemas) and T005/T006 (i18n keys). BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. No dependency on other stories.
- **User Story 2 (Phase 4)**: Depends on Phase 2. No dependency on US1 (navigation works independently).
- **User Story 3 (Phase 5)**: Depends on Phase 1 (holiday types T002, service T004) and Phase 2. No dependency on US1/US2.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 → T010 → T011 → T012 (sequential: Sheet first, then delete, then wire id)
- **User Story 2 (P2)**: Phase 2 → T013, T014 (sequential: callback first, then handler) → T015 (parallel with T014)
- **User Story 3 (P3)**: Phase 1 + Phase 2 → T016 (action) → T017 (dialog) → T018 (wire up) → T019 (exports)

### Within Each User Story

- Core action changes before UI changes
- UI wrapper changes before integration wiring
- Export/barrel updates last

### Parallel Opportunities

**Phase 1** (all parallelizable):
```
T001 (Zod schemas)
T002 (holiday API types)
T003 (sample holidays JSON)
T004 (holiday fetcher service)
T005 (es.json)           T006 (en.json)
```

**Phase 2** (T007 parallel with T008):
```
T007 (fix i18n weekdays)  ||  T008 (Zod in actions)
T009 (exports, after T008)
```

**User Stories** (can run in parallel after Phase 2):
```
US1: T010 → T011 → T012
US2: T013 → T014 → T015
US3: T016 → T017 → T018 → T019
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T009)
3. Complete Phase 3: User Story 1 (T010-T012)
4. **STOP and VALIDATE**: Test CRUD via Sheet, delete with AlertDialog
5. Run `npm run lint` + `npm run build`

### Incremental Delivery

1. Setup + Foundational → Shared infrastructure ready
2. Add User Story 1 → Test CRUD independently → **MVP ready**
3. Add User Story 2 → Test navigation + summary independently
4. Add User Story 3 → Test import independently
5. Polish → Lint, build, docs update

### Recommended Execution Order (Sequential)

For a single developer working sequentially:

1. T001, T002, T003, T004 (parallel: schemas, types, JSON, service)
2. T005, T006 (parallel i18n files)
3. T020 (verify Shadcn components exist)
4. T007, T008 (parallel: i18n fix + Zod actions) → T009
5. T010 → T011 → T012 (US1: Sheet → Delete → Wire ID)
6. T013 → T014 → T015 (US2: Callback → Handler → Summary)
7. T016 → T017 → T018 → T019 (US3: Action → Dialog → Wire → Exports)
8. T021 → T022 → T023 (Polish: Lint → Build → Docs)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No Prisma schema changes needed — model already exists
- Holiday data fetched from BFF (Boostr API proxy), not static constants
- Sample JSON mock (`holidays-cl-sample.json`) used as fallback during development
- BFF will be created separately by the user; the fetcher service (T004) abstracts the source
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- Existing code to modify: `calendar-day-form.tsx`, `organization-calendar-page.tsx`, `organization-calendar-view.tsx`, `calendar-actions.ts`
- New files: `calendar-schemas.ts`, `holidays.ts` (types), `holidays-cl-sample.json`, `holiday-service.ts`, `calendar-import-dialog.tsx`
