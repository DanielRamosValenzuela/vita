# Workflows VITA

Documento de referencia de **flujos funcionales** por rol. Marca `[x]` = implementado, `[ ]` = pendiente.

---

## SUPER_ADMIN

- [x] **Crear organizacion** — `/dashboard/organizations` > Nueva Organizacion > nombre, pais, RUT, plan, limites > Guardar
- [x] **Editar organizacion** — Tabla > Ver/Editar > modificar datos, plan, limites > Guardar (valida limites vs uso actual)
- [x] **Suspender / reactivar / eliminar organizacion** — Tabla > acciones criticas (AlertDialog) > razon > Confirmar
- [ ] **Gestion de pagos** — Registrar pagos manuales, ver historial, marcar morosidad
- [ ] **Notificaciones a organizaciones** — Aviso de suspension inminente, recordatorios de pago

---

## ADMIN_HR (Recursos Humanos)

- [x] **Configurar "Mi Organizacion"** — `/dashboard/admin-hr/organization` > tarjetas de uso, jefes/staff, invitaciones pendientes
- [x] **Invitar Jefe de Area o Personal de Salud** — Mi Organizacion > Invitar > buscar por email/documento > enviar invitacion con rol
- [x] **Gestionar Areas** — `/dashboard/areas` > crear (nombre, icono, color), editar (tipos de turno, limites, jefes), activar, eliminar
- [x] **Gestionar Sectores** — `/dashboard/sectors` > CRUD de sectores, asignar areas many-to-many, jefes de sector, consulta de personal por turno
- [x] **Gestionar Tipos de Turno** — `/dashboard/shift-types` > crear/editar (duracion, clasificacion, colores, limites, global/especifico)
- [x] **Tarifas y Contratos** — `/dashboard/rates` > plantillas de tarifa (RateTemplate), contratos a personas, componentes modulares
- [x] **Gestion de Personal** — `/dashboard/staff` > tabla de plantilla, areas, contratos, tarifas (CHIEF_AREA ve solo sus areas)
- [x] **Dashboard ADMIN_HR con metricas** — `/dashboard/admin-hr` > areas, tipos activos, personal, contratos, turnos del mes, limites
- [x] **Rotativas de Turno** — `/dashboard/rotations` > patron ciclico, grupos, generar turnos masivos, cobertura, turnos extra
- [x] **Nomina y Pagos** — `/dashboard/payroll` > configurar dia de facturacion, generar nomina manual, ver historial, descargar PDFs, regenerar/eliminar documentos individuales
- [ ] **Metricas avanzadas de turnos** — Resumen de horas trabajadas, distribucion de staff por area
- [ ] **Gestion avanzada de personal** — UI para cambiar area principal, reasignaciones masivas
- [ ] **Reportes exportables** — Exportar a Excel/PDF resumen de personal, contratos y areas

---

## CHIEF_AREA (Jefes de Area)

- [x] **Ver areas asignadas** — `/dashboard/areas` > solo areas donde esta asignado via UserArea
- [x] **Ver personal de sus areas** — `/dashboard/staff` > solo contratos y personal de sus areas
- [x] **Crear y gestionar turnos** — `/dashboard/shifts` > filtrar por sus areas, crear/editar con tipos globales o de area
- [x] **Gestionar rotativas de turno** — `/dashboard/rotations` > solo de sus areas, misma funcionalidad que ADMIN_HR
- [x] **Ver nomina de sus areas** — `/dashboard/payroll` > documentos de nomina filtrados por personal de sus areas, descarga de PDFs
- [ ] **Editar/eliminar turnos** — Click en turno del calendario o tabla > Sheet lateral con detalle editable, cancelar turno con AlertDialog
- [ ] **Vinculacion directa de staff** — Flujo donde CHIEF vincula staff mediante codigo de vinculacion
- [ ] **Aprobacion de intercambios de turno** — Aprobar/rechazar solicitudes de intercambio
- [ ] **Gestion de asistencia** — Marcar asistencia manual, gestionar ausencias y reemplazos

---

## STAFF (Personal de Salud)

- [x] **Vinculacion a organizaciones** — Registro > codigo de vinculacion > ADMIN_HR/CHIEF invita > aparece en perfil
- [x] **Calendario personal de turnos** — `/dashboard` > calendario mensual interactivo, navegacion entre meses, diferenciacion visual por tipo/estado/rotativa
- [x] **Detalle de turno + personal activo** — Click en turno > panel lateral con detalle, personal del sector, deteccion de relevos
- [x] **Proximos turnos (7 dias)** — Panel lateral con turnos proximos, fechas relativas, click para detalle
- [x] **Notas personales en calendario** — Click en dia > popover > textarea (max 500 chars), una por dia, indicador visual
- [x] **Exportacion iCal y feeds** — Descarga .ics, feed por org (token unico), feed unificado, gestion de tokens
- [x] **Ver mis pagos** — `/dashboard/payroll` > documentos de nomina propios, descarga de PDFs
- [ ] **Importacion de Google Calendar** — Conectar Google Calendar via OAuth, importar eventos, deteccion de conflictos
- [ ] **Calendario unificado multi-organizacion** — Ver turnos de todas las organizaciones
- [ ] **Postulaciones a turnos abiertos** — Listado de turnos abiertos, postulacion y estado
- [ ] **Intercambios de turnos** — Solicitar intercambio, ver estado, aceptar/rechazar

---

## Sistema de Tarifas Flexibles (v2.0)

- [x] **Creacion de Plantilla de Tarifa** — `/dashboard/rates` > preset o desde cero > nombre, componentes (18 tipos + CUSTOM), condiciones > Guardar
- [x] **Asignacion de Contrato a Personal** — Tabla de personal > asignar tarifa > seleccionar plantilla, area > Confirmar
- [x] **Visualizacion de Personal** — `/dashboard/staff` > tabla con nombre, rol, area, estado contrato, tarifa, multiplicador
- [x] **Gestion de Componentes** — Salarios base, tarifas por tiempo, bonos, multiplicadores, compensaciones
- [x] **Presets predefinidos** — 10 presets (Guardia Salud, Seguridad 24/7, Freelance, Administrativo, etc.)
- [x] **Formateo de moneda dinamico** — Chile: $1.000.000, USA: $1,000,000
- [x] **Duplicacion de plantillas** — Copiar plantilla existente con todos sus componentes
- [x] **Calculo automatico de pagos** — Motor de calculo por turno (componentes + condiciones + multiplicadores de calendario), hook al completar turno, calculo mensual de nomina
- [ ] **Reportes y Analytics** — Costos por personal, contratos activos, componentes mas usados, exportacion

---

## Sistema de Nomina y Pagos (v1.0)

- [x] **Configuracion de dia de facturacion** — `/dashboard/rates` > ADMIN_HR configura dia del mes (1-31) para generacion de nomina
- [x] **Generacion manual de nomina** — `/dashboard/payroll` > seleccionar mes/ano > generar PDFs para todo el personal con contratos activos
- [x] **Visualizacion y descarga por roles** — ADMIN_HR ve todo, CHIEF_AREA ve personal de sus areas, STAFF ve solo su documento
- [x] **Documento PDF detallado** — Desglose por turno, componentes de tarifa, multiplicadores de calendario, multiplicador de contrato, subtotales
- [x] **Generacion automatica programada** — API Route + pg_cron diario, procesa organizaciones cuyo billingDay coincide con hoy
- [x] **Notificaciones de nomina** — PAYROLL_GENERATED para ADMIN_HR, PAYROLL_DOCUMENT_AVAILABLE para STAFF
- [x] **Regenerar documento individual** — ADMIN_HR puede recalcular y regenerar PDF de un empleado especifico
- [x] **Eliminar documentos** — ADMIN_HR puede eliminar PDFs individuales o en lote con confirmacion
- [ ] **Resumen de costos por periodo** — Dashboard con graficos de costos por area, tendencias mensuales
- [ ] **Exportacion de nomina a Excel** — Exportar resumen de nomina para contabilidad

---

## Sectores (Agrupacion de Areas)

- [x] **CRUD de Sectores** — `/dashboard/sectors` > crear (nombre, descripcion, icono, color), editar, eliminar con AlertDialog
- [x] **Asignar areas a sectores** — Editar sector > multi-select de areas, relacion many-to-many via SectorArea
- [x] **Asignar jefes de sector** — Editar sector > asignar jefes de sector
- [x] **Consultar personal por turno en sector** — `/dashboard/sectors/[id]/staff` > seleccionar fecha y rango horario, ver personal agrupado por area
- [x] **Tabla de sectores con resumen** — Lista con nombre, icono, conteo de areas, acciones
- [ ] **Conteo de personal en turno en tiempo real** — Mostrar en tabla de sectores cuantos estan en turno ahora

---

## Rotativas de Turno (v4.1)

- [x] **Crear Rotativa** — `/dashboard/rotations` > area, nombre, patron (2-8 pasos), horarios, grupos (2-6) > Guardar como DRAFT
- [x] **Gestionar Grupos y Miembros** — Tarjetas de grupo > agregar/eliminar miembros > notificacion ROTATION_ASSIGNED
- [x] **Activar Rotativa** — DRAFT > ACTIVE (requiere min 2 grupos con miembros, bloquea patron)
- [x] **Generar Turnos** — Rango de fechas > preview (total, por grupo, conflictos) > opcion sobrescribir > generar
- [x] **Regenerar Turnos** — Rango de fechas > opcion reemplazar existentes > regenerar
- [x] **Monitorear Cobertura** — Calendario visual, alertas (gaps, insuficiencia, cobertura por expirar)
- [x] **Asignar Turnos Extra** — Motor de Tiers (TIER 1-3 + nunca recomendar), advertencias de limites, asignar
- [x] **Eliminar Rotativa** — Opcion desvincular turnos o eliminar turnos generados
- [ ] **Edicion de patron en rotativa activa** — Migracion de turnos existentes al cambiar patron
- [ ] **Rotativas recurrentes automaticas** — Generacion automatica al acercarse fin de cobertura
- [ ] **Vista hibrida en calendario** — Agrupar turnos de rotativa en bloques compactos

---

## Perfil de Usuario (Todos los Roles)

- [x] **Gestion de Documento/RUT** — Perfil > editar pais, tipo, numero > validacion unica por org > historial automatico
- [x] **Multiples Emails** — Perfil > agregar email secundario > marcar como primario (si verificado) > eliminar secundario
- [x] **Avatar personalizado** — Perfil > subir imagen (JPG/PNG/WEBP, max 5MB) > Supabase Storage > eliminar > fallback OAuth/iniciales
- [ ] **Verificacion de emails secundarios** — Envio de email de confirmacion, link de verificacion
- [ ] **Vinculacion OAuth completa** — Link de cuenta Google a cuenta existente, desvinculacion de proveedores

---

## Calendario Organizacional

- [x] **UI para dias especiales** — Sheet lateral con formulario, multiplicadores por tipo de dia
- [x] **CRUD completo** — Crear, editar, eliminar (AlertDialog) dias especiales
- [x] **Navegacion entre meses** — Carga dinamica de datos por mes
- [x] **Resumen mensual** — Badges por tipo de dia
- [x] **Importacion masiva de feriados** — Via BFF/Boostr API, feriados nacionales
- [ ] **Dias recurrentes** — Ej: todos los domingos del ano
- [ ] **Auto-importacion al crear organizacion** — Importar feriados automaticamente

---

## UI/UX y Diseno Visual

- [x] **Animaciones con Framer Motion** — Primitivas (MotionSection, MotionCard, MotionStagger), variants, scroll animations, counter animations
- [x] **Landing page rediseñada** — Hero animado, secciones con scroll-triggered animations, hover micro-interactions
- [x] **Login y Registro mejorados** — Toggle de visibilidad de contrasena, layout rediseñado con animaciones de entrada
- [x] **Navbar y Footer rediseñados** — Scroll-aware navbar, footer con hover animations
- [x] **Paginas publicas secundarias rediseñadas** — About, Contact, Features, Pricing, Support, Terms, Privacy
- [x] **Dashboard polish** — Sidebar con hover transitions, content fade-in en navegacion
- [x] **Soporte prefers-reduced-motion** — Animaciones deshabilitadas/minimizadas para accesibilidad
- [x] **Temas TweakCN** — Compatibilidad con multiples temas en light/dark mode

---

## Workflows Transversales

- [x] **Invitaciones y vinculacion** — ADMIN_HR invita jefes/staff, SUPER_ADMIN invita ADMIN_HR, usuarios aceptan desde perfil
- [x] **Gestion de areas y tipos de turno** — ADMIN_HR define, CHIEF_AREA combina globales + especificos
- [x] **Sistema de Notificaciones** — Bandeja de entrada con filtros, badge, tipos automaticos (invitaciones, areas, turnos, nomina), paginacion cursor-based
- [x] **QA E2E Testing** — 122 test cases ejecutados, bugs encontrados y corregidos (spec 007 + 008)
- [ ] **Aceptacion/rechazo con auditoria** — Flujo completo de invitaciones con limites estrictos por plan
- [ ] **Validacion legal avanzada** — Reglas de descansos, maximos semanales en la UI
- [ ] **Notificaciones SUPER_ADMIN** — Notificaciones para el rol SUPER_ADMIN
- [ ] **Notificaciones en tiempo real** — WebSocket/SSE
- [ ] **Notificaciones por email** — Envio de emails automaticos
- [ ] **Notificaciones de intercambio de turno** — Entre staff

---

## Proximos Workflows a Disenar

- [ ] **Gestion de Pagos SUPER_ADMIN** — Panel SUPER_ADMIN para cobros a organizaciones, morosidad
- [ ] **App movil / PWA para Staff** — Calendario movil, notificaciones push, postulacion/intercambio
- [ ] **Reportes de Cumplimiento Legal** — Horas trabajadas vs limites legales por pais
- [ ] **Intercambio de turnos (Shift Swap)** — Ver `PLAN-SHIFT-SWAP-AND-EXTRA.md`
- [ ] **Editar/eliminar turnos desde calendario** — ShiftDetailSheet para edicion y cancelacion (spec 002 US4 pendiente)
- [ ] **Google Calendar import** — OAuth + fetch events + conflictos (spec 005 US5 pendiente)
