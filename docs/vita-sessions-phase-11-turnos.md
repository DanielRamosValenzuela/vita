# Historial de Sesiones - FASE 11: Sistema de Turnos

Sesiones relacionadas con el sistema de gestión de turnos, tipos de turno, áreas, tarifas y contratos.

---

## Sesión 23 Enero 2026 - Sistema de Gestión de Turnos Médicos

- Schema Prisma: ShiftType, Shift, ShiftStatus
- Repository: getShifts, createShift, updateShift, getShiftsForCalendar, etc.
- Validación: checkShiftConflicts, duración 30min-12h
- UI: ShiftCalendar, ShiftForm, ShiftFilters
- Entity shift/ y feature shifts/ (FSD)
- Shadcn: Calendar, Checkbox, Popover

## Sesión 23 Enero 2026 (Tarde) - Lint i18n, DRY

- ESLint react/jsx-no-literals: build falla si texto en duro
- OrganizationLimitsCard reutilizable
- getRoleDisplayMeta, getUsageBadgeVariant en shared
- countUsersByRole, badge variants, formatDate
- Colores semánticos (text-muted-foreground, text-destructive)

## Sesión 23 Enero 2026 - CRUD Tarifas (Rates)

- Server Actions: getRatesAction, createRateAction, updateRateAction, deleteRateAction
- UI RatesPage con tabla y modales
- Rutas /dashboard/rates

## Sesión 23 Enero 2026 - Fixes Prisma, Auth, Login

- Prisma: compilerBuild="small", @prisma/client 7.3.0
- Auth: try-catch en authorize y jwt
- router.refresh() en lugar de window.location.reload()

## Sesión 23 Enero 2026 - DRY InvitationsTable + i18n shift-form

- InvitationsTableWithCancel en shared/ui/molecules
- i18n en shift-form (conflicts.error)

## Sesión 23 Enero 2026 - Limpieza código muerto

- Eliminados: toast-messages, formatRUT, formatNumber, validateRUT, shift-repository sin refs, stubs shift-type-actions

## Sesión 23 Enero 2026 - Refactor Tarifas → Contratos

- Schema: RateTemplate, Contract (por persona), BaseSalaryUnit
- Eliminados Rate, ShiftRate
- API: rate-template-actions, contract-actions
- UI ContractsPage con tipos y tabla staff

## Sesión 23 Enero 2026 - ShiftType duración + Area ↔ ShiftType

- ShiftType: durationMinutes, classification, minStaffRequired, idealStaffCount, maxStaffAllowed, isGlobal
- AreaShiftType many-to-many
- Area: isActive false por defecto, maxConsecutiveHours, minRestHours
- Página editar área con asignación de tipos y switch activar

## Sesión 23 Enero 2026 (Tarde) - UI/UX, Iconos, Áreas

- IconPicker con ~66 iconos, buscador ES/EN
- SearchableAddableList para tipos de turno en áreas
- Dialogs más anchos, ring-inset en inputs
- Tooltips en minStaffRequired, idealStaffCount, maxStaffAllowed, isGlobal
- Botón eliminar área funcional, colores en iconos Ver/Eliminar
- Definido: Gestión de Personal (/dashboard/staff), UserArea en schema

## Sesión Feb 2026 - Tipos de turno por área, config env, UX formularios

- **Tipos de turno ↔ áreas:** Al crear/editar tipo de turno, la relación AreaShiftType se crea con `isActive: false`; se activa desde la edición del área. Formulario de turnos filtra tipos por área: solo globales o con relación activa. Tabla tipos: columna "Global" (Sí/No), "Áreas" (cantidad o "-"), "Asignado" (antes "Turnos"). `assignShiftTypesToAreaAction` usa upsert (isActive true/false), no borra relaciones.
- **Config centralizada:** `src/shared/config/env.server.ts` lee y valida `process.env` una vez; auth/config y proxy consumen ese objeto.
- **UX formularios modales:** Tipos de turno, edición de área, tarifas y contratos: estado `hasChanges`, botón Guardar deshabilitado si no hay cambios o está en curso, AlertDialog "¿Guardar cambios?" al guardar, redirección al listado tras éxito.
- **i18n y accesibilidad:** Claves faltantes añadidas en messages (es/en). Descripciones para DialogContent (Description/aria-describedby) para eliminar warnings de Radix.

## Sesión Feb 2026 - UserArea y Gestión de Personal

- **UserArea en schema:** Modelo `UserArea` (userId, areaId) para vincular jefes a áreas. Migración `20260202120000_add_user_area`. Relaciones en User y Area.
- **Staff page para ADMIN_HR y CHIEF:** Sidebar muestra "Personal" a ambos roles. `requireAdminHROrChiefArea` en auth/session. ADMIN_HR ve todo el personal (misma data que Tarifas); CHIEF ve solo personal con contrato en sus áreas (UserArea). Si CHIEF sin áreas: mensaje "No tienes áreas asignadas. Contacta a RRHH." (`staffNoAreasAssigned` i18n).
- **getStaffPageDataAction:** En contract-actions; usa requireAdminHROrChiefArea; para ADMIN_HR delega en getContractsPageDataAction; para CHIEF filtra por UserArea del usuario y contratos en esas áreas. Página staff usa ContractsPage con esa data.
