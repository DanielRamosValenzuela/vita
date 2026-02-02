# 🏥 VITA - Plan Maestro de Desarrollo

**Sistema de Gestión de Turnos Médicos Multi-Tenant SaaS B2B**

**Última actualización:** 23 de enero de 2026

**Versión:** 3.18.0

**Estado:** FASE 3 iniciada - Sistema de Gestión de Turnos Médicos - Schema Prisma + Repository + Validaciones + UI Components (Calendario, Formularios, Filtros) + Sistema de Validación de Conflictos de Horario + Implementación de Entities Shift según FSD

**📊 Progreso General:** 131 tareas completadas de 896 totales (14.6% completado)

**Competidor Principal:** Rflex (análisis competitivo en sección de Negocio)

---

## 🎉 PROGRESO RECIENTE (Enero 2026)

### ✅ Sesión del 23 de Enero 2026 - FASE 3: Sistema de Gestión de Turnos Médicos

**Completado:**

- ✅ **Schema Prisma para Sistema de Turnos:**
  - Nueva entidad `ShiftType` para tipos de turnos configurables por organización
  - Nueva entidad `Shift` con campos completos (título, fechas, estado, notas)
  - Relaciones con User, Area, ShiftType, y Organization
  - Enum `ShiftStatus` (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
  - Actualización de entities existentes (User, Area) con relaciones a Shift
  - Indices optimizados para consultas de calendario y filtros

- ✅ **Repository Completo de Turnos:**
  - `getShifts()` - Listado paginado con filtros avanzados (usuario, área, tipo, estado, fechas)
  - `getShiftById()` - Obtener turno específico con relaciones completas
  - `createShift()` - Crear nuevo turno con validación automática de estado
  - `updateShift()` - Actualizar turno existente
  - `deleteShift()` - Eliminar turno (soft delete a futuro)
  - `getShiftsForCalendar()` - Obtener turnos para vista de calendario (optimizado)
  - `getUserShiftsForDate()` - Obtener turnos de un usuario para fecha específica
  - Includes completos con User, Area, y ShiftType

- ✅ **Sistema de Validación de Turnos:**
  - `checkShiftConflicts()` - Detección de conflictos de horario:
    - Superposición de turnos para mismo usuario
    - Turnos en el pasado (validación temporal)
    - Duración máxima/mínima de turnos (30min - 12 horas)
    - Validación de horarios lógicos
  - `checkMultipleUserShiftsConflicts()` - Validación masiva para múltiples usuarios
  - Mensajes de error específicos y claros
  - Prevención de dobles asignaciones

- ✅ **UI Components:**
  - **`ShiftCalendar`:** Vista de calendario mensual con:
    - Navegación por mes con botones anterior/siguiente
    - Visualización de turnos por día con colores según tipo
    - Máximo 3 turnos visibles por día + indicador "X más"
    - Hover tooltips con información completa del turno
    - Selección de fechas con feedback visual
    - Leyenda de estados (Programado, En progreso, Completado, Cancelado)
  - **`ShiftForm`:** Formulario completo para crear/editar turnos:
    - Información básica (título, notas)
    - Selección de usuario con rol desplegado
    - Selección de área con descripción
    - Selección de tipo de turno con color visual
    - Fecha de inicio con calendario popup
    - Horas de inicio/fin con validación
    - Checkbox para habilitar fecha de fin diferente
    - Validación en tiempo real de conflictos
    - Loading states y errores específicos

  - **`ShiftFilters`:** Sistema de filtros avanzados:
    - Búsqueda por texto (título, notas, usuario)
    - Filtro por estado con badges coloreados
    - Filtro por usuario con avatares
    - Filtro por área y tipo de turno
    - Filtros por rango de fechas (calendarios popup)
    - Filtros rápidos (Hoy, Esta semana, Este mes)
    - Resumen visual de filtros activos con badges
    - Botón para limpiar todos los filtros

- ✅ **Arquitectura FSD para Shifts:**
  - Entity `shift/` en `src/entities/shift/lib/`:
    - `shift-repository.ts` - Lógica de datos compartida
    - `shift-validation.ts` - Validaciones de negocio
    - `index.ts` - Barrel exports
  - Feature `shifts/` en `src/features/shifts/ui/`:
    - `shift-calendar.tsx` - Componente de calendario
    - `shift-form.tsx` - Formulario de creación/edición
    - `shift-filters.tsx` - Sistema de filtros
  - Separación clara entre lógica de negocio y UI
  - Componentes reutilizables con TypeScript estricto

- ✅ **Integración con Shadcn UI:**
  - Componente `Calendar` agregado al sistema de UI
  - Componentes `Checkbox` y `Popover` para formularios
  - Estilo consistente con diseño existente
  - Soporte completo para temas (dark/light)
  - Componentes responsive para todos los dispositivos

- ✅ **Calidad de Código:**
  - `npm run build` ✅ Build exitoso sin errores
  - TypeScript strict con tipado completo
  - Componentes con validaciones de accesibilidad
  - Manejo de errores con mensajes claros
  - Loading states en todas las operaciones asíncronas

### ✅ Sesión del 23 de Enero 2026 (Tarde) - Lint i18n, DRY y análisis de cambios

**Contexto:** Revisión de cambios (feature Shifts + i18n + límites) vs plan, FSD y buenas prácticas. Correcciones aplicadas.

**Completado:**

- ✅ **Lint i18n y build:**
  - ESLint con `react/jsx-no-literals` y `@sanity/i18n` (atributos); build falla si hay texto en duro en UI.
  - Páginas "en construcción" (contact, support, analytics, payments, settings, staff, calendar-view) con `eslint-disable react/jsx-no-literals` documentado; lugar para i18n al implementar.

- ✅ **Widget reutilizable `OrganizationLimitsCard`:**
  - Eliminada duplicación: un solo componente en `src/widgets/organization-limits-card/`, usado por admin-hr (Mi Organización) y super-admin (detalle de organización).
  - Páginas actualizadas para importar desde `@/src/widgets/organization-limits-card`.

- ✅ **DRY – shared utils:**
  - `getRoleInfo` / `getUsageVariant` duplicados en los limits cards → extraídos a `src/shared/lib/utils/role-display.ts`:
    - `getRoleDisplayMeta(role)` → `{ icon, color, translationKey }`
    - `getUsageBadgeVariant(usage)` → variant para Badge
  - Ambos limits cards refactorizados para usar estos utils.
  - `shift-form-dialog`: SVG local `CalendarDays` sustituido por `lucide-react`.

- ✅ **Colores semánticos (plan):**
  - Eliminados `text-orange-*`, `text-green-*`, `text-red-*`, `bg-orange-*` en limits y alerts.
  - Uso de `text-muted-foreground`, `text-primary`, `text-destructive`, `bg-muted/50`, `border-muted`.

- ✅ **Mensajes en entities:**
  - Errores en español en `organization-usage` y `organization-limits` pasados a inglés (sin hardcodear español en código). Pendiente mapear códigos a i18n en UI.

- ✅ **Resumen de cambios (git):**
  - ~48 archivos modificados (app, config, messages, entities, features, shared, widgets) y varios nuevos (shifts api, types, `shift-form-dialog`, `shift-types-page`, constantes).

**Adecuación al plan:**
  - FSD respetado en shifts y organización. Constantes en `shared`, TypeScript strict, estructura `lib/` por dominio y server/client.

**DRY – reutilización adicional aplicada:**
  - **`countUsersByRole`** en `shared/lib/utils/count-users-by-role.ts`: cuenta usuarios por rol (ADMIN_HR, CHIEF_AREA, STAFF_HEALTH). Usado en `organizations-table-client`; sustituye `getUserCounts` local.
  - **Constantes de variantes para badges** en `shared/lib/constants/badge-variants.ts`: `ORGANIZATION_STATUS_BADGE_VARIANTS`, `ORGANIZATION_PLAN_BADGE_VARIANTS`, `INVITATION_STATUS_BADGE_VARIANTS`. Usadas en `organizations-table-client`, `organization-view`, `profile` `organizations-section`, `invitations-table-base` (sustituyen maps locales).
  - **`formatDate`** en `shared/lib/utils/format.ts`: formatea fechas con locale (`es`/`en`) vía date-fns. Sustituye `toLocaleDateString` y `format(..., { locale })` en `organizations-table-client`, `admin-hr-users-table-client`, `invitations-table-base`, `invitations-section`.

**DRY – pendiente / sugerido:**
  - Mensajes de `organization-alerts`: hoy se construyen en español en la entity; ideal que la UI monte el mensaje vía i18n (refactor mayor).

**i18n – pendiente:**
  - Mensajes de alerts generados en entity en español; unificar con i18n en UI cuando se use en inglés.

**Próximos pasos:**
  1. Unificar mensajes de alerts (y entities en general) con i18n: entities sin cadenas user-facing; UI con `t()`.
  2. Extraer lógica común de badges y "user counts por rol" a `shared` o `entities` según corresponda.
  3. Depurar front: `npm run dev`, login ADMIN_HR, revisar flujos de shifts, organizaciones y límites.

### ✅ Sesión del 23 de Enero 2026 - CRUD Tarifas (Rates)

**Contexto:** Admin HR gestiona tipos de tarifa (catálogo de precios por minuto/hora). Tarifas por área o persona se implementarán después.

**Completado:**

- ✅ **Server Actions** (`admin-hr/api/rate-actions.ts`):
  - `getRatesAction()` – Lista tarifas de la organización con `_count.shiftRates`
  - `createRateAction()` – Crear tarifa (name, description, type, unit, amount, isActive)
  - `updateRateAction()` – Actualizar tarifa
  - `deleteRateAction()` – Eliminar solo si no hay turnos asociados
  - Validaciones: monto ≥ 0, nombres únicos, organización del usuario

- ✅ **UI RatesPage** (`admin-hr/ui/rates-page.tsx`):
  - Tabla: nombre, tipo (HOURLY/MINUTELY), unidad (MINUTE/HOUR), monto (formatCurrency), descripción, estado, turnos asociados, acciones
  - Modal crear/editar: nombre, tipo, unidad, monto, descripción, activo
  - Modal eliminar con advertencias si hay turnos asociados
  - Estado vacío con CTA
  - Semántica: section, header, listas

- ✅ **i18n** (`adminHR.rates`): Claves ES/EN para título, descripción, tabla, formulario, modales, tipos, unidades, toasts.

- ✅ **Rutas**:
  - `/dashboard/rates` – Página principal (sidebar Admin HR)
  - `/dashboard/admin-hr/rates` – Redirección a `/dashboard/rates`

- ✅ **Reutilización (DRY):** `formatCurrency` de shared, patrón alineado con shift-types (modales, tabla, actions).

- ✅ **Build:** `npm run lint` y `npm run build` pasan correctamente.

### ✅ Sesión del 23 de Enero 2026 - Fixes Prisma, Auth, Login y Revisión DRY

**Contexto:** Errores de login (MODULE_NOT_FOUND), db:generate fallando, migrate dev colgado. Revisión general de código y DRY.

**Completado:**

- ✅ **Prisma – fixes:**
  - `compilerBuild = "small"` en schema: evita `query_compiler_fast_bg` y resuelve MODULE_NOT_FOUND.
  - `@prisma/client` alineado a 7.3.0 (antes 7.1.0) para coincidir con CLI.
  - Script `db:migrate` en package.json.
  - `prisma generate` y `prisma db push` funcionando correctamente.

- ✅ **Auth – manejo de errores:**
  - `authorize` y callback `jwt` envueltos en try-catch para fallos de BD.
  - Logs con `[NextAuth authorize]` y `[NextAuth jwt]` para depuración.

- ✅ **UX – router.refresh en lugar de reload:**
  - `rates-page`, `shift-types-page`, `shift-form-dialog`: reemplazo de `window.location.reload()` por `router.refresh()` tras create/update/delete para revalidar sin recarga completa.
  - `invitations-section` mantiene reload tras aceptar (actualización de sesión/org).

- ✅ **Revisión DRY:**
  - InvitationsTableBase ya compartido; admin-hr y super-admin usan wrapper con actions propias.
  - Patrones CRUD (ShiftTypes, Rates) consistentes; sin duplicación crítica.
  - Uso correcto de shared utils: formatCurrency, formatDate, badge variants, role-display.

- ✅ **Utilidad:** `npx kill-port 3000` para liberar puerto al reiniciar.

### ✅ Sesión del 23 de Enero 2026 - DRY: InvitationsTable unificado + i18n shift-form

**Completado:**

- ✅ **InvitationsTable unificado (DRY):**
  - Nuevo `InvitationsTableWithCancel` en `shared/ui/molecules`: recibe `onCancelInvitation(id)` como prop.
  - admin-hr y super-admin `InvitationsTable` reducidos a wrappers que pasan su `cancelInvitationAction`.
  - Eliminadas ~120 líneas duplicadas.

- ✅ **i18n en shift-form:**
  - Reemplazado hardcode `'Error al verificar conflictos de horario'` por `t('conflicts.error')` en `shift-form.tsx`.

**DRY – sugerido (no aplicado):**
  - Hook `useAsyncAction` para useTransition + toast: ganancia menor frente a la legibilidad actual.

### ✅ Sesión del 23 de Enero 2026 - Limpieza de código muerto

**Completado:**

- ✅ **Código muerto eliminado:**
  - `shift-form.tsx`: expresión vacía `{}` en el JSX.
  - `shared/lib/constants/toast-messages.ts`: `TOAST_MESSAGES` nunca importado/usado.
  - `shared/lib/utils/format.ts`: `formatRUT` y `formatNumber` nunca usados (se mantiene `formatPercentage`).
  - `shared/lib/validation/document.ts`: `validateRUT` nunca usado (tax-id-config tiene su propia validación).
  - `entities/shift/lib/shift-repository.ts`: repositorio completo sin referencias; `shift-actions` usa Prisma directamente.
  - `features/admin-hr/api/shift-type-actions.ts`: stubs nunca usados; la implementación real está en `shifts/api/shift-type-actions.ts`.

- ✅ **Actualización de índices:** `entities/shift`, `shared/lib/validation`, `shared/lib/constants`, `admin-hr/api`.

- ✅ **Lint y build:** correctos tras la limpieza.

### ✅ Sesión del 23 de Enero 2026 - Refactor Tarifas → Contratos y Tipos de Tarifa

**Contexto:** Las tarifas pasan a ser por persona (negociadas), no por área. Staff puede tener múltiples contratos con distintas organizaciones. Sueldo base opcional por contrato. Historial de contratos (startDate/endDate).

**Completado:**

- ✅ **Schema Prisma:**
  - Eliminados: `Rate`, `ShiftRate`, enums `RateType`, `RateUnit`.
  - Nuevo: `RateTemplate` (tipos globales: nombre, ratePerMinute, baseSalary opcional, baseSalaryUnit).
  - Nuevo: `Contract` (userId, organizationId, areaId?, rateTemplateId?, ratePerMinute?, adjustmentPerMinute, baseSalary?, baseSalaryUnit?, startDate, endDate, isActive).
  - `Shift`: añadido `contractId` opcional.
  - Enum `BaseSalaryUnit`: MONTHLY, DAILY, HOURLY.

- ✅ **Lógica de tarifa efectiva:**
  - Tipo base + ajuste: `RateTemplate.ratePerMinute + adjustmentPerMinute`.
  - Personalizada: `Contract.ratePerMinute` (override o única).
  - Origen visible en UI: template, template_adjusted, custom.

- ✅ **API:** `rate-template-actions` (CRUD tipos), `contract-actions` (getContractsPageData, create, update, end, delete).

- ✅ **UI:** `ContractsPage` con:
  - Sección tipos de tarifa (badges, crear/editar/eliminar).
  - Tabla staff (persona, área, origen tarifa, tarifa efectiva, sueldo base, acciones).
  - Modales: crear/editar contrato (área, tipo o custom, ajuste, sueldo base), crear/editar tipo, finalizar contrato, eliminar tipo.

- ✅ **i18n:** Claves ES/EN para `adminHR.rates` (staffTable, rateTemplates, contract, rateTemplateForm, delete, toast, empty).

- ✅ **Dashboard:** `totalRates` → `totalContracts`; tarjeta "Contratos con tarifa".

- ✅ **`db push`** y **`prisma generate`** ejecutados. **Lint y build:** correctos.

### ✅ Sesión del 23 de Enero 2026 - ShiftType con duración + Area ↔ ShiftType

**Contexto:** Tipos de turno con duración (horas/minutos), clasificación (DAY/NIGHT/MIXED), campos adicionales. Áreas con tipos de turno asignados. Área sin tipos permanece inactiva.

**Completado:**

- ✅ **Schema Prisma:**
  - `ShiftType`: `durationMinutes`, `classification` (DAY|NIGHT|MIXED), `minStaffRequired`, `idealStaffCount`, `maxStaffAllowed`, `suggestedRestDays`, `isGlobal`.
  - `AreaShiftType`: tabla many-to-many Area ↔ ShiftType.
  - `Area`: `isActive` por defecto `false`; nueva relación `shiftTypes`.

- ✅ **API:** `shift-type-actions` actualizados con nuevos campos; `area-shift-type-actions` (`assignShiftTypesToAreaAction`, `setAreaActiveAction`).

- ✅ **UI Tipos de turno:** Formulario con duración (h+min), clasificación, min/ideal/max staff, días descanso, isGlobal. Tabla con columnas duración, clasificación, áreas.

- ✅ **UI Áreas:** Crear área sin switch isActive (siempre inactiva). Página editar área (`/dashboard/areas/[id]/edit`) con asignación de tipos de turno y switch activar (solo si tiene tipos).

- ✅ **Validaciones:** Área no se puede activar sin tipos asignados; `updateArea` y `setAreaActiveAction` lo validan.

- ✅ **i18n:** Claves para shifts.shiftTypes (duration, classification, form extra) y adminHR.areas (editForm, shiftTypes en tabla).

- ✅ **Lint y build:** correctos.

### ✅ Sesión del 23 de Enero 2026 (Tarde) - UI/UX, Iconos, Áreas, Gestor de Personal

**Contexto:** Mejoras UI (IconPicker con buscador, SearchableAddableList, diálogos anchos), tooltips en tipos de turno, correcciones en áreas, definición de Gestión de Personal.

**Completado:**

- ✅ **IconPicker mejorado:** Más iconos (~66), buscador (ES/EN con aliases), `IconPicker` en shared/ui.
- ✅ **SearchableAddableList:** Componente reutilizable en shared/ui/molecules para asignar tipos de turno a áreas (buscar, seleccionar, agregar).
- ✅ **Dialogs más anchos:** Base sm:max-w-2xl, formularios tipo turno 2xl.
- ✅ **Input focus:** `ring-inset` para evitar clipping del borde en contenedores con overflow.
- ✅ **Tooltips:** minStaffRequired, idealStaffCount, maxStaffAllowed, isGlobal en formulario tipos de turno.
- ✅ **Áreas:** Eliminado suggestedRestDays de tipos de turno; añadidos maxConsecutiveHours y minRestHours a Area (configurable por jefe).
- ✅ **Áreas delete:** Botón eliminar funcional con AlertDialog; colores y tooltips en iconos Ver/Eliminar.
- ✅ **Cursor pointer:** Input type="color" y botones de color predefinidos.

**Definido (pendiente implementar):**

- **Gestión de Personal (`/dashboard/staff`):**
  - **ADMIN_HR:** Acceso completo. Ve todo el personal (staff y jefes). Puede asignar/cambiar área a staff y a jefes. Solo ADMIN_HR cambia áreas de jefes.
  - **CHIEF_AREA:** Acceso a personal de sus áreas. Ve solo staff de sus áreas. Solo puede cambiar área al staff (no a jefes).
  - Sidebar: Añadir "Personal" para ADMIN_HR; CHIEF ya tiene el enlace (página actualmente placeholder).
- **UserArea (schema):** Tabla Chief ↔ Área para saber qué áreas gestiona cada jefe. Requerida para filtrar staff y tipos de turno del CHIEF.
- **Tipos de turno:** CHIEF podrá crear tipos (isGlobal=false) para una o varias de sus áreas; ADMIN_HR crea globales.

**Modelo acordado:**

- Invitaciones: solo ADMIN_HR.
- Asignar área al staff: Jefe (via contratos) o ADMIN_HR.
- Cambiar área de jefes: solo ADMIN_HR.

### ✅ Sesión del 11 de Enero 2026 - Integración de Invitaciones en Mi Organización

**Completado:**

- ✅ **Reorganización de Invitaciones ADMIN_HR:**
  - Eliminada ruta separada `/dashboard/admin-hr/invitations`
  - Integrada funcionalidad de invitaciones en página "Mi Organización"
  - Estructura similar a SUPER_ADMIN para consistencia UX
  - Eliminado enlace "Invitaciones" del sidebar de ADMIN_HR

- ✅ **Componente OrganizationTeamSection:**
  - Creado componente reutilizable para gestionar Chiefs y Staff
  - Similar a `OrganizationAdminHRSection` de SUPER_ADMIN
  - Incluye modal para invitar usuarios con formulario integrado
  - Muestra tabla de usuarios existentes con información relevante
  - Validación de límites y mensajes informativos

- ✅ **Actualización de Repositorio:**
  - `getAdminHROrganization` ahora incluye:
    - Invitaciones completas con información de usuario
    - Lista de Chiefs con datos completos
    - Lista de Staff con datos completos
    - Estadísticas actualizadas en tiempo real

- ✅ **Página Mi Organización Completa:**
  - Vista de estadísticas (OrganizationView)
  - Sección de Jefes de Área con modal de invitación
  - Sección de Personal de Salud con modal de invitación
  - Tabla de historial de invitaciones (similar a SUPER_ADMIN)
  - Estructura consistente y profesional

- ✅ **Widgets Reutilizables:**
  - `InviteUserForm` y `InvitationsTable` funcionan con `actionContext`
  - Importación dinámica de server actions según contexto
  - Manejo correcto de tipos (user puede ser null)
  - Sin errores de serialización de Next.js

- ✅ **Traducciones:**
  - Agregadas keys para `adminHR.organization.chiefs.*` (ES/EN)
  - Agregadas keys para `adminHR.organization.staff.*` (ES/EN)
  - Traducciones completas para modales y tablas

- ✅ **Calidad de Código:**
  - `npm run lint` ✅ 0 errors, 0 warnings
  - `npm run build` ✅ Build exitoso
  - Navegador ✅ Sin errores en consola
  - Todas las URLs funcionando correctamente

### ✅ Sesión del 11 de Enero 2026 (Tarde) - Eliminación de Magic Strings y Reorganización de Componentes

**Completado:**

- ✅ **Eliminación de Magic Strings:**
  - Creadas constantes tipadas para Roles en `src/shared/lib/constants/roles.ts`:
    - `ROLES.SUPER_ADMIN`
    - `ROLES.ADMIN_HR`
    - `ROLES.CHIEF_AREA`
    - `ROLES.STAFF_HEALTH`
  - Creadas constantes tipadas para InvitationStatus en `src/shared/lib/constants/invitation-status.ts`:
    - `INVITATION_STATUS.PENDING`
    - `INVITATION_STATUS.ACCEPTED`
    - `INVITATION_STATUS.REJECTED`
    - `INVITATION_STATUS.EXPIRED`
  - Actualizado `src/shared/lib/constants.ts` para exportar desde `./constants/`
  - Reemplazados todos los magic strings hardcodeados (`'CHIEF_AREA'`, `'PENDING'`, etc.) por constantes tipadas
  - Actualizados todos los archivos que usaban magic strings:
    - Server actions (`invitation-actions.ts`, `admin-hr-invitation-actions.ts`)
    - Repositorios (`organization-repository.ts`, `invitation-repository.ts`, `user-repository.ts`, etc.)
    - Componentes UI (`invite-user-form.tsx`, `edit-organization-form.tsx`, `organizations-table-client.tsx`)
    - Entities (`organization-limits.ts`, `invitation-repository.ts`)
    - Páginas (`organization/page.tsx`, `organizations/[id]/page.tsx`)
  - **Beneficios:**
    - Type safety mejorado (TypeScript detecta errores de tipeo)
    - Refactoring más seguro (renombrar constante actualiza todos los usos)
    - Mejor autocompletado en IDEs
    - Código más mantenible y menos propenso a errores

- ✅ **Reorganización de Componentes UI según Atomic Design:**
  - Creada carpeta `src/shared/ui/molecules/` para componentes complejos
  - Movidos componentes base a `molecules/`:
    - `invitations-table-base.tsx` → `molecules/invitations-table-base.tsx`
    - `invite-user-form-base.tsx` → `molecules/invite-user-form-base.tsx`
  - Creado `molecules/index.ts` para barrel exports
  - Estructura de UI más clara:
    - `ui/` - Componentes básicos de shadcn/ui (atoms)
    - `ui/atoms/` - Componentes atómicos propios (button-skeleton, theme-selector, etc.)
    - `ui/icons/` - Iconos
    - `ui/molecules/` - Componentes que combinan múltiples atoms (forms, tables complejas)
  - Actualizados todos los imports para usar `@/src/shared/ui/molecules`
  - **Justificación:**
    - Separa componentes básicos de shadcn/ui de componentes complejos propios
    - Sigue principios de Atomic Design (atoms → molecules → organisms)
    - Facilita mantenimiento y escalabilidad
    - Mejor organización del código UI

- ✅ **Calidad de Código:**
  - `npm run lint` ✅ 0 errors, 0 warnings
  - `npm run build` ✅ Build exitoso
  - Todos los magic strings eliminados
  - Estructura UI más organizada y escalable
  - Type safety mejorado con constantes tipadas

### ✅ Sesión del 11 de Enero 2026 - Migración a Entities y Refactorización de Colores

**Completado:**

- ✅ **Migración a Entities según FSD:**
  - **Entity `user`:**
    - Creada `entities/user/lib/search-user.ts` con función genérica `searchUserByDocumentOrEmail`
    - Renombrada función de `searchUserByRUTOrEmail` a `searchUserByDocumentOrEmail` (genérica, no solo RUT)
    - Removida duplicación: función compartida desde `entities/user` en lugar de duplicada en features
    - Actualizados imports en `super-admin` y `admin-hr` para usar `entities/user`
  - **Entity `invitation`:**
    - Creada `entities/invitation/lib/invitation-repository.ts` con todas las funciones compartidas:
      - `getAllInvitationsForOrganization` - Obtener todas las invitaciones de una organización
      - `getPendingInvitationsForOrganization` - Obtener invitaciones pendientes
      - `getPendingInvitationsForUser` - Obtener invitaciones pendientes de un usuario
      - `createInvitation` - Crear invitación (genérica para cualquier rol)
      - `deleteInvitation` - Eliminar/cancelar invitación
      - `acceptInvitation` - Aceptar invitación
      - `rejectInvitation` - Rechazar invitación
    - Removida duplicación entre `super-admin`, `admin-hr` y `profile`
    - Repositorios de features ahora son wrappers que llaman a entities
  - **Entity `organization`:**
    - Creada `entities/organization/lib/organization-limits.ts` con función genérica:
      - `checkOrganizationRoleLimit` - Verificar límites por rol (genérica para cualquier rol)
    - Removida duplicación entre `super-admin` y `admin-hr`
    - `checkOrganizationAdminHRLimit` y `checkOrganizationLimit` ahora usan la función genérica
  - **Separación clara:** Entidades compartidas en `entities/`, lógica de feature en `features/`
  - **Arquitectura FSD:** Código reutilizable migrado a entities, features mantienen su lógica específica

- ✅ **Reemplazo de Colores Hardcodeados:**
  - Eliminados todos los colores hardcodeados (`text-orange-600`, `text-red-600`, `bg-orange-100`, etc.)
  - Reemplazados por variables semánticas existentes:
    - `text-orange-*` → `text-muted-foreground` (warnings/advertencias)
    - `text-red-*` → `text-destructive` (errores/destructivos)
    - `text-green-*` → `text-primary` (éxito/acciones positivas)
    - `bg-orange-*` → `bg-muted` o `bg-destructive/10`
    - `bg-red-*` → `bg-destructive/10`
    - `bg-green-*` → `bg-primary/10`
  - Colores ahora se adaptan automáticamente a temas personalizados
  - Archivos actualizados: `organization-view.tsx`, `alerts-panel.tsx`, `stats-cards.tsx`, `organizations-table.tsx`, `organizations-table-client.tsx`

- ✅ **Sistema de Cancelación de Invitaciones (SUPER_ADMIN):**
  - Agregada funcionalidad para cancelar invitaciones pendientes
  - Implementado `deleteInvitation` en `admin-hr-invitation-repository.ts`
  - Server action `cancelInvitationAction` con validaciones
  - Componente `InvitationsTable` actualizado con botón de cancelar (icono `Ban`)
  - Tooltip informativo en botón de cancelar
  - AlertDialog de confirmación antes de cancelar
  - Toast de éxito al cancelar exitosamente
  - Validación: solo permite cancelar invitaciones `PENDING`, no aceptadas
  - Revalidación automática de páginas después de cancelar
  - Traducciones completas (ES/EN) para cancelación

- ✅ **Mejoras UI Avatar Navbar:**
  - Actualizado avatar en `main-navbar` para mostrar primera letra del nombre
  - Estilo consistente con `dashboard-sidebar`
  - Muestra imagen del usuario si existe, sino muestra inicial en círculo con fondo primario
  - Mejor UX y consistencia visual en toda la aplicación

- ✅ **Dashboard ADMIN_HR - Vista de Organización:**
  - Creado repositorio `organization-repository.ts` para obtener estadísticas
  - Página `/dashboard/admin-hr/organization` implementada
  - Componente `OrganizationView` con tarjetas de estadísticas:
    - Administradores RRHH (actuales / límite)
    - Jefes de Área (actuales / límite) con invitaciones pendientes
    - Personal de Salud (actuales / límite) con invitaciones pendientes
  - Muestra estado de la organización con badges
  - Integración con sistema de temas

- ✅ **Sistema de Invitaciones ADMIN_HR (Base):**
  - Repositorio `invitation-repository.ts` para gestionar invitaciones
  - Server actions para buscar usuarios, invitar jefes y staff
  - Validaciones de límites por rol (CHIEF_AREA, STAFF_HEALTH)
  - Separación clara: SUPER_ADMIN gestiona ADMIN_HR, ADMIN_HR gestiona CHIEF_AREA y STAFF_HEALTH
  - Navegación agregada: "Mi Organización" e "Invitaciones" en sidebar

- ✅ **Traducciones ADMIN_HR:**
  - Agregadas traducciones para `adminHR.organization.*` (ES/EN)
  - Agregadas traducciones para `adminHR.invitations.*` (ES/EN)
  - Agregadas traducciones para `dashboard.organization` y `dashboard.invitations`

- ✅ **Sistema de Colores y Temas:**
  - Eliminados todos los colores hardcodeados (`text-orange-600`, `text-red-600`, etc.)
  - Reemplazados por variables semánticas existentes (`text-destructive`, `text-muted-foreground`, `text-primary`)
  - Los colores ahora se adaptan automáticamente a temas personalizados
  - Usando solo variables CSS del sistema de diseño (`--destructive`, `--muted-foreground`, `--primary`, etc.)

- ✅ **Arquitectura FSD:**
  - Mantenida separación estricta entre features
  - `super-admin` y `admin-hr` tienen sus propios repositorios de invitaciones
  - Lógica de negocio separada por contexto (SUPER_ADMIN vs ADMIN_HR)
  - Consideración futura: compartir función pura `searchUserByRUTOrEmail` en `shared/lib/functions/`

- ✅ **Calidad de Código:**
  - `npm run lint` ✅ Sin errores
  - `npm run build` ✅ Build exitoso
  - Estructura consistente con arquitectura FSD
  - Separación clara de responsabilidades

### ✅ Sesión del 10 de Enero 2026 - Reorganización de Estructura `lib/` según FSD

**Completado:**

- ✅ **Reorganización Completa de `lib/` en todos los Features:**
  - Implementada estructura FSD con separación por dominio y tecnología
  - Agrupación por dominio primero (`validation/`, `helpers/`)
  - Separación por tecnología usando carpetas (`server/`, `client/`)
  - Funcionalidad separada en archivos individuales con nombres descriptivos
  - Todos los `index.ts` solo exportan (barrel exports)
- ✅ **Estructura Final Implementada:**
  ```
  lib/
  ├── validation/
  │   ├── server/
  │   │   ├── {domain}-messages.ts    # Mensajes de validación server-side
  │   │   └── index.ts                # Solo exports
  │   ├── client/
  │   │   ├── {domain}-messages.ts    # Hooks de validación client-side
  │   │   └── index.ts                # Solo exports
  │   └── index.ts                    # Public API
  ├── helpers/
  │   ├── server/
  │   │   ├── {domain}-schemas.ts     # Schemas server-side
  │   │   └── index.ts                # Solo exports
  │   ├── client/
  │   │   ├── {domain}-schemas.ts     # Schemas client-side
  │   │   └── index.ts                # Solo exports
  │   └── index.ts                    # Public API
  ├── schemas/                        # Schemas Zod
  ├── types.ts                        # Tipos TypeScript
  ├── constants.ts                    # Constantes
  └── index.ts                        # Public API del feature
  ```
- ✅ **Features Reorganizados:**
  - `super-admin/lib`: `organization-messages.ts`, `admin-hr-user-messages.ts`, `organization-schemas.ts`, `admin-hr-user-schemas.ts` (server y client)
  - `auth/lib`: `auth-messages.ts`, `auth-schemas.ts` (solo server)
  - `profile/lib`: `profile-messages.ts`, `profile-schemas.ts` (server y client)
  - `admin-hr/lib`: `area-messages.ts`, `area-schemas.ts` (server y client)
- ✅ **Ventajas de la Nueva Estructura:**
  - **Mejor Encapsulación:** Cada carpeta `server/` o `client/` puede contener múltiples archivos sin mezclar responsabilidades
  - **Escalabilidad:** Fácil agregar más archivos dentro de cada carpeta sin afectar otros
  - **Claridad:** Separación server/client es explícita por carpeta, no por sufijo en nombre de archivo
  - **Mantenibilidad:** Estructura más clara y fácil de navegar
  - **Alineado con FSD:** Agrupa por dominio primero, luego por tecnología
  - **Nombres Descriptivos:** Archivos nombrados según su función (`organization-messages.ts`, `auth-schemas.ts`)
- ✅ **Calidad de Código:**
  - `npm run lint` ✅ Sin errores reales (solo caché de linter sobre archivo inexistente)
  - Estructura consistente en todos los features
  - Imports actualizados correctamente
  - Public API bien definida a través de `index.ts`

### ✅ Sesión del 10 de Enero 2026 - Sistema de Temas Personalizados + Correcciones UI

**Completado:**

- ✅ **Sistema de Temas Personalizados:**
  - Implementado sistema de temas con CSS variables dinámicas
  - Separación de lógica y constantes en `src/shared/lib/themes/`:
    - `themes-types.ts`: Interfaces TypeScript
    - `themes-constants.ts`: Temas predefinidos (Aurora, Soleil, Lavande)
    - `themes-utils.ts`: Utilidades para localStorage
    - `index.ts`: Barrel exports
  - `CustomThemeProvider` para gestión de temas con contexto React
  - `ThemeSelector` en navbar con dropdown de selección
  - Temas predefinidos con nombres artísticos (Aurora, Soleil, Lavande)
  - Persistencia de tema seleccionado en localStorage
  - Integración con `next-themes` para dark/light mode
  - Tema "Aurora" (default) limpia variables CSS para usar estilos de `globals.css`
- ✅ **Correcciones UI:**
  - Eliminado checkmark duplicado en `ThemeSelector` (solo muestra el nativo del componente Select)
  - Ajustado ancho del selector para mostrar nombres completos de temas
  - Icono `Palette` con `shrink-0` para evitar compresión
- ✅ **Calidad de Código:**
  - `npm run build` ✅ Build exitoso
  - Estructura modular y mantenible
  - Sin lógica de importación de temas (solo predefinidos)

### ✅ Sesión del 10 de Enero 2026 - Refactorización: Patrón Repository en todos los Features

**Completado:**

- ✅ **Implementación del Patrón Repository:**
  - Creada carpeta `data/` en todos los features (`profile`, `auth`, `admin-hr`, `super-admin`)
  - Movidos todos los helpers que acceden directamente a Prisma a repositorios
  - Separación clara entre lógica de negocio (`lib/`) y acceso a datos (`data/`)
  - Estructura consistente: `data/{entity}-repository.ts` y `data/index.ts`
- ✅ **Features Refactorizados:**
  - `profile`: `profile-helpers.ts` → `data/profile-repository.ts`
  - `auth`: `user-helpers.ts` → `data/user-repository.ts`
  - `admin-hr`: `area-helpers.ts` → `data/area-repository.ts`
  - `super-admin`: Ya tenía estructura `data/` (organizations, admin-hr-users, invitations)
- ✅ **Actualización de Imports:**
  - Server Actions actualizados para usar repositorios en lugar de helpers
  - Páginas actualizadas para importar desde `data/` en lugar de `lib/`
  - `index.ts` de `lib/` actualizados con comentarios indicando la migración
- ✅ **Beneficios de la Refactorización:**
  - Mejor separación de responsabilidades (SRP)
  - Facilita futuras migraciones (cambio de ORM, microservicios)
  - Código más testeable y mantenible
  - Preparado para escalabilidad futura
- ✅ **Calidad de Código:**
  - `npm run build` ✅ Build exitoso
  - `npm run lint` ✅ Sin errores (solo warnings menores)
  - Estructura consistente en todos los features
  - Comentarios documentando el patrón Repository

### ✅ Sesión del 10 de Enero 2026 - Correcciones UI/UX Perfil + Sección de Organizaciones

**Completado:**

- ✅ **Corrección de Rutas de Perfil:**
  - Corregida ruta en `main-navbar` de `/profile` a `/dashboard/profile`
  - Agregado link "Perfil" en `super-admin-sidebar` apuntando a `/dashboard/profile`
  - Todos los usuarios (incluido SUPER_ADMIN) acceden al perfil desde `/dashboard/profile`
  - Ruta unificada para consistencia en toda la aplicación
  - Traducciones agregadas para sidebar de SUPER_ADMIN (`superAdmin.sidebar.profile`)
- ✅ **Mejoras en Alert de Advertencia:**
  - Cambiado `variant` de `destructive` (rojo) a `warning` (amarillo)
  - Agregada variante `warning` al componente `Alert` con colores amarillos
  - Corregida alineación del icono `AlertTriangle` (removido `translate-y-0.5`)
  - Icono único y correctamente alineado verticalmente
- ✅ **Sección de Organizaciones en Perfil:**
  - Nuevo componente `OrganizationsSection` que muestra organizaciones del usuario
  - Incluye organización actual (`user.organization`) e invitaciones aceptadas
  - Muestra nombre, RUT/Tax ID y estado de cada organización
  - Badges de estado con colores (Activa, Pago Pendiente, Suspendida, Inactiva)
  - Actualización automática después de aceptar invitaciones (recarga de página)
  - Helper `getUserOrganizations` para obtener datos del usuario
  - Server Action `getUserOrganizationsAction` implementada
  - Traducciones completas (ES/EN) para la nueva sección
- ✅ **Mejoras en Invitaciones:**
  - Corregido tipo de retorno de `getPendingInvitationsAction` a `ActionResult`
  - Recarga automática de página después de aceptar invitación (1 segundo de delay)
  - Mejor manejo de estados y errores
- ✅ **Calidad de Código:**
  - `npm run build` ✅ Build exitoso
  - Componentes bien estructurados siguiendo FSD
  - Traducciones completas y consistentes

### ✅ Sesión del 10 de Enero 2026 - Correcciones UI/UX Perfil + Sección de Organizaciones

**Completado:**

- ✅ **Corrección de Rutas de Perfil:**
  - Corregida ruta en `main-navbar` de `/profile` a `/dashboard/profile`
  - Agregado link "Perfil" en `super-admin-sidebar` apuntando a `/dashboard/profile`
  - Todos los usuarios (incluido SUPER_ADMIN) acceden al perfil desde `/dashboard/profile`
  - Ruta unificada para consistencia en toda la aplicación
  - Traducciones agregadas para sidebar de SUPER_ADMIN (`superAdmin.sidebar.profile`)
- ✅ **Mejoras en Alert de Advertencia:**
  - Cambiado `variant` de `destructive` (rojo) a `warning` (amarillo)
  - Agregada variante `warning` al componente `Alert` con colores amarillos
  - Corregida alineación del icono `AlertTriangle` (removido `translate-y-0.5`)
  - Icono único y correctamente alineado verticalmente
- ✅ **Sección de Organizaciones en Perfil:**
  - Nuevo componente `OrganizationsSection` que muestra organizaciones del usuario
  - Incluye organización actual (`user.organization`) e invitaciones aceptadas
  - Muestra nombre, RUT/Tax ID y estado de cada organización
  - Badges de estado con colores (Activa, Pago Pendiente, Suspendida, Inactiva)
  - Actualización automática después de aceptar invitaciones (recarga de página)
  - Helper `getUserOrganizations` para obtener datos del usuario
  - Server Action `getUserOrganizationsAction` implementada
  - Traducciones completas (ES/EN) para la nueva sección
- ✅ **Mejoras en Invitaciones:**
  - Corregido tipo de retorno de `getPendingInvitationsAction` a `ActionResult`
  - Recarga automática de página después de aceptar invitación (1 segundo de delay)
  - Mejor manejo de estados y errores
- ✅ **Calidad de Código:**
  - `npm run build` ✅ Build exitoso
  - Componentes bien estructurados siguiendo FSD
  - Traducciones completas y consistentes

### ✅ Sesión del 8 de Enero 2026 - Edición de Organizaciones + Multi-idioma + RUT/Tax ID Editable

**Completado:**

- ✅ **Sistema de Edición de Organizaciones:**
  - Página de edición `/super-admin/organizations/[id]/edit`
  - Formulario prellenado con datos actuales
  - Validación de límites >= usuarios actuales por rol
  - Badges mostrando usuarios actuales (Admin HR: 0, Jefes: 0, Staff: 0)
  - Server Action `updateOrganization` con validaciones robustas
  - Navegación desde tabla con botón de editar directo
- ✅ **Mejoras en Tabla de Organizaciones:**
  - Botón de editar (icono) independiente del dropdown
  - Mantiene menú de acciones secundarias (Ver, Suspender, Eliminar)
  - UI más intuitiva y accesible
- ✅ **Validaciones Backend:**
  - Helper `updateOrganization` valida límites vs usuarios actuales
  - Mensajes de error específicos por rol
  - Prevención de pérdida de datos
  - Query optimizada con conteo de usuarios por rol
- ✅ **RUT/Tax ID Editable:**
  - Campo RUT/Tax ID ahora es editable en formulario de edición
  - Campo País editable (incluyendo US agregado al enum)
  - Formateo automático según país seleccionado
  - Validación dinámica según país (RUT, CUIT, RUC, NIT, RFC, EIN)
  - Verificación de unicidad en BD al actualizar
  - Helper `checkTaxIdExists` con exclusión por ID
  - Validaciones en `updateOrganizationSchema` con `.refine()`
- ✅ **Sistema Multi-idioma 100% Completo:**
  - Página de edición traducida (ES/EN)
  - Título y subtítulo con interpolación dinámica
  - Formulario completamente traducido
  - Botones de acción traducidos correctamente
  - Dropdown de países generado dinámicamente desde traducciones
  - Probado en ambos idiomas (español e inglés)
  - Keys agregadas para formulario de edición (ES/EN)
  - Eliminadas duplicaciones en archivos de traducciones
  - Sistema consistente en toda la app
- ✅ **Calidad de Código:**
  - `npm run format` ✅ Sin cambios pendientes
  - `npm run lint` ✅ 0 warnings, 0 errors
  - `npm run build` ✅ Build exitoso
  - Navegador ✅ Formulario funcional y 100% traducido en ES/EN

### ✅ Sesión del 9 de Enero 2026 - Error Boundaries y Loading States

**Completado:**

- ✅ **Sistema de Error Handling Completo:**
  - Error boundary global (`app/global-error.tsx`) para errores en root layout
  - Error boundaries específicos por sección:
    - `app/[locale]/error.tsx` - Error boundary principal
    - `app/[locale]/dashboard/error.tsx` - Error boundary dashboard
    - `app/[locale]/super-admin/error.tsx` - Error boundary super-admin
  - Implementación siguiendo [Next.js Error Handling docs](https://nextjs.org/docs/app/getting-started/error-handling)
  - Todos los error boundaries son Client Components (`'use client'`)
  - Logging de errores en `useEffect` para debugging
  - UI consistente con Card de Shadcn UI
  - Botones de acción: "Intentar de nuevo" (reset) y "Ir al inicio"
  - Muestra `error.digest` si está disponible
  - Traducciones completas (ES/EN) para todos los mensajes de error
- ✅ **Sistema de Loading States:**
  - Loading states globales:
    - `app/[locale]/loading.tsx` - Loading state principal
    - `app/[locale]/dashboard/loading.tsx` - Loading state dashboard
    - `app/[locale]/super-admin/loading.tsx` - Loading state super-admin
  - Loading states específicos:
    - `app/[locale]/dashboard/admin-hr/loading.tsx` - Loading state específico ADMIN_HR con estructura de tarjetas
  - Implementación siguiendo [Next.js Loading docs](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
  - Skeletons que coinciden con la estructura real de cada página
  - Componente Skeleton de shadcn/ui (`src/shared/ui/skeleton.tsx`)
  - Grid responsive para tarjetas de carga
  - Iconos visibles durante la carga (mejor UX)
- ✅ **Componente Skeleton:**
  - Archivo: `src/shared/ui/skeleton.tsx`
  - Basado en shadcn/ui v4
  - Animación `animate-pulse` para efecto de carga
  - Import de React corregido para evitar errores de módulos
- ✅ **Traducciones para Errores:**
  - Keys agregadas en `messages/es.json` y `messages/en.json`:
    - `errors.title` - "Algo salió mal" / "Something went wrong"
    - `errors.description` - Descripción del error
    - `errors.errorId` - "Error ID"
    - `errors.tryAgain` - "Intentar de nuevo" / "Try again"
    - `errors.goHome` - "Ir al inicio" / "Go home"
- ✅ **Mejoras en Dashboard ADMIN_HR:**
  - Padding consistente con SUPER_ADMIN (`container mx-auto p-6 lg:p-8`)
  - Sidebar mejorado con sección de perfil (igual que SUPER_ADMIN):
    - ThemeToggle y LanguageSelector
    - Card con información del usuario (avatar, nombre, email)
    - Botón de logout
  - Estilos consistentes con SUPER_ADMIN sidebar
- ✅ **Calidad de Código:**
  - `npm run format` ✅ Sin cambios pendientes
  - `npm run lint` ✅ 0 warnings, 0 errors
  - `npm run build` ✅ Build exitoso
  - Caché de Next.js limpiada para resolver errores de módulos
  - Todos los archivos siguen las mejores prácticas de Next.js

### ✅ Sesión del 8 de Enero 2026 (Noche) - AlertDialogs para Acciones Críticas

**Completado:**

- ✅ **Componente AlertDialog de Shadcn UI:**
  - Archivo: `src/shared/ui/alert-dialog.tsx`
  - Basado en Radix UI (base de Shadcn UI)
  - Componentes exportados: AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel
  - Instalada dependencia: `@radix-ui/react-alert-dialog`
- ✅ **Reemplazo de window.confirm y window.prompt:**
  - Eliminado uso de `window.confirm` y `window.prompt` en toda la aplicación
  - Implementados AlertDialogs personalizados para acciones críticas
  - UI consistente con el diseño system de Shadcn UI
  - Mejor experiencia de usuario con diálogos accesibles
- ✅ **Diálogos Implementados en OrganizationsTable:**
  - **Diálogo de Suspender:**
    - Título: "Suspender Organización"
    - Descripción con nombre de la organización
    - Botón de acción con variante naranja (warning)
    - Botón cancelar
  - **Diálogo de Reactivar:**
    - Título: "Reactivar Organización"
    - Descripción con nombre de la organización
    - Botón de acción con variante verde (success)
    - Botón cancelar
  - **Diálogo de Eliminar (Soft Delete):**
    - Título: "Eliminar Organización"
    - Descripción con advertencia de soft delete
    - Input para razón de eliminación (mínimo 10 caracteres)
    - Validación en tiempo real del input
    - Botón de acción deshabilitado hasta cumplir mínimo de caracteres
    - Botón de acción con variante destructive (rojo)
    - Placeholder descriptivo para el input
- ✅ **Mejoras en UX/UI:**
  - Leyenda de filtros activos agregada a la izquierda de los dropdowns
  - Badges con botones para remover filtros individuales
  - Tooltips y colores en iconos de edición (azul)
  - Layout responsive para leyenda de filtros
- ✅ **Traducciones Completas:**
  - Keys agregadas para AlertDialogs (ES/EN):
    - `confirmSuspend`, `confirmReactivate`, `confirmDelete`
    - `confirmDeleteWarning`
    - `deleteReasonPrompt`, `deleteReasonPlaceholder`, `deleteReasonMinLength`
    - `cancel`
  - Todos los textos de los diálogos traducidos
  - Mensajes de éxito/error traducidos
- ✅ **Validaciones y Lógica:**
  - Estado controlado para cada diálogo (`showSuspendDialog`, `showReactivateDialog`, `showDeleteDialog`)
  - Estado para razón de eliminación con validación de longitud mínima
  - Integración con Server Actions existentes (`changeOrganizationStatusAction`, `deleteOrganizationAction`)
  - Manejo de errores con toast notifications
- ✅ **Calidad de Código:**
  - `npm run format` ✅ Sin cambios pendientes
  - `npm run lint` ✅ 0 warnings, 0 errors
  - `npm run build` ✅ Build exitoso
  - Código sin comentarios (siguiendo best practices)
  - Componentes accesibles con ARIA attributes

### ✅ Sesión del 7 de Enero 2026 (Noche) - Optimizaciones y Sistema de Traducciones

**Completado:**

- ✅ **Eliminación de Warnings de Hydration:**
  - Optimizado componente `ThemeToggle` con `suppressHydrationWarning` y `resolvedTheme`
  - Eliminado `useState` + `useEffect` que causaba warnings de React Hooks
  - Optimizado componente `LanguageSelector` con `suppressHydrationWarning`
  - Componentes ahora siguen las mejores prácticas de React para hidratación
  - Los únicos warnings de hydration restantes son causados por el browser automation tool (`data-cursor-ref`)
- ✅ **Sistema de Traducciones Completo:**
  - Agregadas 17+ keys de traducción faltantes en `messages/es.json` y `messages/en.json`
  - Keys para dashboard de organizaciones: `new`, `viewAll`, `name`, `status`, `plan`, `accounts`
  - Keys para estados: `status_active`, `status_pending`, `status_suspended`, `status_inactive`
  - Keys para planes: `plan_basic`, `plan_pro`, `plan_enterprise`
  - Keys para acciones: `view`, `registerPayment`, `reactivate`
  - Corregida estructura de keys anidadas (evitando conflictos de objetos vs strings)
  - Panel de control ahora 100% traducido sin errores en consola
- ✅ **Mejoras de Performance:**
  - Componentes `ThemeToggle` y `LanguageSelector` optimizados para evitar re-renders innecesarios
  - Eliminado uso de `useEffect` para setear estado (anti-pattern)
  - Mejor integración con `next-themes` usando `resolvedTheme`
- ✅ **Calidad de Código Final:**
  - `npm run format` ✅ Sin cambios pendientes
  - `npm run lint` ✅ 0 warnings, 0 errors
  - `npm run build` ✅ Build exitoso en 6.9s
  - Consola del navegador ✅ Sin errores de traducción
  - Solo warnings de hydration del browser automation tool (no son errores reales de la app)

### ✅ Sesión del 7 de Enero 2026 (Tarde) - Mejoras en CRUD Organizations

**Completado:**

- ✅ **Helper de Validación de Identificadores Fiscales por País:**
  - Archivo: `src/shared/lib/utils/tax-id-config.ts`
  - Configuración completa para 6 países: Chile (RUT), Perú (RUC), Colombia (NIT), Argentina (CUIT), México (RFC), USA (EIN)
  - Funciones de formateo automático específicas por país
  - Validaciones con dígito verificador (Chile, Colombia, Argentina)
  - Labels, placeholders y descripciones dinámicas según país seleccionado
  - Integración completa en formulario de creación de organizaciones
- ✅ **Tabla de Organizaciones Mejorada:**
  - Nueva columna "Límites de Usuarios" con desglose por rol
  - Muestra para cada organización:
    - Admin HR: X / Y (actuales / máximo)
    - Jefes: X / Y
    - Staff: X / Y
  - Query actualizada para incluir conteo de usuarios por rol
  - Helper `getUserCounts()` para calcular usuarios activos por rol
- ✅ **Optimización de React Hook Form:**
  - Reemplazado `watch()` por `useWatch()` para evitar warnings de React Compiler
  - Corrección del `onChange` en campo taxId para compatibilidad con `register()`
  - Form state management mejorado con `control` explícito
- ✅ **Limpieza de Scripts:**
  - Eliminado `scripts/create-test-organizations.sql` (ya no necesario con UI funcional)
  - Eliminado `scripts/set-superadmin.sql` (administración se hace directamente desde BD)
  - Carpeta `scripts/` eliminada (ya no contiene archivos)
  - Actualizada documentación en `vita.plan.md` para reflejar cambios
- ✅ **Calidad de Código:**
  - `npm run format` ✅ Sin cambios pendientes
  - `npm run lint` ✅ Sin warnings ni errores
  - `npm run build` ✅ Build exitoso
  - Pruebas en navegador ✅ Sin errores en consola (solo warnings de hydration de dev tools)

### 🔄 FASE 3: Sistema de Gestión de Turnos Médicos (100% completado)

**Completado (Enero 23, 2026):**

**Completado en Diciembre 2025:**

- ✅ Prisma + Supabase configurado y funcionando
- ✅ Schema de BD diseñado con multi-country support (docNumber, docType)
- ✅ ESLint + Prettier configurado (no muy estricto)
- ✅ NextAuth v4 instalado y configurado
- ✅ Estructura de carpetas organizada (`lib/`, `types/`)
- ✅ Dark mode implementado con next-themes (funcionando)
- ✅ **next-intl implementado según documentación oficial** (español e inglés, routing completo)
- ✅ Landing page con Hero Section, Navbar y Footer
- ✅ Componentes organizados con Atomic Design (atoms, molecules, templates)
- ✅ Tema "Healthcare Modern" implementado (colores médicos)
- ✅ Estructura de rutas implementada: `(global)` para páginas públicas, rutas normales para dashboards
- ✅ **Limpieza de código:** Eliminados archivos redundantes
- ✅ **Configuración i18n optimizada:** Implementación según [next-intl docs](https://next-intl.dev/docs/routing/setup)

**✅ Completado en Enero 2026:**

- ✅ **Migración a Feature-Sliced Design (FSD):**
  - Arquitectura frontend moderna y escalable
  - Estructura: `app/`, `shared/`, `entities/`, `features/`, `widgets/`
  - **Entities (`src/entities/`):** Entidades de negocio compartidas entre múltiples features
    - `entities/user/` - Funciones de búsqueda y gestión de usuarios
    - `entities/invitation/` - Repositorio completo de invitaciones (crear, aceptar, rechazar, eliminar)
    - `entities/organization/` - Funciones de organización (límites, estadísticas)
  - **Features (`src/features/`):** Lógica de negocio específica de cada feature
    - Repositorios de features son wrappers que llaman a entities cuando es necesario
    - Mantienen lógica específica de cada contexto (SUPER_ADMIN vs ADMIN_HR)
  - Public APIs con `index.ts` en cada slice
  - Server Actions en `features/*/api/`
  - Componentes UI en `features/*/ui/` y `widgets/`
  - Utilidades compartidas en `shared/lib/`
- ✅ **Dashboard SUPER_ADMIN completo:**
  - 6 tarjetas de métricas (Total Orgs, Activas %, Suspendidas %, Ingresos, Usuarios, Próximos Pagos)
  - Tabla de organizaciones recientes con estados y acciones
  - Panel de alertas (pagos próximos, orgs suspendidas, pagos del día)
  - Sidebar con navegación completa
  - Protección de rutas con `requireSuperAdmin()`
  - Theme toggle y language selector integrados
- ✅ **CRUD Completo de Organizaciones (Enero 7, 2026):**
  - **Listado de Organizaciones:**
    - Tabla paginada con todos los datos (nombre, RUT, plan, estado, usuarios, tarifa, próximo pago)
    - Filtros dinámicos (búsqueda, estado, plan, país)
    - Búsqueda por nombre, RUT o email
    - Badges con colores según estado y plan
  - **Creación de Organizaciones:**
    - Formulario completo con react-hook-form + Zod validation
    - 4 secciones: Información Básica, Facturación + Límites, Contacto
    - **Límites de Cuentas (NUEVO):**
      - `maxAdminHR`: Límite de cuentas ADMIN_HR (default: 5, gratis)
      - `maxChiefs`: Límite de jefes de área (default: 10, hasta 100)
      - `maxStaff`: Límite de personal médico (default: 50, hasta 1000)
      - Grid responsive (3 columnas en desktop, 1 en mobile)
      - Validación de rangos y números enteros
    - Campos: nombre, RUT, país, plan, tarifa mensual, límites de cuentas, contacto
    - Validación en tiempo real
  - **Vista de Detalles:**
    - Tarjetas con información general (estado, plan, tarifa, próximo pago)
    - Lista de usuarios de la organización
    - Información de contacto completa
    - Datos del sistema (país, fechas)
  - **Arquitectura:**
    - Server Actions tipados en `features/super-admin/api/organization-actions.ts`
    - Helpers con Prisma queries en `features/super-admin/lib/organization-helpers.ts`
    - Schemas Zod en `features/super-admin/lib/schemas.ts`
    - Helper de identificadores fiscales en `shared/lib/utils/tax-id-config.ts`
    - Componentes Client en `features/super-admin/ui/`
    - Pages como Server Components en `app/[locale]/super-admin/organizations/`
- ✅ **Sistema de Organizations mejorado:**
  - Nuevos campos: `plan`, `status`, `monthlyFee`, `nextPayment`, `contactName`, `contactEmail`, `contactPhone`, `address`
  - Enums: `OrganizationPlan` (BASIC, PRO, ENTERPRISE)
  - Enums: `OrganizationStatus` (ACTIVE, PENDING_PAYMENT, SUSPENDED, INACTIVE)
  - Multi-country support: `Country` enum (CL, AR, PE, CO, MX)
  - Migration aplicada exitosamente
- ✅ **Helper de Identificadores Fiscales por País (tax-id-config.ts):**
  - **Archivo:** `src/shared/lib/utils/tax-id-config.ts`
  - **Países Soportados:**
    - 🇨🇱 Chile: RUT (Rol Único Tributario) con validación de dígito verificador
    - 🇵🇪 Perú: RUC (Registro Único de Contribuyentes) 11 dígitos
    - 🇨🇴 Colombia: NIT (Número de Identificación Tributaria) con dígito verificador
    - 🇦🇷 Argentina: CUIT (Clave Única de Identificación Tributaria) con dígito verificador
    - 🇲🇽 México: RFC (Registro Federal de Contribuyentes) 12-13 caracteres
    - 🇺🇸 USA: EIN (Employer Identification Number) formato XX-XXXXXXX
  - **Funcionalidades:**
    - Interface `TaxIdConfig` con: label, placeholder, description, validación, formateo
    - Función `getTaxIdConfig(country)`: Retorna configuración dinámica según país
    - Función `formatTaxId(value, country)`: Formateo automático en tiempo real
    - Función `validateTaxId(value, country)`: Validación completa con dígito verificador
  - **Integración:**
    - Formulario de creación de organizaciones usa config dinámico
    - Labels y placeholders cambian automáticamente al seleccionar país
    - Formateo en tiempo real mientras el usuario escribe
    - Validación Zod integrada en `createOrganizationSchema`
- ✅ **Internacionalización Completa:**
  - Eliminada duplicación de keys en archivos de traducciones
  - Traducciones completas para CRUD de organizaciones (ES/EN)
  - Soporte para estados, planes y países traducidos
  - Placeholders y labels correctamente traducidos
- ✅ **Optimizaciones de Performance y Hydration:**
  - **Componentes optimizados para SSR/CSR:**
    - `ThemeToggle`: Usa `suppressHydrationWarning` + `resolvedTheme` de `next-themes`
    - `LanguageSelector`: Usa `suppressHydrationWarning` para evitar mismatch
    - Eliminado patrón anti-pattern de `useEffect` + `setState` en montaje
    - Componentes ahora siguen guías oficiales de React para hidratación
  - **React Hook Form optimizado:**
    - Reemplazado `watch()` por `useWatch()` para mejor performance
    - Evita re-renders innecesarios del formulario completo
    - Control explícito para suscripciones a campos específicos
  - **Warnings eliminados:**
    - 0 warnings de React Hooks
    - 0 warnings de ESLint
    - Solo quedan warnings de hydration del browser automation tool (no son de la app)
- ✅ **Buenas Prácticas de Código (Code Quality):**
  - **Eliminados TODOS los `any` types:**
    - Error handling con `instanceof Error` y type guards
    - Uso de `Prisma.OrganizationWhereInput` para queries dinámicas
    - Interfaces específicas (`OrganizationUser`, `OrganizationWithCount`)
    - Union types para keys de traducción dinámicas
  - **Arquitectura Server/Client correcta:**
    - Todas las Pages son Server Components (sin `'use client'`)
    - Solo componentes UI tienen `'use client'`
    - Data fetching en servidor, interactividad en cliente
  - **Sistema de Tipos FSD (Type System):**
    - **Tipos compartidos dentro de features:** `src/features/[feature]/lib/types.ts`
    - **Exportación centralizada:** Public API en `src/features/[feature]/lib/index.ts`
    - **Tipos de dominio:** Definidos en cada feature según su alcance
    - **Ejemplos implementados:**
      - `src/features/auth/lib/types.ts`: `ActionResult<T>`, `RegisterData`, `LoginData`
      - `src/features/super-admin/lib/types.ts`: `OrganizationWithCount`, `OrganizationsTableProps`, `OrganizationSummary`, `OrganizationActionResult`
    - **Eliminación de tipos duplicados:** Interfaces locales solo cuando se usan en un único archivo
  - **Type Safety:**
    - Importación correcta de tipos de Prisma (`Role`, `OrganizationStatus`, `OrganizationPlan`, `Country`)
    - No hay `as any` en el código
    - Prisma Client regenerado con todos los campos
  - **Build exitoso:** ✅ 0 errores, solo 12 warnings menores
- ✅ **Mejoras de UX:**
  - Dark mode funcionando correctamente en todas las páginas (login, register, dashboards)
  - Logo "VITA" clickeable en ambos sidebars (redirección a home)
  - `cursor-pointer` aplicado globalmente a elementos interactivos
  - Traducciones completas para todos los componentes
  - Formularios con validación en tiempo real
- ✅ **Correcciones técnicas:**
  - Error de hidratación corregido (números formateados en servidor)
  - Funciones helper para formateo consistente (`formatCurrency`, `formatPercentage`, `formatNumber`)
  - Middleware actualizado para rutas de SUPER_ADMIN
  - Páginas de onboarding implementadas (UX simplificada)
  - Links corregidos (uso de `Link` de next/link en lugar de `<a>`)
- ✅ **Documentación:**
  - Todo consolidado en `vita.plan.md`
  - Scripts SQL para configurar SUPER_ADMIN y crear organizaciones de prueba
  - Documentación de arquitectura FSD
  - Guía de buenas prácticas implementadas

**Completado en Enero 7, 2026 (Actualización Final):**

- ✅ **Límites de Cuentas por Organización:**
  - Campos `maxAdminHR`, `maxChiefs`, `maxStaff` implementados en formularios
  - Límites máximos según plan (BASIC, PRO, ENTERPRISE)
  - Validación refinada en Zod para verificar límites según plan seleccionado
  - Hints dinámicos en UI mostrando límite máximo del plan
- ✅ **Validaciones del Formulario Mejoradas:**
  - Validación de RUT mejorada (8-12 caracteres sin formateo)
  - Formateo automático de RUT mientras se escribe (`76.555.666-7`)
  - Teléfono ahora obligatorio (removido `.optional()`)
  - Traducciones actualizadas (sin "opcional" en teléfono)
- ✅ **Prueba End-to-End Exitosa:**
  - Organización creada exitosamente en BD
  - Datos verificados en tabla de organizaciones
  - Vista de detalles funcionando correctamente
  - Todos los campos guardados correctamente (incluidos límites)
- ✅ **Build y Lint Clean:**
  - Build exitoso: 0 errores
  - Lint: 1 warning (React Hook Form - fuera de control)
  - Código completamente formateado

**Decisiones de Diseño:**

- Mantener sidebars separados (SUPER_ADMIN vs Dashboard regular) por claridad y flexibilidad
- Formateo de números en servidor para evitar problemas de hidratación
- Arquitectura FSD adoptada como estándar del proyecto
- **Páginas SIEMPRE como Server Components, componentes UI como Client Components**
- **NUNCA usar `any` types - siempre tipar correctamente con Prisma types o interfaces específicas**
- Server Actions en `features/*/api/` para lógica de negocio
- Helpers con Prisma queries en `features/*/lib/`
- **Validación de RUT simplificada:** Solo longitud (8-12 caracteres), formateo automático en UI
- **Teléfono obligatorio:** Requerido para contacto de organización

**Testing Completado:**

- ✅ Build exitoso: 0 errores
- ✅ Lint: 100% limpio (warning de React Hook Form resuelto con `useWatch`)
- ✅ Format: Todo el código formateado correctamente
- ✅ Navegación funcionando correctamente
- ✅ Traducciones cargando correctamente (ES/EN)
- ✅ Dark mode funcionando en todas las páginas
- ✅ CRUD de organizaciones funcional con límites de cuentas
- ✅ Formularios con validación en tiempo real

---

## 🔄 FASE 3: Sistema de Gestión de Turnos Médicos (80% completado)

### ✅ Completado (23 de Enero 2026)

#### **1. Schema Prisma para Sistema de Turnos**

- Nueva entidad `ShiftType` para tipos de turnos configurables por organización
- Nueva entidad `Shift` con campos completos (título, fechas, estado, notas)
- Relaciones con User, Area, ShiftType, y Organization
- Enum `ShiftStatus` (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- Actualización de entities existentes (User, Area) con relaciones a Shift
- Índices optimizados para consultas de calendario y filtros

#### **2. Repository Completo de Turnos**

- `getShifts()` - Listado paginado con filtros avanzados (usuario, área, tipo, estado, fechas)
- `getShiftById()` - Obtener turno específico con relaciones completas
- `createShift()` - Crear nuevo turno con validación automática de estado
- `updateShift()` - Actualizar turno existente
- `deleteShift()` - Eliminar turno (soft delete a futuro)
- `getShiftsForCalendar()` - Obtener turnos para vista de calendario (optimizado)
- `getUserShiftsForDate()` - Obtener turnos de un usuario para fecha específica
- Includes completos con User, Area, y ShiftType

#### **3. Sistema de Validación de Turnos**

- `checkShiftConflicts()` - Detección de conflictos de horario:
  - Superposición de turnos para mismo usuario
  - Turnos en el pasado (validación temporal)
  - Duración máxima/mínima de turnos (30min - 12 horas)
  - Validación de horarios lógicos
- `checkMultipleUserShiftsConflicts()` - Validación masiva para múltiples usuarios
- Mensajes de error específicos y claros
- Prevención de dobles asignaciones

#### **4. UI Components**

- **`ShiftCalendar`:** Vista de calendario mensual con:
  - Navegación por mes con botones anterior/siguiente
  - Visualización de turnos por día con colores según tipo
  - Máximo 3 turnos visibles por día + indicador "X más"
  - Hover tooltips con información completa del turno
  - Selección de fechas con feedback visual
  - Leyenda de estados (Programado, En progreso, Completado, Cancelado)
- **`ShiftForm`:** Formulario completo para crear/editar turnos:
  - Información básica (título, notas)
  - Selección de usuario con avatar desplegado
  - Selección de área con descripción
  - Selección de tipo de turno con color visual
  - Fecha de inicio con calendario popup
  - Horas de inicio/fin con validación
  - Checkbox para habilitar fecha de fin diferente
  - Validación en tiempo real de conflictos
  - Loading states y errores específicos

- **`ShiftFilters`:** Sistema de filtros avanzados:
  - Búsqueda por texto (título, notas, usuario)
  - Filtro por estado con badges coloreados
  - Filtro por usuario con avatares
  - Filtro por área y tipo de turno
  - Filtros por rango de fechas (calendarios popup)
  - Filtros rápidos (Hoy, Esta semana, Este mes)
  - Resumen visual de filtros activos con badges
  - Botón para limpiar todos los filtros

#### **5. Arquitectura FSD para Shifts**

- Entity `shift/` en `src/entities/shift/lib/`:
  - `shift-repository.ts` - Lógica de datos compartida
  - `shift-validation.ts` - Validaciones de negocio
  - `index.ts` - Barrel exports
- Feature `shifts/` en `src/features/shifts/ui/`:
  - `shift-calendar.tsx` - Componente de calendario
  - `shift-form.tsx` - Formulario de creación/edición
  - `shift-filters.tsx` - Sistema de filtros
- Separación clara entre lógica de negocio y UI
- Componentes reutilizables con TypeScript estricto

#### **6. Integración con Shadcn UI**

- Componente `Calendar` agregado al sistema de UI
- Componentes `Checkbox` y `Popover` para formularios
- Estilo consistente con diseño existente
- Soporte completo para temas (dark/light)
- Componentes responsive para todos los dispositivos

#### **7. Calidad y Construcción:**

- `npm run build` ✅ Build exitoso sin errores
- TypeScript strict con tipado completo
- Componentes con validaciones de accesibilidad
- Manejo de errores con mensajes claros
- Loading states en todas las operaciones asíncronas
- **Integración completa con Dashboards existentes** - Sistema listo para producción

---

## 💼 MODELO DE NEGOCIO: LÍMITES DE CUENTAS

### 🎯 Concepto Central

VITA vende **acceso limitado** a su plataforma según el número de cuentas que cada organización necesite. Existen 3 tipos de cuentas:

### 📋 Tipos de Cuentas

#### 1. **Admin HR (Recursos Humanos)** 🆓

- **Rol:** `ADMIN_HR`
- **¿Qué hacen?** Administran turnos, NO trabajan turnos
- **Características:**
  - Crean y asignan turnos al personal
  - Gestionan horarios y personal
  - Ven reportes y estadísticas
  - **NO aparecen en el calendario como trabajadores**
- **Límite:** `maxAdminHR` (default: 5, hasta 50)
- **Costo:** **GRATIS** (incluidas en cualquier plan)
- **Ejemplo:** Jefa de RRHH del hospital

#### 2. **Jefes de Área** 💼

- **Rol:** `CHIEF_AREA`
- **¿Qué hacen?** Crean/asignan turnos Y pueden trabajarlos
- **Características:**
  - Todas las capacidades de Admin HR
  - **ADEMÁS pueden ser asignados a trabajar turnos**
  - Gestionan su área específica (ej: Enfermería, Urgencias)
  - Aparecen en el calendario si trabajan turnos
- **Límite:** `maxChiefs` (default: 10, hasta 100)
- **Costo:** **$$** (parte del plan, costo por cuenta)
- **Ejemplo:** Jefe de Enfermería que también trabaja turnos de noche

#### 3. **Personal Médico / Staff** 🏥

- **Rol:** `STAFF_HEALTH`
- **¿Qué hacen?** SOLO trabajan turnos asignados
- **Características:**
  - Ven sus turnos asignados
  - Acceden al calendario de su área
  - No crean ni asignan turnos
  - Solo lectura de información
- **Límite:** `maxStaff` (default: 50, hasta 1000)
- **Costo:** **$** (más económico que jefes)
- **Ejemplo:** Enfermera, médico residente, técnico

### 💰 Modelo de Pricing

```
┌─────────────────────────────────────────────────────────────┐
│  VITA - Estructura de Precios                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Plan BÁSICO                                                 │
│  ├─ 5 Admin HR (gratis)                                     │
│  ├─ Hasta 10 Jefes                                          │
│  ├─ Hasta 50 Staff                                          │
│  └─ $28,600 CLP/mes                                         │
│                                                              │
│  Plan PRO                                                    │
│  ├─ 10 Admin HR (gratis)                                    │
│  ├─ Hasta 30 Jefes                                          │
│  ├─ Hasta 200 Staff                                         │
│  └─ Precio customizado                                      │
│                                                              │
│  Plan ENTERPRISE                                             │
│  ├─ Admin HR ilimitados (o customizado)                     │
│  ├─ Jefes customizados                                      │
│  ├─ Staff customizado                                       │
│  └─ Precio customizado                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Flujo de Upgrade

Cuando una organización alcanza el límite:

1. **Alerta automática** en dashboard (FASE futura)
2. **Bloqueo suave:** No pueden agregar más usuarios
3. **Opción de upgrade:** Contactar a VITA o auto-upgrade (FASE futura)

### 📊 Campos en Base de Datos

```typescript
Organization {
  maxAdminHR: 5      // Límite de cuentas ADMIN_HR (gratis)
  maxChiefs: 10      // Límite de jefes (pagadas)
  maxStaff: 50       // Límite de staff (pagadas)
}
```

### ✅ Validación Implementada

- ✅ **Schema Zod:** Validación de rangos (0-50 Admin, 0-100 Chiefs, 0-1000 Staff)
- ✅ **UI Form:** 3 inputs numéricos en grid responsive
- ✅ **Base de datos:** Campos existentes desde el schema original
- ✅ **Traducciones:** ES/EN para todos los campos

### 🚀 Próximos Pasos para Límites

- [ ] **Validación en tiempo real:** Al agregar usuarios, verificar límites
- [ ] **Contador en Dashboard:** Mostrar "X/Y usuarios usados"
- [ ] **Alertas proactivas:** Notificar cuando se acerquen al límite
- [ ] **Vista de detalles:** Mostrar límites en la página de detalles de org
- [ ] **Actualización de límites:** Formulario de edición de organización

---

## 🔮 FUTURAS MEJORAS (Modelo de Negocio y Producto)

**Nota:** FASE 0 (Investigación Rflex) permanece pendiente y se ejecutará cuando corresponda.

### Aclaraciones de Modelo

1. **Pool vs pago por activos:** Definir explícitamente si `maxStaff`/`maxChiefs` son techo de contratación (pool redistribuible) o límite hard por tipo. Documentar qué se factura mes a mes.
2. **Staff multi-organización:** Definir flujo de cambio de organización activa en sesión y si se factura por organización o consolidado.
3. **Tipos de turno:** ADMIN_HR crea tipos globales (isGlobal=true). CHIEF_AREA puede crear tipos para una o varias de sus áreas (isGlobal=false); al crearlos selecciona área(s) destino.
4. **Gestión de Personal (`/dashboard/staff`):** Página compartida ADMIN_HR y CHIEF. ADMIN_HR ve todo (staff + jefes) y puede cambiar área a cualquiera. CHIEF solo ve staff de sus áreas y solo puede cambiar área al staff (no a jefes). Solo ADMIN_HR asigna/cambia áreas de jefes. Invitaciones: solo ADMIN_HR.

### Producto y Métricas

4. **Aha moment:** Definir un solo momento clave (ej: "veo mis turnos en un solo lugar", "liquidación automática", "intercambio sin llamar") para priorizar UX.
5. **Métricas tempranas:** Definir 2-3 métricas (turnos/semana, intercambios aprobados/mes, tiempo ahorrado en tareo) para caso de estudio y ajuste de producto.

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS (Enero 8, 2026)

### 1. Completar CRUD de Organizaciones (Funcionalidad Restante) ⏳

- [x] **Helper de Identificadores Fiscales por País** ✅ **COMPLETADO (7 ene)**
  - [x] Configuración dinámica (labels, placeholders, validaciones)
  - [x] Formateo automático en tiempo real
  - [x] Validación con dígito verificador (RUT, CUIT, NIT)
  - [x] Integración en formulario de creación
- [x] **Tabla de Organizaciones Mejorada** ✅ **COMPLETADO (7 ene)**
  - [x] Columna "Límites de Usuarios" con desglose por rol
  - [x] Contador "X/Y" (actuales / máximo) para cada tipo de cuenta
  - [x] Query optimizada con conteo de usuarios por rol
- [x] **Sistema de Traducciones Completo** ✅ **COMPLETADO (7 ene noche)**
  - [x] Todas las keys de traducción agregadas (ES/EN)
  - [x] Dashboard de organizaciones 100% traducido
  - [x] Sin errores de traducción en consola
- [x] **Optimizaciones de Performance** ✅ **COMPLETADO (7 ene noche)**
  - [x] Componentes ThemeToggle y LanguageSelector optimizados
  - [x] Eliminados warnings de React Hooks
  - [x] Mejor manejo de hidratación SSR/CSR
- [x] **Edición de Organizaciones** ✅ **COMPLETADO (8 ene)**
  - [x] Implementar página de edición (`/organizations/[id]/edit`)
  - [x] Formulario prellenado con datos actuales
  - [x] Permitir actualizar límites de cuentas
  - [x] Validar que límites no sean menores a usuarios actuales
  - [x] Botón de editar directo en tabla
  - [x] Server Action con validaciones robustas
- [ ] **Vista de Detalles - Mejoras:**
  - [ ] Mostrar límites de cuentas en tarjetas visuales
  - [ ] Badges de advertencia cuando se acerquen al límite (80%, 100%)
  - [ ] Gráfico de uso de cuentas por rol (opcional)
  - [ ] Mostrar contador de usuarios activos por rol en tiempo real
  - [ ] Usar helper de tax-id dinámico en edición
  - [ ] Server Action `updateOrganizationAction` (ya existe helper)
- [x] **Acciones de Gestión:** ✅ **COMPLETADO (8 ene noche)**
  - [x] Diálogos de confirmación con AlertDialog (Shadcn UI)
  - [x] Cambiar estado (Suspender/Reactivar) con diálogos personalizados
  - [x] Eliminar organización (soft delete) con input de razón
  - [x] Reemplazo completo de window.confirm y window.prompt
  - [x] Validación de razón de eliminación (mínimo 10 caracteres)
  - [x] Traducciones completas para todos los diálogos
- [ ] **Validación de Límites en Runtime:**
  - [ ] Al agregar usuario, verificar que no exceda límites
  - [ ] Mensaje de error claro cuando se alcance el límite
  - [ ] Sugerencia de upgrade automático
- [ ] **Testing manual completo de todo el flujo CRUD:**
  - [ ] Crear organización con diferentes países y planes
  - [ ] Editar organización (cambiar límites, RUT, país)
  - [ ] Probar acciones: Suspender, Reactivar, Eliminar
  - [ ] Verificar validaciones de límites vs usuarios actuales
  - [ ] Probar en ambos idiomas (ES/EN)
  - [ ] Verificar responsive design en mobile

### 2. Siguientes Pasos Sugeridos (Post-CRUD Organizations)

**Prioridad Alta:**

- [ ] **Dashboard ADMIN_HR:**
  - [ ] Layout y Sidebar específico para ADMIN_HR
  - [ ] Protección de rutas con `requireAdminHR()`
  - [ ] Dashboard principal con métricas básicas
  - [ ] Gestión de Áreas (CRUD completo)
  - [ ] Gestión de Tipos de Turno
  - [ ] Gestión de Personal (Staff)
  - [ ] Gestión de Tarifas

**Prioridad Media:**

- [ ] **Sistema de Pagos:**
  - [ ] Integración con pasarela de pagos (Stripe/PayPal)
  - [ ] Registro manual de pagos desde SUPER_ADMIN
  - [ ] Historial de pagos por organización
  - [ ] Notificaciones de pagos próximos
  - [ ] Facturación automática

- [ ] **Analytics y Reportes:**
  - [ ] Dashboard de analytics para SUPER_ADMIN
  - [ ] Métricas de uso por organización
  - [ ] Reportes de ingresos
  - [ ] Gráficos de crecimiento

**Prioridad Baja:**

- [ ] **Mejoras en UX:**
  - [ ] Skeleton loaders para mejor UX
  - [ ] Optimistic updates en acciones
  - [ ] Notificaciones toast más informativas
  - [ ] Confirmaciones de éxito más visuales

---

## 📚 LECCIONES APRENDIDAS Y MEJORES PRÁCTICAS

### Optimización de Componentes React con Next.js

**Problema:** Warnings de hydration y re-renders innecesarios

- ❌ **Anti-pattern:** Usar `useEffect` + `setState` para setear estado en el montaje inicial
- ❌ **Anti-pattern:** Retornar `null` durante el primer render (causa hydration mismatch)
- ✅ **Solución:** Usar `suppressHydrationWarning` en elementos que cambian dinámicamente
- ✅ **Solución:** Usar `resolvedTheme` en lugar de `theme` para evitar undefined inicial

**React Hook Form:**

- ❌ **Anti-pattern:** Usar `watch()` causa warnings del React Compiler
- ✅ **Solución:** Usar `useWatch()` para suscribirse a campos específicos
- ✅ **Buena práctica:** Pasar `control` explícitamente a `useWatch` para mejor performance

**Integración de onChange custom con register():**

- ❌ **Problema:** `onChange` personalizado sobrescribe el del `register()`
- ✅ **Solución:** Usar el patrón `{...register('field', { onChange: (e) => {...} })}`
- ✅ **Alternativa:** Usar `setValue()` dentro del onChange custom

### Sistema de Traducciones con next-intl

**Problema:** Errores de keys faltantes o estructura incorrecta

- ❌ **Error común:** Key existe como objeto pero se usa como string (`t('actions')` cuando `actions: { view: '...', edit: '...' }`)
- ✅ **Solución:** Usar path completo `t('table.actions')` o crear key directa si es necesario
- ✅ **Buena práctica:** Keys directas para valores simples, objetos para agrupación lógica
- ✅ **Tip:** Mantener estructura consistente entre `es.json` y `en.json`

### Arquitectura Feature-Sliced Design

**Organización de tipos:**

- ✅ **Tipos locales:** Interfaces usadas en un solo archivo → declarar inline
- ✅ **Tipos de feature:** Compartidos en la feature → `features/[name]/lib/types.ts`
- ✅ **Tipos compartidos:** Usados por múltiples features → `shared/lib/types/`
- ✅ **Public API:** Siempre exportar tipos necesarios en `index.ts`

**Server vs Client Components:**

- ✅ **Pages:** Siempre Server Components (sin `'use client'`)
- ✅ **UI interactivo:** Client Components con `'use client'`
- ✅ **Data fetching:** En Server Components, pasar data como props
- ✅ **Server Actions:** En `features/*/api/` con `'use server'`

**Sistema de Colores y Temas:**

- ✅ **Variables CSS Semánticas:** Usar `--primary`, `--destructive`, `--muted`, `--accent`, etc.
- ✅ **Colores Hardcodeados Eliminados:** Ya no se usan `text-orange-600`, `text-red-600`, `bg-orange-100`
  - Todos los colores se adaptan automáticamente a temas personalizados
  - Reemplazados por variables semánticas: `text-destructive`, `text-muted-foreground`, `text-primary`
- ✅ **Clases Tailwind Semánticas:** Usar `text-destructive`, `bg-primary`, `text-muted-foreground`, `bg-muted`
- ✅ **Mapeo de Colores:**
  - Warnings/Advertencias (orange) → `text-muted-foreground`, `bg-muted`
  - Errores/Destructivos (red) → `text-destructive`, `bg-destructive/10`
  - Éxito/Positivos (green) → `text-primary`, `bg-primary/10`

### Diálogos de Confirmación y AlertDialogs

**Problema:** Uso de `window.confirm` y `window.prompt` rompe la consistencia de UI

- ❌ **Anti-pattern:** Usar `window.confirm()` y `window.prompt()` nativos del navegador
- ❌ **Problema:** No son accesibles, no se pueden estilizar, rompen el flujo de la app
- ✅ **Solución:** Usar AlertDialog de Shadcn UI (basado en Radix UI)
- ✅ **Ventajas:**
  - Consistente con el design system
  - Accesible (ARIA attributes)
  - Personalizable (colores, variantes, contenido)
  - Mejor UX (puede incluir inputs, validaciones, etc.)
- ✅ **Buena práctica:** Para acciones destructivas, incluir input de confirmación (ej: razón de eliminación)
- ✅ **Validación:** Validar inputs dentro del diálogo antes de habilitar el botón de acción

### Eliminación de Magic Strings y Uso de Constantes

**Problema:** Magic strings hardcodeados causan errores de tipeo y dificultan el mantenimiento

- ❌ **Anti-pattern:** Usar strings hardcodeados como `'CHIEF_AREA'`, `'PENDING'`, `'ADMIN_HR'`
- ❌ **Problema:**
  - Errores de tipeo no detectados por TypeScript
  - Refactoring difícil (buscar/reemplazar manual)
  - Sin autocompletado en IDEs
  - Inconsistencias entre archivos
- ✅ **Solución:** Crear constantes tipadas en `src/shared/lib/constants/`
  - `roles.ts`: `ROLES.SUPER_ADMIN`, `ROLES.ADMIN_HR`, `ROLES.CHIEF_AREA`, `ROLES.STAFF_HEALTH`
  - `invitation-status.ts`: `INVITATION_STATUS.PENDING`, `INVITATION_STATUS.ACCEPTED`, etc.
  - Exportar desde `constants/index.ts` para barrel exports
- ✅ **Ventajas:**
  - Type safety: TypeScript detecta errores de tipeo
  - Refactoring seguro: renombrar constante actualiza todos los usos
  - Autocompletado en IDEs
  - Código más mantenible y menos propenso a errores
  - Mejor documentación implícita (constantes documentan valores válidos)
- ✅ **Buena práctica:**
  - Constantes para valores de enums de Prisma (Roles, InvitationStatus, etc.)
  - Usar `as const` para inferencia de tipos más estricta
  - Tipar las constantes con los tipos de Prisma (`as Role`, `as InvitationStatus`)
  - Agrupar constantes relacionadas en archivos separados (`roles.ts`, `invitation-status.ts`)

### Organización de Componentes UI según Atomic Design

**Problema:** Mezclar componentes básicos de shadcn/ui con componentes complejos propios

- ❌ **Anti-pattern:** Colocar todos los componentes en `src/shared/ui/` sin organización
- ❌ **Problema:**
  - Difícil distinguir componentes de shadcn/ui vs componentes propios
  - Mezcla de niveles de complejidad (atoms con molecules)
  - Escalabilidad limitada
- ✅ **Solución:** Organizar según principios de Atomic Design:
  - `ui/` - Componentes básicos de shadcn/ui (atoms: `button.tsx`, `input.tsx`, `card.tsx`)
  - `ui/atoms/` - Componentes atómicos propios (`button-skeleton.tsx`, `theme-selector.tsx`)
  - `ui/icons/` - Iconos (`google-icon.tsx`, etc.)
  - `ui/molecules/` - Componentes que combinan múltiples atoms (`invitations-table-base.tsx`, `invite-user-form-base.tsx`)
  - (Futuro: `ui/organisms/` - Componentes aún más complejos)
- ✅ **Ventajas:**
  - Separación clara entre componentes de shadcn/ui y propios
  - Escalabilidad mejorada (fácil agregar más niveles)
  - Mejor mantenibilidad (cada carpeta tiene un propósito claro)
  - Sigue principios establecidos de Atomic Design
- ✅ **Buena práctica:**
  - Barrel exports (`index.ts`) para facilitar imports
  - Componentes base reutilizables en `molecules/` o `organisms/`
  - Feature-specific components en `features/*/ui/` usando componentes base

---

### 2. SUPER_ADMIN: Páginas Secundarias (Prioridad Media)

- [ ] **Payments:** Gestión de pagos de organizaciones
  - Tabla de pagos (fecha, org, monto, estado)
  - Registrar pago manual
  - Filtros por estado y organización
  - Integración con webhook de Stripe (futuro)
- [ ] **Analytics:** Dashboard de analíticas avanzadas
  - Gráficos de crecimiento de organizaciones
  - Métricas de uso del sistema
  - Reportes de ingresos mensuales/anuales
  - Gráficos de crecimiento (Chart.js o Recharts)
  - Métricas de uso por organización
  - Reportes exportables

### 3. Sistema de Gestión de Usuarios (ADMIN_HR)

- [x] **Vista de Organización:** Página `/dashboard/admin-hr/organization` con estadísticas
  - Muestra límites y usuarios activos por rol
  - Invitaciones pendientes por tipo (jefes/staff)
  - Estado de la organización
- [x] **Base de Sistema de Invitaciones:** Repositorios y server actions implementados
  - Búsqueda de usuarios por RUT o email
  - Invitaciones para jefes (CHIEF_AREA) y staff (STAFF_HEALTH)
  - Validación de límites por rol
- [ ] **Página de Invitaciones:** `/dashboard/admin-hr/invitations` (UI completa)
  - Formulario para invitar jefes y staff
  - Tabla de invitaciones enviadas
  - Historial de invitaciones
- [ ] CRUD de usuarios dentro de una organización
- [ ] Asignación de roles
- [ ] Códigos de vinculación (para jefes vincular staff)
- [ ] Gestión de estados (activo, inactivo, suspendido)

### 4. Sistema de Áreas y Turnos (Core Business Logic)

- [ ] **Áreas:** CRUD completo
  - Crear áreas (Ej: Emergencia, UCI, Pabellón)
  - Asignar jefes de área
  - Configurar horarios y capacidades
- [ ] **Tipos de Turno:** Configuración flexible
  - Turnos de día/noche/mixtos
  - Duraciones personalizables
  - Reglas de descanso
- [ ] **Asignación de Turnos:**
  - Calendario de turnos
  - Drag & drop para asignación
  - Validaciones de reglas laborales
  - Notificaciones de cambios

### 5. Calendario Público y Privado

- [ ] Vista de calendario mensual/semanal
- [ ] Filtros por área y tipo de turno
- [ ] Exportar a PDF/Excel
- [ ] Sincronización con Google Calendar (opcional)

### 6. Sistema de Notificaciones

- [ ] Notificaciones en app (real-time con websockets o polling)
- [ ] Emails transaccionales (Resend o SendGrid)
- [ ] Push notifications (preparado para Capacitor)

### 7. Testing y Optimización

- [ ] Unit tests para helpers críticos
- [ ] Integration tests para Server Actions
- [ ] E2E tests con Playwright (flujos principales)
- [ ] Performance optimization (Lighthouse score > 90)
- [ ] Accesibilidad (WCAG 2.1 Level AA)

### 8. Preparación para Producción

- [ ] Variables de entorno para producción
- [ ] CI/CD con GitHub Actions
- [ ] Deployment a Vercel
- [ ] Supabase configurado para producción
- [ ] Monitoreo con Sentry
- [ ] Analytics con Google Analytics o Plausible

---

## 📖 ÍNDICE

### 📋 Información General

1. [🎉 Progreso Reciente](#-progreso-reciente-enero-2026)
2. [🎯 ¿Qué es VITA?](#-qué-es-vita)
3. [💰 Modelo de Negocio](#-modelo-de-negocio)
4. [💼 Modelo de Negocio: Límites de Cuentas](#-modelo-de-negocio-límites-de-cuentas)
5. [🎯 Análisis Competitivo](#-análisis-competitivo)
6. [👥 Sistema de Roles](#-sistema-de-roles)
7. [📊 Casos de Uso](#-casos-de-uso)
8. [🗺️ Mapas de Procesos](#️-mapas-de-procesos)

### 🏗️ Arquitectura y Tecnología

10. [🏗️ Stack Tecnológico](#️-stack-tecnológico)
11. [🌍 Internacionalización (i18n)](#-internacionalización-i18n)
12. [💾 Arquitectura de Datos](#-arquitectura-de-datos)
13. [🔑 Características Clave](#-características-clave)
14. [📂 Estructura de Directorios](#-estructura-de-directorios)
15. [📐 Guías de Desarrollo](#-guías-de-desarrollo)
16. [🏛️ Arquitectura de Código y Mejores Prácticas](#️-arquitectura-de-código-y-mejores-prácticas)

### 🎨 Diseño y UX

17. [🎨 Paleta de Colores](#-paleta-de-colores-healthcare-modern-theme)
18. [🖥️ Dashboards por Rol](#️-dashboards-por-rol---especificación-visual)
19. [📱 Adaptación Responsive](#-adaptación-responsive)
20. [🎨 Convenciones de Color por Estado](#-convenciones-de-color-por-estado)
21. [🎨 Diseño y UX](#-diseño-y-ux)

### 📋 Plan de Desarrollo

22. [📋 Plan de Desarrollo Paso a Paso](#-plan-de-desarrollo-paso-a-paso)
23. [🎯 MVP1 Completado](#-mvp1-completado)
24. [🔮 MVP2 - Funcionalidades Avanzadas](#-mvp2---funcionalidades-avanzadas)
25. [🎯 Próximos Pasos Inmediatos](#-próximos-pasos-inmediatos-enero-8-2026)
26. [🚀 Próximos Pasos Inmediatos (Enero 2026)](#-próximos-pasos-inmediatos-enero-2026)

### 📚 Referencias y Utilidades

27. [📚 Lecciones Aprendidas y Mejores Prácticas](#-lecciones-aprendidas-y-mejores-prácticas)
28. [📦 Dependencias del Proyecto](#-dependencias-del-proyecto)
29. [🛠️ Comandos Útiles](#️-comandos-útiles)
30. [📱 Preparación para Capacitor (MVP2)](#-preparación-para-capacitor-mvp2)
31. [🔄 Migraciones y Escalabilidad Futura](#-migraciones-y-escalabilidad-futura)
32. [❗ Decisiones Importantes](#-decisiones-importantes)
33. [📚 Referencias](#-referencias)
34. [❌ Cosas que Evitar](#-cosas-que-evitar)
35. [🎯 Próximo Paso Inmediato](#-próximo-paso-inmediato)
36. [❓ Preguntas Pendientes](#-preguntas-pendientes)
37. [📝 Decisiones y Arquitectura Definida](#-decisiones-y-arquitectura-definida)
38. [🔐 SUPER_ADMIN Dashboard - Implementación Completada](#-super_admin-dashboard---implementación-completada-enero-2026)

---

## 🎯 ¿QUÉ ES VITA?

**VITA** es una plataforma SaaS B2B multi-tenant para la gestión integral de turnos médicos en hospitales y clínicas de Chile.

### Problema que Resuelve

**Situación Actual:**

- [ ] Hospitales gestionan turnos en Excel o sistemas legacy
- Falta de visibilidad del personal sobre sus horarios
- [ ] Dificultad para calcular pagos (día/noche, feriados, extras)
- Sistemas biométricos fallan y generan conflictos
- [ ] Personal trabaja en múltiples instituciones sin coordinación
- Intercambios de turnos son manuales y lentos

**Solución VITA:**

- [ ] Calendario digital centralizado para personal y jefes
- Cálculo automático de tarifas según horas trabajadas
- [ ] Validaciones legales (Código del Trabajo de Chile)
- Sistema de vinculación transparente (personal trabaja en múltiples hospitales)
- [ ] Aprobación digital de intercambios de turnos
- Acreditación de asistencia manual + integración biométrica futura
- [ ] App móvil para el personal de salud

---

## 💰 MODELO DE NEGOCIO

### SaaS Multi-Tenant B2B

**Target Principal:** Hospitales y clínicas en Chile

**Cómo Funciona:**

1. **Venta B2B:** Vendemos directamente a hospitales/clínicas, no a usuarios individuales
2. **Cobro Mensual:** Facturación manual según usuarios activos de cada organización
3. **Implementación:** Onboarding asistido + capacitación + soporte
4. **Pricing Flexible:** Cada hospital negocia según sus necesidades específicas

### Modelo de Pricing (B2B Negociado)

**IMPORTANTE:** No hay planes fijos. Cada hospital tiene pricing personalizado.

**Calculadora de Precios (Referencia Pública):**

```
Costo Base: $200 USD/mes
(Incluye: Plataforma + 5 cuentas ADMIN_HR gratis)

+ Personal de Salud (STAFF_HEALTH): $15 USD/mes por persona
+ Jefes de Área (CHIEF_AREA): $40 USD/mes por jefe
```

**Ejemplos de Pricing:**

| Organización         | Staff | Chiefs | HR         | Cálculo                     | Total/Mes      |
| -------------------- | ----- | ------ | ---------- | --------------------------- | -------------- |
| **Clínica Pequeña**  | 30    | 3      | 5 (gratis) | $200 + (30×$15) + (3×$40)   | **$770 USD**   |
| **Hospital Mediano** | 80    | 10     | 5 (gratis) | $200 + (80×$15) + (10×$40)  | **$1,800 USD** |
| **Hospital Grande**  | 200   | 25     | 5 (gratis) | $200 + (200×$15) + (25×$40) | **$4,200 USD** |

**Descuentos por Volumen (Negociables):**

- 100+ cuentas: 10% descuento
- 200+ cuentas: 15% descuento
- Contrato anual: 20% descuento adicional

**Cuentas GRATUITAS:**

- `ADMIN_HR` (Recursos Humanos): **5 cuentas gratis** por organización
- `SUPER_ADMIN` (Equipo VITA): Ilimitadas y gratis

### Pool de Cuentas

**Cómo Funciona:**

1. Hospital contrata X cantidad de cuentas (ej: 50 staff + 8 chiefs)
2. `ADMIN_HR` distribuye límites de vinculación entre jefes
3. Cada `CHIEF_AREA` puede vincular hasta su límite asignado
4. La organización paga por cuentas **activas y vinculadas**

**Ejemplo Práctico:**

```
Hospital Clínico Santiago:
- Contrata: 80 staff + 12 chiefs
- Paga: $200 (base) + $1,200 (staff) + $480 (chiefs) = $1,880 USD/mes

Distribución de límites:
├─ Jefe Enfermería UCI: 25 staff máx
├─ Jefe Médicos Urgencia: 20 staff máx
├─ Jefe Kinesiología: 15 staff máx
├─ Jefe Nutrición: 10 staff máx
└─ Jefe Técnicos Enfermería: 10 staff máx

Recursos Humanos: 5 cuentas (no se cobran)
```

**Facturación:**

- Manual por parte de SUPER_ADMIN
- Registro de pagos en el sistema
- Si no pagan: Alerta en dashboard (NO se suspende automáticamente)
- SUPER_ADMIN decide suspensión manual con razón obligatoria

---

## 🎯 ANÁLISIS COMPETITIVO

### Competidor Principal: Rflex

**Fuente:** https://rflex.io/ (análisis web Nov 2025)

**Estado del Mercado:**

- 🏥 +100 instituciones en Latinoamérica
- 🌎 Presencia: Chile, Perú, Colombia
- 💼 Clientes grandes confirmados:
  - RedSalud Vitacura, Clínica Alemana
  - Bupa, UC Christus, FALP
  - Integramédica, Ciudad del Mar

**Features Confirmados de Rflex:**

| Categoría       | Features                                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| **Gestión**     | Turnos y jornadas, ofertador de turnos, cambio de turnos                            |
| **Asistencia**  | Web, app móvil+GPS, app offline, biometría (integración), tarjeta/pin (integración) |
| **Cálculo**     | Remuneraciones automáticas con reglas de negocio                                    |
| **Validación**  | Pre-liquidación validada por colaboradores                                          |
| **Mobile**      | ✅ App móvil (iOS + Android)                                                        |
| **Integración** | API para cualquier sistema, portabilidad de asistencia                              |

**Resultados según Testimonios:**

- "95% reducción de reprocesos" (RedSalud)
- "De 5 días a 1 día de tareo" (Inmater)
- "Disminución considerable de costos"

**⚠️ INSIGHT CLAVE - Sistema de Asistencia:**

Rflex **NO es dueño** de los sistemas biométricos:

- 👤 Biometría facial y huella = **integración con hardware de terceros**
- 🔢 Tarjeta/Pin = **integración con sistemas existentes del hospital**
- 💰 Hardware biométrico = Costo adicional (~$500-2000 USD por dispositivo)

**🎯 OPORTUNIDAD PARA VITA:**

Rflex depende de hardware caro. VITA puede ofrecer alternativas propias:

- ✅ GPS check-in (app detecta ubicación)
- ✅ QR code scanning
- ✅ Web check-in dedicado
- ✅ Sin hardware adicional = Más económico

**Áreas de Oportunidad para VITA:**

1. **Cobertura Parcial:**
   - Rflex NO está en todas las áreas de los hospitales
   - Kinesiología y Nutrición siguen usando Excel/papel
   - **Estrategia VITA:** Entrar por áreas sin cobertura

2. **Dependencia de Hardware:**
   - Rflex requiere hardware biométrico de terceros (caro)
   - **Ventaja VITA:** Check-in por GPS/QR (MVP3) sin hardware

3. **UX/UI:**
   - ⚠️ Pendiente: Análisis de usabilidad de Rflex
   - **Ventaja VITA:** UI moderna con Next.js 16 + Tailwind v4

4. **Validaciones Legales:**
   - ⚠️ Pendiente: Verificar si Rflex tiene validaciones automáticas
   - **Ventaja VITA:** Validaciones en tiempo real del Código del Trabajo

5. **Flexibilidad de Asistencia:**
   - Rflex ofrece múltiples opciones, pero todas requieren integración o hardware
   - **Ventaja VITA:** Solución integral (software + método de marcaje nativo)

### Propuesta de Valor VITA vs. Rflex

**Para Hospitales que YA usan Rflex:**

```
"VITA complementa Rflex sin reemplazarlo.
Implementamos en áreas donde Rflex no está,
sin romper lo que ya funciona."
```

**Para Hospitales SIN Sistema:**

```
"¿Siguen usando Excel y libros de asistencia?
VITA digitaliza en 1 semana.
Piloto gratis en 1 área, expandes cuando estés listo."
```

### Estrategia Go-to-Market

**Fase 1: Piloto (Mes 1-2)**

- Hospital del director (contacto existente)
- Área: Kinesiología (NO usa Rflex)
- Objetivo: 100% adopción + testimonial
- Costo: $0 (piloto gratis)

**Fase 2: Caso de Estudio (Mes 3)**

- Video testimonial del jefe de Kinesiología
- Métricas: Horas ahorradas, errores reducidos
- "Cómo el Hospital X mejoró gestión de turnos con VITA"

**Fase 3: Expansión Horizontal (Mes 4-6)**

- Mismo hospital, otras áreas sin Rflex
- Nutrición, Técnicos, etc.
- Primera facturación real

**Fase 4: Expansión a Otros Hospitales (Mes 7+)**

- Usar caso de estudio como referencia
- "Si funciona en Hospital X, puede funcionar en el tuyo"
- Target: 3-5 hospitales en primer año

### Tabla Comparativa (Landing Page)

| Feature                    | Rflex                                      | VITA                                    |
| -------------------------- | ------------------------------------------ | --------------------------------------- |
| **Gestión de Turnos**      | ✅ Completo                                | ✅ Completo                             |
| **Ofertador de Turnos**    | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| **Cambio de Turnos**       | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| **App Móvil**              | ✅ iOS + Android                           | ✅ iOS + Android (MVP2 Capacitor)       |
| **Calendario Visual**      | ⚠️ A validar UI                            | ✅ react-big-calendar moderno           |
| **Validaciones Legales**   | ⚠️ A validar                               | ✅ Automáticas en tiempo real           |
| **UI Moderna**             | ⚠️ A validar                               | ✅ Next.js 16 + Tailwind v4 + Dark mode |
| **Sistema de Asistencia:** |                                            |                                         |
| - Web                      | ✅ Sí                                      | ✅ Sí (MVP1: manual, MVP2: automático)  |
| - App móvil + GPS          | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| - App offline              | ✅ Sí                                      | ✅ Sí (Capacitor MVP2)                  |
| - Biometría                | ✅ **Integración** (requiere hardware $$$) | ✅ Webhook API (MVP2)                   |
| - Tarjeta/Pin              | ✅ **Integración** (requiere hardware)     | ✅ Pin propio en app/web (MVP2)         |
| - **GPS check-in nativo**  | ❌ No                                      | ✅ **DIFERENCIADOR** (MVP3)             |
| - **QR code check-in**     | ❌ No confirmado                           | ✅ **DIFERENCIADOR** (MVP3)             |
| **Costo Hardware**         | ⚠️ Biometría = $500-2000 USD/dispositivo   | ✅ **$0** (métodos nativos)             |
| **Integración API**        | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| **Pre-liquidación**        | ✅ Validación colaboradores                | ✅ Validación colaboradores             |
| **Precio Base**            | ⚠️ A investigar                            | Desde $200/mes (sin hardware)           |
| **Expansión LATAM**        | ✅ Chile, Perú, Colombia                   | 🎯 Objetivo MVP2                        |

**✅ Confirmado** | **⚠️ A validar** | **❌ No tiene**

**DIFERENCIADORES CLAVE DE VITA:**

1. 🎯 **GPS Check-in Nativo (MVP3):** Sin hardware, más económico
2. 🎯 **QR Code Scanning (MVP3):** Flexibilidad sin inversión
3. 🎯 **Solución Integral:** Software + métodos de marcaje incluidos
4. 🎯 **Sin Hardware Costoso:** Todo por software

### Preguntas de Investigación Pendientes

**✅ CONFIRMADO (vía web rflex.io):**

1. ✅ App móvil: Sí, iOS + Android
2. ✅ Métodos de marcaje: Web, app+GPS, offline, biometría (integración), tarjeta/pin (integración)
3. ✅ Clientes: +100 instituciones, clientes grandes confirmados
4. ✅ Ofertador y cambio de turnos: Sí
5. ✅ Pre-liquidación con validación: Sí

**🔍 ALTA PRIORIDAD - Investigar ANTES de MVP1:**

1. **Pricing:**
   - ¿Cuánto cobra Rflex mensualmente por usuario?
   - ¿Costos de setup/implementación?
   - ¿Costo de módulos adicionales (biometría, API)?
   - ¿Costo de hardware biométrico?

2. **UX/UI:**
   - ¿Cómo es el calendario visual? (screenshot si es posible)
   - ¿Es intuitivo o complejo de usar?
   - ¿Cómo es la app móvil? (rating en stores)

3. **Pain Points:**
   - ¿Qué 3 cosas odian más los usuarios de Rflex?
   - ¿Qué features faltan o son confusos?
   - ¿Problemas de rendimiento o bugs conocidos?

4. **Adopción:**
   - ¿Por qué Kinesiología y Nutrición NO usan Rflex en el hospital del director?
   - ¿Qué áreas del hospital NO tienen Rflex implementado?
   - ¿Barreras de adopción?

5. **Validaciones Legales:**
   - ¿Rflex tiene validaciones automáticas del Código del Trabajo?
   - ¿Alerta de horas extra excedidas?
   - ¿Control de descansos obligatorios?

6. **Proceso Comercial:**
   - ¿Qué proceso de venta/implementación tiene Rflex?
   - ¿Cuánto demora la implementación?
   - ¿Requiere capacitación presencial?

**📋 TAREAS INMEDIATAS (FASE 0):**

- [ ] **Entrevistar a novia (usuaria Rflex)**
  - Guion de preguntas: Pain points, UI/UX, features faltantes
  - Solicitar screenshots si es posible
  - ¿Por qué algunas áreas no lo usan?

- [ ] **Entrevistar a jefe de Kinesiología**
  - ¿Por qué no usan Rflex?
  - ¿Qué necesitan que Rflex no ofrece?
  - ¿Cuánto paga el hospital por Rflex?

- [ ] **Investigar precios**
  - Contactar comercial de Rflex (como posible cliente)
  - Solicitar cotización de ejemplo
  - Comparar con pricing de VITA

- [ ] **Documentar findings**
  - Actualizar tabla comparativa con datos reales
  - Ajustar propuesta de valor de VITA
  - Definir diferenciadores claros

---

## 👥 SISTEMA DE ROLES

### Jerarquía y Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│ SUPER_ADMIN (Equipo VITA - Ilimitado)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • Crear/editar/suspender organizaciones                 │ │
│ │ • Registrar pagos manualmente                           │ │
│ │ • Ver analytics globales                                │ │
│ │ • Gestionar suspensiones por falta de pago             │ │
│ │ • Soporte técnico                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │
           │ Gestiona
           ▼
┌─────────────────────────────────────────────────────────────┐
│ ORGANIZACIÓN (Hospital/Clínica)                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ADMIN_HR (Recursos Humanos - 5 gratis)            │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ • Crear áreas (Enfermería, Médicos, etc.)     │ │    │
│  │ │ • Crear tipos de turno globales               │ │    │
│  │ │ • Asignar pool de cuentas a cada jefe         │ │    │
│  │ │ • Configurar tarifas por persona              │ │    │
│  │ │ • Ver reportes de toda la organización        │ │    │
│  │ │ • MVP2: Generar liquidaciones                 │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           │ Asigna límites                                  │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ CHIEF_AREA (Jefe de Área - SE COBRA)              │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ • Vincular personal (con aprobación)          │ │    │
│  │ │ • Crear tipos de turno específicos            │ │    │
│  │ │ • Asignar turnos manualmente                  │ │    │
│  │ │ • Crear turnos abiertos                       │ │    │
│  │ │ • Aprobar/rechazar intercambios               │ │    │
│  │ │ • Aprobar/rechazar postulaciones              │ │    │
│  │ │ • Acreditar asistencia manualmente (MVP1)     │ │    │
│  │ │ • Override validaciones legales               │ │    │
│  │ │ • Ver calendario de su equipo                 │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           │ Gestiona                                        │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ STAFF_HEALTH (Personal - SE COBRA)                 │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ Roles: Doctor, Enfermero, Técnico, etc.       │ │    │
│  │ │                                                │ │    │
│  │ │ • Ver calendario unificado (multi-org)        │ │    │
│  │ │ • Aprobar/rechazar vinculaciones              │ │    │
│  │ │ • Postular a turnos abiertos                  │ │    │
│  │ │ • Solicitar intercambios                      │ │    │
│  │ │ • Recibir notificaciones                      │ │    │
│  │ │ • Alertas de conflictos de horarios           │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Detalles por Rol

#### SUPER_ADMIN

**Scope:** Global (todas las organizaciones)

**Funcionalidades:**

- [ ] Dashboard con métricas: organizaciones activas, ingresos, usuarios totales
- CRUD de organizaciones
- [ ] Registro manual de pagos
- Suspensión/reactivación de organizaciones (con razón obligatoria)
- [ ] Historial de pagos y eventos de cada organización

**NO puede:**

- [ ] Ver datos internos de turnos de una organización (privacidad)
- Crear usuarios dentro de organizaciones

---

#### ADMIN_HR (Recursos Humanos)

**Scope:** Una organización específica

**Funcionalidades:**

- [ ] **Áreas:** Crear áreas (Enfermería UCI, Médicos Urgencia, etc.)
- **Tipos de Turno:** Crear tipos globales disponibles para todos los jefes
- [ ] **Gestión de Personal:** Página `/dashboard/staff` - Ver todo el personal (staff y jefes), asignar/cambiar área a staff y a jefes. Solo ADMIN_HR cambia áreas de jefes.
- [ ] **Pool de Cuentas:** Asignar límites a cada `CHIEF_AREA` (ej: Jefe Enfermería puede vincular 20 personas)
- **Tarifas:** Configurar tarifa por persona (día/noche, bonos, multiplicadores)
- [ ] **Reportes:** Ver resumen de turnos y horas trabajadas (MVP2: liquidaciones PDF)

**Ejemplo de Tarifa:**

```typescript
{
  userId: "staff-123",
  dayHourlyRate: 8000,        // CLP por hora de día
  nightHourlyRate: 10000,     // CLP por hora de noche
  weekendMultiplier: 1.5,     // x1.5 fin de semana
  holidayMultiplier: 2.0,     // x2 feriado normal
  mandatoryHolidayMultiplier: 2.5,  // x2.5 feriado irrenunciable
  extraBonus: 50000,          // Bono fijo por turno extra
  validFrom: "2024-01-01",
  validUntil: "2024-12-31"
}
```

**NO puede:**

- [ ] Asignar turnos directamente
- Ver calendario detallado del personal (eso es del jefe)

---

#### CHIEF_AREA (Jefe de Área)

**Scope:** Su área específica (ej: Enfermería UCI)

**Funcionalidades Principales:**

**1. Vinculación de Personal:**

- [ ] Ingresa código de vinculación del personal
- Sistema envía notificación al personal
- [ ] Personal aprueba → Se agrega al equipo
- Puede desvincular fácilmente

**2. Gestión de Personal:**

- [ ] Página `/dashboard/staff` - Ve solo staff de sus áreas (vía UserArea). Puede asignar/cambiar área al staff. No puede cambiar áreas de jefes (solo ADMIN_HR).

**3. Tipos de Turno:**

- [ ] Usa tipos globales (creados por HR)
- [ ] Crea tipos específicos para una o varias de sus áreas (isGlobal=false)
- [ ] Configura: nombre, duración, clasificación (día/noche), color, mín/máx personal

**4. Asignación de Turnos:**

- [ ] **Manual:** Arrastra y asigna a persona específica
- **Abierto:** Crea turno sin asignar, personal postula, jefe elige
- [ ] Calendario mensual/semanal de su equipo

**5. Aprobaciones:**

- [ ] Intercambios entre personal
- Postulaciones a turnos abiertos
- [ ] Override de validaciones legales (con justificación)

**6. Asistencia (MVP1):**

- [ ] Acreditar manualmente que personal llegó
- Sistema alerta si no hay check-in 30 min después

**NO puede:**

- [ ] Ver turnos de otras áreas
- Modificar tarifas
- [ ] Crear cuentas de otros jefes

---

#### STAFF_HEALTH (Personal de Salud)

**Scope:** Multi-organización (puede trabajar en varios hospitales)

**Características Únicas:**

- [ ] **Código de Vinculación:** Al crear cuenta obtiene código único (ej: `PERS-2024-001234`)
- **Calendario Unificado:** Ve turnos de TODAS las organizaciones donde trabaja
- [ ] **Alertas de Conflicto:** Si tiene turnos superpuestos en distintos hospitales

**Funcionalidades:**

**1. Vinculaciones:**

- [ ] Recibe solicitud de vinculación
- Ve: Hospital, Área, Jefe que solicita
- [ ] Aprueba o rechaza

**2. Turnos:**

- [ ] Ve calendario mensual con todos sus turnos
- Filtra por organización
- [ ] Badges: `Largo Día`, `Noche`, `Extra`, `Feriado`

**3. Postulaciones:**

- [ ] Ve turnos abiertos de sus áreas
- Postula con mensaje opcional
- [ ] Recibe notificación si es seleccionado

**4. Intercambios:**

- [ ] Solicita intercambio a compañero
- Compañero acepta → Jefe aprueba
- [ ] Ambos reciben notificaciones

**5. Notificaciones:**

- [ ] Turno asignado
- Turno intercambiado
- [ ] Recordatorio 24h antes
- Confirmación de asistencia

**NO puede:**

- [ ] Ver turnos de otros compañeros (solo los suyos)
- Modificar turnos asignados (solo intercambiar)

---

## 📊 CASOS DE USO

### Caso 1: Hospital Contrata VITA

**Actores:** SUPER_ADMIN, Hospital

**Flujo:**

1. Hospital contacta a VITA
2. SUPER_ADMIN crea organización: "Hospital Central"
3. Hospital elige plan: PRO (200 cuentas)
4. SUPER_ADMIN registra primer pago
5. Hospital recibe credenciales de 1 cuenta `ADMIN_HR` inicial

**Resultado:** Hospital tiene acceso al dashboard

---

### Caso 2: Recursos Humanos Configura el Sistema

**Actores:** ADMIN_HR

**Flujo:**

1. ADMIN_HR ingresa al dashboard
2. Crea áreas:
   - Enfermería UCI (necesita 25 personas)
   - Médicos Urgencia (necesita 15 personas)
   - Kinesiología (necesita 10 personas)
3. Crea tipos de turno globales:
   - `Largo Día`: 12 horas, día
   - `Noche`: 8 horas, noche
   - `Extra`: 6 horas, día
4. Crea cuentas de jefes:
   - Jefe Enfermería UCI → Asigna 25 cuentas
   - Jefe Médicos Urgencia → Asigna 15 cuentas
   - Jefe Kinesiología → Asigna 10 cuentas
5. Configura tarifas de cada persona (lo hace después de vincular)

**Resultado:** Sistema listo para que jefes vinculen personal

---

### Caso 3: Jefe Vincula Personal

**Actores:** CHIEF_AREA, STAFF_HEALTH

**Flujo:**

1. Personal (ej: Enfermera María) crea cuenta en VITA
2. Sistema genera código: `PERS-2024-001234`
3. María da código a su jefe
4. Jefe ingresa código en "Vincular Personal"
5. Sistema muestra: "María González - Enfermera - RUT 12.345.678-9"
6. Jefe confirma vinculación
7. María recibe notificación: "Jefe Juan Pérez te invitó a Enfermería UCI - Hospital Central"
8. María aprueba
9. María aparece en lista de personal del jefe

**Resultado:** María puede ser asignada a turnos

---

### Caso 4: Jefe Asigna Turno Manual

**Actores:** CHIEF_AREA, STAFF_HEALTH

**Flujo:**

1. Jefe abre calendario mensual
2. Hace clic en día 15 de diciembre
3. Selecciona tipo: `Largo Día` (12 horas)
4. Selecciona horario: 08:00 - 20:00
5. Busca personal: "María González"
6. Sistema valida:
   - ✅ María no tiene otro turno ese día
   - ✅ María no excede 48 horas semanales
   - ✅ María tiene 12 horas de descanso desde último turno
7. Jefe confirma
8. María recibe notificación: "Turno asignado: 15 dic - Largo Día 08:00-20:00"

**Resultado:** Turno en calendario de María y del jefe

---

### Caso 5: Jefe Crea Turno Abierto

**Actores:** CHIEF_AREA, STAFF_HEALTH (varios)

**Flujo:**

1. Jefe necesita cubrir turno extra 20 de diciembre
2. Crea turno abierto: `Extra` - 14:00-20:00
3. Todo el equipo recibe notificación: "Turno disponible para postular"
4. María postula: "Puedo hacerlo, necesito horas extras"
5. Pedro postula: "Disponible"
6. Jefe ve lista de postulaciones
7. Jefe selecciona a María
8. María recibe: "Fuiste seleccionada para turno 20 dic"
9. Pedro recibe: "Turno fue asignado a otro compañero"

**Resultado:** Turno cubierto con personal motivado

---

### Caso 6: Personal Solicita Intercambio

**Actores:** STAFF_HEALTH (2), CHIEF_AREA

**Flujo:**

1. María tiene turno 25 dic pero necesita el día libre
2. María abre app → "Solicitar intercambio"
3. Selecciona turno: 25 dic - Largo Día
4. Ve lista de compañeros con turnos compatibles
5. Selecciona a Pedro (tiene turno 28 dic)
6. Pedro recibe notificación: "María quiere intercambiar 25 dic por tu 28 dic"
7. Pedro acepta
8. Jefe recibe solicitud pendiente
9. Jefe revisa y aprueba
10. Ambos reciben confirmación

**Resultado:** Turnos intercambiados, todos felices

---

### Caso 7: Validación Legal Activada

**Actores:** CHIEF_AREA

**Flujo:**

1. Jefe intenta asignar turno a María
2. María ya trabajó: Lun 12h, Mar 12h, Mié 12h, Jue 12h = 48 horas
3. Jefe intenta asignar Vie 12h
4. Sistema alerta: "❌ Excede 48 horas semanales (Código del Trabajo)"
5. Jefe tiene 2 opciones:
   - Cancelar asignación
   - Override con justificación: "Emergencia COVID, personal insuficiente"
6. Si hace override → Queda registrado

**Resultado:** Protección legal + flexibilidad con trazabilidad

---

### Caso 8: Acreditación de Asistencia (MVP1 - Manual)

**Actores:** CHIEF_AREA, STAFF_HEALTH

**Flujo:**

1. María tiene turno 10 dic 08:00-20:00
2. María llega al hospital 07:55
3. Jefe abre dashboard: "Asistencia Hoy"
4. Ve: "María González - Turno 08:00 - Sin check-in"
5. Jefe marca: "Acreditar llegada"
6. María recibe notificación: "Llegada acreditada por Jefe Juan - 07:58"
7. A las 08:30, si no hay check-in, sistema alerta a jefe

**Resultado:** Asistencia registrada y notificada

---

## 🗺️ MAPAS DE PROCESOS

### Proceso: Flujo de Vinculación de Personal

```
[STAFF crea cuenta] → [Sistema genera código PERS-XXXX]
         │
         ▼
[STAFF da código a CHIEF] → [CHIEF ingresa código]
         │
         ▼
[Sistema valida código] → [Muestra datos del STAFF]
         │
         ▼
[CHIEF confirma vinculación]
         │
         ▼
[STAFF recibe notificación]
         │
         ├─→ [STAFF acepta] → [Vinculación activa]
         │
         └─→ [STAFF rechaza] → [Vinculación cancelada]
```

---

### Proceso: Flujo de Asignación de Turno

```
[CHIEF abre calendario] → [Selecciona fecha]
         │
         ▼
[Selecciona tipo de turno] → [Define horario]
         │
         ▼
[Selecciona personal]
         │
         ▼
[Sistema valida]:
  ├─→ Conflictos de horario
  ├─→ 48 horas semanales
  ├─→ Descanso mínimo 12h
  └─→ Personal suficiente
         │
         ├─→ [✅ Válido] → [Turno asignado] → [STAFF notificado]
         │
         └─→ [❌ Inválido] → [Muestra error] → [CHIEF puede override]
```

---

### Proceso: Flujo de Intercambio de Turnos

```
[STAFF A solicita intercambio] → [Selecciona turno propio]
         │
         ▼
[Selecciona STAFF B] → [STAFF B recibe notificación]
         │
         ├─→ [STAFF B rechaza] → [Fin]
         │
         └─→ [STAFF B acepta]
                  │
                  ▼
         [CHIEF recibe solicitud]
                  │
                  ├─→ [CHIEF rechaza] → [Ambos notificados]
                  │
                  └─→ [CHIEF aprueba]
                           │
                           ▼
                  [Turnos intercambiados]
                           │
                           ▼
                  [Ambos notificados]
```

---

### Proceso: Flujo de Turno Abierto

```
[CHIEF crea turno abierto] → [Define tipo y horario]
         │
         ▼
[Todo el equipo notificado]
         │
         ▼
[Múltiples STAFF postulan]
         │
         ▼
[CHIEF ve lista de postulaciones]
         │
         ▼
[CHIEF selecciona un STAFF]
         │
         ├─→ [STAFF seleccionado notificado] → [Turno asignado]
         │
         └─→ [Otros STAFF notificados] → [Turno fue asignado a otro]
```

---

### Proceso: Flujo de Pago (SUPER_ADMIN)

```
[Hospital paga] → [Envía comprobante]
         │
         ▼
[SUPER_ADMIN registra pago]
  ├─→ Monto
  ├─→ Fecha
  ├─→ Método
  └─→ Próximo vencimiento
         │
         ▼
[Sistema actualiza estado] → [Organización: Activa]
         │
         ▼
[Dashboard muestra próximo pago]
```

---

### Proceso: Flujo de Suspensión

```
[Hospital no paga]
         │
         ▼
[Dashboard SUPER_ADMIN: ⚠️ DEUDA]
         │
         ▼
[SUPER_ADMIN decide suspender]
         │
         ▼
[Ingresa razón obligatoria: "Falta de pago - 60 días"]
         │
         ▼
[Organización suspendida]
  ├─→ ADMIN_HR no puede acceder
  ├─→ CHIEF no puede acceder
  └─→ STAFF ve mensaje: "Tu hospital suspendió el servicio"
         │
         ▼
[Hospital paga] → [SUPER_ADMIN reactiva] → [Acceso restaurado]
```

---

## 🏗️ STACK TECNOLÓGICO

### Frontend

- [ ] **Framework:** Next.js 16.0.3 (App Router)
- **React:** 19.2.0 (Server Components + Client Components)
- [ ] **TypeScript:** 5+ (Strict mode)
- **Estilos:** Tailwind CSS v4 con dark mode
- [ ] **UI:** shadcn/ui v2
- **Temas:** next-themes (requerido para dark mode)
- [ ] **Iconos:** lucide-react (instalado automáticamente por shadcn)
- **Notificaciones:** sonner (toast notifications)
- [ ] **Calendario:** react-big-calendar + date-fns (localización español)
- **Fechas:** date-fns-tz (manejo de timezone Chile con horario de verano)

### Backend

- [ ] **Patrón Principal:** Server Actions (no API Routes tradicionales salvo webhooks)
- **ORM:** Prisma ORM
- [ ] **Base de Datos:** PostgreSQL (Supabase)
- **Auth:** Auth.js v5 beta (configurado con JWT strategy)
- [ ] **Validación:** Zod (schemas + RUT chileno)
- **Hashing:** bcryptjs
- [ ] **Emails:** Resend (FASE 8)
- **Rate Limiting:** @upstash/ratelimit con Redis (protección anti-spam)
- [ ] **Storage:** Supabase Storage (fotos de perfil MVP1, PDFs liquidaciones MVP2)

### Estado

- [ ] **UI Local:** Zustand (sidebar, modales, filtros, preferencias de usuario)
- **Server State:** Server Components + Server Actions como patrón principal
  - [ ] **MVP1:** Server Actions + useState (simple, directo)
  - **React Query:** Opcional solo si setState en múltiples componentes se vuelve engorroso
  - [ ] Evaluar necesidad real durante desarrollo
- [ ] **Formularios:** FormData nativo con Server Actions (sin react-hook-form)

### Mobile

**Estrategia Mobile:**

- [ ] **MVP1:** Web responsive (mobile, tablet, desktop)
  - [ ] STAFF usa en navegador mobile
  - [ ] CHIEF y HR usan en desktop
  - [ ] Sin instalación, acceso directo desde navegador
- [ ] **MVP2:** Capacitor.js SOLO para STAFF (app nativa iOS/Android)
  - [ ] Reutiliza código web existente
  - [ ] APIs nativas (notificaciones push, geolocalización)
  - [ ] CHIEF y HR siguen usando web

**Razones de esta estrategia:**

- Web responsive cubre todas las necesidades del MVP1
- Capacitor solo cuando realmente se necesiten features nativos
- Enfoque en features core primero
- Evita complejidad innecesaria en fase inicial

### Observability

- [ ] **Error Tracking:** Sentry free tier desde MVP1 (5K eventos/mes)
  - [ ] Captura errores de Server Actions
  - [ ] Stack traces con contexto (userId, organizationId)
  - [ ] Alertas por email cuando hay errores críticos
- [ ] **Error Boundaries:** React Error Boundaries en cada sección
- **Health Checks:** Endpoint `/api/health` monitoreado por UptimeRobot (gratis)
- [ ] **Logging Estructurado:** Pino con rotación de logs (MVP2)

### Despliegue

**DECISIÓN IMPORTANTE:** No usaremos Vercel. Usaremos VPS + Docker.

- [ ] **Hosting:** VPS (DigitalOcean/Hetzner/AWS Lightsail) + Dockploy
- **Specs VPS:** 2 vCPU, 4GB RAM, 80GB SSD (~$20/mes)
- [ ] **Containerización:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- [ ] **SSL:** Let's Encrypt (renovación automática)
- **Process Manager:** PM2 (mantiene app corriendo 24/7)
- [ ] **Base de Datos:** Supabase PostgreSQL (plan Free o Pro según crecimiento)
- **CI/CD:** Manual inicialmente, GitHub Actions opcional después

**Gestión de Secrets:**

- [ ] Variables de entorno en `.env` (nunca commitear)
- Variables sensibles en Dockploy UI o Docker secrets
- [ ] Rotar secrets cada 6 meses (DATABASE_URL, AUTH_SECRET, RESEND_API_KEY)

**Proceso de Migrations:**

```bash
# Desarrollo local
npx prisma migrate dev --name nombre_migracion

# Producción (SSH manual MVP1)
ssh vps
cd /app
npx prisma migrate deploy

# MVP2: GitHub Actions automático
```

**Backups:**

- [ ] Supabase: Backups automáticos diarios (retención 7 días en free tier)
- Backup manual pre-migración: `pg_dump` antes de cambios críticos
- [ ] Probar restauración 1 vez al mes

**Ventajas VPS vs Vercel:**

- ✅ No hay cold starts (servidor corre 24/7)
- ✅ Prisma Client se carga una sola vez
- ✅ Más económico a largo plazo
- ✅ Control total sobre configuración
- ✅ No hay límites de ejecución de funciones

**Stack de Infraestructura:**

```
Internet → Cloudflare (DNS + CDN) → Nginx (Reverse Proxy) → Next.js (Puerto 3000)
                                                            ↓
                                                    Supabase PostgreSQL
```

---

## 🌍 INTERNACIONALIZACIÓN (i18n)

**Estrategia:** Preparado para i18n, pero MVP1 solo español

**MVP1: Estructura preparada**

```typescript
// lib/i18n/messages.ts
export const messages = {
  auth: {
    welcome: 'Bienvenido a VITA',
    login: 'Iniciar sesión',
    register: 'Registrarse',
  },
  shifts: {
    title: 'Turnos',
    create: 'Crear turno',
    edit: 'Editar turno',
  },
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
  }
}

// Uso en componentes
import { messages } from '@/lib/i18n/messages'
<h1>{messages.auth.welcome}</h1>
```

**MVP2: Activar multi-idioma**

```typescript
// lib/i18n/messages.ts
export const messages = {
  es: {
    auth: {
      welcome: 'Bienvenido a VITA',
    },
  },
  en: {
    auth: {
      welcome: 'Welcome to VITA',
    },
  },
  pt: {
    auth: {
      welcome: 'Bem-vindo ao VITA',
    },
  },
}

// lib/i18n/use-translation.ts
export function useTranslation() {
  const locale = useLocale() // 'es' | 'en' | 'pt'
  return (key: string) => messages[locale][key]
}
```

**✅ IMPLEMENTADO:** next-intl v4.6.1 con routing completo. Ver documentación completa arriba.

**Idiomas objetivo:**

- [ ] **MVP1:** Español (Chile)
- **MVP2:** Inglés (internacionalización)
- [ ] **MVP3:** Portugués (Brasil - mercado grande)

---

## 💾 ARQUITECTURA DE DATOS

### Multi-Tenancy: Base de Datos Compartida

**Decisión:** Todos los hospitales en una BD PostgreSQL con `organizationId`

**Ventajas:**

- [ ] Económico de operar (1 servidor PostgreSQL)
- Más fácil de desarrollar inicialmente
- [ ] Queries cross-tenant para analytics de SUPER_ADMIN
- Backup centralizado
- [ ] Migraciones únicas

**Seguridad:**

- [ ] **RLS (Row Level Security) en PostgreSQL** (MVP2)
- **Middleware Next.js** valida `organizationId` en cada request
- [ ] **Server Actions** siempre filtran por `organizationId`
- **Índices compuestos** en `(organizationId, ...)` para performance

**Escalabilidad futura:**

- [ ] Diseñado para microservicios
- Dominios lógicos separados: `auth`, `shifts`, `billing`, `attendance`
- [ ] Server Actions agrupados por dominio
- Posible migración a BD por tenant si es necesario

---

### Estrategia de Identificación por País

**Problema resuelto:** Cada país tiene diferentes tipos de documentos de identidad.

**Solución implementada:** Sistema flexible con validación en código, no en BD.

#### Enum de Tipos de Documento (DocType)

```prisma
enum DocType {
  RUT              // Chile
  CC               // Cédula de Ciudadanía (Colombia)
  CE               // Cédula de Extranjería (Colombia)
  TI               // Tarjeta de Identidad (Colombia)
  DNI              // Perú
  CARNET_EXT       // Carné de Extranjería (Perú)
  DNI_AR           // Argentina
  CUIL             // Argentina
  CUIT             // Argentina
  CURP             // México
  RFC              // México
  PASSPORT         // Universal
}
```

#### Mapeo de Documentos por País

**Archivo:** `lib/validations/document.ts`

```typescript
export const DOC_TYPES_BY_COUNTRY = {
  CL: ['RUT', 'PASSPORT'],
  CO: ['CC', 'CE', 'TI', 'PASSPORT'],
  PE: ['DNI', 'CARNET_EXT', 'PASSPORT'],
  AR: ['DNI_AR', 'CUIL', 'CUIT', 'PASSPORT'],
  MX: ['CURP', 'RFC', 'PASSPORT'],
  US: ['PASSPORT'],
} as const
```

#### Validación con Zod

**Archivo:** `lib/validations/user.ts`

```typescript
const userSchema = z
  .object({
    country: z.nativeEnum(Country),
    docType: z.nativeEnum(DocType),
    docNumber: z.string(),
  })
  .refine((data) => isValidDocTypeForCountry(data.country, data.docType), {
    message: 'Tipo de documento no válido para el país seleccionado',
  })
```

#### Ventajas de esta Arquitectura

1. **Flexible:** BD permite cualquier combinación (casos edge)
2. **Seguro:** Validación estricta en Server Actions con Zod
3. **UX mejorado:** Frontend muestra solo tipos válidos por país
4. **Escalable:** Agregar país nuevo = editar un objeto
5. **Type-safe:** TypeScript autocomplete funciona
6. **Una persona = una cuenta:** Constraint `@@unique([country, docType, docNumber])`

#### Login Multi-Método

Los usuarios pueden autenticarse con:

- ✅ Email (OAuth con Google/Microsoft)
- ✅ docNumber (para futuro login con credenciales si se requiere)

---

### Schema Prisma: Entidades Principales

#### 1. User (Usuario Universal)

**Propósito:** Representa a cualquier usuario del sistema. Un usuario puede trabajar en múltiples organizaciones.

**Campos clave:**

- `email`: Para autenticación (único)
- `name`: Nombre completo
- `country`: País del usuario (enum: CL, PE, CO, AR, MX, US)
- `docType`: Tipo de documento de identidad (enum: RUT, DNI, CC, CE, PASSPORT, etc.)
- `docNumber`: Número de documento de identidad
- `linkingCode`: Código único permanente para vinculación (ej: `clxxx-xxxxx`)
- `role`: Rol actual (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF_HEALTH)
- `organizationId`: Organización actual (nullable para SUPER_ADMIN)
- `image`: URL foto de perfil (OAuth)
- `emailVerified`: Fecha de verificación email

**Constraint único:** `@@unique([country, docType, docNumber])`

- Una persona = una cuenta (sin importar en cuántos hospitales trabaje)
- Login posible por email O por docNumber

**Relaciones:**

- `organization`: Organización actual
- `accounts`: Cuentas OAuth (Google, Microsoft)
- `sessions`: Sesiones activas
- `shifts`: Turnos asignados (en FASE 3)
- `exchangeRequests`: Intercambios de turnos (en FASE 3)

---

#### 2. Organization (Hospital/Clínica)

**Propósito:** Representa un cliente (hospital o clínica)

**Campos clave:**

- `name`: Nombre del hospital/clínica
- `country`: País de la organización (enum: CL, PE, CO, AR, MX, US)
- `taxId`: Identificador fiscal/tributario del país (RUT en Chile, RUC en Perú, NIT en Colombia, etc.)
- `maxAdminHR`: Límite de cuentas ADMIN_HR (default: 5, gratis)
- `maxChiefs`: Límite de jefes contratados
- `maxStaff`: Límite de personal contratado
- `status`: `ACTIVE`, `SUSPENDED`, `CANCELLED` (en FASE 6)
- `suspensionReason`: Razón de suspensión (en FASE 6)

**Relaciones:**

- `users`: Usuarios vinculados a esta organización
- `areas`: Áreas del hospital (en FASE 3)
- `shiftTypes`: Tipos de turno globales (en FASE 3)
- `payments`: Historial de pagos (en FASE 6)

---

#### 3. OrganizationMember (Roles Multi-Tenant)

**Propósito:** Vincula usuarios con organizaciones y asigna roles

**Campos clave:**

- [ ] `role`: `ADMIN_HR`, `CHIEF_AREA`, `STAFF_HEALTH`
- `staffType`: Si es `STAFF_HEALTH` → `DOCTOR`, `NURSE`, `TECH`, etc.
- [ ] `status`: `PENDING`, `ACTIVE`, `DEACTIVATED`
- `maxLinkedStaff`: Si es `CHIEF_AREA`, cuántas personas puede vincular
- [ ] `activatedAt`: Fecha de aceptación de vinculación
- `deactivatedAt`: Fecha de desvinculación

**Relaciones:**

- [ ] `user`: Usuario global
- `organization`: Hospital
- [ ] `areas`: Áreas donde trabaja (si es STAFF o CHIEF)

---

#### 3b. UserArea (Jefe ↔ Área) - PENDIENTE SCHEMA

**Propósito:** Define qué áreas gestiona cada CHIEF_AREA. Requerido para filtrar staff y tipos de turno del jefe.

**Campos:** `userId`, `areaId`. Tabla many-to-many User (CHIEF) ↔ Area.

**Uso:** ADMIN_HR asigna jefes a áreas; CHIEF solo ve/gestiona staff y tipos de turno de sus áreas.

---

#### 4. Area (Área del Hospital)

**Propósito:** Sección del hospital (Enfermería UCI, Médicos Urgencia, etc.)

**Campos clave:**

- [ ] `name`: Nombre del área
- `description`: Descripción opcional
- [ ] `organizationId`: Hospital al que pertenece

**Relaciones:**

- [ ] `chiefs`: Jefes de esta área
- `staff`: Personal de esta área
- [ ] `shifts`: Turnos de esta área

---

#### 5. ShiftType (Tipo de Turno)

**Propósito:** Define tipos de turno reutilizables (Largo, Noche, Extra, etc.)

**Campos clave:**

- [ ] `name`: Nombre del turno
- `durationHours`: Duración en horas
- [ ] `classification`: `DAY`, `NIGHT`, `MIXED`
- `color`: Color para el calendario (hex)
- [ ] `minStaffRequired`: Mínimo personal requerido
- `idealStaffCount`: Personal ideal
- [ ] `maxStaffAllowed`: Máximo permitido
- `suggestedRestDays`: Días de descanso recomendados
- [ ] `isGlobal`: `true` si lo creó HR, `false` si lo creó un jefe

**Relaciones:**

- [ ] `shifts`: Turnos que usan este tipo

---

#### 6. Shift (Turno Individual)

**Propósito:** Instancia de un turno asignado a personal en una fecha específica

**Campos clave:**

- [ ] `date`: Fecha del turno
- `startTime`: Hora de inicio
- [ ] `endTime`: Hora de fin
- `status`: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- [ ] `assignmentType`: `MANUAL`, `OPEN`, `EXCHANGE`
- `legalOverride`: Si se hizo override de validación legal
- [ ] `overrideReason`: Razón del override

**Relaciones:**

- [ ] `shiftType`: Tipo de turno
- `assignedUser`: Personal asignado
- [ ] `area`: Área donde se realiza
- `attendance`: Registro de asistencia

---

#### 7. ShiftExchange (Intercambio de Turnos)

**Propósito:** Solicitudes de intercambio entre personal

**Campos clave:**

- [ ] `status`: `PENDING_STAFF`, `PENDING_CHIEF`, `APPROVED`, `REJECTED`
- `reason`: Razón del intercambio (opcional)
- [ ] `rejectionReason`: Si fue rechazado

**Flujo de estados:**

```
PENDING_STAFF → (STAFF B acepta) → PENDING_CHIEF → (CHIEF aprueba) → APPROVED
             ↓                                   ↓
          REJECTED                            REJECTED
```

**Relaciones:**

- [ ] `requestedByUser`: Usuario que solicita
- `requestedToUser`: Usuario que recibe la solicitud
- [ ] `originalShift`: Turno que quiere dar
- `targetShift`: Turno que quiere recibir
- [ ] `approvedByChief`: Jefe que aprobó

---

#### 8. StaffRate (Tarifas Personalizadas)

**Propósito:** Define cuánto gana cada persona según tipo de hora

**Campos clave:**

- [ ] `dayHourlyRate`: CLP por hora de día
- `nightHourlyRate`: CLP por hora de noche
- [ ] `weekendMultiplier`: Multiplicador fin de semana
- `holidayMultiplier`: Multiplicador feriado
- [ ] `mandatoryHolidayMultiplier`: Multiplicador feriado irrenunciable
- `extraBonus`: Bono fijo por turno extra
- [ ] `validFrom`: Fecha de inicio de vigencia
- `validUntil`: Fecha de fin de vigencia

**Nota:** Se crea un nuevo registro cada vez que cambia la tarifa → Historial de tarifas

---

#### 9. Attendance (Asistencia)

**Propósito:** Registro de check-in/check-out del personal

**Campos clave:**

- [ ] `checkInTime`: Hora de llegada
- `checkOutTime`: Hora de salida
- [ ] `checkInMethod`: `MANUAL`, `BIOMETRIC`, `AUTO`
- `checkInByUser`: Si fue manual, quién acreditó
- [ ] `lateMinutes`: Minutos de retraso
- `notes`: Notas adicionales

**Relaciones:**

- [ ] `shift`: Turno correspondiente
- `user`: Personal que asistió

---

#### 10. Holiday (Feriados Chilenos)

**Propósito:** Feriados oficiales de Chile

**Campos clave:**

- [ ] `name`: Nombre del feriado
- `date`: Fecha
- [ ] `isMandatory`: `true` si es irrenunciable
- `region`: Si es regional (ej: Arica y Parinacota)

**Feriados Irrenunciables:**

- [ ] 1 enero (Año Nuevo)
- 1 mayo (Día del Trabajo)
- [ ] 18 y 19 sept (Fiestas Patrias)
- 25 diciembre (Navidad)
- [ ] 29 junio (San Pedro y San Pablo - irrenunciable desde 2023)

---

#### 11. Payment (Pagos de Organizaciones)

**Propósito:** Historial de pagos de cada hospital

**Campos clave:**

- [ ] `amount`: Monto en USD
- `currency`: `USD` o `CLP`
- [ ] `paymentMethod`: `TRANSFER`, `CHECK`, `CASH`, `OTHER`
- `paymentDate`: Fecha de pago
- [ ] `periodStart`: Inicio del período cubierto
- `periodEnd`: Fin del período cubierto
- [ ] `dueDate`: Fecha de vencimiento
- `notes`: Notas adicionales

**Relaciones:**

- [ ] `organization`: Hospital que pagó
- `recordedBy`: SUPER_ADMIN que registró el pago

---

### Índices Importantes

**Performance Multi-Tenant:**

```prisma
@@index([organizationId, date])         // Shifts por organización y fecha
@@index([organizationId, userId])       // Turnos de un usuario en una org
@@index([userId, date])                 // Turnos de un usuario (multi-org)
@@index([areaId, date])                 // Turnos de un área
@@index([linkingCode])                  // Búsqueda rápida de usuarios
```

---

## 🔑 CARACTERÍSTICAS CLAVE

### 1. Vinculación de Personal (Transparente)

**Concepto:** Sistema de doble validación donde tanto el jefe como el personal deben aprobar la vinculación.

---

#### **Flujo de Vinculación (MVP1):**

```
1. Personal crea cuenta en VITA
   → Sistema genera código PERMANENTE: PERS-2024-001234

2. Personal comunica código al jefe (verbal, email, WhatsApp)

3. Jefe ingresa código en "Vincular Personal"
   → Sistema busca al usuario por código
   → Muestra preview: "María González - Enfermera - RUT 12.345.678-9"

4. Jefe confirma vinculación
   → Sistema crea registro con status 'PENDING'

5. Personal recibe notificación popup/email/push:
   "El Jefe Juan Pérez te invitó a unirte a Enfermería UCI - Hospital Central"
   [Aceptar] [Rechazar]

6. Personal decide:
   → Acepta: Vinculación activa (status: 'ACTIVE')
   → Rechaza: Vinculación cancelada (status: 'REJECTED')

7. Si acepta → Personal aparece en lista del jefe
   → Jefe puede asignarle turnos
   → Personal ve turnos de esa organización en su calendario
```

**Características del Código (MVP1):**

- ✅ **Permanente:** No expira, se usa cada vez que cambia de trabajo
- ✅ **Reutilizable:** Mismo código para vincular a múltiples organizaciones
- ✅ **Único:** Un código por usuario, no se puede duplicar
- ✅ **Formato:** `PERS-YYYY-NNNNNN` (ej: PERS-2024-001234)
- ⚠️ **Riesgo:** Si se filtra, cualquiera puede intentar vincular
- ✅ **Mitigación:** Doble validación (jefe ingresa + personal aprueba)

---

#### **Mejoras para MVP2 (Códigos Temporales):**

**Problema identificado:**
Si el código es permanente y se filtra públicamente, podría haber intentos de vinculación no autorizados.

**Solución MVP2:**

```typescript
// Código temporal de un solo uso
model LinkingCode {
  id        String   @id @default(cuid())
  code      String   @unique // Ej: PS-A1B2C3 (6 caracteres, más fácil)
  userId    String
  expiresAt DateTime // Expira en 30 días
  maxUses   Int      @default(1) // Solo se puede usar 1 vez
  usedCount Int      @default(0)
  createdAt DateTime @default(now())
}
```

**Flujo MVP2:**

1. Personal genera nuevo código temporal (válido 30 días)
2. Si expira, debe generar uno nuevo
3. Código se "consume" al vincularse (usedCount++)
4. Si alcanza maxUses, no se puede usar más
5. Más seguro, pero menos conveniente (debe regenerar si expira)

**Decisión:** Empezamos con código permanente (más simple para MVP1), mejoramos seguridad en MVP2 si es necesario.

---

#### **Desvinculación:**

**Jefe puede desvincular:**

- En cualquier momento
- Desde lista de personal
- Confirmación obligatoria
- Personal recibe notificación
- Turnos futuros se cancelan automáticamente
- Turnos pasados se mantienen en historial

**Personal NO puede desvincularse:**

- Debe solicitarlo al jefe
- Razón: Evitar que se desvincule días antes de turnos asignados

---

#### **Multi-Organización:**

**Personal puede:**

- [ ] Trabajar en **múltiples hospitales simultáneamente**
  - Hospital A paga su vinculación
  - Hospital B paga su vinculación
  - Ambos independientes
- [ ] Estar en **múltiples áreas** del mismo hospital
  - Enfermería UCI
  - Enfermería UTI
  - Cada área puede asignarle turnos
- [ ] Ver **calendario unificado** de TODAS sus organizaciones
  - Filtrar por organización
  - Filtrar por área
  - Vista consolidada
- [ ] Recibir **alertas de conflictos** de horarios
  - Si tiene turnos superpuestos en distintos hospitales
  - Sistema marca el conflicto con badge rojo
  - Personal debe resolver (solicitar cambio de turno)

### 2. Tipos de Turno Flexibles

**Creados por:**

- [ ] ADMIN_HR: Tipos globales (disponibles para todas las áreas)
- CHIEF_AREA: Tipos específicos de su área

**Configuración:**

```typescript
{
  name: "Largo Día",
  duration: 12,
  classification: "DAY" | "NIGHT" | "MIXED",
  color: "#3b82f6",
  minStaffRequired: 1,
  idealStaffCount: 3,
  maxStaffAllowed: 5,
  suggestedRestDays: 1
}
```

**Flexibilidad:**

- [ ] No hay límite de horas por turno
- Pueden combinarse (ej: Largo + Noche en un día)
- [ ] Personal puede hacer turnos extra
- Jefe decide descansos (puede dar 5 días libres después de turnos pesados)

### 3. Asignación de Turnos

**Tres modos:**

**A) Asignación Directa:**

- [ ] Jefe asigna turno a personal específico
- Sistema valida conflictos automáticamente

**B) Turno Abierto:**

- [ ] Jefe crea turno sin asignar
- Personal postula con mensaje opcional
- [ ] Jefe elige entre postulaciones

**C) Intercambio:**

1. Personal A solicita intercambio a Personal B
2. Personal B acepta o rechaza
3. Si acepta → Jefe aprueba o rechaza
4. Si jefe aprueba → Turnos se intercambian

### 4. Validaciones Legales (Código del Trabajo Chile)

**⚠️ IMPORTANTE - RESPONSABILIDAD LEGAL:**

VITA es un software de servicio. **La responsabilidad del cumplimiento legal recae en el hospital/clínica.**

VITA solo **advierte** cuando se exceden límites legales, pero permite override con justificación.

**Disclaimer Legal (Mostrado en Override):**

```
⚠️ ADVERTENCIA LEGAL

Este turno excede las 48 horas semanales permitidas por el
Código del Trabajo de Chile (Art. 22).

VITA no es responsable del cumplimiento legal. Su organización
asume la responsabilidad de este override.

Esta acción quedará registrada en el sistema con timestamp,
usuario que aprobó y razón del override.
```

---

**Validaciones Implementadas:**

**1. Máximo 48 horas semanales:**

- [ ] Sistema calcula horas automáticamente
- Alerta en tiempo real si excede
- [ ] Override posible con justificación **obligatoria**
- Se registra en log auditable (sin generar PDF)

**2. Descanso mínimo:**

- [ ] 12 horas entre turnos
- Warning si no se cumple
- [ ] Override posible con justificación

**3. Feriados irrenunciables:**

- [ ] 18 sept, 1 mayo, 25 dic, 1 enero, 29 junio
- Sistema marca con badge especial
- [ ] Alerta al asignar turno en feriado irrenunciable
- Override posible (algunos trabajadores aceptan trabajar)

**4. Mínimo/Máximo personal:**

- [ ] Jefe configura por tipo de turno
- Sistema alerta si no hay mínimo requerido
- [ ] Muestra "Turno OK (1/3 doctores)" o "Turno ideal (3/3 doctores)"
- No requiere override (es recomendación, no requisito legal)

---

**Sistema de Logs de Override:**

```typescript
// Schema Prisma
model LegalOverrideLog {
  id             String   @id @default(cuid())
  shiftId        String
  overrideType   String   // 'WEEKLY_HOURS', 'REST_HOURS', 'HOLIDAY'
  reason         String   // Razón obligatoria
  approvedBy     String   // ID del CHIEF que aprobó
  organizationId String
  timestamp      DateTime @default(now())

  shift        Shift        @relation(fields: [shiftId], references: [id])
  approver     User         @relation(fields: [approvedBy], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])
}
```

**Auditoría:**

- ✅ Todos los overrides quedan registrados
- ✅ Timestamp exacto de cuándo se aprobó
- ✅ Quién aprobó (nombre del jefe)
- ✅ Razón específica
- ✅ SUPER_ADMIN puede ver todos los overrides de todas las organizaciones
- ✅ ADMIN_HR puede ver overrides de su organización
- ❌ NO se genera PDF automáticamente (hospital puede exportar si lo necesita)

### 5. Sistema de Tarifas

**Configuración por persona:**

```typescript
{
  userId: "user-123",
  dayHourlyRate: 8000,      // CLP
  nightHourlyRate: 10000,
  weekendMultiplier: 1.5,
  holidayMultiplier: 2.0,
  mandatoryHolidayMultiplier: 2.5,
  extraBonus: 50000,
  validFrom: "2024-01-01",
  validUntil: "2024-12-31"  // Historial de cambios
}
```

**Cálculo (MVP2):**

- [ ] Automático según horario trabajado
- Considera día/noche, feriados, extras
- [ ] Genera liquidación PDF

### 6. Sistema de Asistencia

**ESTRATEGIA POR FASES:**

- **MVP1:** Acreditación manual por CHIEF (casos excepcionales)
- **MVP2:** Integración con biométricos de terceros (webhook API)
- **MVP3:** Métodos nativos de VITA (GPS, QR, Web check-in) - **DIFERENCIADOR vs Rflex**

**⚠️ CLARIFICACIÓN IMPORTANTE:**

Al igual que Rflex, VITA **NO será dueña del hardware biométrico**:

- Sistemas de huella dactilar = **Hardware de terceros** (~$500-800 USD)
- Sistemas faciales = **Hardware de terceros** (~$1500-2000 USD)
- **Estrategia:** Integración vía webhook API en MVP2
- **Ventaja MVP3:** Métodos propios por software (sin hardware adicional)

---

#### **MVP1: Acreditación Manual (Casos Excepcionales)**

**Contexto:**

- Hospitales ya tienen sistemas biométricos (huella/facial)
- La integración con esos sistemas es para MVP2
- MVP1: Jefe puede acreditar manualmente cuando sistema biométrico falla

**Flujo MVP1:**

```
1. Personal tiene turno asignado (ej: 08:00-20:00)
2. Personal llega y marca en sistema biométrico del hospital
3. Si sistema biométrico FALLA:
   - Personal avisa al jefe
   - Jefe abre VITA → "Asistencia Hoy"
   - Jefe acredita llegada manualmente
   - Personal recibe notificación: "Llegada acreditada por [Jefe] a las 08:05"
```

**Features MVP1:**

- [ ] Dashboard "Asistencia Hoy" para jefes
- Lista de personal con turnos del día
- [ ] Botón "Acreditar llegada" por cada persona
- Badge de alerta si no hay check-in 30 min después del inicio del turno
- [ ] Registro manual de hora de llegada
- Notificación al personal de confirmación

**Limitaciones MVP1:**

- ❌ No hay integración con sistemas biométricos
- ❌ No hay self-check-in del personal desde VITA
- ❌ No hay geolocalización
- ✅ Solo acreditación manual del jefe (casos excepcionales)

---

#### **MVP2: Integración Biométrica + Self Check-in**

**Problema actual de hospitales:**
Sistemas biométricos (huella/facial) tienen fallas frecuentes, generan notificaciones falsas, personal debe avisar manualmente.

**Solución VITA MVP2:**

**Escenario 1: Sistema Biométrico Funciona (Flujo Ideal)**

1. Personal marca huella/facial en dispositivo biométrico: 07:58
2. Sistema biométrico → Webhook POST a VITA API
3. VITA registra check-in automático
4. Personal recibe notificación: "✅ Llegada acreditada 07:58"
5. Jefe ve en dashboard: "✓ María González - Presente 07:58"

**Escenario 2: Sistema Biométrico Falla (Fallback Manual)**

1. Personal intenta marcar → Error del dispositivo
2. Personal avisa al jefe por teléfono/radio
3. Jefe acredita manualmente desde VITA
4. Personal recibe: "✅ Llegada acreditada por Jefe Juan 08:05 (Manual)"
5. Se registra `checkInMethod: 'MANUAL'` en BD

**Escenario 3: Self Check-in desde App (Alternativa)**

1. Personal abre app VITA en celular
2. Click en "He llegado"
3. Sistema valida geolocalización (dentro de radio de 100m del hospital)
4. Si está dentro → Check-in automático
5. Si está fuera → Requiere aprobación manual del jefe

**Escenario 4: Retraso sin Check-in**

1. Turno inicia 08:00
2. 08:30 → No hay check-in (ni biométrico, ni manual, ni app)
3. Sistema envía alerta push:
   - Al jefe: "⚠️ María González no ha marcado llegada"
   - Al personal: "⚠️ Recuerda marcar tu asistencia"
4. Jefe puede contactar o acreditar

**Sistemas Biométricos Compatibles (MVP2):**

- [ ] ZKTeco (huella) - Webhook API
- Anviz (facial + huella) - Webhook API
- [ ] Suprema BioStar (facial) - Webhook API
- Hikvision (facial) - Webhook API

**Arquitectura MVP2:**

```typescript
// app/api/webhooks/biometric/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-webhook-signature')

  // Validar firma del webhook (seguridad)
  if (!validateWebhookSignature(signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { userId, timestamp, deviceId, method } = await request.json()

  // Registrar check-in automático
  await prisma.attendance.create({
    data: {
      userId,
      checkInTime: new Date(timestamp),
      checkInMethod: 'BIOMETRIC',
      deviceId,
      biometricMethod: method, // 'fingerprint' | 'facial'
    },
  })

  // Enviar notificación al personal
  await sendNotification(userId, 'Llegada acreditada')

  return Response.json({ success: true })
}
```

---

#### **MVP3: Métodos Nativos de VITA (DIFERENCIADOR)**

**🎯 VENTAJA COMPETITIVA vs Rflex:**

Rflex depende de hardware biométrico de terceros (caro). VITA ofrece alternativas propias por software.

**Métodos Nativos Propuestos:**

**1. GPS Check-in (App Capacitor)**

**Concepto:**

- App detecta ubicación GPS del personal
- Si está dentro del radio del hospital → Check-in habilitado
- Sin hardware adicional, sin costos extra

**Flujo:**

```
1. Personal llega al hospital (dentro de 100m del área)
2. Abre app VITA → Botón "He llegado" habilitado (GPS validado)
3. Confirma llegada con un tap
4. Sistema registra:
   - Timestamp
   - Coordenadas GPS (lat/lng)
   - Precisión del GPS (ej: ±10m)
   - Device ID
5. Check-in confirmado con notificación
6. Jefe ve en dashboard: "✓ María - Presente 08:02 (GPS)"
```

**Validaciones:**

```typescript
// lib/utils/geolocation.ts
const HOSPITAL_COORDINATES = { lat: -33.4372, lng: -70.6506 } // Ej: Santiago
const CHECK_IN_RADIUS = 100 // metros

export const isWithinCheckInRadius = (userLat: number, userLng: number): boolean => {
  const distance = calculateDistance(
    HOSPITAL_COORDINATES.lat,
    HOSPITAL_COORDINATES.lng,
    userLat,
    userLng
  )
  return distance <= CHECK_IN_RADIUS
}
```

**Configuración por Organización:**

- ADMIN_HR configura coordenadas del hospital
- Radio de check-in ajustable (50m, 100m, 200m)
- Alertas si check-in desde ubicación sospechosa

**Ventajas:**

- ✅ Sin hardware ($0 costo adicional)
- ✅ Funciona offline (guarda marca, sincroniza después)
- ✅ Prueba de ubicación (evita marcajes remotos)
- ✅ Más flexible que huellero fijo

**Limitaciones:**

- ⚠️ Requiere app nativa (Capacitor MVP2)
- ⚠️ Depende de GPS del celular (precisión variable)
- ⚠️ Posible spoofing de GPS (mitigable con otras validaciones)

---

**2. QR Code Check-in (App o Web)**

**Concepto:**

- Jefe genera QR code diario/por turno
- Personal escanea QR al llegar
- Validación simple, sin hardware biométrico

**Flujo:**

```
1. Jefe abre VITA → "Generar QR del día"
2. Sistema genera QR único con:
   - Turno ID
   - Área ID
   - Fecha válida (hoy)
   - Token temporal
3. Jefe imprime o muestra QR en tablet en entrada
4. Personal llega → Escanea QR con app VITA
5. Check-in registrado automáticamente
6. Notificación: "✅ Llegada acreditada 08:03 (QR)"
```

**Variantes:**

- **QR Diario:** Un QR para todos los turnos del día
- **QR por Turno:** Un QR específico por turno
- **QR Estático:** QR permanente del hospital (menos seguro)

**Implementación:**

```typescript
// En la app: Escanear con Capacitor Barcode Scanner
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

// actions/attendance/generate-qr-action.ts
export async function generateQRCodeAction(shiftId: string) {
  const token = await generateSecureToken() // JWT con expiración
  const qrData = {
    type: 'CHECK_IN',
    shiftId,
    organizationId,
    validUntil: addHours(new Date(), 24), // Válido 24h
    token,
  }

  const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData))
  return { success: true, qrCodeUrl }
}

const handleScan = async () => {
  const result = await BarcodeScanner.startScan()
  if (result.hasContent) {
    await checkInWithQRAction(result.content)
  }
}
```

**Ventajas:**

- ✅ Muy económico (solo imprimir o tablet)
- ✅ Funciona en app y web
- ✅ Fácil de implementar
- ✅ No requiere internet en el momento (offline capable)

**Limitaciones:**

- ⚠️ Menos seguro (QR puede compartirse)
- ⚠️ Requiere que jefe genere/muestre QR
- ⚠️ Posible fraude si personal comparte screenshot

---

**3. Web Check-in Dedicado (Kiosco Virtual)**

**Concepto:**

- Tablet/computadora en entrada del hospital
- Personal ingresa RUT o código
- Check-in sin necesidad de app

**Flujo:**

```
1. Hospital coloca tablet en entrada con VITA abierto
2. Personal llega → Toca pantalla "Marcar Asistencia"
3. Ingresa RUT: 12.345.678-9
4. Sistema valida:
   - Usuario existe
   - Tiene turno hoy
   - Está dentro de horario válido (±30 min)
5. Check-in registrado
6. Pantalla: "✅ María González - Llegada acreditada 08:04"
```

**Seguridad:**

```typescript
// Validaciones
- RUT debe tener turno programado hoy
- Solo permitir check-in dentro de ventana de tiempo (±30 min del inicio)
- IP whitelisting (solo desde red del hospital)
- Rate limiting (max 1 check-in por usuario cada 5 min)
```

**Ventajas:**

- ✅ No requiere que personal tenga app
- ✅ Accesible para todos (incluso sin smartphone)
- ✅ Tablet única vs múltiples huelleros

**Limitaciones:**

- ⚠️ Requiere tablet/PC en entrada
- ⚠️ Menos seguro (cualquiera puede ingresar RUT ajeno)
- ⚠️ Mejor como complemento, no método principal

---

**Comparación de Métodos MVP3:**

| Método                | Costo Hardware | Seguridad  | UX         | Offline |
| --------------------- | -------------- | ---------- | ---------- | ------- |
| **GPS Check-in**      | $0             | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ✅      |
| **QR Code**           | ~$200 (tablet) | ⭐⭐⭐     | ⭐⭐⭐⭐   | ✅      |
| **Web Kiosco**        | ~$200 (tablet) | ⭐⭐       | ⭐⭐⭐     | ❌      |
| **Biométrico** (MVP2) | $500-2000      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ❌      |

**Recomendación de Implementación:**

1. **MVP3 FASE 1:** GPS Check-in (diferenciador fuerte)
2. **MVP3 FASE 2:** QR Code (complemento flexible)
3. **MVP3 FASE 3:** Web Kiosco (para hospitales sin app adoption)

**Estrategia Comercial:**

```
Rflex: "Necesitas comprar huelleros de $800 USD c/u"
VITA:  "Check-in por GPS desde tu celular. $0 hardware adicional."
```

**🎯 PITCH:**
"Mientras otros te venden hardware, nosotros te damos software inteligente que funciona con lo que ya tienes: celulares."

---

## 🎨 PALETA DE COLORES (Healthcare Modern Theme)

**Tema implementado:** "Healthcare Modern" - Optimizado para sector salud desde tweakcn.com

**Filosofía de diseño:**

- ❌ **Evitado:** Tema "Cyberpunk" (colores neón, fondos muy oscuros) - No apropiado para sector salud
- ❌ **Evitado:** Tema "Violet Bloom" (púrpura/violeta) - No transmite confianza médica
- ✅ **Implementado:** Paleta médica moderna adaptada desde tweakcn con azules de confianza, verdes de bienestar y acentos sutiles

**Análisis y adaptación:**

- Tema base importado desde tweakcn.com (Violet Bloom)
- Colores primarios cambiados de púrpura (277°) a azul médico (250°)
- Secondary cambiado de gris a verde salud (150°)
- Charts adaptados a paleta médica (azules, verdes, ámbar)
- Dark mode optimizado con azul oscuro suave en lugar de púrpura

**Tailwind v4 CSS (OKLCH):**

```css
:root {
  --background: oklch(0.99 0.003 250);
  --foreground: oklch(0.15 0.01 250);
  --primary: oklch(0.5 0.15 250);
  --secondary: oklch(0.7 0.12 150);
  --accent: oklch(0.85 0.08 200);
  --destructive: oklch(0.55 0.2 25);
  --chart-1: oklch(0.5 0.15 250);
  --chart-2: oklch(0.7 0.12 150);
  --chart-3: oklch(0.65 0.15 45);
}

.dark {
  --background: oklch(0.12 0.01 250);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.65 0.15 250);
  --secondary: oklch(0.75 0.12 150);
}
```

**Colores de estado (para turnos):**

- `scheduled`: Azul médico (primary) - oklch(0.5 0.15 250)
- `in-progress`: Ámbar/amarillo suave - oklch(0.65 0.15 45)
- `completed`: Verde salud (secondary) - oklch(0.7 0.12 150)
- `cancelled`: Gris con tinte azul - oklch(0.5 0.01 250)

**Justificación de colores:**

- **Azul médico (250°):** Transmite confianza, profesionalismo, tecnología médica
- **Verde salud (150°):** Asociado con bienestar, calma, éxito
- **Grises modernos:** Limpieza, tecnología, neutralidad
- **Acentos sutiles:** Modernidad sin ser agresivo o "gaming"
- **Dark mode azul:** Más apropiado que púrpura para sector salud

**Implementado en:** `app/globals.css`
**Fecha:** Diciembre 2024
**Fuente base:** tweakcn.com (adaptado para salud)

---

## 🖥️ DASHBOARDS POR ROL - ESPECIFICACIÓN VISUAL

Esta sección detalla qué verá cada administrador en su dashboard y menú de navegación.

---

### 1️⃣ SUPER_ADMIN - Dashboard Principal

**Rol:** Equipo VITA (tu empresa)
**Acceso:** Global a todas las organizaciones
**Color de tema:** Púrpura/Violeta (#8B5CF6)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  🏥 VITA                   │
│  Super Administrador       │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  🏢 Organizaciones         │
│  💳 Pagos                  │
│  📈 Analytics              │
│  ⚙️  Configuración         │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  👤 Admin Usuario          │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard SUPER_ADMIN                                  [Filtros ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🏢 Total Orgs  │  │ ✅ Activas     │  │ ⚠️  Suspendidas│       │
│  │                │  │                │  │                │       │
│  │      24        │  │      22        │  │       2        │       │
│  │                │  │                │  │                │       │
│  │  +3 este mes   │  │  91.7%         │  │  8.3%          │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 💰 Ingresos    │  │ 👥 Usuarios    │  │ ⏰ Próx. Pago  │       │
│  │                │  │                │  │                │       │
│  │  $28,600 USD   │  │     1,234      │  │       5        │       │
│  │                │  │                │  │                │       │
│  │  +$2,400       │  │  +45 este mes  │  │  en 7 días     │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Organizaciones Recientes                         [Ver todas →]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Organización        Estado    Plan      Cuentas   Acciones   │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ Hospital Central    🟢 Activa PRO      45/200    [Ver][💳]   │  │
│  │ Clínica Santa María 🟢 Activa BASIC    28/50     [Ver][💳]   │  │
│  │ Hospital Regional   🟡 Deuda  PRO      156/200   [Ver][💳]   │  │
│  │ Clínica San José    🔴 Suspnd BASIC    0/50      [Ver][🔓]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Alertas y Notificaciones                                           │
│                                                                      │
│  ⚠️  5 organizaciones con pago próximo a vencer (próximos 7 días)  │
│  🔴 2 organizaciones suspendidas por falta de pago                  │
│  ✅ 3 pagos registrados hoy ($8,200 USD)                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Páginas Secundarias

**1. Organizaciones** (`/super-admin/organizations`)

- [ ] Lista completa con tabla
- Filtros: Estado, Plan, Fecha de creación
- [ ] Búsqueda por nombre
- Botón: "Nueva Organización"

**2. Ver Organización** (`/super-admin/organizations/[id]`)

- [ ] Detalles completos
- Historial de pagos
- [ ] Métricas: usuarios activos, áreas, turnos del mes
- Acciones: Editar, Suspender/Reactivar, Registrar Pago

**3. Pagos** (`/super-admin/payments`)

- [ ] Formulario para registrar pago
- Select de organización
- [ ] Historial global de pagos

**4. Analytics** (`/super-admin/analytics`)

- [ ] Gráficos de ingresos (mensual)
- Distribución de planes
- [ ] Crecimiento de usuarios
- Tabla de organizaciones por ingresos

---

### 2️⃣ ADMIN_HR - Dashboard de Recursos Humanos

**Rol:** Recursos Humanos de una organización
**Acceso:** Su organización solamente
**Color de tema:** Azul (#3B82F6)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  🏥 Hospital Central       │
│  Recursos Humanos          │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  🏢 Áreas                  │
│  🔄 Tipos de Turno         │
│  💰 Tarifas                │
│  👔 Gestionar Jefes        │
│  👥 Personal               │
│  📋 Reportes               │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  👤 María González         │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Recursos Humanos - Hospital Central      [Mes: Nov 2024] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🏢 Áreas       │  │ 👥 Personal    │  │ 👔 Jefes       │       │
│  │                │  │                │  │                │       │
│  │       8        │  │      156       │  │       12       │       │
│  │                │  │                │  │                │       │
│  │  Activas       │  │  Activos       │  │  Activos       │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🔄 Tipos Turno │  │ 📅 Turnos/Mes  │  │ 💰 Costo/Mes   │       │
│  │                │  │                │  │                │       │
│  │      12        │  │     1,847      │  │  $124,500,000  │       │
│  │                │  │                │  │                │       │
│  │  Configurados  │  │  Este mes      │  │  CLP           │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Acciones Rápidas                                                   │
│                                                                      │
│  [➕ Nueva Área]  [➕ Nuevo Tipo Turno]  [👔 Crear Jefe]           │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Áreas de la Organización                         [Ver todas →]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Área                    Jefes   Personal  Turnos/Mes  Estado │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ Enfermería UCI            2       24       456       🟢       │  │
│  │ Médicos Urgencia          3       18       389       🟢       │  │
│  │ Kinesiología              1       12       245       🟢       │  │
│  │ Técnicos Enfermería       2       32       578       🟢       │  │
│  │ Nutrición                 1        8       134       🟢       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Límites de Cuentas por Jefe                                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Jefe                    Área              Usado    Límite    │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ Juan Pérez              Enfermería UCI    24/30   [Editar]  │  │
│  │ Ana Torres              Médicos Urgencia  18/25   [Editar]  │  │
│  │ Carlos Ruiz             Kinesiología      12/15   [Editar]  │  │
│  │ ⚠️  María Silva         Téc. Enfermería   32/32   [Editar]  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Páginas Secundarias

**1. Áreas** (`/hr/areas`)

- [ ] Lista de áreas con CRUD
- Formulario: Nombre, Descripción
- [ ] Ver jefes y personal asignado

**2. Tipos de Turno** (`/hr/shift-types`)

- [ ] Lista de tipos de turno
- Formulario: Nombre, Duración, Clasificación (DAY/NIGHT/MIXED), Color
- [ ] Configurar: mín/máx personal, descanso sugerido

**3. Tarifas** (`/hr/rates`)

- [ ] Lista de personal con sus tarifas
- Formulario por persona:
  - [ ] Tarifa día/noche
  - [ ] Multiplicadores (fin de semana, feriado, irrenunciable)
  - [ ] Bonos extra
  - [ ] Fecha de vigencia
- [ ] Historial de cambios de tarifa

**4. Gestionar Jefes** (`/hr/chiefs`)

- [ ] Lista de jefes
- Crear cuenta de jefe
- [ ] Asignar límite de cuentas
- Asignar a áreas

**5. Personal** (`/hr/staff`)

- [ ] Vista de todo el personal
- Filtrar por área
- [ ] Ver tarifas
- Ver turnos del mes

---

### 3️⃣ CHIEF_AREA - Dashboard de Jefe de Área

**Rol:** Jefe de área específica
**Acceso:** Su área y personal asignado
**Color de tema:** Verde (#16A34A)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  🏥 Hospital Central       │
│  Jefe - Enfermería UCI     │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  📅 Calendario             │
│  👥 Mi Personal            │
│  ➕ Vincular Personal      │
│  🔄 Asignar Turnos         │
│  📝 Turnos Abiertos        │
│  ✅ Aprobaciones           │
│  📋 Asistencia             │
│  📊 Reportes               │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  👤 Juan Pérez             │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Jefe - Enfermería UCI                [Semana: 11-17 Nov] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 👥 Mi Equipo   │  │ 📅 Turnos Hoy  │  │ ✅ Presentes   │       │
│  │                │  │                │  │                │       │
│  │      24/30     │  │       12       │  │      11/12     │       │
│  │                │  │                │  │                │       │
│  │  Vinculados    │  │  En progreso   │  │  91.7%         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🔔 Pendientes  │  │ 🔄 Intercambios│  │ ⚠️  Alertas    │       │
│  │                │  │                │  │                │       │
│  │       3        │  │       2        │  │       1        │       │
│  │                │  │                │  │                │       │
│  │  Aprobaciones  │  │  Por aprobar   │  │  Retrasos      │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Acciones Rápidas                                                   │
│                                                                      │
│  [➕ Asignar Turno]  [🔗 Vincular Personal]  [✅ Acreditar Asist.] │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Turnos de Hoy                                    [Ver calendario →]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Personal           Turno        Horario      Estado   Acción │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ María González     Largo Día    08:00-20:00  🟢 Pres  [Ver] │  │
│  │ Pedro Sánchez      Largo Día    08:00-20:00  🟢 Pres  [Ver] │  │
│  │ Ana Torres         Noche        20:00-08:00  🟡 Prog  [✅]   │  │
│  │ Luis Martínez      Largo Día    08:00-20:00  🟢 Pres  [Ver] │  │
│  │ Carmen Rojas       Noche        20:00-08:00  🟡 Prog  [✅]   │  │
│  │ ⚠️  Diego Silva    Largo Día    08:00-20:00  🔴 Aust  [✅]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Solicitudes Pendientes                                             │
│                                                                      │
│  🔄 Intercambio: María González ↔ Pedro Sánchez (15 Nov)          │
│     [Aprobar] [Rechazar] [Ver Detalles]                            │
│                                                                      │
│  📝 Postulación: Ana Torres → Turno Extra 20 Nov                   │
│     [Aprobar] [Rechazar] [Ver Detalles]                            │
│                                                                      │
│  🔗 Vinculación: Carlos Vega (PERS-2024-005678)                    │
│     [Ver Perfil] [Confirmar] [Rechazar]                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Páginas Secundarias

**1. Calendario** (`/chief/calendar`)

- [ ] Vista mensual/semanal
- Todos los turnos de su equipo
- [ ] Color-coded por tipo de turno
- Click para ver detalles o editar

**2. Mi Personal** (`/chief/staff`)

- [ ] Lista de personal vinculado
- Ver perfil, turnos, historial
- [ ] Desvincular

**3. Vincular Personal** (`/chief/staff/link`)

- [ ] Input para código de vinculación
- Preview del personal
- [ ] Confirmar vinculación

**4. Asignar Turnos** (`/chief/shifts/assign`)

- [ ] Formulario de asignación
- Seleccionar: Fecha, Tipo turno, Horario, Personal
- [ ] Validaciones en tiempo real:
  - [ ] ✅ Sin conflictos
  - [ ] ✅ Dentro de 48h semanales
  - [ ] ✅ Descanso de 12h
  - [ ] ⚠️ Warnings con opción de override

**5. Turnos Abiertos** (`/chief/shifts/open`)

- [ ] Crear turno sin asignar
- Ver postulaciones
- [ ] Seleccionar personal

**6. Aprobaciones** (`/chief/approvals`)

- [ ] Lista de intercambios pendientes
- Lista de postulaciones a turnos abiertos
- [ ] Aprobar/rechazar con razón

**7. Asistencia** (`/chief/attendance`)

- [ ] Lista de turnos del día
- Acreditar llegada manualmente
- [ ] Ver historial de asistencia

---

### 4️⃣ STAFF_HEALTH - Dashboard de Personal de Salud

**Rol:** Personal de salud (Doctor, Enfermero, Técnico, etc.)
**Acceso:** Sus propios turnos y datos
**Color de tema:** Ámbar/Naranja (#F59E0B)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  👨‍⚕️ María González         │
│  Enfermera - UCI           │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  📅 Mi Calendario          │
│  🔄 Intercambios           │
│  📝 Turnos Disponibles     │
│  🔗 Mis Vinculaciones      │
│  👤 Mi Perfil              │
│  📋 Mi Historial           │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mi Dashboard - María González                   [Mes: Noviembre]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 📅 Turnos/Mes  │  │ ⏰ Horas/Mes   │  │ 💰 Estimado    │       │
│  │                │  │                │  │                │       │
│  │      18        │  │      156       │  │  $1,248,000    │       │
│  │                │  │                │  │                │       │
│  │  Este mes      │  │  de 192 máx    │  │  CLP           │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🏢 Organizac.  │  │ 🔄 Intercambios│  │ ⏳ Próx. Turno │       │
│  │                │  │                │  │                │       │
│  │       2        │  │       1        │  │  Mañana 08:00  │       │
│  │                │  │                │  │                │       │
│  │  Activas       │  │  Pendiente     │  │  Largo Día     │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Mi Código de Vinculación                                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PERS-2024-001234                                  [Copiar]   │  │
│  │                                                                │  │
│  │  Comparte este código con tu jefe para que te vincule        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Mis Próximos Turnos                              [Ver calendario →]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Fecha       Organización        Turno        Horario         │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ 18 Nov      Hospital Central    Largo Día    08:00-20:00    │  │
│  │ 19 Nov      Hospital Central    Noche        20:00-08:00    │  │
│  │ 20 Nov      Clínica Santa M.    Largo Día    08:00-20:00    │  │
│  │ 23 Nov      Hospital Central    Libre        ---             │  │
│  │ 24 Nov      Hospital Central    Libre        ---             │  │
│  │ 25 Nov 🎉   Hospital Central    Largo Día    08:00-20:00    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Notificaciones y Alertas                                           │
│                                                                      │
│  🔔 Turno asignado: 25 Nov - Largo Día (Hospital Central)         │
│  🔄 Intercambio aprobado: 28 Nov con Pedro Sánchez                 │
│  ⚠️  Conflicto detectado: 20 Nov tienes turnos en 2 organizaciones │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Dashboard Principal - Vista Mobile

```
┌──────────────────────┐
│  👨‍⚕️ María González   │
│  ▾ Hospital Central  │
├──────────────────────┤
│                      │
│  📅 Turnos Este Mes  │
│  ┌────────────────┐  │
│  │      18        │  │
│  │   turnos       │  │
│  └────────────────┘  │
│                      │
│  ⏰ Horas Trabajadas │
│  ┌────────────────┐  │
│  │   156h / 192h  │  │
│  │   █████░░░     │  │
│  └────────────────┘  │
│                      │
│  💰 Estimado Mes     │
│  ┌────────────────┐  │
│  │  $1,248,000    │  │
│  │    CLP         │  │
│  └────────────────┘  │
│                      │
│  ━━━━━━━━━━━━━━━━  │
│                      │
│  ⏳ Próximo Turno    │
│  ┌────────────────┐  │
│  │ 18 Nov - 08:00 │  │
│  │  Largo Día     │  │
│  │  Hospital C.   │  │
│  └────────────────┘  │
│                      │
│  ━━━━━━━━━━━━━━━━  │
│                      │
│  [Ver Calendario]    │
│  [Intercambios]      │
│  [Turnos Dispo.]     │
│                      │
└──────────────────────┘
```

#### Páginas Secundarias

**1. Mi Calendario** (`/staff/calendar`)

- [ ] Vista mensual de todos los turnos
- Filtrar por organización
- [ ] Color-coded por tipo de turno
- Badges para feriados

**2. Intercambios** (`/staff/exchanges`)

- [ ] Mis solicitudes enviadas
- Solicitudes recibidas
- [ ] Historial de intercambios
- Crear nueva solicitud

**3. Turnos Disponibles** (`/staff/shifts/open`)

- [ ] Lista de turnos abiertos en mis áreas
- Postular con mensaje
- [ ] Ver estado de mis postulaciones

**4. Mis Vinculaciones** (`/staff/linking`)

- [ ] Lista de organizaciones donde estoy vinculado
- Solicitudes pendientes de aprobar/rechazar
- [ ] Ver áreas asignadas

**5. Mi Perfil** (`/staff/profile`)

- [ ] Datos personales
- Código de vinculación
- [ ] RUT, email, teléfono
- Cambiar contraseña

**6. Mi Historial** (`/staff/history`)

- [ ] Historial de turnos trabajados
- Horas totales por mes
- [ ] Estimado de pagos (si hay tarifas configuradas)

---

## 📱 Adaptación Responsive

### Desktop (>1024px)

- [ ] Sidebar siempre visible
- Grid de 3 columnas para stats cards
- [ ] Tablas completas

### Tablet (768px - 1024px)

- [ ] Sidebar colapsable con botón hamburguesa
- Grid de 2 columnas para stats cards
- [ ] Tablas con scroll horizontal

### Mobile (<768px)

- [ ] Sidebar como overlay (se oculta al hacer clic fuera)
- Stats cards en 1 columna
- [ ] Tablas convertidas a cards verticales
- Botones flotantes para acciones rápidas

---

## 🎨 Convenciones de Color por Estado

**Estados de Turno:**

- [ ] 🟢 Verde: Presente/Activo/Completado
- 🟡 Amarillo: En progreso/Pendiente
- [ ] 🔴 Rojo: Ausente/Cancelado/Suspendido
- 🟣 Púrpura: Abierto (sin asignar)
- [ ] 🔵 Azul: Programado

**Prioridades:**

- [ ] 🔴 Alta: Rojo
- 🟡 Media: Amarillo
- [ ] 🟢 Baja: Verde

**Notificaciones:**

- [ ] ✅ Éxito: Verde
- ⚠️ Advertencia: Amarillo
- [ ] ❌ Error: Rojo
- 🔔 Info: Azul

---

**Esta especificación visual debe usarse como referencia al implementar las FASES 4-9 del plan.**

## 📂 ESTRUCTURA DE DIRECTORIOS

```
vita/
├── app/                                 # Next.js 16 App Router
│   ├── globals.css                      # Tailwind v4 + variables CSS
│   ├── layout.tsx                        # Layout root (Server Component)
│   ├── error.tsx                        # Error Boundary root
│   │
│   ├── [locale]/                        # Rutas localizadas (es, en)
│   │   ├── layout.tsx                    # Layout raíz con Providers
│   │   │
│   │   ├── (global)/                    # Páginas públicas globales
│   │   │   ├── layout.tsx               # Layout con Navbar + Footer
│   │   │   ├── page.tsx                 # Home / Landing
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Página de login
│   │   │   ├── register/
│   │   │   │   └── page.tsx             # Página de registro
│   │   │   ├── support/
│   │   │   │   └── page.tsx             # Soporte
│   │   │   └── contact/
│   │   │       └── page.tsx             # Contacto
│   │   │
│   │   ├── admin/                       # Dashboard SUPER_ADMIN
│   │   │   ├── layout.tsx               # Layout con Sidebar
│   │   │   ├── page.tsx                 # Dashboard admin (/admin)
│   │   │   ├── organizations/
│   │   │   │   ├── page.tsx             # Lista de organizaciones
│   │   │   │   ├── new/page.tsx         # Crear organización
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Ver detalles
│   │   │   │       └── edit/page.tsx     # Editar organización
│   │   │   ├── payments/page.tsx        # Registrar pagos
│   │   │   └── analytics/page.tsx       # Métricas globales
│   │   │
│   │   ├── admin-hr/                     # Dashboard ADMIN_HR
│   │   │   ├── layout.tsx               # Layout con Sidebar
│   │   │   ├── page.tsx                 # Resumen HR (/admin-hr)
│   │   │   ├── organization/page.tsx    # Vista de organización y estadísticas
│   │   │   ├── invitations/page.tsx     # Gestionar invitaciones (jefes/staff)
│   │   │   ├── areas/page.tsx           # CRUD Áreas
│   │   │   ├── shift-types/page.tsx     # CRUD Tipos de Turno
│   │   │   └── rates/page.tsx           # CRUD Tarifas
│   │   │
│   │   ├── chief/                       # Dashboard CHIEF_AREA
│   │   │   ├── layout.tsx               # Layout con Sidebar
│   │   │   ├── page.tsx                 # Resumen del equipo (/chief)
│   │   │   ├── calendar/page.tsx        # Calendario del equipo
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx             # Lista de personal
│   │   │   │   └── link/page.tsx        # Vincular personal
│   │   │   ├── shifts/
│   │   │   │   ├── page.tsx             # Lista de turnos
│   │   │   │   ├── assign/page.tsx      # Asignar turnos
│   │   │   │   └── open/page.tsx        # Crear turnos abiertos
│   │   │   ├── attendance/page.tsx      # Acreditar asistencia
│   │   │   └── approvals/page.tsx       # Aprobar intercambios/postulaciones
│   │   │
│   │   └── staff/                       # Dashboard STAFF_HEALTH
│   │       ├── layout.tsx               # Layout con Sidebar
│   │       ├── page.tsx                 # Resumen personal (/staff)
│   │       ├── calendar/page.tsx        # Calendario unificado
│   │       ├── shifts/
│   │       │   ├── open/page.tsx        # Postular a turnos abiertos
│   │       │   └── exchanges/page.tsx    # Solicitar intercambios
│   │       ├── linking/page.tsx         # Aprobar vinculaciones
│   │       └── profile/page.tsx         # Perfil y configuración
│   │
│   └── api/                             # API Routes (solo webhooks)
│       ├── auth/[...nextauth]/route.ts  # Auth.js v5 handler
│       └── webhooks/
│           └── biometric/route.ts      # Webhook para sistemas biométricos (MVP2)
│
├── actions/                             # Server Actions (patrón principal)
│   ├── auth/
│   │   └── auth-actions.ts              # register, login, logout
│   ├── organizations/
│   │   ├── organization-actions.ts      # CRUD organizaciones
│   │   ├── suspension-actions.ts        # Suspender/reactivar
│   │   └── payment-actions.ts           # Registrar pagos
│   ├── users/
│   │   ├── user-actions.ts              # CRUD usuarios
│   │   └── linking-actions.ts           # Vinculación de personal
│   ├── areas/
│   │   └── area-actions.ts              # CRUD áreas
│   ├── shifts/
│   │   ├── shift-actions.ts             # CRUD turnos
│   │   ├── assign-actions.ts            # Asignar turnos
│   │   └── validation-actions.ts        # Validaciones legales
│   ├── shift-types/
│   │   └── shift-type-actions.ts        # CRUD tipos de turno
│   ├── exchanges/
│   │   └── exchange-actions.ts          # Solicitar/aprobar intercambios
│   ├── rates/
│   │   └── rate-actions.ts              # CRUD tarifas
│   ├── attendance/
│   │   └── attendance-actions.ts        # Check-in/check-out
│   └── analytics/
│       └── analytics-actions.ts         # Métricas y reportes
│
├── components/                          # Componentes React
│   ├── auth/
│   │   ├── login-form.tsx               # Formulario login (Client Component)
│   │   └── register-form.tsx            # Formulario registro (Client Component)
│   │
│   ├── calendar/
│   │   ├── calendar-month.tsx           # Vista mensual (Client Component)
│   │   ├── calendar-week.tsx            # Vista semanal (Client Component)
│   │   ├── shift-card.tsx               # Tarjeta de turno (Server Component)
│   │   └── holiday-badge.tsx            # Badge de feriado (Server Component)
│   │
│   ├── dashboard/
│   │   ├── sidebar.tsx                  # Sidebar (Client Component - interactivo)
│   │   ├── header.tsx                   # Header (Server Component)
│   │   ├── navbar.tsx                   # Navbar (Server Component)
│   │   ├── footer.tsx                   # Footer (Server Component)
│   │   └── stats-card.tsx               # Tarjeta de estadísticas (Server Component)
│   │
│   ├── shifts/
│   │   ├── shift-form.tsx               # Formulario crear/editar turno
│   │   ├── shift-table.tsx              # Tabla de turnos
│   │   └── shift-dialog.tsx             # Dialog de detalles
│   │
│   ├── staff/
│   │   ├── staff-table.tsx              # Tabla de personal
│   │   ├── link-dialog.tsx              # Dialog vincular personal
│   │   └── staff-card.tsx               # Tarjeta de personal
│   │
│   ├── exchanges/
│   │   ├── exchange-request-form.tsx    # Formulario solicitar intercambio
│   │   ├── exchange-list.tsx            # Lista de intercambios
│   │   └── exchange-approval.tsx        # Aprobar/rechazar
│   │
│   ├── attendance/
│   │   ├── attendance-table.tsx         # Tabla de asistencia
│   │   └── check-in-dialog.tsx          # Dialog acreditar asistencia
│   │
│   ├── organizations/
│   │   ├── organization-form.tsx        # Formulario crear/editar org
│   │   ├── organization-table.tsx       # Tabla de organizaciones
│   │   ├── suspend-dialog.tsx           # Dialog suspender org
│   │   ├── payment-form.tsx             # Formulario registrar pago
│   │   └── payment-history-table.tsx    # Historial de pagos
│   │
│   ├── error/
│   │   └── error-fallback.tsx           # Componente de error genérico
│   │
│   ├── providers/
│   │   ├── theme-provider.tsx           # Provider de tema (Client Component)
│   │   └── session-provider.tsx         # Provider de sesión (Client Component - si se usa)
│   │
│   └── ui/                              # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       └── ...
│
├── lib/                                 # Librerías y utilidades
│   ├── auth/
│   │   ├── config.ts                    # Configuración Auth.js v5
│   │   ├── index.ts                     # Exports de auth (handlers, signIn, signOut)
│   │   └── session.ts                   # Helpers de sesión y RBAC
│   │
│   ├── db/
│   │   └── prisma.ts                    # Cliente Prisma singleton
│   │
│   ├── validations/
│   │   ├── auth.ts                      # Schemas Zod para auth
│   │   ├── organization.ts              # Schemas Zod para organizaciones
│   │   ├── shift.ts                     # Schemas Zod para turnos
│   │   ├── rate.ts                      # Schemas Zod para tarifas
│   │   └── rut.ts                       # Validación RUT chileno
│   │
│   ├── holidays/
│   │   └── chile.ts                     # Lógica de feriados chilenos
│   │
│   ├── capacitor/                       # Capacitor plugins (MVP2)
│   │   ├── index.ts                     # Helpers de detección
│   │   ├── push.ts                      # Push notifications
│   │   ├── geolocation.ts               # Geolocalización
│   │   └── scanner.ts                   # Scanner QR
│   │
│   └── utils.ts                         # Utilidades generales (cn, formatters, etc.)
│
├── hooks/                               # Custom React Hooks (Client Components)
│   ├── use-sidebar.ts                   # Hook para controlar sidebar (Zustand)
│   ├── use-calendar.ts                  # Hook para lógica de calendario
│   └── use-debounce.ts                  # Hook para debounce
│
├── types/                               # Tipos TypeScript compartidos
│   ├── auth.ts                          # Tipos de autenticación
│   ├── database.ts                      # Tipos generados por Prisma
│   └── calendar.ts                      # Tipos para calendario
│
├── store/                               # Zustand stores (solo UI local)
│   └── sidebar-store.ts                 # Estado del sidebar
│
├── prisma/
│   ├── schema.prisma                    # Schema de Prisma (un solo archivo)
│   ├── seed.ts                          # Script de seed (feriados chilenos)
│   └── migrations/                      # Migraciones generadas
│
├── proxy.ts                             # Next.js 16 Proxy (antes middleware.ts)
├── next.config.ts                       # Configuración Next.js 16
├── tailwind.config.ts                   # Configuración Tailwind v4
├── tsconfig.json                        # Configuración TypeScript
├── .env.local                           # Variables de entorno (no en Git)
├── .env.example                         # Template de variables de entorno
└── package.json                         # Dependencias
```

---

## 📐 GUÍAS DE DESARROLLO

### Cómo Programar Componentes React en VITA

#### 1. Server Components vs Client Components

**Regla de Oro:** Todo es Server Component por defecto, usa Client Component solo cuando sea necesario.

**Usa Server Component cuando:**

- [ ] No necesitas interactividad (botones con `onClick`, inputs, etc.)
- No necesitas hooks de React (`useState`, `useEffect`, etc.)
- [ ] No necesitas acceso al navegador (`window`, `localStorage`, etc.)
- Puedes hacer fetch de datos directamente

**Ejemplo de Server Component:**

```typescript
// components/dashboard/stats-card.tsx
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-lg border p-6">
      <div className="rounded-full bg-primary/10 p-3">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </article>
  )
}
```

**Usa Client Component cuando:**

- [ ] Necesitas `useState`, `useEffect`, `useRef`
- Necesitas event handlers (`onClick`, `onChange`, etc.)
- [ ] Necesitas acceso a APIs del navegador
- Usas librerías que requieren el cliente (ej: Zustand, react-hook-form)

**Ejemplo de Client Component:**

```typescript
// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/auth/auth-actions'
import { toast } from 'sonner'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result.success) {
      toast.success('¡Bienvenido!')
      router.push('/staff/calendar')
    } else {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... campos del formulario ... */}
    </form>
  )
}
```

---

#### 2. Organización de Tipos e Interfaces (TypeScript)

**Según Feature-Sliced Design (FSD), los tipos deben organizarse por su alcance:**

**📁 Tipos Locales (mismo archivo)**

- ✅ Usar cuando: El tipo/interfaz se usa SOLO en ese archivo específico
- 📍 Ubicación: En el mismo archivo donde se usa
- 📝 Ejemplo:

```typescript
// src/features/auth/ui/login-form.tsx
'use client'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  // Solo se usa aquí
}
```

**📁 Tipos de Feature**

- ✅ Usar cuando: El tipo se comparte entre múltiples archivos de la MISMA feature
- 📍 Ubicación: `src/features/[feature]/lib/types.ts`
- 📝 Ejemplo:

```typescript
// src/features/super-admin/lib/types.ts
import type { Organization } from '@prisma/client'

export interface OrganizationWithCount extends Organization {
  _count: {
    users: number
  }
}

export interface OrganizationsTableProps {
  initialOrganizations: OrganizationWithCount[]
  initialTotal: number
}

export interface OrganizationActionResult {
  success: boolean
  error?: string
  data?: Organization
}
```

```typescript
// src/features/super-admin/lib/index.ts
export * from './schemas'
export * from './organization-helpers'
export * from './types' // ← Exportar tipos en Public API
```

**📁 Tipos de Entidad (Entity)**

- ✅ Usar cuando: El tipo representa una entidad de dominio usada en múltiples features
- 📍 Ubicación: `src/entities/[entity]/model/types.ts`
- 📝 Ejemplo:

```typescript
// src/entities/organization/model/types.ts
import type { Organization, OrganizationStatus } from '@prisma/client'

export interface OrganizationSummary {
  id: string
  name: string
  status: OrganizationStatus
  userCount: number
}
```

**📁 Tipos Compartidos (Shared)**

- ✅ Usar cuando: Tipos genéricos/utilidades usados en TODO el proyecto
- 📍 Ubicación: `src/shared/types/`
- 📝 Ejemplo:

```typescript
// src/shared/types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// src/shared/types/pagination.ts
export interface PaginationParams {
  page: number
  pageSize: number
}
```

**🎯 Reglas de Oro:**

1. **No duplicar tipos:** Si un tipo se usa en múltiples lugares, moverlo al nivel apropiado
2. **Exportar correctamente:** Usar `index.ts` para crear Public APIs
3. **Usar tipos de Prisma:** Siempre extender/usar tipos generados por Prisma cuando sea posible
4. **No usar `any`:** Preferir `unknown` o tipos específicos
5. **Interfaces vs Types:** Usar `interface` para estructuras de objetos, `type` para unions/intersections

**Ejemplo Real del Proyecto:**

```typescript
// src/features/auth/api/auth-actions.ts
import type { ActionResult } from '../lib/types'

// ✅ CORRECTO
// src/features/auth/lib/types.ts
export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function registerAction(data: FormData): Promise<ActionResult<RegisterData>> {
  // ...
}
```

```typescript
// ❌ INCORRECTO
// src/features/auth/api/auth-actions.ts
export interface ActionResult<T = unknown> {
  // ← Definido en API, debería estar en lib/types
  success: boolean
  data?: T
  error?: string
}
```

---

#### 3. Server Actions: Patrón Principal

**¿Qué son?** Funciones que se ejecutan en el servidor pero se pueden llamar desde el cliente.

**Ventajas:**

- No necesitas crear API Routes
- Type-safe (TypeScript end-to-end)
- Automáticamente POST requests
- Revalidación de caché automática

**Estructura de un Server Action:**

```typescript
// src/features/shifts/api/shift-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const createShiftSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  shiftTypeId: z.string(),
  assignedUserId: z.string(),
  areaId: z.string(),
})

export async function createShiftAction(formData: FormData) {
  try {
    const session = await requireAuth()

    const rawData = {
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      shiftTypeId: formData.get('shiftTypeId') as string,
      assignedUserId: formData.get('assignedUserId') as string,
      areaId: formData.get('areaId') as string,
    }

    const validation = createShiftSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const { data } = validation

    const shift = await prisma.shift.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'SCHEDULED',
        assignmentType: 'MANUAL',
        shiftTypeId: data.shiftTypeId,
        assignedUserId: data.assignedUserId,
        areaId: data.areaId,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath('/chief/calendar')

    return {
      success: true,
      data: shift,
    }
  } catch (error) {
    console.error('Error creating shift:', error)
    return {
      success: false,
      error: 'Error al crear el turno',
    }
  }
}
```

**Pasos clave:**

1. `'use server'` al inicio del archivo
2. Validar con Zod
3. Verificar autenticación/autorización
4. Ejecutar lógica de negocio
5. Revalidar caché con `revalidatePath()` si es necesario
6. Retornar `{ success, data, error }`

---

#### 3. Patrones de Diseño

**Patrón: Server Component fetches → pasa props a Client Component**

```typescript
// app/(dashboard)/chief/calendar/page.tsx (Server Component)
import { getShiftsAction } from '@/actions/shifts/shift-actions'
import { CalendarClient } from '@/components/calendar/calendar-client'

export default async function ChiefCalendarPage() {
  const result = await getShiftsAction()

  if (!result.success) {
    return <div>Error al cargar turnos</div>
  }

  return (
    <main className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Calendario del Equipo</h1>
      <CalendarClient initialShifts={result.data} />
    </main>
  )
}
```

```typescript
// components/calendar/calendar-client.tsx (Client Component)
'use client'

import { useState } from 'react'

interface CalendarClientProps {
  initialShifts: Shift[]
}

export function CalendarClient({ initialShifts }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div>
      {/* Lógica interactiva del calendario */}
    </div>
  )
}
```

---

#### 4. Naming Conventions

**Componentes:**

- [ ] PascalCase: `StatsCard`, `LoginForm`
- Archivo: `stats-card.tsx`, `login-form.tsx`

**Server Actions:**

- [ ] camelCase con sufijo `Action`: `createShiftAction`, `loginAction`
- Archivo: `shift-actions.ts`, `auth-actions.ts`

**Hooks:**

- [ ] camelCase con prefijo `use`: `useCalendar`, `useSidebar`
- Archivo: `use-calendar.ts`, `use-sidebar.ts`

**Event Handlers:**

- [ ] camelCase con prefijo `handle`: `handleSubmit`, `handleClick`, `handleKeyDown`

---

#### 5. Accesibilidad

**Siempre incluir:**

- [ ] `aria-label` en botones sin texto
- `tabIndex={0}` en elementos interactivos no nativos
- [ ] `role` en elementos personalizados
- Manejar `onKeyDown` además de `onClick`

**Ejemplo:**

```typescript
<button
  type="button"
  onClick={handleOpenDialog}
  onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog()}
  aria-label="Abrir diálogo de crear turno"
  className="rounded-lg p-2 hover:bg-accent"
>
  <PlusIcon className="h-5 w-5" />
</button>
```

---

#### 6. Manejo de Errores

**Error Boundaries por sección:**

```typescript
// app/(dashboard)/error.tsx
'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || 'Error inesperado'}
      </p>
      <button onClick={reset} className="btn-primary">
        Intentar de nuevo
      </button>
    </div>
  )
}
```

---

#### 7. Estilos con Tailwind

**Siempre usa Tailwind, nunca CSS inline o archivos `.css` separados (excepto `globals.css`).**

**Utilidades personalizadas:**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
```

**Uso:**

```typescript
<div className={cn(
  "rounded-lg border p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Contenido
</div>
```

---

#### 8. Sin Comentarios Innecesarios

**❌ Mal:**

```typescript
// Función que crea un turno
export async function createShiftAction(formData: FormData) {
  // Validamos los datos
  const validation = createShiftSchema.safeParse(rawData)
  // Si falla la validación, retornamos error
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }
  // ...
}
```

**✅ Bien:**

```typescript
export async function createShiftAction(formData: FormData) {
  const validation = createShiftSchema.safeParse(rawData)

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const shift = await prisma.shift.create({
    /* ... */
  })

  revalidatePath('/chief/calendar')

  return { success: true, data: shift }
}
```

El código es auto-explicativo con nombres descriptivos y estructura clara.

---

## 🏛️ ARQUITECTURA DE CÓDIGO Y MEJORES PRÁCTICAS

### Principios Fundamentales

#### 1. SOLID Principles

**S - Single Responsibility (Responsabilidad Única)**

Cada función, componente o módulo debe hacer UNA sola cosa.

❌ **Mal:**

```typescript
// Un componente que hace demasiado
export function UserDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch users
  useEffect(() => { /* ... */ }, [])

  // Handle delete
  const handleDelete = async (id: string) => { /* ... */ }

  // Handle edit
  const handleEdit = async (id: string) => { /* ... */ }

  // Render table, modals, forms, etc.
  return (
    <div>
      {/* 500 líneas de JSX */}
    </div>
  )
}
```

✅ **Bien:**

```typescript
// components/users/user-dashboard.tsx (Server Component)
import { getUsersAction } from '@/actions/users/user-actions'
import { UserTable } from './user-table'

export async function UserDashboard() {
  const result = await getUsersAction()

  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  return <UserTable users={result.data} />
}

// components/users/user-table.tsx (Client Component)
'use client'

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="space-y-4">
      <UserTableHeader />
      <UserTableBody users={users} />
    </div>
  )
}

// components/users/user-table-row.tsx
interface UserTableRowProps {
  user: User
}

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <UserTableActions userId={user.id} />
      </td>
    </tr>
  )
}
```

---

**O - Open/Closed (Abierto/Cerrado)**

Abierto para extensión, cerrado para modificación.

✅ **Ejemplo: Variantes de Button con CVA**

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Uso: Fácil de extender sin modificar el componente
<Button variant="destructive" size="sm">Eliminar</Button>
```

---

**L - Liskov Substitution (Sustitución de Liskov)**

Los componentes derivados deben poder sustituir a los base.

✅ **Ejemplo: Interfaces consistentes**

```typescript
// types/form-field.ts
interface BaseFieldProps {
  name: string
  label: string
  error?: string
  required?: boolean
}

// components/form/text-field.tsx
interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password'
  placeholder?: string
}

export function TextField({ name, label, error, required, ...props }: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={name} name={name} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  )
}

// components/form/select-field.tsx
interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string; label: string }>
}

export function SelectField({ name, label, error, required, options }: SelectFieldProps) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Select name={name}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  )
}

// Uso: Ambos componentes son intercambiables en un formulario
```

---

**I - Interface Segregation (Segregación de Interfaces)**

Interfaces específicas mejor que una genérica grande.

❌ **Mal:**

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
  rut: string
  globalRole: string
  organizationMembers: OrganizationMember[]
  shifts: Shift[]
  createdAt: Date
  updatedAt: Date
}

// Componente que solo necesita nombre y email
function UserGreeting({ user }: { user: User }) {
  return <p>Hola, {user.name}</p>
}
```

✅ **Bien:**

```typescript
// types/user.ts
interface UserBase {
  id: string
  name: string
  email: string
}

interface UserWithAuth extends UserBase {
  rut: string
  globalRole: string
}

interface UserWithRelations extends UserBase {
  organizationMembers: OrganizationMember[]
  shifts: Shift[]
}

interface UserComplete extends UserWithAuth, UserWithRelations {
  createdAt: Date
  updatedAt: Date
}

// Componente usa solo lo que necesita
function UserGreeting({ user }: { user: UserBase }) {
  return <p>Hola, {user.name}</p>
}
```

---

**D - Dependency Inversion (Inversión de Dependencias)**

Depende de abstracciones, no de implementaciones concretas.

✅ **Ejemplo: Servicios abstractos**

```typescript
// lib/logger/pino-logger.ts
import pino from 'pino'

// Uso: No depende de la implementación concreta
import { logger } from '@/lib/logger'

// lib/logger/types.ts
interface Logger {
  info(message: string, meta?: Record<string, unknown>): void
  error(message: string, error?: Error): void
  warn(message: string, meta?: Record<string, unknown>): void
}

export class PinoLogger implements Logger {
  private logger = pino()

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(meta, message)
  }

  error(message: string, error?: Error) {
    this.logger.error({ err: error }, message)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(meta, message)
  }
}

// lib/logger/console-logger.ts (para desarrollo)
export class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, unknown>) {
    console.log('[INFO]', message, meta)
  }

  error(message: string, error?: Error) {
    console.error('[ERROR]', message, error)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn('[WARN]', message, meta)
  }
}

// lib/logger/index.ts
const logger: Logger =
  process.env.NODE_ENV === 'production' ? new PinoLogger() : new ConsoleLogger()

export { logger }

logger.info('Usuario creado', { userId: '123' })
```

---

### 2. Atomic Design Pattern

**Átomos → Moléculas → Organismos → Templates → Páginas**

#### Átomos (components/ui/)

Componentes más pequeños, no divisibles.

```typescript
// components/ui/button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}

// components/ui/input.tsx
export function Input({ ...props }: InputProps) {
  return <input {...props} />
}

// components/ui/label.tsx
export function Label({ children, ...props }: LabelProps) {
  return <label {...props}>{children}</label>
}

// components/ui/badge.tsx
export function Badge({ children, variant }: BadgeProps) {
  return <span className={badgeVariants({ variant })}>{children}</span>
}
```

---

#### Moléculas (components/form/, components/common/)

Combinación de átomos que forman una unidad funcional.

```typescript
// components/form/form-field.tsx
interface FormFieldProps {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, name, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// Uso:
<FormField label="Email" name="email" error={errors.email}>
  <Input type="email" name="email" />
</FormField>
```

```typescript
// components/common/status-badge.tsx
interface StatusBadgeProps {
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    ACTIVE: { label: 'Activo', variant: 'success' as const },
    PENDING: { label: 'Pendiente', variant: 'warning' as const },
    SUSPENDED: { label: 'Suspendido', variant: 'destructive' as const },
  }

  const { label, variant } = config[status]

  return <Badge variant={variant}>{label}</Badge>
}
```

---

#### Organismos (components/shifts/, components/staff/, etc.)

Secciones complejas de la interfaz.

```typescript
// components/shifts/shift-card.tsx
interface ShiftCardProps {
  shift: Shift
  onEdit?: (shiftId: string) => void
  onDelete?: (shiftId: string) => void
}

export function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  return (
    <Card>
      <CardHeader>
        <ShiftCardTitle shift={shift} />
        <ShiftCardBadges shift={shift} />
      </CardHeader>
      <CardContent>
        <ShiftCardDetails shift={shift} />
      </CardContent>
      <CardFooter>
        <ShiftCardActions
          shiftId={shift.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardFooter>
    </Card>
  )
}
```

---

#### Templates (app/(dashboard)/layout.tsx)

Estructuras de página reutilizables.

```typescript
// components/layouts/dashboard-layout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  header: React.ReactNode
}

export function DashboardLayout({ children, sidebar, header }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r">{sidebar}</aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b">{header}</header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

---

#### Páginas (app/\*\*/page.tsx)

Instancias específicas de templates con datos reales.

```typescript
// app/(dashboard)/chief/calendar/page.tsx
import { getShiftsAction } from '@/actions/shifts/shift-actions'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function ChiefCalendarPage() {
  const result = await getShiftsAction()

  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  return <CalendarView shifts={result.data} />
}
```

---

### 3. Composición sobre Herencia

**Usa composición para compartir funcionalidad.**

✅ **Ejemplo: Render Props Pattern**

```typescript
// components/common/data-loader.tsx
interface DataLoaderProps<T> {
  loadData: () => Promise<{ success: boolean; data?: T; error?: string }>
  children: (data: T) => React.ReactNode
  loadingFallback?: React.ReactNode
  errorFallback?: (error: string) => React.ReactNode
}

export async function DataLoader<T>({
  loadData,
  children,
  loadingFallback = <LoadingSpinner />,
  errorFallback = (error) => <ErrorState message={error} />,
}: DataLoaderProps<T>) {
  const result = await loadData()

  if (!result.success) {
    return errorFallback(result.error!)
  }

  return children(result.data!)
}

// Uso:
<DataLoader loadData={getShiftsAction}>
  {(shifts) => <ShiftList shifts={shifts} />}
</DataLoader>
```

---

### 4. Custom Hooks para Lógica Reutilizable

**Extrae lógica repetitiva en hooks personalizados.**

```typescript
// hooks/use-form-validation.ts
import { useState } from 'react'
import { z } from 'zod'

export const useFormValidation = <T extends z.ZodType>(schema: T) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: unknown) => {
    const result = schema.safeParse(data)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  const clearErrors = () => setErrors({})

  return { errors, validate, clearErrors }
}

// Uso:
const { errors, validate } = useFormValidation(loginSchema)

const handleSubmit = (data: unknown) => {
  if (!validate(data)) {
    return
  }
  // Continuar con el submit
}
```

---

```typescript
// hooks/use-debounce.ts
import { useEffect, useState } from 'react'

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Uso:
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearch) {
    // Hacer búsqueda
  }
}, [debouncedSearch])
```

---

```typescript
// hooks/use-async-action.ts
import { useState } from 'react'
import { toast } from 'sonner'

interface UseAsyncActionOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
}

export const useAsyncAction = <T extends unknown[], R>(
  action: (...args: T) => Promise<{ success: boolean; data?: R; error?: string }>,
  options: UseAsyncActionOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false)

  const execute = async (...args: T) => {
    setIsLoading(true)

    try {
      const result = await action(...args)

      if (result.success) {
        if (options.successMessage) {
          toast.success(options.successMessage)
        }
        if (options.onSuccess) {
          options.onSuccess()
        }
        return result.data
      } else {
        toast.error(result.error || options.errorMessage || 'Error desconocido')
        return null
      }
    } catch (error) {
      toast.error('Error inesperado')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { execute, isLoading }
}

// Uso:
const { execute: deleteShift, isLoading } = useAsyncAction(deleteShiftAction, {
  successMessage: 'Turno eliminado',
  errorMessage: 'No se pudo eliminar el turno',
  onSuccess: () => router.refresh(),
})
```

---

### 5. Utilidades y Helpers

**Agrupa funciones utilitarias en módulos específicos.**

```typescript
// lib/utils/date.ts
export const formatDate = (date: Date, locale: string = 'es-CL'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const getWeekDays = (date: Date): Date[] => {
  const week: Date[] = []
  const currentDay = date.getDay()
  const firstDay = new Date(date)
  firstDay.setDate(date.getDate() - currentDay + 1)

  for (let i = 0; i < 7; i++) {
    week.push(addDays(firstDay, i))
  }

  return week
}
```

---

```typescript
// lib/utils/currency.ts
export const formatCurrency = (amount: number, currency: 'CLP' | 'USD' = 'CLP'): string => {
  const locale = currency === 'CLP' ? 'es-CL' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Uso:
formatCurrency(50000, 'CLP') // "$50.000"
formatCurrency(50, 'USD') // "$50.00"
```

---

```typescript
// lib/utils/array.ts
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (acc, item) => {
      const groupKey = String(item[key])
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set()
  return array.filter((item) => {
    const keyValue = item[key]
    if (seen.has(keyValue)) {
      return false
    }
    seen.add(keyValue)
    return true
  })
}

// Uso:
const shiftsByDate = groupBy(shifts, 'date')
const uniqueUsers = uniqueBy(users, 'email')
```

---

### 6. Constantes y Configuración

**Centraliza valores mágicos y configuración.**

```typescript
// lib/constants/roles.ts
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_HR: 'ADMIN_HR',
  CHIEF_AREA: 'CHIEF_AREA',
  STAFF_HEALTH: 'STAFF_HEALTH',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN_HR: 'Recursos Humanos',
  CHIEF_AREA: 'Jefe de Área',
  STAFF_HEALTH: 'Personal de Salud',
}

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN_HR: ['areas:*', 'shift-types:*', 'rates:*', 'chiefs:manage'],
  CHIEF_AREA: ['staff:link', 'shifts:*', 'exchanges:approve'],
  STAFF_HEALTH: ['shifts:view', 'exchanges:request'],
} as const
```

---

```typescript
// lib/constants/shifts.ts
export const SHIFT_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type ShiftStatus = (typeof SHIFT_STATUSES)[keyof typeof SHIFT_STATUSES]

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export const SHIFT_STATUS_COLORS: Record<ShiftStatus, string> = {
  SCHEDULED: 'hsl(var(--status-scheduled))',
  IN_PROGRESS: 'hsl(var(--status-in-progress))',
  COMPLETED: 'hsl(var(--status-completed))',
  CANCELLED: 'hsl(var(--status-cancelled))',
}
```

---

```typescript
// lib/constants/validation.ts
export const VALIDATION_LIMITS = {
  MAX_WEEKLY_HOURS: 48,
  MIN_REST_HOURS: 12,
  MAX_STAFF_NAME_LENGTH: 100,
  MAX_ORGANIZATION_NAME_LENGTH: 200,
  MAX_SHIFT_DURATION_HOURS: 24,
} as const

export const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/
```

---

### 7. Tipos TypeScript Compartidos

**Define tipos reutilizables y específicos.**

```typescript
// types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
}
```

---

```typescript
// types/forms.ts
export interface FormState {
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
}

export type FormMode = 'create' | 'edit' | 'view'
```

---

```typescript
// types/calendar.ts
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  metadata?: Record<string, unknown>
}

export type CalendarView = 'month' | 'week' | 'day'
```

---

### 8. Archivos Pequeños y Enfocados

**Límite sugerido: ~100-150 líneas por archivo.**

❌ **Mal: Archivo gigante**

```
components/shifts/shift-management.tsx (800 líneas)
├── ShiftList
├── ShiftCard
├── ShiftForm
├── ShiftDialog
├── ShiftFilters
└── ShiftActions
```

✅ **Bien: Archivos pequeños y enfocados**

```
components/shifts/
├── shift-list.tsx (60 líneas)
├── shift-card.tsx (40 líneas)
├── shift-form.tsx (80 líneas)
├── shift-dialog.tsx (50 líneas)
├── shift-filters.tsx (70 líneas)
├── shift-actions.tsx (45 líneas)
└── index.ts (exports)
```

---

### 9. Barrel Exports

**Facilita imports con archivos index.ts.**

```typescript
// Uso:
import { Badge, Button, Card } from '@/components/ui'

// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Label } from './label'
export { Card, CardHeader, CardContent, CardFooter } from './card'
export { Dialog, DialogTrigger, DialogContent } from './dialog'
export { Badge } from './badge'
```

---

```typescript
// lib/utils/index.ts
export * from './date'
export * from './currency'
export * from './array'
export * from './string'
export { cn } from './cn'
```

---

### 10. Documentación en Código

**JSDoc para funciones complejas o utilidades públicas.**

````typescript
/**
 * Valida si un RUT chileno es válido.
 *
 * @param rut - RUT en formato 12.345.678-9 o 12345678-9
 * @returns true si el RUT es válido, false en caso contrario
 *
 * @example
 * ```typescript
 * validateRut('12.345.678-9') // true
 * validateRut('12.345.678-0') // false
 * ```
 */
export const validateRut = (rut: string): boolean => {
  const cleanRut = cleanRutFormat(rut)
  const [body, verifier] = cleanRut.split('-')

  const calculatedVerifier = calculateVerifier(body)

  return verifier.toUpperCase() === calculatedVerifier.toUpperCase()
}
````

---

### Estructura de Archivos Ideal

```
components/shifts/
├── index.ts                    # Barrel exports
├── shift-list.tsx              # 60 líneas - Lista principal
├── shift-card.tsx              # 40 líneas - Tarjeta individual
├── shift-card-header.tsx       # 25 líneas - Header de tarjeta
├── shift-card-body.tsx         # 30 líneas - Body de tarjeta
├── shift-card-actions.tsx      # 35 líneas - Acciones
├── shift-form.tsx              # 80 líneas - Formulario
├── shift-dialog.tsx            # 50 líneas - Modal
├── shift-filters.tsx           # 70 líneas - Filtros
└── types.ts                    # 30 líneas - Tipos específicos
```

---

## 📋 PLAN DE DESARROLLO PASO A PASO

**Filosofía:** Desarrollo incremental orientado a valor. Empezamos con Marketing y Core Features, dejando features administrativas para el final.

**Orden estratégico:** Landing Page → Core (Turnos + Calendario) → Vinculación → Validaciones → Dashboards Admin

### 🔌 MCP Servers Conectados

**IMPORTANTE:** Este proyecto usa **Model Context Protocol (MCP)** para acceder a documentación actualizada:

- **shadcn MCP Server:** Documentación oficial de shadcn/ui con componentes, estilos y dark mode
- **Supabase MCP Server:** Documentación de Supabase para PostgreSQL y Prisma

**Instrucción para la IA:** Cuando veas "Consultar MCP server de shadcn" o similar en un TODO, debes usar el MCP server correspondiente para obtener la información más actualizada antes de implementar.

---

### 📊 FASE 0: Investigación Competitiva (1 semana)

**Objetivo:** Validar mercado y entender competencia (Rflex) ANTES de desarrollar.

**Duración:** 1 semana (investigación, no desarrollo)

**Por qué primero:** Necesitamos datos reales de Rflex para la landing page y para definir propuesta de valor.

#### TODO 0.1: Entrevista a Usuarios de Rflex

- [ ] Preparar guion de preguntas (10-15 preguntas)
- Entrevistar a novia (usuaria activa de Rflex)
- Preguntas clave:
  - ¿Qué te gusta de Rflex?
  - ¿Qué 3 cosas odias de Rflex?
  - ¿Lo usas en celular o desktop?
  - ¿Cuántas veces al día lo abres?
  - ¿Qué feature te gustaría que tuviera?
  - ¿Cómo es el calendario visual?
  - ¿Tiene validaciones legales automáticas?
- **Resultado:** Lista de pain points validados

#### TODO 0.2: Análisis Técnico de Rflex

- [ ] Si es posible, obtener screenshots de Rflex
- Analizar calendario visual
- Ver si tiene app móvil nativa
- Identificar gaps de features
- Pricing aproximado
- **Resultado:** Tabla comparativa actualizada

#### TODO 0.3: Entrevista al Hospital del Director

- [ ] Contactar jefe de Kinesiología (área sin Rflex)
- Preguntas:
  - ¿Por qué Kinesiología NO usa Rflex?
  - ¿Cómo gestionan turnos actualmente? (Excel/papel)
  - ¿Cuáles son los 3 mayores problemas?
  - ¿Cuántas personas son en el equipo?
  - ¿Estarían dispuestos a piloto gratis de VITA?
- **Resultado:** Validación de necesidad + compromiso de piloto

#### TODO 0.4: Documentar Findings

- [ ] Actualizar sección "Análisis Competitivo" del plan
- Llenar tabla comparativa Rflex vs VITA con datos reales
- Ajustar pricing en base a lo que cobra Rflex
- Preparar argumentos de venta basados en pain points reales
- **Resultado:** Plan actualizado con datos validados

**✅ Checkpoint FASE 0:**

- Tienes usuarios reales dispuestos a piloto
- Conoces pain points específicos de Rflex
- Tienes argumentos de venta claros basados en evidencia
- Pricing validado vs competencia
- Compromiso de piloto con hospital

---

### 🎨 FASE 1: Landing Page & Branding (Marketing First)

**Objetivo:** Crear la cara pública de VITA con componentes reutilizables.

**Dependencias a instalar:**

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
```

**Nota:** shadcn instalará automáticamente las dependencias que necesite (como `lucide-react` si los componentes usan iconos). NO instalar dependencias extra manualmente.

#### TODO 1.1: Configurar Tailwind v4 con paleta médica

- [ ] [ ] Editar `app/globals.css`
- [ ] Agregar variables CSS para colores médicos (azul, verde, ámbar)
- [ ] Configurar dark mode
- [ ] Agregar `cursor: pointer` para botones y links
- [ ] **Resultado:** Paleta de colores lista para usar

#### TODO 1.2: Instalar shadcn/ui y componentes base

- [ ] [ ] Ejecutar `npx shadcn@latest init`
- [ ] Instalar: `button`, `card`, `badge`
- [ ] Configurar `components.json`
- [ ] **Resultado:** Componentes UI listos

#### TODO 1.3: Crear componentes atómicos reutilizables

- [ ] [ ] `components/ui/button.tsx` - Botón con variantes
- [ ] `components/ui/badge.tsx` - Badge para estados
- [ ] `components/ui/card.tsx` - Tarjetas
- [ ] **Resultado:** Átomos listos para componer

#### TODO 1.4: Crear Navbar reutilizable

- [ ] [ ] `components/dashboard/navbar.tsx` (Server Component)
- [ ] Logo VITA (ícono médico)
- [ ] Links: Inicio, Características, Planes, Contacto
- [ ] Botón "Iniciar Sesión" (deshabilitado por ahora)
- [ ] Responsive con menú hamburguesa para mobile
- [ ] **Resultado:** Navbar funcional y responsive

#### TODO 1.5: Crear Footer reutilizable

- [ ] [ ] `components/dashboard/footer.tsx` (Server Component)
- [ ] 3 columnas: Producto, Legal, Redes Sociales
- [ ] Links a páginas legales (crearemos después)
- [ ] Copyright dinámico con año actual
- [ ] **Resultado:** Footer completo

#### TODO 1.6: Landing Page - Hero Section

- [ ] [ ] `app/page.tsx` (Server Component)
- [ ] Título: "Gestiona turnos médicos con VITA"
- [ ] Subtítulo: Descripción breve del problema que resuelve
- [ ] CTA: "Solicitar Demo" (deshabilitado por ahora)
- [ ] Imagen o ilustración médica (placeholder por ahora)
- [ ] **Resultado:** Hero section atractivo

#### TODO 1.7: Landing Page - Sección de Características

- [ ] [ ] Grid de 3 características principales:
  - [ ] 📅 Calendario Inteligente
  - [ ] 👥 Multi-organización
  - [ ] ✅ Validaciones Legales
- [ ] Cada una con ícono, título y descripción
- [ ] **Resultado:** Características visibles

#### TODO 1.8: Landing Page - Sección de Planes

- [ ] [ ] 3 tarjetas de pricing:
  - [ ] BASIC: 50 cuentas
  - [ ] PRO: 200 cuentas
  - [ ] ENTERPRISE: Custom
- [ ] Mostrar precio, features incluidas
- [ ] Botón "Contactar Ventas" (placeholder)
- [ ] **Resultado:** Pricing claro

#### TODO 1.9: Crear páginas legales con contenido dummy

- [ ] [ ] `app/(legal)/terminos/page.tsx` - Términos y Condiciones
- [ ] `app/(legal)/privacidad/page.tsx` - Política de Privacidad
- [ ] Usar Lorem Ipsum estructurado con headings
- [ ] Layout simple con navbar y footer
- [ ] **Resultado:** Páginas legales funcionales

#### TODO 1.10: Implementar Dark Mode con next-themes

- [ ] **IMPORTANTE:** shadcn/ui NO tiene dark mode nativo. Requiere `next-themes`.
- [ ] Instalar: `npm install next-themes`
- [ ] Seguir documentación oficial de shadcn: https://ui.shadcn.com/docs/dark-mode
- [ ] Crear `components/providers/theme-provider.tsx` con NextThemesProvider
- [ ] Agregar ThemeProvider al layout root
- [ ] Crear componente `theme-toggle.tsx` con switch luz/oscuro
- [ ] Agregar toggle al navbar
- [ ] Probar que todos los colores se ven bien en ambos modos
- [ ] **Resultado:** Dark mode funcional con next-themes

**✅ Checkpoint FASE 1:**

- `npm run dev` → Landing page completa y bonita
- Dark mode funciona
- Todas las páginas navegables
- Responsive en mobile/tablet/desktop

---

### 🗄️ FASE 2: Base de Datos y Configuración (Backend Setup)

**Objetivo:** Configurar Prisma, base de datos y modelos básicos.

**Dependencias a instalar:**

```bash
npm install prisma @prisma/client
npm install zod
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

#### TODO 2.1: Configurar Prisma con Supabase

- [ ] [ ] **IMPORTANTE:** Consultar MCP server de Supabase para configuración actualizada con Prisma
- [ ] `npx prisma init`
- [ ] Crear `.env.local` con template
- [ ] Configurar `DATABASE_URL` y `DIRECT_URL` según documentación de Supabase
- [ ] Agregar `.env.local` a `.gitignore`
- [ ] Crear `.env.example` con template
- [ ] **Resultado:** Prisma configurado correctamente con Supabase

#### TODO 2.2: Definir schema Prisma - Modelos de Usuario y Auth

- [ ] [ ] Modelo `User` completo
- [ ] Modelo `Account` (para Auth.js)
- [ ] Modelo `Session` (para Auth.js)
- [ ] Índices necesarios
- [ ] **Resultado:** Modelos de autenticación listos

#### TODO 2.3: Definir schema Prisma - Modelos de Organización

- [ ] [ ] Modelo `Organization`
- [ ] Modelo `OrganizationMember` (roles multi-tenant)
- [ ] Modelo `Area`
- [ ] Relaciones entre modelos
- [ ] **Resultado:** Multi-tenancy configurado

#### TODO 2.4: Definir schema Prisma - Modelos de Turnos

- [ ] [ ] Modelo `ShiftType`
- [ ] Modelo `Shift`
- [ ] Modelo `ShiftExchange`
- [ ] Enums para estados
- [ ] **Resultado:** Sistema de turnos modelado

#### TODO 2.5: Definir schema Prisma - Modelos Complementarios

- [ ] [ ] Modelo `StaffRate` (tarifas)
- [ ] Modelo `Holiday` (feriados chilenos)
- [ ] Modelo `Payment` (pagos de organizaciones)
- [ ] Modelo `Attendance` (asistencia)
- [ ] **Resultado:** Schema completo

#### TODO 2.6: Ejecutar primera migración

- [ ] [ ] `npx prisma migrate dev --name init`
- [ ] Verificar que se crea la BD en Supabase
- [ ] `npx prisma generate` para generar cliente
- [ ] **Resultado:** Base de datos creada

#### TODO 2.7: Crear cliente Prisma singleton

- [ ] [ ] `lib/db/prisma.ts`
- [ ] Singleton pattern para desarrollo y producción
- [ ] **Resultado:** Cliente Prisma listo para usar

#### TODO 2.8: Seed - Feriados chilenos 2024-2025

- [ ] [ ] `prisma/seed.ts`
- [ ] Feriados normales e irrenunciables
- [ ] Script de upsert
- [ ] Agregar script en `package.json`
- [ ] `npm run prisma:seed`
- [ ] **Resultado:** Feriados en BD

#### TODO 2.9: Crear utilidades de validación RUT

- [ ] [ ] `lib/validations/rut.ts`
- [ ] Funciones: `cleanRut`, `formatRut`, `validateRut`, `calculateVerifier`
- [ ] Tests manuales con console.log
- [ ] **Resultado:** Validación RUT funcional

#### TODO 2.10: Schemas Zod para autenticación

- [ ] [ ] `lib/validations/auth.ts`
- [ ] `loginSchema` (email, password)
- [ ] `registerSchema` (name, email, rut, password, confirmPassword)
- [ ] Validación de RUT integrada
- [ ] **Resultado:** Validaciones listas

**✅ Checkpoint FASE 2:**

- Prisma Studio funciona: `npx prisma studio`
- Se pueden ver todas las tablas vacías
- Tabla `Holiday` tiene datos
- Validación de RUT funciona

---

### 🔐 FASE 3: Autenticación Completa (Auth.js v5)

**Objetivo:** Sistema de login y registro funcional.

**Dependencias a instalar:**

```bash
npm install next-auth@beta
npm install @auth/core @auth/prisma-adapter
```

#### TODO 3.1: Configurar Auth.js v5

- [x] `lib/auth/config.ts`
- [x] Configurar `PrismaAdapter` con `@prisma/adapter-pg`
- [x] Configurar `Credentials` provider
- [x] Configurar Google OAuth provider
- [x] JWT y session callbacks
- [x] **Resultado:** Auth.js configurado ✅

#### TODO 3.2: Crear helpers de sesión

- [x] `lib/auth/session.ts`
- [x] `getCurrentUser()` - Obtener usuario actual
- [x] `requireAuth()` - Proteger rutas
- [x] `requireSuperAdmin()` - Solo SUPER_ADMIN
- [x] `getUserWithOrganization()` - Usuario con organización
- [x] **Resultado:** Helpers de autenticación ✅

#### TODO 3.3: Crear helpers RBAC

- [x] `lib/auth/rbac.ts` (separado para mejor organización)
- [x] `hasRole()`, `isSuperAdmin()`, `isAdminHR()`, etc.
- [x] `canManageOrganization()`, `canManageShifts()`, etc.
- [x] `canViewShifts()`, `canManageStaff()`, `canManageRates()`
- [x] **Resultado:** Sistema de permisos ✅

#### TODO 3.4: Exportar handlers de Auth.js

- [x] `lib/auth/index.ts`
- [x] Exportar `authOptions`, `prisma`, helpers de sesión y RBAC
- [x] Exportar tipos `CurrentUser`
- [x] **Resultado:** Auth listo para usar ✅

#### TODO 3.5: Crear route handler para Auth.js

- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] Exportar `GET` y `POST` handlers
- [x] **Resultado:** API de auth funcionando ✅

#### TODO 3.6: Server Actions de autenticación

- [x] `actions/auth/auth-actions.ts`
- [x] `registerAction(formData)` - Crear usuario con hash de password (bcrypt)
- [x] `loginAction(formData)` - Verificar credenciales
- [x] `logoutAction()` - Cerrar sesión
- [x] Validación con Zod (`lib/validations/auth.ts`)
- [x] Validación de RUT chileno (`lib/validations/rut.ts`)
- [x] **Resultado:** Actions de auth ✅

#### TODO 3.7: Crear proxy.ts (middleware)

- [x] `proxy.ts` en raíz
- [x] Proteger rutas privadas con `getToken` de NextAuth
- [x] Redirect a login si no autenticado
- [x] Redirect a home si ya autenticado en rutas de auth
- [x] Mantener lógica de i18n
- [x] **Resultado:** Rutas protegidas ✅

#### TODO 3.8: Página de Registro - UI

- [x] `app/[locale]/register/page.tsx` (Server Component wrapper)
- [x] `components/auth/register-form.tsx` (Client Component)
- [x] Campos: Nombre, Email, RUT, Password, Confirmar Password
- [x] Validación en tiempo real del RUT
- [x] Loading states
- [x] Manejo de errores por campo
- [x] **Resultado:** UI de registro completa ✅

#### TODO 3.9: Página de Login - UI

- [x] `app/[locale]/login/page.tsx` (Server Component wrapper)
- [x] `components/auth/login-form.tsx` (Client Component)
- [x] Campos: Email, Password
- [x] Checkbox "Recordarme" (opcional)
- [x] Link a "¿Olvidaste tu contraseña?" (placeholder)
- [x] Botón de Google OAuth
- [x] Loading states
- [x] **Resultado:** UI de login completa ✅

#### TODO 3.10: Conectar formularios con Server Actions

- [x] Integrar `registerAction` en `RegisterForm`
- [x] Integrar `loginAction` en `LoginForm`
- [x] Integrar `signIn('credentials')` después de validación
- [x] Redirect después del éxito
- [x] Manejo de errores por campo
- [x] **Resultado:** Auth funcional end-to-end ✅

#### TODO 3.11: Actualizar navbar con estado de sesión

- [x] `components/layout/navbar.tsx`
- [x] Mostrar "Iniciar Sesión" si no hay sesión
- [x] Mostrar nombre de usuario y avatar si hay sesión
- [x] Dropdown con "Cerrar Sesión"
- [x] Integrado en `app/[locale]/layout.tsx`
- [x] **Resultado:** Navbar con auth ✅

**✅ Checkpoint FASE 3:**

- ✅ Registrar usuario nuevo funciona (con validación de RUT)
- ✅ Login con credenciales funciona
- ✅ Login con Google OAuth funciona
- ✅ Sesión persiste después de refresh
- ✅ Logout funciona
- ✅ Rutas protegidas redirigen a login
- ✅ Rutas de auth redirigen a home si ya autenticado
- ✅ Navbar muestra estado de sesión
- ✅ Validación completa con Zod
- ✅ Hash de contraseñas con bcrypt
- ✅ Prisma configurado con adapter de PostgreSQL para Supabase

**Notas de implementación:**

- Prisma 7.1.0 requiere `engineType = "library"` y adapter explícito
- Usado `@prisma/adapter-pg` con `pg.Pool` para Supabase
- Validación de RUT chileno implementada y funcionando
- Server Actions separados en `actions/auth/`
- Helpers RBAC separados en `lib/auth/rbac.ts` para mejor organización

---

### 👨‍💼 FASE 4: Dashboard SUPER_ADMIN (Gestión de Organizaciones)

**Objetivo:** Panel para administrar hospitales/clínicas.

**Dependencias a instalar:**

```bash
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npm install sonner
```

#### TODO 4.1: Layout del dashboard SUPER_ADMIN

- [ ] `app/(super-admin)/layout.tsx`
- [ ] Sidebar con navegación
- [ ] Links: Dashboard, Organizaciones, Pagos, Analytics
- [ ] Header con usuario y logout
- [ ] Solo accesible para SUPER_ADMIN
- [ ] **Resultado:** Layout del dashboard

#### TODO 4.2: Página principal del dashboard

- [ ] `app/(super-admin)/page.tsx`
- [ ] Mensaje de bienvenida
- [ ] 4 tarjetas de estadísticas (mock data por ahora):
  - [ ] Total organizaciones
  - [ ] Organizaciones activas
  - [ ] Pagos pendientes
  - [ ] Ingresos mensuales
- [ ] **Resultado:** Dashboard principal

#### TODO 4.3: Schemas Zod para organizaciones

- [ ] `lib/validations/organization.ts`
- [ ] `createOrganizationSchema`
- [ ] Validaciones de businessName, contactEmail, phone, etc.
- [ ] **Resultado:** Validación lista

#### TODO 4.4: Server Actions - CRUD organizaciones

- [ ] `actions/organizations/organization-actions.ts`
- [ ] `createOrganizationAction(formData)`
- [ ] `getOrganizationsAction()` - Listar todas
- [ ] `getOrganizationByIdAction(id)`
- [ ] `updateOrganizationAction(id, formData)`
- [ ] `deleteOrganizationAction(id)` - Soft delete
- [ ] **Resultado:** Actions de organizaciones

#### TODO 4.5: Página listar organizaciones

- [ ] `app/(super-admin)/organizations/page.tsx`
- [ ] Tabla con todas las organizaciones
- [ ] Columnas: Nombre, Estado, Plan, Cuentas, Acciones
- [ ] Badges de color según estado
- [ ] Botón "Nueva Organización"
- [ ] **Resultado:** Lista de organizaciones

#### TODO 4.6: Componente tabla de organizaciones

- [ ] `components/organizations/organization-table.tsx`
- [ ] Reutilizable con props
- [ ] Acciones: Ver, Editar, Suspender
- [ ] **Resultado:** Tabla reutilizable

#### TODO 4.7: Página crear organización

- [ ] `app/(super-admin)/organizations/new/page.tsx`
- [ ] Formulario con `OrganizationForm`
- [ ] Campos: businessName, contactName, contactEmail, phone, maxAccounts
- [ ] **Resultado:** Crear organización funciona

#### TODO 4.8: Componente formulario de organización

- [ ] `components/organizations/organization-form.tsx` (Client Component)
- [ ] Reutilizable para crear y editar
- [ ] Validación con Zod
- [ ] Loading states
- [ ] **Resultado:** Formulario reutilizable

#### TODO 4.9: Página ver detalles de organización

- [ ] `app/(super-admin)/organizations/[id]/page.tsx`
- [ ] Mostrar toda la información
- [ ] Badges de estado
- [ ] Botones: Editar, Suspender/Reactivar
- [ ] Historial de pagos (lista vacía por ahora)
- [ ] **Resultado:** Ver detalles

#### TODO 4.10: Página editar organización

- [ ] `app/(super-admin)/organizations/[id]/edit/page.tsx`
- [ ] Reutiliza `OrganizationForm` con datos pre-cargados
- [ ] **Resultado:** Editar funciona

#### TODO 4.11: Server Actions - Suspensión

- [ ] `actions/organizations/suspension-actions.ts`
- [ ] `suspendOrganizationAction(id, reason)` - Razón obligatoria
- [ ] `reactivateOrganizationAction(id)`
- [ ] **Resultado:** Suspender/reactivar listo

#### TODO 4.12: Componente dialog de suspensión

- [ ] `components/organizations/suspend-dialog.tsx` (Client Component)
- [ ] Dialog con textarea para razón
- [ ] Confirmación destructiva
- [ ] **Resultado:** Suspender con razón

#### TODO 4.13: Botón de reactivación

- [ ] `components/organizations/reactivate-button.tsx` (Client Component)
- [ ] Confirmación simple
- [ ] **Resultado:** Reactivar funciona

**✅ Checkpoint FASE 4:**

- Crear organización funciona
- Ver lista de organizaciones
- Editar organización funciona
- Suspender con razón funciona
- Reactivar funciona
- Estado se refleja en badges

---

### 💳 FASE 5: Gestión de Pagos (SUPER_ADMIN)

**Objetivo:** Registrar pagos manualmente para organizaciones.

#### TODO 5.1: Server Actions - Pagos

- [ ] `actions/organizations/payment-actions.ts`
- [ ] `recordPaymentAction(organizationId, formData)`
- [ ] `getPaymentHistoryAction(organizationId)`
- [ ] **Resultado:** Actions de pagos

#### TODO 5.2: Componente formulario de pago

- [ ] `components/organizations/payment-form.tsx` (Client Component)
- [ ] Campos: amount, currency, paymentMethod, paymentDate, periodStart, periodEnd, notes
- [ ] Selects para currency y paymentMethod
- [ ] Date pickers
- [ ] **Resultado:** Formulario de pago

#### TODO 5.3: Página registrar pagos

- [ ] `app/(super-admin)/payments/page.tsx`
- [ ] Select para elegir organización
- [ ] Formulario de pago
- [ ] **Resultado:** Registrar pagos funciona

#### TODO 5.4: Componente historial de pagos

- [ ] `components/organizations/payment-history-table.tsx`
- [ ] Tabla con: Fecha, Monto, Método, Período, Estado
- [ ] Mostrar en página de detalles de organización
- [ ] **Resultado:** Ver historial

#### TODO 5.5: Integrar pagos en detalles de organización

- [ ] Actualizar `app/(super-admin)/organizations/[id]/page.tsx`
- [ ] Mostrar historial de pagos
- [ ] Botón "Registrar Pago" inline
- [ ] **Resultado:** Pagos integrados

**✅ Checkpoint FASE 5:**

- Registrar pago funciona
- Ver historial de pagos
- Pagos se asocian a la organización correcta

---

### 📊 FASE 6: Analytics Básicas (SUPER_ADMIN)

**Objetivo:** Métricas y reportes para el super admin.

#### TODO 6.1: Server Actions - Analytics

- [ ] `actions/analytics/analytics-actions.ts`
- [ ] `getSuperAdminAnalyticsAction()`
- [ ] Calcular: total organizaciones, activas, suspendidas, ingresos del mes, etc.
- [ ] **Resultado:** Analytics listo

#### TODO 6.2: Componente tarjeta de estadísticas

- [ ] `components/dashboard/stats-card.tsx`
- [ ] Reutilizable con props: title, value, icon, trend
- [ ] **Resultado:** Stats card

#### TODO 6.3: Página de analytics

- [ ] `app/(super-admin)/analytics/page.tsx`
- [ ] Grid de stats cards
- [ ] Tabla de organizaciones con próximo pago debido
- [ ] **Resultado:** Analytics funcional

#### TODO 6.4: Actualizar dashboard principal

- [ ] Conectar `app/(super-admin)/page.tsx` con analytics reales
- [ ] Reemplazar mock data
- [ ] **Resultado:** Dashboard con datos reales

**✅ Checkpoint FASE 6:**

- Analytics muestran datos reales
- Estadísticas se actualizan al crear/editar/suspender
- Dashboard principal funcional

---

### 🏢 FASE 7: Dashboard ADMIN_HR (Recursos Humanos)

**Objetivo:** Panel para que RRHH gestione áreas, tipos de turno y tarifas.

**Dependencias nuevas:** Ninguna

#### TODO 7.1: Layout del dashboard ADMIN_HR

- [ ] `app/(dashboard)/hr/layout.tsx`
- [ ] Sidebar con navegación específica
- [ ] Links: Dashboard, Áreas, Tipos de Turno, Tarifas, Jefes
- [ ] **Resultado:** Layout HR

#### TODO 7.2: Página principal HR

- [ ] `app/(dashboard)/hr/page.tsx`
- [ ] Resumen: Total áreas, tipos de turno, personal, jefes
- [ ] **Resultado:** Dashboard HR

#### TODO 7.3: CRUD Áreas - Server Actions

- [ ] `actions/areas/area-actions.ts`
- [ ] `createAreaAction`, `getAreasAction`, `updateAreaAction`, `deleteAreaAction`
- [ ] **Resultado:** Actions de áreas

#### TODO 7.4: Página de áreas

- [ ] `app/(dashboard)/hr/areas/page.tsx`
- [ ] Lista de áreas con nombre y descripción
- [ ] Botón crear nueva área
- [ ] **Resultado:** Gestión de áreas

#### TODO 7.5: CRUD Tipos de Turno - Server Actions

- [ ] `actions/shift-types/shift-type-actions.ts`
- [ ] Crear, listar, editar, eliminar tipos de turno
- [ ] **Resultado:** Actions de tipos de turno

#### TODO 7.6: Página de tipos de turno

- [ ] `app/(dashboard)/hr/shift-types/page.tsx`
- [ ] Lista con: nombre, duración, clasificación, color
- [ ] Formulario para crear/editar
- [ ] **Resultado:** Gestión de tipos de turno

#### TODO 7.7: CRUD Tarifas - Server Actions

- [ ] `actions/rates/rate-actions.ts`
- [ ] Crear, listar, editar tarifas por usuario
- [ ] **Resultado:** Actions de tarifas

#### TODO 7.8: Página de tarifas

- [ ] `app/(dashboard)/hr/rates/page.tsx`
- [ ] Lista de tarifas por personal
- [ ] Formulario para configurar tarifa
- [ ] Historial de cambios
- [ ] **Resultado:** Gestión de tarifas

**✅ Checkpoint FASE 7:**

- HR puede crear áreas
- HR puede crear tipos de turno
- HR puede configurar tarifas
- Todo se guarda en BD correctamente

---

### 👔 FASE 8: Dashboard CHIEF_AREA (Jefe de Área)

**Objetivo:** Panel para que jefes gestionen su personal y turnos.

#### TODO 8.1: Layout del dashboard CHIEF

- [ ] `app/(dashboard)/chief/layout.tsx`
- [ ] Sidebar: Dashboard, Calendario, Personal, Turnos, Aprobaciones
- [ ] **Resultado:** Layout CHIEF

#### TODO 8.2: Sistema de vinculación - Generar código

- [ ] Agregar campo `linkingCode` a User al registrarse
- [ ] Formato: `PERS-2024-001234`
- [ ] **Resultado:** Códigos generados

#### TODO 8.3: Server Actions - Vinculación

- [ ] `actions/users/linking-actions.ts`
- [ ] `linkStaffAction(linkingCode, areaId)`
- [ ] `getStaffByCodeAction(code)`
- [ ] `approveLink Action(membershipId)`
- [ ] `unlinkStaffAction(membershipId)`
- [ ] **Resultado:** Actions de vinculación

#### TODO 8.4: Página vincular personal

- [ ] `app/(dashboard)/chief/staff/link/page.tsx`
- [ ] Input para código de vinculación
- [ ] Mostrar preview del personal
- [ ] Botón confirmar
- [ ] **Resultado:** Vincular funciona

#### TODO 8.5: Página lista de personal

- [ ] `app/(dashboard)/chief/staff/page.tsx`
- [ ] Tabla con personal vinculado
- [ ] Acciones: Ver, Desvincular
- [ ] **Resultado:** Ver personal

#### TODO 8.6: Server Actions - Turnos

- [ ] `actions/shifts/shift-actions.ts`
- [ ] `createShiftAction`, `getShiftsAction`, `updateShiftAction`, `deleteShiftAction`
- [ ] **Resultado:** Actions de turnos

#### TODO 8.7: Validaciones legales

- [ ] `actions/shifts/validation-actions.ts`
- [ ] `validateWeeklyHoursAction(userId, date)`
- [ ] `validateMinimumRestAction(userId, date)`
- [ ] **Resultado:** Validaciones

#### TODO 8.8: Página asignar turnos

- [ ] `app/(dashboard)/chief/shifts/assign/page.tsx`
- [ ] Seleccionar fecha, tipo de turno, horario, personal
- [ ] Mostrar validaciones en tiempo real
- [ ] **Resultado:** Asignar turnos

**✅ Checkpoint FASE 8:**

- Jefe puede vincular personal
- Jefe puede asignar turnos
- Validaciones funcionan
- Turnos se guardan en BD

---

### 👨‍⚕️ FASE 9: Dashboard STAFF_HEALTH (Personal de Salud)

**Objetivo:** Panel para que el personal vea sus turnos.

#### TODO 9.1: Layout del dashboard STAFF

- [ ] `app/(dashboard)/staff/layout.tsx`
- [ ] Sidebar: Dashboard, Mi Calendario, Turnos Abiertos, Intercambios, Perfil
- [ ] **Resultado:** Layout STAFF

#### TODO 9.2: Página Mi Calendario

- [ ] `app/(dashboard)/staff/calendar/page.tsx`
- [ ] Ver todos sus turnos
- [ ] Filtrar por organización
- [ ] Vista mensual simple (sin calendario complejo)
- [ ] **Resultado:** Ver turnos

#### TODO 9.3: Página de perfil

- [ ] `app/(dashboard)/staff/profile/page.tsx`
- [ ] Ver y editar datos personales
- [ ] Ver código de vinculación
- [ ] **Resultado:** Perfil funcional

**✅ Checkpoint FASE 9:**

- Personal puede ver sus turnos
- Personal puede ver su código de vinculación
- Personal puede editar su perfil

---

### 🛡️ FASE 10: Seguridad y Upload de Archivos

**Objetivo:** Rate limiting, health checks, y upload de fotos de perfil.

**Duración:** 3-5 días

**Dependencias a instalar:**

```bash
npm install @upstash/ratelimit @upstash/redis
npm install @supabase/supabase-js
```

#### TODO 10.1: Configurar Upstash Redis (Rate Limiting)

- [ ] Crear cuenta en Upstash (free tier: 10K requests/día)
- [ ] Obtener `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- [ ] Agregar a `.env.local`
- [ ] **Resultado:** Redis configurado

#### TODO 10.2: Rate Limiting en Server Actions críticos

- [ ] `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests cada 10 seg
})

export const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 intentos cada 15 min
})
```

- [ ] Aplicar en `loginAction` y `registerAction`
- [ ] Aplicar en actions críticos (crear turno, vincular personal)
- [ ] **Resultado:** Anti-spam funcional

#### TODO 10.3: Health Check Endpoint

- [ ] `app/api/health/route.ts`

```typescript
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        database: 'disconnected',
      },
      { status: 503 }
    )
  }
}
```

- [ ] Configurar UptimeRobot para pingear cada 5 min
- [ ] **Resultado:** Monitoreo activo

#### TODO 10.4: Configurar Supabase Storage

- [ ] Crear bucket `avatars` en Supabase Storage (público)
- [ ] Políticas RLS:
  - Cualquiera puede leer
  - Solo usuario autenticado puede subir su propia foto
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Resultado:** Storage configurado

#### TODO 10.5: Server Action para Upload de Avatar

- [ ] `actions/user/upload-avatar-action.ts`

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'

import { auth } from '@/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadAvatarAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const file = formData.get('avatar') as File
  if (!file) {
    return { success: false, error: 'No se recibió archivo' }
  }

  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Solo imágenes' }
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'Máximo 2MB' }
  }

  const fileName = `${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) {
    return { success: false, error: error.message }
  }

  const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl

  // Actualizar BD
  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: publicUrl },
  })

  return { success: true, url: publicUrl }
}
```

- [ ] **Resultado:** Upload funcional

#### TODO 10.6: UI para Cambiar Avatar

- [ ] `components/profile/avatar-upload.tsx` (Client Component)
- [ ] Input file con preview
- [ ] Drag & drop opcional
- [ ] Loading state durante upload
- [ ] Mostrar avatar actual si existe
- [ ] **Resultado:** UI completa

#### TODO 10.7: Integrar en Perfil de Usuario

- [ ] Agregar en `app/(dashboard)/staff/profile/page.tsx`
- [ ] Mostrar avatar en header/navbar de todos los dashboards
- [ ] **Resultado:** Avatar visible en toda la app

**✅ Checkpoint FASE 10:**

- Rate limiting protege endpoints críticos
- Health check monitoreado por UptimeRobot
- Usuarios pueden subir foto de perfil
- Fotos se muestran en navbar
- Sin vulnerabilidades de upload

---

### 📅 FASE 11: Calendario Visual con react-big-calendar

**Objetivo:** Calendario visual para ver turnos del mes con react-big-calendar.

**Duración:** 4-6 días

**Dependencias:**

```bash
npm install react-big-calendar date-fns date-fns-tz
```

#### TODO 11.1: Configurar date-fns con timezone Chile

- [ ] `lib/utils/date.ts`

```typescript
import { format } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { es } from 'date-fns/locale'

const CHILE_TZ = 'America/Santiago'

export const toChileTime = (date: Date) => utcToZonedTime(date, CHILE_TZ)
export const toUTC = (date: Date) => zonedTimeToUtc(date, CHILE_TZ)
export const formatChileDate = (date: Date, formatStr: string) =>
  format(toChileTime(date), formatStr, { locale: es })
```

- [ ] **Resultado:** Timezone configurado

#### TODO 11.2: Configurar react-big-calendar

- [ ] `components/calendar/big-calendar.tsx` (Client Component)
- [ ] Importar estilos: `import 'react-big-calendar/lib/css/react-big-calendar.css'`
- [ ] Configurar localización español con date-fns
- [ ] Custom toolbar con filtros
- [ ] **Resultado:** Calendario base

#### TODO 11.3: Estilizar calendario con Tailwind

- [ ] `app/globals.css` - Custom CSS para react-big-calendar
- [ ] Colores según tipo de turno (día/noche/mixto)
- [ ] Responsive mobile
- [ ] Dark mode compatible
- [ ] **Resultado:** Calendario estilizado

#### TODO 11.4: Adaptar turnos a formato de react-big-calendar

- [ ] Server Action: `getCalendarShiftsAction(month, year)`
- [ ] Transformar `Shift` de Prisma a formato `Event` de react-big-calendar

```typescript
{
  title: 'Turno Largo - María González',
  start: new Date(shift.startTime),
  end: new Date(shift.endTime),
  resource: { shiftId: shift.id, color: shift.type.color }
}
```

- [ ] **Resultado:** Data adapter funcional

#### TODO 11.5: Integrar calendario en CHIEF dashboard

- [ ] `app/(dashboard)/chief/calendar/page.tsx`
- [ ] Vista mensual por defecto
- [ ] Click en turno → Modal con detalles
- [ ] Drag & drop para reasignar turnos (opcional MVP1)
- [ ] **Resultado:** CHIEF puede ver calendario

#### TODO 11.6: Integrar calendario en STAFF dashboard

- [ ] `app/(dashboard)/staff/calendar/page.tsx`
- [ ] Solo turnos del usuario actual
- [ ] Vista read-only (sin drag & drop)
- [ ] **Resultado:** STAFF puede ver sus turnos

**✅ Checkpoint FASE 11:**

- Calendario muestra turnos correctamente
- Localización español funciona
- Se ve bien en mobile y desktop
- Colores según tipo de turno
- Timezone Chile con horario de verano

---

### 🔔 FASE 12: Sistema de Notificaciones

**Objetivo:** Notificaciones toast y emails básicos.

**Duración:** 3-4 días

**Dependencias:**

```bash
npm install resend
npm install @sentry/nextjs
```

#### TODO 12.1: Configurar Sentry (Error Tracking)

- [ ] Crear cuenta en Sentry (free tier: 5K eventos/mes)
- [ ] `npx @sentry/wizard@latest -i nextjs`
- [ ] Agregar `SENTRY_DSN` a `.env.local`
- [ ] Configurar contexto en Server Actions:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.setUser({
  id: session.user.id,
  email: session.user.email,
  organizationId: session.user.organizationId,
})
```

- [ ] Test error boundary con error intencional
- [ ] **Resultado:** Errores capturados en Sentry con contexto

#### TODO 12.2: Configurar toast notifications

- [ ] Ya instalamos `sonner`
- [ ] Agregar `<Toaster />` al layout root
- [ ] **Resultado:** Toasts funcionan

#### TODO 12.3: Configurar Resend

- [ ] Crear cuenta en Resend
- [ ] Verificar dominio o usar dominio de prueba
- [ ] Agregar `RESEND_API_KEY` a `.env`
- [ ] Crear templates de email básicos en `lib/emails/`
- [ ] **Resultado:** Emails configurados

#### TODO 12.4: Enviar email al registrarse

- [ ] Agregar en `registerAction`
- [ ] Email de bienvenida con instrucciones
- [ ] **Resultado:** Email de bienvenida

#### TODO 12.5: Enviar email al asignar turno

- [ ] Agregar en `createShiftAction`
- [ ] Notificar al personal con detalles del turno
- [ ] **Resultado:** Notificación de turno

**✅ Checkpoint FASE 12:**

- Sentry captura errores en producción
- Toasts funcionan en todas las acciones
- Emails se envían correctamente
- Contexto de usuario en error tracking

---

### 🧪 FASE 13: Testing y Pulido

**Objetivo:** Probar todo el flujo end-to-end y pulir detalles.

**Duración:** 1-2 semanas

#### TODO 13.1: Testing manual completo

- [ ] Crear organización
- [ ] Registrar usuario
- [ ] Login
- [ ] Crear áreas y tipos de turno
- [ ] Vincular personal
- [ ] Asignar turnos
- [ ] Ver turnos como personal
- [ ] Subir foto de perfil
- [ ] Probar rate limiting (intentar spam)
- [ ] Verificar timezone Chile (horario de verano)
- [ ] **Resultado:** Flujo completo funciona

#### TODO 13.2: Corregir bugs encontrados

- [ ] Lista de bugs del testing
- [ ] Corregir uno por uno
- [ ] **Resultado:** Bugs corregidos

#### TODO 13.3: Mejorar loading states

- [ ] Asegurar que todos los botones tienen loading
- [ ] Skeletons donde sea necesario
- [ ] **Resultado:** UX mejorada

#### TODO 13.4: Mejorar mensajes de error

- [ ] Mensajes claros y en español
- [ ] **Resultado:** Errores claros

#### TODO 13.5: Accessibility audit

- [ ] Probar navegación por teclado
- [ ] Probar con screen reader
- [ ] **Resultado:** Accesibilidad mejorada

#### TODO 13.6: Performance audit

- [ ] Ejecutar Lighthouse
- [ ] Optimizar imágenes si es necesario
- [ ] **Resultado:** Performance optimizada

#### TODO 13.7: README completo

- [ ] Instrucciones de instalación
- [ ] Variables de entorno necesarias
- [ ] Comandos útiles
- [ ] **Resultado:** README listo

**✅ Checkpoint FASE 13:**

- Todo funciona end-to-end
- Sin bugs críticos
- Accesibilidad buena
- Performance aceptable
- Rate limiting funcional
- Error tracking con Sentry
- Upload de fotos funcional

---

## 🎯 MVP1 COMPLETADO

**Lo que tienes funcionando:**

- ✅ Landing page profesional
- ✅ Sistema de autenticación completo con rate limiting
- ✅ Dashboard SUPER_ADMIN con gestión de organizaciones y pagos
- ✅ Dashboard ADMIN_HR con gestión de áreas, tipos de turno y tarifas
- ✅ Dashboard CHIEF_AREA con vinculación de personal y asignación de turnos
- ✅ Dashboard STAFF_HEALTH para ver turnos
- ✅ Calendario visual con react-big-calendar y timezone Chile
- ✅ Notificaciones email y toast
- ✅ Web responsive (mobile, tablet, desktop)
- ✅ Upload de fotos de perfil con Supabase Storage
- ✅ Error tracking con Sentry
- ✅ Health checks monitoreados

---

## 🔮 MVP2 - Funcionalidades Avanzadas

### FASE 14: Intercambios de Turnos

- [ ] Sistema de solicitudes
- [ ] Aprobación por jefes
- [ ] Notificaciones

### FASE 15: Turnos Abiertos

- [ ] Jefe crea turno sin asignar
- [ ] Personal postula
- [ ] Jefe selecciona

### FASE 16: Asistencia Biométrica (Integraciones MVP2)

- [ ] Webhook API para sistemas biométricos de terceros
  - [ ] ZKTeco (huella)
  - [ ] Anviz (facial + huella)
  - [ ] Suprema BioStar (facial)
- [ ] Check-in/out automático desde webhook
- [ ] Fallback a acreditación manual si falla
- [ ] Alertas de retraso (30 min sin check-in)
- [ ] Dashboard de asistencia para CHIEF

**NOTA:** Hardware biométrico NO incluido (hospitales usan sistemas existentes)

### FASE 17: Liquidaciones Automáticas

- [ ] Cálculo automático de salarios basado en turnos
- [ ] Generación de PDF con Supabase Storage
- [ ] Historial y descarga de liquidaciones
- [ ] Validación de colaboradores (pre-liquidación)

### FASE 18: Reportes Avanzados

- [ ] Reportes por área (turnos, asistencia, costos)
- [ ] Reportes por personal (horas trabajadas, extras)
- [ ] Exportar a Excel/CSV
- [ ] Gráficos con recharts

### FASE 19: App Nativa con Capacitor (Solo STAFF - MVP2)

- [ ] Configurar Capacitor para iOS/Android
- [ ] Adaptar páginas STAFF para export estático
- [ ] Build scripts para iOS y Android
- [ ] Push notifications nativas con @capacitor/push-notifications
- [ ] Publicar en App Store y Google Play (versión beta)

**Preparación para MVP3:** App funcional para integrar GPS y QR

### FASE 20: Métodos Nativos de Asistencia (MVP3 - DIFERENCIADOR)

**🎯 OBJETIVO:** Ofrecer check-in SIN hardware biométrico costoso

#### FASE 20.1: GPS Check-in

- [ ] Configuración de coordenadas por hospital (ADMIN_HR)
- [ ] Radio de check-in configurable (50m, 100m, 200m)
- [ ] Plugin @capacitor/geolocation
- [ ] Validación de ubicación en Server Action
- [ ] UI en app: Botón "He llegado" (solo habilitado dentro del radio)
- [ ] Registro con coordenadas GPS + precisión
- [ ] Dashboard CHIEF: Ver método de check-in (GPS, Manual, Biométrico)

**Ventaja:** $0 hardware vs $500-2000 USD por huellero

#### FASE 20.2: QR Code Check-in

- [ ] Generador de QR diario/por turno (CHIEF)
- [ ] Plugin @capacitor-community/barcode-scanner
- [ ] Escaneo QR desde app
- [ ] Validación de token temporal con expiración
- [ ] Opción web: Mostrar QR en tablet en entrada
- [ ] Security: JWT con firma, validez 24h

**Ventaja:** Flexibilidad sin inversión en hardware biométrico

#### FASE 20.3: Web Check-in Kiosco (Opcional)

- [ ] Página dedicada para tablet en entrada
- [ ] Input RUT + validación de turno
- [ ] Rate limiting (1 check-in cada 5 min por usuario)
- [ ] IP whitelisting (solo red del hospital)
- [ ] UI grande para touch (tipo kiosco)

**Uso:** Complemento para personal sin smartphone

**✅ Checkpoint FASE 20:**

- GPS check-in funcional desde app nativa
- QR code check-in implementado
- Hospital puede elegir método según su necesidad
- **DIFERENCIADOR CLAVE vs Rflex** (sin hardware costoso)

### FASE 21: Internacionalización

- [ ] Migrar `messages.ts` a estructura multi-idioma
- [ ] Implementar `useTranslation` hook
- [ ] Traducir al inglés
- [ ] Selector de idioma en UI
- [ ] (Opcional) Traducir al portugués para Brasil

---

**Este plan es mucho más realista y paso a paso. Cada fase produce algo visible y testeable.**

---

## 📦 DEPENDENCIAS DEL PROYECTO

**Nota:** Las dependencias se instalan **incrementalmente** según las fases. Esta lista muestra las dependencias finales del MVP1.

### Dependencias de Producción

```json
{
  "dependencies": {
    // Framework
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0",

    // Autenticación
    "@auth/core": "^0.41.0",
    "@auth/prisma-adapter": "^2.11.1",
    "next-auth": "^5.0.0-beta.30",
    "bcryptjs": "^3.0.3",

    // Base de Datos
    "@prisma/client": "^6.19.0",

    // Validación
    "zod": "^4.1.12",

    // UI (instaladas por shadcn automáticamente)
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "lucide-react": "^0.469.0", // Instalado por shadcn si lo requiere

    // Dark Mode
    "next-themes": "^0.3.0", // REQUERIDO para dark mode

    // Calendario
    "react-big-calendar": "^1.13.0", // FASE 4
    "date-fns": "^3.0.0", // Para localización del calendario

    // Notificaciones
    "sonner": "^1.x", // FASE 8
    "resend": "^3.x", // FASE 8 (emails)

    // State Management
    "zustand": "^4.5.0", // Para UI local (sidebar, modales)

    // Utilidades
    "tsx": "^4.x"
  }
}
```

### Dependencias de Desarrollo

```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/bcryptjs": "^2.4.6",
    "eslint": "^9",
    "eslint-config-next": "16.0.3",
    "postcss": "^8",
    "prisma": "^6.19.0",
    "tailwindcss": "^4.0.14",
    "typescript": "^5"
  }
}
```

### Dependencias NO Necesarias

❌ **NO instalar estas dependencias:**

- `react-hook-form` - Usaremos FormData nativo con Server Actions
- `react-query` / `@tanstack/react-query` - Usaremos Server Components directamente
- `moment.js` - Usamos date-fns (más ligero)
- `axios` - Usamos fetch nativo
- `lodash` - Implementamos utilidades necesarias manualmente
- `@capacitor/*` - Solo en MVP2 (app nativa)

**Principio:** Instalar solo lo estrictamente necesario. Evitar dependencias pesadas innecesarias.

---

## 🎨 DISEÑO Y UX

### Principios de Diseño

**1. Clean & Professional (Limpio y Profesional)**

- [ ] Espacios en blanco generosos
- Tipografía clara y legible (Inter)
- [ ] Sin elementos decorativos innecesarios
- Enfoque en funcionalidad sobre estética excesiva

**2. Accesibilidad First**

- [ ] Contraste WCAG AAA
- Navegación por teclado completa
- [ ] Screen reader friendly
- Textos descriptivos en todas las acciones

**3. Mobile-First**

- [ ] Diseñado primero para pantallas pequeñas
- Touch targets de mínimo 44x44px
- [ ] Menús colapsables
- Sin hover states críticos (usar click/tap)

**4. Feedback Inmediato**

- [ ] Loading states visibles
- Animaciones sutiles (150-300ms)
- [ ] Toast notifications claras
- Confirmaciones explícitas en acciones destructivas

**5. Consistencia Visual**

- [ ] Mismo diseño de botones en toda la app
- Paleta de colores limitada y consistente
- [ ] Iconografía uniforme (lucide-react)
- Espaciado basado en sistema (4px, 8px, 12px, 16px, 24px, 32px)

---

### Paleta de Colores Expandida

**Colores Primarios (Psicología del Color Médico):**

```css
/* Azul Médico - Confianza, profesionalismo, seguridad */
--primary: 217 91% 60%; /* #3b82f6 */
--primary-foreground: 0 0% 100%; /* Texto sobre azul */

/* Verde Salud - Vida, salud, aprobación */
--secondary: 142 71% 45%; /* #16a34a */
--secondary-foreground: 0 0% 100%;

/* Ámbar Atención - Advertencias, pendientes */
--accent: 38 92% 50%; /* #f59e0b */
--accent-foreground: 0 0% 0%;
```

**Colores de Estado (Turnos):**

```css
/* Turno Programado */
--status-scheduled: 217 91% 60%; /* Azul */

/* Turno En Progreso */
--status-in-progress: 38 92% 50%; /* Ámbar */

/* Turno Completado */
--status-completed: 142 71% 45%; /* Verde */

/* Turno Cancelado */
--status-cancelled: 215 16% 47%; /* Gris */

/* Turno Abierto (sin asignar) */
--status-open: 280 83% 48%; /* Púrpura */
```

**Colores de Feriados:**

```css
/* Feriado Normal */
--holiday-normal: 14 87% 55%; /* Naranja */

/* Feriado Irrenunciable */
--holiday-mandatory: 0 72% 51%; /* Rojo */

/* Fin de Semana */
--weekend: 262 83% 58%; /* Índigo */
```

**Colores Semánticos:**

```css
/* Éxito */
--success: 142 71% 45%;
--success-foreground: 0 0% 100%;

/* Error/Destructivo */
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;

/* Advertencia */
--warning: 38 92% 50%;
--warning-foreground: 0 0% 0%;

/* Información */
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
```

**Grises (Fondos y Textos):**

```css
/* Light Mode */
--background: 0 0% 100%; /* Blanco */
--foreground: 240 10% 3.9%; /* Casi negro */
--muted: 240 4.8% 95.9%; /* Gris muy claro */
--muted-foreground: 240 3.8% 46.1%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;

/* Dark Mode */
.dark {
  --background: 240 10% 3.9%; /* Casi negro */
  --foreground: 0 0% 98%; /* Casi blanco */
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
}
```

---

### Tipografía

**Font Family:**

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

**Escala Tipográfica:**

| Elemento   | Clase Tailwind           | Tamaño | Peso | Uso                           |
| ---------- | ------------------------ | ------ | ---- | ----------------------------- |
| H1         | `text-4xl font-bold`     | 36px   | 700  | Títulos principales de página |
| H2         | `text-3xl font-bold`     | 30px   | 700  | Secciones importantes         |
| H3         | `text-2xl font-semibold` | 24px   | 600  | Sub-secciones                 |
| H4         | `text-xl font-semibold`  | 20px   | 600  | Títulos de tarjetas           |
| Body Large | `text-lg`                | 18px   | 400  | Texto destacado               |
| Body       | `text-base`              | 16px   | 400  | Texto normal                  |
| Body Small | `text-sm`                | 14px   | 400  | Texto secundario              |
| Caption    | `text-xs`                | 12px   | 400  | Metadatos, labels pequeños    |

---

### Componentes Clave

#### 1. Calendario (Vista Mensual)

**Wireframe ASCII:**

```
┌─────────────────────────────────────────────────────────────┐
│  ← Noviembre 2024 →                       [Mes] [Semana]    │
├─────────────────────────────────────────────────────────────┤
│  Lun    Mar    Mié    Jue    Vie    Sáb    Dom             │
├─────────────────────────────────────────────────────────────┤
│        │       │       │       │  1     │  2     │  3 🎉   │ Feriado
│        │       │       │       │ Largo  │        │        │
│        │       │       │       │ 8:00   │        │        │
├────────┼───────┼───────┼───────┼────────┼────────┼────────┤
│  4     │  5    │  6    │  7    │  8     │  9     │  10    │
│ Noche  │ Libre │ Largo │ Noche │ Largo  │        │        │
│ 20:00  │       │ 8:00  │ 20:00 │ 8:00   │        │        │
├────────┼───────┼───────┼───────┼────────┼────────┼────────┤
│  11    │  12   │  13   │  14   │  15    │  16    │  17    │
│ Noche  │ Libre │ Libre │ Largo │ Noche  │        │        │
│ 20:00  │       │       │ 8:00  │ 20:00  │        │        │
└─────────────────────────────────────────────────────────────┘

Leyenda:
🔵 Programado  🟡 En progreso  🟢 Completado  🟣 Abierto  🎉 Feriado
```

**Interacción:**

- [ ] Click en día vacío → Dialog "Crear Turno"
- Click en turno → Dialog "Detalles del Turno" (ver/editar/eliminar)
- [ ] Drag & drop para reasignar (MVP2)

---

#### 2. Sidebar de Navegación

**Wireframe ASCII:**

```
┌──────────────────┐
│  🏥 VITA         │
│                  │
│  ──────────────  │
│                  │
│  📊 Dashboard    │
│  📅 Calendario   │ ← Activo
│  👥 Personal     │
│  🔄 Intercambios │
│  ✅ Asistencia   │
│  ⚙️  Aprobaciones│
│                  │
│  ──────────────  │
│                  │
│  🌙 Dark Mode    │
│  👤 Juan Pérez   │
│  🚪 Cerrar Sesión│
└──────────────────┘
```

**Comportamiento:**

- [ ] Desktop: Siempre visible (240px ancho)
- Tablet: Colapsable con botón hamburguesa
- [ ] Mobile: Overlay con fondo oscuro

---

#### 3. Tarjeta de Estadísticas (Stats Card)

**Wireframe ASCII:**

```
┌────────────────────────────────────┐
│  👥  Personal Activo               │
│                                    │
│      48                            │
│      personas                      │
│                                    │
│  +5 desde el mes pasado            │
└────────────────────────────────────┘
```

**Variantes:**

- [ ] `variant="default"` - Fondo blanco con borde
- `variant="primary"` - Fondo azul con texto blanco
- [ ] `variant="success"` - Fondo verde con texto blanco

---

#### 4. Formulario de Crear Turno

**Wireframe ASCII:**

```
┌─────────────────────────────────────────┐
│  Crear Turno                       [×]  │
├─────────────────────────────────────────┤
│                                         │
│  Fecha *                                │
│  [15/12/2024               ] 📅         │
│                                         │
│  Tipo de Turno *                        │
│  [Largo Día                ▼]           │
│                                         │
│  Horario *                              │
│  [08:00] - [20:00]                      │
│                                         │
│  Personal *                             │
│  [Buscar personal...       🔍]          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✅ Sin conflictos               │   │
│  │ ✅ Dentro de límite semanal     │   │
│  │ ✅ Descanso suficiente          │   │
│  └─────────────────────────────────┘   │
│                                         │
│            [Cancelar] [Crear Turno]    │
└─────────────────────────────────────────┘
```

---

#### 5. Lista de Personal

**Wireframe ASCII:**

```
┌──────────────────────────────────────────────────────────┐
│  Personal de Enfermería UCI              [+ Vincular]    │
├──────────────────────────────────────────────────────────┤
│  [Buscar por nombre o RUT...                        🔍] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Nombre             RUT          Rol        Estado      │
│  ─────────────────────────────────────────────────────  │
│  👤 María González  12.345.678-9 Enfermera  🟢 Activa   │
│  👤 Pedro Sánchez   98.765.432-1 Enfermero  🟢 Activo   │
│  👤 Ana Torres      45.678.901-2 Téc. Enf.  🟡 Pendiente│
│  👤 Luis Martínez   78.901.234-5 Enfermero  🟢 Activo   │
│                                                          │
│  Mostrando 4 de 16                      [1] 2 3 >       │
└──────────────────────────────────────────────────────────┘
```

**Acciones:**

- [ ] Click en fila → Ver detalles del personal
- Hover → Mostrar acciones rápidas (editar, desvincular)

---

#### 6. Toast Notifications

**Diseño:**

```
┌────────────────────────────────────────┐
│  ✅ Turno creado exitosamente          │
│  María González - 15 dic, Largo Día    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ❌ Error al crear turno               │
│  María ya tiene un turno ese día       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⚠️  Advertencia                       │
│  Excede 48 horas semanales             │
└────────────────────────────────────────┘
```

**Posición:** Top-center
**Duración:** 5 segundos
**Animación:** Slide down + fade in/out

---

### Responsive Breakpoints

```typescript
// Tailwind default breakpoints
sm: '640px'   // Tablet portrait
md: '768px'   // Tablet landscape
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large desktop
```

**Comportamiento por pantalla:**

| Elemento    | Mobile (<640px)  | Tablet (640-1024px)         | Desktop (>1024px)      |
| ----------- | ---------------- | --------------------------- | ---------------------- |
| Sidebar     | Overlay (hidden) | Colapsable                  | Siempre visible        |
| Calendario  | Vista semanal    | Vista mensual (compacta)    | Vista mensual (amplia) |
| Tablas      | Cards verticales | Tabla con scroll horizontal | Tabla completa         |
| Formularios | 1 columna        | 2 columnas                  | 2 columnas             |
| Stats Cards | 1 por fila       | 2 por fila                  | 4 por fila             |

---

### Animaciones y Transiciones

**Principio:** Sutiles y rápidas (150-300ms)

```css
/* Transiciones globales en globals.css */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover en botones */
button {
  transition: all 150ms ease-in-out;
}

/* Modals/Dialogs */
dialog {
  animation: slideIn 200ms ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast notifications */
.toast {
  animation: slideDown 300ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Estados de Carga (Loading States)

**Skeletons:**

```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Ejemplo de uso:
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>
```

**Spinners:**

```typescript
// Para botones
<button disabled>
  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
  Cargando...
</button>

// Para páginas completas
<div className="flex items-center justify-center min-h-screen">
  <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
</div>
```

---

### Accesibilidad (WCAG 2.1 AAA)

**Contraste:**

- [ ] Texto normal: mínimo 7:1
- Texto grande (18px+): mínimo 4.5:1
- [ ] Elementos UI: mínimo 3:1

**Navegación por Teclado:**

- [ ] Tab: Avanzar entre elementos
- Shift + Tab: Retroceder
- [ ] Enter/Space: Activar botones
- Escape: Cerrar modales
- [ ] Arrow keys: Navegar en calendarios y listas

**Screen Readers:**

- [ ] Todos los botones tienen `aria-label`
- Formularios con `<label>` asociados
- [ ] Mensajes de error con `aria-live="polite"`
- Estado de carga con `aria-busy="true"`

**Ejemplo completo:**

```typescript
<button
  type="button"
  onClick={handleDelete}
  onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
  aria-label="Eliminar turno del 15 de diciembre"
  className="btn-destructive"
  disabled={isDeleting}
>
  {isDeleting ? (
    <>
      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Eliminando...</span>
    </>
  ) : (
    <>
      <TrashIcon className="mr-2 h-4 w-4" aria-hidden="true" />
      <span>Eliminar</span>
    </>
  )}
</button>
```

---

### Dark Mode

**Implementación:**

```typescript
// components/providers/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Toggle:**

```typescript
// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      className="rounded-lg p-2 hover:bg-accent"
    >
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
```

---

## ✅ PRINCIPIOS DE DESARROLLO

**Código:**

- [ ] Limpio y auto-descriptivo
- **Sin comentarios innecesarios** (el código debe explicarse solo)
- [ ] SOLID principles
- DRY (Don't Repeat Yourself)

**Arquitectura:**

- [ ] Server Components por defecto
- Server Actions para mutations
- [ ] Multi-tenant con aislamiento
- Preparado para Capacitor

**Observability:**

- [ ] Error Boundary en todos los niveles
- Logging estructurado
- [ ] Sentry para producción

---

## 🛠️ COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Prisma
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
npx prisma migrate dev --name nombre_migracion

# Linter
npm run lint

# Build
npm run build
```

---

## 📱 PREPARACIÓN PARA CAPACITOR (MVP2)

### ¿Qué es Capacitor?

**Capacitor** es un "wrapper" que convierte tu app web en app nativa (iOS/Android) sin reescribir código.

```
Tu App Next.js (build estático)
         ↓
   WebView Nativo (iOS/Android)
         ↓
  APIs Nativas (camera, GPS, push, etc.)
```

**Ventaja principal:** Reutilizas el 90% del código web en la app móvil.

---

### 🎯 Alcance en VITA

**Solo para STAFF_HEALTH (Personal de Salud):**

- ✅ Necesitan ver turnos desde el celular
- ✅ Recibir notificaciones push de turnos asignados
- ✅ Self check-in con geolocalización (MVP2)
- ✅ Escanear QR de vinculación (MVP2)

**NO para CHIEF_AREA ni ADMIN_HR:**

- ❌ Estos roles usan 100% desktop
- ❌ Solo necesitan web responsive
- ❌ No necesitan app instalable

---

### ✅ Librerías Actuales: 100% Compatibles

**Todas nuestras librerías funcionan en Capacitor sin cambios:**

| Librería            | Web | Capacitor | Cambios                        |
| ------------------- | --- | --------- | ------------------------------ |
| React 19            | ✅  | ✅        | ❌ Ninguno                     |
| Next.js 16 (static) | ✅  | ✅        | ⚠️ Requiere `output: 'export'` |
| react-big-calendar  | ✅  | ✅        | ❌ Ninguno                     |
| shadcn/ui           | ✅  | ✅        | ❌ Ninguno                     |
| Tailwind CSS v4     | ✅  | ✅        | ❌ Ninguno                     |
| next-themes         | ✅  | ✅        | ❌ Ninguno                     |
| sonner (toasts)     | ✅  | ✅        | ❌ Ninguno                     |
| zustand             | ✅  | ✅        | ❌ Ninguno                     |
| Server Actions      | ✅  | ✅        | ❌ Ninguno (hacen fetch)       |

**Conclusión: No necesitamos cambiar librerías ni arquitectura.**

---

### 📋 Reglas de Código "Capacitor-Ready"

**Sigue estas reglas desde MVP1 para que MVP2 sea fácil:**

#### **1. Diseño Mobile-First (Ya lo hacemos)**

```typescript
// ✅ BIEN: Responsive con Tailwind
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Mis Turnos</h1>
</div>

// ❌ MAL: Ancho fijo desktop
<div className="w-[1200px]">
  <h1 className="text-6xl">Mis Turnos</h1>
</div>
```

**Razón:** Capacitor = app móvil, debe verse perfecto en pantallas pequeñas.

---

#### **2. Usar `useEffect` para APIs del Navegador**

```typescript
// ❌ MAL: window directo puede romper en build
'use client'

export function Component() {
  const screenWidth = window.innerWidth // Error en build
  return <div>{screenWidth}</div>
}

// ✅ BIEN: useEffect para código cliente
'use client'

import { useEffect, useState } from 'react'

export function Component() {
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    setScreenWidth(window.innerWidth)

    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <div>Ancho: {screenWidth}px</div>
}

// ✅ MEJOR: Custom hook reutilizable
import { useWindowSize } from '@/hooks/use-window-size'

export function Component() {
  const { width } = useWindowSize()
  return <div>Ancho: {width}px</div>
}
```

---

#### **3. Server Actions Funcionan Sin Cambios**

```typescript
// ✅ Server Actions hacen fetch automáticamente en Capacitor
'use server'

export async function getMyShiftsAction(userId: string) {
  const shifts = await prisma.shift.findMany({
    where: { assignedUserId: userId },
    include: { shiftType: true, area: true },
  })

  return { success: true, data: shifts }
}

// En web: Ejecuta en servidor VPS
// En Capacitor: Hace fetch a https://vita.cl/api (VPS)
// MISMO CÓDIGO, funciona en ambos ✅
```

---

#### **4. Rutas Relativas en Assets**

```typescript
// ✅ BIEN: Rutas desde public/
<img src="/images/logo.png" alt="VITA" />
<img src="/icons/calendar.svg" alt="Calendario" />

// ❌ MAL: Rutas absolutas externas
<img src="https://vita.cl/images/logo.png" alt="VITA" />

// ✅ BIEN: Con Next.js Image (config especial)
import Image from 'next/image'
<Image
  src="/images/logo.png"
  alt="VITA"
  width={200}
  height={100}
/>
```

---

#### **5. No Depender de SSR en Páginas de STAFF**

```typescript
// ❌ MAL: SSR no funciona en Capacitor
// app/(dashboard)/staff/calendar/page.tsx
export default async function StaffCalendarPage() {
  const shifts = await getMyShiftsAction() // Esto falla en Capacitor
  return <CalendarView shifts={shifts} />
}

// ✅ BIEN: Client Component + useEffect
'use client'

export default function StaffCalendarPage() {
  const [shifts, setShifts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMyShiftsAction().then(result => {
      setShifts(result.data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) return <LoadingSpinner />

  return <CalendarView shifts={shifts} />
}

// ✅ MEJOR: Custom hook
export default function StaffCalendarPage() {
  const { shifts, isLoading } = useMyShifts()

  if (isLoading) return <LoadingSpinner />

  return <CalendarView shifts={shifts} />
}
```

---

### 🚀 Proceso de Migración a Capacitor (MVP2)

**Cuando termines MVP1, agregar Capacitor será así:**

#### **Paso 1: Instalar Capacitor (5 min)**

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

**Configuración:**

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cl.vita.app',
  appName: 'VITA',
  webDir: 'out', // Next.js static export
  server: {
    url: 'https://vita.cl', // Tu VPS
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6', // Azul médico VITA
    },
  },
}

export default config
```

---

#### **Paso 2: Ajustar Next.js Config (2 min)**

```typescript
// next.config.ts
const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

const nextConfig = {
  output: isCapacitor ? 'export' : undefined,

  images: {
    unoptimized: isCapacitor, // Capacitor no soporta Image Optimization
  },

  // Rutas trailing slash para Capacitor
  trailingSlash: isCapacitor,

  // Base path si lo necesitas
  basePath: isCapacitor ? '' : undefined,
}

export default nextConfig
```

---

#### **Paso 3: Script de Build (1 min)**

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:capacitor": "BUILD_TARGET=capacitor next build && npx cap sync",
    "ios": "npm run build:capacitor && npx cap open ios",
    "android": "npm run build:capacitor && npx cap open android"
  }
}
```

---

#### **Paso 4: Agregar Plugins Nativos (según necesidad)**

**Notificaciones Push:**

```bash
npm install @capacitor/push-notifications
```

```typescript
// lib/capacitor/push.ts
import { PushNotifications } from '@capacitor/push-notifications'

export const initPushNotifications = async () => {
  // Pedir permisos
  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    await PushNotifications.register()
  }

  // Listener para notificaciones
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    toast.success(`Nuevo turno: ${notification.title}`)
  })
}
```

**Geolocalización (Self Check-in):**

```bash
npm install @capacitor/geolocation
```

```typescript
// lib/capacitor/geolocation.ts
import { Geolocation } from '@capacitor/geolocation'

export const checkIfInsideHospital = async (
  hospitalLat: number,
  hospitalLon: number,
  radiusMeters: number = 100
): Promise<boolean> => {
  const position = await Geolocation.getCurrentPosition()

  const distance = calculateDistance(
    position.coords.latitude,
    position.coords.longitude,
    hospitalLat,
    hospitalLon
  )

  return distance <= radiusMeters
}
```

**Cámara (QR de vinculación):**

```bash
npm install @capacitor/camera
npm install @capacitor-community/barcode-scanner
```

```typescript
// lib/capacitor/scanner.ts
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

export const scanLinkingCode = async (): Promise<string | null> => {
  // Pedir permisos
  const permission = await BarcodeScanner.checkPermission({ force: true })

  if (!permission.granted) {
    return null
  }

  // Escanear
  const result = await BarcodeScanner.startScan()

  if (result.hasContent) {
    return result.content // Código PERS-2024-001234
  }

  return null
}
```

---

### 🎯 Checklist "Capacitor-Ready" para Desarrollo

**Durante TODO el MVP1, seguir estas reglas en páginas de STAFF:**

- [ ] ✅ **Diseño responsive:** Mobile-first con Tailwind
- [ ] ✅ **Touch-friendly:** Botones mínimo 44x44px
- [ ] ✅ **Sin `window` directo:** Usar `useEffect` o custom hooks
- [ ] ✅ **Client Components:** Páginas de STAFF como `'use client'`
- [ ] ✅ **Server Actions:** Para toda la lógica de negocio
- [ ] ✅ **Assets relativos:** Rutas desde `/public`
- [ ] ✅ **No SSR crítico:** Data loading en cliente (useEffect)
- [ ] ✅ **Error boundaries:** Manejo de errores robusto
- [ ] ✅ **Loading states:** Spinners/skeletons siempre visibles

---

### 📊 Comparación de Esfuerzo

**Si seguimos reglas desde MVP1:**

- ✅ Agregar Capacitor en MVP2: **2-3 días**
- ✅ 90% del código funciona sin cambios
- ✅ Solo agregar plugins para features nativos

**Si NO seguimos reglas (código legacy):**

- ❌ Refactorizar para Capacitor: **2-3 semanas**
- ❌ Reescribir componentes que usan `window`
- ❌ Convertir SSR a Client Components
- ❌ Arreglar rutas rotas, assets rotos

**Conclusión: Vale la pena hacerlo bien desde el inicio.**

---

### 🏗️ Arquitectura Propuesta para STAFF

**Estructura de archivos optimizada para web Y Capacitor:**

```
app/(dashboard)/staff/
├── layout.tsx                    # Layout STAFF (Client Component)
├── page.tsx                      # Dashboard STAFF
├── calendar/
│   ├── page.tsx                  # Calendario (Client Component)
│   └── components/
│       ├── calendar-view.tsx     # Vista calendario
│       └── shift-card.tsx        # Tarjeta de turno
├── shifts/
│   ├── open/page.tsx             # Turnos abiertos
│   └── exchanges/page.tsx        # Intercambios
└── profile/
    └── page.tsx                  # Perfil

hooks/
├── use-my-shifts.ts              # Hook para obtener turnos
├── use-window-size.ts            # Hook para tamaño de ventana
└── use-capacitor.ts              # Hook para detectar si es Capacitor

lib/capacitor/
├── index.ts                      # Exports principales
├── push.ts                       # Push notifications
├── geolocation.ts                # Geolocalización
└── scanner.ts                    # Scanner QR
```

---

### 🔍 Detección de Capacitor

**Helper para saber si está corriendo en app nativa:**

```typescript
// lib/capacitor/index.ts
import { Capacitor } from '@capacitor/core'

export const isCapacitor = Capacitor.isNativePlatform()
export const isIOS = Capacitor.getPlatform() === 'ios'
export const isAndroid = Capacitor.getPlatform() === 'android'
export const isWeb = Capacitor.getPlatform() === 'web'

// Hook personalizado
// hooks/use-capacitor.ts
'use client'

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export const useCapacitor = () => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')

  useEffect(() => {
    setPlatform(Capacitor.getPlatform() as any)
  }, [])

  return {
    isCapacitor: platform !== 'web',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    platform
  }
}

// Uso en componentes
export function MyComponent() {
  const { isCapacitor, platform } = useCapacitor()

  return (
    <div>
      {isCapacitor ? (
        <button onClick={handleNativePush}>
          Activar notificaciones
        </button>
      ) : (
        <p>Las notificaciones push requieren la app móvil</p>
      )}
    </div>
  )
}
```

---

### ⚠️ Problemas Comunes y Soluciones

#### **Problema 1: CORS en Capacitor**

```typescript
// En VPS, permitir peticiones desde app Capacitor
// next.config.ts o en Nginx

headers: [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'capacitor://localhost' },
      { key: 'Access-Control-Allow-Origin', value: 'http://localhost' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
    ],
  },
]
```

#### **Problema 2: LocalStorage/Cookies**

```typescript
// Capacitor: Mejor usar Preferences (persiste mejor)
import { Preferences } from '@capacitor/preferences'

// Web: localStorage funciona
localStorage.setItem('theme', 'dark')

export const storage = {
  async set(key: string, value: string) {
    if (isCapacitor) {
      await Preferences.set({ key, value })
    } else {
      localStorage.setItem(key, value)
    }
  },

  async get(key: string): Promise<string | null> {
    if (isCapacitor) {
      const { value } = await Preferences.get({ key })
      return value
    } else {
      return localStorage.getItem(key)
    }
  },
}
```

#### **Problema 3: Status Bar / Safe Area**

```typescript
// Para iOS: Respetar notch/safe area
// app/globals.css

@supports (padding: env(safe-area-inset-top)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

// Capacitor: Configurar status bar
import { StatusBar, Style } from '@capacitor/status-bar'

if (isIOS) {
  StatusBar.setStyle({ style: Style.Light })
  StatusBar.setBackgroundColor({ color: '#3b82f6' })
}
```

---

### 📝 TODOs para MVP2 (Capacitor)

**Cuando termines MVP1, agregar estas tareas a FASE "MVP2 - App Nativa":**

- [ ] **Setup Capacitor:** Instalar y configurar
- [ ] **Build estático:** Configurar `output: 'export'` condicional
- [ ] **Testing:** Probar en simulador iOS/Android
- [ ] **Push Notifications:** Integrar plugin + backend
- [ ] **Geolocalización:** Self check-in con GPS
- [ ] **Scanner QR:** Vincular personal escaneando código
- [ ] **Icons & Splash:** Diseñar iconos de app y splash screen
- [ ] **App Store Assets:** Screenshots, descripción, keywords
- [ ] **Testing Beta:** TestFlight (iOS) y Google Play Beta
- [ ] **Publicación:** Submit a stores

**Estimado de tiempo MVP2:** 3-4 semanas adicionales después de MVP1 completo.

---

## ❗ DECISIONES IMPORTANTES

### 1. Next.js 16 - PPR

**Situación:** Next.js 16 activa PPR automáticamente con React 19 suspense boundaries.

**Configuración final:**

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '2mb',
  },
}
```

**No se requiere** `ppr: true` manual. Se usa automáticamente con Server Components + Client Components.

### 2. Middleware Next.js 16

Cambiado de `export default auth()` a `export function middleware()`.

### 3. Calendario con react-big-calendar

**Decisión:** Usar react-big-calendar en lugar de calendario custom

**Razón:**

- ✅ Ahorra 40-60 horas de desarrollo
- ✅ Librería madura, probada en producción
- ✅ Soporte de drag & drop out of the box
- ✅ Localización español con date-fns
- ✅ Enfoque en features core, no en reinventar la rueda

**Instalación:**

```bash
npm install react-big-calendar date-fns
```

### 4. Estrategia Mobile: Web Responsive + Capacitor

**Decisión:** Web responsive en MVP1, app nativa con Capacitor en MVP2

**Razón:**

- ✅ Web responsive cubre todas las plataformas inicialmente
- ✅ Desktop para CHIEF/HR, mobile para STAFF
- ✅ Capacitor solo cuando realmente se necesiten features nativos (push, GPS)
- ✅ Evita complejidad innecesaria en fase inicial

### 5. Schema Prisma: Un Solo Archivo

**Razón:** Prisma NO soporta múltiples archivos nativamente

**Solución:** Organizamos con comentarios por secciones

### 6. VPS + Dockploy en vez de Vercel

**Decisión:** Hosting en VPS con Docker, NO en Vercel

**Razón:**

- ✅ No hay cold starts (servidor 24/7)
- ✅ Prisma Client se carga una sola vez
- ✅ Más económico (~$20/mes vs ~$50+/mes)
- ✅ Control total de configuración

### 7. NextAuth v4 (Estable) con JWT Strategy

**Decisión:** Usar NextAuth v4 estable (NO v5 beta) con JWT sessions

**Razón:**

- ✅ v4 es estable y producción-ready (v5 está en beta)
- ✅ Documentación completa y soporte de comunidad
- ✅ JWT evita problemas del Prisma Adapter en database sessions
- ✅ Más rápido (no query a BD por cada request)
- ✅ Funciona perfecto en VPS

**Configuración:**

```typescript
import NextAuth from 'next-auth' // v4.24.13
import GoogleProvider from 'next-auth/providers/google'

session: {
  strategy: "jwt", // IMPORTANTE
  maxAge: 30 * 24 * 60 * 60
}
```

### 7.1 Estrategia de OAuth + Onboarding

**Decisión:** Solo Google OAuth en MVP1, sin registro tradicional

**Flujo:**

```
1. Usuario hace login con Google
2. NextAuth crea usuario (email, name, image automáticos)
3. Middleware detecta perfil incompleto (sin docNumber)
4. Redirige a /onboarding
5. Usuario completa: país, docType, docNumber
6. Validación de docNumber duplicado
7. Acceso a dashboard según rol
```

**MVP2:** Agregar Microsoft OAuth (hospitales usan Microsoft 365)

**MVP3:** Considerar registro tradicional si clientes lo piden

### 7.2 Problema de Email Corporativo y Soluciones

**Problema identificado:**

- Doctor trabaja en Hospital A: `juan@hospitalA.cl`
- Luego es despedido y pierde acceso al email
- No puede hacer login con Google

**Solución MVP1:** Feature "Cambiar email" en settings

- Usuario puede agregar email personal preventivamente
- VITA envía código de verificación
- Email actualizado → Puede hacer login con nuevo email

**Solución MVP2:** Soporte manual

- SUPER_ADMIN puede actualizar email tras verificar identidad
- Para casos excepcionales

**Solución MVP3:** Login tradicional como backup (si es necesario)

### 8. React Query: Opcional, No Requerido en MVP1

**Decisión:** Server Actions + useState por defecto, React Query solo si es necesario

**Razón:**

- ✅ Next.js 16 Server Components + Server Actions cubren 90% de casos
- ✅ Server Actions funcionan desde Client Components sin `useEffect` engorroso
- ✅ React Query solo útil para: polling, cache compartido complejo, optimistic updates
- ⚠️ Evaluar necesidad real durante desarrollo (agregar si setState se vuelve caótico)

### 9. Rate Limiting con Upstash Redis

**Decisión:** Rate limiting en Server Actions críticos desde MVP1

**Razón:**

- ✅ Protege contra spam y ataques DoS
- ✅ Upstash free tier suficiente (10K requests/día)
- ✅ Login: 5 intentos cada 15 min
- ✅ Crear turno: 10 requests cada 10 seg

### 10. Supabase Storage para Uploads

**Decisión:** Supabase Storage para archivos

**Casos de uso:**

- ✅ MVP1: Fotos de perfil
- ✅ MVP2: PDFs de liquidaciones

**Razón:**

- ✅ Free tier: 1GB storage + CDN
- ✅ RLS policies para seguridad

### 11. Timezone Chile con date-fns-tz

**Decisión:** Manejar timezone explícitamente

**Razón:**

- ✅ Chile tiene horario de verano (DST)
- ✅ Almacenar en UTC, mostrar en America/Santiago
- ✅ Evita bugs con fechas de turnos

### 12. Error Tracking con Sentry desde MVP1

**Decisión:** Sentry desde MVP1, no MVP2

**Razón:**

- ✅ Free tier: 5K eventos/mes
- ✅ Stack traces con contexto (userId, organizationId)
- ✅ Crítico para detectar bugs en producción temprano

### 13. i18n Preparado pero Simple

**Decisión:** Estructura preparada, MVP1 solo español

**Razón:**

- ✅ Textos centralizados en `lib/i18n/messages.ts`
- ✅ Fácil migrar a multi-idioma en MVP2
- ✅ Preparado para expansión (inglés, portugués Brasil)

---

## 🔄 MIGRACIONES Y ESCALABILIDAD FUTURA

**⚠️ IMPORTANTE:** Esta sección es planificación a futuro. Solo se ejecutará si:

- ✅ La aplicación funciona correctamente
- ✅ Hay ventas y usuarios pagando
- ✅ Se alcanzan límites de rendimiento reales
- ✅ Hay necesidad de escalar más allá de lo que Next.js monolito puede ofrecer

**Filosofía:** Optimizar solo cuando sea necesario, no prematuramente.

---

### 🎯 Cuándo Considerar Migraciones

**Indicadores de que necesitas migrar:**

1. **Rendimiento:**
   - Tiempo de respuesta > 2 segundos en operaciones críticas
   - Más de 10,000 usuarios activos simultáneos
   - Base de datos con > 1M registros y queries lentas
   - CPU/Memoria del servidor constantemente > 80%

2. **Negocio:**
   - Ingresos recurrentes > $10K USD/mes
   - Crecimiento sostenido > 20% mes a mes
   - Necesidad de exponer API pública para integraciones
   - Requisitos de SLA específicos (99.9% uptime)

3. **Técnico:**
   - Necesidad de escalar backend y frontend independientemente
   - Equipos separados (frontend/backend)
   - Microservicios para features específicas (pagos, notificaciones)
   - Integraciones con sistemas externos complejos

**Si no cumples estos criterios:** Mantén Next.js monolito. Es más simple y suficiente.

---

### 📊 Qué Migrar para Mejorar Tiempos de Respuesta

#### 1. Optimizaciones Inmediatas (Sin Migración Completa)

**Antes de separar backend/frontend, optimiza:**

- [ ] **Caché de Queries Frecuentes:**

  ```typescript
  // Usar Next.js unstable_cache o Redis
  import { unstable_cache } from 'next/cache'

  export const getCachedOrganizations = unstable_cache(
    async () => await getOrganizations(),
    ['organizations'],
    { revalidate: 60 } // 60 segundos
  )
  ```

- [ ] **Database Indexing:**

  ```prisma
  model Organization {
    // Agregar índices en campos de búsqueda frecuente
    @@index([status])
    @@index([country])
    @@index([taxId])
    @@index([createdAt])
  }
  ```

- [ ] **Connection Pooling:**
  - Supabase ya lo maneja ✅
  - Verificar configuración de pool size

- [ ] **Paginación Eficiente:**
  - Ya implementada ✅
  - Considerar cursor-based pagination para grandes datasets

- [ ] **Lazy Loading de Componentes:**

  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <Skeleton />,
    ssr: false // Si no necesita SSR
  })
  ```

- [ ] **CDN para Assets:**
  - Vercel lo maneja automáticamente ✅
  - Optimizar imágenes con next/image

- [ ] **Background Jobs:**
  - Mover tareas pesadas fuera del request cycle
  - Usar queues (BullMQ, Inngest) para emails, reportes, etc.

**Impacto esperado:** 50-70% mejora en tiempos de respuesta sin migración completa.

---

#### 2. Migración a Backend Separado

**Cuándo:** Si optimizaciones no son suficientes y necesitas escalar backend independientemente.

**Estrategia Gradual:**

**Fase 1: API Híbrida (2-3 semanas)**

```
┌──────────────┐      ┌──────────────┐
│  Next.js     │─────▶│  API Routes  │
│  (Frontend)  │      │  (Backend)   │
│              │      │  Express/    │
│              │      │  Fastify     │
└──────────────┘      └──────┬───────┘
                             │
                        ┌────▼────┐
                        │ PostgreSQL│
                        └──────────┘
```

**Qué migrar:**

- [ ] Server Actions → API Routes (Express/Fastify)
- [ ] Helpers se mantienen igual (solo cambiar import path)
- [ ] Prisma se mantiene igual
- [ ] Frontend usa fetch/axios en lugar de Server Actions

**Ventajas:**

- ✅ Escalabilidad independiente
- ✅ Puedes usar múltiples instancias del backend
- ✅ Frontend puede ser CDN (más rápido)
- ✅ API reutilizable para móvil, integraciones

**Desventajas:**

- ❌ Más complejidad (2 deploys)
- ❌ Necesitas manejar CORS
- ❌ Autenticación más compleja (JWT tokens)

**Tiempo estimado:** 2-3 semanas para migración completa

---

#### 3. Microservicios (Solo si Realmente Necesitas)

**Cuándo:** Si tienes features que requieren escalado independiente o tienen diferentes requisitos técnicos.

**Candidatos para Microservicios:**

- [ ] **Servicio de Pagos:**
  - Integración con Stripe/PayPal
  - Webhooks de pagos
  - Procesamiento asíncrono
  - Escalado independiente en picos de facturación

- [ ] **Servicio de Notificaciones:**
  - Emails (Resend/SendGrid)
  - Push notifications (FCM/APNs)
  - SMS (Twilio)
  - Webhooks a sistemas externos
  - Cola de mensajes (BullMQ, RabbitMQ)

- [ ] **Servicio de Reportes:**
  - Generación de PDFs (liquidaciones)
  - Cálculos pesados (horas trabajadas, tarifas)
  - Exportación a Excel
  - Background jobs intensivos

- [ ] **Servicio de Calendario:**
  - Cálculos de turnos
  - Validaciones legales complejas
  - Sincronización con Google Calendar
  - Optimizaciones específicas para queries de calendario

**Arquitectura Propuesta:**

```
┌──────────────┐
│  Next.js     │
│  (Frontend)  │
└──────┬───────┘
       │
   ┌───▼──────────────────────────┐
   │  API Gateway                 │
   │  (Routing + Auth)             │
   └───┬──────────────────────────┘
       │
   ┌───┼──────────────────────────┐
   │   │                          │
┌──▼───▼──┐  ┌──────────┐  ┌─────▼─────┐
│ Core    │  │ Payments │  │ Notifications│
│ Service │  │ Service  │  │ Service     │
│ (CRUD)  │  │          │  │             │
└────┬────┘  └──────────┘  └─────────────┘
     │
┌────▼────┐
│PostgreSQL│
└──────────┘
```

**Ventajas:**

- ✅ Escalado independiente por servicio
- ✅ Tecnologías diferentes por servicio (si es necesario)
- ✅ Equipos pueden trabajar independientemente
- ✅ Fallos aislados (si cae notificaciones, core sigue funcionando)

**Desventajas:**

- ❌ Mucha más complejidad
- ❌ Necesitas service discovery, API gateway
- ❌ Debugging más difícil (trazas distribuidas)
- ❌ Posible sobre-ingeniería si no lo necesitas

**Tiempo estimado:** 2-3 meses para setup completo

**Recomendación:** Solo si tienes > 50K usuarios y problemas reales de escalabilidad.

---

#### 4. Micro Frontends (Opcional, Avanzado)

**Cuándo:** Si tienes múltiples equipos frontend o necesitas desplegar features independientemente.

**Arquitectura:**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Super Admin │  │  Admin HR    │  │  Staff App   │
│  (Next.js)   │  │  (Next.js)  │  │  (Capacitor)│
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                    ┌────▼────┐
                    │  API     │
                    │  Gateway │
                    └──────────┘
```

**Ventajas:**

- ✅ Equipos pueden trabajar en módulos independientes
- ✅ Deploy independiente de cada módulo
- ✅ Tecnologías diferentes por módulo (si es necesario)

**Desventajas:**

- ❌ Complejidad alta
- ❌ Duplicación de código compartido
- ❌ Bundle size puede aumentar
- ❌ Probablemente innecesario para tu caso

**Recomendación:** Solo si tienes > 3 equipos frontend trabajando simultáneamente.

---

### 🎯 Estrategia de Migración Recomendada

**Orden de Prioridad:**

1. **Optimizaciones (Ahora - Siempre):**
   - Caché, índices, lazy loading
   - Mejoras continuas sin migración

2. **Backend Separado (Si > 10K usuarios):**
   - Migración gradual
   - Mantener helpers y Prisma
   - Solo cambiar capa de API

3. **Microservicios (Si > 50K usuarios):**
   - Empezar con servicios aislados (pagos, notificaciones)
   - Mantener core como monolito
   - Migrar gradualmente

4. **Micro Frontends (Solo si múltiples equipos):**
   - Última opción
   - Solo si realmente lo necesitas

---

### 📋 Checklist de Migración a Backend Separado

**Preparación:**

- [ ] Documentar todas las Server Actions actuales
- [ ] Identificar dependencias de Next.js (revalidatePath, etc.)
- [ ] Crear cliente API abstracto en frontend
- [ ] Setup de proyecto backend (Express/Fastify)

**Migración:**

- [ ] Copiar helpers (sin cambios)
- [ ] Copiar schemas (sin cambios)
- [ ] Copiar Prisma config (sin cambios)
- [ ] Convertir Server Actions a API Routes
- [ ] Implementar autenticación JWT
- [ ] Actualizar frontend para usar API
- [ ] Testing completo

**Post-Migración:**

- [ ] Monitoreo de performance
- [ ] Documentación de API
- [ ] Rate limiting
- [ ] CORS configurado
- [ ] Health checks

---

### 💡 Alternativa: Next.js Optimizado (Recomendado Primero)

**En lugar de migrar, optimiza Next.js:**

- [ ] **Edge Functions** para endpoints críticos
- [ ] **Incremental Static Regeneration (ISR)** para páginas estáticas
- [ ] **Streaming SSR** para mejor tiempo de respuesta
- [ ] **React Server Components** optimizados
- [ ] **Database Read Replicas** para queries de lectura
- [ ] **Redis Cache** para datos frecuentes

**Puede soportar hasta 50K-100K usuarios sin separar backend.**

---

### 🎯 Decisión Final

**Migrar solo si:**

1. ✅ App funciona y genera ventas
2. ✅ Optimizaciones no son suficientes
3. ✅ Tienes problemas reales de rendimiento
4. ✅ Necesitas escalar más allá de Next.js monolito

**No migrar si:**

- ❌ Solo tienes cientos de usuarios
- ❌ No hay problemas de rendimiento
- ❌ No hay ventas suficientes
- ❌ Es "por si acaso" (premature optimization)

**Regla de oro:** Optimiza primero, migra después.

---

## 📚 REFERENCIAS

**Stack:**

- [ ] Next.js 16: https://nextjs.org/docs
- Auth.js v5: https://authjs.dev
- [ ] Prisma: https://www.prisma.io/docs
- Tailwind v4: https://tailwindcss.com/docs
- [ ] shadcn/ui: https://ui.shadcn.com

**Herramientas:**

- [ ] Supabase: https://supabase.com/docs
- Zod: https://zod.dev
- [ ] Capacitor: https://capacitorjs.com

---

## ❌ COSAS QUE EVITAR

- [ ] ❌ NO usar PPR en `next.config.ts` (deprecated en Next.js 16)
- ❌ NO usar `export default auth()` en middleware
- [ ] ❌ NO dividir schema de Prisma en múltiples archivos
- ❌ NO usar comentarios innecesarios en el código
- [ ] ❌ NO instalar dependencias que no se usen todavía

---

## 🎯 PRÓXIMO PASO INMEDIATO

**Empezamos con FASE 0 (Investigación) y luego FASE 1 (Landing Page)**

### Opción A: Si ya tienes datos de Rflex → Saltar a FASE 1

**TODO 1.1:** Configurar Tailwind v4 con paleta médica

**Archivos a crear/modificar:**

1. `app/globals.css` - Variables CSS de colores médicos
2. `tailwind.config.ts` - Configuración Tailwind v4
3. Definir paleta de neuromarketing médico

### Opción B: Si NO tienes datos de Rflex → Empezar FASE 0

**TODO 0.1:** Entrevista a usuarios de Rflex

**Acciones:**

1. Preparar guion de preguntas para novia (usuaria Rflex)
2. Contactar jefe de Kinesiología del hospital del director
3. Documentar pain points y validar necesidad
4. Actualizar tabla comparativa con datos reales

---

## ❓ PREGUNTAS PENDIENTES

**IMPORTANTE:** Estas preguntas deben responderse lo antes posible. Algunas bloquean el desarrollo, otras son para optimizar el plan.

---

### 🔴 PRIORIDAD ALTA - Responder ANTES de empezar desarrollo

#### 1. Experiencia con Dockploy

**Pregunta:** ¿Ya tienes experiencia desplegando con Dockploy? ¿O necesitas guía detallada?

**Por qué importa:** Si es tu primera vez con Docker/Dockploy, necesitamos agregar una FASE de "Setup de Infraestructura" con guía paso a paso.

**Opciones:**

- **A)** Tengo experiencia → Seguimos con el plan actual
- **B)** No tengo experiencia → Agregamos FASE extra con tutorial completo de:
  - VPS (DigitalOcean/Hetzner/AWS Lightsail)
  - Docker + Docker Compose
  - Nginx como reverse proxy
  - SSL con Let's Encrypt
  - PM2 para mantener app corriendo

---

#### 2. Código de Vinculación - Formato

**Pregunta:** ¿El formato `PERS-2024-001234` es fijo o prefieres algo más corto?

**Opciones:**

- **A)** `PERS-2024-001234` (actual) - 17 caracteres
- **B)** `PERS-A1B2C3` (corto) - 11 caracteres, más fácil de dictar por teléfono
- **C)** `PS-12345` (ultra corto) - 8 caracteres
- **D)** QR code - Personal genera QR, jefe escanea (sin escribir)

**Recomendación:** Opción B o D (QR code es muy conveniente)

---

#### 3. Timeline y Dedicación

**Pregunta:** ¿Cuántas horas/semana puedes dedicar a VITA?

**Por qué importa:** Esto determina cuándo tendrás MVP1 listo.

**Estimaciones:**

- 10h/semana → MVP1 en 4-5 meses
- 20h/semana → MVP1 en 2-3 meses
- 40h/semana (full-time) → MVP1 en 1-1.5 meses

**¿Cuándo necesitas tener algo mostrable al director del hospital?**

- ¿En 1 mes? → Priorizamos landing + 1 core feature
- ¿En 3 meses? → MVP1 completo
- ¿En 6 meses? → MVP1 + Piloto funcionando

---

### 🟡 PRIORIDAD MEDIA - Responder durante FASE 0 (Investigación)

#### 4. Datos de Rflex

**✅ CONFIRMADO (vía https://rflex.io/):**

1. ✅ App móvil: Sí, iOS + Android
2. ✅ Métodos de asistencia: Web, app+GPS, offline, biometría (integración), tarjeta/pin
3. ✅ Hardware biométrico: NO es de Rflex, son integraciones con terceros ($500-2000 USD)

**⚠️ PENDIENTE INVESTIGAR:**

1. ⚠️ Pricing: ¿Cuánto cobra Rflex mensualmente por usuario?
2. ⚠️ UX: ¿Qué 3 cosas odia más tu novia de Rflex?
3. ⚠️ Calendario: ¿Cómo es el visual? (screenshot si es posible)
4. ⚠️ Validaciones legales: ¿Tiene automáticas del Código del Trabajo?
5. ⚠️ Adopción: ¿Por qué Kinesiología y Nutrición NO usan Rflex?

**Acción:** Entrevistar a novia + jefe de Kinesiología durante FASE 0

---

#### 5. Formato de Código Alternativo para MVP2

**Pregunta:** Para MVP2, ¿prefieres códigos temporales de un solo uso o mantener códigos permanentes?

**Códigos permanentes (MVP1):**

- ✅ Simple, mismo código siempre
- ⚠️ Si se filtra, cualquiera puede intentar vincular (mitigado por doble validación)

**Códigos temporales (MVP2):**

- ✅ Más seguro (expiran, un solo uso)
- ⚠️ Menos conveniente (hay que regenerar)

**Recomendación:** Mantener permanentes si no has tenido problemas de seguridad.

---

### 🟢 PRIORIDAD BAJA - Responder cuando sea conveniente

#### 6. Nombre de Dominio

**Pregunta:** ¿Ya tienes dominio para VITA? ¿O necesitas comprarlo?

**Sugerencias:**

- `vitaturno.cl` / `vita-turnos.cl`
- `vitahospital.cl`
- `turnovita.cl`

**Costo:** ~$12 USD/año en NIC Chile

---

#### 7. Logo y Branding

**Pregunta:** ¿Necesitas diseño de logo o usarás algo temporal?

**Opciones:**

- **A)** Logo profesional (Fiverr ~$50-200 USD)
- **B)** Logo generado con IA (Midjourney/DALL-E ~$20/mes)
- **C)** Temporal con emoji médico 🏥 (gratis, mejoramos después)

**Recomendación:** Opción C para MVP1, profesional después del piloto

---

#### 8. Estrategia de Emails

**Pregunta:** Para notificaciones por email, ¿usaremos Resend o necesitas algo más económico?

**Opciones:**

- **Resend:** $20/mes por 50K emails, muy fácil de integrar
- **SendGrid:** Plan free (100 emails/día), después $15/mes
- **Amazon SES:** ~$1 por 10K emails, más complejo de configurar

**Recomendación:** Resend para MVP1 (simplicidad), evaluar costo después

---

## 📝 DECISIONES Y ARQUITECTURA DEFINIDA

**Última actualización:** 19 Nov 2025

### Análisis y Modelo de Negocio

- ✅ Análisis competitivo con Rflex como referencia principal
- ✅ Modelo B2B con pricing negociado (no planes fijos)
- ✅ Calculadora de precios como referencia
- ✅ Enfoque inicial: hospitales y clínicas en Chile

### Stack Tecnológico

- ✅ Next.js 16 + React 19 + TypeScript
- ✅ Prisma ORM + PostgreSQL (Supabase)
- ✅ Auth.js v5 con JWT strategy
- ✅ Tailwind CSS v4 + shadcn/ui + next-themes
- ✅ react-big-calendar + date-fns + date-fns-tz (timezone Chile)
- ✅ Resend para emails
- ✅ VPS + Dockploy para hosting
- ✅ **NUEVO:** Upstash Redis para rate limiting
- ✅ **NUEVO:** Supabase Storage para uploads (fotos, PDFs)
- ✅ **NUEVO:** Sentry para error tracking desde MVP1

### Estrategia de Estado

- ✅ Server Components + Server Actions (patrón principal)
- ✅ useState para estado local en Client Components
- ✅ Zustand para UI state (sidebar, modales, filtros)
- ⚠️ React Query opcional (solo si setState se vuelve engorroso)

### Estrategia Mobile

- ✅ MVP1: Web responsive (todos los roles)
- ✅ MVP2: Capacitor para app nativa (solo STAFF)
- ✅ Código "Capacitor-Ready" desde MVP1

### Seguridad

- ✅ Rate limiting en Server Actions críticos (login, registro, crear turno)
- ✅ Upstash Redis free tier (10K requests/día)
- ✅ Login: 5 intentos cada 15 min
- ✅ Operaciones: 10 requests cada 10 seg

### Upload de Archivos

- ✅ Supabase Storage con RLS policies
- ✅ MVP1: Fotos de perfil (max 2MB)
- ✅ MVP2: PDFs liquidaciones
- ✅ Validación de tipo y tamaño en Server Actions

### Timezone y Fechas

- ✅ Almacenar en UTC en PostgreSQL
- ✅ Mostrar en America/Santiago con date-fns-tz
- ✅ Manejar horario de verano (DST) automáticamente
- ✅ Helpers: `toChileTime()`, `toUTC()`, `formatChileDate()`

### Error Tracking y Monitoreo

- ✅ Sentry desde MVP1 (5K eventos/mes free tier)
- ✅ Contexto en errores (userId, organizationId)
- ✅ Health check endpoint `/api/health`
- ✅ UptimeRobot para monitoreo (ping cada 5 min)

### Internacionalización

- ✅ **next-intl v4.6.1 implementado y funcionando**
- ✅ Routing basado en locale prefix (`/es/...`, `/en/...`)
- ✅ Componentes de navegación localizados (`@/i18n/navigation`)
- ✅ Cambio de idioma funcional en `LanguageSelector`
- ✅ Mensajes organizados en `messages/{locale}.json`
- ✅ Configuración centralizada en `i18n/routing.ts`
- 📖 Ver sección completa: [INTERNACIONALIZACIÓN (i18n)](#-internacionalización-i18n---implementación-completa)

### Sistemas Core

- ✅ Multi-tenancy con `organizationId`
- ✅ 4 roles: SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF_HEALTH
- ✅ Vinculación de personal con códigos permanentes (MVP1)
- ✅ Validaciones legales con disclaimer y logs auditables
- ✅ Sistema de notificaciones (email + toast)

### Sistema de Asistencia (Estrategia por Fases)

- ✅ **MVP1:** Acreditación manual por CHIEF (casos excepcionales)
- ✅ **MVP2:** Integración con biométricos de terceros vía webhook API
  - Hardware de terceros: Huelleros ($500-800), faciales ($1500-2000)
  - VITA NO vende hardware, solo integración
  - Webhook API para ZKTeco, Anviz, Suprema, Hikvision
- ✅ **MVP3 (DIFERENCIADOR vs Rflex):** Métodos nativos por software
  - **GPS Check-in:** App detecta ubicación, check-in sin hardware ($0 adicional)
  - **QR Code:** Jefe genera QR, personal escanea al llegar
  - **Web Kiosco:** Tablet en entrada, check-in por RUT
  - **Ventaja competitiva:** Sin hardware costoso, solo software

### Arquitectura y Patrones

- ✅ **Feature-Sliced Design (FSD)** - Arquitectura frontend moderna implementada
- ✅ Server Components + Client Components + Server Actions
- ✅ **Repository Pattern** - Separación de acceso a datos (`data/`) de lógica de negocio (`lib/`)
  - Todos los helpers que acceden a Prisma están en `data/{entity}-repository.ts`
  - Facilita futuras migraciones (cambio de ORM, microservicios)
  - Mejor testabilidad y mantenibilidad
- ✅ **Separación Server/Client en `lib/`** - Estructura FSD con carpetas `server/` y `client/` dentro de cada dominio:
  - Agrupación por dominio primero (`validation/`, `helpers/`)
  - Separación por tecnología usando carpetas (`server/`, `client/`)
  - Funcionalidad en archivos individuales con nombres descriptivos (`{domain}-messages.ts`, `{domain}-schemas.ts`)
  - Todos los `index.ts` solo exportan (barrel exports)
  - Aplicado a todos los features: `super-admin`, `auth`, `profile`, `admin-hr`
- ✅ Atomic Design Pattern (en `shared/ui/atoms`)
- ✅ SOLID principles
- ✅ Custom Hooks para lógica reutilizable
- ✅ Public API pattern con `index.ts` en cada módulo
- ✅ Zustand para UI state local

### Orden de Desarrollo

- ✅ **MVP1 (FASES 0-13):**
  - FASE 0: Investigación competitiva (Rflex)
  - FASE 1: Landing page y branding
  - FASE 2-9: Features core y dashboards
  - FASE 10: Seguridad y uploads (rate limiting + fotos)
  - FASE 11: Calendario con react-big-calendar
  - FASE 12: Notificaciones + Sentry
  - FASE 13: Testing y pulido

- ✅ **MVP2 (FASES 14-19):**
  - FASE 14: Intercambios de turnos
  - FASE 15: Turnos abiertos
  - FASE 16: Asistencia biométrica (webhooks para hardware de terceros)
  - FASE 17: Liquidaciones automáticas (PDFs)
  - FASE 18: Reportes avanzados
  - FASE 19: App nativa Capacitor (iOS + Android)

- ✅ **MVP3 (FASES 20-21):**
  - FASE 20: Métodos nativos de asistencia (GPS, QR, Web kiosco)
    - 🎯 **DIFERENCIADOR:** Check-in sin hardware biométrico costoso
  - FASE 21: Internacionalización (inglés, portugués)

---

## 🔐 SUPER_ADMIN Dashboard - Implementación Completada (Enero 2026)

### ✅ Características Implementadas

Se ha implementado el dashboard completo de SUPER_ADMIN con las siguientes características:

#### 📊 Dashboard Principal (`/super-admin`)

**6 Tarjetas de Métricas:**

- Total Organizaciones
- Organizaciones Activas (%)
- Organizaciones Suspendidas (%)
- Ingresos del Mes
- Usuarios Totales
- Próximos Pagos (próximos 7 días)

**Tabla de Organizaciones Recientes:**

- Últimas 5 organizaciones
- Estados visuales con badges coloreados (Activa, Deuda, Suspendida, Inactiva)
- Acciones rápidas: Ver, Registrar Pago, Reactivar

**Panel de Alertas:**

- Pagos próximos a vencer
- Organizaciones suspendidas por falta de pago
- Pagos registrados hoy

#### 🎨 Sidebar de Navegación

- Dashboard
- Organizaciones
- Pagos
- Analytics
- Configuración
- Theme Toggle
- Language Selector
- Perfil de usuario con dropdown
- Cerrar Sesión

#### 🔒 Protección de Rutas

- ✅ Solo usuarios con rol `SUPER_ADMIN` pueden acceder
- ✅ Verificación con `requireSuperAdmin()` en el layout
- ✅ Middleware actualizado para permitir acceso a `/super-admin` routes

#### 📁 Arquitectura (FSD)

```
src/
├── features/
│   └── super-admin/
│       ├── ui/
│       │   ├── stats-cards.tsx          # 6 tarjetas de métricas
│       │   ├── organizations-table.tsx  # Tabla de organizaciones
│       │   ├── alerts-panel.tsx         # Panel de alertas
│       │   └── index.ts
│       ├── lib/
│       │   ├── validation/
│       │   │   ├── server/
│       │   │   │   ├── organization-messages.ts
│       │   │   │   ├── admin-hr-user-messages.ts
│       │   │   │   └── index.ts
│       │   │   ├── client/
│       │   │   │   ├── organization-messages.ts
│       │   │   │   ├── admin-hr-user-messages.ts
│       │   │   │   └── index.ts
│       │   │   └── index.ts
│       │   ├── helpers/
│       │   │   ├── server/
│       │   │   │   ├── organization-schemas.ts
│       │   │   │   ├── admin-hr-user-schemas.ts
│       │   │   │   └── index.ts
│       │   │   ├── client/
│       │   │   │   ├── organization-schemas.ts
│       │   │   │   ├── admin-hr-user-schemas.ts
│       │   │   │   └── index.ts
│       │   │   └── index.ts
│       │   ├── schemas/
│       │   ├── types.ts
│       │   ├── constants.ts
│       │   └── index.ts
│       └── data/
│           └── {entity}-repository.ts
│
├── widgets/
│   ├── super-admin-sidebar/
│   │   └── index.tsx                    # Sidebar del SUPER_ADMIN
│   └── dashboard-sidebar/
│       └── index.tsx                    # Sidebar del dashboard regular
│
├── shared/
│   └── lib/
│       └── auth/
│           └── session.ts               # requireSuperAdmin()
│
app/
└── [locale]/
    └── super-admin/
        ├── layout.tsx                   # Layout con sidebar
        ├── page.tsx                     # Dashboard principal
        ├── organizations/
        │   └── page.tsx                 # Placeholder
        ├── payments/
        │   └── page.tsx                 # Placeholder
        ├── analytics/
        │   └── page.tsx                 # Placeholder
        └── settings/
            └── page.tsx                 # Placeholder
```

#### 🎨 Modelo de Datos Actualizado

**Organization (campos nuevos para SUPER_ADMIN):**

- `plan`: OrganizationPlan (BASIC, PRO, ENTERPRISE)
- `status`: OrganizationStatus (ACTIVE, PENDING_PAYMENT, SUSPENDED, INACTIVE)
- `monthlyFee`: Decimal
- `nextPayment`: DateTime?
- `contactName`, `contactEmail`, `contactPhone`: Información de contacto

#### 🌍 Traducciones

Agregadas en `messages/es.json` y `messages/en.json`:

- `superAdmin.sidebar.*`: Links del sidebar
- `superAdmin.stats.*`: Títulos y tendencias de métricas
- `superAdmin.organizations.*`: Tabla de organizaciones
- `superAdmin.alerts.*`: Panel de alertas
- `dashboard.*`: Links del sidebar del dashboard regular (calendar, profile, etc.)

#### 🚀 Configuración y Pruebas

**Convertir usuario en SUPER_ADMIN:**

Ejecutar directamente en la base de datos:

```sql
UPDATE "User"
SET role = 'SUPER_ADMIN'
WHERE email = 'tu-email@example.com';
```

**Crear organizaciones de prueba:**
Usar el formulario web en `http://localhost:3000/es/super-admin/organizations/new` para crear organizaciones desde el UI.

**Probar acceso:**

1. Login con cuenta SUPER_ADMIN
2. Acceder a `http://localhost:3000/es/super-admin`
3. Verificar métricas y organizaciones
4. Crear organizaciones desde el formulario web

#### 🐛 Problemas Conocidos y Soluciones

**Hydration Error en Números:**

- **Problema:** `toLocaleString('en-US')` genera formato diferente en servidor (`$28,600`) vs cliente (`$28.600`)
- **Solución:** Formatear números de forma consistente usando una función helper que aplique el mismo formato en ambos lados

**Datos Mock:**

- Algunos datos (ingresos mensuales, crecimiento, próximos pagos) son hardcodeados para el MVP
- Se reemplazarán con cálculos reales cuando se implemente el sistema de pagos completo

#### 📝 Próximos Pasos del SUPER_ADMIN Dashboard

1. ✅ **Dashboard Principal** - COMPLETADO
2. ✅ **Logo Clickeable** - COMPLETADO
3. ✅ **Corrección de Hydration Errors** - COMPLETADO
4. ✅ **Dark Mode en todas las páginas** - COMPLETADO
5. ⏸️ **Página de Organizaciones** - Lista completa con CRUD, filtros y búsqueda
6. ⏸️ **Formulario Crear Organización** - Con validaciones Zod completas
7. ⏸️ **Ver Detalles de Organización** - Métricas individuales, usuarios, historial
8. ⏸️ **Editar Organización** - Formulario pre-cargado con validaciones
9. ⏸️ **Suspender/Reactivar** - Con confirmación, razón y notificación por email
10. ⏸️ **Página de Pagos** - Registro manual de pagos con comprobante
11. ⏸️ **Página de Analytics** - Gráficos con Recharts (ingresos, crecimiento, churn)
12. ⏸️ **Historial de Pagos** - Por organización con filtros
13. ⏸️ **Sistema de Notificaciones** - Alertas de pagos próximos a vencer
14. ⏸️ **Export a Excel/PDF** - De reportes de organizaciones y pagos

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS (Enero 2026)

### Tareas Pendientes para Próxima Sesión:

1. **CRUD Shift Types (ADMIN_HR):**
   - Implementar creación, edición y eliminación de tipos de turno
   - Validaciones de duración y clasificación (DAY, NIGHT, MIXED)
   - Asignación de colores por tipo de turno
   - Tabla de tipos de turno con acciones CRUD

2. **CRUD Rates (ADMIN_HR):**
   - Implementar creación, edición y eliminación de tarifas
   - Configuración de tarifas diurnas y nocturnas
   - Multiplicadores para fines de semana y feriados
   - Tabla de tarifas con acciones CRUD

3. **Gestión de Staff (CHIEF_AREA):**
   - Vista de personal asignado al área
   - Vincular/desvincular personal
   - Límites de vinculación por área
   - Tabla de personal con información relevante

4. **Gestión de Turnos (CHIEF_AREA):**
   - Calendario de turnos del área
   - Crear, editar y eliminar turnos
   - Asignación de turnos a personal
   - Validaciones de disponibilidad y límites

5. **Mejoras en Dashboard ADMIN_HR:**
   - Estadísticas más detalladas
   - Gráficos de uso y actividad
   - Notificaciones y alertas

6. **Sistema de Notificaciones:**
   - Notificaciones de pagos próximos a vencer
   - Notificaciones de invitaciones pendientes
   - Sistema de notificaciones en tiempo real

---

### Prioridad 1: Completar Dashboard ADMIN_HR

1. **Gestión de Áreas** (`/dashboard/areas`)
   - CRUD completo de áreas (Emergencias, UCI, Pediatría, etc.)
   - Crear modelo Prisma para `Area` si no existe
   - Server Actions con validaciones Zod
   - Tabla de áreas con acciones (editar, eliminar, activar/desactivar)
   - Asignación de jefes de área
   - Estado activo/inactivo

2. **Gestión de Tipos de Turno** (`/dashboard/shift-types`)
   - CRUD completo de tipos de turno
   - Crear modelo Prisma para `ShiftType` si no existe
   - Campos: nombre, duración, clasificación (DÍA, NOCHE, MIXTO), color
   - Server Actions con validaciones Zod
   - Tabla de tipos con acciones

3. **Gestión de Tarifas** (`/dashboard/rates`)
   - CRUD completo de tarifas
   - Crear modelo Prisma para `Rate` si no existe
   - Campos: nombre, tarifa horaria día, tarifa horaria noche, multiplicador fin de semana, multiplicador festivo
   - Server Actions con validaciones Zod
   - Tabla de tarifas con acciones

4. **Dashboard Principal ADMIN_HR** (`/dashboard/admin-hr`)
   - Reemplazar datos mock con datos reales de Prisma
   - Estadísticas reales: total áreas, tipos de turno, personal, tarifas, turnos activos
   - Gráficos o visualizaciones (opcional)

### Prioridad 2: Completar SUPER_ADMIN Dashboard

1. **Layout y Sidebar**
   - Sidebar con navegación específica del rol
   - Links: Dashboard, Áreas, Tipos de Turno, Personal, Tarifas
   - Protección de rutas con `requireAdminHR()`

2. **Dashboard Principal** (`/dashboard`)
   - Vista general para ADMIN_HR
   - Métricas: Total personal, Áreas, Turnos del mes
   - Accesos rápidos a funciones principales

3. **Gestión de Áreas** (`/dashboard/areas`)
   - CRUD completo de áreas (Emergencias, UCI, Pediatría, etc.)
   - Asignación de jefes de área
   - Estado activo/inactivo

### Prioridad 3: Sistema de Autenticación Mejorado

1. **Página de Onboarding funcional**
   - Validación de código de invitación
   - Vinculación a organización
   - Redirección según rol

2. **Middleware robusto**
   - Protección por roles
   - Redirecciones inteligentes
   - Manejo de usuarios sin organización

3. **Gestión de perfiles**
   - Página de perfil de usuario
   - Cambio de contraseña
   - Actualización de datos personales
   - Ver organizaciones vinculadas

### Prioridad 4: Testing y Calidad

1. **Testing manual completo**
   - Flujo de registro → onboarding → dashboard
   - Cambio de idioma en todas las páginas
   - Dark mode en todas las vistas
   - Responsiveness mobile

2. **Corrección de bugs**
   - Revisar logs de Sentry
   - Corregir warnings de consola
   - Optimizar queries de Prisma

3. **Documentación técnica**
   - Guía de deployment
   - Guía de contribución
   - API documentation

### Métricas de Éxito (Enero 2026)

- [ ] SUPER_ADMIN puede crear y gestionar organizaciones
- [ ] ADMIN_HR puede gestionar áreas y personal
- [ ] Sistema de onboarding funcional al 100%
- [ ] Dark mode sin bugs
- [ ] Traducciones completas (ES/EN)
- [ ] Zero errores en consola

---

**Este es el archivo maestro del plan de VITA. Mantenerlo actualizado es crítico para el éxito del proyecto.**
