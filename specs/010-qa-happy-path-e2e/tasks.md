# Tasks: QA Happy Path E2E — Clinica Simulada

**Input**: Design documents from `/specs/010-qa-happy-path-e2e/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated tests — this IS the manual E2E test execution.

**Organization**: Tasks grouped by user story (QA phase). Each phase produces a report in `test-reports/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (independent actions)
- **[Story]**: Which user story this task belongs to (US1-US11)
- Tools: Browser MCP = UI automation, Supabase MCP = DB queries/mutations

---

## Phase 1: Setup

**Purpose**: Verify prerequisites and prepare test infrastructure

- [x] T001 Verify dev server running at http://localhost:3000/es via Browser MCP screenshot
- [x] T002 [P] Verify Supabase MCP connected: execute `SELECT 1` via Supabase MCP
- [x] T003 [P] Create test-reports directory at D:\Programacion\TurnoMed\vita\test-reports
- [x] T004 [P] Create scripts directory at D:\Programacion\TurnoMed\vita\scripts
- [x] T005 Create UX findings template at test-reports/ux-findings.md with columns: Phase, Page, Severity, Description, Proposal, Screenshot, Status
- [x] T006 Check for existing QA data via Supabase MCP: `SELECT count(*) FROM "User" WHERE email LIKE 'vita.qa.%'` — if >0, document and decide cleanup
- [x] T007 Verify SUPER_ADMIN account exists via Supabase MCP: `SELECT id, email, role FROM "User" WHERE email = 'prueba10@gmail.com'` — if not SUPER_ADMIN, update role directly
- [x] T008 Generate and save RUT validation script at scripts/generate-ruts.sql for 100 auto STAFF accounts

**Checkpoint**: All tools connected, directories created, SUPER_ADMIN verified

---

## Phase 2: Foundational (Scripts & Templates)

**Purpose**: Create reusable scripts that multiple phases depend on

- [x] T009 Query existing STAFF account structure via Supabase MCP: `SELECT * FROM "User" LIMIT 1` and `SELECT * FROM "Account" LIMIT 1` to understand fields needed for bulk creation
- [x] T010 Create bulk STAFF creation SQL script at scripts/create-qa-accounts.sql with 100 users (vita.qa.staff.auto001-100), Chilean names, valid RUTs, bcrypt hash from existing account
- [x] T011 [P] Create staff-to-area assignment SQL script at scripts/assign-staff-to-areas.sql with distribution: A1=25, A2=15, A3=12, A4=25, A5=15, A6=10
- [x] T012 [P] Create cleanup SQL script at scripts/cleanup-qa-data.sql to remove all vita.qa.* data for reruns
- [x] T013 Create phase report template at test-reports/phase-template.md with sections: Phase, Date, Status, Steps Executed, Verifications, Bugs Found, UX Observations, Screenshots

**Checkpoint**: Scripts ready for bulk operations — user story execution can begin

---

## Phase 3: User Story 1 — Registro y onboarding de organizacion (Priority: P1)

**Goal**: Register 11 test accounts via UI, create organization as SUPER_ADMIN, invite and link ADMIN_HR

**Independent Test**: 11 accounts exist in DB, org created with correct limits, ADMIN_HR has correct role and sees dashboard

### Implementation

- [ ] T014 [US1] Navigate to /es/register via Browser MCP and take screenshot of registration form
- [ ] T015 [US1] Register account #1 vita.qa.adminhr1@gmail.com (Valentina Rojas Perez, RUT 12.587.698-8) via Browser MCP at /es/register
- [ ] T016 [US1] Register account #2 vita.qa.chief.uci1@gmail.com (Rodrigo Sepulveda Diaz, RUT 15.234.567-K) via Browser MCP at /es/register
- [ ] T017 [US1] Register account #3 vita.qa.chief.urg1@gmail.com (Camila Fernandez Lagos, RUT 18.765.432-1) via Browser MCP at /es/register
- [ ] T018 [P] [US1] Register accounts #4-#9 (6 remaining chiefs) via Browser MCP at /es/register — use data from data-model.md
- [ ] T019 [P] [US1] Register account #10 vita.qa.staff.manual1@gmail.com (Matias Gonzalez Vera, RUT 11.234.567-6) via Browser MCP at /es/register
- [ ] T020 [P] [US1] Register account #11 vita.qa.staff.manual2@gmail.com (Constanza Silva Riquelme, RUT 10.987.654-9) via Browser MCP at /es/register
- [ ] T021 [US1] Verify 11 accounts via Supabase MCP: `SELECT id, email, name, role, "docNumber" FROM "User" WHERE email LIKE 'vita.qa.%' ORDER BY email`
- [ ] T022 [US1] Login as SUPER_ADMIN (prueba10@gmail.com / 123qweASD.) via Browser MCP at /es/login
- [ ] T023 [US1] Navigate to /es/dashboard/organizations/new and create "Clinica Ejemplo Santiago" (CL, CLP, PRO, limits: maxAdminHR=5, maxChiefs=10, maxStaff=150, billingDay=25, taxId=76.432.198-5)
- [ ] T024 [US1] Verify organization created via Supabase MCP: query Organization table for "Clinica Ejemplo Santiago"
- [ ] T025 [US1] Navigate to organization detail page and invite vita.qa.adminhr1@gmail.com with role ADMIN_HR
- [ ] T026 [US1] Verify invitation PENDING via Supabase MCP: `SELECT status FROM "OrganizationInvitation" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'vita.qa.adminhr1@gmail.com')`
- [ ] T027 [US1] Login as vita.qa.adminhr1@gmail.com via Browser MCP, find and accept pending invitation
- [ ] T028 [US1] Verify ADMIN_HR role and org assigned via Supabase MCP + take screenshot of ADMIN_HR dashboard
- [ ] T029 [US1] Write phase report to test-reports/phase-00-01-accounts-org.md with all verifications and screenshots
- [ ] T030 [US1] Document UX observations for /register and /organizations/new in test-reports/ux-findings.md

**Checkpoint**: 11 accounts created, org exists, ADMIN_HR linked and sees dashboard

---

## Phase 4: User Story 2 — Vinculacion de CHIEFs y STAFF (Priority: P1)

**Goal**: ADMIN_HR invites 8 CHIEFs + 2 STAFF manually. Then create 100 STAFF via script.

**Independent Test**: 8 CHIEFs with correct role/org, 102 STAFF total, random auto STAFF can login

### Implementation

- [ ] T031 [US2] Login as ADMIN_HR (vita.qa.adminhr1@gmail.com) via Browser MCP at /es/login
- [ ] T032 [US2] Navigate to /es/dashboard/admin-hr/organization and invite vita.qa.chief.uci1@gmail.com as CHIEF_AREA
- [ ] T033 [US2] Invite remaining 7 chief accounts (#3-#9) as CHIEF_AREA via /es/dashboard/admin-hr/organization
- [ ] T034 [US2] Verify 8 invitations PENDING via Supabase MCP
- [ ] T035 [US2] Login as each CHIEF (#2-#9) via Browser MCP and accept invitation — verify dashboard for each
- [ ] T036 [US2] Verify all 8 CHIEFs via Supabase MCP: `SELECT email, role, "organizationId" FROM "User" WHERE email LIKE 'vita.qa.chief%'`
- [ ] T037 [US2] Login as ADMIN_HR, invite vita.qa.staff.manual1@gmail.com and vita.qa.staff.manual2@gmail.com as STAFF
- [ ] T038 [US2] Login as each manual STAFF, accept invitation, verify STAFF dashboard
- [ ] T039 [US2] Query manual STAFF structure via Supabase MCP to get bcrypt hash and all fields for bulk script
- [ ] T040 [US2] Execute bulk creation script (scripts/create-qa-accounts.sql) via Supabase MCP to create 100 auto STAFF accounts
- [ ] T041 [US2] Verify 102 STAFF total via Supabase MCP: `SELECT COUNT(*) FROM "User" WHERE email LIKE 'vita.qa.staff%' AND role = 'STAFF' AND "organizationId" IS NOT NULL`
- [ ] T042 [US2] Login as vita.qa.staff.auto042@gmail.com via Browser MCP — verify STAFF dashboard and org
- [ ] T043 [P] [US2] Login as vita.qa.staff.auto077@gmail.com via Browser MCP — verify STAFF dashboard and org
- [ ] T044 [US2] Write phase report to test-reports/phase-02-03-chiefs-staff.md
- [ ] T045 [US2] Document UX observations for invitation flow in test-reports/ux-findings.md

**Checkpoint**: 8 CHIEFs + 102 STAFF linked to org, all logins functional

---

## Phase 5: User Story 3 — Estructura organizacional: sectores y areas (Priority: P1)

**Goal**: Create 2 sectors, 6 areas, assign areas to sectors including shared Nutricionistas

**Independent Test**: UCI shows 3 areas, Urgencias shows 4 areas, Nutricionistas in both

### Implementation

- [ ] T046 [US3] Login as ADMIN_HR via Browser MCP
- [ ] T047 [US3] Navigate to /es/dashboard/sectors/new and create sector "Unidad de Cuidados Intensivos (UCI)" with icon Heart
- [ ] T048 [US3] Create sector "Urgencias" with icon AlertTriangle at /es/dashboard/sectors/new
- [ ] T049 [US3] Navigate to /es/dashboard/areas/new and create area "Enfermeria UCI" (dayStart 08:00, dayEnd 20:00) assigned to sector UCI
- [ ] T050 [US3] Create area "Medicos UCI" (dayStart 08:00, dayEnd 18:00) assigned to sector UCI
- [ ] T051 [US3] Create area "Nutricionistas" (dayStart 08:00, dayEnd 18:00) assigned to sectors UCI AND Urgencias
- [ ] T052 [US3] Create area "Enfermeria Urgencias" (dayStart 08:00, dayEnd 20:00) assigned to sector Urgencias
- [ ] T053 [US3] Create area "Medicos Urgencias" (dayStart 08:00, dayEnd 18:00) assigned to sector Urgencias
- [ ] T054 [US3] Create area "Tecnicos Urgencias" (dayStart 07:00, dayEnd 18:00) assigned to sector Urgencias
- [ ] T055 [US3] Verify sectors and area counts via Supabase MCP using contracts/verification-queries.sql Phase 4 queries
- [ ] T056 [US3] Take screenshot of /es/dashboard/sectors showing UCI (3 areas) and Urgencias (4 areas)
- [ ] T057 [US3] Write phase report to test-reports/phase-04-sectors-areas.md
- [ ] T058 [US3] Document UX observations for sector/area creation flow in test-reports/ux-findings.md

**Checkpoint**: 2 sectors, 6 areas, Nutricionistas shared correctly

---

## Phase 6: User Story 6 — Asignacion de jefes y personal a areas (Priority: P1)

**Goal**: Assign 2 sector chiefs, 6 area chiefs, distribute 102 STAFF across 6 areas

**Independent Test**: Each CHIEF sees only their areas. Staff counts match distribution plan.

### Implementation

- [ ] T059 [US6] Login as ADMIN_HR via Browser MCP
- [ ] T060 [US6] Navigate to /es/dashboard/sectors and assign Rodrigo Sepulveda (chief.uci1) as chief of sector UCI
- [ ] T061 [US6] Assign Camila Fernandez (chief.urg1) as chief of sector Urgencias
- [ ] T062 [US6] Assign area chiefs via /es/dashboard/staff or area management: Andres Morales → Enfermeria UCI (A1)
- [ ] T063 [US6] Assign Francisca Araya → Medicos UCI (A2)
- [ ] T064 [US6] Assign Diego Herrera → Nutricionistas (A3)
- [ ] T065 [US6] Assign Javiera Tapia → Enfermeria Urgencias (A4)
- [ ] T066 [US6] Assign Tomas Bravo → Medicos Urgencias (A5)
- [ ] T067 [US6] Assign Isidora Reyes → Nutricionistas (A3) as second chief
- [ ] T068 [US6] Verify UserArea and UserSector assignments via Supabase MCP
- [ ] T069 [US6] Login as Rodrigo (chief.uci1) — verify sees areas A1, A2, A3 in dashboard
- [ ] T070 [US6] Login as Camila (chief.urg1) — verify sees areas A3, A4, A5, A6 in dashboard
- [ ] T071 [US6] Login as Andres (chief.enf1) — verify sees only A1
- [ ] T072 [US6] Login as Diego (chief.nut1) — verify sees only A3
- [ ] T073 [US6] Execute staff-to-area assignment script (scripts/assign-staff-to-areas.sql) via Supabase MCP — distribute 102 STAFF: A1=25, A2=15, A3=12, A4=25, A5=15, A6=10
- [ ] T074 [US6] Verify staff distribution via Supabase MCP: `SELECT a.name, COUNT(*) FROM "UserArea" ua JOIN "Area" a ON ua."areaId" = a.id GROUP BY a.name`
- [ ] T075 [US6] Login as ADMIN_HR, navigate to /es/dashboard/staff, filter by area to confirm counts
- [ ] T076 [US6] Write phase report to test-reports/phase-07-08-assignments.md
- [ ] T077 [US6] Document UX observations for chief/staff assignment flow in test-reports/ux-findings.md

**Checkpoint**: All chiefs see correct areas, 102 STAFF distributed, no staff without area

---

## Phase 7: User Story 4 — Tipos de turno (Priority: P2)

**Goal**: Create 10 shift types (4 global + 6 area-specific) with varied durations

**Independent Test**: All 10 types visible in table, globals visible to all CHIEFs, specifics only to their area

### Implementation

- [ ] T078 [US4] Login as ADMIN_HR via Browser MCP
- [ ] T079 [US4] Navigate to /es/dashboard/shift-types and create global "Turno Diurno Normal" (DAY, 08:00-17:00, 540 min)
- [ ] T080 [P] [US4] Create global "Turno Diurno Largo" (DAY, 08:00-20:00, 720 min)
- [ ] T081 [P] [US4] Create global "Turno Nocturno" (NIGHT, 20:00-08:00, 720 min)
- [ ] T082 [P] [US4] Create global "Tercer Turno" (NIGHT, 22:00-06:00, 480 min)
- [ ] T083 [US4] Create area-specific "Cuarto Turno UCI" (MIXED, 08:00-08:00, 1440 min) linked to areas Enfermeria UCI + Medicos UCI
- [ ] T084 [US4] Create "Guardia Urgencias 24h" (MIXED, 08:00-08:00, 1440 min) linked to Enfermeria Urg + Medicos Urg
- [ ] T085 [US4] Create "Turno Manana Nutricion" (DAY, 08:00-14:00, 360 min) linked to Nutricionistas
- [ ] T086 [US4] Create "Turno Tarde Nutricion" (DAY, 14:00-18:00, 240 min) linked to Nutricionistas
- [ ] T087 [US4] Create "Turno Tecnico Estandar" (DAY, 07:00-15:00, 480 min) linked to Tecnicos Urgencias
- [ ] T088 [US4] Create "Turno Tecnico Tarde" (MIXED, 15:00-23:00, 480 min) linked to Tecnicos Urgencias
- [ ] T089 [US4] Verify 10 shift types via Supabase MCP using contracts/verification-queries.sql
- [ ] T090 [US4] Take screenshot of shift types table showing all 10
- [ ] T091 [US4] Write phase report to test-reports/phase-05-shift-types.md
- [ ] T092 [US4] Document UX observations for shift type creation in test-reports/ux-findings.md

**Checkpoint**: 10 shift types created with variety 4h-24h, classifications correct

---

## Phase 8: User Story 5 — Tarifas, contratos y calendario (Priority: P2)

**Goal**: Create 13 rate templates, assign contracts to 110 users, configure org calendar with holidays

**Independent Test**: All rates in table, every user has contract, 2 users with double rate, calendar shows special days

### Implementation

- [ ] T093 [US5] Login as ADMIN_HR via Browser MCP
- [ ] T094 [US5] Navigate to /es/dashboard/rates and create rate "Jefe de Sector Senior" with components: BASE_SALARY $2.800.000/MONTHLY + RESPONSIBILITY_BONUS $400.000/MONTHLY + NIGHT_SHIFT_BONUS $25.000/PER_SHIFT
- [ ] T095 [US5] Create rate "Jefe de Area Clinico" with BASE_SALARY $2.200.000 + NIGHT_SHIFT_BONUS $20.000 + PER_MINUTE $800
- [ ] T096 [US5] Create rate "Jefe de Area Soporte" with BASE_SALARY $1.800.000 + ATTENDANCE_BONUS $15.000/PER_SHIFT
- [ ] T097 [US5] Create 10 STAFF rate templates (T1-T10) per data-model.md specifications at /es/dashboard/rates
- [ ] T098 [US5] Verify 13 rate templates via Supabase MCP with component counts
- [ ] T099 [US5] Assign contracts to 8 CHIEFs: navigate to each user in /es/dashboard/staff and assign their rate template
- [ ] T100 [US5] Assign contracts to 102 STAFF via Supabase MCP bulk script (distribute T1-T10 per data-model.md area distribution)
- [ ] T101 [US5] Assign double rate (T3 + T10) to 2 specific STAFF in Medicos UCI via UI or Supabase MCP
- [ ] T102 [US5] Verify contracts via Supabase MCP: total active contracts count and users with 2+ contracts
- [ ] T103 [US5] Navigate to organization calendar and add 5 special days per data-model.md (weekends x1.5, holiday x2.0, org holiday x1.3, irrenunciable x2.0)
- [ ] T104 [US5] Verify calendar entries via Supabase MCP: `SELECT date, type, name, multiplier FROM "OrganizationCalendar" WHERE "organizationId" = ...`
- [ ] T105 [US5] Take screenshot of rates page and calendar
- [ ] T106 [US5] Write phase report to test-reports/phase-06-rates-contracts.md
- [ ] T107 [US5] Document UX observations for rates/contracts/calendar flow in test-reports/ux-findings.md

**Checkpoint**: 13 rates, 110+ contracts, 2 double-rate users, calendar with holidays

---

## Phase 9: User Story 7 — Rotativas y generacion de turnos (Priority: P2)

**Goal**: Create 7 rotations with groups, activate, generate shifts for 30 days

**Independent Test**: 7 rotations ACTIVE, shifts visible in area calendars, STAFF see personal shifts

### Implementation

- [ ] T108 [US7] Login as ADMIN_HR via Browser MCP
- [ ] T109 [US7] Navigate to /es/dashboard/rotations and create rotation "Rotativa 4to Turno Enfermeria" for area Enfermeria UCI with Cuarto Turno UCI steps and 4 groups of ~6 members
- [ ] T110 [US7] Create rotation "Rotativa Diurno/Nocturno Enf" for Enfermeria UCI with Day→Day→Night→Night→Rest→Rest pattern, 3 groups of ~3
- [ ] T111 [US7] Create rotation "Rotativa Guardias Medicos UCI" for Medicos UCI with Cuarto Turno steps, 3 groups of 5
- [ ] T112 [US7] Create rotation "Rotativa Nutricion" for Nutricionistas with Manana→Tarde→Rest pattern, 2 groups of 6
- [ ] T113 [US7] Create rotation "Rotativa 4to Turno Enf Urg" for Enfermeria Urgencias with Guardia 24h steps, 4 groups of ~6
- [ ] T114 [US7] Create rotation "Rotativa Guardias Med Urg" for Medicos Urgencias with Guardia 24h steps, 3 groups of 5
- [ ] T115 [US7] Create rotation "Rotativa Tecnicos" for Tecnicos Urgencias with Estandar→Tarde→Rest pattern, 2 groups of 5
- [ ] T116 [US7] Activate all 7 rotations (DRAFT → ACTIVE) and generate shifts for next 30 days
- [ ] T117 [US7] Verify rotations and shift counts via Supabase MCP using contracts/verification-queries.sql Phase 9 query
- [ ] T118 [US7] Login as a STAFF member and verify personal calendar shows assigned shifts at /es/dashboard/calendar
- [ ] T119 [US7] Take screenshots of rotation list and calendar with shifts
- [ ] T120 [US7] Write phase report to test-reports/phase-09-rotations.md
- [ ] T121 [US7] Document UX observations for rotation creation flow (group management, member assignment, generation preview) in test-reports/ux-findings.md — this is a KEY area for UX improvement proposals

**Checkpoint**: 7 rotations ACTIVE, shifts generated, STAFF see personal calendar

---

## Phase 10: User Story 8 — Vista STAFF y nomina (Priority: P2)

**Goal**: Verify STAFF calendar view, notes, iCal export. Generate payroll and verify role-based visibility.

**Independent Test**: STAFF sees shifts, ADMIN_HR generates payroll, each role sees only their documents

### Implementation

- [ ] T122 [US8] Login as vita.qa.staff.manual1@gmail.com via Browser MCP
- [ ] T123 [US8] Navigate to /es/dashboard/calendar and verify shifts appear for current month
- [ ] T124 [US8] Click on a shift to verify detail panel shows type, hours, area info
- [ ] T125 [US8] Create a personal note on a calendar day and verify it appears
- [ ] T126 [US8] Login as ADMIN_HR via Browser MCP
- [ ] T127 [US8] Navigate to /es/dashboard/payroll and generate payroll for current month
- [ ] T128 [US8] Verify payroll generation via Supabase MCP: `SELECT status, "totalDocuments", "totalAmount" FROM "PayrollPeriod" WHERE ...`
- [ ] T129 [US8] Verify payroll document count matches users with active contracts
- [ ] T130 [US8] Login as a CHIEF — navigate to /es/dashboard/payroll — verify only sees their area documents
- [ ] T131 [US8] Login as a STAFF — navigate to /es/dashboard/payroll — verify only sees own document
- [ ] T132 [US8] Take screenshots of calendar, payroll list, individual payroll document
- [ ] T133 [US8] Write phase report to test-reports/phase-10-staff-payroll.md
- [ ] T134 [US8] Document UX observations for calendar view, payroll generation, document visibility in test-reports/ux-findings.md

**Checkpoint**: Calendar functional, payroll generated, role-based visibility correct

---

## Phase 11: User Story 9 — Intercambio de turnos (Priority: P3)

**Goal**: Test shift swap (direct and open) since UI exists at /dashboard/requests

**Independent Test**: Direct swap completes, open swap with offers completes, calendars update

### Implementation

- [ ] T135 [US9] Login as STAFF A (vita.qa.staff.manual1) via Browser MCP
- [ ] T136 [US9] Navigate to /es/dashboard/calendar, select a shift, and request direct swap with STAFF B (vita.qa.staff.manual2)
- [ ] T137 [US9] Login as STAFF B, navigate to /es/dashboard/requests, accept the swap request
- [ ] T138 [US9] Login as area CHIEF, navigate to /es/dashboard/requests, approve the swap
- [ ] T139 [US9] Verify shifts swapped in calendars of both STAFF A and B
- [ ] T140 [US9] Login as another STAFF, publish an open swap request for one of their shifts
- [ ] T141 [US9] Login as 2 other STAFF in same area, submit offers on the open swap
- [ ] T142 [US9] Original STAFF selects an offer, CHIEF approves
- [ ] T143 [US9] Verify swap executed and calendars updated
- [ ] T144 [US9] Verify swap requests via Supabase MCP using contracts/verification-queries.sql Phase 11 query
- [ ] T145 [US9] Take screenshots of swap flow steps
- [ ] T146 [US9] Write phase report to test-reports/phase-11-shift-swap.md (or document as "partially implemented" if any step fails)
- [ ] T147 [US9] Document UX observations for swap flow in test-reports/ux-findings.md

**Checkpoint**: Swap flows work or documented as incomplete with specific issues

---

## Phase 12: User Story 10 — Validaciones de negocio y edge cases (Priority: P2)

**Goal**: Test org limits, document validation, multi-area visibility, dashboard metrics, responsive

**Independent Test**: Limits reject correctly, metrics match data, responsive UI works

### Implementation

- [ ] T148 [US10] Login as ADMIN_HR, attempt to invite CHIEF #11 (should fail — limit 10) — take screenshot
- [ ] T149 [US10] Attempt to invite STAFF #151 (should fail — limit 150) — take screenshot of error
- [ ] T150 [US10] Attempt to register a new account with a RUT already in use — verify rejection
- [ ] T151 [US10] Login as Diego (chief.nut1, Nutricionistas from UCI side) — verify staff visible in area
- [ ] T152 [US10] Login as Isidora (chief.nut2, Nutricionistas from Urg side) — verify SAME staff visible
- [ ] T153 [US10] Login as ADMIN_HR, navigate to /es/dashboard/admin-hr — verify metrics: 6 areas, ~110 personnel, contracts, shifts
- [ ] T154 [US10] Take screenshot of ADMIN_HR dashboard with all metrics
- [ ] T155 [US10] Resize browser to mobile viewport — verify sidebar becomes hamburger menu
- [ ] T156 [US10] Navigate between 3 pages in mobile mode — verify sheet closes on navigation
- [ ] T157 [US10] Write phase report to test-reports/phase-12-validations.md
- [ ] T158 [US10] Document UX observations for limit errors, dashboard metrics, responsive in test-reports/ux-findings.md

**Checkpoint**: All business validations pass, metrics correct, responsive works

---

## Phase 13: User Story 11 — Evaluacion UX consolidada (Priority: P2)

**Goal**: Consolidate all UX findings from previous phases into final report with prioritization

**Independent Test**: ux-findings.md has observations from 5+ distinct pages with actionable proposals

### Implementation

- [ ] T159 [US11] Review and consolidate all UX entries in test-reports/ux-findings.md — ensure consistency of severity ratings
- [ ] T160 [US11] Prioritize UX findings: group by severity (critico > alto > medio > bajo)
- [ ] T161 [US11] For each critico/alto finding: if fixable in <15 min, apply fix directly in codebase
- [ ] T162 [US11] Document all fixes applied with before/after description in test-reports/ux-findings.md
- [ ] T163 [US11] Generate UX improvement backlog summary: top 10 proposals ordered by impact

**Checkpoint**: UX findings documented, quick fixes applied, improvement backlog ready

---

## Phase 14: Polish & Final Report

**Purpose**: Generate final summary, verify all criteria, cleanup

- [ ] T164 Execute final summary query via Supabase MCP using contracts/verification-queries.sql "Final summary" query
- [ ] T165 Compare actual data counts vs expected (spec summary table: 1 org, 112 users, 2 sectors, 6 areas, ~10 shift types, 13 rates, ~7 rotations)
- [ ] T166 Count total bugs found across all phase reports
- [ ] T167 Count total UX findings by severity
- [ ] T168 Write final summary report to test-reports/summary.md with: phases completed, pass/fail per phase, bug count, UX findings count, overall QA verdict
- [ ] T169 Take final screenshot of ADMIN_HR dashboard as evidence of complete simulation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (tools verified)
- **US1 (Phase 3)**: Depends on Phase 2 (scripts ready)
- **US2 (Phase 4)**: Depends on US1 (org + ADMIN_HR exist)
- **US3 (Phase 5)**: Depends on US2 (ADMIN_HR in org)
- **US6 (Phase 6)**: Depends on US2 + US3 (chiefs + areas exist)
- **US4 (Phase 7)**: Depends on US3 (areas exist for area-specific types)
- **US5 (Phase 8)**: Depends on US6 (staff assigned for contracts)
- **US7 (Phase 9)**: Depends on US4 + US6 (shift types + staff in areas)
- **US8 (Phase 10)**: Depends on US5 + US7 (contracts + shifts for payroll)
- **US9 (Phase 11)**: Depends on US7 (shifts exist for swapping)
- **US10 (Phase 12)**: Depends on US8 (full data for metrics validation)
- **US11 (Phase 13)**: Runs IN PARALLEL with all phases (UX entries added throughout)
- **Polish (Phase 14)**: Depends on all phases complete

### Critical Path

```
Setup → Foundation → US1 → US2 → US3 → US6 → US4 → US5 → US7 → US8 → US9 → US10 → Polish
                                              ↗ (parallel)              ↗ (parallel)
                                         US4 starts with US6       US9 can start once US7 done
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|-----------|-------------------|
| US1 | Foundation | — |
| US2 | US1 | — |
| US3 | US2 | — |
| US6 | US2, US3 | — |
| US4 | US3 | US6 (different pages) |
| US5 | US6 | — |
| US7 | US4, US6 | — |
| US8 | US5, US7 | — |
| US9 | US7 | US8, US10 |
| US10 | US8 | US9 |
| US11 | — | ALL (continuous) |

---

## Implementation Strategy

### Sequential Execution (Single Agent)

This QA is designed for sequential execution by a single agent:

1. Phase 1-2: Setup + Foundation (~10 min)
2. Phase 3: US1 — Accounts + Org (~25 min)
3. Phase 4: US2 — Chiefs + Staff (~20 min)
4. Phase 5: US3 — Sectors + Areas (~15 min)
5. Phase 6: US6 — Assignments (~15 min)
6. Phase 7: US4 — Shift Types (~15 min)
7. Phase 8: US5 — Rates + Contracts (~30 min)
8. Phase 9: US7 — Rotations (~30 min)
9. Phase 10: US8 — Staff View + Payroll (~15 min)
10. Phase 11: US9 — Shift Swap (~15 min)
11. Phase 12: US10 — Validations (~15 min)
12. Phase 13: US11 — UX Consolidation (~10 min)
13. Phase 14: Final Report (~5 min)

**Total: ~3.5 hours**

### UX Research (Continuous)

US11 (UX evaluation) runs IN PARALLEL with every phase. After each UI interaction:
- Note time taken per task
- Identify unnecessary steps
- Evaluate label clarity and feedback quality
- Check visual consistency
- Document proposals in test-reports/ux-findings.md
- Fix issues < 15 min on the spot

---

## Notes

- [P] tasks = different files or independent actions
- [Story] label maps task to specific user story
- All passwords: `123qweASD.`
- All emails: `vita.qa.{role}.{number}@gmail.com`
- Prefer Supabase MCP for bulk operations (>10 items)
- Prefer Browser MCP for UI validation and UX evaluation
- Take screenshots at every checkpoint
- Document bugs immediately with: route, action, expected, actual, screenshot
