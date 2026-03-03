# Research: Payroll Billing PDF Generation

**Feature Branch**: `006-payroll-billing-pdf`
**Date**: 2026-03-03

## R1: PDF Generation Library

**Decision**: Use `@react-pdf/renderer` for server-side PDF generation within Next.js Server Actions.

**Rationale**:
- React component-based syntax aligns with the project's React/Next.js stack.
- Works server-side without headless browser (unlike Puppeteer), compatible with serverless.
- Lightweight (~15MB vs ~300MB+ for Puppeteer).
- Active community (15.9k GitHub stars, 860k+ weekly downloads).
- Supports custom fonts and i18n through string injection.
- Current stable version: 4.3.2, compatible with React 19 (since v4.1.0).

**Alternatives considered**:
- **Puppeteer/Playwright**: WYSIWYG HTML-to-PDF but requires headless browser, too heavy for serverless.
- **jsPDF**: Imperative API, poor maintainability for complex documents.
- **pdfmake**: JSON-based, no React integration.
- **PDFKit**: Lower memory but imperative, no component model.

**Critical consideration — batch generation**:
- Known memory leak issues when generating 50+ PDFs sequentially (WebAssembly/yoga-layout).
- **Mitigation strategy**: Process PDFs one at a time with explicit garbage collection hints between generations. For the Edge Function batch path, generate sequentially with delays. Monitor memory with `--max-old-space-size`.
- If memory proves unmanageable at scale (100+ staff), fallback to PDFKit for batch operations.

## R2: Scheduled Job Infrastructure (pg_cron + API Route)

**Decision**: Use Supabase `pg_cron` + `pg_net` extensions to schedule a call to a Next.js API Route (NOT Edge Function).

**Rationale**:
- Native Supabase infrastructure for scheduling, no external dependencies.
- pg_cron is stable and production-ready in Supabase.
- pg_net enables HTTP calls from within PostgreSQL to trigger the Next.js API Route.
- Built-in monitoring via `cron.job_run_details` table.
- **Changed from Edge Function to API Route** (2026-03-03): Edge Functions run in Deno and cannot import Prisma or the app's `src/` code, which would require reimplementing all calculation logic. API Route runs in Node.js and reuses 100% of existing code (Prisma, shared/lib/payment, @react-pdf/renderer templates). This is a justified exception to the "no API Routes" constitution rule — it functions as a webhook endpoint.

**Alternatives considered**:
- **Vercel Cron**: Project may not be on Vercel; couples to hosting provider.
- **External service (AWS EventBridge, etc.)**: Adds vendor lock-in, cost, and complexity.
- **node-cron in-process**: Not resilient across server restarts/deploys.

**Implementation pattern**:
```
pg_cron (scheduled SQL) → pg_net HTTP POST → Next.js API Route →
  reuses existing Prisma queries + shared/lib/payment code →
  reads organizations with billingDay = today →
  for each org: calls generatePayrollAction logic (zero duplication) →
  calculate payments → generate PDFs → upload to Storage →
  create PayrollPeriod + PayrollDocument records →
  create notifications for ADMIN_HR + STAFF
```

**Timezone handling**:
- pg_cron runs in UTC only.
- Chile uses CLT (UTC-3) and CLST (UTC-4, summer).
- Strategy: Schedule cron at 12:00 UTC (≈ 08:00-09:00 Chile time). Edge Function handles exact timezone logic internally using `date-fns-tz` with `America/Santiago`.

## R3: Supabase Storage for PDF Documents

**Decision**: Create a new private bucket `payroll-documents` in Supabase Storage.

**Rationale**:
- Existing pattern: project already uses Supabase Storage for `avatars` bucket.
- Storage utility at `src/shared/lib/storage/supabase-storage.ts` provides the client pattern.
- Private bucket (no public URLs) — access controlled through Server Actions that verify role permissions before generating signed download URLs.

**Storage path convention**:
```
payroll-documents/{organizationId}/{year}/{month}/{userId}-{periodId}.pdf
```

**Access pattern**:
- Upload: Server Action or Edge Function using service role key.
- Download: Server Action generates short-lived signed URL (60 min expiry) after role verification.
- Delete: Server Action removes file + updates PayrollDocument record.

## R4: Payment Calculation Engine

**Decision**: Implement payment calculation as a shared utility function callable from both Server Actions (manual/individual) and Edge Functions (batch).

**Rationale**:
- The calculation logic must be reusable: called on shift completion (real-time), manual regeneration (on-demand), and batch generation (monthly cron).
- ShiftPayment and ShiftPaymentBreakdown models already exist in schema (lines 608-650).
- Calculation follows the documented formula in `docs/SISTEMA-PAGOS-Y-TARIFAS.md`.

**Calculation flow per shift**:
1. Get shift with contract → rateTemplate → components.
2. Get calendar day multiplier for shift date.
3. Filter applicable components by: applyCondition vs. shift context (day type, shift type, area).
4. Calculate each component value based on type and unit (PER_SHIFT, PER_MINUTE, PER_HOUR, etc.).
5. Sum component values → `baseAmount`.
6. Apply `customMultiplier` from contract (if set).
7. Apply `calendarMultiplier` from calendar day → `finalAmount`.
8. Create ShiftPayment + ShiftPaymentBreakdown records.

**Monthly payroll aggregation**:
1. For each staff with active contract in the period:
   a. Calculate prorated BASE_SALARY based on contract days in period.
   b. Sum all ShiftPayment.finalAmount for completed shifts in period.
   c. Add monthly fixed components (MONTHLY unit).
   d. Total = prorated base + shift payments + monthly components.
2. If total > $0, generate PDF document.

## R5: Notification Integration

**Decision**: Extend existing notification system with new `NotificationType` values for payroll events.

**Rationale**:
- Full notification system already implemented (model, repository, service, UI, toaster).
- `createNotification()` in `src/features/notifications/lib/notification-service.ts` is the standard entry point.
- Inbox page at `/dashboard/inbox` with filtering already works.

**New notification types needed**:
- `PAYROLL_GENERATED` — Sent to ADMIN_HR when batch generation completes.
- `PAYROLL_GENERATION_FAILED` — Sent to ADMIN_HR when generation has errors.
- `PAYROLL_DOCUMENT_AVAILABLE` — Optional: sent to STAFF when their document is ready.

## R6: Dashboard Navigation

**Decision**: Add new "Pagos" / "Nómina" nav item in existing sidebar navigation.

**Rationale**:
- Navigation defined in `src/widgets/dashboard-sidebar/constants.ts` via `getNavItems()`.
- Role-based filtering already supported.
- Badge system available (used by inbox for unread count).

**New nav item**:
- Icon: `Receipt` or `FileText` from lucide-react.
- Path: `/dashboard/payroll`.
- Roles: ADMIN_HR, CHIEF_AREA, CHIEF_SECTOR, STAFF.
- Label varies by locale: "Nómina" (ES) / "Payroll" (EN).

## R7: Shift Completion Hook

**Decision**: The payment calculation hooks into the shift completion flow when `actualEndTime` is set and `status` changes to `COMPLETED`.

**Rationale**:
- Current shift actions in `src/features/shifts/api/shift-actions.ts` have CRUD but no completion action.
- No existing logic runs on status change to COMPLETED.
- A new `completeShiftAction()` (or modification of `updateShiftAction()`) will set actualEndTime, change status to COMPLETED, and trigger payment calculation.

**Important**: BASE_SALARY and MONTHLY components are NOT calculated per-shift. They are calculated at payroll generation time (monthly aggregation), prorated by contract days in the period.
