# Documentacion VITA

Sistema de Gestion de Turnos Medicos — SaaS B2B Multi-Tenant.

## Documentos Principales

| Documento | Contenido |
|-----------|-----------|
| [vita-overview.md](./vita-overview.md) | Que es VITA, problema, solucion |
| [vita-business-model.md](./vita-business-model.md) | Modelo SaaS B2B, pricing, limites |
| [vita-roles.md](./vita-roles.md) | Roles: SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF |
| [vita-competitive.md](./vita-competitive.md) | Analisis competitivo, propuesta de valor |
| [vita-architecture.md](./vita-architecture.md) | Stack, FSD, estructura de carpetas |
| [vita-shared-fsd.md](./vita-shared-fsd.md) | Referencia FSD: capas, reglas, ejemplos |
| [vita-roadmap.md](./vita-roadmap.md) | Fases, proximos pasos, prioridades |
| [vita-lessons.md](./vita-lessons.md) | Lecciones aprendidas, mejores practicas |

## Workflows y Requerimientos

| Documento | Contenido |
|-----------|-----------|
| [vita-workflows.md](./vita-workflows.md) | Flujos por rol con checkboxes [x]/[ ] implementado/pendiente |
| [REQUERIMIENTOS-DEL-PROYECTO.md](./REQUERIMIENTOS-DEL-PROYECTO.md) | Requerimientos cumplidos y pendientes |

## Sistemas Tecnicos

| Documento | Contenido |
|-----------|-----------|
| [DICCIONARIO-BASE-DE-DATOS.md](./DICCIONARIO-BASE-DE-DATOS.md) | Todas las tablas y campos del schema Prisma |
| [SISTEMA-PAGOS-Y-TARIFAS.md](./SISTEMA-PAGOS-Y-TARIFAS.md) | Tarifas flexibles, componentes, calculo de pagos, calendario org |
| [SISTEMA-VALIDACION-DOCUMENTOS-EMAILS.md](./SISTEMA-VALIDACION-DOCUMENTOS-EMAILS.md) | Documentos unicos, multiples emails, avatares, Supabase Storage |
| [SISTEMA-I18N.md](./SISTEMA-I18N.md) | Internacionalizacion: formatos, traducciones, validacion, mascaras |

## Features Pendientes

| Documento | Feature |
|-----------|---------|
| [PLAN-SHIFT-SWAP-AND-EXTRA.md](./PLAN-SHIFT-SWAP-AND-EXTRA.md) | Intercambio de turnos y turnos extra |
| [TASKS-SHIFT-SWAP-AND-EXTRA.md](./TASKS-SHIFT-SWAP-AND-EXTRA.md) | Tareas para shift swap |

## Specs Implementadas

| Spec | Feature | Estado |
|------|---------|--------|
| [specs/009-ui-ux-redesign/](../specs/009-ui-ux-redesign/) | Rediseno UI/UX con Framer Motion | Completado |
| [specs/008-fix-qa-bugs/](../specs/008-fix-qa-bugs/) | Correccion de bugs QA | Completado |
| [specs/007-qa-e2e-testing/](../specs/007-qa-e2e-testing/) | QA E2E Testing (122 test cases) | Completado |
| [specs/006-payroll-billing-pdf/](../specs/006-payroll-billing-pdf/) | Nomina, Pagos y PDF | Completado |
| [specs/005-staff-dashboard-calendar/](../specs/005-staff-dashboard-calendar/) | Staff Dashboard Calendar | Completado (US5 Google Cal pendiente) |
| [specs/004-shift-rotations/](../specs/004-shift-rotations/) | Rotativas de Turno | Completado |
| [specs/003-inbox-notifications/](../specs/003-inbox-notifications/) | Bandeja de Notificaciones | Completado |
| [specs/002-shifts-system-fix/](../specs/002-shifts-system-fix/) | Fix Sistema de Turnos | Completado (US4 Edit/Delete pendiente) |
| [specs/001-org-calendar-ui/](../specs/001-org-calendar-ui/) | Calendario Organizacional UI | Completado |
| [specs/001-area-sectors/](../specs/001-area-sectors/) | Sectores (Agrupacion de Areas) | Completado (US4 conteo real-time pendiente) |

## Para Agente IA

- Contexto principal: `CLAUDE.md` (raiz del repo)
- Usar busqueda semantica en estos archivos
- Cada documento tiene menos de 700 lineas para contexto eficiente
