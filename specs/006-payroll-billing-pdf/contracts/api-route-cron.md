# API Route Contract: Payroll Auto-Generation (Cron)

**Feature Branch**: `006-payroll-billing-pdf`
**Date**: 2026-03-03
**Updated**: 2026-03-03 — Changed from Supabase Edge Function to Next.js API Route

## Route: `app/api/cron/generate-payroll/route.ts`

**Trigger**: pg_cron via pg_net HTTP POST (daily at 12:00 UTC)
**Auth**: Custom CRON_SECRET validation (not NextAuth — this is a machine-to-machine call)
**Runtime**: Node.js (Next.js API Route) — full access to Prisma, shared/lib, @react-pdf/renderer

### Why API Route instead of Edge Function

- **Zero code duplication**: Reuses `calculatePayrollForUser`, `generatePayrollAction` logic, Prisma queries, `@react-pdf/renderer` templates, and storage utilities directly. No reimplementation needed.
- **Same runtime**: Runs in Node.js like the rest of the app. No Deno compatibility issues.
- **Constitution-compliant**: API Routes are prohibited except for webhook endpoints. This IS a webhook receiving pg_cron calls — justified exception documented in Complexity Tracking.

### Request

```typescript
POST /api/cron/generate-payroll
Headers:
  Content-Type: application/json
  Authorization: Bearer <CRON_SECRET>

Body:
{
  "triggered_at": "2026-03-01T12:00:00Z"  // UTC timestamp from pg_cron
}
```

### Response

```typescript
// Success
200 OK
{
  "processed": 3,       // Organizations processed
  "succeeded": 2,       // Organizations with successful generation
  "failed": 1,          // Organizations with failures
  "skipped": 0,         // Organizations skipped (already generated, suspended, etc.)
  "details": [
    {
      "organizationId": "abc",
      "organizationName": "Hospital XYZ",
      "status": "completed",
      "documentsGenerated": 15,
      "totalAmount": 25000000
    },
    {
      "organizationId": "def",
      "organizationName": "Clínica ABC",
      "status": "failed",
      "error": "Storage upload failed"
    }
  ]
}

// Auth failure
401 Unauthorized
{ "error": "Invalid CRON_SECRET" }
```

### Logic Flow

```
1. Validate CRON_SECRET from Authorization header
2. Determine current date in Chile timezone (America/Santiago) using date-fns-tz
3. Get today's day of month
4. Query organizations WHERE:
   - billingDay matches today's day (with short-month adjustment)
   - status = ACTIVE
5. For each matching organization:
   a. Check if PayrollPeriod already exists for previous month
   b. If exists → skip, create notification "already generated"
   c. If not exists → execute payroll generation:
      - Call same logic as generatePayrollAction (Prisma, calculatePayrollForUser, renderToStream, storage upload)
      - Create PayrollPeriod, calculate payments, generate PDFs
      - Upload to Storage, create PayrollDocuments
   d. Create PAYROLL_GENERATED notification for org's ADMIN_HR users
   e. Create PAYROLL_DOCUMENT_AVAILABLE notification for each STAFF whose document was generated
6. Return summary
```

### Day-of-Month Adjustment

When `billingDay = 31` and current month has fewer days:
- Match organizations where `billingDay >= last day of current month`
- Example: Feb 28 matches billingDay = 28, 29, 30, 31

### pg_cron Setup

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily check at 12:00 UTC (~08:00-09:00 Chile time)
SELECT cron.schedule(
  'payroll-auto-generation',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.app_url') || '/api/cron/generate-payroll',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := jsonb_build_object('triggered_at', now()::text),
    timeout_milliseconds := 300000
  ) AS request_id;
  $$
);
```

**Note**: `app.settings.app_url` must be set to the Next.js app's public URL (e.g., `https://vita.example.com`). This replaces the original `app.settings.supabase_url` + Edge Function path.

### Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `CRON_SECRET` | Next.js `.env` + Supabase Vault | Shared secret for pg_cron → API Route auth |
| `app.settings.app_url` | Supabase `ALTER DATABASE ... SET` | Next.js app public URL |
| `app.settings.cron_secret` | Supabase `ALTER DATABASE ... SET` | Same CRON_SECRET for pg_net to send |

### Error Handling

- If API Route times out: pg_net records failure in its logs. Next day's run will detect missing period and retry.
- If individual org fails: other orgs continue processing. Failed org gets error notification.
- If Storage upload fails for a document: document is skipped, logged in PayrollPeriod.errorLog, period status = COMPLETED_WITH_ERRORS.
- Max execution time: Depends on hosting (Vercel Pro: 300s, self-hosted: unlimited). For orgs with 50+ staff, PDFs are generated sequentially with memory management.

### Security

- CRON_SECRET MUST be a strong random string (min 32 chars)
- The route MUST reject any request without valid CRON_SECRET
- The route MUST NOT be accessible via NextAuth session — it's machine-to-machine only
- Rate limiting recommended: reject if called more than once per hour
