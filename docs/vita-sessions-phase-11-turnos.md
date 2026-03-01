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

## Sesión Feb 2026 - Dashboard ADMIN_HR con Métricas Reales

- **Repositorio de datos:** Creado `features/admin-hr/data/dashboard-repository.ts` con `getAdminHRDashboardStats`. Usa `Promise.all` para consultas paralelas optimizadas:
  - `totalAreas`: count de áreas de la org
  - `totalShiftTypes`: count de tipos de turno activos
  - `totalStaff`: count de usuarios CHIEF_AREA + STAFF
  - `totalContracts`: count de contratos activos
  - `activeShifts`: count de turnos del mes actual (SCHEDULED o IN_PROGRESS)
- **Server Action:** Creado `features/admin-hr/api/dashboard-actions.ts` con `getDashboardStatsAction`. Maneja errores y valida sesión con `requireAdminHRWithOrg`.
- **Página dashboard actualizada:** `app/[locale]/dashboard/admin-hr/page.tsx` ahora consume las stats reales vía server action. Incluye widget `OrganizationLimitsCard` para mostrar límites de cuentas con alertas visuales.
- **i18n:** Añadidas claves `adminHR.dashboard.errorLoading` y `limitsTitle` en es/en.
- **Reutilización:** Se reutilizó `DashboardStatsCards` (UI ya existente) y `OrganizationLimitsCard` (widget transversal).
- **Validación:** Build y lint exitosos. Estructura FSD correcta (data → api → page).

## Sesión Feb 2026 - UI Asignación de Jefes a Áreas

- **Server Actions:** Creadas en `features/admin-hr/api/area-actions.ts`:
  - `assignChiefToSingleAreaAction`: asigna un jefe a un área específica (upsert en UserArea)
  - `removeChiefFromAreaAction`: desvincula un jefe de un área (deleteMany en UserArea)
- **Componente ChiefAreaSelector:** Creado `features/admin-hr/ui/chief-area-selector.tsx`. Muestra área actual, botón para quitar área (X), y Dialog para asignar/cambiar área con Select de áreas disponibles.
- **OrganizationTeamSection actualizado:** Ahora recibe `availableAreas` como prop y usa `ChiefAreaSelector` en la columna de área cuando `showAreaColumn` es true.
- **Repository actualizado:** `organization-repository.ts` ahora trae `availableAreas` (todas las áreas de la org) en la query paralela.
- **Página actualizada:** `app/[locale]/dashboard/admin-hr/organization/page.tsx` pasa `availableAreas` al componente de jefes.
- **i18n:** Añadidas claves en `adminHR.organization.chiefs`: `table.assignArea`, `table.changeArea`, `table.removeArea`, y sección completa `assignAreaForm` (es/en).
- **Validación:** Build y lint exitosos.

## Sesión Feb 2026 - Sistema de Tarifas Flexibles v2.0 (Rediseño Completo)

### Contexto y Decisión Arquitectónica

**Problema identificado:** El sistema anterior de tarifas era rígido, basado solo en `ratePerMinute` y `baseSalary`, y no contemplaba la complejidad de:

- Diferentes industrias (salud, seguridad, construcción, etc.)
- Días especiales (feriados, feriados irrenunciables, fin de semana)
- Componentes variables (bonos nocturnos, multiplicadores, etc.)
- Flexibilidad total para que ADMIN_HR personalice tarifas

**Decisión:** Se optó por **Enfoque C - Sistema de Componentes Modulares**, tras análisis de 3 enfoques. Este enfoque permite máxima flexibilidad y escalabilidad.

### Cambios en Schema de Base de Datos

**Nuevos Modelos**:

1. **`RateComponent`**: Componente individual de una tarifa
   - Campos: `type` (ComponentType), `customName`, `value`, `unit` (ComponentUnit), `applyCondition` (ApplyCondition), `conditionValue`, `description`, `order`
   - Relación: Pertenece a un `RateTemplate`

2. **`OrganizationCalendar`**: Calendario con días especiales
   - Campos: `date`, `type` (DayType), `name`, `description`, `multiplier`, `isRecurring`
   - Relación: Pertenece a una `Organization`

**Enums Añadidos**:

- `Currency`: CLP, USD, COP, ARS, MXN, PEN, EUR
- `ComponentType`: 18 tipos (BASE_SALARY, PER_MINUTE, NIGHT_SHIFT_BONUS, WEEKEND_MULTIPLIER, etc.) + CUSTOM
- `ComponentUnit`: MONTHLY, BIWEEKLY, WEEKLY, DAILY, PER_SHIFT, PER_MINUTE, PER_HOUR, PERCENTAGE, MULTIPLIER, FIXED_AMOUNT
- `ApplyCondition`: ALWAYS, WEEKDAY_ONLY, WEEKEND_ONLY, HOLIDAY_ONLY, NIGHT_SHIFT_ONLY, EXTENDED_HOURS_ONLY, ON_CALL_ONLY
- `DayType`: NORMAL, WEEKEND, SATURDAY, SUNDAY, HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM

**Modelos Modificados**:

- `Organization`: Añadido `currency` (Currency) y relación `calendars OrganizationCalendar[]`
- `RateTemplate`: Eliminados `ratePerMinute`, `baseSalary`. Añadida relación `components RateComponent[]`
- `Contract`: Simplificado. Campos eliminados: `ratePerMinute`, `adjustmentPerMinute`, `baseSalary`, `baseSalaryUnit`. Campo `rateTemplateId` ahora **obligatorio**. Añadidos: `customMultiplier Float?`, `notes String?`

**Migración**: Base de datos reseteada con consentimiento del usuario (no es producción).

### Backend API

**Rate Template Actions** (`features/admin-hr/api/rate-template-actions.ts`):

- ✅ `getRateTemplatesAction`: Lista plantillas con componentes incluidos
- ✅ `createRateTemplateAction`: Crea plantilla + componentes en transacción
- ✅ `updateRateTemplateAction`: Actualiza template y reemplaza componentes
- ✅ `deleteRateTemplateAction`: Elimina si no tiene contratos activos
- ✅ `duplicateRateTemplateAction`: Duplica plantilla con todos sus componentes

**Contract Actions** (`features/admin-hr/api/contract-actions.ts`):

- Completamente reescrito para nuevo schema
- `StaffWithContract` y `ContractsPageData` interfaces actualizadas
- ✅ `getContractsPageDataAction`: incluye `rateTemplates` con `_count` de componentes
- ✅ `getStaffPageDataAction`: filtrado por áreas para CHIEF_AREA
- ✅ `createContractAction`: requiere `rateTemplateId`, acepta `customMultiplier` y `notes`
- ✅ `updateContractAction`: actualiza template, área, multiplicador, notas
- ✅ `endContractAction`: sin cambios

### Componentes Reutilizables

**CurrencyInput** (`shared/ui/atoms/currency-input.tsx`):

- Input especializado para monedas con formateo automático
- Separadores de miles dinámicos por moneda:
  - CLP (Chile): `$1.000.000` (punto)
  - USD (USA): `$1,000,000` (coma)
- Props: `currency`, `value`, `onChange`, `allowDecimals`, `showSymbol`
- Manejo interno de estado para display vs valor numérico
- Parsing correcto con `parseCurrencyInput`

**Utilidades de Formateo** (`shared/lib/utils/format.ts`):

- `CURRENCY_LOCALES`: mapeo de Currency a locale (es-CL, en-US, etc.)
- `COUNTRY_CURRENCIES`: mapeo de Country a Currency
- `formatCurrencyByCountry(amount, country, options)`
- `formatCurrencyByCurrency(amount, currency, options)`
- `parseCurrencyInput(value)`: extrae número de string formateado

### UI del Módulo de Tarifas

**RateComponentForm** (`features/admin-hr/ui/rate-component-form.tsx`):

- Formulario para un componente individual
- Selects para: `type`, `unit`, `applyCondition`
- Input o CurrencyInput para `value` (según tipo)
- Inputs para `customName` y `description`
- Traducciones completas para todos los enums

**RateTemplateForm** (`features/admin-hr/ui/rate-template-form.tsx`):

- Formulario modal completo para crear/editar plantillas
- Selección de presets predefinidos
- Gestión de múltiples componentes (añadir, editar, eliminar, reordenar)
- Validaciones: nombre requerido, no duplicar base salary, etc.
- Integración con `createRateTemplateAction` / `updateRateTemplateAction`
- Estados: nombre, descripción, array de componentes

**ContractsPage** (`features/admin-hr/ui/contracts-page.tsx`):

- Completamente reescrito para el nuevo schema
- **Tabla de Plantillas de Tarifas**:
  - Columnas: Nombre, Descripción, Componentes (count), Contratos (count), Acciones
  - Acciones: Editar, Duplicar, Eliminar
  - Botón "Nueva Plantilla" abre `RateTemplateForm`
- **Tabla de Personal con Contratos**:
  - Columnas: Personal, Rol, Área, Plantilla, Multiplicador, Estado, Acciones
  - Acción: Finalizar Contrato
- Dialogs de confirmación para eliminar plantilla y finalizar contrato

**Página de Tarifas** (`app/[locale]/dashboard/rates/page.tsx`):

- Server component que obtiene `currency` de la organización
- Pasa `ContractsPageData` y `currency` a `ContractsPage`

### UI del Módulo de Personal

**StaffViewPage** (`features/admin-hr/ui/staff-view-page.tsx`):

- Componente simplificado **solo para visualización** (no edita contratos)
- **Tabla de Personal**:
  - Columnas: Personal, Rol, Área, Tarifa Asignada, Multiplicador, Estado del Contrato
  - Badges para estado: "Activo" (verde) o "Sin Contrato" (amarillo)
  - Link al módulo de Tarifas para gestión
- **Alerta para personal sin contrato**:
  - Muestra cantidad y enlace a `/dashboard/rates`
- **Estadísticas**:
  - Personal con contrato / Personal sin contrato (cards con iconos)

**Página de Personal** (`app/[locale]/dashboard/staff/page.tsx`):

- Actualizada para usar `StaffViewPage` en lugar de `ContractsPage`
- Solo pasa `staff` (no `rateTemplates` ni `areas`)
- Mensajes de error y estado vacío mejorados

### Presets de Tarifas

**rate-presets.ts** (`features/admin-hr/lib/rate-presets.ts`):

- 10 presets predefinidos en `RATE_PRESETS`:
  1. Guardia Salud Estándar
  2. Guardia Salud Solo Base
  3. Seguridad 24/7
  4. Freelance por Hora
  5. Personal Administrativo
  6. Operario de Construcción
  7. Enfermera/o Nocturna/o
  8. Guardia Alta Especialización
  9. Recepcionista
  10. Consultor Externo
- Funciones: `getPresetById`, `getPresetsByCategory`
- Categorías: healthcare, security, administrative, construction, consulting

### Internacionalización

**Traducciones añadidas** (es.json / en.json):

- `adminHR.rates.templateForm.*`: Formulario de plantilla (nombre, descripción, componentes, presets, errores)
- `adminHR.rates.componentForm.*`: Formulario de componente (tipo, unidad, condición, nombres personalizados)
- `adminHR.rates.rateTemplates.*`: Tabla de plantillas (headers, acciones, estado)
- `adminHR.rates.staffTable.*`: Tabla de personal (headers, acciones, multiplicador)
- `adminHR.rates.delete.*`: Confirmaciones de eliminación
- `staff.*`: Namespace completo para StaffViewPage (tabla, roles, navegación, alertas, estadísticas)
- Traducciones para todos los enums (`ComponentType`, `ComponentUnit`, `ApplyCondition`)

### Validación y Correcciones

- **Error de importaciones**: Corregidas rutas relativas en `currency-input.tsx` (de `./input` a `../input`, etc.)
- **Archivos antiguos eliminados**: `contract-actions.old.ts`, `contracts-page.old.tsx` (causaban errores de compilación)
- **Errores de sesión**: Corregidos múltiples usos de `session.user.X` a `session.X` en `contract-actions.ts`
- **Lint**: Sin errores
- **Build**: Exitoso (`npm run build`)

### Documentación Actualizada

- `docs/ESTADO-TARIFAS-FLEXIBLES.md`: Marcadas fases UI como completadas, actualizado timestamp
- `docs/vita-roadmap.md`: Añadida info del sistema de tarifas v2.0, próximos pasos actualizados
- `docs/vita-workflows.md`: Nueva sección completa para "Sistema de Tarifas Flexibles" con workflows de creación, asignación, visualización, y pendientes

### Resultado Final

✅ **Sistema de Tarifas Flexibles v2.0** completamente funcional:

- Schema modular y escalable
- Backend API robusto con validaciones
- UI completa para ADMIN_HR (crear, editar, duplicar, eliminar tarifas)
- Módulo Personal simplificado (solo visualización)
- Formateo de moneda dinámico por país
- Separación clara: Tarifas (`/dashboard/rates`) vs Personal (`/dashboard/staff`)
- Listo para futuras fases: cálculo de pagos, reportes

## Sesión Feb 2026 - Refactorización FSD y Calendario Organizacional

### Mejoras de Código y Buenas Prácticas

**Eliminación de Presets**:

- ❌ Eliminado `rate-presets.ts` (10 plantillas hardcodeadas)
- ✅ ADMIN_HR ahora crea tarifas completamente desde cero
- ✅ UI mejorada con tooltips explicativos en cada campo

**UX Mejorada con Tooltips**:

- Todos los formularios ahora incluyen iconos de información con tooltips
- `RateTemplateForm`: Tooltips en nombre, descripción y componentes
- `RateComponentForm`: Tooltips en tipo, unidad, monto y condición de aplicación
- `CalendarDayForm`: Tooltips en tipo de día, multiplicador y nombre
- Estado vacío mejorado con título y descripción clara

**Refactorización según FSD**:

_Problema identificado_: El calendario estaba en `features/admin-hr/ui/organization-calendar.tsx`, violando FSD porque mezclaba widget (visualización reutilizable) con feature (acción específica de ADMIN_HR).

_Solución aplicada_:

1. **Widget reutilizable** (`widgets/calendar-view/`):
   - `organization-calendar-view.tsx`: Componente visual del calendario
   - Props: `calendarDays`, `onDayClick`, `canEdit`, `locale`
   - Sin lógica de negocio, solo presentación
   - Reutilizable por cualquier rol (ADMIN_HR, CHIEF, STAFF)

2. **Feature de ADMIN_HR** (`features/admin-hr/`):
   - `ui/calendar-day-form.tsx`: Formulario para editar días (solo ADMIN_HR)
   - `api/calendar-actions.ts`: Server actions para crear/editar/eliminar días
   - `data/calendar-repository.ts`: Consultas a BD

3. **Constantes compartidas** (`shared/lib/constants/`):
   - `component-types.ts`: `COMPONENT_TYPES`, `COMPONENT_UNITS`, `APPLY_CONDITIONS`
   - `day-types.ts`: `DAY_TYPES`, `getDayTypeColor()`
   - Uso de enums de Prisma, no magic strings

4. **Página de composición** (`app/[locale]/dashboard/calendar/`):
   - `page.tsx`: Server component (obtiene datos)
   - `calendar-page-client.tsx`: Client component (maneja estado y eventos)
   - Separa data fetching de interacción

**Eliminación de Magic Strings**:

- ✅ `RateComponentForm`: Usa `COMPONENT_TYPES`, `COMPONENT_UNITS`, `APPLY_CONDITIONS`
- ✅ `RateTemplateForm`: Usa constantes para valores por defecto
- ✅ `CalendarDayForm`: Usa `DAY_TYPES`
- ✅ Todos los selects iteran sobre `Object.entries()` de constantes

**Principio DRY Aplicado**:

- ✅ `getDayTypeColor()` en shared/constants (reutilizable)
- ✅ Widget de calendario reutilizable entre roles
- ✅ Constantes centralizadas en shared
- ✅ Tipos de Prisma importados directamente

### Calendario Organizacional

**Funcionalidades Implementadas**:

- ✅ Vista de calendario mensual interactivo
- ✅ Click en días para editar (solo si `canEdit={true}`)
- ✅ 8 tipos de día: Normal, Fin de Semana, Sábado, Domingo, Feriado, Feriado Irrenunciable, Feriado Organizacional, Personalizado
- ✅ Multiplicadores de pago por día (1.0x a infinito)
- ✅ Nombre y descripción personalizados por día
- ✅ Colores visuales diferenciados por tipo
- ✅ Tooltips en hover mostrando detalles del día
- ✅ Leyenda de colores
- ✅ Navegación mes a mes

**Arquitectura FSD**:

```
widgets/calendar-view/              # Widget reutilizable
  ├── organization-calendar-view.tsx  # Visualización del calendario
  └── calendar-view-placeholder.tsx   # Placeholder para otros dashboards

features/admin-hr/                  # Feature de edición (solo ADMIN_HR)
  ├── api/calendar-actions.ts         # Server actions
  ├── data/calendar-repository.ts     # Queries a BD
  └── ui/calendar-day-form.tsx        # Formulario de edición

shared/lib/constants/               # Constantes reutilizables
  ├── component-types.ts              # Enums de componentes de tarifa
  └── day-types.ts                    # Enums de tipos de día + helpers

app/[locale]/dashboard/calendar/    # Composición de página
  ├── page.tsx                        # Server (fetch data)
  └── calendar-page-client.tsx        # Client (interacción)
```

**Ventajas de esta arquitectura**:

- El widget `OrganizationCalendarView` puede usarse en:
  - `/dashboard/calendar` (ADMIN_HR edita días)
  - `/dashboard/shifts` (CHIEF ve días especiales al crear turnos)
  - `/dashboard` (STAFF ve calendario de sus turnos)
- Cada rol puede pasar `canEdit` según sus permisos
- Las constantes `DAY_TYPES` se usan en toda la app
- Función `getDayTypeColor()` reutilizable para badges, tarjetas, etc.

**Validación**:

- ✅ Build exitoso
- ✅ Lint sin errores
- ✅ FSD correctamente aplicado
- ✅ Sin magic strings
- ✅ DRY aplicado

### Sistema de Internacionalización (i18n)

**Problema identificado**: Los formatos de fecha y moneda varían por país. Chile usa `dd/MM/yyyy` y separador de miles con punto (1.000.000), mientras que USA usa `MM/dd/yyyy` y coma (1,000,000).

**Solución implementada**:

1. **Constantes de Formatos por País** (`shared/lib/constants/date-formats.ts`):
   - `COUNTRY_DATE_FORMATS`: Formato de fecha por país
   - `COUNTRY_DATE_TIME_FORMATS`: Formato de fecha y hora
   - `COUNTRY_LOCALES`: Locales de date-fns (es, enUS)
   - Helpers: `getDateFormatByCountry()`, `getLocaleByCountry()`

2. **Utilidades de Formateo** (`shared/lib/utils/date.ts`):
   - `formatDateByCountry(date, country, options)`: Formatea fecha según país
   - `formatDateTimeByCountry(date, country)`: Incluye hora con formato correcto

3. **Formatos Soportados**:
   - **Latam** (CL, PE, CO, AR, MX): `dd/MM/yyyy HH:mm` con separador `.` para miles
   - **USA**: `MM/dd/yyyy hh:mm a` con separador `,` para miles

4. **Integración**:
   - Calendario ahora usa `country` prop en lugar de `locale`
   - Formatos de fecha automáticos según país del usuario
   - CurrencyInput ya soportaba separadores de miles
   - date-fns locale para nombres de meses y días

**Documentación**:

- ✅ Creado `docs/INTERNACIONALIZACION.md` con guía completa
- ✅ Ejemplos de uso por país
- ✅ Buenas prácticas y patrones

**Ventajas**:

- 🌎 Soporte multi-país desde el día 1
- ✅ Formatos nativos para cada país
- ✅ Fácil añadir nuevos países (solo actualizar constantes)
- ✅ Consistencia en toda la aplicación
