# Mejoras Sugeridas

**Fecha**: 2026-03-05
**Estado**: Completado

---

### MEJ-001: Crear middleware.ts para proteccion global de rutas

- **Prioridad:** Alta
- **Descripcion:** Actualmente no existe `middleware.ts` en la raiz del proyecto. La proteccion de rutas depende del layout del dashboard que solo verifica `!user` sin redirigir. Un middleware centralizado protegeria todas las rutas `/dashboard/*` de forma consistente.
- **Beneficio:** Seguridad, consistencia, menos codigo duplicado en layouts
- **Ubicacion:** Crear `middleware.ts` en raiz del proyecto
- **Referencia:** NextAuth middleware docs, `next-intl` middleware integration

---

### MEJ-002: Agregar callbackUrl dinamico basado en locale

- **Prioridad:** Media
- **Descripcion:** El `callbackUrl` en `LoginForm` esta hardcodeado a `'/es'`. Deberia ser dinamico segun el locale actual: `/${locale}/dashboard`.
- **Beneficio:** Soporte correcto para multi-idioma
- **Ubicacion:** `src/features/auth/ui/login-form.tsx:17`

---

### MEJ-003: Paginacion en tabla de personal de Mi Organizacion

- **Prioridad:** Media
- **Descripcion:** La tabla de personal en `/es/dashboard/admin-hr/organization` renderiza los 52 registros sin paginacion. Con organizaciones mas grandes esto sera un problema de rendimiento.
- **Beneficio:** Rendimiento, usabilidad
- **Ubicacion:** Componente de organizacion en `src/features/admin-hr/`

---

### MEJ-004: Eliminar encabezados duplicados en paginas de gestion

- **Prioridad:** Baja
- **Descripcion:** Paginas como Areas, Tipos de Turno y Sectores muestran el titulo y descripcion duplicados (una vez como heading de pagina, otra dentro del Card).
- **Beneficio:** Limpieza visual, menos redundancia
- **Ubicacion:** Componentes de pagina en `app/[locale]/dashboard/areas/`, `shift-types/`, `sectors/`

---

### MEJ-005: Estandarizar namespace i18n con convencion para claves comunes

- **Prioridad:** Media
- **Descripcion:** El patron `t('~common.save')` en `billing-day-config.tsx` sugiere un intento de acceder a claves comunes desde un namespace especifico, pero la convencion `~` no es estandar en next-intl. Definir una convencion clara para acceder a traducciones comunes (botones, acciones) desde cualquier componente.
- **Beneficio:** Consistencia i18n, menos bugs de claves no encontradas
- **Referencia:** Usar `useTranslations('common')` separado o definir claves completas

---

### MEJ-006: Implementar pagina de Requests/Solicitudes

- **Prioridad:** Baja (segun roadmap)
- **Descripcion:** La ruta `/es/dashboard/requests` existe en el sidebar de STAFF y CHIEF_AREA pero su contenido no fue verificado en profundidad. Verificar que tenga al menos un estado vacio informativo.
- **Ubicacion:** `app/[locale]/dashboard/requests/`

---

### MEJ-007: Mejorar el flujo de signOut para evitar pagina intermedia en ingles

- **Prioridad:** Media
- **Descripcion:** El signOut actual pasa por `/api/auth/signout` que muestra una pagina en ingles de NextAuth ("Are you sure you want to sign out?"). El boton "Cerrar Sesion" del menu de usuario deberia hacer signOut directo sin pagina de confirmacion, ya que la confirmacion se podria manejar con un AlertDialog en el propio menu.
- **Beneficio:** Consistencia i18n, mejor UX
- **Ubicacion:** `src/widgets/dashboard-sidebar/index.tsx:40`

---

### MEJ-008: Mover seccion de Documento/RUT antes de Informacion Personal en perfil

- **Prioridad:** Alta
- **Descripcion:** La seccion de documento (pais + RUT/DNI) esta al final de la pagina de perfil. Deberia estar arriba, antes de Informacion Personal, para que el pais se conozca antes de llenar datos como telefono (para aplicar formato correcto).
- **Beneficio:** UX coherente, permite formateo dinamico de inputs segun pais
- **Ubicacion:** `app/[locale]/dashboard/profile/page.tsx:92-98`

---

### MEJ-009: Reemplazar calendario de fecha de nacimiento por selector con dropdown de ano

- **Prioridad:** Alta
- **Descripcion:** El componente Calendar de shadcn ya soporta `captionLayout="dropdown"` pero no se usa en el perfil. Para fecha de nacimiento, el calendario mes-a-mes es inutilizable (396 clicks para llegar a 1993).
- **Beneficio:** Usabilidad critica - sin esto el campo de fecha de nacimiento es practicamente inutilizable
- **Ubicacion:** `src/features/profile/ui/personal-info-form.tsx:129`

---

### MEJ-010: Implementar input mask para telefono segun pais del usuario

- **Prioridad:** Media
- **Descripcion:** El proyecto ya usa `imask` para moneda (ver `src/shared/lib/utils/input-masks.ts`). Se podria crear una funcion similar `getPhoneMask(country)` que aplique formato chileno (+56 9 XXXX XXXX), colombiano, argentino, etc. Tambien cambiar el placeholder dinamicamente.
- **Beneficio:** Consistencia con el patron de currency mask, mejor validacion en tiempo real
- **Ubicacion:** `src/shared/lib/utils/input-masks.ts` (nuevo) + `src/features/profile/ui/personal-info-form.tsx:99-104`

---

### MEJ-011: Agregar validacion en tiempo real para inputs solo-numeros

- **Prioridad:** Media
- **Descripcion:** Varios inputs del sistema usan `type="number"` o `type="tel"` que no previenen la entrada de letras en todos los browsers. Usar `inputMode="numeric"` + pattern validation o input masks para garantizar que solo se ingresen caracteres validos.
- **Beneficio:** Feedback inmediato, menos errores de usuario
- **Ubicacion:** Inputs afectados:
  - `src/features/profile/ui/personal-info-form.tsx:99-104` (telefono)
  - Cualquier otro input de texto que deberia ser numerico

---

### MEJ-012: Redirigir a lista de organizaciones tras crear organizacion nueva

- **Prioridad:** Baja
- **Descripcion:** El formulario de crear organizacion muestra toast de exito pero permanece en `/organizations/new` con el boton "Creando..." disabled. Deberia redirigir a `/es/dashboard/organizations` tras creacion exitosa.
- **Beneficio:** UX consistente con otros flujos CRUD que redirigen tras crear
- **Ubicacion:** Server action o componente de creacion de organizacion en `src/features/super-admin/`
