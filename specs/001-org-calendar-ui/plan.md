# Implementation Plan: UI para Gestión del Calendario Organizacional

**Branch**: `001-org-calendar-ui` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-org-calendar-ui/spec.md`

## Summary

Enhance the existing organizational calendar feature to match the full spec: migrate the form from Dialog to Sheet, add delete functionality in UI, add month summary stats, implement national holiday bulk import for 5 Latam countries, add Zod validation, fix i18n violations in the calendar view, and enforce multiplier minimum of 0.1. The Prisma model, route, sidebar entry, Server Actions (CRUD + bulk), and basic UI already exist — this plan focuses on the gaps.

## Technical Context

**Language/Version**: TypeScript strict, React 19, Next.js 16 (App Router)
**Primary Dependencies**: Shadcn UI (Sheet, AlertDialog, Checkbox), next-intl, Zod, date-fns/date-fns-tz, lucide-react
**Storage**: PostgreSQL (Supabase) via Prisma — `OrganizationCalendar` model already exists
**Testing**: `npm run build` + `npm run lint` + manual UI testing
**Target Platform**: Web (responsive: desktop lg+ sidebar, mobile hamburger sheet)
**Project Type**: Web application (Next.js App Router, FSD architecture)
**Performance Goals**: Calendar loads in < 1s per month, bulk import < 3s for ~20 holidays
**Constraints**: Multi-tenant isolation (organizationId in all queries), i18n mandatory (no JSX literals)
**Scale/Scope**: ~20-50 calendar entries per organization per year, 5 countries of holiday data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | Calendar code stays in `features/admin-hr/` (existing location). New holiday datasets go in `shared/lib/constants/`. Zod schemas added for validation. |
| II. Mandatory i18n | FIX NEEDED | Existing calendar view has hardcoded Spanish day names (`'Dom', 'Lun', ...`). Must be replaced with i18n keys. New import UI must use translation keys. |
| III. Multi-Tenant Isolation | PASS | All existing actions already use `requireAdminHRWithOrg()` and filter by `organizationId`. New import action will follow same pattern. |
| IV. Testing Standards | PASS | Feature must pass `build` + `lint`. Manual test flows documented in spec acceptance scenarios. |
| V. Consistent UX & Accessibility | FIX NEEDED | Form migrating from Dialog to Sheet per clarification. Delete confirmation must use AlertDialog. Calendar grid needs keyboard navigation. |
| VI. Technology Stack | PASS | No new dependencies. Using existing Shadcn Sheet, AlertDialog, Checkbox components. |

**Gate result**: PASS with 2 fixes required (i18n day names, Dialog→Sheet migration). No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-org-calendar-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Server Actions contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── lib/
│       └── constants/
│           └── holidays/           # NEW: National holiday datasets
│               ├── index.ts
│               ├── types.ts
│               ├── cl.ts           # Chile holidays
│               ├── co.ts           # Colombia holidays
│               ├── pe.ts           # Peru holidays
│               ├── ar.ts           # Argentina holidays
│               └── mx.ts          # Mexico holidays
├── features/
│   └── admin-hr/
│       ├── api/
│       │   └── calendar-actions.ts # MODIFY: Add Zod, import action, fix validation
│       ├── lib/
│       │   └── calendar-schemas.ts # NEW: Zod schemas for calendar forms
│       └── ui/
│           ├── calendar-day-form.tsx           # MODIFY: Dialog → Sheet, add delete
│           ├── organization-calendar-page.tsx  # MODIFY: Add month summary, import button
│           └── calendar-import-dialog.tsx      # NEW: Bulk import UI component
├── widgets/
│   └── calendar-view/
│       └── organization-calendar-view.tsx # MODIFY: Fix i18n day names, add stats
│
app/[locale]/dashboard/calendar/
└── page.tsx                                # MODIFY: Minor adjustments if needed

messages/
├── es.json  # MODIFY: Add import-related keys, weekday names
└── en.json  # MODIFY: Add import-related keys, weekday names
```

**Structure Decision**: Feature code stays in `features/admin-hr/` (existing location) since the calendar is an ADMIN_HR-owned module. Holiday datasets go in `shared/lib/constants/holidays/` as static data reusable across features. No new FSD layer or entity needed — the existing pattern is sufficient.

## Complexity Tracking

> No constitution violations to justify. All changes align with existing patterns.
