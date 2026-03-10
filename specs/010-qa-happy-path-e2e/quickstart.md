# Quickstart: QA Happy Path E2E

## Prerequisites

1. **Dev server running**: `npm run dev` → http://localhost:3000
2. **Browser MCP**: Connected and functional
3. **Supabase MCP**: Connected (project ref: tkfsyqywlojjztkewonv)
4. **SUPER_ADMIN account**: `prueba10@gmail.com` / `123qweASD.`

## Pre-flight Check

Before starting, verify no existing QA data:

```sql
SELECT COUNT(*) FROM "User" WHERE email LIKE 'vita.qa.%';
-- Expected: 0 (clean) or existing data from previous runs
```

If data exists from a previous run, clean up first:

```sql
-- WARNING: This deletes all QA test data
-- Run cleanup script from scripts/cleanup-qa-data.sql
```

## Execution Order

| Phase | Description | Tool | Est. Time |
|-------|-------------|------|-----------|
| 0 | Register 11 accounts | Browser MCP | 15 min |
| 1 | Create org + invite ADMIN_HR | Browser MCP | 10 min |
| 2 | Invite 8 CHIEFs | Browser MCP | 20 min |
| 3 | Link 2 STAFF (UI) + 100 (script) | Browser + Supabase MCP | 15 min |
| 4 | Create sectors + areas | Browser MCP | 15 min |
| 5 | Create shift types | Browser MCP | 15 min |
| 6 | Create rates + contracts + calendar | Browser + Supabase MCP | 30 min |
| 7 | Assign chiefs to sectors/areas | Browser MCP | 10 min |
| 8 | Assign staff to areas | Supabase MCP | 10 min |
| 9 | Create rotations + generate shifts | Browser MCP | 30 min |
| 10 | Verify STAFF view + payroll | Browser MCP | 15 min |
| 11 | Test shift swap | Browser MCP | 15 min |
| 12 | Validations + edge cases | Browser MCP | 15 min |
| **Total** | | | **~3.5 hours** |

## Credentials

- **All test accounts**: Password `123qweASD.`
- **Email pattern**: `vita.qa.{role}.{number}@gmail.com`

## Key URLs

| Page | URL |
|------|-----|
| Register | http://localhost:3000/es/register |
| Login | http://localhost:3000/es/login |
| Organizations (SA) | http://localhost:3000/es/dashboard/organizations |
| Admin HR Dashboard | http://localhost:3000/es/dashboard/admin-hr |
| Organization Settings | http://localhost:3000/es/dashboard/admin-hr/organization |
| Staff | http://localhost:3000/es/dashboard/staff |
| Sectors | http://localhost:3000/es/dashboard/sectors |
| Areas | http://localhost:3000/es/dashboard/areas |
| Shift Types | http://localhost:3000/es/dashboard/shift-types |
| Rates | http://localhost:3000/es/dashboard/rates |
| Rotations | http://localhost:3000/es/dashboard/rotations |
| Calendar | http://localhost:3000/es/dashboard/calendar |
| Payroll | http://localhost:3000/es/dashboard/payroll |
| Requests (Swap) | http://localhost:3000/es/dashboard/requests |
| Profile | http://localhost:3000/es/dashboard/profile |

## Reports Output

All reports go to `test-reports/`:

- `phase-XX-name.md` — functional QA report per phase
- `ux-findings.md` — UX evaluation findings
- `summary.md` — final summary with pass/fail counts

## Abort Criteria

Stop QA if:
- More than 3 phases fail consecutively
- Database becomes corrupted or inconsistent
- Dev server is unresponsive for > 5 minutes
