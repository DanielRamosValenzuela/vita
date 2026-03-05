# Feature Specification: Fix QA E2E Bugs & UX Issues

**Feature Branch**: `008-fix-qa-bugs`
**Created**: 2026-03-05
**Status**: Draft
**Input**: Fix all bugs, broken workflows, and UX issues documented in `test-reports/`. Verify each fix with Browser MCP.

## Overview

During comprehensive E2E testing of the VITA platform, 11 functional bugs, 2 broken workflows, and 10 UI/UX issues were identified. After research, **6 issues were found already resolved** in the current codebase. This specification covers fixing the **13 remaining issues**.

**Source Documents:**
- `test-reports/02-bugs.md` — 11 bugs (BUG-001 to BUG-011)
- `test-reports/03-workflows-rotos.md` — 2 broken workflows (WF-001, WF-002)
- `test-reports/04-ui-ux.md` — 10 UX issues (UX-001 to UX-010)

**Already Resolved (no action needed):**
- BUG-001 / WF-001: Dashboard redirect already implemented
- BUG-002 / WF-002: Login callbackUrl already uses `/${locale}/dashboard`
- BUG-003 / BUG-005 / UX-001: Billing day button already uses `tCommon('save'/'saving')`
- BUG-007: Rate template revalidation already calls `revalidatePaths`
- UX-005: Sidebar role display is correct per clarification (UserSector → "Jefe de Sector")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auth & Route Protection (Priority: P1)

As any user, I need the dashboard routes to be protected so that unauthenticated users cannot access any dashboard content, and after login I am redirected directly to the dashboard instead of the landing page.

**Why this priority**: Security vulnerability. Unauthenticated users can currently access dashboard URLs and see partial content. Additionally, the login flow has unnecessary friction by redirecting to the landing page.

**Independent Test**: Navigate to `/es/dashboard` without a session and verify redirect to `/es/login`. Then login and verify redirect to `/es/dashboard`.

**Bugs Addressed**: BUG-001, BUG-002, WF-001, WF-002

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to `/es/dashboard`, **Then** they are redirected to `/es/login`
2. **Given** an unauthenticated user, **When** they navigate to `/es/dashboard/admin-hr`, **Then** they are redirected to `/es/login`
3. **Given** a user on the login page, **When** they submit valid credentials, **Then** they are redirected to `/es/dashboard` (not the landing page)
4. **Given** a user on the login page with a `callbackUrl` parameter, **When** they login, **Then** they are redirected to that specific URL

---

### User Story 2 - i18n & Translation Fixes (Priority: P2)

As any user, I need all visible text in the application to be properly translated, with no raw i18n keys displayed and no English-only pages in an otherwise Spanish interface.

**Why this priority**: Exposed i18n keys make the application look unprofessional and confuse users. Multiple areas affected across ADMIN_HR and SUPER_ADMIN modules.

**Independent Test**: Navigate to affected pages (rates, organizations, signout) and verify all text is translated.

**Bugs Addressed**: BUG-003, BUG-005, BUG-011, UX-001, UX-002, UX-005

**Acceptance Scenarios**:

1. **Given** an ADMIN_HR user on `/es/dashboard/rates`, **When** viewing the billing day section, **Then** the button shows "Guardar" (not a raw i18n key) and "Guardando..." when submitting
2. **Given** a SUPER_ADMIN on `/es/dashboard/organizations`, **When** viewing the table actions, **Then** buttons show "Ver", "Editar", "Suspender", "Reactivar", "Eliminar" in Spanish
3. **Given** a SUPER_ADMIN creating a new organization, **When** viewing the form, **Then** the address field label shows "Direccion" (not a raw i18n key)
4. **Given** any user, **When** they click "Cerrar Sesion", **Then** they are signed out without seeing an English-only confirmation page
5. **Given** a CHIEF user with UserSector assignment, **When** viewing the sidebar, **Then** the role shows "Jefe de Sector". **Given** a CHIEF user with only UserArea assignments, **When** viewing the sidebar, **Then** the role shows "Jefe de Area"

---

### User Story 3 - Profile UX Improvements (Priority: P3)

As any user editing my profile, I need the document/country section to appear before personal info, the birth date calendar to have a year dropdown, and the phone input to only accept valid characters with correct formatting.

**Why this priority**: The birth date calendar is practically unusable (requires ~396 clicks to reach 1993), and the phone input accepts invalid characters.

**Independent Test**: Navigate to profile page and verify section order, date picker dropdown, and phone input validation.

**Bugs Addressed**: UX-006, UX-007, UX-008, UX-009, UX-010

**Acceptance Scenarios**:

1. **Given** any user on `/es/dashboard/profile`, **When** viewing the page, **Then** the Document section appears before the Personal Info section
2. **Given** any user clicking the birth date field, **When** the calendar opens, **Then** it shows dropdowns for month and year selection (range 1920 to current year)
3. **Given** any user typing in the phone field, **When** they enter letters (e.g., "abc"), **Then** the letters are not accepted (only numbers, +, spaces, parentheses, hyphens allowed)
4. **Given** a Chilean user on the profile page, **When** viewing the phone placeholder, **Then** it shows "+56 9 1234 5678" (not US format)
5. **Given** any user typing in the phone field, **When** they type more than 20 characters, **Then** input is limited to 20 characters

---

### User Story 4 - Dashboard & Calendar Bug Fixes (Priority: P4)

As a STAFF user, I need the calendar to maintain its selected month when navigating to months without shifts, and I need to be able to click on rotation shifts in the calendar to see their details.

**Why this priority**: Calendar navigation bug makes it impossible to browse months without shifts. Rotation shift clicks silently fail.

**Independent Test**: Login as STAFF, navigate calendar to a month without shifts, and click on rotation shift indicators.

**Bugs Addressed**: BUG-009, BUG-010

**Acceptance Scenarios**:

1. **Given** a STAFF user viewing March 2026 calendar, **When** they click the left arrow to go to February 2026 (no shifts), **Then** the calendar shows February 2026 and stays there
2. **Given** a STAFF user viewing the calendar, **When** they click on a rotation shift indicator, **Then** the shift detail panel opens with the shift information
3. **Given** a STAFF user on February 2026 (no shifts), **When** they see the empty state, **Then** they can continue navigating to January without the calendar resetting

---

### User Story 5 - Navigation & Data Integrity Fixes (Priority: P5)

As an ADMIN_HR user, I need area edit links to work correctly, rate template tables to update after creating a new template, and the staff limit to be enforced when accepting invitations.

**Why this priority**: Edit links broken in areas table, stale data after CRUD operations, and staff limits can be exceeded.

**Independent Test**: Click area edit links, create a rate template and verify table updates, and verify invitation acceptance respects limits.

**Bugs Addressed**: BUG-006, BUG-007, BUG-008

**Acceptance Scenarios**:

1. **Given** an ADMIN_HR on `/es/dashboard/areas`, **When** they click an area edit link, **Then** they navigate to `/es/dashboard/areas/{id}/edit` (with locale prefix)
2. **Given** an ADMIN_HR who just created a rate template, **When** the success toast appears, **Then** the table immediately shows the new template without manual page reload
3. **Given** an organization at its staff limit (e.g., 50/50), **When** a user tries to accept an invitation, **Then** the system rejects the acceptance with a clear error message

---

### User Story 6 - UI Polish (Priority: P6)

As an ADMIN_HR user, I need the organization staff table to have pagination and the management pages to not show duplicate headers.

**Why this priority**: Minor visual issues that don't block functionality but affect professionalism.

**Independent Test**: Check organization staff table for pagination and management pages for duplicate headings.

**Bugs Addressed**: UX-003, UX-004

**Acceptance Scenarios**:

1. **Given** an ADMIN_HR on `/es/dashboard/admin-hr/organization`, **When** viewing the staff table with 52 members, **Then** the table shows paginated results (10-20 per page)
2. **Given** an ADMIN_HR on `/es/dashboard/areas`, **When** viewing the page, **Then** the title and description appear only once (not duplicated in page header and card header)

---

### User Story 7 - Login Form Validation (Priority: P7)

As a user on the login page, I need to see validation errors when I submit an empty form so I know what fields are required.

**Why this priority**: Low severity — the form doesn't submit but gives no visual feedback.

**Independent Test**: Submit the login form with empty fields and verify error messages appear.

**Bugs Addressed**: BUG-004

**Acceptance Scenarios**:

1. **Given** a user on `/es/login`, **When** they submit the form with empty email and password, **Then** validation error messages appear under each field
2. **Given** a user on `/es/login`, **When** they submit with invalid email format, **Then** an appropriate error message appears

---

### Edge Cases

- What happens when a user accesses `/en/dashboard` (English locale) without auth? Should redirect to `/en/login`
- What happens when the login callbackUrl points to an external URL? Should be sanitized/ignored
- What happens when navigating calendar to months before the user's first shift? Empty state with continued navigation
- What happens when accepting an invitation and limit was reduced between invitation creation and acceptance? Rejection with clear message
- What happens when SUPER_ADMIN AlertDialogs for suspend/reactivate/delete are opened in rapid succession? Each action should complete independently

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect unauthenticated users from any `/dashboard/*` route to the login page
- **FR-002**: System MUST redirect authenticated users to `/dashboard` after successful login (not the landing page)
- **FR-003**: System MUST display all visible text in the user's selected locale with no raw i18n keys exposed
- **FR-004**: System MUST provide year/month dropdown selectors in the birth date calendar picker
- **FR-005**: System MUST restrict phone input to valid telephone characters only (digits, +, spaces, parentheses, hyphens)
- **FR-006**: System MUST limit phone input to 20 characters maximum
- **FR-007**: System MUST display the Document section before Personal Info on the profile page
- **FR-008**: System MUST maintain calendar month state when navigating to months with no shifts
- **FR-009**: System MUST handle clicks on rotation-group shift indicators in the calendar
- **FR-010**: System MUST include locale prefix in all internal navigation links
- **FR-011**: System MUST revalidate data tables after successful CRUD operations
- **FR-012**: System MUST enforce staff limits when accepting invitations (not just when sending them)
- **FR-013**: System MUST show validation errors on the login form when submitted with empty fields
- **FR-014**: System MUST display the billing day button with correct "Guardar"/"Guardando..." text states
- **FR-015**: System MUST sign out users directly without showing an English confirmation page
- **FR-016**: System MUST display "Jefe de Sector" if user has UserSector assignment, "Jefe de Area" if user has only UserArea assignments, or the translated DB role otherwise
- **FR-017**: System MUST paginate the organization staff table when showing more than 20 members
- **FR-018**: System MUST not display duplicate page headers (page heading + card heading)
- **FR-019**: System MUST show phone placeholder in the correct format for the user's country

### Key Entities

- **User Session**: Authentication state determining access to dashboard routes
- **i18n Translation Keys**: Locale-specific text entries that must resolve to visible text for all UI elements
- **Calendar State**: Month/year being viewed in the shift calendar, must persist across navigation
- **Organization Limits**: Staff count limits that must be enforced at invitation acceptance time

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 dashboard pages accessible without authentication (currently 100% accessible)
- **SC-002**: Login redirects to dashboard in 1 step (currently requires 2 steps)
- **SC-003**: 0 raw i18n keys visible to users across all tested pages (currently 10+ exposed)
- **SC-004**: Birth date selection achievable in under 5 clicks for any year (currently ~396 clicks for 1993)
- **SC-005**: Phone input rejects 100% of letter characters in real-time (currently accepts all)
- **SC-006**: Calendar maintains selected month when navigating to empty months (currently resets)
- **SC-007**: All rotation shift clicks open detail panel (currently 0% work)
- **SC-008**: All area edit links navigate correctly with locale prefix (currently broken)
- **SC-009**: Rate template table updates within 1 second of creation (currently requires manual reload)
- **SC-010**: Staff limits enforced at 100% of acceptance attempts (currently bypassable)
- **SC-011**: All 15 FAIL test cases from E2E testing pass after fixes

## Clarifications

### Session 2026-03-05

- Q: Logica de rol en sidebar — mostrar siempre rol de BD o basado en asignaciones? → A: Mostrar "Jefe de Sector" si tiene UserSector asignado, "Jefe de Area" si solo tiene UserArea, rol de BD traducido en otro caso. La implementacion completa del rol CHIEF_SECTOR con permisos diferenciados queda fuera del alcance de este fix.

## Assumptions

- The existing `redirect()` from `next/navigation` is sufficient for route protection without needing a full middleware.ts (simpler fix first)
- The `signOut` function from NextAuth can be called directly with `{ redirect: true, callbackUrl: '/es/login' }` to skip the confirmation page
- The Calendar component from shadcn already supports `captionLayout="dropdown"` — just needs the prop added
- Phone input validation can be done with `inputMode="tel"` and an onInput handler without needing a full input mask library
- The rate template revalidation issue is solved by adding `revalidatePath` to the server action
- The staff limit exceeded state (52/50) was caused by a limit change after users joined, not a validation bypass — but validation should still be added at acceptance time
