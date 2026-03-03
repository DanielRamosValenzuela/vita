# Implementation Plan: Payroll Billing PDF Generation

**Branch**: `006-payroll-billing-pdf` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-payroll-billing-pdf/spec.md`

## Summary

Implementar el sistema completo de facturación y generación de documentos de nómina en PDF para VITA. Incluye: motor de cálculo de pagos por turno (ShiftPayment), configuración de fecha de facturación por organización, generación manual y automática de PDFs de nómina, almacenamiento en Supabase Storage, historial accesible por rol (ADMIN_HR, CHIEF_AREA, STAFF), y nueva sección "Pagos/Nómina" en el dashboard. La automatización se logra con Supabase Edge Functions + pg_cron.

## Technical Context

**Language/Version**: TypeScript strict, Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, @react-pdf/renderer ^4.3, Prisma, Zod, next-intl, date-fns/date-fns-tz
**Storage**: PostgreSQL (Supabase) + Supabase Storage (nuevo bucket `payroll-documents`)
**Testing**: `npm run build` + `npm run lint` + manual testing via UI
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application (FSD monolith)
**Performance Goals**: Generación de nómina para 50 personas en < 2 minutos
**Constraints**: Edge Function max 5 min execution, @react-pdf/renderer memory limits para batch > 50
**Scale/Scope**: Organizaciones de 5-100 staff, 12 períodos/año, retención 24 meses

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | Nuevos archivos en capas correctas: `shared/lib/payment`, `entities/payroll`, `features/admin-hr`, `features/payroll`. Sin imports cruzados entre features. |
| II. Mandatory i18n | PASS | Todos los textos de UI y PDF usan `useTranslations`/`getTranslations`. Claves en ES/EN. Formatos de moneda por país. |
| III. Multi-Tenant Isolation | PASS | PayrollPeriod y PayrollDocument incluyen `organizationId`. Todas las actions usan guards de auth. Storage organizado por org. |
| IV. Testing Standards | PASS | Build + lint obligatorios. Testing manual documentado en quickstart.md. Edge cases en spec. |
| V. UX & Accessibility | PASS | Usa Shadcn UI components. Nueva nav item con icon de lucide-react. AlertDialog para operaciones destructivas (eliminar PDF). |
| VI. Technology Stack | PASS con nota | Nueva dependencia `@react-pdf/renderer` — justificada: no existe alternativa en el stack actual para generar PDFs. API Route para cron (excepción justificada a "no API Routes" — es webhook de pg_cron). |

**Post-Phase 1 re-check**: Modelo de datos respeta multi-tenant (organizationId en todas las entidades). API contracts usan `ActionResult<T>` y guards existentes. FSD layers correctos. No se detectan violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/006-payroll-billing-pdf/
├── spec.md                    # Feature specification
├── plan.md                    # This file
├── research.md                # Phase 0: technology decisions
├── data-model.md              # Phase 1: entity definitions
├── quickstart.md              # Phase 1: development guide
├── contracts/
│   ├── server-actions.md      # Phase 1: Server Action API contracts
│   └── edge-function.md       # Phase 1: Edge Function contract
├── checklists/
│   └── requirements.md        # Spec quality checklist
└── tasks.md                   # Phase 2: task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── lib/
│   │   ├── payment/                        # NEW: Payment calculation engine
│   │   │   ├── calculate-shift-payment.ts  # Per-shift calculation
│   │   │   ├── calculate-payroll.ts        # Monthly aggregation + proration
│   │   │   ├── component-evaluator.ts      # Component condition matching
│   │   │   └── types.ts                    # Calculation types
│   │   └── storage/
│   │       └── supabase-storage.ts         # EXTEND: payroll bucket functions
│   └── ui/
│       └── pdf/                            # NEW: PDF layout primitives
│           ├── pdf-header.tsx              # Org header for documents
│           ├── pdf-table.tsx               # Table component for PDF
│           └── pdf-styles.ts              # Shared PDF styles
│
├── entities/
│   └── payroll/                            # NEW: Payroll domain entity
│       ├── lib/
│       │   ├── payroll-repository.ts       # CRUD for PayrollPeriod/Document
│       │   └── types.ts                    # PayrollPeriod, PayrollDocument types
│       └── index.ts
│
├── features/
│   ├── admin-hr/
│   │   ├── api/
│   │   │   └── payroll-actions.ts          # NEW: billing config + generation actions
│   │   └── ui/
│   │       ├── billing-day-config.tsx      # NEW: billing day selector
│   │       └── payroll-generation.tsx      # NEW: manual generation UI
│   │
│   ├── payroll/                            # NEW: Payroll history feature
│   │   ├── api/
│   │   │   └── payroll-history-actions.ts  # History, download, role-filtered
│   │   └── ui/
│   │       ├── payroll-page.tsx            # Main page component (role-aware)
│   │       ├── payroll-periods-list.tsx    # Period cards/table
│   │       ├── payroll-documents-table.tsx # Documents table with actions
│   │       └── payroll-document-pdf.tsx    # @react-pdf/renderer template
│   │
│   └── shifts/
│       └── api/
│           └── shift-payment-actions.ts    # NEW: calculateShiftPaymentAction + shift completion hook
│
├── widgets/
│   └── dashboard-sidebar/
│       └── constants.ts                    # MODIFY: add payroll nav item
│
app/
├── [locale]/dashboard/
│   └── payroll/
│       └── page.tsx                        # NEW: Payroll dashboard page
└── api/
    └── cron/
        └── generate-payroll/
            └── route.ts                    # NEW: Auto-generation API Route (pg_cron target)

prisma/
└── schema.prisma                           # MODIFY: add PayrollPeriod, PayrollDocument, billingDay
```

**Structure Decision**: Follows existing FSD architecture. Payment calculation in `shared/lib` because it's used by multiple features (shifts, admin-hr, payroll) and the Edge Function. Payroll history is a separate feature from admin-hr because it's accessed by all roles.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New dependency `@react-pdf/renderer` | No existing stack capability for PDF generation. Core requirement of the feature. | jsPDF too verbose for complex layouts. Puppeteer too heavy for serverless. |
| API Route for cron + pg_cron | Automated monthly generation is a confirmed requirement. No cron capability in Next.js. API Route (not Edge Function) chosen to reuse 100% of Prisma/shared code without duplication. Exception to "no API Routes" rule — this is a webhook endpoint. | Manual-only generation rejected by user. Edge Function rejected due to Deno runtime requiring code duplication. |
| Payment calc in `shared/lib` (not `features`) | Reused by: shift-actions (on completion), admin-hr (manual generation), payroll feature (history), Edge Function (auto generation). | Placing in a single feature would create cross-feature imports violating FSD. |
