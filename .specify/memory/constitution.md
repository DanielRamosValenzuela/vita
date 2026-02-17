<!--
  Sync Impact Report
  ===================
  Version change: 0.0.0 → 1.0.0 (initial ratification)

  Added principles:
    - I. Feature-Sliced Design & Code Quality
    - II. Mandatory Internationalization
    - III. Multi-Tenant Isolation
    - IV. Testing Standards
    - V. Consistent UX & Accessibility
    - VI. Technology Stack Governance

  Added sections:
    - Technology Stack & Constraints
    - Development Workflow
    - Governance

  Removed sections: none (first version)

  Templates requiring updates:
    ✅ plan-template.md — Constitution Check section references principles
    ✅ spec-template.md — no changes needed, already aligned
    ✅ tasks-template.md — no changes needed, already aligned
    ⚠ No commands/ directory found — N/A

  Follow-up TODOs: none
-->

# VITA Constitution

## Core Principles

### I. Feature-Sliced Design & Code Quality

All source code MUST follow Feature-Sliced Design (FSD) layer rules:

- **Layer hierarchy**: `shared` → `entities` → `features` → `widgets` → `app`.
- `features` MUST NOT import from other `features`.
- `entities` MUST NOT import from `features` or `widgets`.
- `shared` MUST NOT import from `entities`, `features`, or `widgets`.
- New files MUST be placed in the correct FSD layer. When in doubt,
  consult `docs/vita-shared-fsd.md`.
- TypeScript strict mode is mandatory. Prisma models are the source
  of truth for types. Server Actions MUST return `ActionResult<T>`.
- Code style: 2-space indentation, ESLint/Prettier config of the repo.
- Forms use `useFormAction` + Zod. Destructive operations require
  `AlertDialog` confirmation. Submit buttons MUST handle `isPending`.

**Rationale**: FSD prevents circular dependencies, enforces domain
boundaries, and keeps the codebase navigable as features grow.

### II. Mandatory Internationalization

Every user-visible string MUST use `useTranslations` (client) or
`getTranslations` (server) from next-intl. No literal text in JSX.

- The ESLint rule `react/jsx-no-literals` is enforced; the build
  MUST fail if a literal is introduced.
- Translation keys MUST exist in both `messages/es.json` and
  `messages/en.json` with identical structure.
- Date and currency formats MUST follow the per-country conventions
  defined in `docs/INTERNACIONALIZACION.md`.

**Rationale**: VITA targets Chilean hospitals but supports English.
Consistent i18n from day one avoids costly retrofit.

### III. Multi-Tenant Isolation

Every data-bearing entity MUST include `organizationId` and every
Server Action MUST filter by the authenticated user's organization.

- NEVER expose, return, or mutate data belonging to another
  organization.
- Use existing auth guards (`requireAdminHRWithOrg`, etc.) for
  every Server Action. Do not create ad-hoc authorization checks.
- Prisma queries MUST include `organizationId` in their `where`
  clause. Composite indexes `(organizationId, ...)` MUST be
  maintained for performance.
- Environment variables MUST be read from
  `src/shared/config/env.server.ts`; direct `process.env` access
  is prohibited in new code.

**Rationale**: Multi-tenancy is the security foundation of a B2B
SaaS. A single leak of cross-organization data is a critical defect.

### IV. Testing Standards

- New features MUST pass `npm run build` and `npm run lint` before
  being considered complete.
- Server Actions MUST be manually testable via the UI; document the
  test flow in the feature's spec or workflow doc.
- Edge cases (empty states, permission denials, concurrent edits)
  MUST be considered during implementation and noted in acceptance
  criteria.
- When automated tests exist, they MUST pass before merge. Flaky
  tests MUST be fixed or quarantined, never ignored.

**Rationale**: In a healthcare scheduling system, incorrect data or
broken workflows directly impact patient care continuity.

### V. Consistent UX & Accessibility

- Use Shadcn UI components and semantic HTML. Do not invent custom
  controls when a Shadcn primitive exists.
- Use semantic CSS variables (`--primary`, `--destructive`,
  `--muted-foreground`). Direct color classes (e.g.,
  `text-orange-600`) are prohibited; use theme tokens instead.
- All interactive elements MUST be keyboard-accessible.
- The dashboard MUST remain responsive: sidebar on desktop (lg+),
  hamburger sheet on mobile/tablet.
- Avoid `window.confirm` and `window.prompt`; use Shadcn
  `AlertDialog` for confirmations.

**Rationale**: Hospital staff access VITA from varied devices and
contexts. Accessible, consistent UI reduces training and errors.

### VI. Technology Stack Governance

The approved stack is:

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4, Shadcn UI, lucide-react |
| i18n | next-intl (ES/EN) |
| Backend | Server Actions (no API Routes except webhooks) |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth.js v4 (JWT), bcryptjs |
| Validation | Zod |
| State | Zustand (local UI), Server Components (server state) |
| Dates | date-fns, date-fns-tz (Chile timezone) |

- Adding a new dependency MUST be justified. Prefer existing stack
  capabilities over new libraries.
- API Routes are prohibited except for webhook endpoints.
- Server Actions are the sole backend pattern for client→server
  communication.

**Rationale**: Stack consistency reduces onboarding cost and
prevents dependency sprawl in a domain-heavy application.

## Technology Stack & Constraints

- **Roles**: `SUPER_ADMIN`, `ADMIN_HR`, `CHIEF_AREA`, `STAFF_HEALTH`.
  Every feature MUST respect role-based access. Server Actions MUST
  verify the caller's role before executing.
- **Legal compliance**: Shift scheduling MUST consider Chilean Labor
  Code (Codigo del Trabajo) constraints where applicable.
- **Documentation**: New features MUST be documented in the relevant
  `docs/` file (workflows, architecture, or module-specific doc).
  The roadmap MUST be updated if priorities change.
- **Prisma as source of truth**: Schema changes go through Prisma
  migrations (`prisma db push` for dev, migrations for production).
  Manual SQL DDL is prohibited outside Supabase migrations.

## Development Workflow

1. **Before writing code**: read the relevant `docs/` sections
   (overview, architecture, workflows, module-specific doc).
2. **Branch naming**: follow the `###-feature-name` convention from
   speckit or descriptive names for fixes.
3. **FSD placement**: verify every new file is in the correct layer.
4. **i18n**: add keys to both `es.json` and `en.json` before or
   alongside the component that uses them.
5. **Multi-tenant**: every new query or action MUST include
   `organizationId` filtering.
6. **Validation**: run `npm run build` locally
   before committing.
7. **Commit messages**: use conventional commits
   (`feat:`, `fix:`, `refactor:`, `docs:`).

## Governance

- This constitution supersedes conflicting guidance in other
  documents. When `CLAUDE.md` and this constitution disagree,
  this constitution prevails.
- **Amendments**: any change to a Core Principle requires
  documentation of the rationale, version bump, and update of the
  Sync Impact Report at the top of this file.
- **Versioning**: MAJOR for principle removal/redefinition, MINOR
  for new principles or material expansion, PATCH for wording
  clarifications.
- **Compliance review**: every PR or feature implementation MUST
  be checked against the six Core Principles. Violations MUST be
  justified in a Complexity Tracking table (see plan template) or
  resolved before merge.
- **Runtime guidance**: `CLAUDE.md` serves as the quick-reference
  for agents. It MUST remain consistent with this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-02-16 | **Last Amended**: 2026-02-16
