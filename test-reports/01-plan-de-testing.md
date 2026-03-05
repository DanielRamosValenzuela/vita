# Plan de Testing E2E - VITA

**Fecha**: 2026-03-05
**Herramientas**: Browser MCP (Chrome), Supabase MCP (PostgreSQL)
**Ambiente**: localhost:3001 (dev server)

---

## Cuentas de Prueba

| Rol | Email | Org |
|-----|-------|-----|
| SUPER_ADMIN | prueba10@gmail.com | Sin org |
| ADMIN_HR | emiliano@gmail.com | Hospital vete al infierno |
| CHIEF_AREA | javer@hospital.infierno.com | Hospital vete al infierno |
| STAFF | prueba1@vita.test | Hospital vete al infierno |

**Contrasena universal:** `123qweASD.`

---

## Fase 1: Autenticacion (TC-AUTH)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-AUTH-001 | Login con credenciales validas (STAFF) | PASS | Redirige a landing (BUG-002) |
| TC-AUTH-002 | Login con credenciales invalidas | PASS | Muestra "Credenciales invalidas" |
| TC-AUTH-003 | Login cuando ya autenticado redirige a dashboard | PASS | |
| TC-AUTH-004 | Logout | PASS | Timeout WebSocket pero funciona |
| TC-AUTH-005 | Formulario vacio | FAIL | No muestra errores Zod (BUG-004) |
| TC-AUTH-006 | Dashboard sin sesion | FAIL | No redirige a login (BUG-001) |
| TC-AUTH-007 | Admin-HR sin sesion | FAIL | Pagina vacia, no redirige (BUG-001) |

## Fase 2: ADMIN_HR (TC-AH)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-AH-001 | Dashboard ADMIN_HR metricas | PASS | 1 area, 2 tipos, 53 personal, 310 turnos |
| TC-AH-002 | Mi Organizacion | PASS | Limites, jefes, staff, invitaciones |
| TC-AH-003 | Lista de areas | PASS | 1 area "Emergencias" |
| TC-AH-009 | Lista shift types | PASS | "Largo" 12h + "Noche" 12h |
| TC-AH-012 | Rate templates | PASS | 2 plantillas, bug i18n (BUG-003) |
| TC-AH-018 | Lista de personal | PASS | 53 personas, paginacion |
| TC-AH-019 | Alerta sin contrato | PASS | 0 sin contrato |
| TC-AH-023 | Lista rotativas | PASS | "Cuarto turno" activa |
| TC-AH-029 | Calendario organizacional | PASS | Funcional con leyenda |
| TC-AH-030 | Sectores | PASS | 1 sector "Urgencias" |
| TC-AH-031 | Payroll | PASS | Generador de nomina funcional |
| TC-AH-Shifts | Gestion de turnos | PASS | 200 turnos, filtros, paginacion |

### Fase 2b: ADMIN_HR CRUD E2E (TC-AH-CRUD)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-AH-CRUD-001 | Crear Area "Urgencias" | PASS | Nombre, descripcion, icono ambulancia, guardado OK |
| TC-AH-CRUD-002 | Editar Area (asignar jefe + staff) | PASS | Jefe: Javer Valenzuela, Staff: Prueba 1 |
| TC-AH-CRUD-003 | Link edicion areas no navega | FAIL | BUG-006: href sin locale prefix |
| TC-AH-CRUD-004 | Crear Shift Type "Manana" | PASS | 8h, Dia, Global, Activo |
| TC-AH-CRUD-005 | Asignar Shift Type a Area | PASS | "Manana" asignado a "Urgencias" |
| TC-AH-CRUD-006 | Activar Area con shift type | PASS | Area pasa a estado Activa |
| TC-AH-CRUD-007 | Crear Rate Template "Tecnico Urgencias" | PASS | 1 componente: Sueldo Base 550k CLP/mes |
| TC-AH-CRUD-008 | Revalidacion tabla rate templates | FAIL | BUG-007: tabla no actualiza sin F5 |
| TC-AH-CRUD-009 | Invitar Jefe de Area (prueba10) | PASS | Email encontrado, invitacion enviada, estado Pendiente |
| TC-AH-CRUD-010 | Limite personal 52/50 | FAIL | BUG-008: excede limite configurado |

### Fase 2c: Rotativas E2E (TC-ROT)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-ROT-001 | Lista de rotativas | PASS | 1 rotativa "Cuarto turno", 4 grupos, 20 miembros, 320 turnos |
| TC-ROT-002 | Detalle de rotativa | PASS | Patron, horarios, 4 grupos con miembros, acciones |
| TC-ROT-003 | Formulario crear rotativa | PASS | Dialog con nombre, area, patron, horarios, grupos |
| TC-ROT-004 | Input time en formulario | NOTA | Input type="time" dificil de automatizar con browser MCP |

## Fase 3: CHIEF_AREA (TC-CA)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-CA-001 | Dashboard CHIEF_AREA | PASS | Calendario con filtros sector/area |
| TC-CA-002 | Login como CHIEF_AREA | PASS | javer@hospital.infierno.com, redirige a dashboard |
| TC-CA-003 | Gestion de turnos | PASS | 200 turnos, tabs Urgencias/Emergencias, filtros, paginacion |
| TC-CA-004 | Crear turno manual | PASS | Tipo Manana, Urgencias, Prueba 1, 6 marzo, verificacion conflictos |
| TC-CA-005 | Validacion turno en pasado | PASS | Toast "No se pueden programar turnos en el pasado" |
| TC-CA-006 | Acceso a admin-hr | PASS | Redirige a dashboard |
| TC-CA-007 | Bandeja de entrada | PASS | 2 notificaciones, filtros por tipo, marcar leidas |
| TC-CA-009 | Acceso a rates | PASS | Redirige a dashboard |

## Fase 4: STAFF (TC-ST)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-ST-001 | Dashboard STAFF calendario | PASS | Calendario mensual con turnos |
| TC-ST-005 | Proximos turnos | PASS | Fechas relativas (Manana, lunes X) |

## Fase 5: UI/UX (TC-UX)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-UX-001 | Dashboard responsive desktop | PASS | Sidebar fija, contenido al lado |
| TC-UX-004 | Textos traducidos | FAIL | BUG-003: clave i18n expuesta |
| TC-UX-007 | Loading en formularios | PASS | "Iniciando sesion..." visible |
| TC-UX-012 | /dashboard/analytics | N/A | Ruta no existe en sidebar |
| TC-UX-013 | /dashboard/payments | N/A | Ruta no existe, "Pagos"/"Nomina" es la funcional |
| TC-UX-014 | /dashboard/requests | PASS | Existe en sidebar STAFF/CHIEF |
| TC-UX-015 | /dashboard/settings | N/A | Ruta no existe |

### Fase 5b: Perfil UX Deep Dive (TC-PROF)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-PROF-001 | Orden secciones perfil | FAIL | UX-006: documento al final, deberia estar arriba |
| TC-PROF-002 | Calendario fecha nacimiento - selector ano | FAIL | UX-007: solo flechas mes a mes, 396 clicks para 1993 |
| TC-PROF-003 | Input telefono - acepta letras | FAIL | UX-008: "abcdef123" aceptado sin restriccion |
| TC-PROF-004 | Placeholder telefono formato pais | FAIL | UX-009: muestra formato US "+1 555 123 4567" para usuario chileno |
| TC-PROF-005 | Input telefono maxLength | FAIL | UX-010: sin limite de caracteres |
| TC-PROF-006 | Documento/RUT - formato y maxLength | PASS | Tiene formatTaxId, maxLength por pais, validacion Zod |
| TC-PROF-007 | Mascaras moneda en rates | PASS | getCurrencyMask con separadores correctos por pais |

---

## Fase 2b: SUPER_ADMIN CRUD (TC-SA)

| ID | Test | Resultado | Notas |
|----|------|-----------|-------|
| TC-SA-001 | Dashboard SUPER_ADMIN metricas | PASS | 3 orgs, 66.7% activas, $28,600 ingresos, 54 usuarios, 1 pago proximo |
| TC-SA-002 | Tabla organizaciones con filtros | PASS | 4 orgs, filtros busqueda/estado/plan/pais. FAIL i18n: botones acciones (BUG-011) |
| TC-SA-003 | Crear organizacion nueva | PASS | "Clinica QA Test E2E" creada OK. FAIL i18n: label direccion (BUG-011) |
| TC-SA-004 | Editar organizacion (nombre + limites) | PASS | Nombre y limite staff actualizados, toast exito |
| TC-SA-005 | Suspender organizacion | PASS | AlertDialog → status SUSPENDED en BD. Sin campo razon |
| TC-SA-006 | Reactivar organizacion suspendida | PASS | AlertDialog → status ACTIVE en BD |
| TC-SA-007 | Eliminar organizacion (soft delete) | PASS | Razon obligatoria (min 10 chars), status INACTIVE en BD |
| TC-SA-008 | Bajar limites por debajo uso actual | PASS | Error server-side: "No puedes reducir el limite de Staff a 40 porque ya tienes 52" |
| TC-SA-009 | i18n modulo SUPER_ADMIN | FAIL | BUG-011: multiples claves sin traducir en tabla, forms y dialogs |

## Resumen por Fase

| Fase | Total | Pass | Fail | N/A | Nota |
|------|-------|------|------|-----|------|
| Auth | 7 | 4 | 3 | 0 | 0 |
| SUPER_ADMIN CRUD | 9 | 8 | 1 | 0 | 0 |
| Admin HR (navegacion) | 12 | 12 | 0 | 0 | 0 |
| Admin HR CRUD E2E | 10 | 7 | 3 | 0 | 0 |
| Rotativas E2E | 4 | 3 | 0 | 0 | 1 |
| Chief Area E2E | 8 | 8 | 0 | 0 | 0 |
| Staff | 2 | 2 | 0 | 0 | 0 |
| UI/UX | 7 | 3 | 1 | 3 | 0 |
| Perfil UX | 7 | 2 | 5 | 0 | 0 |
| **Total** | **66** | **49** | **13** | **3** | **1** |
