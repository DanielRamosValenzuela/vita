# Workflows Rotos

**Fecha**: 2026-03-05
**Estado**: Completado

---

### [CRITICO] WF-001: Flujo de autenticacion no protege rutas del dashboard
- **Workflow:** Login → Dashboard → Operaciones protegidas
- **Descripcion:** Un usuario no autenticado puede acceder directamente a URLs del dashboard. No hay middleware ni redirect en el layout que fuerce autenticacion.
- **Flujo esperado:**
  1. Usuario no autenticado navega a `/es/dashboard/*`
  2. Sistema detecta sesion inexistente
  3. Redirige a `/es/login?callbackUrl=/es/dashboard/*`
  4. Tras login, vuelve a la URL original
- **Flujo actual:**
  1. Usuario no autenticado navega a `/es/dashboard`
  2. Layout detecta `!user` pero renderiza children sin sidebar
  3. Se muestra contenido parcial con texto "Inicia sesion"
  4. NO hay redireccion automatica
- **Impacto:** Seguridad - posible exposicion de informacion parcial sin autenticacion
- **Ubicacion Codigo:** `app/[locale]/dashboard/layout.tsx:19-24`
- **Tests afectados:** TC-AUTH-006, TC-AUTH-007

---

### [ALTO] WF-002: Flujo login → dashboard requiere paso manual
- **Workflow:** Login con credenciales → Dashboard
- **Descripcion:** Tras login exitoso, el usuario aterriza en la landing page en vez del dashboard. Debe navegar manualmente.
- **Flujo esperado:**
  1. Usuario ingresa credenciales en `/es/login`
  2. Autenticacion exitosa
  3. Redireccion automatica a `/es/dashboard`
- **Flujo actual:**
  1. Usuario ingresa credenciales en `/es/login`
  2. Autenticacion exitosa
  3. Redireccion a `/es` (landing page)
  4. Usuario debe hacer click en "Ir al Dashboard"
- **Impacto:** Friccion innecesaria en el flujo principal, mala experiencia de usuario
- **Ubicacion Codigo:** `src/features/auth/ui/login-form.tsx:17` — `callbackUrl = '/es'`
- **Tests afectados:** TC-AUTH-001

---

### [INFO] WF-003: Workflows funcionales verificados
Los siguientes workflows se verificaron como **funcionales**:
- Login con credenciales validas (con bug de redireccion)
- Login con credenciales invalidas → error mostrado correctamente
- Logout → sesion cerrada correctamente (con timeout WebSocket)
- Redireccion de `/es/login` a dashboard cuando ya autenticado
- Dashboard ADMIN_HR con metricas reales
- Gestion de areas (listado, busqueda, filtros)
- Tipos de turno (listado, filtros por estado y clasificacion)
- Tarifas y contratos (plantillas, tabla de personal con contratos)
- Rotativas (listado con filtros, detalle)
- Gestion de personal (tabla con paginacion, filtros)
- Calendario organizacional (navegacion entre meses)
- Nomina (generacion por mes/ano)
- Sectores (listado, CRUD)
- Turnos (calendario, filtros multiples, paginacion)
- Mi Organizacion (limites, invitaciones, personal)
- CHIEF_AREA: restriccion de acceso a admin-hr → PASS
- CHIEF_AREA: restriccion de acceso a rates → PASS
- STAFF: calendario personal con turnos
- STAFF: proximos turnos con fechas relativas
- ADMIN_HR CRUD: crear area → editar (asignar jefe + staff) → crear shift type → asignar a area → activar area
- ADMIN_HR CRUD: crear rate template con componente Sueldo Base
- ADMIN_HR CRUD: invitar Jefe de Area via busqueda por email → invitacion pendiente
- Rotativas: ver detalle de rotativa con patron, horarios, grupos y miembros
- CHIEF_AREA: login → dashboard calendario con turnos filtrados por area
- CHIEF_AREA: crear turno manual (tipo, area, usuario, fecha, horario) con verificacion de conflictos
- CHIEF_AREA: validacion de turnos en pasado (rechaza con toast de error)
- CHIEF_AREA: bandeja de entrada con notificaciones de asignacion de area
