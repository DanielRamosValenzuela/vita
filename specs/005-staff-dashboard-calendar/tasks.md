# Tasks: Staff Dashboard Calendar

**Input**: Design documents from `/specs/005-staff-dashboard-calendar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Nota**: El rol se denomina `STAFF` (no `STAFF_HEALTH`) en todo el código.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Crear la estructura de directorios FSD, tipos base y modelo de datos compartido

- [x] T001 Create feature directory structure: `src/features/staff-dashboard/api/`, `src/features/staff-dashboard/ui/`, `src/features/staff-dashboard/lib/`, `src/features/staff-dashboard/types/`. Also create `src/entities/shift/ui/` directory if it doesn't exist
- [x] T001b [P] Promote `ShiftCalendar` and `groupShiftsForCalendar()` to entities layer for FSD compliance — Move `src/features/shifts/ui/shift-calendar.tsx` to `src/entities/shift/ui/shift-calendar.tsx`. Move `src/features/shifts/lib/calendar-grouping.ts` to `src/entities/shift/lib/calendar-grouping.ts`. Update `src/entities/shift/index.ts` to re-export both. Update all existing imports in `src/features/shifts/` to point to `src/entities/shift/`. Verify no cross-feature imports remain. This enables both `shifts` and `staff-dashboard` features to import from the `entities` layer without violating FSD rules
- [x] T002 [P] Create staff dashboard types in `src/features/staff-dashboard/types/staff-dashboard-types.ts` — Define `SectorPersonnelResult`, `PersonnelShift`, `GoogleCalendarEvent`, `FeedTokenInfo` types based on data-model.md and contracts
- [x] T003 [P] Add `CalendarFeedToken` model to `prisma/schema.prisma` — Fields: id, userId, organizationId (nullable), token (unique), isActive. Relations: User (cascade), Organization (cascade). Indexes: [token], [userId], [userId+organizationId] unique. Run `npx prisma generate` and `npx prisma db push`
- [x] T004 [P] Add i18n keys for `staffDashboard` namespace in `messages/es.json` and `messages/en.json` — Keys for: calendar title, empty state messages, upcoming shifts section, shift detail panel, sector personnel, export menu, Google Calendar connection, status labels, relay indicators

**Checkpoint**: Directory structure, types, DB schema, and i18n keys ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server actions core que todas las user stories necesitan

**Warning**: No user story work can begin until this phase is complete

- [x] T005 Create `getMyShiftsAction()` server action in `src/features/staff-dashboard/api/staff-shifts-actions.ts` — Auth: `requireDashboardUser()`, filter by `userId === session.user.id` and `organizationId`. Input: `{ startDate, endDate, status? }`. Output: `ActionResult<{ shifts: ShiftWithRelations[] }>`. Include user, area, shiftType, rotation relations. Resolve orgId for CHIEF via `resolveChiefOrganizationId()`. See contract: `contracts/staff-shifts.md`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Visualizar mis turnos en el calendario (Priority: P1) MVP

**Goal**: STAFF y CHIEF_AREA ven un calendario mensual interactivo con sus turnos asignados en `/dashboard`. Turnos coloreados por tipo, diferenciados por estado, con navegación entre meses y estado vacío.

**Independent Test**: Crear turnos para un usuario STAFF via admin, navegar a `/dashboard`, confirmar que aparecen correctamente en el calendario con fecha, horario, tipo y área. Navegar entre meses y verificar que se cargan los turnos correspondientes. Verificar estado vacío en mes sin turnos.

### Implementation for User Story 1

- [x] T006 [US1] Create `StaffCalendar` wrapper component in `src/features/staff-dashboard/ui/staff-calendar.tsx` — Wraps `ShiftCalendar` from `src/entities/shift/ui/shift-calendar.tsx` (promoted in T001b) in read-only mode: pass `onShiftClick` callback but NOT `onShiftDelete`, `onDateSelect`. Uses `groupShiftsForCalendar()` from `src/entities/shift/lib/calendar-grouping.ts` to transform `ShiftWithRelations[]` into `CalendarEvent[]`. Receives shifts as prop, handles month change via callback, shows empty state message when no shifts. Must differentiate visually: CANCELLED at reduced opacity, night shifts crossing midnight with continuation indicator
- [x] T007 [US1] Create `StaffDashboardContent` orchestrator in `src/features/staff-dashboard/ui/staff-dashboard-content.tsx` — Client component that manages state: current month, shifts data, loading state. On mount and month change: calls `getMyShiftsAction()` with month range. Renders `StaffCalendar` with fetched shifts. Handles shift click (placeholder for US2). Layout: full-width calendar for now (US3 adds upcoming panel later). Uses `useTranslations('staffDashboard')` for all visible text
- [x] T008 [US1] Modify dashboard page `app/[locale]/dashboard/page.tsx` — For users with role STAFF or CHIEF_AREA (not ADMIN_HR which already redirects): replace current placeholder `CalendarView` with server component that fetches initial shifts for current month via `getMyShiftsAction()`, then renders `StaffDashboardContent` with initial data. Keep existing SUPER_ADMIN and ADMIN_HR logic unchanged. Use `getTranslations('staffDashboard')` for page title/description
- [x] T009 [US1] Verify build and lint pass: run `npm run build && npm run lint`

**Checkpoint**: STAFF y CHIEF_AREA ven calendario personal funcional con turnos del mes, navegación entre meses, y estado vacío

---

## Phase 4: User Story 2 — Ver detalle de turno y personal activo del sector (Priority: P2)

**Goal**: Al hacer clic en un turno, se abre un panel con detalle del turno y lista de personal activo del sector, agrupado por área, con indicación de relevos.

**Independent Test**: Crear turnos para 3 personas en 2 áreas del mismo sector. Hacer clic en un turno del usuario. Verificar que aparece: detalle del turno, personal de ambas áreas del sector, horarios de cada persona, y relevos donde aplique.

### Implementation for User Story 2

- [x] T010 [P] [US2] Create `detectRelays()` pure function in `src/features/staff-dashboard/lib/relay-detection.ts` — Input: shifts array sorted by (areaId, startTime). For each area group: compare consecutive shifts, if gap between endTime and next startTime <= 30 minutes, mark outgoing relay on first shift and incoming relay on second. Returns enriched shifts with `relay?: { type: 'incoming' | 'outgoing', userId, userName }`. See data-model.md Relevo section for algorithm
- [x] T011 [P] [US2] Create `getSectorPersonnelForShiftAction()` server action in `src/features/staff-dashboard/api/sector-personnel-actions.ts` — Auth: `requireDashboardUser()`. Input: `{ shiftId }`. Validates shift belongs to current user. Finds sector for shift's area via SectorArea. Queries active shifts (SCHEDULED/IN_PROGRESS) in all sector areas overlapping with shift's time range. Applies `detectRelays()`. Groups by area. Returns: shift detail, sector info (or null), areas with personnel, totalStaff count. See contract: `contracts/sector-personnel.md`
- [x] T012 [US2] Create `SectorPersonnelList` component in `src/features/staff-dashboard/ui/sector-personnel-list.tsx` — Renders personnel grouped by area with collapsible sections. Each area section: area name with icon/color, list of personnel with: user name, start time, end time, shift type badge. Relay indicator: arrow icon showing "Relevo de {name}" (incoming) or "Relevo por {name}" (outgoing). Handle edge cases: area without sector (show single area only), sector with 10+ areas (scrollable with collapsed sections). Use `useTranslations('staffDashboard')` for all labels
- [x] T013 [US2] Create `ShiftDetailPanel` component in `src/features/staff-dashboard/ui/shift-detail-panel.tsx` — Sheet/Dialog component (use Shadcn Sheet for slide-over panel). Two sections: (1) Shift info header: area name+color, shift type badge, start-end time, status badge, rotation name if applicable, isExtra indicator. (2) Sector personnel section: renders `SectorPersonnelList`. Loading state while fetching personnel. Calls `getSectorPersonnelForShiftAction()` on open. Handle night shifts crossing midnight. Use `useTranslations('staffDashboard')` for all labels
- [x] T014 [US2] Integrate shift click handler in `StaffDashboardContent` — Add state for selected shift and panel open/close. On `onShiftClick` callback from `StaffCalendar`: set selected shift, open `ShiftDetailPanel`. Pass close handler to panel
- [x] T015 [US2] Verify build and lint pass: run `npm run build && npm run lint`

**Checkpoint**: Click on shift shows detail panel with sector personnel, relays, and area grouping

---

## Phase 5: User Story 3 — Vista de próximos turnos (Priority: P3)

**Goal**: Panel complementario que muestra los próximos 7 días de turnos del usuario, con acceso rápido al detalle.

**Independent Test**: Crear turnos para un STAFF en los próximos 7 días. Verificar que la lista aparece ordenada cronológicamente. Verificar que turnos de hoy se destacan. Verificar estado vacío sin turnos futuros.

### Implementation for User Story 3

- [x] T016 [P] [US3] Create `getUpcomingShiftsAction()` server action in `src/features/staff-dashboard/api/staff-shifts-actions.ts` — Auth: `requireDashboardUser()`. No input needed (uses server date). Query: user's shifts with status SCHEDULED/IN_PROGRESS from now to now+7 days. Limit 10. Include area, shiftType. OrderBy startTime ASC. See contract: `contracts/staff-shifts.md`
- [x] T017 [US3] Create `UpcomingShifts` component in `src/features/staff-dashboard/ui/upcoming-shifts.tsx` — Card with title "Proximos turnos". Lists upcoming shifts: each item shows date (relative: "Hoy", "Manana", day name), time range, area name with color dot, shift type badge. Empty state: message "No tienes turnos programados proximamente". Click on item: trigger shift detail (calls same onShiftClick as calendar). Use `useTranslations('staffDashboard')` for all text. Responsive: full-width on mobile, sidebar on desktop (lg+)
- [x] T018 [US3] Integrate `UpcomingShifts` into `StaffDashboardContent` layout — Modify layout to: desktop (lg+) = calendar (col-span-8) + upcoming panel (col-span-4). Mobile = upcoming panel above calendar (stacked). Fetch upcoming shifts on mount via `getUpcomingShiftsAction()`. Wire click handler to open `ShiftDetailPanel` (reuses US2 infrastructure)
- [x] T019 [US3] Verify build and lint pass: run `npm run build && npm run lint`

**Checkpoint**: Dashboard shows calendar + upcoming shifts panel, both interactive with shift detail

---

## Phase 6: User Story 4 — Exportar turnos a Google Calendar (Priority: P4)

**Goal**: Exportar turnos como archivo .ics descargable y ofrecer URLs de suscripción iCal (feed per-org y feed unificado personal).

**Independent Test**: Exportar .ics del mes, abrir en Google Calendar y verificar eventos correctos. Crear feed per-org, suscribir en Google Calendar, verificar sincronización. Crear feed unificado y verificar que incluye turnos de todas las organizaciones.

### Implementation for User Story 4

- [x] T020 [US4] Install `ical-generator` dependency: run `npm install ical-generator`
- [x] T021 [P] [US4] Create iCal generation library in `src/features/staff-dashboard/lib/ical-generator.ts` — Function `generateICalContent(shifts, options)` that uses `ical-generator` to produce valid iCalendar content. Each shift → VEVENT with: UID (`shift-{id}@vita.app`), SUMMARY (`Turno {typeName} - {areaName}`), DTSTART/DTEND with timezone (America/Santiago), DESCRIPTION (status, notes, rotation), LOCATION (area name). Set VCALENDAR PRODID and VERSION. Handle timezone via VTIMEZONE component
- [x] T022 [P] [US4] Create feed token utilities in `src/features/staff-dashboard/lib/feed-token.ts` — Function `generateFeedToken()` using `crypto.randomUUID()`. Function `buildFeedUrl(token)` that constructs full URL: `{NEXT_PUBLIC_APP_URL}/api/ical/{token}`
- [x] T023 [P] [US4] Create `calendar-feed-repository` entity in `src/entities/calendar-feed/lib/calendar-feed-repository.ts` — CRUD operations: `createFeedToken(userId, organizationId?)`, `getFeedTokenByToken(token)`, `getUserFeedTokens(userId)`, `revokeFeedToken(tokenId, userId)`, `deleteFeedToken(tokenId, userId)`. Export from `src/entities/calendar-feed/index.ts`
- [x] T024 [US4] Create iCal server actions in `src/features/staff-dashboard/api/ical-actions.ts` — Actions: `generateIcsFileAction({ month, year })` returns ics content string + filename. `getMyFeedTokensAction()` lists user's tokens with feed URLs. `createFeedTokenAction({ type: 'per-org' | 'unified' })` creates/regenerates token. `revokeFeedTokenAction({ tokenId })` deactivates token. All use `requireDashboardUser()`. See contract: `contracts/ical-feed.md`
- [x] T025 [US4] Create `getMyShiftsAllOrgsAction()` in `src/features/staff-dashboard/api/staff-shifts-actions.ts` — Internal function (not exported as server action, called from Route Handler). Input: userId, startDate, endDate. Queries shifts across ALL organizations for the user. Includes organization name. Used by unified feed. See contract: `contracts/staff-shifts.md`
- [x] T026 [US4] Create Route Handler for iCal feed at `app/api/ical/[token]/route.ts` — GET handler. Looks up `CalendarFeedToken` by `params.token` where `isActive=true`. If not found: return empty VCALENDAR. If per-org (organizationId set): fetch user's shifts for that org (3 months back to all future). If unified (organizationId null): fetch user's shifts from all orgs. Generate iCal content. Return Response with Content-Type `text/calendar; charset=utf-8`, Cache-Control `no-cache`. See contract: `contracts/ical-feed.md`
- [x] T027 [US4] Create `CalendarExportMenu` component in `src/features/staff-dashboard/ui/calendar-export-menu.tsx` — Dropdown menu button with options: "Descargar .ics del mes" (triggers `generateIcsFileAction`, creates blob download), "Suscripcion iCal (esta organizacion)" (shows/generates per-org feed URL with copy button), "Suscripcion iCal (todas mis organizaciones)" (shows/generates unified feed URL with copy button), "Gestionar feeds" (dialog listing active tokens with revoke option). Toast feedback on copy/create/revoke. Use `useTranslations('staffDashboard')`
- [x] T028 [US4] Integrate `CalendarExportMenu` into `StaffDashboardContent` — Add export button in calendar header area (next to month navigation). Pass current month/year for .ics export
- [x] T029 [US4] Verify build and lint pass: run `npm run build && npm run lint`

**Checkpoint**: Users can download .ics files, subscribe to per-org and unified iCal feeds, and manage feed tokens

---

## Phase 7: User Story 5 — Importar eventos desde Google Calendar (Priority: P5 — Diferible)

**Goal**: Conectar Google Calendar via OAuth, importar eventos personales al calendario, detectar conflictos con turnos.

**Independent Test**: Conectar cuenta Google, verificar eventos personales visibles en calendario con estilo diferenciado. Crear un evento personal que se superpone con un turno y verificar indicación de conflicto. Desconectar y verificar que eventos desaparecen.

### Implementation for User Story 5

- [ ] T030 [US5] Add `GoogleCalendarConnection` model to `prisma/schema.prisma` — Fields: id, userId (unique), accessToken, refreshToken, tokenExpiresAt, calendarId, isActive. Relation: User (cascade). Run `npx prisma generate && npx prisma db push`
- [ ] T031 [US5] Install `googleapis` dependency: run `npm install googleapis`
- [ ] T032 [P] [US5] Create `google-connection-repository` entity in `src/entities/google-connection/lib/google-connection-repository.ts` — CRUD: `createConnection(userId, tokens)`, `getConnectionByUserId(userId)`, `updateTokens(userId, tokens)`, `deleteConnection(userId)`. Export from `src/entities/google-connection/index.ts`
- [ ] T033 [US5] Create Google Calendar server actions in `src/features/staff-dashboard/api/google-calendar-actions.ts` — Actions: `connectGoogleCalendarAction()` generates OAuth auth URL with state token, scope `calendar.readonly`. `handleGoogleCallbackAction({ code, state })` exchanges code for tokens, stores in DB. `getGoogleCalendarEventsAction({ startDate, endDate })` fetches events from Google API, refreshes token if expired, returns `GoogleCalendarEvent[]`. `disconnectGoogleCalendarAction()` revokes token at Google, deletes DB record. See contract: `contracts/google-calendar.md`
- [ ] T034 [US5] Create Google OAuth callback Route Handler at `app/api/auth/google-calendar/callback/route.ts` — GET handler for Google OAuth redirect. Extracts code and state from query params. Calls `handleGoogleCallbackAction()`. Redirects to `/dashboard` with success/error toast param
- [ ] T035 [US5] Create `GoogleCalendarConnect` component in `src/features/staff-dashboard/ui/google-calendar-connect.tsx` — Button states: disconnected (shows "Conectar Google Calendar" button), connecting (loading), connected (shows "Conectado" badge + "Desconectar" option). Connect triggers `connectGoogleCalendarAction()` and redirects to Google OAuth. Disconnect with AlertDialog confirmation. Use `useTranslations('staffDashboard')`
- [ ] T036 [US5] Integrate Google Calendar events into `StaffDashboardContent` — On mount: if Google connected, call `getGoogleCalendarEventsAction()` for current month. Merge Google events with shift events in calendar (different visual style: dashed border, muted color, "Personal" label). Detect conflicts: if Google event overlaps with shift, add visual indicator (warning icon/border). Add `GoogleCalendarConnect` button in header area
- [ ] T037 [US5] Verify build and lint pass: run `npm run build && npm run lint`

**Checkpoint**: Users can connect Google Calendar, see personal events alongside shifts, and detect conflicts

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T038 [P] Update workflow documentation in `docs/vita-workflows.md` — Add Staff Dashboard Calendar section documenting: personal calendar view, sector personnel detail, iCal export/subscription, Google Calendar integration
- [ ] T039 [P] Verify responsive layout across breakpoints — Test dashboard on mobile (sm), tablet (md), desktop (lg+). Verify: calendar readable on all sizes, upcoming panel stacks on mobile, shift detail panel works as sheet on mobile, export menu accessible on all sizes
- [x] T040 Final comprehensive build and lint verification: run `npm run build && npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T003 for schema, T002 for types) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 (Phase 4)**: Depends on Phase 2. Integrates with US1 (`StaffDashboardContent`)
- **US3 (Phase 5)**: Depends on Phase 2. Integrates with US1 (`StaffDashboardContent`) and US2 (`ShiftDetailPanel`)
- **US4 (Phase 6)**: Depends on Phase 2 and T003 (CalendarFeedToken schema). Independent of US2/US3
- **US5 (Phase 7)**: Depends on Phase 2. Independent of US2/US3/US4. Can be deferred
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — delivers MVP alone
- **US2 (P2)**: Works independently but enhances US1 (adds click-to-detail). Creates `ShiftDetailPanel` reused by US3
- **US3 (P3)**: Works independently but benefits from US2 (reuses `ShiftDetailPanel` for click handler)
- **US4 (P4)**: Fully independent — only needs `getMyShiftsAction()` from Phase 2 and schema from Phase 1
- **US5 (P5)**: Fully independent — can be deferred to future iteration

### Within Each User Story

- Server actions before UI components
- Lib utilities before actions that use them
- Components before integration into orchestrator
- Build verification at end of each story

### Parallel Opportunities

**Phase 1**: T002, T003, T004 can all run in parallel (different files)
**Phase 4 (US2)**: T010 and T011 can run in parallel (lib + action in different files)
**Phase 5 (US3)**: T016 can start in parallel with US2 work (different action file)
**Phase 6 (US4)**: T021, T022, T023 can all run in parallel (different lib/entity files)
**Phase 7 (US5)**: T032 can run in parallel with T031
**Phase 8**: T038, T039 can run in parallel

---

## Parallel Example: Phase 1 Setup

```text
# Launch all setup tasks together (different files, no dependencies):
Task T002: "Create types in src/features/staff-dashboard/types/staff-dashboard-types.ts"
Task T003: "Add CalendarFeedToken model to prisma/schema.prisma"
Task T004: "Add i18n keys to messages/es.json and messages/en.json"
```

## Parallel Example: Phase 6 (US4) Libraries

```text
# Launch all library tasks together (different files, no dependencies):
Task T021: "Create ical-generator.ts in src/features/staff-dashboard/lib/"
Task T022: "Create feed-token.ts in src/features/staff-dashboard/lib/"
Task T023: "Create calendar-feed-repository in src/entities/calendar-feed/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005)
3. Complete Phase 3: US1 — Calendar (T006-T009)
4. **STOP and VALIDATE**: STAFF ve calendario personal con turnos del mes
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Calendar MVP → Deploy/Demo
3. Add US2 → Shift detail + sector personnel → Deploy/Demo
4. Add US3 → Upcoming shifts panel → Deploy/Demo
5. Add US4 → iCal export/subscription → Deploy/Demo
6. Add US5 → Google Calendar import → Deploy/Demo (puede diferirse)

### Parallel Team Strategy

With multiple developers after Foundational is complete:

- **Developer A**: US1 (calendar) → US3 (upcoming, integrates with US1)
- **Developer B**: US2 (shift detail + sector personnel)
- **Developer C**: US4 (iCal export, fully independent)
- US5 deferred or assigned after US4 completes

---

## Notes

- El rol se denomina `STAFF` en el código (no `STAFF_HEALTH`). Usar `Role.STAFF` en comparaciones y `isStaff()` para checks
- `ShiftCalendar` y `groupShiftsForCalendar()` se promueven de `src/features/shifts/` a `src/entities/shift/` en T001b — ambas features (`shifts` y `staff-dashboard`) importan desde `entities/shift`, cumpliendo FSD
- FSD: `staff-dashboard` feature NO importa de `shifts` feature. Todos los componentes y tipos compartidos (`ShiftCalendar`, `groupShiftsForCalendar`, `ShiftWithRelations`, `CalendarEvent`) se acceden via `entities/shift`
- El Route Handler para iCal feed (`app/api/ical/[token]/route.ts`) es la unica excepcion al patron Server Actions, justificada por requerimiento de GET publico
- Todos los textos visibles DEBEN usar `useTranslations` / `getTranslations` — el build falla con literales en JSX
