# Research: Fix QA E2E Bugs & UX Issues

**Date**: 2026-03-05
**Branch**: `008-fix-qa-bugs`

## Bugs Already Fixed (Remove from Scope)

### BUG-001 / WF-001: Dashboard accesible sin auth
- **Decision**: Ya corregido
- **Evidence**: `app/[locale]/dashboard/layout.tsx:21-22` ya tiene `if (!user) redirect(`/${resolvedParams.locale}/login`)`
- **No action needed**

### BUG-002 / WF-002: Login redirige a landing
- **Decision**: Ya corregido
- **Evidence**: `src/features/auth/ui/login-form.tsx:21` usa `const resolvedCallbackUrl = callbackUrl ?? `/${locale}/dashboard``
- **No action needed**

### BUG-003 / BUG-005: Clave i18n en boton billing day
- **Decision**: Ya corregido
- **Evidence**: `src/features/admin-hr/ui/billing-day-config.tsx:68-69` usa `tCommon('saving')` y `tCommon('save')` correctamente
- **No action needed**

### BUG-007: Tabla rate templates no revalida
- **Decision**: Ya corregido
- **Evidence**: `src/features/admin-hr/api/rate-template-actions.ts:114` llama `revalidatePaths(...RATES_PATHS)` despues de crear
- **No action needed**

### UX-001: Clave i18n en rates (duplicado de BUG-003)
- **Decision**: Ya corregido junto con BUG-003
- **No action needed**

### UX-005: Sidebar muestra "Jefe de Sector" para CHIEF_AREA
- **Decision**: Comportamiento correcto segun clarificacion
- **Evidence**: `app/[locale]/dashboard/layout.tsx:27-28` verifica `UserSector.count > 0` y asigna `CHIEF_SECTOR`. El sidebar en `src/widgets/dashboard-sidebar/index.tsx:69` muestra `common.roles.CHIEF_SECTOR` = "Jefe de Sector". Segun clarificacion, si tiene UserSector asignado, mostrar "Jefe de Sector" es correcto.
- **No action needed**

### proxy.ts (middleware de autenticacion)
- **Decision**: SI existe en `proxy.ts` (raiz del proyecto)
- **Evidence**: Implementa middleware completo con next-intl + NextAuth JWT validation. Redirige usuarios no autenticados a login, usuarios autenticados fuera de auth routes al dashboard, y usuarios sin organizacion a onboarding
- **Note**: El archivo se llama `proxy.ts` (no `middleware.ts`), siguiendo la convencion del proyecto. Confirma que BUG-001/WF-001 esta doblemente protegido (proxy + layout)

---

## Bugs Pendientes de Correccion

### BUG-004: Login empty form no muestra errores
- **File**: `src/features/auth/ui/login-form.tsx`
- **Root Cause**: El form tiene `errors` state y renderiza mensajes, pero la validacion Zod en `loginAction` puede no estar retornando `fieldErrors` correctamente para campos vacios
- **Schema**: `src/features/auth/lib/schemas/auth-schema.ts:77-82` - Zod schema con `min(1)` validation
- **Fix approach**: Verificar que `loginAction` retorna `fieldErrors` en formato correcto

### BUG-006: Links de areas sin prefijo locale
- **File**: `src/features/area/ui/areas-table.tsx`
- **Lines**: 107, 121, 184
- **Root Cause**: Usa `<Link href="/dashboard/areas/...">` sin locale. Pero importa `useRouter` de `@/i18n/navigation` (line 38)
- **Fix approach**: Verificar que `Link` tambien se importe de `@/i18n/navigation`. Si ya se importa, los paths relativos deberian funcionar automaticamente con next-intl
- **Alternative**: Puede que falte importar `Link` de `@/i18n/navigation` en vez de `next/link`

### BUG-008: Aceptacion de invitacion sin validar limite
- **File**: `src/entities/invitation/lib/invitation-repository.ts:143-196`
- **Root Cause**: La funcion `acceptInvitation` no verifica limites de organizacion antes de aceptar
- **Utility available**: `src/entities/organization/lib/organization-limits.ts` tiene `checkOrganizationRoleLimit()`
- **Fix approach**: Agregar llamada a `checkOrganizationRoleLimit` antes de crear UserOrganization

### BUG-009: Calendario STAFF remonta al navegar
- **File**: `src/features/staff-dashboard/ui/staff-calendar.tsx:47-72`
- **Root Cause**: Renderizado condicional crea dos instancias diferentes de `ShiftCalendar`. Cuando shifts pasa de >0 a 0, React desmonta la instancia con shifts y monta una nueva, reseteando `currentMonth` state.
- **Fix approach**: Usar una sola instancia de ShiftCalendar, mostrar empty state como overlay/debajo

### BUG-010: Click en turnos de rotacion no abre detalle
- **File**: `src/features/staff-dashboard/ui/staff-dashboard-content.tsx:210-215`
- **Root Cause**: `handleShiftClick` solo maneja `kind === 'individual'`, ignora `kind === 'rotation-group'`
- **Fix approach**: Agregar branch para `rotation-group` que abra el detalle del primer turno del grupo

### BUG-011: Claves i18n SUPER_ADMIN sin traduccion
- **File**: `messages/es.json` linea ~869
- **Root Cause**: `superAdmin.organizations.actions` es un string `"Acciones"` en vez de un objeto con sub-keys
- **Evidence**: `messages/en.json` SI tiene el objeto completo con view/edit/suspend/reactivate/delete
- **Component**: `src/features/super-admin/ui/organization-table-row.tsx:109-239` usa `t('actions.view')` etc.
- **Fix approach**: Reemplazar string por objeto con traducciones. Verificar address label tambien

---

## UX Issues Pendientes

### UX-002: SignOut muestra pagina en ingles
- **File**: `src/shared/lib/auth/config.ts` - No tiene `pages.signOut` configurado
- **Current**: `src/widgets/dashboard-sidebar/index.tsx:39-41` usa `signOut({ callbackUrl: '/${locale}/login' })`
- **Fix approach**: El signOut ya pasa callbackUrl, pero NextAuth muestra pagina de confirmacion por defecto. Cambiar a `signOut({ redirect: true, callbackUrl })` que deberia redirigir directamente sin pagina intermedia. O agregar `pages: { signOut: '/es/login' }` en authOptions

### UX-003: Tabla staff sin paginacion
- **File**: `src/features/admin-hr/ui/organization-team-section.tsx:159-207`
- **Fix approach**: Agregar paginacion client-side (similar a otras tablas del proyecto)

### UX-004: Headers duplicados
- **Files**:
  - `app/[locale]/dashboard/areas/page.tsx:70-77` + `src/features/area/ui/areas-table.tsx:99-114`
  - `app/[locale]/dashboard/shift-types/page.tsx:71-92`
  - `app/[locale]/dashboard/sectors/page.tsx:65-79` + `src/features/sector/ui/sectors-table.tsx:99-114`
- **Fix approach**: Eliminar el header del page.tsx (mantener el del Card component)

### UX-006: Seccion documento al final del perfil
- **File**: `app/[locale]/dashboard/profile/page.tsx:92-98`
- **Fix approach**: Mover DocumentSection despues de AvatarUploadForm (antes de PersonalInfoForm)

### UX-007: Calendario sin dropdown de ano
- **File**: `src/features/profile/ui/personal-info-form.tsx:129-138`
- **Calendar support**: `src/shared/ui/calendar.tsx:14` soporta `captionLayout` pero default es `'label'`
- **Fix approach**: Agregar `captionLayout="dropdown"`, `fromYear={1920}`, `toYear={new Date().getFullYear()}`

### UX-008: Input telefono acepta letras
- **File**: `src/features/profile/ui/personal-info-form.tsx:99-107`
- **Fix approach**: Agregar `onInput` handler que filtre caracteres invalidos, o agregar `pattern` attribute

### UX-009: Placeholder telefono formato US
- **File**: `messages/es.json` - `profile.personalInfo.phone.placeholder` = "+1 555 123 4567"
- **Fix approach**: Cambiar a "+56 9 1234 5678" para es.json

### UX-010: Input telefono sin maxLength
- **File**: `src/features/profile/ui/personal-info-form.tsx:99-107`
- **Fix approach**: Agregar `maxLength={20}` al Input
