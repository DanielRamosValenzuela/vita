# Quickstart: Payroll Billing PDF Generation

**Feature Branch**: `006-payroll-billing-pdf`
**Date**: 2026-03-03

## Prerequisites

- Node.js 18+
- Project running with `npm run dev`
- Supabase project with PostgreSQL access
- At least one organization with:
  - Active staff with contracts assigned
  - Rate templates with components (especially BASE_SALARY)
  - Completed shifts in a past month
  - Calendar configured (optional, for multipliers)

## Setup Steps

### 1. Install dependency

```bash
npm install @react-pdf/renderer
```

### 2. Database migration

Apply Prisma schema changes:
- Add `billingDay` field to Organization model
- Add `PayrollPeriod` model
- Add `PayrollDocument` model
- Add new `PayrollPeriodStatus` enum
- Add new `NotificationType` values (PAYROLL_GENERATED, PAYROLL_GENERATION_FAILED, PAYROLL_DOCUMENT_AVAILABLE)

```bash
npx prisma db push
npx prisma generate
```

### 3. Supabase Storage bucket

Create `payroll-documents` bucket (private) via Supabase Dashboard or SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('payroll-documents', 'payroll-documents', false);
```

### 4. i18n keys

Add translation keys to `messages/es.json` and `messages/en.json`:
- `nav.payroll` / `nav.payments` / `nav.myPayments`
- `payroll.*` namespace for all payroll UI strings
- `pdf.*` namespace for PDF document content strings

### 5. Environment variables (for Cron API Route)

Add to Next.js `.env` and Supabase Vault:
- `CRON_SECRET`: Shared secret for pg_cron → API Route auth (min 32 chars)
- `app.settings.app_url`: Next.js app public URL (set in Supabase DB settings for pg_net)

## File Structure (FSD)

```
src/
├── shared/
│   ├── lib/
│   │   ├── payment/           # NEW: Payment calculation engine
│   │   │   ├── calculate-shift-payment.ts
│   │   │   ├── calculate-payroll.ts
│   │   │   └── types.ts
│   │   └── storage/
│   │       └── supabase-storage.ts  # EXTEND: add payroll bucket functions
│   └── ui/
│       └── pdf/               # NEW: Reusable PDF primitives (header, table, etc.)
│
├── entities/
│   └── payroll/               # NEW: Payroll domain
│       ├── lib/
│       │   ├── payroll-repository.ts
│       │   └── types.ts
│       └── index.ts
│
├── features/
│   ├── admin-hr/
│   │   └── api/
│   │       └── payroll-actions.ts     # NEW: billing config, generate, regenerate, delete
│   │   └── ui/
│   │       ├── billing-day-config.tsx  # NEW: billing day input component
│   │       └── payroll-generation.tsx  # NEW: manual generation trigger UI
│   │
│   ├── payroll/               # NEW: Payroll history (shared by all roles)
│   │   ├── api/
│   │   │   └── payroll-history-actions.ts
│   │   └── ui/
│   │       ├── payroll-page.tsx        # Main page (role-aware)
│   │       ├── payroll-periods-list.tsx
│   │       ├── payroll-documents-table.tsx
│   │       └── payroll-document-pdf.tsx # PDF template component
│   │
│   └── shifts/
│       └── api/
│           └── shift-payment-actions.ts # NEW: shift payment action + completion hook
│
├── widgets/
│   └── dashboard-sidebar/
│       └── constants.ts        # MODIFY: add payroll nav item
│
app/
├── [locale]/dashboard/
│   └── payroll/
│       └── page.tsx           # NEW: Payroll page route
└── api/
    └── cron/
        └── generate-payroll/
            └── route.ts       # NEW: Cron API Route (replaces Edge Function)
```

## Development Order

1. **Schema + migration** — Add models, run `prisma db push`
2. **Payment calculation engine** — `shared/lib/payment/` (pure logic, no UI)
3. **Shift completion hook** — Trigger payment calculation on check-out
4. **Payroll repository** — `entities/payroll/` (DB operations)
5. **Storage extension** — Add payroll bucket functions
6. **PDF template** — `features/payroll/ui/payroll-document-pdf.tsx`
7. **Admin HR actions** — billing config, generate, regenerate, delete
8. **History actions** — periods list, documents list, download
9. **UI: billing day config** — Input on rates page
10. **UI: payroll page** — Dashboard page with role-based views + generation UI
11. **Navigation** — Add sidebar item
12. **Cron API Route** — `app/api/cron/generate-payroll/route.ts` + pg_cron setup
13. **Notifications** — ADMIN_HR (generation complete) + STAFF (document available)
14. **i18n** — All translation keys

## Verification

After implementation, verify:

```bash
npm run build    # Must pass
npm run lint     # Must pass
```

Manual testing:
1. As ADMIN_HR: configure billing day → verify persistence
2. As ADMIN_HR: generate payroll for a past month → verify PDFs created
3. As ADMIN_HR: download a document → verify PDF content
4. As ADMIN_HR: regenerate individual document → verify replacement
5. As ADMIN_HR: delete a document → verify removal
6. As CHIEF_AREA: access payroll page → see only area staff documents
7. As STAFF: access payroll page → see only own documents
8. Cross-org test: verify no data leaks between organizations
9. As STAFF: verify notification received when document is generated
