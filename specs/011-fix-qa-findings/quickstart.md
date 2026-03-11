# Quickstart: 011-fix-qa-findings

## Prerequisites

- Dev server running: `npm run dev`
- Supabase DB with QA data (Clínica Ejemplo Santiago: 112 users, 6 areas, 7 rotations)
- Browser automation: `agent-browser`

## Test Scenarios by User Story

### US1: CHIEF_SECTOR Removal

1. **Build check**: `npm run build` passes with no CHIEF_SECTOR references
2. **Login as ADMIN_HR** (vita.qa.adminhr1@gmail.com):
   - Dashboard → Limits section shows single "Jefes" card (8/10), not two separate cards
   - Invite → Chief invitation form shows only "Jefe de Área"
3. **Login as CHIEF with UserSector** (vita.qa.chief.uci1@gmail.com):
   - Sidebar shows "Jefe de Área" with sector badge "UCI"
4. **Grep check**: `grep -r "CHIEF_SECTOR" src/ app/ prisma/` returns 0 results (excluding test-reports/specs)

### US2: Mass Shift Generation

1. **Login as ADMIN_HR**
2. Navigate to `/dashboard/rotations`
3. Click "Generar turnos masivo"
4. Verify checklist shows 7 active rotations (all pre-marked)
5. Uncheck 2 rotations, select date range (30 days)
6. Click "Generar" → verify progress per rotation
7. Verify summary shows 5 rotations processed with shift counts

### US3: Payroll Progress

1. **Login as ADMIN_HR**
2. Navigate to `/dashboard/payroll`
3. Generate payroll for a new month (March 2026)
4. Verify progress bar appears: "X/110 documentos generados"
5. Progress updates at least every 5 seconds
6. Final state: "110/110 Completado"

### US4: Shift Completion

1. **Login as CHIEF** (vita.qa.chief.uci1@gmail.com)
2. Navigate to shifts calendar
3. Click on a past day → "Completar día"
4. Verify checklist of shifts for that day (all pre-selected)
5. Exclude 1 shift, confirm
6. Verify shifts changed to COMPLETED (different visual in calendar)
7. Check dashboard for "X turnos pendientes de completar" alert

### US5: UX Improvements

1. **Date picker**: Open rotation generation dialog → select start date → calendar stays on same month
2. **Coverage badge**: Rotation list shows "85% cobertura" badges
3. **Component count**: Rate list shows "3 componentes" badges

### US6: Sector Badge

1. **Login as ADMIN_HR**
2. Staff page → Chiefs with UserSector show "Sector" badge

### US7: Staff Count Desglose

1. **Login as CHIEF** of Nutricionistas
2. Staff page shows "16 personas (12 personal + 4 jefes)"
3. Role filter shows only STAFF (12) when selected

### US8: Shift Swap

1. **Login as STAFF** (vita.qa.staff001@gmail.com)
2. Click on a future shift → "Solicitar intercambio"
3. Select type OPEN, add reason
4. **Login as another STAFF** in same area
5. Inbox notification → view swap request → offer a shift
6. **Login as original STAFF** → accept offer
7. **Login as CHIEF** → approve swap
8. Verify both shifts swapped in calendar

### Final QA E2E

Run full happy path regression covering all US above with browser automation. Document results in `test-reports/qa-011-fix-qa-findings/qa-summary.md`.
