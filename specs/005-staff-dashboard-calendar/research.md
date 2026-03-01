# Research: Staff Dashboard Calendar

**Feature**: 005-staff-dashboard-calendar
**Date**: 2026-02-28

## R1: Reutilización del ShiftCalendar existente

**Decision**: Promover `ShiftCalendar` y `groupShiftsForCalendar()` de `features/shifts/` a `entities/shift/` para cumplir FSD (features no importan de otras features). Crear un wrapper `StaffCalendar` en `features/staff-dashboard/` que adapte los datos y callbacks al contexto personal del staff.

**Rationale**:
- `ShiftCalendar` (~450 LOC) es completamente genérico: acepta `CalendarEvent[]` y callbacks opcionales. Solo importa de `shared/`, por lo que es portable a `entities/`.
- Tipos `IndividualCalendarEvent` y `RotationGroupCalendarEvent` ya cubren todos los casos de turnos.
- `groupShiftsForCalendar()` es una función pura que funciona con cualquier `ShiftWithRelations[]`.
- Solo necesita: no pasar `onShiftDelete` (read-only), no pasar `onDateSelect` (no creación), sí pasar `onShiftClick` (para abrir detalle).
- **FSD compliance**: Al moverlos a `entities/shift/`, ambas features (`shifts` y `staff-dashboard`) pueden importar sin violar la regla de no-import entre features.

**Alternatives considered**:
- Crear un calendario nuevo desde cero: Rechazado por duplicación de código y riesgo de inconsistencia visual.
- Fork del componente: Rechazado; el componente original es suficientemente flexible vía props opcionales.
- Importar directamente desde `features/shifts/`: Rechazado; viola Principio I de la Constitución (FSD).

## R2: Server Action para turnos personales del staff

**Decision**: Crear `getMyShiftsAction()` en `src/features/staff-dashboard/api/staff-shifts-actions.ts` que usa `requireDashboardUser()` y filtra `Shift.userId === session.user.id`.

**Rationale**:
- `getShiftsAction()` existente requiere rol ADMIN_HR o CHIEF (usa `requireAdminHROrChief()`). STAFF no puede usarla.
- La nueva action es más simple: sin filtros de área/usuario (siempre el usuario autenticado), solo rango de fechas y opcionalmente status.
- Devuelve `ShiftWithRelations[]` (mismo tipo que el calendario existente usa).
- Para el feed unificado: una variante `getMyShiftsAllOrgsAction()` que busca turnos del usuario en TODAS las organizaciones (sin filtro orgId).

**Alternatives considered**:
- Modificar `getShiftsAction()` para aceptar staff: Rechazado por separación de responsabilidades. La action admin tiene lógica de paginación, filtros complejos y permisos que no aplican a staff.
- Crear un middleware genérico: Sobreingeniería para un solo caso de uso.

## R3: Consulta de personal activo por sector

**Decision**: Reutilizar y extender `getSectorStaffAction()` existente en `src/features/sector/api/sector-staff-actions.ts`.

**Rationale**:
- Ya existe una action que hace exactamente esto: dado un `sectorId`, `date`, `startTime`, `endTime`, devuelve shifts agrupados por área con datos de usuario y tipo de turno.
- Solo necesita: (1) permitir acceso a STAFF (actualmente requiere ADMIN/CHIEF), (2) agregar lógica de detección de relevos.
- La detección de relevos es lógica cliente/servidor liviana: ordenar turnos por área y hora, detectar gaps <30min entre fin de uno e inicio de otro en la misma área.

**Alternatives considered**:
- Query directa desde el cliente: Rechazado por seguridad (expone IDs de otros usuarios) y performance.
- Nueva action separada: Innecesario si `getSectorStaffAction` se puede adaptar con permisos adicionales.

## R4: Detección de relevos

**Decision**: Implementar como función pura `detectRelays()` en `src/features/staff-dashboard/lib/relay-detection.ts`.

**Rationale**:
- Algoritmo: para cada área, ordenar turnos por `startTime`. Si `shift[n].endTime` y `shift[n+1].startTime` difieren en <=30 minutos, marcar como relevo.
- Se ejecuta en el servidor después de obtener los turnos del sector, antes de enviar al cliente.
- Devuelve la lista de turnos con campo adicional `relay?: { previousUserId, previousUserName }` o `relayTo?: { nextUserId, nextUserName }`.

**Alternatives considered**:
- Detección en el cliente: Rechazado; requiere enviar todos los turnos al cliente y computar allí. Más datos transferidos y lógica duplicable.
- Campo en la BD: Sobreingeniería; los relevos son derivados, no datos persistentes.

## R5: Generación iCal (.ics) y feed de suscripción

**Decision**: Usar la librería `ical-generator` para generar contenido iCalendar. Exponer via Route Handler en `app/[locale]/dashboard/api/ical/[token]/route.ts`.

**Rationale**:
- `ical-generator` es la librería más mantenida para Node.js (>1M descargas/semana, última versión 2025).
- Soporta VTIMEZONE, VEVENT con DTSTART/DTEND, UID, SUMMARY, DESCRIPTION, LOCATION.
- El Route Handler es necesario porque los clientes de calendario hacen GET a una URL. Server Actions solo soportan POST.
- Token en la URL: cada feed tiene un token criptográficamente seguro (crypto.randomUUID() o similar). El Route Handler valida el token contra `CalendarFeedToken` en BD.
- Content-Type: `text/calendar; charset=utf-8`.
- Cache-Control: `no-cache` para que Google Calendar siempre obtenga la versión más reciente.

**Feed types**:
- Per-org feed: Token vinculado a `userId + organizationId`. Query filtra por ambos.
- Unified feed: Token vinculado solo a `userId`. Query busca turnos del usuario en TODAS las orgs.
- Ambos feeds excluyen turnos CANCELLED y NO_SHOW.
- Rango temporal del feed: turnos desde 3 meses atrás hasta todos los futuros.

**Alternatives considered**:
- Generar .ics manualmente con template strings: Rechazado; RFC 5545 tiene reglas complejas de encoding, line folding, timezone, y UID uniqueness.
- Usar API Route legacy (pages/api): Rechazado; el proyecto usa App Router.

## R6: Google Calendar OAuth (P5 - diferible)

**Decision**: Usar `googleapis` npm package con OAuth 2.0. Almacenar tokens en nuevo modelo `GoogleCalendarConnection`.

**Rationale**:
- Scopes necesarios: `https://www.googleapis.com/auth/calendar.readonly` (solo lectura).
- Flujo: (1) Usuario click "Conectar" → redirect a Google consent → callback con auth code → exchange por tokens → almacenar en BD.
- Refresh tokens: almacenados encriptados. Se renuevan automáticamente cuando expiran.
- Import: al cargar el dashboard, si hay conexión activa, fetch eventos del mes vía Google Calendar API y merge con turnos locales.
- Detección de conflictos: comparar `event.start/end` con `shift.startTime/endTime`. Overlap = conflicto visual.

**Alternatives considered**:
- CalDAV directamente: Más complejo y menos soportado que la REST API de Google.
- Solo .ics import (sin OAuth): No permite sincronización automática ni lectura de eventos futuros.

**Note**: Esta funcionalidad es P5 y puede diferirse a una iteración posterior. El plan la incluye pero no bloquea P1-P4.

## R7: Modelo de tokens para feed iCal

**Decision**: Nuevo modelo `CalendarFeedToken` en Prisma con token único por tipo de feed (per-org, unified).

**Rationale**:
- Token generado con `crypto.randomUUID()` (128 bits, criptográficamente seguro).
- Modelo soporta múltiples tokens por usuario: uno per-org (por cada org) + uno unified.
- El usuario puede regenerar tokens (invalida URLs anteriores).
- Token no expira por defecto (los feeds iCal deben ser persistentes). Se puede revocar manualmente.
- Si el usuario es eliminado, cascade delete elimina tokens.

**Alternatives considered**:
- JWT firmado en la URL: Más complejo, requiere verificación de firma, y las URLs se vuelven muy largas.
- API key en header: Los clientes de calendario no soportan headers custom en suscripciones.
