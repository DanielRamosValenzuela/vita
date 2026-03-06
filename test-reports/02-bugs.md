# Bugs Funcionales

**Fecha**: 2026-03-05
**Estado**: Completado

---

### [CRITICO] BUG-001: Dashboard accesible sin autenticacion - No hay proteccion de rutas -- RESUELTO (pre-existente: proxy.ts + layout.tsx redirect)

- **Ubicacion:** Pagina de dashboard
- **Rol:** No autenticado
- **Test Case:** TC-AUTH-006
- **Pasos para reproducir:**
  1. Cerrar sesion o abrir ventana incognito
  2. Navegar directamente a `http://localhost:3001/es/dashboard`
  3. Probar tambien `/es/dashboard/admin-hr`, `/es/dashboard/staff`, etc.
- **Resultado esperado:** Redireccion automatica a `/es/login`
- **Resultado obtenido:** La pagina carga sin sidebar mostrando contenido parcial ("Inicia sesion para ver y gestionar tus turnos"). En `/es/dashboard/admin-hr` muestra pagina completamente vacia (main vacio).
- **Evidencia:** El layout detecta `!user` pero renderiza children sin sidebar en vez de redirigir
- **Ubicacion Codigo:**
  - `app/[locale]/dashboard/layout.tsx:19-24` — Falta `redirect()` cuando `!user`
  - No existe `middleware.ts` en la raiz del proyecto para proteger rutas `/dashboard/*`
- **Correccion sugerida:**
  ```typescript
  // En app/[locale]/dashboard/layout.tsx linea 19, reemplazar el bloque if(!user)
  import { redirect } from 'next/navigation'

  // ...
  if (!user) {
    const { locale } = await params
    redirect(`/${locale}/login`)
  }
  ```
  O mejor: crear `middleware.ts` en raiz del proyecto para interceptar todas las rutas `/dashboard/*` antes de que lleguen al layout.

---

### [ALTO] BUG-002: Login exitoso redirige a landing en vez de dashboard -- RESUELTO (pre-existente: callbackUrl ya usa /${locale}/dashboard)

- **Ubicacion:** Formulario de login
- **Rol:** Todos
- **Test Case:** TC-AUTH-001
- **Pasos para reproducir:**
  1. Ir a `/es/login`
  2. Ingresar credenciales validas (cualquier cuenta)
  3. Click "Iniciar sesion"
- **Resultado esperado:** Redireccion a `/es/dashboard`
- **Resultado obtenido:** Redireccion a `/es` (landing page). El usuario debe hacer click en "Ir al Dashboard" manualmente.
- **Evidencia:** URL despues de login es `http://localhost:3001/es` mostrando landing page completa con seccion hero, precios, etc.
- **Ubicacion Codigo:**
  - `src/features/auth/ui/login-form.tsx:17` — `callbackUrl = '/es'` (default a landing)
  - `src/features/auth/ui/login-form.tsx:49` — `router.push(callbackUrl)` usa el default incorrecto
- **Correccion sugerida:**
  ```typescript
  // En src/features/auth/ui/login-form.tsx linea 17
  // Cambiar:
  export function LoginForm({ callbackUrl = '/es' }: { callbackUrl?: string }) {
  // Por:
  export function LoginForm({ callbackUrl = '/es/dashboard' }: { callbackUrl?: string }) {
  ```
  Nota: Idealmente el callbackUrl deberia ser dinamico segun el locale: `/${locale}/dashboard`

---

### [ALTO] BUG-003: Clave i18n sin traducir en boton de tarifas -- RESUELTO (pre-existente)

- **Ubicacion:** Pagina de tarifas - seccion "Fecha de facturacion"
- **Rol:** ADMIN_HR
- **Test Case:** TC-UX-004
- **Pasos para reproducir:**
  1. Login como ADMIN_HR (emiliano@gmail.com)
  2. Ir a `/es/dashboard/rates`
  3. Observar el boton en la seccion "Fecha de facturacion"
- **Resultado esperado:** Boton con texto "Guardar" o equivalente traducido
- **Resultado obtenido:** Boton muestra literal `payroll.billingDay.~common.save`
- **Evidencia:** Snapshot DOM muestra `button "payroll.billingDay.~common.save"` sin resolver
- **Ubicacion Codigo:**
  - `src/features/admin-hr/ui/billing-day-config.tsx:68` — Usa `t('~common.save')` dentro del namespace `payroll.billingDay`
  - `messages/es.json` — No existe la clave `payroll.billingDay.~common.save`
- **Correccion sugerida:**

  ```typescript
  // En src/features/admin-hr/ui/billing-day-config.tsx
  // Opcion A: Agregar useTranslations para common
  const tCommon = useTranslations('common')
  // Y en linea 68:
  {
    isPending ? tCommon('saving') : tCommon('save')
  }

  // Opcion B: Agregar la clave en messages/es.json bajo payroll.billingDay
  // "payroll": { "billingDay": { "save": "Guardar" } }
  ```

---

### [MEDIO] BUG-004: Formulario de login vacio no muestra errores de validacion -- RESUELTO (ya funcionaba: Zod retorna fieldErrors correctamente)

- **Ubicacion:** Pagina de login
- **Rol:** No autenticado
- **Test Case:** TC-AUTH-005, TC-UX-009
- **Pasos para reproducir:**
  1. Ir a `/es/login`
  2. Dejar email y contrasena vacios
  3. Click "Iniciar sesion"
- **Resultado esperado:** Mensajes de error visibles por campo: "Email es requerido", "Contrasena es requerida"
- **Resultado obtenido:** No se muestra ningun mensaje. El formulario no hace nada visible.
- **Evidencia:** Snapshot del DOM post-submit no contiene alertas ni textos de error
- **Ubicacion Codigo:**
  - `src/features/auth/ui/login-form.tsx` — Revisar si hay schema Zod y si los errores se renderizan en el JSX
  - Probablemente la validacion HTML5 nativa (`required`) previene el envio pero sin feedback visual personalizado
- **Correccion sugerida:** Implementar validacion Zod client-side con mensajes traducidos y renderizar `FormMessage` debajo de cada campo

---

### [BAJO] BUG-005: Boton "Iniciar sesion" duplica logica identica en ambos estados -- RESUELTO (pre-existente)

- **Ubicacion:** Formulario de login
- **Rol:** No autenticado
- **Test Case:** TC-UX-007
- **Pasos para reproducir:**
  1. Leer codigo de billing-day-config.tsx linea 68
- **Resultado esperado:** El boton muestre "Guardar" normalmente y "Guardando..." cuando isPending
- **Resultado obtenido:** Ambas ramas del ternario usan `t('~common.save')` identico
- **Ubicacion Codigo:**
  - `src/features/admin-hr/ui/billing-day-config.tsx:68` — `{isPending ? t('~common.save') : t('~common.save')}`
- **Correccion sugerida:**
  ```typescript
  {
    isPending ? t('saving') : t('save')
  }
  ```

---

## Bugs encontrados en E2E CRUD Testing (Sesion 2)

---

### [MEDIO] BUG-006: Links de edicion en tablas no incluyen prefijo de locale -- RESUELTO (fix: import Link from @/i18n/navigation)

- **Ubicacion:** Tabla de areas `/es/dashboard/areas`, potencialmente otras tablas
- **Rol:** ADMIN_HR
- **Test Case:** TC-AH-004-CRUD
- **Pasos para reproducir:**
  1. Login como ADMIN_HR (emiliano@gmail.com)
  2. Ir a `/es/dashboard/areas`
  3. Click en el boton/link de edicion de un area
- **Resultado esperado:** Navegacion a `/es/dashboard/areas/{id}/edit`
- **Resultado obtenido:** El link tiene href `/dashboard/areas/{id}/edit` sin prefijo `/es/`. Click no navega o produce 404.
- **Evidencia:** El href generado en el snapshot del DOM no incluye el locale prefix
- **Ubicacion Codigo:**
  - Buscar en `src/features/admin-hr/ui/` o `src/entities/area/` componentes de tabla de areas
  - Los links usan `href="/dashboard/areas/${id}/edit"` en vez de usar el `Link` de `@/i18n/navigation` o incluir `/${locale}/`
- **Correccion sugerida:**
  ```typescript
  // Usar Link de i18n/navigation en vez de next/link o <a>:
  import { Link } from '@/i18n/navigation'
  // Y usar path relativo al locale:
  <Link href={`/dashboard/areas/${id}/edit`}>Editar</Link>
  // O si se usa href directo, incluir el locale:
  href={`/${locale}/dashboard/areas/${id}/edit`}
  ```

---

### [BAJO] BUG-007: Tabla de rate templates no se revalida despues de crear nueva plantilla -- RESUELTO (pre-existente)

- **Ubicacion:** `/es/dashboard/rates` - seccion "Plantillas de Tarifa"
- **Rol:** ADMIN_HR
- **Test Case:** TC-AH-008-CRUD
- **Pasos para reproducir:**
  1. Login como ADMIN_HR
  2. Ir a `/es/dashboard/rates`
  3. Click "Nueva Plantilla"
  4. Completar formulario (nombre, componentes, etc.)
  5. Click "Guardar" — toast de exito aparece
  6. Observar la tabla de plantillas
- **Resultado esperado:** La tabla muestra la nueva plantilla inmediatamente
- **Resultado obtenido:** La tabla sigue mostrando el conteo anterior. Al recargar la pagina manualmente, la nueva plantilla aparece correctamente.
- **Evidencia:** Toast "Plantilla creada" exitoso, pero tabla muestra 2 items en vez de 3. Despues de F5, muestra 3 correctamente.
- **Ubicacion Codigo:**
  - Buscar la server action de creacion de rate template en `src/features/admin-hr/api/` — probablemente falta `revalidatePath('/[locale]/dashboard/rates')` o equivalente
  - Tambien verificar si el componente de tabla usa RSC y necesita revalidacion server-side
- **Correccion sugerida:**
  ```typescript
  // En la server action de crear rate template, agregar:
  import { revalidatePath } from 'next/cache'

  // Al final de la accion exitosa:
  revalidatePath('/[locale]/dashboard/rates', 'page')
  ```

---

### [MEDIO] BUG-008: Personal de Salud excede limite configurado (52/50) -- RESUELTO (fix: checkOrganizationRoleLimit en acceptInvitation)

- **Ubicacion:** `/es/dashboard/admin-hr/organization` - seccion Personal de Salud
- **Rol:** ADMIN_HR
- **Test Case:** TC-AH-009-CRUD
- **Pasos para reproducir:**
  1. Login como ADMIN_HR
  2. Ir a `/es/dashboard/admin-hr/organization`
  3. Observar el conteo de personal vs. limite
- **Resultado esperado:** El sistema no debe permitir mas personal que el limite configurado (50)
- **Resultado obtenido:** Muestra 52/50 personal. El boton "Invitar Personal" esta correctamente deshabilitado, pero de alguna forma se permitio superar el limite anteriormente.
- **Evidencia:** Badge muestra "52" y limite dice "50". La UI de invitacion bloquea correctamente nuevas invitaciones, pero la validacion no se aplico al momento de aceptar invitaciones anteriores.
- **Ubicacion Codigo:**
  - Buscar la logica de aceptacion de invitaciones en `src/features/` o `src/entities/invitation/`
  - La validacion de limite debe hacerse tanto al enviar la invitacion como al aceptarla (race condition)
  - Tambien verificar si el SUPER_ADMIN puede haber cambiado el limite despues de que se unieron los 52 miembros
- **Correccion sugerida:**
  - Agregar validacion de limite en el server action de aceptar invitacion
  - Verificar: `if (currentStaffCount >= orgLimit) throw new Error('Staff limit reached')`

---

## Bugs encontrados en E2E STAFF Dashboard (Sesion 3)

---

### [ALTO] BUG-009: Navegacion del calendario STAFF remonta componente y pierde mes seleccionado -- RESUELTO (fix: instancia unica ShiftCalendar + empty state overlay)

- **Ubicacion:** Dashboard STAFF - calendario
- **Rol:** STAFF
- **Test Case:** TC-ST-002
- **Pasos para reproducir:**
  1. Login como STAFF (prueba1@vita.test)
  2. Ver calendario de Marzo 2026 con turnos
  3. Click en flecha izquierda (mes anterior) varias veces
  4. Observar que el calendario vuelve al mes actual
- **Resultado esperado:** Al navegar a Febrero 2026 (mes sin turnos), el calendario muestra Febrero vacio y permite seguir navegando
- **Resultado obtenido:** Al navegar a un mes sin turnos, `StaffCalendar` renderiza condicionalmente un NUEVO `ShiftCalendar` (rama `shifts.length === 0`), lo que remonta el componente y resetea `currentMonth` a `new Date()` (Marzo 2026)
- **Evidencia:** El mes cambia brevemente y vuelve a "Marzo 2026". Los turnos desaparecen pero el encabezado se resetea.
- **Ubicacion Codigo:**
  - `src/features/staff-dashboard/ui/staff-calendar.tsx:47-71` — Renderizado condicional crea nueva instancia de ShiftCalendar
  - `src/entities/shift/ui/shift-calendar.tsx:260` — `useState(new Date())` se resetea en cada remount
- **Correccion sugerida:**
  ```tsx
  // En src/features/staff-dashboard/ui/staff-calendar.tsx
  // NO renderizar condicionalmente dos instancias diferentes de ShiftCalendar
  // Usar una sola instancia y manejar el estado vacio dentro de ella:
  return (
    <div className="flex flex-col items-center">
      <ShiftCalendar
        shifts={shifts} // puede ser []
        loading={loading}
        onMonthChange={onMonthChange}
        // ... props
      />
      {!loading && shifts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p>{t('emptyState')}</p>
        </div>
      )}
    </div>
  )
  ```

---

### [MEDIO] BUG-010: Clicks en turnos de rotacion en el calendario no abren detalle -- RESUELTO (fix: handleShiftClick maneja rotation-group)

- **Ubicacion:** Dashboard STAFF - calendario grid
- **Rol:** STAFF
- **Test Case:** TC-ST-003
- **Pasos para reproducir:**
  1. Login como STAFF (prueba1@vita.test)
  2. Ver calendario con turnos de rotativa
  3. Click en indicador de turno dentro de la celda del calendario (ej: indicador de color en dia 5)
  4. Comparar con click en "Proximos Turnos" panel lateral
- **Resultado esperado:** Click en turno del calendario abre panel de detalle
- **Resultado obtenido:** Click en turnos del calendario grid no hace nada. Click en panel "Proximos Turnos" SI abre el detalle correctamente.
- **Evidencia:** Los turnos generados por rotativa tienen `kind: 'rotation-group'`, pero `handleShiftClick` solo procesa `kind === 'individual'`
- **Ubicacion Codigo:**
  - `src/features/staff-dashboard/ui/staff-dashboard-content.tsx:210-215` — `handleShiftClick` filtra por `kind === 'individual'`
  - `src/entities/shift/lib/calendar-grouping.ts` — `groupShiftsForCalendar` crea eventos con `kind: 'rotation-group'` para turnos de rotativa
- **Correccion sugerida:**
  ```tsx
  // En src/features/staff-dashboard/ui/staff-dashboard-content.tsx:210-215
  const handleShiftClick = useCallback((event: CalendarEvent) => {
    if (event.kind === 'individual') {
      setSelectedShiftId(event.id)
      setPanelOpen(true)
    } else if (event.kind === 'rotation-group') {
      // Para grupos de rotacion, abrir detalle del primer turno o mostrar lista
      setSelectedShiftId(event.shifts?.[0]?.id ?? event.id)
      setPanelOpen(true)
    }
  }, [])
  ```

---

## Bugs encontrados en E2E SUPER_ADMIN (Sesion 6)

---

### [ALTO] BUG-011: Multiples claves i18n sin traducir en modulo SUPER_ADMIN -- RESUELTO (fix: es.json/en.json actions object + address object, removed duplicate keys)

- **Ubicacion:** Paginas de organizaciones SUPER_ADMIN
- **Rol:** SUPER_ADMIN
- **Test Case:** TC-SA-002, TC-SA-003, TC-SA-005, TC-SA-006, TC-SA-007
- **Pasos para reproducir:**
  1. Login como SUPER_ADMIN (prueba10@gmail.com)
  2. Navegar a `/es/dashboard/organizations`
  3. Observar botones de acciones en la tabla
  4. Click en "Nueva Organizacion" y observar label de direccion
  5. Click en suspender/reactivar/eliminar y observar titulos de AlertDialog
- **Resultado esperado:** Todos los textos traducidos al espanol
- **Resultado obtenido:** Multiples claves i18n sin resolver visibles al usuario:
  - Tabla acciones: `superAdmin.organizations.actions.view`, `.edit`, `.suspend`, `.reactivate`, `.delete`
  - Form crear org: `superAdmin.createOrganization.form.address.label` (label del campo direccion)
  - AlertDialog titulos: `superAdmin.organizations.actions.suspend`, `.reactivate`, `.delete` como heading
  - AlertDialog botones confirmacion: mismas claves sin traducir
- **Evidencia:** Snapshot DOM muestra literales de claves i18n en botones, headings y labels
- **Ubicacion Codigo:**
  - `src/features/super-admin/ui/` — Componentes de tabla de organizaciones usan `t('actions.view')` etc. dentro del namespace `superAdmin.organizations`
  - `messages/es.json` — Faltan claves bajo `superAdmin.organizations.actions` y `superAdmin.createOrganization.form.address`
  - Form de edicion SI tiene "Direccion" traducido correctamente — inconsistencia entre form crear vs editar
- **Correccion sugerida:**
  Agregar en `messages/es.json` bajo el namespace correspondiente:
  ```json
  {
    "superAdmin": {
      "organizations": {
        "actions": {
          "view": "Ver",
          "edit": "Editar",
          "suspend": "Suspender",
          "reactivate": "Reactivar",
          "delete": "Eliminar"
        }
      },
      "createOrganization": {
        "form": {
          "address": {
            "label": "Direccion"
          }
        }
      }
    }
  }
  ```
