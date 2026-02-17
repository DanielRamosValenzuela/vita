# Tasks: Arreglar y Mejorar Sistema de Turnos (/dashboard/shifts)

**Input**: Code exploration and bug analysis of existing shifts system
**Prerequisites**: No spec.md or plan.md — this is a fix/improvement task based on codebase audit

**Tests**: Not requested. Manual validation via `npm run lint` + `npm run build`.

**Organization**: Tasks grouped by user story to enable independent implementation and testing. The shifts system is ~80% built but has broken i18n, non-functional filters, a poor calendar UX, no area switcher, and no edit/delete UI.

## Issues Identified (Code Audit)

1. **i18n broken in ShiftForm**: Form uses flat keys (`t('titleLabel')`) but JSON has nested keys (`title.label`). Duplicate key `form.title` in es.json (string on line 311, object on line 313 — object overwrites string).
2. **Hardcoded Spanish in Zod schema**: `shift-form.tsx` lines 34-42 — `'Selecciona un usuario'`, `'Selecciona un área'`, `'Selecciona un tipo de turno'`, `'Selecciona una fecha de inicio'`, `'Ingresa la hora de inicio'`, `'Ingresa la hora de fin'`.
3. **Hardcoded strings in page.tsx**: `'Sin título'` (lines 108, 257), `'N/A'` (line 258).
4. **Hardcoded English in filters**: `'Select date'` in `shift-filters.tsx` lines 263, 279.
5. **No area switcher**: Shows all areas in a filter dropdown. No prominent switch/tabs for CHIEF_AREA or ADMIN_HR to navigate between their areas.
6. **Calendar is a tiny date-picker**: Uses Shadcn `Calendar` (react-day-picker) with `h-24` cells. Shifts are crammed and hard to read.
7. **Calendar doesn't reload on month navigation**: Data loaded server-side once for current month. Navigation to other months shows empty days.
8. **Filters don't work**: No `onFiltersChange` callback passed in `page.tsx` line 219. Filters are purely visual.
9. **Date filter popovers are empty**: `shift-filters.tsx` lines 261-265 and 275-280 show text but no Calendar picker inside.
10. **No edit/delete shift UI**: Only create exists. `onShiftClick` callback on calendar is unused.
11. **ShiftForm wrapped in Card inside Dialog**: Double container — Card header inside Dialog is redundant.
12. **Calendar legend shows status colors but shifts display shiftType colors**: Misleading legend.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1=i18n fix, US2=area switcher, US3=calendar UX, US4=functional filters, US5=edit/delete)

## Path Conventions

- Feature code: `src/features/shifts/`
- Widget: `src/widgets/` (if calendar becomes a widget)
- Route: `app/[locale]/dashboard/shifts/`
- i18n: `messages/es.json`, `messages/en.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add missing i18n keys and create shared types needed for all user stories.

- [x] T001 [P] Fix duplicate `form.title` key conflict in `messages/es.json` (line 311 is string `"Crear Turno"`, line 313 is object `{ label, placeholder }`). Resolve by removing the string `"title": "Crear Turno"` line and keeping only the nested object. Add a new key `form.createTitle` for the card title string `"Crear Turno"` and `form.editTitle` for `"Editar Turno"`. Also add missing keys under `shifts.form`: `save: "Guardar"`, `saving: "Guardando..."`, `checking: "Verificando..."`, `noTitle: "Sin título"`. Add `shifts.table.noTitle: "Sin título"`, `shifts.table.noRole: "N/A"`. Add under `shifts.filters`: `selectDate: "Seleccionar fecha"`. Add under `shifts.validation`: `userRequired: "Selecciona un usuario"`, `areaRequired: "Selecciona un área"`, `shiftTypeRequired: "Selecciona un tipo de turno"`, `startDateRequired: "Selecciona una fecha de inicio"`, `startTimeRequired: "Ingresa la hora de inicio"`, `endTimeRequired: "Ingresa la hora de fin"`. Add under `shifts`: `areaSwitcher.label: "Área"`, `areaSwitcher.allAreas: "Todas las áreas"`, `areaSwitcher.noAreas: "Sin áreas asignadas"`.

- [x] T002 [P] Add equivalent English i18n keys to `messages/en.json`. Fix the same `form.title` conflict. Add: `form.createTitle: "Create Shift"`, `form.editTitle: "Edit Shift"`, `form.save: "Save"`, `form.saving: "Saving..."`, `form.checking: "Checking..."`, `form.noTitle: "No title"`. Add `table.noTitle: "No title"`, `table.noRole: "N/A"`. Add `filters.selectDate: "Select date"`. Add `validation.userRequired`, `validation.areaRequired`, `validation.shiftTypeRequired`, `validation.startDateRequired`, `validation.startTimeRequired`, `validation.endTimeRequired` with English text. Add `areaSwitcher.label: "Area"`, `areaSwitcher.allAreas: "All areas"`, `areaSwitcher.noAreas: "No assigned areas"`.

- [x] T003 [P] Create shift form Zod schemas file at `src/features/shifts/lib/shift-form-schemas.ts`. Move the client-side `shiftSchema` from `shift-form.tsx` lines 32-44 into this new file. Replace all hardcoded Spanish validation messages with i18n-compatible approach: use Zod `.min(1)` without message strings (let the form handle error display), or use a factory function `createShiftSchema(t: (key: string) => string)` that takes a translation function and passes translated messages. Export the schema and inferred type `ShiftFormData`.

**Checkpoint**: i18n keys and schemas ready. No visual changes yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix critical i18n violations and broken form wiring that affect all user stories.

**⚠️ CRITICAL**: These fixes must be in place before UI improvements.

- [x] T004 Fix i18n key references in `src/features/shifts/ui/shift-form.tsx`. The form uses `t('titleLabel')`, `t('userPlaceholder')`, etc. but the JSON has nested keys `title.label`, `user.placeholder`. Update ALL `t()` calls to match the actual JSON structure: `t('title.label')`, `t('title.placeholder')`, `t('user.label')`, `t('user.placeholder')`, `t('area.label')`, `t('area.placeholder')`, `t('shiftType.label')`, `t('shiftType.placeholder')`, `t('date.label')`, `t('date.placeholder')`, `t('startTime.label')`, `t('endTime.label')`, `t('notes.label')`, `t('notes.placeholder')`. Replace hardcoded `t('selectedUser')`, `t('selectedArea')`, `t('selectedShiftType')` with properly defined keys or remove the redundant helper text. Use the Zod schema from T003 instead of the inline schema. Replace `t('createTitle')` / `t('editTitle')` for the Card header.

- [x] T005 Fix hardcoded strings in `app/[locale]/dashboard/shifts/page.tsx`. Replace `'Sin título'` on lines 108 and 257 with `t('form.noTitle')` or `t('table.noTitle')`. Replace `'N/A'` on line 258 with `t('table.noRole')`. Note: this is a Server Component so it uses `getTranslations` (already set up on line 45).

- [x] T006 Fix hardcoded strings in `src/features/shifts/ui/shift-filters.tsx`. Replace `'Select date'` on lines 263 and 279 with `t('selectDate')` (already scoped to `shifts.filters`). These are inside the date filter Popover content areas.

- [x] T007 Remove redundant Card wrapper from `src/features/shifts/ui/shift-form.tsx`. The form is rendered inside a Dialog (via `shift-form-dialog.tsx`), but the form itself wraps content in `<Card><CardHeader><CardTitle>...<CardContent>`. This creates a double container (Dialog > Card). Remove the Card/CardHeader/CardTitle/CardContent wrappers — keep only the `<form>` element with its content. The dialog title is already handled by `DialogHeader` in `shift-form-dialog.tsx`.

**Checkpoint**: All i18n violations fixed. Form renders correctly inside Dialog without double container.

---

## Phase 3: User Story 1 — Area Switcher for Multi-Area Navigation (Priority: P1) 🎯 MVP

**Goal**: ADMIN_HR and CHIEF_AREA can switch between their assigned areas using a prominent, well-designed switcher component. The page content (shifts, calendar, table) filters by the selected area. Selecting "All areas" shows everything.

**Independent Test**: Load `/dashboard/shifts` as CHIEF_AREA with 2+ areas. See a visible area switcher (tabs or segmented control). Switch areas — shifts, calendar, and table update to show only that area's data. Select "All" to see everything.

### Implementation for User Story 1

- [x] T008 [US1] Create `AreaSwitcher` client component at `src/features/shifts/ui/area-switcher.tsx`. Props: `areas: Array<{ id: string; name: string; color?: string; icon?: string }>`, `selectedAreaId: string | null` (null = all areas), `onAreaChange: (areaId: string | null) => void`. Use Shadcn `Tabs` or `ToggleGroup` component for a clean segmented control look. Show an "All areas" option first (using i18n key `shifts.areaSwitcher.allAreas`), then each area with its name and optional color indicator. Highlight the active selection. Style with proper spacing and responsive behavior (horizontal scroll on mobile if many areas).

- [x] T009 [US1] Refactor `app/[locale]/dashboard/shifts/page.tsx` to make it a thin server wrapper. Currently it's a 283-line server component with inline UI. Extract the client-side interactive parts (stats, filters, calendar, table, area switcher) into a new client component `ShiftsPageContent` at `src/features/shifts/ui/shifts-page-content.tsx`. The server page.tsx should only: (1) auth with `requireAdminHROrChiefArea`, (2) resolve `organizationId`, (3) fetch initial data (shiftTypes, users, areas, shifts), (4) render `<ShiftsPageContent>` with the data as props. This enables client-side area switching, filter changes, and calendar navigation without full page reloads.

- [x] T010 [US1] In the new `ShiftsPageContent` component (`src/features/shifts/ui/shifts-page-content.tsx`), add the `AreaSwitcher` at the top of the page (below the header, above stats). When the area changes: (1) call `getShiftsAction` with the selected `areaId` filter, (2) update the local shifts state, (3) re-render stats, calendar, and table with filtered data. Use `useTransition` for loading state. If the user is CHIEF_AREA, only show their assigned areas in the switcher. If ADMIN_HR, show all org areas.

**Checkpoint**: Area switcher works. CHIEF_AREA and ADMIN_HR can navigate between areas. All content updates on area change.

---

## Phase 4: User Story 2 — Functional Filters and Data Refresh (Priority: P2)

**Goal**: Filters actually filter shifts. Date pickers work. Month navigation reloads data. The page is fully interactive.

**Independent Test**: Apply a status filter — table and calendar update. Use date range filter — shifts outside range disappear. Navigate calendar to next month — data loads for that month.

### Implementation for User Story 2

- [x] T011 [US2] Wire up `ShiftFilters` in the `ShiftsPageContent` component. Pass an `onFiltersChange` callback that: (1) updates local filter state, (2) calls `getShiftsAction` with the combined filters (status, userId, areaId from switcher, shiftTypeId, startDate, endDate, search), (3) updates shifts state. Use debounce (300ms) for the search input to avoid excessive API calls. Include `useTransition` for loading indicator.

- [x] T012 [US2] Fix the broken date filter popovers in `src/features/shifts/ui/shift-filters.tsx`. Lines 261-265 and 275-280 render a `Popover` with just a text div instead of a Calendar picker. Replace the inner `<div>` with a Shadcn `<Calendar>` component (mode="single") that: (1) shows a proper date picker, (2) on select, updates the filter state via `updateFilters({ startDate: date })` or `updateFilters({ endDate: date })`, (3) closes the Popover after selection.

- [x] T013 [US2] Add month navigation data refresh. In `ShiftsPageContent`, when the `ShiftCalendar` component navigates to a different month, fetch shifts for that month range. Add a callback prop `onMonthChange` to `ShiftCalendar` that fires when the user navigates months. In the parent, call `getShiftsAction` with the new month's start/end dates (combined with current area and filters). Update the calendar's shifts prop with the new data.

**Checkpoint**: Filters work end-to-end. Calendar navigation loads data. Date pickers function properly.

---

## Phase 5: User Story 3 — Improved Calendar UX (Priority: P3)

**Goal**: The shift calendar looks professional and is easy to read. Shifts are displayed clearly with relevant info. The legend matches what's shown. Click-to-create on empty dates.

**Independent Test**: View the calendar — shifts show user name, time range, and type color. Click an empty date — the create shift dialog opens with that date pre-filled. Legend matches the visual indicators.

### Implementation for User Story 3

- [x] T014 [US3] Redesign `src/features/shifts/ui/shift-calendar.tsx` for better visual display. Current issues: (1) cells are `h-24` which is too small, (2) shifts show only first name truncated, (3) legend shows status colors but shifts use shiftType colors. Improvements: increase cell height to `h-28` or `h-32` for better readability. Each shift pill should show: time range (e.g., "09-17"), user first name, and use the shiftType color consistently. Fix the legend to show shiftType colors (from the data) instead of hardcoded status colors — or show both legends (one for shiftType, one for status with opacity). Add hover tooltip (using Shadcn `Tooltip`) on each shift pill showing full details: user name, shift type, area, time range.

- [x] T015 [US3] Add click-to-create functionality on the calendar. When a user clicks on an empty date cell (or uses a "+" button on the date), fire the `onDateSelect` callback. In `ShiftsPageContent`, handle this by opening the `ShiftFormDialog` with `initialData.startDate` pre-set to the clicked date. Modify `ShiftFormDialog` to accept an optional `initialDate?: Date` prop that pre-fills the start date in `ShiftForm`.

- [x] T016 [US3] Improve the calendar month header. Replace the hardcoded `{ locale: es }` on line 116 of `shift-calendar.tsx` with dynamic locale from `useLocale()` import from `next-intl`. Use `{ locale: locale === 'es' ? es : enUS }` from date-fns locales to properly support i18n. Capitalize the first letter of the month name.

**Checkpoint**: Calendar looks polished with readable shift pills, proper legend, tooltips, and click-to-create.

---

## Phase 6: User Story 4 — Edit and Delete Shifts (Priority: P4)

**Goal**: ADMIN_HR and CHIEF_AREA can click on a shift in the calendar or table to edit its details or cancel it.

**Independent Test**: Click a shift in the calendar — a Sheet opens with the shift details pre-filled. Edit the time and save — the calendar updates. Click "Cancel Shift" — AlertDialog confirms, shift is marked CANCELLED.

### Implementation for User Story 4

- [ ] T017 [US4] Create `ShiftDetailSheet` component at `src/features/shifts/ui/shift-detail-sheet.tsx`. Client component using Sheet (side="right"). Props: `shift: ShiftWithRelations | null`, `open: boolean`, `onOpenChange`, `areas`, `users`, `shiftTypes`. Shows the shift details in an editable form (reuse `ShiftForm` fields or create a dedicated edit layout). Includes: (1) Pre-filled form fields with current shift data, (2) "Save Changes" button that calls `updateShiftAction`, (3) "Cancel Shift" destructive button that opens an AlertDialog for confirmation, then calls `deleteShiftAction` (which sets status to CANCELLED). Handle `isPending` states for both operations. After success, close the Sheet and refresh data via `router.refresh()`.

- [ ] T018 [US4] Wire up shift clicking in `ShiftsPageContent`. When a shift is clicked in the calendar (via `onShiftClick` callback — already defined but unused) or in the table (add `onClick` to `TableRow`), open the `ShiftDetailSheet` with that shift's full data. Fetch the full shift if needed (the calendar only has partial data from the mapped `calendarShifts`). Store selected shift in state, pass to `ShiftDetailSheet`.

- [ ] T019 [US4] Add click-to-view in the shifts table in `ShiftsPageContent`. Each `TableRow` should be clickable (`cursor-pointer` + hover effect). On click, open the `ShiftDetailSheet` with that shift's data. The table already has the full `ShiftWithRelations` data from the server.

**Checkpoint**: Full CRUD cycle works. Users can create, view, edit, and cancel shifts from both calendar and table.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup.

- [x] T020 [P] Verify required Shadcn components exist. Check for: `tabs.tsx` or `toggle-group.tsx` (for area switcher), `sheet.tsx` (for shift detail), `alert-dialog.tsx` (for cancel confirmation), `tooltip.tsx` (for calendar tooltips). Install any missing with `npx shadcn@latest add <component>`.

- [x] T021 [P] Export all new components from barrel files. Update `src/features/shifts/ui/index.ts` to export `AreaSwitcher`, `ShiftsPageContent`, `ShiftDetailSheet`. Update `src/features/shifts/lib/` barrel (create if needed) to export `shift-form-schemas.ts`.

- [x] T022 [P] Run `npm run lint` and fix any ESLint errors. Verify no `react/jsx-no-literals` violations in any modified or new files.

- [x] T023 [P] Run `npm run build` and verify the build succeeds with no TypeScript errors.

- [x] T024 Review responsive behavior. Verify that: (1) area switcher scrolls horizontally on mobile, (2) calendar is readable on small screens, (3) ShiftDetailSheet works on mobile (full width), (4) filters collapse properly on narrow viewports.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. T001-T003 are parallelizable.
- **Foundational (Phase 2)**: Depends on T001/T002 (i18n keys) and T003 (schemas). BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. Enables US2 (filters need client component).
- **User Story 2 (Phase 4)**: Depends on US1 (needs `ShiftsPageContent` client component from T009).
- **User Story 3 (Phase 5)**: Depends on Phase 2. Can run in parallel with US1/US2 (calendar is independent).
- **User Story 4 (Phase 6)**: Depends on Phase 2. Can start after US1 (needs `ShiftsPageContent`).
- **Polish (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Phase 2 → T008 → T009 → T010
- **US2 (P2)**: US1 (T009) → T011 → T012 (parallel with T011) → T013
- **US3 (P3)**: Phase 2 → T014 → T015 → T016 (T014/T016 can be parallel)
- **US4 (P4)**: US1 (T009) → T017 → T018 → T019

### Parallel Opportunities

**Phase 1** (all parallelizable):

```
T001 (es.json)    T002 (en.json)    T003 (Zod schemas)
```

**Phase 2** (T004-T006 parallel, T007 parallel with T005/T006):

```
T004 (fix form i18n)  ||  T005 (fix page.tsx)  ||  T006 (fix filters)
T007 (remove Card wrapper, after T004)
```

**User Stories** (partially parallel after Phase 2):

```
US1: T008 → T009 → T010
US3: T014, T016 (parallel) → T015
    ↑ Can run alongside US1
US2: (after T009) T011, T012 (parallel) → T013
US4: (after T009) T017 → T018, T019 (parallel)
```

---

## Implementation Strategy

### MVP First (US1: Area Switcher + i18n Fixes)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: US1 — Area Switcher (T008-T010)
4. **STOP and VALIDATE**: i18n works, area switching works, page is client-interactive
5. Run `npm run lint` + `npm run build`

### Incremental Delivery

1. Setup + Foundational → All i18n fixed, form clean
2. Add US1 → Area switcher + client-side page → **MVP ready**
3. Add US2 → Filters work, data refreshes → **Functional**
4. Add US3 → Calendar looks great → **Polished**
5. Add US4 → Full CRUD → **Complete**
6. Polish → Lint, build, responsive check

### Recommended Execution Order (Sequential)

1. T001, T002, T003 (parallel: i18n + schemas)
2. T020 (verify Shadcn components)
3. T004, T005, T006 (parallel: i18n fixes) → T007
4. T008 → T009 → T010 (US1: switcher → page refactor → wire)
5. T014, T016 (parallel: calendar redesign + locale fix) → T015 (US3: click-to-create)
6. T011, T012 (parallel: wire filters + fix date pickers) → T013 (US2: month nav)
7. T017 → T018, T019 (parallel: sheet → wire calendar + table clicks) (US4)
8. T021 → T022 → T023 → T024 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- No Prisma schema changes needed — models already exist
- Key architectural change: page.tsx becomes thin server wrapper, new `ShiftsPageContent` client component handles all interactivity
- Area switcher serves both ADMIN_HR (all org areas) and CHIEF_AREA (only their assigned areas via UserArea)
- Filters are client-side state but trigger server action calls to reload data
- The ShiftForm Card wrapper removal (T007) may require adjusting spacing/padding in the Dialog
- Existing files to modify: `shift-form.tsx`, `shift-form-dialog.tsx`, `shift-calendar.tsx`, `shift-filters.tsx`, `page.tsx`, `es.json`, `en.json`
- New files: `shift-form-schemas.ts`, `area-switcher.tsx`, `shifts-page-content.tsx`, `shift-detail-sheet.tsx`
