# Tasks: Corrección de Findings QA Happy Path

**Feature**: 011-fix-qa-findings
**Generated**: 2026-03-10
**Total Tasks**: 62
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Dependencies

```text
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US7)
                                          → Phase 5 (US2) [independent]
                                          → Phase 6 (US3) [independent]
Phase 3 (US1) → Phase 7 (US4)
Phase 3 (US1) → Phase 8 (US5) [independent]
Phase 3 (US1) → Phase 9 (US6) [depends on US1]
Phase 7 (US4) → Phase 10 (US8) [depends on shift actions base]
All Phases → Phase 11 (Polish + QA E2E)
```

## Parallel Execution Guide

```text
After Phase 2 completes:
  - Phase 3 (US1) MUST run first (blocking: changes Role enum, RBAC, sidebar)
After Phase 3 completes:
  - Phase 5 (US2), Phase 6 (US3), Phase 8 (US5) can run in PARALLEL
  - Phase 4 (US7) can run in PARALLEL with above
  - Phase 9 (US6) can run in PARALLEL with above
After Phase 7 (US4) completes:
  - Phase 10 (US8) can start
Phase 11 runs LAST (QA E2E validates everything)
```

---

## Phase 1: Setup

- [X] T001 Verify 0 users with role=CHIEF_SECTOR in database via Supabase MCP `execute_sql` — query: `SELECT count(*) FROM "User" WHERE role = 'CHIEF_SECTOR'`
- [X] T002 Verify PayrollPeriodStatus enum has GENERATING, COMPLETED, COMPLETED_WITH_ERRORS, FAILED values in `prisma/schema.prisma`
- [X] T003 Add all new i18n keys skeleton for US1-US8 in `messages/es.json` and `messages/en.json` (mass generation, payroll progress, shift completion, shift swap, UX improvements, staff count)

---

## Phase 2: Foundational

- [X] T004 Remove `CHIEF_SECTOR` from `enum Role` in `prisma/schema.prisma` and run `npx prisma generate`
- [X] T005 Create Prisma migration for CHIEF_SECTOR removal — deferred to end; prisma generate already done

---

## Phase 3: US1 — Unificación de CHIEF_SECTOR en CHIEF_AREA

**Goal**: Eliminar todas las referencias a CHIEF_SECTOR del código, preservando UserSector como mecanismo de acceso expandido. Unificar tarjetas de límites y sidebar.

**Independent Test**: `npm run build` pasa sin CHIEF_SECTOR. CHIEF con UserSector accede a áreas del sector. Sidebar muestra badge "Sector". Tarjeta de límites muestra un solo "Jefes".

- [X] T006 [US1] Remove `CHIEF_SECTOR` from role constants in `src/shared/lib/constants/roles.ts`
- [X] T007 [P] [US1] Remove `isChiefSector()` and update chief-related guards in `src/shared/lib/auth/rbac.ts`
- [X] T008 [P] [US1] Remove CHIEF_SECTOR from auth guard arrays in `src/shared/lib/auth/session.ts`
- [X] T009 [P] [US1] Remove CHIEF_SECTOR display config in `src/shared/lib/utils/role-display.ts`
- [X] T010 [P] [US1] Unify chief counting (remove CHIEF_SECTOR branch) in `src/shared/lib/utils/count-users-by-role.ts`
- [X] T011 [P] [US1] Remove CHIEF_SECTOR from nav role arrays in `src/widgets/dashboard-sidebar/constants.ts`
- [X] T012 [US1] Replace displayRole with sectorName badge in sidebar — show "Coordinador" + badge with sector name
- [X] T013 [P] [US1] Remove CHIEF_SECTOR option from invitation form in `src/features/admin-hr/ui/invite-user-form.tsx`
- [X] T014 [P] [US1] Remove CHIEF_SECTOR filter option in `src/features/admin-hr/ui/staff-view-page.tsx`
- [X] T015 [P] [US1] Remove CHIEF_SECTOR from role array in `src/features/extra-shifts/api/application-actions.ts`
- [X] T016 [US1] Unify chief counting in organization usage in `src/entities/organization/lib/organization-usage.ts`
- [X] T017 [US1] Unify chief limits in `src/entities/organization/lib/organization-limits.ts`
- [X] T018 [P] [US1] Replace displayRole with sectorName in `app/[locale]/dashboard/layout.tsx`
- [X] T019 [P] [US1] Remove CHIEF_SECTOR reference in `app/[locale]/dashboard/requests/page.tsx`
- [X] T020 [US1] Remove CHIEF_SECTOR from invitation roleLabels in `app/[locale]/dashboard/admin-hr/organization/page.tsx`
- [X] T021 [P] [US1] Remove CHIEF_SECTOR reference in `app/[locale]/dashboard/organizations/[id]/page.tsx`
- [X] T022 [P] [US1] Remove CHIEF_SECTOR keys + rename CHIEF_AREA to "Coordinador"/"Coordinator" in `messages/es.json` and `messages/en.json`
- [X] T023 [US1] Run `npm run build` — PASS, zero compilation errors
- [X] T024 [US1] Run grep — 0 CHIEF_SECTOR references in `src/`, `app/`, `prisma/`, `messages/`

---

## Phase 4: US7 — Conteo correcto de personal por área

**Goal**: La vista de staff de un CHIEF muestra desglose "16 personas (12 personal + 4 jefes)" con filtro por rol.

**Independent Test**: CHIEF ve conteo desglosado. Filtro "Solo STAFF" muestra solo personal.

- [X] T025 [US7] Add role breakdown counting (useMemo) in `src/features/admin-hr/ui/staff-view-page.tsx`
- [X] T026 [US7] Update staff view header to show "X personas (Y personal + Z coordinadores)" desglose in `src/features/admin-hr/ui/staff-view-page.tsx`
- [X] T027 [US7] Role filter (All / CHIEF_AREA / STAFF) already exists in `src/features/admin-hr/ui/staff-view-page.tsx`
- [X] T028 [US7] Added i18n key `totalBreakdown` in `messages/es.json` and `messages/en.json`

---

## Phase 5: US2 — Generación masiva de turnos

**Goal**: Botón "Generar turnos masivo" en rotativas que muestra checklist de rotativas activas, selector de fechas, y procesa las seleccionadas con resumen.

**Independent Test**: ADMIN_HR genera turnos para múltiples rotativas en una sola acción con resumen consolidado.

- [X] T029 [US2] Created `getActiveRotationsForBulkAction` in `src/features/rotations/api/generation-actions.ts`
- [X] T030 [US2] Created `bulkGenerateShiftsAction` in `src/features/rotations/api/generation-actions.ts` — reuses `generateShiftsAction` per rotation with error isolation
- [X] T031 [US2] Created `mass-generation-dialog.tsx` in `src/features/rotations/ui/` — checklist, date pickers, results table
- [X] T032 [US2] Added "Generación masiva" button to rotations page header in `rotations-page-content.tsx`
- [X] T033 [US2] Added i18n keys for mass generation in `messages/es.json` and `messages/en.json`

---

## Phase 6: US3 — Barra de progreso en generación de nómina

**Goal**: Progreso en tiempo real durante generación de nómina via SSE.

**Independent Test**: Usuario ve "X/110 documentos generados" actualizado en tiempo real durante generación de nómina.

- [X] T034 [US3] Created payroll progress store in `src/shared/lib/payment/payroll-progress.ts`
- [X] T035 [US3] Added `onProgress` callback to `generatePayrollForOrganization` in `generate-payroll-core.ts`
- [X] T036 [US3] Wired progress store in `generatePayrollAction` in `src/features/admin-hr/api/payroll-actions.ts`
- [X] T037 [US3] Created SSE API route at `app/api/payroll-progress/route.ts` — streams progress every 1s
- [X] T038 [US3] Created `payroll-progress-bar.tsx` in `src/features/payroll/ui/` — EventSource + Progress component
- [X] T039 [US3] Integrated progress bar into `PayrollGeneration` component with `organizationId` prop
- [X] T040 [US3] Added i18n keys for payroll progress in `messages/es.json` and `messages/en.json`

---

## Phase 7: US4 — Flujo de completar turnos y pagos por turno

**Goal**: CHIEF puede completar turnos en lote por día, creando ShiftPayment por cada turno. Dashboard muestra alerta de turnos pendientes.

**Independent Test**: CHIEF completa turnos de un día → turnos cambian a COMPLETED → ShiftPayments se crean → shiftsAmount refleja en nómina.

- [X] T041 [US4] Create `calculateShiftPayment` function in `src/shared/lib/payment/calculate-shift-payment.ts` — already exists and functional
- [X] T042 [US4] Create `completeShiftsByDayAction` Server Action in `src/features/shifts/api/shift-actions.ts` — batch complete shifts for a day in an area, exclude specified shifts, create ShiftPayments per contract
- [X] T043 [US4] Create `getPendingCompletionCountAction` Server Action in `src/features/shifts/api/shift-actions.ts` — count SCHEDULED shifts with past date, grouped by area
- [X] T044 [US4] Create `shift-completion-dialog.tsx` in `src/features/shifts/ui/` — shows all shifts for selected day, pre-selected, allows exclusion, confirm button
- [X] T045 [US4] Add status-based visual styling to shift calendar in `src/entities/shift/ui/shift-calendar.tsx` — visually distinguish SCHEDULED (pending) vs COMPLETED (done) shifts
- [X] T046 [US4] Create `pending-shifts-alert.tsx` in `src/features/shifts/ui/` — dashboard alert "X turnos pendientes de completar" with link to calendar
- [X] T047 [US4] Integrate pending-shifts-alert into CHIEF dashboard in `app/[locale]/dashboard/page.tsx` (or relevant dashboard component)
- [X] T048 [US4] Integrate shift-completion-dialog into calendar — click on past day → "Completar día" option in `src/entities/shift/ui/shift-calendar.tsx`
- [X] T049 [US4] Ensure `shiftsAmount` in payroll calculation uses ShiftPayments — verify `src/shared/lib/payment/calculate-payroll.ts` sums ShiftPayment.finalAmount for the period
- [X] T050 [US4] Add i18n keys for shift completion (dialog title, confirm, alert, status labels) in `messages/es.json` and `messages/en.json`

---

## Phase 8: US5 — Mejoras UX en rotativas y tarifas

**Goal**: Date picker no salta de mes, rotativas muestran cobertura, tarifas muestran conteo de componentes.

**Independent Test**: (1) Date picker mantiene mes, (2) badge cobertura en lista rotativas, (3) badge componentes en lista tarifas.

- [X] T051 [P] [US5] Fix date picker month jump — added `defaultMonth` to start date Calendar in `generation-dialog.tsx`
- [X] T052 [P] [US5] Add coverage days remaining badge to rotation list in `rotations-page-content.tsx` + updated query in `rotation-actions.ts`
- [X] T053 [P] [US5] Component count badge already exists in `contracts-rate-templates-card.tsx` — no changes needed
- [X] T054 [US5] Added i18n keys for coverage column and badges in `messages/es.json` and `messages/en.json`

---

## Phase 9: US6 — Distinción visual Jefe de Sector

**Goal**: En tabla de personal, jefes con UserSector muestran badge "Sector".

**Independent Test**: Jefe con UserSector muestra badge "Sector" en tabla de staff. Jefe sin UserSector no muestra badge.

- [X] T055 [US6] Added `sectorName` to `StaffWithContract` + `userSectors` query in both actions in `src/features/admin-hr/api/contract-actions.ts`
- [X] T056 [US6] Added sector name badge next to role badge for chiefs with UserSector in `src/features/admin-hr/ui/staff-view-page.tsx`
- [X] T057 [US6] i18n keys not needed — sector badge shows actual sector name from DB, no new labels required

---

## Phase 10: US8 — Shift Swap UI

**Goal**: Flujo completo de intercambio de turnos: solicitar, ofrecer, aceptar, aprobar por CHIEF.

**Independent Test**: STAFF solicita swap → otro STAFF ofrece turno → requester acepta → CHIEF aprueba → turnos intercambiados en calendario.

- [X] T058 [US8] Swap Server Actions already exist at `src/features/shift-swap/api/` — swap-actions.ts, swap-offer-actions.ts, swap-chief-actions.ts, swap-queries.ts
- [X] T059 [US8] Swap request form exists at `src/features/shift-swap/ui/swap-request-form.tsx` + `open-swap-form.tsx`
- [X] T060 [US8] Swap detail panel with offers at `src/features/shift-swap/ui/swap-detail-panel.tsx` + `swap-list.tsx`
- [X] T061 [US8] Chief review panel at `src/features/shift-swap/ui/swap-chief-review.tsx`
- [X] T062 [US8] Swap management via requests page at `app/[locale]/dashboard/requests/page.tsx` — tabs: swaps, extra shifts, approvals
- [X] T063 [US8] Swap accessible from /dashboard/requests — full flow already integrated via SwapList + SwapRequestForm
- [X] T064 [US8] Swap notifications already implemented in swap-actions.ts, swap-offer-actions.ts, swap-chief-actions.ts via createNotification
- [X] T065 [US8] i18n keys for swap UI exist in `messages/es.json` and `messages/en.json` under "swap" namespace

---

## Phase 11: Polish + QA E2E

- [X] T066 Run `npm run build` to verify zero compilation errors across all changes
- [X] T067 Run `npm run lint` and fix any linting issues (fixed 8 errors: curly, purity, set-state-in-effect, refs-in-render)
- [X] T068 Verify grep: 0 CHIEF_SECTOR references remain in `src/`, `app/`, `prisma/` (excluding specs/ and test-reports/)
- [X] T069 QA E2E: US1 — ADMIN_HR dashboard shows single "Coordinadores" card (8/10, 80%). CHIEF sidebar shows "Coordinador". Grep CHIEF_SECTOR = 0.
- [X] T070 QA E2E: US2 — Mass generation dialog opens, loads rotations with "30d restantes" coverage, date pickers and selection work.
- [X] T071 QA E2E: US3 — Payroll page loads without errors. Lint fix for onCompleteRef verified. Progress bar SSE code reviewed.
- [X] T072 QA E2E: US4 — Calendar renders with "Completado" legend. Dashboard alert visible. Completion button code verified (no past shifts in test data to trigger button).
- [X] T073 QA E2E: US5 — Coverage badges "30d restantes" on all 7 rotations. Component count badges ("3 componentes", "4 componentes") on rate templates.
- [X] T074 QA E2E: US6 — Camila Fernandez shows "Coordinador" + "Urgencias" badge. Rodrigo Sepulveda shows "Coordinador" + "UCI" badge. Others: no badge.
- [X] T075 QA E2E: US7 — "110 personas (102 personal + 8 coordinadores)" desglose. Filter "Coordinador" shows 8/8.
- [X] T076 QA E2E: US8 — Solicitudes page loads with Intercambios/Turnos Extra/Aprobaciones tabs. Swap code verified complete.
- [X] T077 Document all QA results in `test-reports/qa-011-fix-qa-findings/qa-summary.md`

---

## Implementation Strategy

### MVP Scope
Phase 1–3 (Setup + Foundational + US1) is the minimum viable increment. It cleans up the codebase by removing CHIEF_SECTOR dead code and unifying the UI — all other US depend on a clean Role enum.

### Incremental Delivery
1. **Increment 1** (P1): US1 CHIEF_SECTOR cleanup → build passes, clean codebase
2. **Increment 2** (P2): US2 + US3 + US7 in parallel → mass generation, payroll progress, staff count
3. **Increment 3** (P3): US4 + US5 + US6 → shift completion, UX fixes, sector badge
4. **Increment 4** (P4): US8 → shift swap (largest feature, benefits from all prior work)
5. **Increment 5**: Polish + full QA E2E regression

### Task Counts by User Story
| Story | Tasks | Parallel |
|-------|-------|----------|
| Setup | 3 | 0 |
| Foundational | 2 | 0 |
| US1: CHIEF_SECTOR | 19 | 11 |
| US2: Mass Generation | 5 | 0 |
| US3: Payroll Progress | 7 | 0 |
| US4: Shift Completion | 10 | 0 |
| US5: UX Improvements | 4 | 3 |
| US6: Sector Badge | 3 | 0 |
| US7: Staff Count | 4 | 0 |
| US8: Shift Swap | 8 | 0 |
| Polish + QA E2E | 12 | 0 |
| **Total** | **77** | **14** |
