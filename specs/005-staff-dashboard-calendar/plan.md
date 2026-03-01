# Implementation Plan: Staff Dashboard Calendar

**Branch**: `005-staff-dashboard-calendar` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-staff-dashboard-calendar/spec.md`

## Summary

Dashboard personal para STAFF_HEALTH y CHIEF_AREA en `/dashboard` con calendario mensual interactivo de turnos asignados, panel de detalle con personal activo por sector (incluyendo relevos), lista de próximos turnos, exportación .ics/feed iCal (dual: per-org + unificado), e importación desde Google Calendar con detección de conflictos.

**Enfoque técnico**: Reutilizar el componente `ShiftCalendar` existente y la función `groupShiftsForCalendar()` como base. Crear server actions nuevos para consulta de turnos personales y personal activo por sector. Nuevos modelos Prisma para tokens de feed iCal y conexiones Google Calendar. Route Handler (GET) para endpoint del feed iCal.

## Technical Context

**Language/Version**: TypeScript strict, Node.js (Next.js 16, React 19)
**Primary Dependencies**: next-intl, Prisma, Zod, Shadcn UI, Tailwind v4, lucide-react, date-fns/date-fns-tz, `ical-generator` (nuevo para .ics), `googleapis` (nuevo para Google Calendar API)
**Storage**: PostgreSQL (Supabase) via Prisma ORM
**Testing**: `npm run build` + `npm run lint` + manual UI testing
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application (Next.js App Router, FSD architecture)
**Performance Goals**: Carga calendario <5s (SC-001), detalle sector <3s (SC-003)
**Constraints**: Multi-tenant isolation obligatorio, i18n obligatorio, FSD layer rules, Server Actions como backend (excepto feed iCal que requiere Route Handler GET)
**Scale/Scope**: ~15-25 turnos/mes por usuario, sectores con 3-10 áreas, feed iCal con ~400 eventos max por usuario

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | Nuevos archivos en capas correctas: `features/staff-dashboard/` para actions+UI, `entities/` para repositorios de feed token |
| II. Mandatory i18n | PASS | Todos los textos visibles usarán `useTranslations`/`getTranslations`. Keys en es.json + en.json |
| III. Multi-Tenant Isolation | PASS | Todas las queries filtran por organizationId. Feed per-org aislado. Feed unificado solo accesible por el usuario |
| IV. Testing Standards | PASS | Build + lint antes de merge. Flujos documentados en spec con Given/When/Then |
| V. Consistent UX & Accessibility | PASS | Reutiliza ShiftCalendar (Shadcn UI). Keyboard-accessible. Responsive |
| VI. Technology Stack Governance | JUSTIFIED | Dos dependencias nuevas: `ical-generator` (necesario para RFC 5545) y `googleapis` (necesario para OAuth Google). Ver Complexity Tracking |

## Project Structure

### Documentation (this feature)

```text
specs/005-staff-dashboard-calendar/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technical research
├── data-model.md        # Phase 1: New models and queries
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: Server action contracts
│   ├── staff-shifts.md
│   ├── sector-personnel.md
│   ├── ical-feed.md
│   └── google-calendar.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
# FSD Architecture - Files to create/modify

app/[locale]/dashboard/
├── page.tsx                          # MODIFY: Replace placeholder with staff calendar
└── api/
    └── ical/
        └── [token]/
            └── route.ts              # NEW: Route Handler for iCal feed (GET)

src/features/staff-dashboard/
├── api/
│   ├── staff-shifts-actions.ts       # NEW: Get personal shifts for calendar
│   ├── sector-personnel-actions.ts   # NEW: Get active personnel by sector
│   ├── ical-actions.ts               # NEW: Generate .ics, manage feed tokens
│   └── google-calendar-actions.ts    # NEW: Google OAuth connect/disconnect/import
├── ui/
│   ├── staff-dashboard-content.tsx   # NEW: Main orchestrator (calendar + upcoming + detail)
│   ├── staff-calendar.tsx            # NEW: Wrapper around ShiftCalendar for staff context
│   ├── upcoming-shifts.tsx           # NEW: Next 7 days panel
│   ├── shift-detail-panel.tsx        # NEW: Shift detail + sector personnel modal
│   ├── sector-personnel-list.tsx     # NEW: Personnel grouped by area with relays
│   ├── calendar-export-menu.tsx      # NEW: Export .ics / copy feed URL
│   └── google-calendar-connect.tsx   # NEW: Google Calendar connection UI
├── lib/
│   ├── ical-generator.ts             # NEW: .ics file generation logic
│   ├── relay-detection.ts            # NEW: Detect shift relays (gap <30min)
│   └── feed-token.ts                 # NEW: Token generation/validation utilities
└── types/
    └── staff-dashboard-types.ts      # NEW: Types for staff dashboard

src/entities/calendar-feed/
├── lib/
│   └── calendar-feed-repository.ts   # NEW: CRUD for CalendarFeedToken
└── index.ts

src/entities/google-connection/
├── lib/
│   └── google-connection-repository.ts # NEW: CRUD for GoogleCalendarConnection
└── index.ts

prisma/
└── schema.prisma                     # MODIFY: Add CalendarFeedToken, GoogleCalendarConnection

messages/
├── es.json                           # MODIFY: Add staffDashboard namespace
└── en.json                           # MODIFY: Add staffDashboard namespace
```

**Structure Decision**: FSD architecture existente del proyecto. Nuevo feature slice `staff-dashboard` en `src/features/`. Nuevas entities `calendar-feed` y `google-connection` en `src/entities/`. Route Handler para el feed iCal en `app/` (exceción justificada al patrón Server Actions: feed necesita ser endpoint GET consumible sin autenticación interactiva).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Route Handler para iCal feed | Los feeds iCal requieren un endpoint HTTP GET público con Content-Type `text/calendar`. Server Actions solo soportan POST. | No hay alternativa viable: Google Calendar y otros clientes requieren GET sobre una URL. |
| Dependencia `ical-generator` | Generar iCalendar válido (RFC 5545) con VTIMEZONE, VEVENT, UID, etc. es complejo y propenso a errores. | Generar .ics manualmente es frágil y difícil de mantener. La librería es liviana (~30KB). |
| Dependencia `googleapis` | OAuth 2.0 con Google Calendar API v3 requiere manejo de tokens, refresh, scopes. | Implementar OAuth manualmente es inseguro y propenso a errores. Solo se usa para P5 (importación). |
