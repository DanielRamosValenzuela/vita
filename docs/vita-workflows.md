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
  - Si existe y hay cupo según límites, envía invitación con rol `CHIEF_AREA` o `STAFF`.
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

- **Dashboard ADMIN_HR con métricas reales**
  - Accede a `/dashboard/admin-hr`.
  - Visualiza métricas en tiempo real:
    - Total de áreas
    - Tipos de turno activos
    - Total de personal (jefes + staff)
    - Contratos activos
    - Turnos activos del mes
  - Ve límites de organización (Admin HR, Jefes, Staff) con alertas visuales.

- **Rotativas de Turno** (`/dashboard/rotations`)
  - Crea rotativas con patrón cíclico (2-8 pasos) y grupos (2-6).
  - Asigna miembros del personal a grupos de rotativa.
  - Genera turnos masivos a partir del patrón para un rango de fechas.
  - Monitorea cobertura y recibe alertas de insuficiencia.
  - Asigna turnos extra a candidatos elegibles (sistema de tiers).
  - Ver detalle completo en sección **Rotativas de Turno** más abajo.

### Workflows pendientes o parciales

- **Métricas avanzadas de turnos**
  - Resumen de horas trabajadas, distribución de staff por área.
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

- **Gestionar rotativas de turno en sus áreas**
  - Desde `/dashboard/rotations`, gestiona rotativas solo de áreas asignadas.
  - Misma funcionalidad que ADMIN_HR: crear rotativas, asignar grupos, generar turnos, monitorear cobertura y asignar extras.

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

## STAFF (Personal de Salud)

### Workflows implementados

- **Vinculación a organizaciones**
  - Al registrarse obtiene un código de vinculación.
  - ADMIN_HR/CHIEF pueden invitarlo y se muestra en perfil/organizations.

- **Calendario personal de turnos** (`/dashboard`)
  - Calendario mensual interactivo con todos los turnos asignados del mes.
  - Navegación entre meses con carga automática.
  - Diferenciación visual por tipo de turno (color), estado, rotativas y extras.
  - Badge con nombre de la organización actual en el header.
  - Estado vacío informativo cuando no hay turnos en el mes.

- **Detalle de turno + personal activo del sector**
  - Click en turno abre panel lateral con detalle completo.
  - Lista de personal activo del mismo sector, agrupado por área.
  - Detección automática de relevos (gap <30min entre turnos consecutivos).

- **Próximos turnos (7 días)**
  - Panel lateral con los turnos de los próximos 7 días.
  - Fechas relativas (Hoy, Mañana, nombre del día).
  - Click para acceder al detalle del turno.

- **Notas personales en el calendario**
  - Click en un día del calendario abre un popover inline.
  - Textarea para escribir una nota personal (máx. 500 caracteres).
  - Una nota por día, editable y eliminable.
  - Indicador visual (punto azul) en días con nota.
  - Las notas son personales del usuario (no vinculadas a organización).

- **Exportación iCal y feeds de suscripción**
  - Descarga de archivo `.ics` del mes actual.
  - Feed iCal por organización (token único, suscripción en Google/Apple Calendar).
  - Feed iCal unificado (todas las organizaciones del usuario).
  - Gestión de tokens: crear, revocar, copiar URL.

### Workflows pendientes

- **Importación de Google Calendar (P5 — diferible)**
  - Conectar Google Calendar via OAuth 2.0.
  - Importar eventos personales al calendario.
  - Detección de conflictos con turnos.
- **Calendario unificado multi-organización**
  - Ver todos los turnos de todas las organizaciones donde trabaja.
- **Postulaciones a turnos abiertos**
  - Listado de turnos abiertos por área, postulación y estado.
- **Intercambios de turnos**
  - Solicitar intercambio, ver estado, aceptar/rechazar.

---

## Sistema de Tarifas Flexibles ✅ (v2.0)

### Arquitectura del Sistema

El sistema de tarifas flexibles permite a ADMIN_HR crear tarifas completamente personalizables mediante componentes modulares, adaptándose a cualquier industria (salud, seguridad, construcción, etc.).

### Workflows implementados

#### 1. **Creación de Plantilla de Tarifa** (`/dashboard/rates`)

**Flujo**:

1. ADMIN_HR accede al módulo de Tarifas
2. Selecciona un preset predefinido (opcional):
   - Guardia Salud Estándar
   - Seguridad 24/7
   - Freelance por Hora
   - Personal Administrativo
   - Operario de Construcción
   - Y 5 presets más
3. O crea una plantilla desde cero
4. Define nombre y descripción
5. Añade componentes de tarifa:
   - **Tipo**: BASE_SALARY, PER_MINUTE, NIGHT_SHIFT_BONUS, WEEKEND_MULTIPLIER, etc. (18 tipos + CUSTOM)
   - **Valor**: monto numérico (con formateo automático según moneda)
   - **Unidad**: MONTHLY, PER_HOUR, PER_SHIFT, PERCENTAGE, etc.
   - **Condición**: ALWAYS, NIGHT_SHIFT_ONLY, WEEKEND_ONLY, etc.
6. Puede añadir, editar o eliminar componentes
7. Guarda la plantilla

**Características**:

- ✅ Formateo de moneda dinámico (Chile: $1.000.000, USA: $1,000,000)
- ✅ Validación de duplicados (no permite dos componentes base salary)
- ✅ Previsualización de componentes añadidos
- ✅ Duplicación de plantillas existentes

#### 2. **Asignación de Contrato a Personal** (`/dashboard/rates`)

**Flujo**:

1. ADMIN_HR desde el módulo de Tarifas ve la tabla de **Plantillas de Tarifa** y la tabla de **Personal con Contratos**.
2. En cada persona:
   - Si **no tiene contrato activo**, puede asignar la primera tarifa con el botón **“Asignar tarifa”**.
   - Si **ya tiene uno o más contratos activos**:
     - Ve la tarifa principal (primer contrato activo mostrado en la tabla).
     - Si hay más de una, aparece un enlace **“Ver tarifas (N)”** que abre un modal con todas las tarifas activas de esa persona y sus acciones (editar / finalizar).
     - Al hacer clic en **“Agregar otra tarifa”** aparece primero un **modal de advertencia** indicando que múltiples contratos activos por persona son una práctica poco común; solo si confirma se abre el selector de tarifa en modo “agregar”.
3. En el modal de asignación:
   - Selecciona una plantilla de tarifa (con buscador por nombre).
   - Selecciona área (opcional; por defecto se sugiere el área principal si existe).
   - (Opcional) Define multiplicador personalizado o notas, cuando esa parte esté disponible en UI.
4. Confirma; se crea un nuevo `Contract` asociado al usuario, la plantilla seleccionada y, si corresponde, al área.

**Reglas y características**:

- ✅ Una **Plantilla de Tarifa** (`RateTemplate`) puede reutilizarse en **muchas personas distintas** al mismo tiempo.
- ✅ Cada persona puede tener **más de un contrato activo** siempre que sean **tarifas distintas** (múltiples `Contract` activos por `userId` con distintos `rateTemplateId`).
- ✅ El sistema **no permite** crear dos contratos activos con **la misma plantilla de tarifa para la misma persona**  
  (validación en `createContractAction`: mismo `userId` + mismo `rateTemplateId` + `isActive = true` + `endDate = null` → se bloquea).
- ✅ El botón **“Finalizar contrato”** marca el contrato como inactivo (setea `endDate` y `isActive = false`), conservando el historial para cálculos y auditoría.
- ✅ Ya **no existe** acción de “Eliminar contrato” en la UI; los contratos se finalizan pero no se borran desde el módulo de RRHH.
- ✅ En la tabla de plantillas de tarifa, la columna **“Contratos”** muestra solo la cantidad de **contratos activos** asociados a esa plantilla (no cuenta históricos).

#### 3. **Visualización de Personal** (`/dashboard/staff`)

**Flujo**:

1. ADMIN_HR o CHIEF accede al módulo de Personal.
2. Ve tabla simplificada con:
   - Nombre y correo.
   - Rol (CHIEF_AREA / STAFF).
   - Área asignada (según contrato o área principal).
   - Estado de contrato (✓/✗) calculado en base a si el usuario tiene al menos un `Contract` activo.
   - Nombre de la **tarifa principal** (primer contrato activo mostrado).
   - Multiplicador personalizado de ese contrato (si existe).
3. Si hay personal sin contrato, se muestra una alerta específica con el conteo y un enlace para asignar tarifas.
4. Hay un enlace directo al módulo de Tarifas para gestionar contratos.

**Características**:

- ✅ Solo visualización (no edita contratos aquí).
- ✅ Separación clara de responsabilidades (asignación y edición de contratos ocurre en `/dashboard/rates`).
- ✅ Estadísticas de personal con y sin contrato basadas en el arreglo completo de contratos (`contracts.length > 0`).

#### 4. **Gestión de Componentes de Tarifa**

**Tipos de Componentes Disponibles**:

- Salarios base (mensual, quincenal, etc.)
- Tarifas por tiempo (minuto, hora, turno)
- Bonos específicos (nocturno, fin de semana, feriado)
- Multiplicadores (horas extra, antigüedad)
- Bonos fijos y porcentajes
- Compensaciones por disponibilidad y guardia

**Condiciones de Aplicación**:

- Siempre
- Solo en horario diurno/nocturno
- Solo fin de semana
- Solo feriados
- Solo en guardia
- Y más...

### Workflows pendientes

- **Cálculo automático de pagos**
  - Calcular pago de un turno basado en sus componentes y condiciones
  - Aplicar multiplicadores de calendario (feriados irrenunciables)
  - Generar preview de costo antes de crear turno

- **Gestión del Calendario Organizacional** ✅
  - ✅ UI para marcar días especiales (Sheet lateral con formulario)
  - ✅ CRUD completo con eliminación via AlertDialog
  - ✅ Multiplicadores por tipo de día
  - ✅ Navegación entre meses con carga dinámica de datos
  - ✅ Resumen mensual con badges por tipo de día
  - ✅ Importación masiva de feriados nacionales (via BFF/Boostr API)
  - ⏳ Días recurrentes (ej: todos los domingos) - pendiente
  - ⏳ Auto-importación de feriados al crear organización - pendiente

- **Reportes y Analytics**
  - Vista de costos por personal
  - Reporte de contratos activos
  - Análisis de componentes más usados
  - Exportación a Excel/PDF

---

## Rotativas de Turno ✅ (v4.1)

### Concepto

Las rotativas automatizan la creación de turnos cíclicos. En vez de crear turnos manualmente uno por uno, ADMIN_HR o CHIEF_AREA define un **patrón** (ej: Largo → Noche → Libre) y **grupos** de personal que rotan por ese patrón con desfases (offsets). El sistema genera cientos de turnos automáticamente para el rango de fechas deseado.

### Arquitectura del Sistema

- **Rotativa (Rotation):** Contenedor con nombre, área, estado (DRAFT/ACTIVE/INACTIVE) y fecha de inicio.
- **Pasos (RotationStep):** Patrón cíclico de 2-8 pasos. Cada paso es un tipo de turno o día de descanso.
- **Configuración de Turno (RotationShiftConfig):** Hora de inicio para cada tipo de turno dentro de la rotativa.
- **Grupos (RotationGroup):** Sub-equipos (2-6) con nombre, color, icono y offset cíclico (desfase en días).
- **Miembros (RotationMember):** Personal asignado a cada grupo. Soft-delete via `leftAt`.

### Workflows implementados

#### 1. **Crear Rotativa** (`/dashboard/rotations`)

**Flujo:**

1. ADMIN_HR o CHIEF_AREA accede al módulo de Rotativas
2. Hace clic en **Nueva Rotativa**
3. Selecciona un área y define nombre
4. Configura el patrón de pasos (ej: 3 pasos → Largo, Noche, Libre)
5. Configura la hora de inicio para cada tipo de turno usado
6. Define los grupos (mínimo 2, máximo 6) con nombre, color e icono
7. Guarda; la rotativa queda en estado **DRAFT**

**Validaciones:**
- El área debe estar activa
- Los tipos de turno usados deben estar activos y asignados al área
- Mínimo 2 pasos, máximo 8
- Mínimo 2 grupos, máximo 6

#### 2. **Gestionar Grupos y Miembros**

**Flujo:**

1. Desde la vista de detalle de una rotativa, ve los grupos como tarjetas
2. Cada grupo muestra sus miembros actuales con avatar y email
3. Para añadir miembros: clic en **Añadir miembro** → popover con personal disponible
   - Solo aparece personal STAFF del área que **no** está ya en alguna rotativa de la organización
   - Selección múltiple con checkbox
4. Para eliminar miembro: clic en icono de eliminar → confirma con opción de cancelar turnos futuros
5. Si un miembro fue removido previamente y se re-añade, se reactiva (soft undelete)

**Notificaciones:** Al añadir miembros se envía notificación `ROTATION_ASSIGNED`.

#### 3. **Activar Rotativa**

**Flujo:**

1. Desde el detalle, cambia estado de DRAFT a ACTIVE
2. El sistema valida que al menos 2 grupos tengan miembros asignados
3. Una vez activa, el patrón y la configuración se bloquean (solo se pueden editar nombre, descripción y fecha de inicio)

#### 4. **Generar Turnos**

**Flujo:**

1. Desde la vista de detalle de una rotativa ACTIVE, abre **Generar Turnos**
2. Selecciona rango de fechas (inicio y fin)
3. El sistema muestra **preview**:
   - Total de turnos a crear
   - Conteo por grupo
   - Conflictos detectados (superposición con turnos existentes)
4. Opcionalmente marca **Sobrescribir conflictos**
5. Confirma generación → procesamiento con overlay animado
6. Resultado: cantidad creados, omitidos, conflictos, notificaciones enviadas

**Lógica del patrón:**
- Para cada día del rango: `stepIndex = (dayIndex + cycleOffset) % patternLength`
- Cada grupo usa su `cycleOffset` para desfasarse en el patrón
- Si el paso es descanso, no se genera turno
- Se asigna contrato (área-específico o general) a cada turno generado

**Notificaciones:** Se envía `ROTATION_SHIFTS_GENERATED` a todos los miembros afectados.

#### 5. **Regenerar Turnos**

**Flujo:**

1. Desde el detalle, abre **Regenerar Turnos**
2. Selecciona rango de fechas
3. Opción: **Reemplazar existentes** (elimina turnos no modificados manualmente en ese rango)
4. Genera nuevos turnos respetando el mismo patrón

#### 6. **Monitorear Cobertura**

**Flujo:**

1. En la vista de detalle, la sección de **Cobertura** muestra calendario visual
2. Cada día muestra qué grupos trabajan y cuáles descansan
3. Alertas automáticas:
   - **Gap de cobertura:** Todos los grupos descansan el mismo día
   - **Insuficiencia:** Un grupo tiene menos miembros que el mínimo requerido por el tipo de turno
   - **Cobertura por expirar:** Menos de 7 días de turnos generados restantes
4. En la lista de rotativas (`/dashboard/rotations`), se muestran alertas de cobertura al cargar la página

#### 7. **Asignar Turnos Extra**

**Flujo:**

1. Desde la vista de detalle, abre **Turnos Extra** para una fecha y tipo de turno
2. El sistema analiza el historial de turnos (48h) de cada candidato disponible
3. Clasifica candidatos en tiers según el **Motor de Tiers**:
   - **TIER 1** (verde): En turno diurno actual, puede extender a nocturno
   - **TIER 2** (azul): Descansado y disponible
   - **TIER 3** (amarillo): Disponible, viene de turno nocturno
   - **NUNCA RECOMENDAR** (rojo): Post-noche, no asignar turno diurno (violaría descanso legal)
4. Cada candidato muestra advertencias:
   - `max_consecutive_hours`: Excedería máximo de horas seguidas del área
   - `min_rest_hours`: Descanso insuficiente desde último turno
   - `noche_to_largo`: Violación noche→día
   - `came_from_noche`: Viene de turno nocturno
5. Selecciona candidato y asigna turno extra

**Notificaciones:** Se envía `EXTRA_SHIFT_ASSIGNED` al candidato asignado.

#### 8. **Eliminar Rotativa**

**Flujo:**

1. Desde la lista o el detalle, elige eliminar
2. Dos opciones:
   - **Desvincular turnos:** Los turnos generados permanecen pero se desvinculan de la rotativa
   - **Eliminar turnos:** Se eliminan también todos los turnos generados por esta rotativa

### Workflows pendientes

- **Edición de patrón en rotativa activa**
  - Actualmente se bloquea al activar; posible flujo futuro con migración de turnos existentes.
- **Rotativas recurrentes automáticas**
  - Generación automática al acercarse el fin de cobertura (sin intervención manual).
- **Vista híbrida en calendario de turnos**
  - Agrupar turnos de rotativa en bloques compactos en `/dashboard/shifts`.

---

## Todos los Usuarios (Perfil Avanzado)

### Workflows implementados

#### 1. **Gestión de Perfil Personal** (`/dashboard/profile`)

**Flujo de Actualización de Documento**:

1. Usuario accede a su perfil
2. Edita país, tipo de documento o número de documento
3. El sistema valida:
   - Si el usuario pertenece a una organización, el documento debe ser único dentro de esa organización
   - Si el documento ya existe en la organización, muestra error
4. Al guardar exitosamente:
   - Se registra el documento anterior en `UserDocumentHistory`
   - Se actualiza el documento actual
   - Se registra el nuevo documento en el historial

**Características**:

- ✅ Validación única por organización (permite duplicados entre organizaciones diferentes)
- ✅ Historial completo de cambios con auditoría
- ✅ Validación también aplica en invitaciones (ADMIN_HR/SUPER_ADMIN no pueden invitar usuarios con documento duplicado)

#### 2. **Sistema de Múltiples Emails** (`/dashboard/profile`)

**Flujo de Gestión de Emails**:

1. Usuario ve todos sus emails registrados
2. **Agregar nuevo email**:
   - Ingresa email en formulario
   - Valida formato y unicidad global
   - Se añade como email secundario (no verificado)
3. **Marcar como principal**:
   - Solo emails verificados pueden ser principales
   - Al marcar como principal, se actualiza `User.email`
   - Solo puede haber un email principal
4. **Eliminar email**:
   - No se puede eliminar el email principal
   - Confirma eliminación vía AlertDialog
   - El email se elimina de `UserEmail`

**Características**:

- ✅ Email principal sincronizado con `User.email`
- ✅ Soporte para múltiples proveedores (GOOGLE, CREDENTIALS, etc.)
- ✅ Preparado para vinculación OAuth (permitirá link de cuenta Google a cuenta existente)
- ✅ Validación de unicidad global de emails

#### 3. **Sistema de Imágenes Personalizadas** (`/dashboard/profile`)

**Flujo de Upload de Avatar**:

1. Usuario ve su avatar actual (custom, OAuth o iniciales)
2. **Subir nueva imagen**:
   - Selecciona archivo (JPG, PNG, WEBP)
   - Preview en tiempo real
   - Valida tamaño (máx 2MB)
   - Sube a Supabase Storage (`avatars/{userId}`)
   - Actualiza `User.customImage` con URL pública
   - Actualiza `User.imageProvider` = `UPLOAD`
3. **Eliminar imagen custom**:
   - Solo si tiene imagen personalizada
   - Elimina de Supabase Storage
   - Limpia `User.customImage`
   - Fallback automático a imagen OAuth o iniciales

**Características**:

- ✅ Integración completa con Supabase Storage
- ✅ RLS policies para seguridad (solo el usuario puede modificar su avatar)
- ✅ Prioridad de visualización: Custom > OAuth > Iniciales
- ✅ Sincronización automática con sesión NextAuth
- ✅ Preview antes de subir
- ✅ Límites de tamaño y formato

### Workflows pendientes

- **Verificación de emails secundarios**
  - Envío de email de confirmación
  - Link de verificación
  - Marcar email como verificado
- **Vinculación OAuth completa**
  - Link de cuenta Google a cuenta existente sin perder datos
  - Desvinculación de proveedores OAuth

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

### Sistema de Notificaciones (Bandeja de Entrada)

Implementado para ADMIN_HR, CHIEF_AREA y STAFF. SUPER_ADMIN no recibe notificaciones en esta iteración.

**Funcionalidades implementadas:**
- Bandeja de Entrada (`/dashboard/inbox`) accesible desde el sidebar con badge de no leídas.
- Notificaciones generadas automáticamente por: invitaciones (INVITATION_PENDING), asignación a áreas (AREA_ASSIGNED), creación de turnos (SHIFT_CREATED), actualización de turnos (SHIFT_UPDATED), cancelación de turnos (SHIFT_CANCELLED), asignación a rotativa (ROTATION_ASSIGNED), generación de turnos de rotativa (ROTATION_SHIFTS_GENERATED), asignación de turno extra (EXTRA_SHIFT_ASSIGNED).
- Cada notificación muestra: icono por tipo, título pre-renderizado con nombre del actor, descripción opcional, nombre de la organización, avatar del actor, fecha relativa con tooltip de fecha absoluta.
- Click en notificación: marca como leída y navega al recurso (perfil para invitaciones, turnos, áreas).
- "Marcar todas como leídas" en la bandeja.
- Filtros por estado (todas/no leídas/leídas) y por tipo (invitaciones/turnos/áreas/general).
- Eliminar notificación individual con confirmación AlertDialog.
- Toasts diferenciados por tipo al cargar el dashboard (info, success, warning según tipo de notificación).
- Paginación cursor-based (20 por página, "Cargar más").

**Pendiente:**
- Notificaciones para SUPER_ADMIN.
- Actualizaciones en tiempo real (WebSocket/SSE).
- Notificaciones por email.
- Notificaciones para solicitudes de cambio de turno entre staff.

---

## Próximos Workflows a Diseñar

1. **Gestión de Pagos y Facturación**
   - Panel SUPER_ADMIN con organizaciones, montos, estados de pago.
   - Automatizar cálculo de facturación según uso de cuentas (Admin HR / Jefes / Staff).

2. **App móvil / PWA para Staff**
   - Calendario móvil, notificaciones push, flujo de postulación/intercambio sencillo.

3. **Reportes de Cumplimiento Legal**
   - Reportes de horas trabajadas vs límites legales por país.
