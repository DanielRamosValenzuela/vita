# Tasks: Fix QA E2E Bugs & UX Issues

**Input**: Design documents from `/specs/008-fix-qa-bugs/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: No automated tests requested. Each fix verified via Browser MCP after implementation.

**Organization**: Tasks grouped by user story (P2-P7). US1 (P1 Auth) is ALREADY RESOLVED — skipped.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: US1 - Auth & Route Protection (Priority: P1) — ALREADY RESOLVED

**Status**: All 4 bugs (BUG-001, BUG-002, WF-001, WF-002) confirmed fixed in current codebase.
- `proxy.ts` handles auth middleware with JWT validation
- `app/[locale]/dashboard/layout.tsx:21-22` has `redirect()` fallback
- `src/features/auth/ui/login-form.tsx:21` uses `/${locale}/dashboard` as callbackUrl

No tasks needed.

---

## Phase 2: US2 - i18n & Translation Fixes (Priority: P2)

**Goal**: Fix missing Spanish translations in SUPER_ADMIN module and eliminate English-only signout page.

**Independent Test**: Login as SUPER_ADMIN, verify organization table actions show Spanish text. Click "Cerrar Sesion" and verify no English page appears.

- [x] T001 [P] [US2] Add missing `actions` object translations (view, edit, suspend, reactivate, delete) in `messages/es.json` under `superAdmin.organizations.actions` — replace the current string `"Acciones"` with an object containing sub-keys matching `messages/en.json` structure. Also verify `superAdmin.createOrganization.form.address.label` exists
- [x] T002 [P] [US2] Fix signout to skip English confirmation page — in `src/widgets/dashboard-sidebar/index.tsx` change `signOut()` call to use `signOut({ redirect: true, callbackUrl })` to bypass NextAuth default signout page. If needed, also add `pages: { signOut: false }` in `src/shared/lib/auth/config.ts` authOptions
- [x] T003 [US2] Verify BUG-011 fix with Browser MCP — login as SUPER_ADMIN (prueba10@gmail.com), navigate to `/es/dashboard/organizations`, verify action buttons show Spanish text, test suspend/reactivate/delete dialogs
- [x] T004 [US2] Verify UX-002 fix with Browser MCP — click "Cerrar Sesion" from sidebar menu and verify direct redirect to login without English page

**Checkpoint**: All SUPER_ADMIN i18n keys translated, signout flow fully in Spanish

---

## Phase 3: US3 - Profile UX Improvements (Priority: P3)

**Goal**: Reorder profile sections, add birth date year dropdown, fix phone input validation and placeholder.

**Independent Test**: Login as any user, navigate to `/es/dashboard/profile`, verify section order, calendar dropdown, phone input behavior.

- [x] T005 [P] [US3] Move DocumentSection before PersonalInfoForm in `app/[locale]/dashboard/profile/page.tsx` — move the `<DocumentSection>` block (currently at lines 92-98) to appear after `<AvatarUploadForm>` and before `<PersonalInfoForm>`
- [x] T006 [P] [US3] Add year/month dropdown to birth date calendar in `src/features/profile/ui/personal-info-form.tsx` — add `captionLayout="dropdown"` `fromYear={1920}` `toYear={new Date().getFullYear()}` props to the `<Calendar>` component at line 129
- [x] T007 [P] [US3] Fix phone input: add maxLength and character filter in `src/features/profile/ui/personal-info-form.tsx` — add `maxLength={20}` prop to phone Input (line ~101), add `onInput` handler that strips non-phone characters (keep digits, +, spaces, parentheses, hyphens only)
- [x] T008 [P] [US3] Change phone placeholder to Chilean format in `messages/es.json` — change `profile.personalInfo.phone.placeholder` from "+1 555 123 4567" to "+56 9 1234 5678"
- [x] T009 [US3] Verify US3 fixes with Browser MCP — login as any user, navigate to profile, verify: DocumentSection is above PersonalInfoForm, birth date calendar has year dropdown, phone input rejects letters, phone placeholder shows Chilean format, phone input stops at 20 chars

**Checkpoint**: Profile page fully functional with correct section order, usable date picker, validated phone input

---

## Phase 4: US4 - Dashboard & Calendar Bug Fixes (Priority: P4)

**Goal**: Fix staff calendar month reset and enable rotation shift clicks.

**Independent Test**: Login as STAFF (prueba1@vita.test), navigate calendar to month without shifts, click rotation shift indicators.

- [x] T010 [US4] Fix calendar remount in `src/features/staff-dashboard/ui/staff-calendar.tsx` — replace conditional rendering (lines 47-72) that creates two separate ShiftCalendar instances with a single ShiftCalendar instance. Show empty state message below/over the calendar instead of swapping components
- [x] T011 [US4] Add rotation-group handling in `src/features/staff-dashboard/ui/staff-dashboard-content.tsx` — modify `handleShiftClick` (lines 210-215) to also handle `event.kind === 'rotation-group'` by opening the detail panel with the first shift of the group (`event.shifts?.[0]?.id ?? event.id`)
- [x] T012 [US4] Verify US4 fixes with Browser MCP — login as STAFF, navigate calendar backward to month without shifts (verify it stays on selected month), navigate back to March and click on a rotation shift indicator (verify detail panel opens)

**Checkpoint**: Calendar navigation works across empty months, rotation shifts are clickable

---

## Phase 5: US5 - Navigation & Data Integrity Fixes (Priority: P5)

**Goal**: Fix area edit links locale prefix and add staff limit validation on invitation acceptance.

**Independent Test**: Login as ADMIN_HR, click area edit link, verify navigation. Check invitation acceptance respects org limits.

- [x] T013 [P] [US5] Fix area edit links locale prefix in `src/features/area/ui/areas-table.tsx` — verify that `Link` is imported from `@/i18n/navigation` (not `next/link`) at lines 107, 121, 184. If already using i18n Link, paths like `/dashboard/areas/new` should auto-prefix locale. If not, change the import
- [x] T014 [P] [US5] Add staff limit validation on invitation acceptance in `src/entities/invitation/lib/invitation-repository.ts` — in `acceptInvitation` function (lines 143-196), before creating UserOrganization, call `checkOrganizationRoleLimit` from `src/entities/organization/lib/organization-limits.ts` to verify the organization hasn't exceeded its staff limit. Return error if limit reached
- [x] T015 [US5] Verify US5 fixes with Browser MCP — login as ADMIN_HR, go to areas table, click edit link on an area and verify navigation to `/es/dashboard/areas/{id}/edit`. For BUG-008: verify via code review that limit check is in place (cannot easily test via browser without reaching actual limit)

**Checkpoint**: All area links navigate correctly, invitation acceptance enforces limits

---

## Phase 6: US6 - UI Polish (Priority: P6)

**Goal**: Add pagination to organization staff table and remove duplicate page headers.

**Independent Test**: Login as ADMIN_HR, check staff table pagination on org page, check areas/shift-types/sectors for duplicate headers.

- [x] T016 [US6] Add pagination to organization staff table in `src/features/admin-hr/ui/organization-team-section.tsx` — add client-side pagination (10-20 rows per page) to the staff table rendered at lines 159-207. Use existing pagination patterns from other tables in the project
- [x] T017 [P] [US6] Remove duplicate page header from `app/[locale]/dashboard/areas/page.tsx` — remove the `<h1>` and `<p>` page-level header (lines 70-77) since the AreasTable Card already shows title and description
- [x] T018 [P] [US6] Remove duplicate page header from `app/[locale]/dashboard/shift-types/page.tsx` — remove the duplicate `<h1>` and `<p>` header section (lines 71-75) since the Card below already has CardTitle and CardDescription
- [x] T019 [P] [US6] Remove duplicate page header from `app/[locale]/dashboard/sectors/page.tsx` — remove the `<h1>` and `<p>` page-level header (lines 65-69) since the SectorsTable Card already shows title and description
- [x] T020 [US6] Verify US6 fixes with Browser MCP — login as ADMIN_HR, navigate to organization page and verify staff table has pagination controls. Navigate to areas, shift-types, and sectors pages and verify title/description appear only once

**Checkpoint**: Staff table paginates properly, no duplicate headers in management pages

---

## Phase 7: US7 - Login Form Validation (Priority: P7)

**Goal**: Show field-level validation errors when login form submitted empty.

**Independent Test**: Navigate to `/es/login`, submit empty form, verify error messages appear.

- [x] T021 [US7] Fix empty form validation errors in `src/features/auth/api/auth-actions.ts` — verify that `loginAction` returns `fieldErrors` in the correct format when Zod validation fails for empty fields. Check that the error response includes per-field messages (email required, password required) that the LoginForm component can render
- [x] T022 [US7] Verify BUG-004 fix with Browser MCP — navigate to `/es/login`, submit form with empty email and password, verify validation error messages appear under each field

**Checkpoint**: Login form shows clear validation feedback for empty submissions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate all fixes together and update documentation

- [x] T023 Run `npm run build` to verify no TypeScript or i18n errors introduced
- [x] T024 Update `test-reports/02-bugs.md` — mark resolved bugs with fix status and date
- [x] T025 Update `test-reports/04-ui-ux.md` — mark resolved UX issues with fix status and date
- [x] T026 Update `test-reports/00-resumen-ejecutivo.md` — update pass/fail counts and add fix session notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: ALREADY RESOLVED — no work needed
- **US2 (Phase 2)**: Independent — can start immediately
- **US3 (Phase 3)**: Independent — can start immediately
- **US4 (Phase 4)**: Independent — can start immediately
- **US5 (Phase 5)**: Independent — can start immediately
- **US6 (Phase 6)**: Independent — can start immediately
- **US7 (Phase 7)**: Independent — can start immediately
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

All user stories (US2-US7) are INDEPENDENT and can be worked on in any order or in parallel. No cross-story dependencies exist since each fix targets different files.

### Within Each User Story

1. Implementation tasks first (can be parallel within story if marked [P])
2. Browser MCP verification task last (depends on all implementation tasks in that story)

### Parallel Opportunities

**Maximum parallelism** — these groups touch different files and can run simultaneously:
- T001 + T005 + T006 + T007 + T008 + T013 + T014 + T017 + T018 + T019 (all [P] tasks across stories)
- T002 runs parallel to above (different file)
- T010, T011 are sequential within US4 but parallel to all other stories
- T016 sequential (complex) but parallel to other stories
- T021 parallel to all other stories

---

## Parallel Example: Maximum Throughput

```bash
# Wave 1: All independent [P] tasks (10 tasks in parallel)
T001: messages/es.json i18n translations
T002: sidebar signout fix
T005: profile section reorder
T006: calendar dropdown
T007: phone input validation
T008: es.json phone placeholder
T013: area links locale fix
T014: invitation limit validation
T017: areas page duplicate header
T018: shift-types page duplicate header
T019: sectors page duplicate header

# Wave 2: Sequential tasks per story (can still be parallel across stories)
T010: calendar remount fix
T011: rotation click handler
T016: staff table pagination
T021: login validation fix

# Wave 3: All verification tasks (after implementation)
T003, T004, T009, T012, T015, T020, T022

# Wave 4: Polish
T023, T024, T025, T026
```

---

## Implementation Strategy

### MVP First (US2 i18n)

1. Complete US2 (i18n fixes) — highest visible impact, lowest risk
2. **STOP and VALIDATE**: Verify SUPER_ADMIN translations and signout flow
3. Continue with US3 (Profile UX) — high user impact

### Incremental Delivery

1. US2 (i18n) → verify → commit
2. US3 (Profile UX) → verify → commit
3. US4 (Calendar) → verify → commit
4. US5 (Navigation) → verify → commit
5. US6 (UI Polish) → verify → commit
6. US7 (Login Validation) → verify → commit
7. Polish → build → update test-reports → final commit

---

## Notes

- All fixes modify existing files only — no new files created
- Each Browser MCP verification task should be done immediately after its implementation tasks
- The user wants fixes verified via Browser MCP as they are implemented
- US1 (Auth) fully resolved by existing proxy.ts + layout.tsx redirect — confirmed during research
- BUG-003/BUG-005/BUG-007/UX-001/UX-005 also already fixed — excluded from tasks
