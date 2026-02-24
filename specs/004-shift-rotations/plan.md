# Implementation Plan: Shift Rotations (Rotativas)

**Branch**: `004-shift-rotations` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-shift-rotations/spec.md`

## Summary

Implement a cyclic shift rotation system that allows CHIEF_AREA and ADMIN_HR users to define repeating shift patterns (e.g., "cuarto turno": Largo, Noche, Libre, Libre), organize staff into offset groups for continuous coverage, and auto-generate individual shifts for all group members over a selected date range. Includes understaffing detection with smart-tiered extra shift suggestions and cross-area candidate availability.

The feature introduces 5 new Prisma models (Rotation, RotationStep, RotationShiftConfig, RotationGroup, RotationMember), extends the existing Shift model with optional rotation linkage, adds a new FSD feature slice (`src/features/rotations/`), a new entity (`src/entities/rotation/`), a dedicated dashboard page (`/dashboard/rotations`), and new notification types.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19, Next.js 16 (App Router)
**Primary Dependencies**: Prisma, Zod, next-intl, date-fns, date-fns-tz, Shadcn UI, lucide-react, NextAuth v4
**Storage**: PostgreSQL (Supabase) via Prisma ORM
**Testing**: `npm run build` + `npm run lint` + manual UI testing (per Constitution IV)
**Target Platform**: Web (desktop + responsive)
**Project Type**: Web application (Next.js App Router, FSD architecture)
**Performance Goals**: Shift generation for 40 people x 31 days (~160 shifts) completes in <5 seconds. Coverage overview renders in <2 seconds.
**Constraints**: Multi-tenant isolation mandatory. Chilean labor law awareness (DL 2763 Art. 72) informational only. Server Actions only (no API Routes).
**Scale/Scope**: ~40 staff per rotation, up to 6 groups, generation for 1-3 months at a time. Expected <100 active rotations per organization.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | FSD & Code Quality | PASS | New feature in `src/features/rotations/`, entity in `src/entities/rotation/`. No cross-feature imports needed. Server Actions return `ActionResult<T>`. Zod validation on all inputs. |
| II | Mandatory i18n | PASS | All UI text via `useTranslations`/`getTranslations`. Keys in `messages/es.json` + `messages/en.json`. No JSX literals. |
| III | Multi-Tenant Isolation | PASS | All new models include `organizationId`. All Server Actions filter by org. Auth guards `requireAdminHROrChiefArea()` + area-based access via UserArea. |
| IV | Testing Standards | PASS | `npm run build` + `npm run lint`. Manual UI test flows documented in spec acceptance scenarios. Edge cases identified (10 in spec). |
| V | Consistent UX & Accessibility | PASS | Shadcn UI components. Semantic HTML. Keyboard accessible. Responsive. AlertDialog for destructive ops (delete rotation, regenerate). |
| VI | Tech Stack Governance | PASS | No new dependencies. Uses existing Prisma, Zod, date-fns, Shadcn, lucide-react, next-intl. |

**Result**: All 6 gates PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/004-shift-rotations/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output - Prisma schema additions
├── quickstart.md        # Phase 1 output - Implementation guide
├── contracts/           # Phase 1 output - Server action contracts
│   ├── rotation-actions.ts    # CRUD rotation + groups + members
│   ├── generation-actions.ts  # Shift generation + coverage
│   └── extras-actions.ts      # Extra shift candidates + assignment
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# New files for this feature (FSD structure)

src/
├── entities/
│   └── rotation/
│       ├── index.ts                    # Barrel export
│       └── lib/
│           ├── index.ts                # Barrel export
│           ├── rotation-helpers.ts     # Pattern cycling, offset calculation
│           ├── coverage-calculator.ts  # Coverage analysis, gap detection
│           └── extra-tier-engine.ts    # Smart tier recommendation logic
│
├── features/
│   └── rotations/
│       ├── api/
│       │   ├── index.ts               # Barrel export
│       │   ├── rotation-actions.ts    # CRUD: create, update, delete, get, list rotations
│       │   ├── group-actions.ts       # CRUD: groups + member management
│       │   ├── generation-actions.ts  # Generate shifts, check conflicts, coverage alerts
│       │   └── extras-actions.ts      # Get candidates, assign extra shifts
│       ├── lib/
│       │   └── rotation-schemas.ts    # Zod schemas for all rotation forms
│       ├── types/
│       │   └── rotation-types.ts      # TypeScript types for rotation domain
│       └── ui/
│           ├── index.ts               # Barrel export
│           ├── rotations-page.tsx      # Main list page
│           ├── rotation-form.tsx       # Create/edit rotation (pattern builder)
│           ├── rotation-detail.tsx     # Rotation detail with groups + coverage
│           ├── rotation-groups.tsx     # Group management (add/remove members)
│           ├── coverage-overview.tsx   # Calendar grid coverage view
│           ├── generation-dialog.tsx   # Date range picker + conflict preview + generate
│           ├── extras-dialog.tsx       # Smart tier candidate list + assign
│           └── rotation-filters.tsx    # Filter/search for rotation list
│
├── shared/
│   └── (no new files - reuses existing ui, lib, types)
│
└── widgets/
    └── dashboard-sidebar/
        └── constants.ts               # Modified: add /dashboard/rotations nav entry

# Route files
app/[locale]/dashboard/rotations/
├── page.tsx                            # Server component page
└── loading.tsx                         # Skeleton loading state

# Schema
prisma/schema.prisma                    # Modified: 5 new models + Shift extension + new NotificationTypes
```

**Structure Decision**: FSD web application structure. New rotation domain split between `entities/rotation` (pure domain logic: pattern math, coverage analysis, tier engine) and `features/rotations` (Server Actions, UI, Zod schemas). This follows the existing `entities/shift` + `features/shifts` pattern already in the codebase.

## Complexity Tracking

> No violations to justify. All gates pass cleanly.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| 5 new Prisma models | Justified | Each model maps to a distinct domain concept (Rotation, Step, Config, Group, Member) as defined in spec. No way to reduce without losing domain clarity. |
| Separate entity + feature | FSD standard | Follows existing `entities/shift` + `features/shifts` pattern. Entity has pure logic, feature has server actions + UI. |
| Extra tier engine in entities | Domain logic | Tier calculation is pure business rules (no DB, no auth). Correct FSD placement in entities layer. |
