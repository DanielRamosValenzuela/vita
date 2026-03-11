# Research: 011-fix-qa-findings

**Date**: 2026-03-10

## R1: Payroll Progress Mechanism

**Decision**: Server-Sent Events (SSE) via API Route `/api/payroll-progress/[periodId]`
**Rationale**: `generatePayrollForOrganization` processes users in a sequential `for` loop (line 100 of `generate-payroll-core.ts`). Adding a progress callback `onProgress(current, total)` is trivial. An in-memory `Map<string, {current, total, status}>` serves as the progress store. The SSE route reads from it every 2s. The Map is cleaned up after the period completes.
**Alternatives**:
- Polling via Server Action: Works but adds 2-5s latency per update, creates unnecessary DB reads
- WebSockets: Overkill for uni-directional progress updates
- Database-backed progress: Unnecessary complexity; in-memory suffices since payroll generation and SSE run on the same server instance

## R2: ShiftPayment Calculation

**Decision**: Extract `calculateShiftPayment(shiftId, contractId, organizationId)` from existing payroll calculation logic
**Rationale**: `calculate-payroll.ts` already calculates `shiftsAmount` by iterating completed shifts with contracts. The per-shift calculation (base amount × calendar multiplier + component adjustments) can be extracted into a standalone function. ShiftPaymentBreakdown records map 1:1 to RateComponent entries from the contract's RateTemplate.
**Key fields**: `totalAmount`, `baseAmount`, `calendarMultiplier`, `finalAmount`, `minutesWorked`
**Breakdown**: One `ShiftPaymentBreakdown` per applicable `RateComponent` (componentType `PER_SHIFT_*`)

## R3: CHIEF_SECTOR Removal

**Decision**: Remove `CHIEF_SECTOR` from `enum Role` in Prisma schema. Update 15 files.
**Files to modify** (confirmed via grep):
1. `prisma/schema.prisma` — Remove from Role enum
2. `src/shared/lib/constants/roles.ts` — Remove from ROLES constant
3. `src/shared/lib/auth/rbac.ts` — Remove `isChiefSector()`
4. `src/shared/lib/auth/session.ts` — Remove from auth guard arrays
5. `src/shared/lib/utils/role-display.ts` — Remove display config
6. `src/shared/lib/utils/count-users-by-role.ts` — Simplify chief counting
7. `src/widgets/dashboard-sidebar/constants.ts` — Remove from nav role arrays
8. `src/widgets/dashboard-sidebar/index.tsx` — Replace displayRole with sector badge
9. `src/features/admin-hr/ui/staff-view-page.tsx` — Remove filter option
10. `src/features/admin-hr/ui/invite-user-form.tsx` — Remove invitation option
11. `src/features/admin-hr/data/invitation-repository.ts` — Remove reference
12. `src/features/extra-shifts/api/application-actions.ts` — Remove from role array
13. `src/entities/organization/lib/organization-usage.ts` — Unify chief counting
14. `src/entities/organization/lib/organization-limits.ts` — Unify chief limits
15. `app/[locale]/dashboard/layout.tsx` — Remove displayRole logic
16. `app/[locale]/dashboard/requests/page.tsx` — Remove reference
17. `app/[locale]/dashboard/admin-hr/organization/page.tsx` — Unify limit card
18. `app/[locale]/dashboard/organizations/[id]/page.tsx` — Remove reference
19. `messages/es.json` — Remove CHIEF_SECTOR translation key
20. `messages/en.json` — Remove CHIEF_SECTOR translation key
**DB verification**: Confirmed 0 users with role=CHIEF_SECTOR in database

## R4: Bulk Generation

**Decision**: Sequential rotation processing with `bulkGenerateShiftsAction`
**Rationale**: Existing `generateShiftsAction` does per-rotation N+1 queries for conflict detection. Running 7 rotations in parallel could open 7 × (members × days) concurrent queries. Sequential is safer.
**Performance**: ~30s per rotation × 7 = ~3.5 min worst case (within <2 min if conflicts pre-detected)
**UI**: Dialog with checklist of rotations + date picker + "Generar" button. Results shown as a table per rotation (created, skipped, conflicts).

## R5: Shift Swap

**Decision**: Implement full flow using existing Prisma models
**Existing models**: `ShiftSwapRequest` (with `SwapRequestType`, `SwapRequestStatus`), `ShiftSwapOffer` (with `SwapOfferStatus`)
**Existing code**: `src/entities/swap/` has partial repository, validation, and types
**Flow**:
1. STAFF clicks shift → "Solicitar intercambio" → creates `ShiftSwapRequest` (type=OPEN, status=PENDING_PEER)
2. Other STAFF in area sees request in notifications → creates `ShiftSwapOffer` (status=PENDING)
3. Requester accepts offer → request status=PENDING_CHIEF, offer status=ACCEPTED
4. CHIEF views pending swaps → approves → request status=APPROVED, shifts are swapped in DB
5. Notifications at each step
