# Implementation Plan: QA End-to-End Testing

**Branch**: `007-qa-e2e-testing` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-qa-e2e-testing/spec.md`

## Summary

Ejecutar QA manual automatizado (via Browser MCP + Supabase MCP) cubriendo los 4 roles del sistema (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF), todos los workflows implementados documentados en `docs/vita-workflows.md`, y verificacion de que workflows pendientes no expongan UI rota. El output son reportes accionables en `/test-reports/` con ubicacion exacta del codigo a corregir.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 16 (App Router), React 19
**Primary Dependencies**: Shadcn UI, Prisma, NextAuth v4, Zod, next-intl, date-fns
**Storage**: PostgreSQL (Supabase)
**Testing**: QA manual automatizado via Browser MCP + validacion en BD via Supabase MCP
**Target Platform**: Web (Chrome), responsive desktop + mobile
**Project Type**: Web application (Next.js App Router con FSD)
**Performance Goals**: Feedback UI < 3s, paginas funcionales sin errores 500
**Constraints**: Solo workflows implementados; cuentas protegidas intocables
**Scale/Scope**: 4 roles, ~15 rutas de dashboard, ~60 usuarios de prueba, 1 organizacion activa

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | N/A | QA no modifica codigo fuente; se reportan violaciones encontradas |
| II. Mandatory i18n | VERIFY | Se verificara que no haya literales sin traducir (SC-009) |
| III. Multi-Tenant Isolation | VERIFY | Se verificara aislamiento de datos entre orgs (SC-002, FR-016) |
| IV. Testing Standards | PASS | Este QA ES el testing manual documentado que exige la constitucion |
| V. Consistent UX & Accessibility | VERIFY | Se verificara responsividad, Shadcn UI, keyboard access |
| VI. Technology Stack | N/A | QA no agrega dependencias |

**Gate result**: PASS - No hay violaciones. Los items VERIFY son parte del scope del QA.

## Project Structure

### Documentation (this feature)

```text
specs/007-qa-e2e-testing/
├── plan.md              # Este archivo
├── research.md          # Mapeo de rutas, cuentas y datos de prueba
├── data-model.md        # Estado actual de datos en BD para testing
├── quickstart.md        # Guia rapida para ejecutar el QA
├── contracts/           # Test cases por rol
│   ├── auth-tests.md
│   ├── super-admin-tests.md
│   ├── admin-hr-tests.md
│   ├── chief-area-tests.md
│   ├── staff-tests.md
│   └── ui-ux-tests.md
└── tasks.md             # Orden de ejecucion (Phase 2)
```

### Output Structure (repository root)

```text
test-reports/
├── 00-resumen-ejecutivo.md      # Vista general: total tests, pass/fail, criticos
├── 01-plan-de-testing.md        # Plan completo con casos de prueba
├── 02-bugs.md                   # Bugs funcionales con severidad + ubicacion de codigo
├── 03-workflows-rotos.md        # Workflows que no completan su flujo
├── 04-ui-ux.md                  # Problemas de interfaz y diseno
└── 05-mejoras-sugeridas.md      # Recomendaciones no-bug
```

**Structure Decision**: El QA no modifica `src/`. Los reportes en `test-reports/` incluyen para cada bug la **ubicacion exacta del codigo** (archivo:linea) donde se debe corregir, facilitando el siguiente SPEC de correcciones.

## Test Execution Strategy

### Orden de ejecucion por prioridad

| Fase | User Story | Rol | Cuenta de prueba | Prioridad |
|------|-----------|-----|------------------|-----------|
| 1 | Setup: Promover prueba10@gmail.com a SUPER_ADMIN | - | BD directa | Pre-req |
| 2 | US1: Auth (login/logout/proteccion rutas) | Todos | Todas | P1 |
| 3 | US2: Workflows SUPER_ADMIN | SUPER_ADMIN | prueba10@gmail.com | P1 |
| 4 | US3: Config organizacional ADMIN_HR | ADMIN_HR | emiliano@gmail.com | P1 |
| 5 | US4: Rotativas de turno | ADMIN_HR | emiliano@gmail.com | P2 |
| 6 | US5: Workflows CHIEF_AREA | CHIEF_AREA | javer@hospital.infierno.com | P2 |
| 7 | US6: Dashboard STAFF | STAFF | prueba1@vita.test | P2 |
| 8 | US7: Perfil avanzado | Cualquiera | prueba2@vita.test | P3 |
| 9 | US8: Notificaciones | Varios | Varias | P3 |
| 10 | US9: UI/UX visual | Todos | Varias | P3 |
| 11 | Consolidacion: Generar reportes finales | - | - | Final |

### Formato de reporte de bugs (con ubicacion de codigo)

```markdown
### [SEVERIDAD] Titulo descriptivo
- **Ubicacion UI:** Pagina/componente afectado
- **Ubicacion Codigo:** `src/features/modulo/archivo.tsx:linea` o `src/entities/dominio/actions.ts:linea`
- **Rol:** Rol con el que se reproduce
- **Pasos para reproducir:**
  1. Paso 1
  2. Paso 2
- **Resultado esperado:** ...
- **Resultado obtenido:** ...
- **Evidencia:** Descripcion de lo observado en pantalla o en BD
- **Sugerencia de fix:** Breve descripcion de lo que hay que cambiar
```

## Complexity Tracking

No hay violaciones de la constitucion que justificar. El QA es una actividad de verificacion, no de implementacion.
