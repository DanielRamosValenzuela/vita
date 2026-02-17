# Feature Specification: Bandeja de Entrada y Sistema de Notificaciones

**Feature Branch**: `003-inbox-notifications`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Crear un sistema de notificaciones que funcione como bandeja de entrada para todos los roles, conectado con las notificaciones push existentes (toasts). Incluir nueva ruta en el sidebar, funcionar como TODO list con acciones clickeables que redirijan al contexto relevante."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver y gestionar la Bandeja de Entrada (Priority: P1)

Cualquier usuario autenticado con rol organizacional (ADMIN_HR, CHIEF_AREA, STAFF_HEALTH) puede acceder a su Bandeja de Entrada desde el sidebar. SUPER_ADMIN queda excluido en esta iteración ya que los eventos actuales no aplican a su rol. Al entrar, ve una lista cronológica de notificaciones/mensajes, cada uno con un indicador de leído/no leído, un resumen del evento y la fecha. El usuario puede marcar notificaciones como leídas, hacer clic en una notificación para navegar al contexto relevante (p.ej. perfil para aceptar invitación, calendario de turnos, etc.), y ver un badge con el conteo de no leídas en el sidebar.

**Why this priority**: Es el núcleo de la feature. Sin la bandeja de entrada visible y navegable, no hay dónde mostrar las notificaciones. Provee valor inmediato al centralizar toda la información pendiente del usuario en un solo lugar tipo TODO list.

**Independent Test**: Crear una invitación para un usuario, luego iniciar sesión como ese usuario. Verificar que aparece el badge en el sidebar, que al entrar a la bandeja se ve la notificación de invitación, que al hacer clic se navega al perfil con sección de invitaciones, y que al marcarla como leída el badge se actualiza.

**Acceptance Scenarios**:

1. **Given** un usuario con notificaciones no leídas, **When** accede al dashboard, **Then** ve un badge numérico junto al item "Bandeja de entrada" en el sidebar indicando la cantidad de no leídas.
2. **Given** un usuario en la bandeja de entrada, **When** ve la lista de notificaciones, **Then** cada notificación muestra: icono por tipo, título descriptivo, fecha relativa (hace 5 min, ayer, etc.), e indicador visual de leída/no leída.
3. **Given** un usuario con una notificación de invitación pendiente, **When** hace clic en ella, **Then** es redirigido a `/dashboard/profile?section=invitations` y la notificación se marca como leída automáticamente.
4. **Given** un usuario con varias notificaciones no leídas, **When** hace clic en "Marcar todas como leídas", **Then** todas las notificaciones pasan a estado leído y el badge del sidebar se actualiza a cero.
5. **Given** un usuario sin notificaciones, **When** accede a la bandeja de entrada, **Then** ve un estado vacío con mensaje informativo.

---

### User Story 2 - Generación automática de notificaciones por acciones del sistema (Priority: P2)

El sistema genera notificaciones automáticamente cuando ocurren eventos relevantes para un usuario. Estos eventos incluyen: invitación a una organización, asignación a un área nueva, asignación de un turno, cambio o cancelación de un turno, y solicitudes de cambio de turno. Cada evento crea una notificación persistente en la bandeja de entrada del usuario afectado.

**Why this priority**: Sin generación automática, la bandeja estaría vacía. Este story conecta las acciones existentes del sistema (invitaciones, turnos, áreas) con la bandeja de entrada, dándole contenido real.

**Independent Test**: Desde una cuenta ADMIN_HR, enviar una invitación a un CHIEF. Verificar que se creó una notificación en la bandeja del CHIEF. Desde una cuenta CHIEF, asignar un turno a un STAFF. Verificar que se creó una notificación en la bandeja del STAFF.

**Acceptance Scenarios**:

1. **Given** ADMIN_HR envía una invitación a un usuario, **When** la invitación se crea exitosamente, **Then** se genera una notificación en la bandeja del usuario invitado con tipo "Invitación pendiente" y enlace a la sección de invitaciones de su perfil.
2. **Given** ADMIN_HR asigna un CHIEF a un área, **When** la asignación se completa, **Then** el CHIEF recibe una notificación con el nombre del área y enlace a la vista de áreas.
3. **Given** CHIEF crea un turno asignado a un STAFF, **When** el turno se guarda exitosamente, **Then** el STAFF recibe una notificación con detalles del turno (fecha, área, tipo) y enlace al calendario de turnos.
4. **Given** CHIEF modifica un turno existente de un STAFF, **When** el cambio se guarda, **Then** el STAFF recibe una notificación indicando que su turno fue modificado, con el detalle del cambio.
5. **Given** un turno es eliminado, **When** la eliminación se confirma, **Then** el STAFF asignado recibe una notificación de cancelación.

---

### User Story 3 - Mejora de notificaciones toast con conexión a la bandeja (Priority: P3)

El sistema de notificaciones toast existente (que actualmente solo muestra invitaciones pendientes al cargar el dashboard) se amplía para reflejar todas las notificaciones no leídas de la bandeja. Cuando un usuario carga cualquier página del dashboard y tiene notificaciones no leídas recientes (de los últimos 15 minutos), se muestra un toast con el resumen y un botón para ir a la bandeja de entrada.

**Why this priority**: Mejora la experiencia de usuario al notificar proactivamente sobre eventos nuevos sin requerir que el usuario navegue a la bandeja. Construye sobre la infraestructura de toast ya existente (`PendingNotificationsToaster`).

**Independent Test**: Crear un turno para un STAFF, luego iniciar sesión como ese STAFF. Verificar que aparece un toast con "Tienes un nuevo turno asignado" y un botón "Ver bandeja" que navega a `/dashboard/inbox`.

**Acceptance Scenarios**:

1. **Given** un usuario con notificaciones no leídas recientes (menos de 15 minutos), **When** carga una página del dashboard, **Then** se muestran hasta 3 toasts con resumen de las notificaciones más recientes.
2. **Given** un toast de notificación visible, **When** el usuario hace clic en el botón de acción, **Then** es redirigido a la bandeja de entrada.
3. **Given** un usuario que ya vio un toast en esta sesión, **When** navega a otra página del dashboard, **Then** el mismo toast no se muestra de nuevo (deduplicación por sesión, ya implementada).

---

### User Story 4 - Filtrado y organización de la bandeja (Priority: P4)

El usuario puede filtrar las notificaciones de su bandeja por estado (todas, no leídas, leídas) y por tipo (invitaciones, turnos, áreas, general). También puede eliminar notificaciones individuales que ya no necesita.

**Why this priority**: Mejora la usabilidad cuando el volumen de notificaciones crece, pero no es esencial para el MVP. La bandeja funciona perfectamente sin filtros para volúmenes bajos.

**Independent Test**: Crear múltiples notificaciones de distintos tipos para un usuario. Verificar que los filtros por tipo y estado funcionan correctamente y que se puede eliminar una notificación individual.

**Acceptance Scenarios**:

1. **Given** un usuario con notificaciones mixtas (leídas y no leídas), **When** selecciona el filtro "No leídas", **Then** solo se muestran las notificaciones no leídas.
2. **Given** un usuario con notificaciones de distintos tipos, **When** selecciona el filtro "Turnos", **Then** solo se muestran notificaciones relacionadas con turnos.
3. **Given** un usuario viendo una notificación, **When** la elimina y confirma la acción, **Then** la notificación desaparece de la lista y no se puede recuperar.

---

### Edge Cases

- Cuando un usuario tiene 0 notificaciones, la bandeja muestra un estado vacío amigable con un mensaje explicativo.
- Si el evento fuente de una notificación se elimina (ej: se cancela una invitación antes de ser vista), la notificación sigue visible pero al hacer clic muestra un mensaje indicando que el recurso ya no existe o redirige al contexto general.
- Cuando un usuario tiene más de 50 notificaciones, la bandeja debe paginar o usar scroll infinito para mantener el rendimiento.
- Si dos acciones generan notificaciones simultáneas para el mismo usuario (ej: invitación + asignación de área), ambas deben aparecer como notificaciones separadas.
- Un usuario que pertenece a múltiples organizaciones debe ver notificaciones de todas sus organizaciones, con el nombre de la organización visible en cada notificación.
- Las notificaciones se generan solo para el usuario afectado, nunca para el usuario que ejecutó la acción (el ADMIN que invita no se notifica a sí mismo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proveer una página de bandeja de entrada accesible desde `/dashboard/inbox` para los roles ADMIN_HR, CHIEF_AREA y STAFF_HEALTH. SUPER_ADMIN queda excluido en esta iteración.
- **FR-002**: El sidebar DEBE mostrar un item "Bandeja de entrada" con un badge numérico que indique la cantidad de notificaciones no leídas del usuario actual.
- **FR-003**: El sistema DEBE persistir notificaciones con al menos: usuario destinatario, usuario actor (quién ejecutó la acción), tipo de notificación, título, mensaje descriptivo, URL de destino, estado de lectura, y fecha de creación.
- **FR-004**: El sistema DEBE generar notificaciones automáticamente al ocurrir los siguientes eventos: creación de invitación, asignación de usuario a área, creación de turno, modificación de turno, eliminación de turno.
- **FR-005**: Cada notificación DEBE tener una URL de destino que redirija al contexto relevante del evento (perfil para invitaciones, calendario para turnos, áreas para asignaciones).
- **FR-006**: Los usuarios DEBEN poder marcar notificaciones como leídas individualmente (al hacer clic) y masivamente (marcar todas como leídas).
- **FR-007**: Los usuarios DEBEN poder eliminar notificaciones individuales con confirmación.
- **FR-008**: Las notificaciones DEBEN estar aisladas por usuario (multi-tenant); cada usuario solo ve sus propias notificaciones.
- **FR-009**: El sistema de toasts existente DEBE ampliarse para mostrar notificaciones recientes (menos de 15 minutos) además de las invitaciones pendientes actuales.
- **FR-010**: La bandeja DEBE soportar filtrado por estado (todas, leídas, no leídas) y por tipo de notificación.
- **FR-011**: La bandeja DEBE mostrar la fecha de cada notificación en formato relativo (hace 5 min, ayer, hace 3 días) con tooltip mostrando fecha absoluta.
- **FR-012**: El badge del sidebar DEBE actualizarse sin requerir recarga completa de la página cuando el usuario marca notificaciones como leídas.
- **FR-013**: Las notificaciones DEBEN incluir el nombre de la organización cuando sea relevante, para usuarios que pertenecen a múltiples organizaciones.

### Key Entities

- **Notification (Notificación)**: Representa un mensaje/evento dirigido a un usuario. Inmutable una vez creada (no se actualiza si el evento fuente cambia). Atributos clave: destinatario, actor (quién ejecutó la acción), tipo de evento, título, descripción, URL de destino, estado de lectura (read/unread), fecha de creación, referencia opcional a la organización fuente. El mensaje incluye el nombre del actor (ej: "Juan Pérez te asignó un turno"). El usuario puede marcar como leída o eliminar, pero el contenido no cambia.
- **NotificationType (Tipo de Notificación)**: Categorías de notificaciones que determinan el icono, color y comportamiento. Tipos: invitación pendiente, asignación a área, turno creado, turno modificado, turno cancelado, general.

## Clarifications

### Session 2026-02-17

- Q: Cuando el evento fuente se resuelve (invitación aceptada, turno pasado), debe la notificación reflejar eso? → A: No. Las notificaciones son inmutables: solo read/unread + delete manual. La resolución del evento fuente no afecta la notificación. Patrón estándar tipo GitHub/Slack.
- Q: Qué notificaciones recibe SUPER_ADMIN? → A: SUPER_ADMIN queda excluido del sistema de notificaciones en esta iteración. La bandeja no se muestra en su sidebar. Los eventos actuales (invitaciones, áreas, turnos) son internos de organización y no aplican a SUPER_ADMIN.
- Q: Deben las notificaciones mostrar quién ejecutó la acción (actor)? → A: Sí. Incluir el nombre del actor: "Juan Pérez te asignó un turno en Urgencias". Se almacena referencia al usuario que ejecutó la acción.

## Assumptions

- El sistema actual de toasts (`PendingNotificationsToaster`) y la entidad `notification` en `src/entities/notification/` serán extendidos, no reemplazados.
- No se requiere notificación en tiempo real (WebSocket/SSE) en esta iteración; las notificaciones se cargan al acceder a la bandeja o al cargar el dashboard.
- La paginación de la bandeja se implementa con scroll infinito o paginación simple (cursor-based) cuando haya más de 20 notificaciones visibles.
- Las notificaciones no tienen fecha de expiración automática; el usuario las elimina manualmente cuando ya no las necesita.
- El badge del sidebar se obtiene mediante una consulta ligera (count) en el server component del layout del dashboard.
- Las notificaciones de turnos solo se generan cuando un CHIEF o ADMIN asigna/modifica/elimina un turno para otro usuario, no cuando un usuario crea/edita sus propios turnos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todo usuario autenticado puede acceder a su bandeja de entrada en menos de 2 clics desde cualquier página del dashboard (1 clic en sidebar).
- **SC-002**: Las notificaciones generadas automáticamente aparecen en la bandeja del usuario destinatario dentro de la siguiente carga de página.
- **SC-003**: 100% de los tipos de evento definidos (invitación, asignación área, turno creado/modificado/eliminado) generan notificación con URL de destino funcional.
- **SC-004**: El badge del sidebar refleja con precisión la cantidad de notificaciones no leídas del usuario.
- **SC-005**: La bandeja de entrada carga y muestra hasta 20 notificaciones en menos de 1 segundo.
- **SC-006**: Los usuarios pueden marcar todas las notificaciones como leídas con una sola acción.
- **SC-007**: Todas las cadenas de texto visibles en la bandeja están internacionalizadas en español e inglés.
