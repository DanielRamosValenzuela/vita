# Quickstart: UI para Gestión del Calendario Organizacional

**Date**: 2026-02-16
**Feature Branch**: `001-org-calendar-ui`

## Prerequisites

- Node.js, npm, Prisma CLI
- Running Supabase instance with existing `OrganizationCalendar` table
- At least one organization with an ADMIN_HR user in the database

## Quick Verification

```bash
# 1. Checkout branch
git checkout 001-org-calendar-ui

# 2. Install dependencies (if any new ones added)
npm install

# 3. Generate Prisma client (no schema changes expected)
npx prisma generate

# 4. Run dev server
npm run dev

# 5. Verify lint passes
npm run lint

# 6. Verify build passes
npm run build
```

## Manual Test Flow

### Test 1: Create a Special Day (P1 - US1)

1. Log in as ADMIN_HR
2. Navigate to `/dashboard/calendar` from sidebar
3. Click on any empty date in the calendar grid
4. Sheet opens on the right with the day form
5. Select type: "Feriado Irrenunciable"
6. Enter name: "Test Holiday"
7. Set multiplier: 2.5
8. Click "Guardar"
9. Verify: date is highlighted with IRRENUNCIABLE color, multiplier badge "2.5x" visible
10. Click the same date again — verify Sheet opens with pre-filled data
11. Change multiplier to 3.0, save — verify update reflected

### Test 2: Delete a Special Day (P1 - US1)

1. Click on a date with an existing special day
2. Sheet opens with pre-filled data and a "Delete" button
3. Click "Delete" — AlertDialog asks for confirmation
4. Confirm deletion
5. Verify: date returns to normal appearance

### Test 3: Navigate Months (P2 - US2)

1. On the calendar page, click "Mes Siguiente" / "Mes Anterior"
2. Verify: calendar loads the correct month with any existing special days
3. Verify: month summary shows correct count of special days by type

### Test 4: Import National Holidays (P3 - US3)

1. Click "Importar Feriados" button
2. Dialog opens with year selector and country auto-detected from organization
3. List of national holidays appears with checkboxes
4. Select all / select specific ones
5. Click "Importar"
6. Verify: selected holidays appear in the calendar with correct types and default multipliers
7. Try importing again — verify already-existing dates are shown as "Ya importado"

### Test 5: Multiplier Validation (Edge Case)

1. Click on a date, enter multiplier "0" — verify error message
2. Enter multiplier "-1" — verify error message
3. Enter multiplier "0.05" — verify error message (min is 0.1)
4. Enter multiplier "0.1" — verify it saves successfully

### Test 6: Multi-Tenant Isolation

1. Log in as ADMIN_HR of Organization A, create a special day
2. Log in as ADMIN_HR of Organization B
3. Navigate to `/dashboard/calendar` — verify Organization A's special day is NOT visible
