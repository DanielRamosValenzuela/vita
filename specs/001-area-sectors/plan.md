# Implementation Plan: Sectores (Agrupación de Áreas)

**Branch**: `001-area-sectors` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-area-sectors/spec.md`

## Summary

Implementar el concepto de **Sector** como agrupación lógica/física de múltiples áreas que trabajan juntas (ej: "USI" agrupa Enfermeras, Doctores, Técnicos, Kinesiólogos). El feature incluye CRUD de sectores, asignación muchos-a-muchos de áreas, y una consulta de personal de turno por rango horario que muestra resultados agrupados por área. Sigue los patrones existentes de Area (entity repository, server actions, FSD structure) con una nueva junction table `SectorArea`.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 16 (App Router), React 19
**Primary Dependencies**: Prisma, Zod, next-intl, Shadcn UI, lucide-react, date-fns
**Storage**: PostgreSQL (Supabase) via Prisma ORM
**Testing**: `npm run build` + `npm run lint` + manual UI testing
**Target Platform**: Web (desktop + responsive)
**Project Type**: Web application (Next.js monolith with FSD architecture)
**Performance Goals**: Staff query < 5s for sectors with up to 10 areas and 100 shifts in range
**Constraints**: Multi-tenant isolation (organizationId), role-based access (ADMIN_HR, CHIEF_AREA, STAFF_HEALTH)
**Scale/Scope**: ~5-15 sectors per organization, ~3-8 areas per sector, ~25 new files, ~5 modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. FSD & Code Quality | PASS | New entity `src/entities/sector/`, new feature `src/features/sector/`. No cross-feature imports. |
| II. Mandatory i18n | PASS | All strings via `useTranslations`/`getTranslations`. Keys in both es.json and en.json. |
| III. Multi-Tenant Isolation | PASS | `organizationId` on Sector model, all queries filter by org, auth guards on every action. |
| IV. Testing Standards | PASS | Build + lint verification. Manual test flows documented in spec acceptance scenarios. |
| V. Consistent UX | PASS | Shadcn UI components, semantic HTML, theme tokens. Follows Area table/form patterns. |
| VI. Tech Stack Governance | PASS | No new dependencies. Uses existing stack exclusively. |

**Post-Design Re-check**: All gates still pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-area-sectors/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Prisma schema design
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: Server action contracts
│   └── sector-actions.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                          # Modified: +Sector, +SectorArea models

src/entities/sector/
├── lib/
│   └── sector-repository.ts               # CRUD + query repository
└── index.ts                               # Re-exports

src/features/sector/
├── api/
│   ├── sector-actions.ts                  # CRUD + assign areas actions
│   ├── sector-staff-actions.ts            # Staff query action (time overlap)
│   └── index.ts
├── lib/
│   ├── schemas/
│   │   └── sector-schema.ts               # Zod schemas (create, update)
│   ├── validation/
│   │   ├── client/
│   │   │   └── sector-messages.ts         # useValidationMessages hook
│   │   └── server/
│   │       └── sector-messages.ts         # getValidationMessages async
│   ├── helpers/
│   │   ├── client/
│   │   │   ├── sector-schemas.ts          # useCreateSectorSchema
│   │   │   └── index.ts
│   │   └── server/
│   │       ├── sector-schemas.ts          # getCreateSectorSchema
│   │       └── index.ts
│   ├── types.ts                           # CreateSectorInput, UpdateSectorInput
│   └── index.ts
├── ui/
│   ├── sectors-table.tsx                  # List with search, pagination, filters
│   ├── create-sector-form.tsx             # Name, description, icon, color form
│   ├── sector-basic-info-card.tsx         # Edit basic info card
│   ├── sector-areas-card.tsx              # Area assignment multi-select card
│   ├── sector-staff-query.tsx             # Staff query: date/time picker + results
│   └── index.ts
└── index.ts

app/[locale]/dashboard/sectors/
├── page.tsx                               # List page
├── new/
│   └── page.tsx                           # Create page
└── [id]/
    ├── edit/
    │   └── page.tsx                       # Edit + assign areas page
    └── staff/
        └── page.tsx                       # Staff query page

src/widgets/dashboard-sidebar/
└── constants.ts                           # Modified: +sectors nav item

messages/
├── es.json                                # Modified: +sectors.*, +validation.sector.*
└── en.json                                # Modified: +sectors.*, +validation.sector.*
```

**Structure Decision**: Follows existing FSD architecture with entity layer (repository) and feature layer (actions, UI, schemas). No new patterns introduced — direct replication of Area feature structure.

## Complexity Tracking

> No constitution violations. No complexity tracking needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
