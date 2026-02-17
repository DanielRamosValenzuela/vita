# Feature Specification: UI para Gestión del Calendario Organizacional

**Feature Branch**: `001-org-calendar-ui`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "UI para gestión del calendario organizacional (marcar feriados, días especiales). Debe permitir a ADMIN_HR definir qué fechas son feriados o días especiales por organización para que el cálculo de tarifas las considere."

## Clarifications

### Session 2026-02-16

- Q: ¿Dónde vive el calendario en la navegación del dashboard? → A: Nueva ruta `/dashboard/calendar` con entrada propia en el sidebar de ADMIN_HR.
- Q: ¿Qué patrón de interacción usa el formulario de crear/editar día especial? → A: Sheet (drawer lateral), manteniendo el calendario visible parcialmente al fondo para contexto.
- Q: ¿Qué países soporta la importación masiva de feriados nacionales? → A: Chile + datos básicos de otros países Latam (Colombia, Perú, Argentina, México).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visualizar y gestionar días especiales en calendario (Priority: P1)

ADMIN_HR accede a la sección de calendario organizacional y ve una vista de calendario mensual donde puede identificar visualmente qué días están marcados como feriados, feriados irrenunciables u otros tipos especiales. Desde esta vista puede seleccionar una fecha para crear, editar o eliminar una entrada de día especial.

**Why this priority**: Sin esta vista base, no existe forma de que ADMIN_HR configure los días que afectan el cálculo de tarifas. Es el núcleo del feature y entrega valor inmediato al desbloquear el multiplicador de calendario en el sistema de pagos.

**Independent Test**: ADMIN_HR puede abrir el calendario, crear un feriado con nombre y multiplicador, verlo reflejado visualmente en el calendario, editarlo y eliminarlo. El día especial persiste al recargar la página.

**Acceptance Scenarios**:

1. **Given** ADMIN_HR está en el dashboard, **When** navega a `/dashboard/calendar` desde el sidebar, **Then** ve un calendario mensual con los días especiales de su organización resaltados visualmente por tipo (colores o íconos distintos según tipo de día).
2. **Given** ADMIN_HR ve el calendario mensual, **When** hace clic en una fecha sin día especial, **Then** se abre un Sheet (drawer lateral) con el formulario para crear un nuevo día especial con campos: nombre, tipo de día (HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM), descripción (opcional) y multiplicador. El calendario permanece visible parcialmente al fondo.
3. **Given** ADMIN_HR completa el formulario en el Sheet con datos válidos, **When** guarda, **Then** el día aparece marcado en el calendario con su tipo correspondiente, el Sheet se cierra y un mensaje de éxito se muestra.
4. **Given** ADMIN_HR ve un día ya marcado como especial, **When** hace clic en él, **Then** se abre el Sheet con los detalles precargados, permitiendo editar sus propiedades o eliminarlo.
5. **Given** ADMIN_HR intenta crear un día especial en una fecha que ya tiene uno, **When** envía el formulario, **Then** el sistema muestra un error indicando que esa fecha ya tiene un día especial asignado.

---

### User Story 2 - Navegar entre meses y ver resumen (Priority: P2)

ADMIN_HR necesita configurar días especiales para todo el año (feriados nacionales, feriados organizacionales, etc.). La vista permite navegación fluida entre meses y ofrece un resumen de cuántos días especiales hay configurados.

**Why this priority**: La navegación temporal es esencial para una experiencia práctica, pero el CRUD básico de P1 ya entrega valor. Este story mejora la usabilidad para configuraciones a lo largo del año.

**Independent Test**: ADMIN_HR puede navegar mes a mes, ver indicadores de días especiales en cada mes, y tiene visibilidad del estado general del calendario.

**Acceptance Scenarios**:

1. **Given** ADMIN_HR ve el calendario del mes actual, **When** usa los controles de navegación, **Then** puede avanzar o retroceder mes a mes y los días especiales del mes seleccionado se cargan correctamente.
2. **Given** ADMIN_HR navega a un mes futuro, **When** el mes se carga, **Then** los días especiales previamente configurados para ese mes aparecen marcados.
3. **Given** ADMIN_HR ve el calendario, **When** observa la interfaz, **Then** ve un resumen o contador de días especiales configurados para el mes activo (ej: "3 feriados, 1 día organizacional").

---

### User Story 3 - Importación masiva de feriados nacionales (Priority: P3)

ADMIN_HR necesita cargar rápidamente los feriados nacionales de Chile (o del país de la organización) sin tener que crearlos uno por uno. El sistema ofrece una lista predefinida de feriados nacionales que se pueden importar en bloque.

**Why this priority**: Reduce significativamente el esfuerzo de configuración inicial, pero no es bloqueante para el cálculo de tarifas (ADMIN_HR puede crear feriados manualmente con P1).

**Independent Test**: ADMIN_HR puede seleccionar un año, ver la lista de feriados nacionales del país de su organización, elegir cuáles importar, y los feriados seleccionados se crean en el calendario organizacional con sus multiplicadores por defecto.

**Acceptance Scenarios**:

1. **Given** ADMIN_HR está en la sección de calendario y su organización es de Chile, Colombia, Perú, Argentina o México, **When** selecciona la opción de importar feriados nacionales, **Then** ve una lista de feriados oficiales del país de su organización para el año seleccionado, con nombre, fecha y tipo (feriado / irrenunciable).
2. **Given** ADMIN_HR ve la lista de feriados nacionales, **When** selecciona varios y confirma la importación, **Then** los feriados seleccionados se crean en el calendario organizacional con multiplicadores por defecto (ej: 1.5x para HOLIDAY, 2.5x para IRRENUNCIABLE).
3. **Given** algunos feriados nacionales ya existen en el calendario, **When** ADMIN_HR intenta importarlos de nuevo, **Then** el sistema indica cuáles ya existen y solo importa los nuevos, sin duplicar.

---

### Edge Cases

- **Multiplicador inválido**: Si ADMIN_HR ingresa un multiplicador de 0, negativo o no numérico, el sistema rechaza la operación con un mensaje de error claro. El multiplicador mínimo permitido es 0.1.
- **Día especial con pagos ya calculados**: Si se elimina un día especial cuya fecha ya fue usada para calcular pagos de turnos, los pagos existentes conservan el multiplicador que tenían al momento del cálculo (inmutabilidad del pago histórico). Solo turnos futuros o recalculados usarían el nuevo valor (1.0x si se eliminó).
- **Cambio de país de la organización**: Los feriados nacionales importados previamente se mantienen intactos. El administrador debe gestionarlos manualmente si el país cambió.
- **Fechas pasadas**: ADMIN_HR puede crear días especiales en fechas pasadas para corregir configuraciones o permitir recálculos de pagos pendientes.
- **Concurrencia**: Si dos ADMIN_HR de la misma organización intentan crear un día especial en la misma fecha simultáneamente, la restricción de unicidad (organización + fecha) previene duplicados; el segundo en guardar recibe un error de conflicto con mensaje amigable.
- **Año sin feriados cargados**: Al intentar importar feriados para un año no soportado, el sistema informa que no hay datos disponibles para ese año.
- **País no soportado**: Organizaciones de países sin datos de feriados embebidos ven el botón de importación deshabilitado con un mensaje informando que la funcionalidad estará disponible próximamente. El CRUD manual (P1) sigue funcionando normalmente.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un calendario mensual visual con los días especiales de la organización del usuario logueado, diferenciados visualmente por tipo de día.
- **FR-002**: El sistema MUST permitir a ADMIN_HR crear un día especial proporcionando: fecha, tipo de día (HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM), nombre, descripción (opcional) y multiplicador numérico.
- **FR-003**: El sistema MUST validar que no exista otro día especial para la misma fecha y organización antes de crear uno nuevo.
- **FR-004**: El sistema MUST permitir a ADMIN_HR editar las propiedades de un día especial existente (tipo, nombre, descripción, multiplicador).
- **FR-005**: El sistema MUST permitir a ADMIN_HR eliminar un día especial existente, requiriendo confirmación explícita antes de proceder.
- **FR-006**: El sistema MUST filtrar todos los datos del calendario por la organización del usuario autenticado (aislamiento multi-tenant).
- **FR-007**: El sistema MUST permitir navegación entre meses para ver y gestionar días especiales de cualquier mes y año.
- **FR-008**: El sistema MUST mostrar un resumen del mes activo indicando cantidad de días especiales por tipo.
- **FR-009**: El sistema MUST ofrecer una funcionalidad de importación masiva de feriados nacionales para Chile, Colombia, Perú, Argentina y México, permitiendo seleccionar cuáles importar. Organizaciones de países no soportados ven la opción deshabilitada con mensaje indicando disponibilidad futura.
- **FR-010**: El sistema MUST asignar multiplicadores por defecto al importar feriados nacionales: 1.5x para HOLIDAY y 2.5x para IRRENUNCIABLE. Estos valores son editables individualmente después de la importación.
- **FR-011**: El sistema MUST validar que el multiplicador sea un número positivo mayor o igual a 0.1.
- **FR-012**: El sistema MUST permitir crear días especiales en fechas pasadas o futuras sin restricción temporal.
- **FR-013**: Solo usuarios con rol ADMIN_HR MUST tener acceso a la gestión del calendario organizacional. Otros roles no ven esta sección.

### Key Entities

- **OrganizationCalendar**: Representa un día especial dentro del calendario de una organización. Atributos clave: fecha, tipo de día (DayType), nombre, descripción, multiplicador, flag de recurrencia, organización asociada. Restricción de unicidad: una sola entrada por combinación de organización y fecha.
- **DayType**: Clasificación del tipo de día: NORMAL, WEEKEND, SATURDAY, SUNDAY, HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM. Para esta feature, los tipos relevantes de gestión manual son HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY y CUSTOM.
- **Organization**: Entidad padre que posee el calendario. Define el país, lo cual determina qué feriados nacionales están disponibles para importación.

### Assumptions

- Los feriados nacionales son datasets estáticos embebidos en la aplicación para 5 países: Chile (~18 feriados), Colombia, Perú, Argentina y México. No se requiere consultar un servicio externo.
- Los multiplicadores por defecto para importación masiva son: HOLIDAY = 1.5x, IRRENUNCIABLE = 2.5x. Estos son valores razonables para Chile basados en el Código del Trabajo.
- El campo `isRecurring` del modelo existe pero la funcionalidad de recurrencia (ej: "todos los domingos") queda fuera del alcance de este feature.
- La vista del calendario es accesible solo desde el dashboard de ADMIN_HR.
- El calendario NO reemplaza la detección automática de fin de semana. Sábados y domingos se detectan por fecha en el motor de cálculo; solo necesitan entrada de calendario si tienen un multiplicador especial adicional.
- Los datos de feriados incluirán al menos los años 2025, 2026 y 2027 para cubrir necesidades inmediatas.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: ADMIN_HR puede crear un día especial en el calendario en menos de 30 segundos (seleccionar fecha, llenar formulario, guardar).
- **SC-002**: ADMIN_HR puede importar todos los feriados nacionales de un año en menos de 1 minuto (abrir importador, seleccionar año, confirmar).
- **SC-003**: El 100% de las operaciones del calendario respetan aislamiento multi-tenant: ningún día de otra organización es visible, editable o eliminable.
- **SC-004**: El calendario muestra correctamente los días especiales al navegar entre meses sin retrasos perceptibles para el usuario.
- **SC-005**: Los multiplicadores configurados en el calendario son utilizables por el motor de cálculo de pagos: el campo `calendarMultiplier` en los pagos de turno refleja el valor del día especial correspondiente a la fecha del turno.
