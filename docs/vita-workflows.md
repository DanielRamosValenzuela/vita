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

- **Dashboard ADMIN_HR con métricas reales**
  - Accede a `/dashboard/admin-hr`.
  - Visualiza métricas en tiempo real:
    - Total de áreas
    - Tipos de turno activos
    - Total de personal (jefes + staff)
    - Contratos activos
    - Turnos activos del mes
  - Ve límites de organización (Admin HR, Jefes, Staff) con alertas visuales.

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
   - Rol (CHIEF_AREA / STAFF_HEALTH).
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
