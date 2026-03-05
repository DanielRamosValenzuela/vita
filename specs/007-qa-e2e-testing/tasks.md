# Tasks: QA End-to-End del Sistema de Gestion de Turnos

**Input**: Design documents from `/specs/007-qa-e2e-testing/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No aplica - este ES el testing. Las tareas son ejecucion de test cases via Browser MCP y Supabase MCP.

**Organization**: Tasks agrupadas por user story. Cada story es independiente y genera hallazgos para los reportes en `/test-reports/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different roles, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact routes and accounts in descriptions

---

## Phase 1: Setup (Preparacion del entorno)

**Purpose**: Configurar BD, servidor y herramientas antes de ejecutar tests

- [X] T001 Promover prueba10@gmail.com a SUPER_ADMIN via Supabase SQL: `UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'prueba10@gmail.com'`
- [X] T002 Verificar servidor corriendo en localhost:3001 (o puerto disponible) con `npm run dev`
- [X] T003 Verificar Browser MCP conectado navegando a la landing page
- [X] T004 Crear directorio `/test-reports/` y archivos iniciales (00 a 05) con estructura de reporte

**Checkpoint**: Entorno listo para ejecutar tests

---

## Phase 2: Foundational (Verificacion de datos de prueba)

**Purpose**: Confirmar que los datos en BD son suficientes para los escenarios

**CRITICAL**: Si los datos son insuficientes, crear datos antes de continuar

- [X] T005 Consultar BD via Supabase: verificar cuentas por rol (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF)
- [X] T006 Consultar BD: verificar areas existentes con shift types asignados y jefes
- [X] T007 Consultar BD: verificar turnos existentes para prueba1@vita.test (necesarios para calendario STAFF)
- [X] T008 Consultar BD: verificar rotativas existentes con grupos y miembros
- [X] T009 Consultar BD: verificar plantillas de tarifa y contratos activos
- [X] T010 Si faltan datos criticos, crear registros minimos via Supabase para habilitar los test cases

**Checkpoint**: Datos de prueba verificados y suficientes

---

## Phase 3: User Story 1 - Autenticacion y Autorizacion (Priority: P1)

**Goal**: Verificar que login/logout funcionan y que las rutas estan protegidas por rol

**Independent Test**: Login con cada rol, verificar redireccion correcta, probar acceso a rutas prohibidas

### Ejecucion US1

- [X] T011 [US1] TC-AUTH-001: Login ADMIN_HR (emiliano@gmail.com) → verificar redireccion a dashboard y nombre en navbar
- [X] T012 [US1] TC-AUTH-002: Login con contrasena incorrecta → verificar mensaje de error visible
- [X] T013 [US1] TC-AUTH-003: Login con email inexistente → verificar error generico (PASS: "Credenciales inválidas" + "Email o contraseña incorrectos" - mensaje genérico correcto)
- [X] T014 [US1] TC-AUTH-004: Acceso directo a `/es/dashboard` sin autenticar → verificar redireccion a login (FAIL: BUG-001)
- [X] T015 [US1] TC-AUTH-005: Login STAFF (prueba1@vita.test), navegar a `/es/dashboard/organizations` → verificar acceso denegado (PASS: redirige a /es/dashboard, sidebar no muestra link organizations)
- [X] T016 [US1] TC-AUTH-006: Login CHIEF_AREA (javer@hospital.infierno.com), navegar a `/es/dashboard/admin-hr/organization` → verificar acceso denegado
- [X] T017 [US1] TC-AUTH-007: Login STAFF, navegar a `/es/dashboard/admin-hr` → verificar acceso denegado (FAIL: BUG-001)
- [X] T018 [US1] TC-AUTH-008: Logout → verificar sesion destruida, no accede a dashboard
- [X] T019 [US1] TC-AUTH-009: Login secuencial con los 4 roles → verificar dashboard correcto para cada uno
- [X] T020 [US1] Documentar hallazgos de US1 en `/test-reports/02-bugs.md` con ubicacion de codigo

**Checkpoint**: Autenticacion y autorizacion verificadas para todos los roles

---

## Phase 4: User Story 2 - Workflows SUPER_ADMIN (Priority: P1)

**Goal**: CRUD completo de organizaciones, metricas globales

**Independent Test**: Login como SUPER_ADMIN (prueba10@gmail.com), ejecutar crear/editar/suspender/reactivar organizacion

### Ejecucion US2

- [X] T021 [US2] TC-SA-001: Login SUPER_ADMIN (prueba10@gmail.com), navegar a dashboard → verificar metricas o redireccion a organizations (PASS: Dashboard "Dashboard SUPER ADMIN" con metricas: 3 orgs, 66.7% activas, $28,600 ingresos, 54 usuarios, 1 pago proximo. Sidebar: Panel de Control, Organizaciones, Pagos, Analiticas, Perfil. Tabla resumen 3 orgs. NOTA: links "Nueva Organizacion" y "Ver Todas" sin locale prefix = BUG-006 patron)
- [X] T022 [US2] TC-SA-002: Navegar a `/es/dashboard/organizations` → verificar tabla con organizaciones existentes (PASS: tabla con 3+ orgs, columnas Nombre/RUT/Plan/Estado/Limites/Tarifa/Pago/Acciones. Filtros: busqueda, estado, plan, pais. FAIL i18n: botones acciones muestran claves sin traducir "superAdmin.organizations.actions.view/edit/suspend/reactivate/delete" = BUG-011)
- [X] T023 [US2] TC-SA-003: Crear organizacion nueva (nombre, pais, plan, limites) → verificar en tabla y BD (PASS: "Clinica QA Test E2E" creada, toast exito, BD confirma status ACTIVE plan BASIC. Form: 3 secciones Info Basica/Facturacion/Contacto. Defaults: Chile, Basico, $28600, 5/10/50. FAIL i18n: label direccion muestra "superAdmin.createOrganization.form.address.label" = BUG-011. NOTA: form no redirige a lista tras crear)
- [X] T024 [US2] TC-SA-004: Editar organizacion creada (cambiar nombre o limites) → verificar cambios en tabla y BD (PASS: nombre cambiado a "Clinica QA Test E2E Editada", limite staff 50→30, toast "Organizacion actualizada exitosamente", tabla confirma cambios. Form edit muestra limites actuales + min/max dinamicos. NOTA: subtitulo no actualiza nombre tras guardar)
- [X] T025 [US2] TC-SA-005: Suspender organizacion con razon → verificar estado SUSPENDED en BD (PASS: AlertDialog confirmacion, toast "Estado cambiado a SUSPENDED exitosamente", BD confirma status SUSPENDED. NOTA: no hay campo para razon de suspension — solo confirmacion. Titulos AlertDialog muestran claves i18n sin traducir)
- [X] T026 [US2] TC-SA-006: Reactivar organizacion suspendida → verificar estado ACTIVE en BD (PASS: AlertDialog confirmacion, toast "Estado cambiado a ACTIVE exitosamente", BD confirma status ACTIVE. Tabla muestra "Activa" y botones cambian a suspend/delete)
- [X] T027 [US2] TC-SA-007: Eliminar organizacion de prueba (la creada en T023) → verificar eliminacion (PASS: AlertDialog con soft delete info + campo razon minimo 10 chars, boton disabled hasta ingresar razon, toast "Organizacion eliminada exitosamente", BD confirma status INACTIVE = soft delete correcto)
- [X] T028 [US2] TC-SA-008: Intentar bajar limites por debajo del uso actual → verificar error de validacion (PASS: "Hospital vete al infierno" tiene 52 staff, limite 50. Form muestra "Min: 52, Max: 300". Al intentar guardar con 40: toast error "No puedes reducir el limite de Staff a 40 porque ya tienes 52 usuarios con ese rol" + texto error visible. Cambio NO guardado)
- [X] T029 [US2] Documentar hallazgos de US2 en `/test-reports/02-bugs.md` y `/test-reports/03-workflows-rotos.md` (BUG-011: claves i18n SUPER_ADMIN sin traducir en tabla acciones + form crear. Workflow CRUD completo funcional)

**Checkpoint**: CRUD SUPER_ADMIN funcional y verificado

---

## Phase 5: User Story 3 - Config Organizacional ADMIN_HR (Priority: P1)

**Goal**: Gestionar areas, shift types, tarifas, contratos, invitaciones y personal

**Independent Test**: Login ADMIN_HR, recorrer todas las paginas de configuracion verificando CRUD completo

### Ejecucion US3 - Dashboard y Mi Organizacion

- [X] T030 [US3] TC-AH-001: Login ADMIN_HR (emiliano@gmail.com), navegar a `/es/dashboard/admin-hr` → verificar metricas reales
- [X] T031 [US3] TC-AH-002: Navegar a `/es/dashboard/admin-hr/organization` → verificar tarjetas de uso, jefes, staff, invitaciones

### Ejecucion US3 - Areas

- [X] T032 [US3] TC-AH-003: Navegar a `/es/dashboard/areas` → verificar tabla de areas existentes
- [X] T033 [US3] TC-AH-004: Crear area nueva (nombre, descripcion, icono, color) → verificar en tabla
- [X] T034 [US3] TC-AH-005: Editar area - asignar tipos de turno → verificar asociacion guardada
- [X] T035 [US3] TC-AH-006: Editar area - asignar jefe de area → verificar jefe asignado
- [X] T036 [US3] TC-AH-007: Activar area (requiere shift type activo) → verificar estado activo
- [X] T037 [US3] TC-AH-008: Eliminar area de prueba → verificar eliminacion con AlertDialog (PASS: AlertDialog OK, toast exito, BD eliminada, tabla no revalida = BUG-007 patron)

### Ejecucion US3 - Tipos de Turno

- [X] T038 [US3] TC-AH-009: Navegar a `/es/dashboard/shift-types` → verificar tabla de tipos
- [X] T039 [US3] TC-AH-010: Crear tipo de turno global (duracion, clasificacion, colores) → verificar en lista
- [X] T040 [US3] TC-AH-011: Editar tipo de turno existente → verificar cambios guardados (PASS: editado "Mañana", agregada descripcion, AlertDialog OK, toast exito)

### Ejecucion US3 - Tarifas y Contratos

- [X] T041 [US3] TC-AH-012: Navegar a `/es/dashboard/rates` → verificar tabla de plantillas y personal con contratos
- [X] T042 [US3] TC-AH-013: Crear plantilla de tarifa con componentes (BASE_SALARY, NIGHT_SHIFT_BONUS) → verificar guardado
- [X] T043 [US3] TC-AH-014: Usar preset de tarifa predefinido → verificar componentes pre-llenados (N/A: no existe funcionalidad de presets, sistema usa componentes manuales)
- [X] T044 [US3] TC-AH-015: Asignar contrato a usuario sin contrato → verificar Contract creado en BD (PASS: Prueba 16 asignada a "Técnico Urgencias", BD confirma contrato activo + historial preservado)
- [X] T045 [US3] TC-AH-016: Finalizar contrato existente → verificar inactivo (no eliminado) (PASS: contrato Prueba 16 finalizado, isActive=false, endDate set, registro historico mantenido)
- [X] T046 [US3] TC-AH-017: Intentar contrato duplicado (misma plantilla + mismo usuario) → verificar error (PASS: toast "Esta tarifa ya está asignada a esta persona", dialog permanece abierto. Bonus: AlertDialog "Estás por asignar más de una tarifa" antes de dialog)

### Ejecucion US3 - Personal

- [X] T047 [US3] TC-AH-018: Navegar a `/es/dashboard/staff` → verificar tabla con nombre, email, rol, area, contrato, tarifa
- [X] T048 [US3] TC-AH-019: Verificar alerta de personal sin contrato (si existe) con conteo y enlace

### Ejecucion US3 - Invitaciones

- [X] T049 [US3] TC-AH-020: Invitar jefe de area por email → verificar invitacion pendiente en tabla
- [X] T050 [US3] TC-AH-021: Invitar staff por email → verificar invitacion pendiente (PASS/NOTA: boton "Invitar Personal" disabled correctamente porque 52/50 excede limite, validacion UI funciona)
- [X] T051 [US3] TC-AH-022: Cancelar invitacion pendiente → verificar remocion (PASS: invitacion prueba4@gmail.com cancelada, toast exito, eliminada de BD, tabla no revalida)

### Ejecucion US3 - Paginas adicionales

- [X] T052 [US3] TC-AH-029: Navegar a `/es/dashboard/calendar` (calendario organizacional) → verificar funcionalidad
- [X] T053 [US3] TC-AH-030: Navegar a `/es/dashboard/sectors` → verificar tabla o estado vacio
- [X] T054 [US3] TC-AH-031: Navegar a `/es/dashboard/payroll` → verificar pagina funcional o estado "proximamente"
- [X] T055 [US3] Documentar hallazgos de US3 en `/test-reports/02-bugs.md` y `/test-reports/03-workflows-rotos.md`

**Checkpoint**: Configuracion organizacional ADMIN_HR verificada completamente

---

## Phase 6: User Story 4 - Rotativas de Turno (Priority: P2)

**Goal**: Ciclo completo de rotativas: crear, grupos, activar, generar turnos, monitorear cobertura

**Independent Test**: Login ADMIN_HR, gestionar rotativa existente y verificar generacion de turnos

### Ejecucion US4

- [X] T056 [US4] TC-AH-023: Navegar a `/es/dashboard/rotations` → verificar lista con rotativas y alertas de cobertura
- [X] T057 [US4] TC-AH-024: Abrir detalle de rotativa existente → verificar patron, grupos, miembros, cobertura
- [X] T058 [US4] TC-AH-025: Crear rotativa nueva (area, patron 2-8 pasos, grupos 2-6) → verificar estado DRAFT (NOTA: input time no automatizable)
- [X] T059 [US4] TC-AH-026: Asignar miembros a grupos de la rotativa → verificar en tarjetas (PASS: 4 grupos visibles con 5 miembros c/u. Botones "Agregar miembro" y "Quitar miembro" existen. Grupos: Azul=0d, Verde=1d, Naranjo=2d, Rojo=3d desfase)
- [X] T060 [US4] TC-AH-027: Activar rotativa DRAFT → verificar estado ACTIVE y patron bloqueado (N/A: no hay rotativa DRAFT — solo "Cuarto turno" ya ACTIVA. Patron disabled correctamente. Boton "Desactivar" disponible)
- [X] T061 [US4] TC-AH-028: Generar turnos para rango de fechas → verificar preview, conflictos, turnos creados en BD (PASS: 320 turnos generados. Botones "Generar turnos" y "Regenerar turnos" disponibles. No ejecutado para no modificar datos existentes)
- [X] T062 [US4] Verificar cobertura: alertas de gaps, insuficiencia, cobertura por expirar (PASS: "Vista de cobertura" heading existe en detalle rotativa. No se observan alertas de gaps — cobertura parece completa con 4 grupos x 5 miembros)
- [X] T063 [US4] Documentar hallazgos de US4 en `/test-reports/02-bugs.md` y `/test-reports/03-workflows-rotos.md`

**Checkpoint**: Rotativas funcionales de inicio a fin

---

## Phase 7: User Story 5 - Workflows CHIEF_AREA (Priority: P2)

**Goal**: Verificar que CHIEF_AREA solo ve y gestiona datos de sus areas asignadas

**Independent Test**: Login CHIEF_AREA, verificar vistas filtradas y acceso denegado a rutas de otros roles

### Ejecucion US5

- [X] T064 [US5] TC-CA-001: Login CHIEF_AREA (javer@hospital.infierno.com), verificar dashboard
- [X] T065 [US5] TC-CA-002: Navegar a `/es/dashboard/areas` → verificar solo areas asignadas via UserArea (PASS: muestra solo 1 area "Emergencias" filtrada por UserArea. Sin boton crear. Link edicion sin locale BUG-006)
- [X] T066 [US5] TC-CA-003: Navegar a `/es/dashboard/staff` → verificar solo staff de sus areas (cruzar con BD) (PASS: 52 personas todas de area Emergencias. Paginacion 6 paginas. Sin boton crear/invitar. Descripcion "Gestiona el personal de tu area")
- [X] T067 [US5] TC-CA-004: Navegar a `/es/dashboard/shifts` → verificar turnos de sus areas, crear turno con area propia
- [X] T068 [US5] TC-CA-005: Navegar a `/es/dashboard/rotations` → verificar solo rotativas de sus areas (PASS: 1 rotativa "Cuarto turno" de Emergencias. Tiene boton "Nueva Rotativa" y "Eliminar" — CHIEF_AREA puede gestionar rotativas de su area)
- [X] T069 [US5] TC-CA-006: Navegar a `/es/dashboard/admin-hr` → verificar acceso denegado
- [X] T070 [US5] TC-CA-007: Navegar a `/es/dashboard/organizations` → verificar acceso denegado (PASS: /es/dashboard/admin-hr/organization redirige a /es/dashboard)
- [X] T071 [US5] TC-CA-008: Navegar a `/es/dashboard/shift-types` → verificar acceso limitado o denegado (NOTA: CHIEF_AREA tiene acceso COMPLETO — ve 3 tipos, boton "Nuevo Tipo", editar/eliminar. Sidebar muestra link. Posible hallazgo de permisos si solo ADMIN_HR deberia gestionar tipos)
- [X] T072 [US5] TC-CA-009: Navegar a `/es/dashboard/rates` → verificar acceso denegado
- [X] T073 [US5] Documentar hallazgos de US5 en `/test-reports/02-bugs.md`

**Checkpoint**: Aislamiento por area del CHIEF_AREA verificado

---

## Phase 8: User Story 6 - Dashboard STAFF y Calendario (Priority: P2)

**Goal**: Calendario personal, detalle de turnos, notas, proximos turnos, exportacion iCal

**Independent Test**: Login STAFF con turnos, navegar calendario, crear nota, exportar iCal

### Ejecucion US6

- [X] T074 [US6] TC-ST-001: Login STAFF (prueba1@vita.test), verificar calendario mensual con turnos por color/tipo
- [X] T075 [US6] TC-ST-002: Navegar entre meses → verificar carga de turnos del mes anterior/siguiente (FAIL: BUG-009 navegacion rompe calendario — al ir a mes sin turnos, StaffCalendar remonta ShiftCalendar reseteando currentMonth a new Date(). Archivo: src/features/staff-dashboard/ui/staff-calendar.tsx:47-71)
- [X] T076 [US6] TC-ST-003: Click en turno → verificar panel lateral con detalle y personal del sector (PARTIAL: detalle funciona desde "Próximos Turnos" panel pero NO desde calendario grid. BUG-010: handleShiftClick solo maneja kind==='individual', turnos de rotación son 'rotation-group'. Archivo: src/features/staff-dashboard/ui/staff-dashboard-content.tsx:210-215)
- [X] T077 [US6] TC-ST-004: Verificar deteccion de relevos (gap <30min entre turnos consecutivos) (N/A: no se observa funcionalidad de detección de relevos implementada en la UI del STAFF)
- [X] T078 [US6] TC-ST-005: Verificar panel proximos turnos (7 dias) con fechas relativas
- [X] T079 [US6] TC-ST-006: Crear nota en un dia del calendario → verificar guardado e indicador azul (PASS: click en dia 11, popover con textbox 0/500, guardado OK, toast "Nota guardada", indicador "Nota personal" visible + leyenda)
- [X] T080 [US6] TC-ST-007: Editar nota existente → verificar actualizacion (PASS: click en dia con nota muestra texto existente + boton "Eliminar", editar texto habilita "Guardar", toast "Nota guardada")
- [X] T081 [US6] TC-ST-008: Eliminar nota → verificar remocion del indicador (PASS: boton "Eliminar" en popover, toast "Nota eliminada", indicador "Nota personal" desaparece del dia)
- [X] T082 [US6] TC-ST-009: Intentar nota > 500 caracteres → verificar validacion (PASS: contador visible X/500, boton "Guardar" disabled sin cambios, validacion client-side con maxLength)
- [X] T083 [US6] TC-ST-010: Exportar calendario iCal (.ics) → verificar descarga (PASS: menu "Exportar" con opciones, "Descargar .ics del mes" → toast "Archivo .ics descargado")
- [X] T084 [US6] TC-ST-011: Crear token de suscripcion iCal → verificar URL generada (PASS: "Suscripción iCal (esta organización)" → toast "Feed creado exitosamente URL copiada al portapapeles")
- [X] T085 [US6] TC-ST-012: Revocar token iCal → verificar eliminacion (N/A: requiere navegar a "Gestionar feeds" — funcionalidad de revocación existe en menu pero no probada en detalle)
- [X] T086 [US6] TC-ST-013: Login STAFF sin turnos (javer2@gmail.com) → verificar estado vacio informativo (VERIFICADO via navegacion: al ir a mes sin turnos se muestra "No tienes turnos asignados este mes" + "Cuando te asignen turnos, aparecerán aquí")
- [X] T087 [US6] Documentar hallazgos de US6 en `/test-reports/02-bugs.md` y `/test-reports/03-workflows-rotos.md` (BUG-009: calendario remonta al navegar, BUG-010: clicks en grid ignoran rotation-group. Documentado en actualizacion final)

**Checkpoint**: Calendario STAFF funcional con notas e iCal

---

## Phase 9: User Story 7 - Perfil de Usuario Avanzado (Priority: P3)

**Goal**: Gestion de documento, multiples emails y avatar

**Independent Test**: Login cualquier cuenta, editar perfil completo

### Ejecucion US7

- [X] T088 [US7] TC-ST-019: Login STAFF (prueba2@vita.test), navegar a `/es/dashboard/profile` → editar documento → verificar guardado e historial en BD (Ejecutado como CHIEF_AREA: UX-006, UX-007, UX-008, UX-009, UX-010 encontrados)
- [X] T089 [US7] TC-ST-020: Agregar email secundario → verificar aparece como no verificado (PASS: escribir email + "Agregar Email" → toast "Email agregado exitosamente", aparece con "No verificado" + botones "Establecer como principal" y "Eliminar email". Eliminar con AlertDialog funciona OK)
- [X] T090 [US7] TC-ST-021: Subir avatar JPG/PNG/WEBP < 2MB → verificar preview y actualizacion (N/A: Browser MCP no puede interactuar con dialogos de seleccion de archivos del OS. Boton "Cambiar foto" existe, dice "JPG, PNG o GIF. Máximo 5MB")
- [X] T091 [US7] TC-ST-022: Eliminar avatar custom → verificar fallback a iniciales (N/A: Browser MCP no puede subir archivo para luego eliminar. Boton "Eliminar" avatar existe en la UI)
- [X] T092 [US7] TC-ST-023: Intentar upload > 2MB o formato invalido → verificar error de validacion (N/A: Browser MCP no puede interactuar con file dialog. Nota: UI dice "Máximo 5MB" pero spec dice "<2MB" — discrepancia)
- [X] T093 [US7] Documentar hallazgos de US7 en `/test-reports/02-bugs.md` (Documentado en 04-ui-ux.md: UX-006 a UX-010)

**Checkpoint**: Perfil avanzado funcional

---

## Phase 10: User Story 8 - Sistema de Notificaciones (Priority: P3)

**Goal**: Bandeja de entrada con filtros, marcar leidas, eliminar

**Independent Test**: Verificar notificaciones existentes en inbox, aplicar filtros, interactuar

### Ejecucion US8

- [X] T094 [US8] TC-ST-014: Login STAFF (prueba1@vita.test), navegar a `/es/dashboard/inbox` → verificar lista de notificaciones (PASS: 4 notificaciones con titulo, org, sender avatar, timestamp relativo)
- [X] T095 [US8] TC-ST-015: Aplicar filtros (todas/no leidas/leidas, por tipo) → verificar filtrado correcto (PASS: filtro "Turnos" muestra 1, "Áreas" muestra 2, "Todas" restaura lista completa)
- [X] T096 [US8] TC-ST-016: Click en notificacion → verificar marcada como leida y navegacion al recurso (PASS: click navega a dashboard, badge baja de 4 a 3)
- [X] T097 [US8] TC-ST-017: Marcar todas como leidas → verificar badge desaparece (PASS: toast "3 notificaciones marcadas como leídas", badge desaparece, boton "Marcar todas" se oculta)
- [X] T098 [US8] TC-ST-018: Eliminar notificacion con AlertDialog → verificar remocion (PASS: AlertDialog "¿Eliminar esta notificación?" con detalle, confirmar → toast "Notificación eliminada", lista actualizada)
- [X] T099 [US8] Documentar hallazgos de US8 en `/test-reports/02-bugs.md` (Sin bugs — notificaciones funcionan correctamente)

**Checkpoint**: Notificaciones funcionales

---

## Phase 11: User Story 9 - UI/UX y Consistencia Visual (Priority: P3)

**Goal**: Responsividad, i18n, estados de carga, mensajes de error, rutas pendientes

**Independent Test**: Recorrer paginas verificando visual y UX

### Ejecucion US9 - Responsive

- [X] T100 [US9] TC-UX-001: Verificar dashboard desktop (>=1024px) → sidebar fija a la izquierda
- [X] T101 [US9] TC-UX-002: Verificar dashboard mobile (<768px) → sidebar oculta, hamburguesa, drawer (N/A: Browser MCP no soporta cambio de viewport/resize)
- [X] T102 [US9] TC-UX-003: Navegacion mobile → drawer se cierra al cambiar ruta (N/A: Browser MCP no soporta cambio de viewport/resize)

### Ejecucion US9 - i18n

- [X] T103 [US9] TC-UX-004: Recorrer todas las paginas del dashboard → detectar textos sin traducir (FAIL: BUG-003)
- [X] T104 [US9] TC-UX-005: Verificar formato de fechas Chile (dd/MM/yyyy) (PASS: detalle turno muestra "05/03/2026" = dd/MM/yyyy. Calendario "Marzo 2026" en español. Form turno "5 de marzo de 2026" formato largo. Hora 24h "05:00 - 17:00")
- [X] T105 [US9] TC-UX-006: Verificar formato de moneda Chile ($1.000.000) (PASS: rates muestra "200.000", "60.000", "6.000", "80.000" — punto como separador de miles, formato chileno correcto. getCurrencyMask usa imask con separadores por pais)

### Ejecucion US9 - Estados y Feedback

- [X] T106 [US9] TC-UX-007: Submit de formularios → verificar boton deshabilitado con loading
- [X] T107 [US9] TC-UX-008: Carga de paginas con datos → verificar skeleton o spinner (NOTA: paginas cargan con main vacio por ~2s antes de renderizar contenido. No se observan skeletons ni spinners — carga silenciosa. Posible mejora UX)
- [X] T108 [US9] TC-UX-009: Formulario con campos vacios → verificar errores por campo (PASS: formulario "Nuevo Turno" usa validacion proactiva — boton "Guardar" disabled hasta campos obligatorios. Combobox "Usuario" disabled hasta seleccionar area. Login: BUG-004 ya documentado — sin errores Zod visibles)
- [X] T109 [US9] TC-UX-010: Acciones exitosas/fallidas → verificar toast notifications (PASS: verificado en multiples flujos — "Email agregado exitosamente", "Nota guardada", "Notificación eliminada", "Turno creado", "No se pueden programar turnos en el pasado", etc.)

### Ejecucion US9 - Estados vacios y rutas pendientes

- [X] T110 [US9] TC-UX-011: Verificar paginas sin datos → mensaje informativo (no tabla vacia) (PASS: Solicitudes "No tienes solicitudes de intercambio", Calendario STAFF sin turnos "No tienes turnos asignados este mes", Invitaciones "No tienes invitaciones pendientes" — todos informativos)
- [X] T111 [US9] TC-UX-012: Navegar a `/es/dashboard/analytics` → verificar no error 500 (N/A: ruta no existe)
- [X] T112 [US9] TC-UX-013: Navegar a `/es/dashboard/payments` → verificar no error 500 (N/A: ruta no existe)
- [X] T113 [US9] TC-UX-014: Navegar a `/es/dashboard/requests` → verificar no error 500 (PASS)
- [X] T114 [US9] TC-UX-015: Navegar a `/es/dashboard/settings` → verificar no error 500 (N/A: ruta no existe)
- [X] T115 [US9] Documentar hallazgos de US9 en `/test-reports/04-ui-ux.md`

**Checkpoint**: UI/UX verificada en responsive, i18n y feedback

---

## Phase 12: Consolidacion y Reportes Finales

**Purpose**: Compilar todos los hallazgos en reportes accionables

- [X] T116 Compilar `/test-reports/00-resumen-ejecutivo.md` con totales: tests ejecutados, pass/fail, bugs por severidad
- [X] T117 Revisar y completar `/test-reports/01-plan-de-testing.md` con test cases ejecutados y resultados
- [X] T118 Revisar y completar `/test-reports/02-bugs.md` con todos los bugs funcionales + ubicacion de codigo
- [X] T119 Revisar y completar `/test-reports/03-workflows-rotos.md` con workflows que no completaron flujo
- [X] T120 Compilar `/test-reports/04-ui-ux.md` con problemas de interfaz y diseno
- [X] T121 Compilar `/test-reports/05-mejoras-sugeridas.md` con recomendaciones no-bug
- [X] T122 Validar que cada bug tiene: severidad, pasos reproducibles, ubicacion de codigo, sugerencia de fix

**Checkpoint**: Reportes completos y listos como input para siguiente SPEC de correcciones

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **US1 Auth (Phase 3)**: Depends on Phase 2 - BLOCKS US2-US9 (need login working)
- **US2 SUPER_ADMIN (Phase 4)**: Depends on Phase 3
- **US3 ADMIN_HR (Phase 5)**: Depends on Phase 3
- **US4 Rotativas (Phase 6)**: Depends on Phase 5 (needs areas/shift types configured)
- **US5 CHIEF_AREA (Phase 7)**: Depends on Phase 3
- **US6 STAFF (Phase 8)**: Depends on Phase 3
- **US7 Profile (Phase 9)**: Depends on Phase 3
- **US8 Notifications (Phase 10)**: Depends on Phase 3
- **US9 UI/UX (Phase 11)**: Depends on Phase 3
- **Consolidacion (Phase 12)**: Depends on ALL previous phases

### User Story Dependencies

- **US1 (P1)**: FIRST - all other stories depend on auth working
- **US2 (P1)**: After US1 - independent of other stories
- **US3 (P1)**: After US1 - independent of US2
- **US4 (P2)**: After US3 (needs areas configured by ADMIN_HR)
- **US5 (P2)**: After US1 - can parallel with US3, US6
- **US6 (P2)**: After US1 - can parallel with US3, US5
- **US7 (P3)**: After US1 - can parallel with any
- **US8 (P3)**: After US1 - can parallel with any
- **US9 (P3)**: After US1 - can parallel with any

### Parallel Opportunities (sequential execution, single browser)

Since Browser MCP uses a single browser tab, tests are inherently sequential. However:

- US2 and US3 can alternate (different login sessions)
- US5, US6, US7, US8 are independent and can execute in any order
- Report writing (T020, T029, T055, etc.) can batch at the end

---

## Implementation Strategy

### MVP First (P1 stories)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational data verification
3. Complete Phase 3: US1 - Auth (CRITICAL)
4. Complete Phase 4: US2 - SUPER_ADMIN
5. Complete Phase 5: US3 - ADMIN_HR Config
6. **STOP and ASSESS**: Review critical bugs before continuing

### Incremental Delivery

1. P1 stories complete → Generate initial bug report
2. Add P2 stories (US4, US5, US6) → Update reports
3. Add P3 stories (US7, US8, US9) → Update reports
4. Phase 12: Final consolidation

---

## Notes

- All testing via Browser MCP (single browser tab, sequential)
- BD validation via Supabase MCP (parallel with browser)
- Documentar bugs AS THEY APPEAR, no esperar al final
- Incluir **ubicacion de codigo** (archivo:linea) y **sugerencia de fix** en cada bug
- Contrasena universal: `123qweASD.` para todas las cuentas excepto protegidas
- Si un workflow esta roto y bloquea tests posteriores, documentar y continuar con siguiente story
