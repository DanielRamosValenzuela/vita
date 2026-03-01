# Feature Specification: Staff Dashboard Calendar

**Feature Branch**: `005-staff-dashboard-calendar`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "Crear el dashboard principal del STAFF en /dashboard con calendario interactivo de turnos asignados, vista de personal activo por sector al hacer clic en un turno, y soporte para importación/exportación con Google Calendar."

## Clarifications

### Session 2026-02-28

- Q: El feed de suscripción iCal (FR-012): debería ser uno por organización o uno unificado con todos los turnos del usuario? → A: Ambos. El sistema ofrece feeds por organización (token vinculado a usuario+organización, respeta aislamiento multi-tenant) y un feed unificado personal (token vinculado solo al usuario, agrega turnos de todas las organizaciones). Las organizaciones no pueden saber si el STAFF trabaja en otra institución. El feed unificado permite al STAFF detectar conflictos entre turnos de distintas organizaciones.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar mis turnos en el calendario (Priority: P1)

Como STAFF o CHIEF_AREA, quiero ver todos mis turnos asignados en un calendario mensual interactivo, para tener una visión clara de mi agenda laboral.

El calendario se muestra como vista principal del dashboard (`/dashboard`). Presenta un mes a la vez con navegación entre meses. Cada turno aparece como un evento coloreado según su tipo de turno, mostrando el horario (inicio-fin) y el área asignada. Si el usuario no tiene turnos asignados en el mes visible (incluyendo un CHIEF sin turnos propios), se muestra el calendario vacío con un mensaje indicativo.

El estilo visual se basa en el calendario existente de `/dashboard/shifts`, adaptado para una vista personal de solo lectura.

**Why this priority**: Es la funcionalidad core del dashboard. Sin la visualización de turnos, ninguna otra historia tiene sentido. Entrega valor inmediato al personal de salud al reemplazar la consulta manual de horarios.

**Independent Test**: Se puede verificar creando turnos para un usuario STAFF y confirmando que aparecen correctamente en el calendario del dashboard con fecha, horario, tipo y área correctos.

**Acceptance Scenarios**:

1. **Given** un STAFF con 5 turnos asignados en marzo 2026, **When** navega a `/dashboard`, **Then** ve el calendario de marzo con los 5 turnos representados como eventos con su horario, tipo de turno y área.
2. **Given** un STAFF sin turnos en abril 2026, **When** navega al mes de abril, **Then** ve el calendario vacío con un mensaje como "No tienes turnos asignados este mes".
3. **Given** un CHIEF_AREA sin turnos propios asignados, **When** accede a `/dashboard`, **Then** ve el calendario vacío (el dashboard de gestión de shifts está en `/dashboard/shifts`, no aquí).
4. **Given** un STAFF con turnos, **When** hace clic en las flechas de navegación, **Then** puede moverse entre meses y ver los turnos correspondientes a cada mes.
5. **Given** un turno con estado CANCELLED, **When** el calendario se renderiza, **Then** el turno cancelado aparece con indicación visual diferenciada (opacidad reducida o tachado).
6. **Given** un turno nocturno de 22:00 a 06:00, **When** se renderiza, **Then** aparece en el día de inicio con indicación visual de que continúa al día siguiente.

---

### User Story 2 - Ver detalle de turno y personal activo del sector (Priority: P2)

Como STAFF o CHIEF_AREA, quiero hacer clic en uno de mis turnos y ver quién más está trabajando en mi sector durante ese período, para saber con quién compartiré jornada.

Al hacer clic en un turno, se abre un panel o modal con dos secciones: (1) detalle del turno seleccionado (horario, área, tipo, estado) y (2) lista del personal activo en el sector al que pertenece esa área, agrupado por área dentro del sector. Cada persona muestra su nombre, hora de inicio, hora de fin y, si hay un cambio de turno programado durante la jornada, se indica quién es la persona de relevo.

**Why this priority**: Conocer quién trabaja contigo es la segunda necesidad más importante para el personal de salud. Permite coordinación y da contexto sobre la cobertura del sector. Es el diferenciador clave frente a un calendario genérico.

**Independent Test**: Se puede verificar creando turnos para múltiples personas en áreas del mismo sector, haciendo clic en un turno y confirmando que aparece la lista completa de personal activo, correctamente agrupada por área con horarios.

**Acceptance Scenarios**:

1. **Given** un turno asignado al usuario en el área "USI Enfermeras" (sector "USI"), **When** hace clic en el turno, **Then** ve un panel con: su turno (hora inicio/fin, tipo, área) y el personal activo en todas las áreas del sector "USI" (USI Enfermeras, USI Doctores, USI Técnicos).
2. **Given** un sector con 3 áreas y 8 personas trabajando en total, **When** abre el detalle, **Then** ve las 8 personas organizadas por área, cada una con nombre, hora inicio y hora fin.
3. **Given** que durante la jornada del usuario (08:00-20:00) hay un cambio de turno en "USI Doctores" a las 14:00 (Doctor A sale, Doctor B entra), **When** abre el detalle, **Then** ve en "USI Doctores": Doctor A (08:00-14:00) con indicación de que Doctor B toma el relevo, y Doctor B (14:00-20:00).
4. **Given** que el área del turno no pertenece a ningún sector, **When** abre el detalle, **Then** ve solo el detalle de su turno y el personal activo de esa área individual (sin agrupación por sector).
5. **Given** un turno del usuario de 20:00 a 08:00 (noche), **When** abre el detalle, **Then** ve el personal activo que coincide con ese rango horario, incluyendo personal del turno previo que aún esté activo y personal del turno siguiente que comience durante su jornada.

---

### User Story 3 - Vista de próximos turnos (Priority: P3)

Como STAFF o CHIEF_AREA, quiero ver un resumen de mis próximos turnos más cercanos (próximos 7 días), para tener acceso rápido a mi agenda inmediata sin navegar el calendario completo.

Se muestra una sección complementaria al calendario (panel lateral o sección superior) con los próximos turnos ordenados cronológicamente, mostrando fecha, hora, área y tipo de turno. Permite acceso rápido al detalle de cada turno.

**Why this priority**: Es un complemento de usabilidad que reduce fricción. Sin él, el usuario debe buscar visualmente en el calendario. Es útil pero no esencial para el MVP.

**Independent Test**: Se puede verificar confirmando que los próximos turnos se listan correctamente por fecha y hora, y que hacer clic en uno navega o muestra el detalle.

**Acceptance Scenarios**:

1. **Given** un STAFF con 3 turnos en los próximos 7 días, **When** accede al dashboard, **Then** ve una lista "Próximos turnos" con los 3 turnos ordenados por fecha/hora.
2. **Given** un STAFF sin turnos futuros, **When** accede al dashboard, **Then** la sección muestra un mensaje como "No tienes turnos programados próximamente".
3. **Given** un turno que es hoy, **When** ve la lista de próximos turnos, **Then** el turno de hoy aparece destacado con indicación "Hoy".

---

### User Story 4 - Exportar turnos a Google Calendar (Priority: P4)

Como STAFF o CHIEF_AREA, quiero exportar mis turnos a Google Calendar para sincronizar mi agenda laboral con mi calendario personal.

El sistema permite exportar turnos de dos formas: (1) descarga de un archivo .ics con los turnos del mes seleccionado, y (2) una URL de suscripción (feed iCal) que Google Calendar puede consumir automáticamente para mantenerse sincronizado. Cada evento exportado incluye título (tipo de turno + área), horario, y descripción con detalles del turno.

**Why this priority**: Aunque es una funcionalidad valiosa para la adopción del producto, no bloquea el uso diario de la plataforma. La exportación .ics es la forma más estándar y escalable de integración con calendarios externos, y no requiere OAuth ni permisos de terceros.

**Independent Test**: Se puede verificar exportando turnos como archivo .ics y abriéndolo en Google Calendar, confirmando que los eventos aparecen con la información correcta.

**Acceptance Scenarios**:

1. **Given** un STAFF con turnos en marzo, **When** hace clic en "Exportar a calendario", **Then** descarga un archivo .ics con todos sus turnos del mes que puede importarse en Google Calendar.
2. **Given** un turno de 08:00 a 20:00 en "USI Enfermeras" tipo "Largo", **When** se exporta, **Then** el evento .ics contiene: título "Turno Largo - USI Enfermeras", horario correcto, y descripción con estado y área.
3. **Given** un STAFF que quiere sincronización automática, **When** copia la URL de suscripción iCal y la agrega a Google Calendar, **Then** Google Calendar muestra sus turnos y se actualiza periódicamente con cambios.
4. **Given** un turno cancelado, **When** se exporta, **Then** no se incluye en el archivo .ics ni en el feed iCal (solo se exportan turnos activos: SCHEDULED o IN_PROGRESS).
5. **Given** un STAFF que trabaja en Hospital A y Clínica B, **When** suscribe el feed unificado personal en Google Calendar, **Then** ve los turnos de ambas instituciones en un solo calendario y puede detectar conflictos de horario entre ellas.
6. **Given** un STAFF que trabaja en Hospital A y Clínica B, **When** suscribe el feed por organización de Hospital A, **Then** solo ve los turnos de Hospital A, sin información sobre Clínica B.

---

### User Story 5 - Importar eventos desde Google Calendar (Priority: P5)

Como STAFF, quiero importar eventos de mi Google Calendar para ver mis compromisos personales junto a mis turnos y detectar posibles conflictos de horario.

El usuario puede conectar su cuenta de Google para importar eventos de un calendario seleccionado. Los eventos importados se muestran de forma diferenciada en el calendario (color/estilo distinto a los turnos) y son de solo lectura. Si un evento personal se superpone con un turno asignado, se muestra una indicación visual de conflicto.

**Why this priority**: Es la funcionalidad más compleja y con mayor dependencia externa (OAuth con Google). Aporta valor complementario pero no es esencial para el uso principal del dashboard.

**Independent Test**: Se puede verificar conectando una cuenta de Google, importando eventos y confirmando que aparecen en el calendario junto a los turnos con indicación de conflictos.

**Acceptance Scenarios**:

1. **Given** un STAFF sin Google Calendar conectado, **When** hace clic en "Conectar Google Calendar", **Then** se inicia el flujo de autorización de Google solicitando permisos de lectura de calendarios.
2. **Given** un STAFF con Google Calendar conectado y 3 eventos personales en marzo, **When** ve el calendario de marzo, **Then** los 3 eventos aparecen con estilo visual diferenciado de los turnos.
3. **Given** un evento personal de 10:00-12:00 y un turno de 08:00-20:00 el mismo día, **When** ve el calendario, **Then** se muestra una indicación de superposición horaria.
4. **Given** un STAFF que quiere desconectar Google Calendar, **When** hace clic en "Desconectar", **Then** se revocan los permisos y los eventos importados dejan de mostrarse.

---

### User Story 6 - Notas personales en el calendario (Priority: P2) ✅

Como STAFF o CHIEF_AREA, quiero poder hacer clic en un día del calendario y agregar una nota personal para recordar tareas o información relevante de ese día.

El usuario hace clic en cualquier día del calendario y aparece un popover inline anclado al día con un textarea para escribir una nota (máximo 500 caracteres). Puede guardar, editar y eliminar notas. Los días con nota muestran un punto azul como indicador visual. Las notas son personales del usuario (no están vinculadas a ninguna organización).

**Why this priority**: Complementa la funcionalidad del calendario con capacidad de anotación personal, similar a Google Calendar. Bajo costo de implementación con alto valor de usabilidad.

**Independent Test**: Click en día vacío → popover con textarea. Guardar nota → punto azul. Click en día con nota → contenido existente editable. Eliminar → punto desaparece. Cambiar de mes → notas del nuevo mes se cargan.

**Acceptance Scenarios**:

1. **Given** un STAFF viendo el calendario, **When** hace clic en un día vacío, **Then** aparece un popover con textarea, contador de caracteres y botón guardar.
2. **Given** un STAFF que escribe "Reunión de equipo a las 9am" y guarda, **When** ve el calendario, **Then** el día muestra un punto azul indicador y la nota aparece al hacer clic nuevamente.
3. **Given** un STAFF que ya tiene una nota en un día, **When** hace clic en ese día, **Then** el popover muestra el contenido existente editable con opción de eliminar.
4. **Given** un STAFF que elimina una nota, **When** confirma la eliminación, **Then** el punto azul desaparece y el día queda sin nota.
5. **Given** un STAFF que cambia de mes, **When** navega al mes siguiente, **Then** las notas del nuevo mes se cargan correctamente.

---

### Edge Cases

- **Turno que cruza la medianoche**: Un turno nocturno (22:00 a 06:00) debe mostrarse en el día de inicio con indicación visual de que continúa al día siguiente.
- **Múltiples turnos el mismo día**: Si un usuario tiene más de un turno en el mismo día (p.ej. mañana y noche), ambos deben ser visibles sin superponerse visualmente.
- **Área sin sector**: Si el área del turno no está asociada a ningún sector, el detalle muestra solo el personal de esa área individual.
- **Sector con muchas áreas**: Si un sector tiene 10+ áreas con personal activo, la lista debe ser navegable con scroll o colapso por área.
- **Turno de rotación vs turno manual**: Ambos tipos deben verse iguales desde la perspectiva del staff; la distinción de origen (rotación o manual) puede mostrarse como dato informativo pero no cambia la presentación.
- **Cambios de turno posterior a la carga**: Si un turno es modificado o cancelado mientras el usuario está viendo el dashboard, la información se actualizará al navegar entre meses o al recargar la página. No se requiere actualización en tiempo real en esta iteración.
- **Zona horaria**: Todos los horarios se muestran en la zona horaria de la organización (Chile por defecto). No se requiere soporte multi-zona horaria.
- **Usuario en múltiples organizaciones**: El dashboard muestra turnos de la organización activa. El cambio de organización se gestiona desde el selector de contexto existente.
- **Feed iCal con token expirado o revocado**: Si el token del feed iCal es revocado o el usuario es eliminado, la URL debe retornar un calendario vacío o un error apropiado, nunca datos de otro usuario.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un calendario mensual interactivo como vista principal del dashboard para usuarios con rol STAFF y CHIEF_AREA.
- **FR-002**: El calendario DEBE mostrar todos los turnos asignados al usuario autenticado dentro del mes visible, incluyendo turnos individuales y generados por rotación.
- **FR-003**: Cada evento del calendario DEBE mostrar como mínimo: horario (inicio-fin), tipo de turno y área asignada, con diferenciación visual por tipo de turno.
- **FR-004**: El sistema DEBE permitir navegación entre meses (anterior/siguiente) manteniendo la carga de turnos correspondiente.
- **FR-005**: Cuando el usuario no tenga turnos asignados en el mes visible, el sistema DEBE mostrar el calendario con un mensaje indicativo de ausencia de turnos.
- **FR-006**: El sistema DEBE diferenciar visualmente los turnos según su estado (programado, en progreso, completado, cancelado, no presentado).
- **FR-007**: Al hacer clic en un turno, el sistema DEBE mostrar un panel de detalle con información completa del turno y lista de personal activo en el sector correspondiente.
- **FR-008**: La lista de personal activo DEBE estar agrupada por área dentro del sector, mostrando para cada persona: nombre, hora de inicio y hora de fin.
- **FR-009**: Cuando haya un cambio de turno programado durante la jornada (una persona sale y otra entra en la misma área), el sistema DEBE indicar quién es la persona de relevo.
- **FR-010**: El sistema DEBE mostrar una sección de "Próximos turnos" con los turnos de los próximos 7 días del usuario, ordenados cronológicamente.
- **FR-011**: El sistema DEBE permitir exportar los turnos del mes seleccionado como archivo .ics compatible con calendarios estándar (Google Calendar, Apple Calendar, Outlook).
- **FR-012**: El sistema DEBE ofrecer dos tipos de feed iCal de suscripción: (a) un feed por organización que contiene solo los turnos de esa organización, y (b) un feed unificado personal que agrega los turnos de todas las organizaciones del usuario.
- **FR-013**: Cada feed iCal DEBE estar protegido por un token único: el feed por organización usa un token vinculado a usuario+organización, y el feed unificado usa un token vinculado solo al usuario. Ningún feed requiere autenticación interactiva.
- **FR-013b**: El feed por organización DEBE respetar el aislamiento multi-tenant: no debe revelar información sobre turnos de otras organizaciones. El feed unificado es privado del usuario y no accesible por ninguna organización.
- **FR-014**: El sistema DEBE permitir conectar una cuenta de Google Calendar para importar eventos personales y mostrarlos junto a los turnos con diferenciación visual.
- **FR-015**: Cuando un evento importado se superponga con un turno asignado, el sistema DEBE mostrar una indicación visual de conflicto.
- **FR-016**: El sistema DEBE permitir al usuario desconectar su cuenta de Google Calendar, revocando permisos y eliminando los eventos importados de la vista.
- **FR-017**: El sistema DEBE respetar el aislamiento multi-tenant, mostrando solo turnos de la organización activa del usuario.
- **FR-018**: Los turnos que crucen la medianoche DEBEN representarse visualmente de forma clara en el calendario, indicando continuidad al día siguiente.

### Key Entities

- **Turno (Shift)**: Unidad central del calendario. Representa una asignación de trabajo con horario definido (inicio/fin), vinculada a un usuario, un área y un tipo de turno. Puede originarse de una rotación o ser asignado manualmente. Tiene estado (programado, en progreso, completado, cancelado, no presentado).
- **Sector**: Agrupación lógica de áreas (p.ej. "USI" agrupa "USI Enfermeras", "USI Doctores", "USI Técnicos"). Permite visualizar el personal activo de todas las áreas relacionadas cuando un usuario consulta su turno.
- **Área**: Unidad organizacional donde se ejecutan los turnos. Pertenece a una organización y puede formar parte de uno o más sectores.
- **Personal Activo por Sector**: Vista derivada de los turnos. Representa las personas que tienen un turno activo (SCHEDULED o IN_PROGRESS) en un rango horario determinado dentro de las áreas de un sector.
- **Relevo**: Situación donde, durante la jornada de un turno, otra persona asume la posición en la misma área. Se identifica cuando dos turnos consecutivos en la misma área se suceden cronológicamente con un gap menor a 30 minutos.
- **Feed iCal**: Recurso que expone turnos en formato iCalendar (RFC 5545) a través de una URL con token único. Existen dos variantes: (a) feed por organización (token usuario+organización, contiene solo turnos de esa org, respeta aislamiento multi-tenant) y (b) feed unificado personal (token solo usuario, agrega turnos de todas las organizaciones, privado del STAFF para detección de conflictos entre instituciones).
- **Conexión Google Calendar**: Vínculo de autorización entre la cuenta del usuario y su Google Calendar, que permite leer eventos del calendario personal para visualizarlos en el dashboard de VITA.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El personal de salud puede consultar todos sus turnos del mes en menos de 5 segundos desde que accede al dashboard.
- **SC-002**: El 90% de los usuarios puede encontrar la información de su próximo turno (fecha, hora, área) en menos de 10 segundos sin necesidad de instrucción previa.
- **SC-003**: Al hacer clic en un turno, la información del personal activo del sector se muestra en menos de 3 segundos.
- **SC-004**: El archivo .ics exportado es importable correctamente en Google Calendar, Apple Calendar y Outlook sin errores de formato o pérdida de información en el 100% de los casos.
- **SC-005**: La URL de suscripción iCal refleja correctamente los cambios en turnos (creación, modificación, cancelación) en un plazo máximo de 1 hora para calendarios suscritos.
- **SC-006**: La detección de conflictos entre eventos importados y turnos asignados tiene una precisión del 100% para superposiciones horarias directas.
- **SC-007**: El dashboard vacío (sin turnos) comunica claramente al usuario su estado, logrando que el 95% de los usuarios comprenda que no tiene turnos sin necesidad de soporte.

## Assumptions

- El estilo visual del calendario existente en `/dashboard/shifts` (componente `ShiftCalendar`) se reutilizará como base, adaptándolo al contexto personal del staff (vista de solo lectura de sus propios turnos, no de gestión).
- La zona horaria es la de la organización (Chile por defecto). No se requiere soporte multi-zona horaria en esta iteración.
- Un "relevo" se identifica cuando dos turnos en la misma área se suceden cronológicamente con un gap de máximo 30 minutos entre la hora de fin de uno y la hora de inicio del siguiente.
- La integración de importación con Google Calendar usa el protocolo estándar OAuth 2.0 de Google y la Google Calendar API v3.
- Los feeds iCal usan tokens únicos sin autenticación interactiva: el feed por organización tiene un token por par usuario+organización, y el feed unificado tiene un token por usuario. El usuario puede regenerar sus tokens en cualquier momento, invalidando las URLs anteriores.
- Los eventos importados de Google Calendar son de solo lectura en VITA; no se sincronizan cambios de vuelta a Google.
- El dashboard muestra turnos de una sola organización a la vez. Si el usuario pertenece a múltiples organizaciones, usa el contexto de la organización activa (selector existente).
- La actualización de datos ocurre al navegar entre meses o al recargar la página. No se implementa actualización en tiempo real (WebSocket) en esta iteración.
