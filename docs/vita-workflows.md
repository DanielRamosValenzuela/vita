# Workflows VITA

Documento de referencia de **flujos funcionales** por rol. Resume qué pasos sigue cada usuario en la app hoy y qué workflows faltan por implementar.

## SUPER_ADMIN

### Workflows implementados

- **Crear organización**
  - Inicia sesión como SUPER_ADMIN.
  - Navega a `/dashboard/organizations`.
  - Hace clic en **Nueva Organización**.
  - Completa nombre, país, RUT/Tax ID, plan y límites (`maxAdminHR`, `maxChiefs`, `maxStaff`).
  - Guarda; la organización queda activa con sus límites iniciales.

- **Editar organización**
  - Desde la tabla de organizaciones, abre **Ver / Editar**.
  - Modifica datos de contacto, dirección, plan y límites.
  - Guarda; se validan límites vs usuarios actuales (no se permite bajar por debajo del uso actual).

- **Suspender / reactivar / eliminar organización**
  - Desde la tabla, abre las acciones críticas (AlertDialog).
  - Elige **Suspender**, **Reactivar** o **Eliminar**.
  - Ingresa la razón (para acciones destructivas).
  - Confirma; la acción se refleja en el estado de la organización.

### Workflows pendientes

- **Gestión de pagos**
  - Registrar pagos manuales, ver historial, marcar morosidad.
- **Notificaciones a organizaciones**
  - Aviso de suspensión inminente, recordatorios de pago.

---

## ADMIN_HR (Recursos Humanos)

### Workflows implementados

- **Configurar “Mi Organización”**
  - Accede a `/dashboard/admin-hr/organization`.
  - Revisa tarjetas de uso de cuentas (Admin HR, Jefes, Staff).
  - Ve Jefes y Staff existentes e invitaciones pendientes.

- **Invitar Jefe de Área o Personal de Salud**
  - Desde “Mi Organización”, en la sección correspondiente (Jefes de Área o Personal de Salud):
  - Abre el diálogo **Invitar**.
  - Busca usuario por email o documento (`searchUserAction`).
  - Si existe y hay cupo según límites, envía invitación con rol `CHIEF_AREA` o `STAFF_HEALTH`.
  - La invitación aparece en la tabla de invitaciones; puede cancelarse.

- **Gestionar Áreas**
  - Accede a `/dashboard/areas`.
  - **Crear área**:
    - Clic en **Nueva Área**.
    - Define nombre, descripción, icono, color.
    - Guarda (se crea inactiva por defecto).
  - **Editar área**:
    - Abre el icono de **Ver / Editar**.
    - Asigna tipos de turno (globales o específicos) a través de `SearchableAddableList`.
    - Configura límites de trabajo (max horas seguidas, min horas de descanso).
    - Asigna jefes de área (lista buscable por nombre, email o documento).
    - Activa el área solo si tiene al menos un tipo de turno activo.
  - **Eliminar área**:
    - Usa el botón de eliminar en la tabla, confirma en el AlertDialog.

- **Gestionar Tipos de Turno**
  - Accede a `/dashboard/shift-types`.
  - Crea/edita tipos con duración, clasificación (día/noche/mixto), colores y límites de staff.
  - Marca si son **globales** o específicos por área.
  - Visualiza cuántas áreas usan cada tipo.

- **Tarifas y Contratos**
  - Accede a `/dashboard/rates`.
  - Gestiona **plantillas de tarifa** (RateTemplate).
  - Asigna **contratos** a personas (monto base, unidad, ajustes).
  - Cada contrato puede estar asociado a un área concreta.

- **Gestión de Personal (/dashboard/staff)**
  - Ve toda la plantilla de la organización (jefes + staff).
  - Ve área(s), contratos y tarifas efectivas.
  - Para CHIEF_AREA, la misma página muestra solo personal con contrato en sus áreas.

### Workflows pendientes o parciales

- **Dashboard con métricas ADMIN_HR**
  - Resumen de horas trabajadas, staff por área, alertas de límites de cuentas.
- **Gestión avanzada de personal**
  - UI para cambiar área principal de un staff y reasignaciones masivas.
- **Reportes exportables**
  - Exportar a Excel/PDF resumen de personal, contratos y áreas.

---

## CHIEF_AREA (Jefes de Área)

### Workflows implementados

- **Ver áreas asignadas**
  - Accede a `/dashboard/areas`.
  - Ve solo las áreas donde está asignado vía `UserArea`.
  - Si no tiene áreas, se muestra mensaje de ayuda.

- **Ver personal de sus áreas**
  - Accede a `/dashboard/staff`.
  - Ve únicamente contratos y personal asociados a sus áreas (según `UserArea` + `Contract.areaId`).

- **Crear y gestionar turnos en sus áreas**
  - Desde `/dashboard/shifts`, filtra por sus áreas.
  - Crea/edita turnos usando tipos globales o asignados a sus áreas.

- **Asignación de jefes a áreas (vista ADMIN_HR)**
  - ADMIN_HR asigna jefes a cada área; luego el CHIEF ve esa área y su personal.

### Workflows pendientes o parciales

- **Vinculación directa de staff por CHIEF**
  - Flujo donde CHIEF vincula staff mediante código de vinculación.
- **Aprobación de intercambios de turno**
  - Flujos de aprobación / rechazo de solicitudes de intercambio.
- **Gestión de asistencia**
  - Marcar asistencia manual, gestionar ausencias y reemplazos.

---

## STAFF_HEALTH (Personal de Salud)

### Workflows implementados (backend/UI parcial)

- **Vinculación a organizaciones**
  - Al registrarse obtiene un código de vinculación.
  - ADMIN_HR/CHIEF pueden invitarlo y se muestra en perfil/organizations.

- **Vista de turnos (MVP inicial)**
  - Desde `/dashboard/shifts` ve los turnos asignados (una organización).

### Workflows pendientes

- **Calendario unificado multi-organización**
  - Ver todos los turnos de todas las organizaciones donde trabaja.
- **Postulaciones a turnos abiertos**
  - Listado de turnos abiertos por área, postulación y estado.
- **Intercambios de turnos**
  - Solicitar intercambio, ver estado, aceptar/rechazar.
- **Notificaciones**
  - Recordatorios de turnos, avisos de cambios o cancelaciones.

---

## Workflows transversales

### Invitaciones y vinculación

- ADMIN_HR invita jefes y staff desde “Mi Organización”.
- SUPER_ADMIN invita ADMIN_HR desde panel global.
- Usuarios aceptan invitaciones desde su perfil.

**Pendiente:** flujo completo de aceptación/rechazo con auditoría y límites estrictos por plan.

### Gestión de áreas y tipos de turno

- ADMIN_HR define áreas y tipos de turno globales.
- CHIEF_AREA combina tipos globales + específicos de su área.
- Los turnos usan solo tipos activos y compatibles con el área.

**Pendiente:** reglas avanzadas de validación legal (descansos, máximos semanales) en la UI.

---

## Próximos Workflows a Diseñar

1. **Gestión de Pagos y Facturación**
   - Panel SUPER_ADMIN con organizaciones, montos, estados de pago.
   - Automatizar cálculo de facturación según uso de cuentas (Admin HR / Jefes / Staff).

2. **Sistema de Notificaciones**
   - Envío de emails o in-app para cambios de turno, nuevas invitaciones, recordatorios.

3. **App móvil / PWA para Staff**
   - Calendario móvil, notificaciones push, flujo de postulación/intercambio sencillo.

4. **Reportes de Cumplimiento Legal**
   - Reportes de horas trabajadas vs límites legales por país.

