# Feature Specification: Sectores (Agrupación de Áreas)

**Feature Branch**: `001-area-sectors`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Necesito generar un feature de agrupación cross-area. Actualmente cada área tiene su rotativa y personal independiente. Pero en la realidad, múltiples áreas trabajan juntas en el mismo lugar físico (ej: USI tiene enfermeras, doctores, técnicos, kinesiólogos — cada uno con su propia área y rotativa). Se necesita un concepto de 'Sector' que agrupe estas áreas para que el personal pueda ver quién está de turno en todo el sector durante un rango horario, independiente del área."

## Análisis de Nomenclatura

Tras analizar el dominio hospitalario chileno y la arquitectura actual de VITA, se recomienda el concepto **"Sector"** por las siguientes razones:

| Alternativa    | Pros                                | Contras                                            |
| -------------- | ----------------------------------- | -------------------------------------------------- |
| Cross-Area     | Describe el mecanismo               | Técnico, no intuitivo para usuarios finales         |
| Unidad / Unit  | Muy usado en hospitales             | Conflicto semántico con "unidad" de otras cosas     |
| **Sector**     | Intuitivo, genérico, sin conflictos | Ninguno significativo                               |
| Departamento   | Formal                              | Demasiado jerárquico, implica estructura admin       |

**Decisión**: **Sector** — Es un concepto ligero que representa un espacio físico o lógico donde convergen múltiples áreas funcionales. En el contexto hospitalario chileno, "sector" se usa naturalmente para referirse a zonas como USI, Urgencias, Pabellón, etc.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear y gestionar Sectores (Priority: P1)

Un ADMIN_HR necesita crear sectores que representen las ubicaciones físicas o lógicas donde trabajan múltiples áreas juntas. Por ejemplo, crear el sector "USI" que agrupa las áreas "USI Enfermeras", "USI Doctores", "USI Técnicos" y "USI Kinesiólogos".

**Why this priority**: Sin sectores creados, ninguna otra funcionalidad del feature es posible. Es el cimiento sobre el cual se construye todo lo demás.

**Independent Test**: Se puede probar creando un sector con nombre, descripción, icono y color, y verificando que aparece en la lista de sectores de la organización.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR autenticado en una organización, **When** accede a la sección de sectores y crea uno nuevo con nombre "USI", **Then** el sector se crea exitosamente y aparece en la lista de sectores.
2. **Given** un sector "USI" existente, **When** el ADMIN_HR edita su nombre a "USI - Cuidados Intensivos", **Then** el nombre se actualiza correctamente.
3. **Given** un sector sin áreas asignadas, **When** el ADMIN_HR lo elimina, **Then** el sector se elimina sin afectar ninguna área.
4. **Given** un sector con áreas asignadas, **When** el ADMIN_HR intenta eliminarlo, **Then** el sistema muestra una confirmación advirtiendo que se desvinculan las áreas (no se eliminan).
5. **Given** un ADMIN_HR, **When** intenta crear un sector con un nombre que ya existe en la organización, **Then** el sistema rechaza la operación con un mensaje claro.

---

### User Story 2 - Asignar áreas a Sectores (Priority: P1)

Un ADMIN_HR necesita vincular áreas existentes a un sector. Un área puede pertenecer a más de un sector (ej: "Nutrición" podría estar en los sectores "USI", "UTI" y "Urgencias" porque las nutricionistas atienden pacientes en todos esos sectores). Un sector puede tener múltiples áreas.

**Why this priority**: Es co-dependiente con la creación de sectores. Sin áreas asignadas, el sector no tiene utilidad práctica.

**Independent Test**: Se puede probar asignando 3 áreas a un sector y verificando que todas aparecen listadas bajo ese sector. Luego desasignar una y verificar que el sector muestra solo 2.

**Acceptance Scenarios**:

1. **Given** un sector "USI" y 4 áreas disponibles en la organización, **When** el ADMIN_HR asigna "USI Enfermeras", "USI Doctores" y "USI Técnicos" al sector, **Then** el sector muestra 3 áreas vinculadas.
2. **Given** un área "Nutrición" ya asignada al sector "USI", **When** el ADMIN_HR la asigna también a los sectores "UTI" y "Urgencias", **Then** "Nutrición" aparece en los 3 sectores y las nutricionistas de turno son visibles en la consulta de cada uno.
3. **Given** un sector con 4 áreas, **When** el ADMIN_HR desvincula "USI Técnicos", **Then** el sector muestra 3 áreas y el área desvinculada sigue existiendo normalmente.
4. **Given** un sector "USI" con áreas, **When** el ADMIN_HR visualiza el sector, **Then** puede ver las áreas asignadas con su nombre, icono, color, cantidad de personal y si tienen rotativa activa.

---

### User Story 3 - Consultar personal de turno en un Sector (Priority: P2)

Un usuario (STAFF_HEALTH, CHIEF_AREA o ADMIN_HR) necesita consultar qué personal está de turno dentro de un sector para un rango horario específico. Por ejemplo: una enfermera en turno de 08:00 a 20:00 quiere ver qué doctores, técnicos y kinesiólogos estarán disponibles durante esas horas en el sector USI.

**Why this priority**: Es la funcionalidad central que motiva el feature. Depende de que existan sectores con áreas asignadas (P1).

**Independent Test**: Se puede probar seleccionando un sector y un rango horario, y verificando que el sistema muestra correctamente todos los turnos programados de todas las áreas del sector en ese periodo.

**Acceptance Scenarios**:

1. **Given** un sector "USI" con 3 áreas y turnos programados para hoy, **When** un usuario consulta el sector para el rango 08:00-20:00, **Then** ve una lista agrupada por área mostrando el personal de turno con nombre, área, tipo de turno y horario.
2. **Given** un sector "USI" consultado para 08:00-20:00, **When** hay un doctor con turno de 08:00-16:00 y otro de 16:00-00:00, **Then** ambos aparecen porque sus turnos se solapan con el rango consultado.
3. **Given** un sector "USI" consultado para 08:00-20:00, **When** hay un técnico con turno de 20:00-08:00 del día siguiente, **Then** el técnico NO aparece porque su turno no se solapa con el rango consultado.
4. **Given** un STAFF_HEALTH con un turno activo, **When** accede a la vista de sector, **Then** el rango horario se pre-llena automáticamente con las horas de su turno actual.
5. **Given** un sector sin turnos programados en el rango consultado, **When** el usuario realiza la consulta, **Then** el sistema muestra un mensaje indicando que no hay personal de turno en ese periodo.

---

### User Story 4 - Visualización de Sectores en lista (Priority: P3)

Un CHIEF_AREA o ADMIN_HR puede ver un resumen de los sectores relevantes, incluyendo cuántas áreas tiene cada sector y el estado general de personal de turno para el día actual.

**Why this priority**: Complementa la experiencia pero no es esencial para el MVP. La consulta detallada (P2) ya proporciona la funcionalidad core.

**Independent Test**: Se puede probar accediendo a la sección de sectores y verificando que aparece una lista con cada sector mostrando conteos de áreas y personal de turno actual.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR con 3 sectores en la organización, **When** accede a la sección de sectores, **Then** ve una lista con cada sector mostrando nombre, icono, cantidad de áreas y cantidad de personal de turno en este momento.
2. **Given** un CHIEF_AREA asignado a áreas que pertenecen al sector "USI", **When** accede a la sección de sectores, **Then** solo ve los sectores que contienen al menos una de sus áreas.

---

### Edge Cases

- **Area sin sector**: Un área puede no pertenecer a ningún sector. Esto no afecta su funcionamiento normal (turnos, rotativas, etc.).
- **Sector vacío**: Un sector puede existir sin áreas asignadas. Se muestra como vacío con opción de asignar áreas.
- **Area eliminada**: Si un área vinculada a un sector es eliminada, la vinculación se elimina automáticamente.
- **Turnos que cruzan medianoche**: Si un turno va de 20:00 a 08:00 del día siguiente y el rango consultado es 22:00-06:00, el turno debe aparecer porque hay solapamiento.
- **Múltiples turnos del mismo usuario**: Si un usuario tiene dos turnos en el mismo día (ej: turno normal + turno extra), ambos se muestran en la consulta de sector.
- **Área transversal en múltiples sectores**: Si el área "Nutrición" pertenece a USI, UTI y Urgencias, la nutricionista de turno aparece en la consulta de los 3 sectores. Esto es correcto: el personal transversal es visible en todos los sectores que atiende.
- **Organización sin sectores**: El feature es completamente opcional. Si una organización no crea sectores, el resto de la aplicación funciona exactamente igual.
- **Permisos**: STAFF_HEALTH solo puede ver información de sectores que contienen áreas donde tienen asignación (vía UserArea). No pueden ver sectores de áreas a las que no pertenecen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir a ADMIN_HR crear sectores con nombre (obligatorio), descripción (opcional), icono (opcional) y color (opcional) dentro de su organización.
- **FR-002**: El sistema DEBE impedir la creación de sectores con nombres duplicados dentro de la misma organización.
- **FR-003**: El sistema DEBE permitir a ADMIN_HR editar nombre, descripción, icono y color de un sector existente.
- **FR-004**: El sistema DEBE permitir a ADMIN_HR eliminar un sector, desvinculando automáticamente las áreas sin eliminarlas.
- **FR-005**: El sistema DEBE permitir a ADMIN_HR asignar una o más áreas de la organización a un sector (relación muchos-a-muchos).
- **FR-006**: El sistema DEBE permitir a ADMIN_HR desasignar áreas de un sector sin afectar el área ni sus turnos/rotativas.
- **FR-007**: El sistema DEBE permitir que un área pertenezca a múltiples sectores simultáneamente.
- **FR-008**: El sistema DEBE mostrar la lista de sectores con filtro de búsqueda por nombre y paginación.
- **FR-009**: El sistema DEBE permitir a cualquier usuario con acceso consultar el personal de turno de un sector para un rango horario de un solo día (fecha + hora inicio + hora fin). No se soportan rangos multi-día en esta versión.
- **FR-010**: La consulta de personal por sector DEBE incluir todos los turnos que se solapan parcial o totalmente con el rango horario especificado.
- **FR-011**: La consulta de personal DEBE mostrar: nombre del trabajador, área, tipo de turno, horario exacto del turno, y si es turno extra.
- **FR-012**: La consulta de personal DEBE agrupar los resultados por área dentro del sector.
- **FR-013**: Para STAFF_HEALTH, el rango horario de consulta DEBE pre-llenarse con el horario de su turno actual o próximo (si existe).
- **FR-014**: El acceso a sectores DEBE respetar el modelo multi-tenant: cada organización ve solo sus sectores.
- **FR-015**: CHIEF_AREA solo DEBE ver sectores que contengan al menos una de sus áreas asignadas.
- **FR-016**: STAFF_HEALTH solo DEBE ver sectores que contengan al menos una de las áreas donde están asignados.
- **FR-017**: La eliminación de un área DEBE eliminar automáticamente sus vínculos con sectores (sin eliminar el sector).

### Key Entities

- **Sector**: Agrupación lógica/física de múltiples áreas que trabajan en conjunto. Atributos: nombre, descripción, icono, color. Pertenece a una organización. Tiene una relación muchos-a-muchos con Área.
- **SectorArea** (vínculo): Relación entre un Sector y un Área. Permite que un área esté en múltiples sectores y un sector contenga múltiples áreas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un ADMIN_HR puede crear un sector y asignarle áreas en menos de 2 minutos.
- **SC-002**: Un usuario puede consultar el personal de turno de un sector para un rango horario en menos de 5 segundos desde que selecciona el sector.
- **SC-003**: La consulta de sector muestra correctamente el 100% de los turnos que se solapan con el rango horario consultado (sin falsos negativos).
- **SC-004**: El feature es completamente opcional: organizaciones que no crean sectores no experimentan ningún cambio en la interfaz ni en el rendimiento.
- **SC-005**: 80% de los usuarios de STAFF_HEALTH pueden consultar el personal del sector sin necesidad de instructivo o capacitación.

## Clarifications

### Session 2026-02-26

- Q: ¿La consulta de personal por sector cubre un solo día o un rango multi-día? → A: Solo día único (fecha + hora inicio + hora fin). Cubre el caso principal "quién está durante mi turno". Multi-día podría agregarse en un feature posterior.
- Q: ¿Confirmado que áreas transversales (ej: Nutrición) pueden pertenecer a múltiples sectores (USI, UTI, Urgencias)? → A: Sí, confirmado. La nutricionista de turno aparece en la consulta de todos los sectores donde su área está vinculada.

## Assumptions

- Las áreas existentes mantienen su independencia operativa completa. Los sectores son una capa de agrupación visual/consulta, no alteran el comportamiento de turnos, rotativas ni contratos.
- El icono del sector utiliza el mismo sistema de iconos existente (lucide-react) para mantener consistencia visual.
- La relación muchos-a-muchos (un área en múltiples sectores) es necesaria porque áreas de servicio transversal (ej: Nutrición, Laboratorio, Farmacia) atienden pacientes en múltiples sectores simultáneamente.
- La integración con el calendario se implementará en un feature posterior. Este feature se centra en la gestión de sectores y la consulta de personal por sector como vista independiente.
- El color del sector es independiente del color de las áreas que contiene. Sirve para identificar visualmente el sector en listas y tarjetas.

## Out of Scope

- Integración del sector en el calendario de turnos (será un feature posterior).
- Notificaciones automáticas sobre cambios de turno dentro del sector.
- Chat o comunicación entre personal del mismo sector.
- Reportes o estadísticas agregadas por sector.
- Restricciones de cobertura mínima por sector (ej: "USI siempre debe tener al menos 1 doctor").
