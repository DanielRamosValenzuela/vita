# Implementation Plan: QA Happy Path E2E — Clinica Simulada

**Branch**: `010-qa-happy-path-e2e` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-qa-happy-path-e2e/spec.md`

## Summary

Ejecutar una prueba end-to-end del flujo feliz completo de VITA simulando la **Clinica Ejemplo Santiago**: 2 sectores, 6 areas, 112 usuarios (1 SUPER_ADMIN + 1 ADMIN_HR + 8 CHIEFs + 102 STAFF). Se usa Browser MCP para automatizacion de UI y Supabase MCP para operaciones masivas y verificaciones. En paralelo, se realiza evaluacion UX documentando hallazgos en `test-reports/ux-findings.md`.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 16, React 19
**Primary Dependencies**: Shadcn UI, next-intl, Prisma, NextAuth v4, Zod, date-fns
**Storage**: PostgreSQL (Supabase) — proyecto `tkfsyqywlojjztkewonv`
**Testing**: Manual E2E via Browser MCP + verificacion SQL via Supabase MCP
**Target Platform**: Web (localhost:3000, locale `es`)
**Project Type**: Web application (FSD architecture)
**Performance Goals**: Cada operacion UI < 30s, scripts masivos < 5 min
**Constraints**: Datos de prueba prefijo `vita.qa.*`, no interferir con datos existentes
**Scale/Scope**: 112 usuarios, 6 areas, ~10 shift types, 13 tarifas, ~7 rotativas, ~2000-4000 turnos

### Key Technical Findings

- **Roles disponibles**: SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, CHIEF_SECTOR, STAFF (nota: existe CHIEF_SECTOR separado de CHIEF_AREA)
- **ShiftType classification**: DAY, NIGHT, MIXED (no MORNING/AFTERNOON como se asumio en spec)
- **Shift Swap UI**: EXISTE en `/dashboard/requests` con componentes completos (swap-request-form, open-swap-form, swap-chief-review)
- **RateComponent types**: 18 tipos incluyendo BASE_SALARY, PER_MINUTE, NIGHT_SHIFT_BONUS, WEEKEND_BONUS, CUSTOM y mas
- **RateComponent conditions**: ALWAYS, WEEKDAY_ONLY, WEEKEND_ONLY, HOLIDAY_ONLY, OVERTIME_ONLY, EXTRA_SHIFT_ONLY, SPECIFIC_AREA, SPECIFIC_SHIFT_TYPE, CUSTOM_RULE
- **PayrollPeriod**: Agrega documentos por mes/year con status GENERATING/COMPLETED/FAILED
- **Rotation**: Modelo completo con Steps, Groups, Members, ShiftConfigs
- **OrganizationInvitation**: Tabla dedicada con status PENDING/ACCEPTED/REJECTED/EXPIRED
- **Auth**: NextAuth v4 con Credentials provider (bcryptjs) + Google OAuth, JWT strategy 30 dias

### Available Routes (41 pages)

**Public**: `/`, `/login`, `/register`, `/about`, `/contact`, `/features`, `/pricing`, `/privacy`, `/terms`, `/support`

**Dashboard**: `/dashboard`, `/dashboard/calendar`, `/dashboard/shifts`, `/dashboard/rotations`, `/dashboard/rotations/[id]`, `/dashboard/requests`, `/dashboard/inbox`, `/dashboard/areas`, `/dashboard/areas/new`, `/dashboard/areas/[id]/edit`, `/dashboard/sectors`, `/dashboard/sectors/new`, `/dashboard/sectors/[id]/edit`, `/dashboard/sectors/[id]/staff`, `/dashboard/shift-types`, `/dashboard/rates`, `/dashboard/rates/guide`, `/dashboard/payments`, `/dashboard/payroll`, `/dashboard/staff`, `/dashboard/admin-hr`, `/dashboard/admin-hr/organization`, `/dashboard/admin-hr-users/[id]/edit`, `/dashboard/organizations`, `/dashboard/organizations/new`, `/dashboard/organizations/[id]`, `/dashboard/organizations/[id]/edit`, `/dashboard/analytics`, `/dashboard/settings`, `/dashboard/profile`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | QA no crea codigo nuevo. Si se aplican fixes UX (<15min), se respeta FSD. |
| II. i18n | PASS | QA verifica que no hay literales. Fixes UX incluiran keys i18n. |
| III. Multi-Tenant Isolation | PASS | QA verifica aislamiento. Scripts SQL incluyen organizationId. |
| IV. Testing Standards | PASS | Este ES el testing. Documentamos flows en test-reports. |
| V. UX & Accessibility | PASS | QA incluye evaluacion UX explicita (US11). |
| VI. Tech Stack Governance | PASS | No se agregan dependencias. |

## Project Structure

### Documentation (this feature)

```text
specs/010-qa-happy-path-e2e/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical research findings
├── data-model.md        # Test data model and relationships
├── quickstart.md        # How to execute the QA
├── contracts/           # SQL scripts and verification queries
│   ├── create-100-staff.sql
│   ├── assign-staff-areas.sql
│   ├── verification-queries.sql
│   └── rut-generator.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Test Reports (generated during execution)

```text
test-reports/
├── phase-00-accounts.md
├── phase-01-organization.md
├── phase-02-chiefs.md
├── phase-03-staff.md
├── phase-04-sectors-areas.md
├── phase-05-shift-types.md
├── phase-06-rates-contracts.md
├── phase-07-chief-assignments.md
├── phase-08-staff-areas.md
├── phase-09-rotations.md
├── phase-10-staff-view-payroll.md
├── phase-11-shift-swap.md
├── phase-12-validations.md
├── ux-findings.md
└── summary.md
```

### Scripts (reusable for future QA runs)

```text
scripts/
├── create-qa-accounts.sql
├── assign-staff-to-areas.sql
└── cleanup-qa-data.sql
```

**Structure Decision**: No se modifica la estructura FSD del proyecto. Solo se agregan archivos de test reports y scripts SQL.

## Execution Phases

### Phase 0 — Preparacion de cuentas (11 manuales)

**Tool**: Browser MCP
**Route**: `/es/register`
**Duration estimada**: 15-20 min

| Step | Action | Verification |
|------|--------|-------------|
| 0.1 | Verificar que no existan cuentas vita.qa.* en Supabase | SQL: `SELECT count(*) FROM "User" WHERE email LIKE 'vita.qa.%'` |
| 0.2 | Registrar 11 cuentas via `/register` con RUTs validos | Screenshot de cada registro exitoso |
| 0.3 | Verificar 11 cuentas en Supabase | SQL: `SELECT id, email, name, role FROM "User" WHERE email LIKE 'vita.qa.%'` |

**Accounts**:

| # | Email | Name | Target Role | RUT |
|---|-------|------|-------------|-----|
| 1 | vita.qa.adminhr1@gmail.com | Valentina Rojas Perez | ADMIN_HR | 12.587.698-8 |
| 2 | vita.qa.chief.uci1@gmail.com | Rodrigo Sepulveda Diaz | CHIEF_SECTOR (UCI) | 15.234.567-K |
| 3 | vita.qa.chief.urg1@gmail.com | Camila Fernandez Lagos | CHIEF_SECTOR (Urg) | 18.765.432-1 |
| 4 | vita.qa.chief.enf1@gmail.com | Andres Morales Pinto | CHIEF_AREA (Enf UCI) | 16.543.210-5 |
| 5 | vita.qa.chief.med1@gmail.com | Francisca Araya Contreras | CHIEF_AREA (Med UCI) | 17.890.123-4 |
| 6 | vita.qa.chief.nut1@gmail.com | Diego Herrera Soto | CHIEF_AREA (Nutr) | 14.321.654-7 |
| 7 | vita.qa.chief.enf2@gmail.com | Javiera Tapia Munoz | CHIEF_AREA (Enf Urg) | 19.876.543-2 |
| 8 | vita.qa.chief.med2@gmail.com | Tomas Bravo Castillo | CHIEF_AREA (Med Urg) | 13.456.789-0 |
| 9 | vita.qa.chief.nut2@gmail.com | Isidora Reyes Fuentes | CHIEF_AREA (Nutr 2) | 20.123.456-3 |
| 10 | vita.qa.staff.manual1@gmail.com | Matias Gonzalez Vera | STAFF | 11.234.567-6 |
| 11 | vita.qa.staff.manual2@gmail.com | Constanza Silva Riquelme | STAFF | 10.987.654-9 |

**UX Evaluation**: Evaluar flujo de registro (campos, validacion inline, feedback, tiempo).

### Phase 1 — Crear organizacion e invitar ADMIN_HR

**Tool**: Browser MCP + Supabase MCP
**Routes**: `/es/login`, `/es/dashboard/organizations`, `/es/dashboard/organizations/new`
**Duration estimada**: 10 min

| Step | Action | Verification |
|------|--------|-------------|
| 1.1 | Login como SUPER_ADMIN (prueba10@gmail.com) | Dashboard SUPER_ADMIN visible |
| 1.2 | Crear org "Clinica Ejemplo Santiago" (CL, CLP, PRO) | Aparece en tabla de orgs |
| 1.3 | Configurar limites: maxAdminHR=5, maxChiefs=10, maxStaff=150 | SQL verify |
| 1.4 | Invitar vita.qa.adminhr1 como ADMIN_HR | Invitation PENDING en tabla |
| 1.5 | Login como vita.qa.adminhr1, aceptar invitacion | Rol cambia a ADMIN_HR, dashboard correcto |

**UX Evaluation**: Evaluar flujo de creacion de org y proceso de invitacion.

### Phase 2 — Invitar 8 CHIEFs

**Tool**: Browser MCP
**Routes**: `/es/dashboard/admin-hr/organization`
**Duration estimada**: 20 min

| Step | Action | Verification |
|------|--------|-------------|
| 2.1 | Login como ADMIN_HR | Dashboard ADMIN_HR |
| 2.2 | Invitar 8 CHIEFs (emails #2-#9) | 8 invitaciones PENDING |
| 2.3 | Login con cada CHIEF y aceptar | Cada uno ve dashboard CHIEF |
| 2.4 | Verify en Supabase | Todos con rol correcto y orgId |

**Nota**: Chiefs #2 y #3 seran CHIEF_SECTOR (jefes de sector). Chiefs #4-#9 seran CHIEF_AREA. El rol se asigna como CHIEF_AREA via invitacion y se puede promover a CHIEF_SECTOR despues si el modelo lo soporta.

**UX Evaluation**: Evaluar eficiencia del flujo de invitacion (campos, busqueda, feedback).

### Phase 3 — Vincular STAFF (2 manual + 100 script)

**Tool**: Browser MCP + Supabase MCP
**Routes**: `/es/dashboard/admin-hr/organization`, `/es/dashboard/staff`
**Duration estimada**: 15 min

| Step | Action | Verification |
|------|--------|-------------|
| 3.1 | Invitar 2 STAFF manuales como ADMIN_HR | Invitaciones PENDING |
| 3.2 | Login con cada STAFF, aceptar | Aparecen en /dashboard/staff |
| 3.3 | Copiar estructura de datos de STAFF manual (hash, campos) | Referencia para script |
| 3.4 | Ejecutar script SQL para 100 STAFF via Supabase MCP | 100 registros creados |
| 3.5 | Verificar count | SQL: COUNT = 102 STAFF |
| 3.6 | Login aleatorio con 2-3 cuentas auto | Dashboard STAFF correcto |

**Script**: `contracts/create-100-staff.sql` (generado en Phase 1 del plan)

### Phase 4 — Sectores y areas

**Tool**: Browser MCP
**Routes**: `/es/dashboard/sectors`, `/es/dashboard/sectors/new`, `/es/dashboard/areas`, `/es/dashboard/areas/new`
**Duration estimada**: 15 min

| Step | Action | Verification |
|------|--------|-------------|
| 4.1 | Crear sector UCI | Aparece en lista |
| 4.2 | Crear sector Urgencias | Aparece en lista |
| 4.3 | Crear 6 areas con config de horarios | Todas en lista |
| 4.4 | Asignar areas a sectores (Nutricionistas en ambos) | UCI: 3, Urg: 4 |

**Areas**:

| Area | Sector(es) | dayStartTime | dayEndTime |
|------|-----------|-------------|-----------|
| Enfermeria UCI | UCI | 08:00 | 20:00 |
| Medicos UCI | UCI | 08:00 | 18:00 |
| Nutricionistas | UCI + Urgencias | 08:00 | 18:00 |
| Enfermeria Urgencias | Urgencias | 08:00 | 20:00 |
| Medicos Urgencias | Urgencias | 08:00 | 18:00 |
| Tecnicos Urgencias | Urgencias | 07:00 | 18:00 |

**UX Evaluation**: Evaluar flujo de creacion de sectores/areas, asignacion many-to-many.

### Phase 5 — Tipos de turno

**Tool**: Browser MCP
**Route**: `/es/dashboard/shift-types`
**Duration estimada**: 15 min

| # | Nombre | Classification | Horario | Duration | isGlobal |
|---|--------|---------------|---------|----------|----------|
| 1 | Turno Diurno Normal | DAY | 08:00-17:00 | 540 min | true |
| 2 | Turno Diurno Largo | DAY | 08:00-20:00 | 720 min | true |
| 3 | Turno Nocturno | NIGHT | 20:00-08:00 | 720 min | true |
| 4 | Tercer Turno | NIGHT | 22:00-06:00 | 480 min | true |
| 5 | Cuarto Turno UCI | MIXED | 08:00-08:00 | 1440 min | false (Enf UCI, Med UCI) |
| 6 | Guardia Urgencias 24h | MIXED | 08:00-08:00 | 1440 min | false (Enf Urg, Med Urg) |
| 7 | Turno Manana Nutricion | DAY | 08:00-14:00 | 360 min | false (Nutricionistas) |
| 8 | Turno Tarde Nutricion | DAY | 14:00-18:00 | 240 min | false (Nutricionistas) |
| 9 | Turno Tecnico Estandar | DAY | 07:00-15:00 | 480 min | false (Tec Urg) |
| 10 | Turno Tecnico Tarde | MIXED | 15:00-23:00 | 480 min | false (Tec Urg) |

**UX Evaluation**: Evaluar formulario de creacion de shift types, vinculacion con areas.

### Phase 6 — Tarifas, contratos y calendario

**Tool**: Browser MCP + Supabase MCP
**Routes**: `/es/dashboard/rates`, `/es/dashboard/staff`
**Duration estimada**: 30 min

Crear 13 RateTemplates con RateComponents variados. Asignar contratos.
Configurar calendario organizacional con feriados y multiplicadores.

**UX Evaluation**: Evaluar complejidad del flujo de tarifas, componentes, asignacion masiva de contratos.

### Phase 7 — Asignar jefes a sectores/areas

**Tool**: Browser MCP
**Routes**: `/es/dashboard/sectors`, `/es/dashboard/staff`
**Duration estimada**: 10 min

Asignar UserSector y UserArea para los 8 CHIEFs. Verificar visibilidad.

**UX Evaluation**: Evaluar flujo de asignacion de jefes.

### Phase 8 — Asignar STAFF a areas

**Tool**: Supabase MCP (preferido) o Browser MCP
**Duration estimada**: 10 min

Distribuir 102 STAFF en 6 areas via script SQL.

| Area | Count |
|------|-------|
| Enfermeria UCI | 25 |
| Medicos UCI | 15 |
| Nutricionistas | 12 |
| Enfermeria Urgencias | 25 |
| Medicos Urgencias | 15 |
| Tecnicos Urgencias | 10 |

### Phase 9 — Rotativas y generacion de turnos

**Tool**: Browser MCP
**Route**: `/es/dashboard/rotations`
**Duration estimada**: 30 min

Crear 7+ rotativas con grupos, activar y generar turnos para 30 dias.

**UX Evaluation**: Evaluar flujo de creacion de rotativas, asignacion de miembros a grupos, preview de generacion. Documentar oportunidades de mejora (ej: drag-and-drop).

### Phase 10 — Vista STAFF y nomina

**Tool**: Browser MCP
**Routes**: `/es/dashboard/calendar`, `/es/dashboard/payroll`
**Duration estimada**: 15 min

Verificar calendario STAFF, notas, iCal. Generar nomina como ADMIN_HR. Verificar visibilidad por rol.

**UX Evaluation**: Evaluar experiencia del calendario, detalle de turno, nomina PDF.

### Phase 11 — Intercambio de turnos

**Tool**: Browser MCP
**Route**: `/es/dashboard/requests`
**Duration estimada**: 15 min

**HALLAZGO**: La UI de Shift Swap SI EXISTE. Probar flujo completo:
1. Swap directo entre 2 STAFF
2. Swap abierto con ofertas
3. Aprobacion por CHIEF

**UX Evaluation**: Evaluar flujo de intercambio, claridad de estados, notificaciones.

### Phase 12 — Validaciones y edge cases

**Tool**: Browser MCP
**Duration estimada**: 15 min

Probar limites de org, documentos duplicados, multi-area, metricas dashboard, responsive.

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Browser MCP timeout en paginas pesadas | Medio | Reintentar, usar Supabase MCP para verificacion |
| Script de 100 STAFF falla por constraint unico | Alto | Verificar schema antes, usar ON CONFLICT |
| Rotativa genera conflictos de turno | Medio | Documentar conflictos, ajustar grupos |
| Nomina no genera PDFs correctamente | Medio | Verificar contratos activos antes de generar |
| Shift Swap UI incompleta o con bugs | Bajo | Documentar estado actual, continuar |

## Complexity Tracking

No hay violaciones de la constitution que justificar. El QA no introduce nuevo codigo de produccion.
