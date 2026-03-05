# Feature Specification: QA End-to-End del Sistema de Gestion de Turnos

**Feature Branch**: `007-qa-e2e-testing`
**Created**: 2026-03-05
**Status**: Draft
**Input**: Ejecutar un plan de testing completo que cubra todos los workflows, flujos y roles del sistema VITA. Generar reporte accionable como input para correcciones.

## Clarifications

### Session 2026-03-05

- Q: Las unicas cuentas SUPER_ADMIN son protegidas. Como testar workflows SUPER_ADMIN (P1)? → A: Cambiar rol de prueba10@gmail.com a SUPER_ADMIN via Supabase antes de iniciar testing.
- Q: Testar solo workflows implementados o tambien verificar pendientes? → A: Implementados completos + verificar que workflows pendientes no expongan UI rota o accesible (botones muertos, links rotos, errores 500).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticacion y Autorizacion (Priority: P1)

Un QA Engineer prueba que el sistema de autenticacion funciona correctamente para todos los roles, que las rutas estan protegidas y que ningun usuario puede acceder a funcionalidades fuera de su rol.

**Why this priority**: La autenticacion es la base de seguridad del sistema. Si falla, todo lo demas queda comprometido. Ademas, la autorizacion por rol es el pilar del multi-tenant.

**Independent Test**: Se prueba haciendo login con cada rol (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF), verificando acceso a rutas permitidas y rechazo de rutas prohibidas.

**Acceptance Scenarios**:

1. **Given** un usuario con credenciales validas, **When** hace login con email y contrasena, **Then** es redirigido al dashboard correspondiente a su rol
2. **Given** un usuario con credenciales invalidas, **When** intenta hacer login, **Then** recibe un mensaje de error claro y no puede acceder
3. **Given** un usuario STAFF autenticado, **When** intenta acceder a `/dashboard/organizations` (SUPER_ADMIN), **Then** es redirigido o ve un mensaje de acceso denegado
4. **Given** un usuario CHIEF_AREA autenticado, **When** intenta acceder a `/dashboard/admin-hr/organization`, **Then** es redirigido o ve acceso denegado
5. **Given** un usuario no autenticado, **When** intenta acceder a cualquier ruta `/dashboard/*`, **Then** es redirigido al login
6. **Given** un usuario autenticado, **When** hace logout, **Then** la sesion se destruye y no puede acceder al dashboard

---

### User Story 2 - Workflows SUPER_ADMIN (Priority: P1)

Un QA Engineer valida que el SUPER_ADMIN puede gestionar organizaciones completamente: crear, editar, suspender, reactivar y eliminar. Ademas, que ve metricas globales.

**Why this priority**: El SUPER_ADMIN es el rol que gestiona la plataforma completa. Si sus workflows fallan, no se pueden crear organizaciones nuevas.

**Independent Test**: Login como SUPER_ADMIN (prueba10@gmail.com, promovido a SUPER_ADMIN via BD), navegar a `/dashboard/organizations`, ejecutar CRUD completo de organizacion y verificar estados en BD.

**Acceptance Scenarios**:

1. **Given** SUPER_ADMIN autenticado, **When** navega a `/dashboard/organizations`, **Then** ve tabla de organizaciones con datos reales
2. **Given** SUPER_ADMIN en la pagina de organizaciones, **When** crea una nueva organizacion con nombre, pais, plan y limites, **Then** la organizacion aparece en la tabla y en la BD
3. **Given** SUPER_ADMIN con una organizacion existente, **When** edita sus datos (nombre, limites), **Then** los cambios se reflejan en la tabla y en la BD
4. **Given** SUPER_ADMIN con una organizacion activa, **When** la suspende con razon, **Then** la organizacion cambia a estado suspendido
5. **Given** SUPER_ADMIN con una organizacion suspendida, **When** la reactiva, **Then** la organizacion vuelve a estado activo

---

### User Story 3 - Workflows ADMIN_HR: Configuracion organizacional (Priority: P1)

Un QA Engineer valida que ADMIN_HR puede configurar su organizacion: gestionar areas, tipos de turno, tarifas y contratos, e invitar personal.

**Why this priority**: ADMIN_HR es el rol operativo central. Si no puede configurar areas, tipos de turno y tarifas, el sistema no es funcional.

**Independent Test**: Login como ADMIN_HR, recorrer `/dashboard/admin-hr`, `/dashboard/areas`, `/dashboard/shift-types`, `/dashboard/rates` y `/dashboard/staff` verificando CRUD completo.

**Acceptance Scenarios**:

1. **Given** ADMIN_HR autenticado, **When** navega a `/dashboard/admin-hr`, **Then** ve metricas reales (areas, tipos de turno, personal, contratos, turnos activos)
2. **Given** ADMIN_HR en `/dashboard/areas`, **When** crea un area nueva con nombre, descripcion, icono y color, **Then** el area aparece en la tabla
3. **Given** ADMIN_HR con un area creada, **When** asigna tipos de turno y jefes de area, **Then** la configuracion se guarda correctamente
4. **Given** ADMIN_HR en `/dashboard/shift-types`, **When** crea un tipo de turno global con duracion, clasificacion y colores, **Then** el tipo aparece en la lista
5. **Given** ADMIN_HR en `/dashboard/rates`, **When** crea una plantilla de tarifa con componentes (base salary, night bonus, etc.), **Then** la plantilla se guarda con sus componentes
6. **Given** ADMIN_HR con plantilla y personal, **When** asigna contrato a un usuario, **Then** el contrato aparece en la tabla de personal
7. **Given** ADMIN_HR en `/dashboard/admin-hr/organization`, **When** invita un jefe o staff por email, **Then** la invitacion aparece como pendiente

---

### User Story 4 - Workflows ADMIN_HR: Rotativas de Turno (Priority: P2)

Un QA Engineer valida el ciclo completo de rotativas: creacion, configuracion de grupos, activacion, generacion de turnos y monitoreo de cobertura.

**Why this priority**: Las rotativas son la funcionalidad mas reciente y compleja. Automatizar la generacion de turnos es critico para la propuesta de valor.

**Independent Test**: Login como ADMIN_HR, crear rotativa en `/dashboard/rotations`, configurar grupos, asignar miembros, activar, generar turnos y verificar resultados en BD.

**Acceptance Scenarios**:

1. **Given** ADMIN_HR en `/dashboard/rotations`, **When** crea rotativa con area, patron (2-8 pasos) y grupos (2-6), **Then** la rotativa se guarda en estado DRAFT
2. **Given** una rotativa DRAFT, **When** asigna miembros a cada grupo, **Then** los miembros aparecen en las tarjetas de grupo
3. **Given** una rotativa DRAFT con miembros, **When** la activa, **Then** cambia a estado ACTIVE y el patron se bloquea
4. **Given** una rotativa ACTIVE, **When** genera turnos para un rango de fechas, **Then** se crean los turnos correspondientes y se muestran conflictos si existen
5. **Given** una rotativa ACTIVE con turnos, **When** monitorea cobertura, **Then** ve alertas de gaps, insuficiencia o cobertura por expirar

---

### User Story 5 - Workflows CHIEF_AREA (Priority: P2)

Un QA Engineer valida que CHIEF_AREA solo ve y gestiona lo de sus areas asignadas: personal, turnos y rotativas.

**Why this priority**: La segregacion por area es critica para multi-tenant. Si un jefe ve datos de areas ajenas, es un bug de seguridad.

**Independent Test**: Login como CHIEF_AREA, verificar que solo ve sus areas en `/dashboard/areas`, solo su personal en `/dashboard/staff`, y solo puede gestionar turnos/rotativas de sus areas.

**Acceptance Scenarios**:

1. **Given** CHIEF_AREA autenticado, **When** navega a `/dashboard/areas`, **Then** solo ve las areas donde esta asignado via UserArea
2. **Given** CHIEF_AREA en `/dashboard/staff`, **When** ve la tabla de personal, **Then** solo ve staff con contrato en sus areas
3. **Given** CHIEF_AREA en `/dashboard/shifts`, **When** crea un turno, **Then** solo puede elegir sus areas y tipos de turno compatibles
4. **Given** CHIEF_AREA sin areas asignadas, **When** navega al dashboard, **Then** ve mensaje de ayuda indicando que no tiene areas

---

### User Story 6 - Workflows STAFF: Dashboard y Calendario (Priority: P2)

Un QA Engineer valida que STAFF ve correctamente su calendario personal, detalle de turnos, notas, proximos turnos y exportacion iCal.

**Why this priority**: Es la experiencia de usuario mas frecuente (cientos de STAFF vs pocos admins). El calendario es la pantalla mas usada.

**Independent Test**: Login como STAFF, navegar al dashboard, verificar calendario mensual, click en turno para detalle, crear nota, ver proximos turnos, probar exportacion iCal.

**Acceptance Scenarios**:

1. **Given** STAFF autenticado con turnos asignados, **When** navega al dashboard, **Then** ve calendario mensual con turnos diferenciados por color y tipo
2. **Given** STAFF viendo el calendario, **When** hace click en un turno, **Then** ve panel lateral con detalle completo y personal activo del sector
3. **Given** STAFF en el dashboard, **When** crea una nota en un dia, **Then** la nota se guarda y aparece indicador visual (punto azul)
4. **Given** STAFF en el dashboard, **When** ve la seccion de proximos turnos, **Then** muestra turnos de los proximos 7 dias con fechas relativas
5. **Given** STAFF en el dashboard, **When** exporta calendario iCal, **Then** descarga archivo .ics con los turnos del mes

---

### User Story 7 - Perfil de Usuario Avanzado (Priority: P3)

Un QA Engineer valida que todos los usuarios pueden gestionar su perfil: documento, multiples emails, avatar.

**Why this priority**: Es funcionalidad transversal para todos los roles, pero no bloquea workflows principales.

**Independent Test**: Login con cualquier rol, navegar a `/dashboard/profile`, editar documento, agregar email secundario, subir avatar.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** edita su documento de identidad, **Then** el cambio se guarda y se registra en historial
2. **Given** un usuario en su perfil, **When** agrega un email secundario, **Then** el email aparece en la lista como no verificado
3. **Given** un usuario en su perfil, **When** sube una imagen de avatar, **Then** la imagen se muestra como avatar y se sube a Supabase Storage
4. **Given** un usuario con avatar custom, **When** elimina su imagen, **Then** el sistema muestra fallback (OAuth o iniciales)

---

### User Story 8 - Sistema de Notificaciones (Priority: P3)

Un QA Engineer valida la bandeja de entrada: notificaciones generadas automaticamente, filtros, marcar como leida, eliminar.

**Why this priority**: Complementa los workflows principales. Si no funcionan las notificaciones, los usuarios no se enteran de eventos importantes.

**Independent Test**: Ejecutar acciones que generen notificaciones (invitar, asignar turno, etc.), luego verificar en `/dashboard/inbox` que aparecen, se filtran, se marcan como leidas y se eliminan.

**Acceptance Scenarios**:

1. **Given** una invitacion enviada a un usuario, **When** el usuario navega a `/dashboard/inbox`, **Then** ve la notificacion INVITATION_PENDING
2. **Given** un turno asignado a un STAFF, **When** el STAFF abre su bandeja, **Then** ve notificacion SHIFT_CREATED con datos del turno
3. **Given** notificaciones no leidas, **When** el usuario usa "Marcar todas como leidas", **Then** todas cambian a estado leido
4. **Given** notificaciones en la bandeja, **When** filtra por tipo (invitaciones/turnos/areas), **Then** solo ve las del tipo seleccionado

---

### User Story 9 - UI/UX y Consistencia Visual (Priority: P3)

Un QA Engineer valida la calidad visual: responsividad, dark mode, i18n, estados de carga, mensajes de error y feedback al usuario.

**Why this priority**: La experiencia de usuario afecta la adopcion del producto, pero no bloquea funcionalidad core.

**Independent Test**: Navegar por todas las paginas verificando layout responsive (desktop/mobile), consistencia de estilos, traducciones, estados vacios y mensajes de error.

**Acceptance Scenarios**:

1. **Given** un usuario en cualquier pagina, **When** reduce la ventana a tamano mobile, **Then** el layout se adapta con sidebar como drawer
2. **Given** un usuario con el sistema en espanol, **When** navega por todas las paginas, **Then** no hay textos sin traducir (literales en ingles)
3. **Given** un usuario que ejecuta una accion, **When** la accion se esta procesando, **Then** ve indicador de carga (spinner, skeleton, disabled button)
4. **Given** un usuario que envia un formulario con datos invalidos, **When** el servidor rechaza la accion, **Then** ve un mensaje de error claro y especifico

---

### Edge Cases

- Que pasa cuando un ADMIN_HR intenta bajar los limites de una organizacion por debajo del uso actual?
- Como reacciona el sistema si un CHIEF_AREA es desvinculado de un area mientras tiene rotativas activas?
- Que ocurre si se intenta crear un contrato duplicado (misma plantilla + mismo usuario + activo)?
- Como maneja el sistema turnos con fechas pasadas al generar desde rotativa?
- Que sucede si un STAFF pertenece a multiples organizaciones y tiene turnos superpuestos?
- Como se comporta la UI con una organizacion sin areas, sin tipos de turno, o sin personal?
- Que pasa al intentar eliminar un area que tiene turnos activos?
- Que ocurre si el upload de avatar excede 2MB o tiene formato no soportado?
- Existen botones, links o rutas visibles para workflows pendientes (intercambios, postulaciones, vinculacion por codigo) que lleven a paginas rotas o errores 500?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE autenticar usuarios con email y contrasena
- **FR-002**: El sistema DEBE redirigir a usuarios no autenticados al login cuando acceden a rutas protegidas
- **FR-003**: El sistema DEBE restringir el acceso a funcionalidades segun el rol del usuario (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF)
- **FR-004**: SUPER_ADMIN DEBE poder crear, editar, suspender, reactivar y eliminar organizaciones
- **FR-005**: ADMIN_HR DEBE poder gestionar areas (CRUD), tipos de turno, plantillas de tarifa y contratos
- **FR-006**: ADMIN_HR DEBE poder invitar jefes y staff a su organizacion con validacion de limites
- **FR-007**: CHIEF_AREA DEBE ver solo areas, personal y turnos de las areas donde esta asignado
- **FR-008**: CHIEF_AREA DEBE poder crear y gestionar turnos solo en sus areas asignadas
- **FR-009**: STAFF DEBE ver su calendario personal con turnos asignados
- **FR-010**: STAFF DEBE poder crear notas personales en el calendario
- **FR-011**: STAFF DEBE poder exportar sus turnos en formato iCal
- **FR-012**: El sistema DEBE generar notificaciones automaticas para eventos clave (invitaciones, turnos, rotativas)
- **FR-013**: Todos los usuarios DEBEN poder gestionar su perfil (documento, emails, avatar)
- **FR-014**: El sistema DEBE soportar rotativas de turno con patron ciclico, grupos y generacion masiva
- **FR-015**: El sistema DEBE validar unicidad de documentos dentro de una organizacion
- **FR-016**: El sistema DEBE mantener aislamiento multi-tenant (datos de una organizacion no visibles a otra)
- **FR-017**: Las paginas DEBEN mostrar textos traducidos (i18n) sin literales hardcodeados
- **FR-018**: Los formularios DEBEN mostrar estados de carga y mensajes de error claros
- **FR-019**: El alcance del QA cubre solo workflows marcados como "implementados" en vita-workflows.md; los workflows "pendientes" se reportan como no testeables pero no se marcan como bugs

### Key Entities

- **Organization**: Hospital/clinica con plan, limites y estado (activa/suspendida)
- **User**: Personal con rol, organizacion, documento y multiples emails
- **Area**: Unidad funcional dentro de la organizacion con tipos de turno y jefes asignados
- **ShiftType**: Definicion de tipo de turno (duracion, clasificacion dia/noche/mixto)
- **Shift**: Turno programado con fecha, hora, area, tipo y usuario asignado
- **Rotation**: Rotativa con patron ciclico, grupos y miembros para generacion automatica
- **RateTemplate**: Plantilla de tarifa con componentes modulares
- **Contract**: Vinculacion de usuario con plantilla de tarifa y area opcional
- **Notification**: Alerta generada automaticamente por eventos del sistema
- **Invitation**: Solicitud de vinculacion a organizacion con estado (pendiente/aceptada/rechazada)
- **CalendarNote**: Nota personal del STAFF en un dia del calendario
- **CalendarSubscriptionToken**: Token para feed iCal externo

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de los workflows documentados como "implementados" en vita-workflows.md son ejecutables de inicio a fin sin errores bloqueantes
- **SC-002**: 0 bugs de severidad critica (datos expuestos entre organizaciones, escalacion de privilegios, perdida de datos)
- **SC-003**: Cada rol puede acceder unicamente a las rutas y funcionalidades permitidas (0 violaciones de autorizacion)
- **SC-004**: Todos los formularios muestran feedback al usuario: estados de carga, mensajes de exito y mensajes de error en menos de 3 segundos
- **SC-005**: El calendario de STAFF muestra correctamente el 100% de los turnos asignados al usuario en el mes seleccionado
- **SC-006**: Las rotativas generan turnos consistentes con el patron definido (0 turnos con desfase incorrecto)
- **SC-007**: El sistema soporta el flujo completo de tarifas: crear plantilla -> asignar contrato -> verificar en staff sin errores
- **SC-008**: La UI es funcional en viewport desktop (>=1024px) y mobile (<768px) sin elementos cortados o inaccesibles
- **SC-009**: No existen textos sin traducir visibles en la interfaz en modo espanol
- **SC-010**: El reporte final documenta al menos el 90% de los bugs encontrados con pasos reproducibles, severidad y evidencia

### Assumptions

- El servidor de desarrollo (`npm run dev`) es estable y representa fielmente el comportamiento de produccion
- La base de datos Supabase contiene datos de prueba suficientes para los escenarios
- La contrasena universal `123qweASD.` es valida para todas las cuentas excepto las protegidas (Google OAuth)
- Las cuentas protegidas (daniel.andres.ramos.v@gmail.com, luisgonel@gmail.com) no seran usadas ni modificadas
- El testing se ejecuta en Chrome con la extension Browser MCP conectada
- La cuenta prueba10@gmail.com sera promovida a SUPER_ADMIN via Supabase antes de iniciar la ejecucion de tests

### Test Accounts Summary

| Rol          | Email                          | Organizacion               |
|--------------|--------------------------------|----------------------------|
| SUPER_ADMIN  | prueba10@gmail.com (promovido) | Global (sin org asignada)  |
| ADMIN_HR     | emiliano@gmail.com             | Hospital vete al infierno  |
| CHIEF_AREA   | javer@hospital.infierno.com    | Hospital vete al infierno  |
| STAFF (org)  | prueba1@vita.test ... prueba50 | Hospital vete al infierno  |
| STAFF (solo) | javer2@gmail.com               | Sin organizacion           |
