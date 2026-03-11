# Implementation Plan: Corrección de Findings QA Happy Path

**Branch**: `011-fix-qa-findings` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-fix-qa-findings/spec.md`

## Summary

Resolver toda la deuda técnica, mejoras UX y features faltantes identificadas durante el QA Happy Path E2E. Incluye: eliminación del rol muerto CHIEF_SECTOR (~15 archivos), generación masiva de turnos, progreso en tiempo real de nómina, flujo completo de completar turnos con ShiftPayment, mejoras UX en rotativas/tarifas/staff, y la UI de Shift Swap. Se cierra con un ciclo de QA E2E para validar todo.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node.js 20+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Prisma ORM, Zod, NextAuth v4, shadcn/ui, lucide-react, next-intl, date-fns
**Storage**: PostgreSQL (Supabase), Supabase Storage (PDFs)
**Testing**: `npm run build` + `npm run lint` + manual E2E via browser (agent-browser)
**Target Platform**: Web (responsive: desktop lg+ sidebar, mobile hamburger sheet)
**Project Type**: Web (Next.js App Router, FSD architecture)
**Performance Goals**: Generación masiva <2 min para 7 rotativas, progreso nómina actualizado cada ≤5s
**Constraints**: Server Actions only (no API Routes), multi-tenant con organizationId, i18n obligatorio (es/en)
**Scale/Scope**: ~112 usuarios, ~1354 turnos, ~110 documentos de nómina, 2 sectores, 6 áreas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | Todos los cambios respetan layers: entities > features > widgets > app |
| II. Mandatory i18n | PASS | Nuevas keys en es.json/en.json para todas las US |
| III. Multi-Tenant Isolation | PASS | Todas las queries incluyen organizationId, auth guards existentes |
| IV. Testing Standards | PASS | QA E2E final con browser automation (US-específico, per user's request) |
| V. Consistent UX & Accessibility | PASS | shadcn/ui, keyboard-accessible, responsive |
| VI. Technology Stack Governance | PASS | Sin dependencias nuevas; SSE para progreso usa API Route (justificado como excepción técnica similar a webhooks) |

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-qa-findings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── shift-completion.md
│   ├── mass-generation.md
│   ├── payroll-progress.md
│   └── shift-swap.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Existing FSD structure — files to modify/create

prisma/
└── schema.prisma                           # Remove CHIEF_SECTOR from Role enum

src/
├── shared/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── rbac.ts                     # Remove isChiefSector()
│   │   │   └── session.ts                  # Remove CHIEF_SECTOR from guards
│   │   ├── constants/
│   │   │   └── roles.ts                    # Remove CHIEF_SECTOR constant
│   │   ├── utils/
│   │   │   ├── role-display.ts             # Remove CHIEF_SECTOR config
│   │   │   └── count-users-by-role.ts      # Unify chief counting
│   │   └── payment/
│   │       ├── generate-payroll-core.ts     # Add progress callback
│   │       └── calculate-shift-payment.ts   # NEW: Calculate ShiftPayment from contract
│   └── config/
│       └── env.server.ts                    # (unchanged)
│
├── entities/
│   ├── shift/
│   │   ├── lib/
│   │   │   └── shift-completion.ts          # NEW: Batch complete shifts by day
│   │   └── ui/
│   │       └── shift-calendar.tsx           # Add status-based styling (SCHEDULED vs COMPLETED)
│   ├── swap/
│   │   ├── lib/
│   │   │   ├── swap-repository.ts           # Expand with full CRUD
│   │   │   └── swap-validation.ts           # Expand validations
│   │   └── types/
│   │       └── swap-types.ts                # Expand types
│   ├── organization/
│   │   └── lib/
│   │       ├── organization-usage.ts        # Unify chief counting
│   │       └── organization-limits.ts       # Unify chief limits
│   ├── rotation/
│   │   └── lib/
│   │       └── coverage-calculator.ts       # Add summary percentage for list view
│   └── payroll/
│       └── lib/
│           └── payroll-repository.ts        # (unchanged)
│
├── features/
│   ├── rotations/
│   │   ├── api/
│   │   │   └── generation-actions.ts        # Add bulkGenerateShiftsAction
│   │   └── ui/
│   │       ├── generation-dialog.tsx         # Fix date picker month jump
│   │       ├── mass-generation-dialog.tsx    # NEW: Bulk generation with checklist
│   │       └── rotation-list-card.tsx        # Add coverage badge
│   ├── shifts/
│   │   ├── api/
│   │   │   └── shift-actions.ts             # Add completeShiftsByDayAction
│   │   └── ui/
│   │       ├── shift-completion-dialog.tsx   # NEW: Day completion with exclusion list
│   │       └── pending-shifts-alert.tsx      # NEW: Dashboard alert for overdue shifts
│   ├── payroll/
│   │   ├── api/
│   │   │   └── payroll-actions.ts           # Add progress tracking
│   │   └── ui/
│   │       ├── payroll-generation.tsx        # Add progress bar component
│   │       └── payroll-progress-bar.tsx      # NEW: Real-time progress display
│   ├── swap/
│   │   ├── api/
│   │   │   └── swap-actions.ts              # NEW: Create/accept/reject/approve swaps
│   │   └── ui/
│   │       ├── swap-request-dialog.tsx       # NEW: Request swap from calendar
│   │       ├── swap-offers-panel.tsx         # NEW: View/accept incoming offers
│   │       └── swap-approval-panel.tsx       # NEW: CHIEF approval interface
│   ├── admin-hr/
│   │   ├── ui/
│   │   │   ├── staff-view-page.tsx          # Add role filter + desglose conteo
│   │   │   └── invite-user-form.tsx         # Remove CHIEF_SECTOR option
│   │   └── data/
│   │       └── dashboard-repository.ts      # Unify chief card
│   └── rates/
│       └── ui/
│           └── rate-list-card.tsx            # Add component count badge
│
├── widgets/
│   └── dashboard-sidebar/
│       ├── constants.ts                     # Remove CHIEF_SECTOR from nav roles
│       └── index.tsx                        # Replace displayRole with sector badge
│
app/
├── [locale]/
│   ├── dashboard/
│   │   ├── layout.tsx                       # Remove displayRole CHIEF_SECTOR logic
│   │   ├── requests/page.tsx                # Remove CHIEF_SECTOR reference
│   │   ├── admin-hr/organization/page.tsx   # Unify chief limit card
│   │   ├── organizations/[id]/page.tsx      # Remove CHIEF_SECTOR reference
│   │   └── swap/                            # NEW: Swap routes
│   │       └── page.tsx                     # Swap management page
│   └── api/
│       └── payroll-progress/
│           └── route.ts                     # NEW: SSE endpoint for payroll progress
│
messages/
├── es.json                                  # Add keys for all new UI
└── en.json                                  # Add keys for all new UI

test-reports/
└── qa-011-fix-qa-findings/                  # NEW: QA validation of this feature
    └── qa-summary.md
```

**Structure Decision**: Follows existing FSD architecture. New files placed in correct FSD layers. The only API Route addition (`/api/payroll-progress`) is justified as a technical SSE endpoint (similar to webhooks exception in constitution).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| API Route for SSE (`/api/payroll-progress`) | Server Actions cannot stream progress; SSE requires a persistent HTTP connection | Polling would work but adds latency (up to 5s delay) and unnecessary requests. SSE provides real-time updates with a single connection. |

## Phase 0: Research Decisions

### R1: Payroll Progress Mechanism

**Decision**: Server-Sent Events (SSE) via a single API Route
**Rationale**: Server Actions return a single response — they cannot push intermediate updates. SSE provides a lightweight, native browser API for real-time progress without WebSocket complexity. The payroll generation core function (`generate-payroll-core.ts`) processes users in a `for` loop — adding a progress callback is trivial. The SSE route reads from a progress store (in-memory Map keyed by periodId).
**Alternatives Considered**:
- Polling (rejected: up to 5s delay, multiple requests)
- WebSockets (rejected: overkill for one-directional updates, not in stack)
- React streaming/Suspense (rejected: doesn't work with Server Actions that aren't rendering)

### R2: ShiftPayment Calculation

**Decision**: Reuse existing `calculatePayrollForUser` logic but extract the shift-specific calculation into a standalone `calculateShiftPayment` function
**Rationale**: `calculate-payroll.ts` already computes per-shift amounts using contract components. Extracting the shift-specific part into `calculate-shift-payment.ts` avoids duplication and ensures consistency between real-time ShiftPayment creation and batch payroll generation.
**Alternatives Considered**:
- Calculate at payroll generation time only (rejected: defeats the purpose of real-time completion tracking)
- Duplicate calculation logic (rejected: violates DRY, risk of divergence)

### R3: CHIEF_SECTOR Removal Strategy

**Decision**: Remove enum value from Prisma schema, update all ~15 files, keep UserSector table as metadata. Migrate existing DB data first (verify 0 users have role=CHIEF_SECTOR).
**Rationale**: QA confirmed 0 users have CHIEF_SECTOR role. The enum can be safely removed. UserSector remains useful for indicating which CHIEFs manage at sector level.
**Alternatives Considered**:
- Keep CHIEF_SECTOR and implement real functionality (rejected: user confirmed it's dead code to remove)
- Soft-remove (comment out) (rejected: still generates confusion, leaves dead code)

### R4: Bulk Generation Architecture

**Decision**: New Server Action `bulkGenerateShiftsAction` that iterates over selected rotationIds, calling existing `generateShiftsAction` logic per rotation, with per-rotation error isolation.
**Rationale**: Reusing the existing generation logic avoids duplication. Processing sequentially per rotation with try/catch per iteration ensures one failure doesn't block others. Results aggregated into a summary.
**Alternatives Considered**:
- Parallel generation (rejected: risk of DB connection exhaustion with N concurrent heavy queries)
- New generation function (rejected: would duplicate ~200 lines of logic)

### R5: Shift Swap UI Architecture

**Decision**: Minimal swap flow using existing Prisma models (`ShiftSwapRequest`, `ShiftSwapOffer`). New page at `/dashboard/swap` for CHIEF approval. STAFF interaction through calendar shift click + notification inbox.
**Rationale**: Models already exist in schema with proper enums and relationships. Only Server Actions and UI components are missing.
**Alternatives Considered**:
- Embedded in calendar only (rejected: CHIEF needs a dedicated approval view)
- New entity design (rejected: existing models are well-structured)

## Phase 1: Data Model & Contracts

Data model and contracts are generated as separate files.
