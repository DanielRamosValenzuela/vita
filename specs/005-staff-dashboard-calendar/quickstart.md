# Quickstart: Staff Dashboard Calendar

**Feature**: 005-staff-dashboard-calendar
**Date**: 2026-02-28

## Pre-requisitos

- Node.js, npm, PostgreSQL (Supabase) configurados
- `npm install` completado
- `.env` con variables de Supabase y NextAuth configuradas
- `npx prisma generate` ejecutado

## Orden de implementación recomendado

### Fase 1: Calendario Personal (P1 + P3) — MVP

1. **Schema Prisma**: Agregar modelo `CalendarFeedToken` (necesario para P4 pero conviene crear la migración una sola vez)
2. **Server Actions**: `getMyShiftsAction()` y `getUpcomingShiftsAction()`
3. **UI - StaffDashboardContent**: Orchestrator principal con calendario + upcoming
4. **UI - StaffCalendar**: Wrapper de `ShiftCalendar` para contexto staff (read-only)
5. **UI - UpcomingShifts**: Panel de próximos 7 días
6. **Page**: Modificar `app/[locale]/dashboard/page.tsx` para STAFF/CHIEF
7. **i18n**: Keys en `messages/es.json` y `messages/en.json`
8. **Verificar**: `npm run build && npm run lint`

### Fase 2: Detalle de Turno + Personal del Sector (P2)

1. **Server Action**: `getSectorPersonnelForShiftAction()`
2. **Lib**: `detectRelays()` — función pura de detección de relevos
3. **UI - ShiftDetailPanel**: Modal/sheet con detalle de turno
4. **UI - SectorPersonnelList**: Lista de personal agrupada por área
5. **Integrar**: Click handler en calendario → abrir detalle
6. **Verificar**: `npm run build && npm run lint`

### Fase 3: Exportación iCal (P4)

1. **Lib**: `ical-generator.ts` — generación de contenido .ics
2. **Lib**: `feed-token.ts` — generación/validación de tokens
3. **Entity**: `calendar-feed-repository.ts` — CRUD de tokens
4. **Server Actions**: `generateIcsFileAction()`, `createFeedTokenAction()`, etc.
5. **Route Handler**: `app/api/ical/[token]/route.ts`
6. **UI - CalendarExportMenu**: Botón de exportar + gestión de feeds
7. **Verificar**: `npm run build && npm run lint`

### Fase 4: Google Calendar Import (P5 - Diferible)

1. **Schema Prisma**: Agregar modelo `GoogleCalendarConnection`
2. **Instalar**: `npm install googleapis`
3. **Server Actions**: OAuth flow + eventos import
4. **UI - GoogleCalendarConnect**: Botón conectar/desconectar
5. **Integrar**: Merge eventos Google con turnos en calendario
6. **Verificar**: `npm run build && npm run lint`

## Componentes clave a reutilizar

| Componente | Path | Uso |
|-----------|------|-----|
| `ShiftCalendar` | `src/entities/shift/ui/shift-calendar.tsx` | Calendario mensual (promovido de features/shifts en T001b, pasar como read-only) |
| `groupShiftsForCalendar()` | `src/entities/shift/lib/calendar-grouping.ts` | Agrupar shifts en eventos (promovido de features/shifts en T001b) |
| `ShiftWithRelations` | `src/features/shifts/types/shift-types.ts` | Tipo estándar de turno con relaciones |
| `requireDashboardUser()` | `src/shared/lib/auth/` | Auth guard para STAFF/CHIEF |
| `resolveChiefOrganizationId()` | `src/shared/lib/auth/chief-access.ts` | Resolver orgId para CHIEF |
| `getSectorStaffAction()` | `src/features/sector/api/sector-staff-actions.ts` | Referencia para query de personal activo |

## Comandos de verificación

```bash
# Build completo
npm run build

# Lint
npm run lint

# Generar tipos Prisma (después de cambiar schema)
npx prisma generate

# Push schema a BD (desarrollo)
npx prisma db push

# Dev server
npm run dev
```

## Decisiones de arquitectura

- **No se usa `getShiftsAction()` existente** para staff porque requiere rol ADMIN/CHIEF.
- **Route Handler para iCal feed** es la única excepción al patrón Server Actions (justificada: feeds iCal requieren GET público).
- **Eventos Google NO se persisten** en BD; se fetchean on-demand para evitar sincronización compleja.
- **FSD import rules**: `ShiftCalendar` y `groupShiftsForCalendar()` se promueven a `entities/shift/` (T001b) para que ambas features los importen sin violar FSD. `staff-dashboard` feature NO importa de `shifts` feature directamente.
