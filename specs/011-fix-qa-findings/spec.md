# Feature Specification: Corrección de Findings QA Happy Path

**Feature Branch**: `011-fix-qa-findings`
**Created**: 2026-03-10
**Status**: Draft
**Input**: Corregir todos los findings del QA happy path: deuda técnica, mejoras UX, features faltantes

## Context

Durante el QA Happy Path E2E (FASE 0-12) de la organización "Clínica Ejemplo Santiago" (112 usuarios, 2 sectores, 6 áreas, 7 rotativas, 1354 turnos, 110 documentos de nómina), se identificaron:

- **6 bugs** (todos ya corregidos en branch `010-qa-happy-path-e2e`)
- **5 items de deuda técnica**
- **8 mejoras UX** pendientes
- **1 feature faltante** (Shift Swap UI)

Esta especificación cubre todo lo pendiente que NO fue corregido durante el QA.

## Clarifications

### Session 2026-03-10

- Q: Granularidad de completar turnos (individual, lote por día, lote por rango, auto-completar) → A: Lote por día — el CHIEF puede completar todos los turnos de un día en una acción, con opción de excluir turnos individuales antes de confirmar.
- Q: Generación masiva de turnos — todas las rotativas o seleccionables → A: Seleccionables con todas pre-marcadas — se muestra un checklist con todas las rotativas activas marcadas por defecto, el usuario puede desmarcar las que no desea generar.
- Q: Turnos pasados sin completar — qué pasa con SCHEDULED cuya fecha ya pasó → A: Alerta con acción — el dashboard del CHIEF muestra un aviso "X turnos pendientes de completar" con acceso directo a completarlos en lote por día.
- Q: CHIEF_SECTOR vs CHIEF_AREA — diferencia funcional → A: Mismo rol (CHIEF_AREA), pero un jefe con UserSector tiene acceso expandido a TODAS las áreas de sus sectores (via SectorArea), mientras que un jefe de área solo ve sus áreas asignadas (via UserArea). La lógica de acceso ya está implementada en `chief-access.ts`. Solo se elimina el enum muerto y se mejora la UI.

## User Scenarios & Testing

### User Story 1 — Unificación de CHIEF_SECTOR en CHIEF_AREA con acceso por sector (Priority: P1)

El rol `CHIEF_SECTOR` existe en el schema de Prisma y es referenciado en ~20 archivos, pero nunca se asigna a ningún usuario real. Todos los jefes tienen rol `CHIEF_AREA`. La diferencia funcional es que un CHIEF_AREA con registros en `UserSector` tiene **acceso expandido** a todas las áreas de sus sectores (via tabla `SectorArea`), mientras que un CHIEF_AREA sin UserSector solo ve sus áreas asignadas directamente (via `UserArea`). Esta lógica de acceso ya está correctamente implementada en `src/shared/lib/auth/chief-access.ts`.

El problema es que el enum `CHIEF_SECTOR` en `Role` genera confusión: se muestra como tarjeta separada en límites de ADMIN_HR (10+10=20 slots aparentes cuando en realidad comparten `maxChiefs=10`), y el sidebar usa un `displayRole` override innecesario.

La solución: eliminar `CHIEF_SECTOR` del enum, mantener `UserSector` como mecanismo de acceso expandido, mostrar un badge visual "Sector: [nombre]" para jefes con sector, y unificar la tarjeta de límites. La lógica de `chief-access.ts` no requiere cambios.

**Why this priority**: Elimina confusión en la UI y complejidad innecesaria en RBAC/auth. La funcionalidad real (acceso expandido por sector) ya funciona correctamente y se preserva intacta.

**Independent Test**: Verificar que: (1) el schema no contiene CHIEF_SECTOR, (2) los CHIEF_AREA con UserSector siguen accediendo a todas las áreas del sector, (3) el sidebar muestra badge "Sector" en vez de displayRole override, (4) la tarjeta de límites muestra un solo conteo "Jefes", (5) la app compila sin errores.

**Acceptance Scenarios**:

1. **Given** un CHIEF_AREA con registros en UserSector (ej: sector "UCI"), **When** accede al dashboard, **Then** ve su rol como "Jefe de Área" con un badge "Sector: UCI" y puede ver el staff de TODAS las áreas dentro del sector UCI (Enfermería UCI, Médicos UCI, Nutricionistas).
2. **Given** un CHIEF_AREA sin registros en UserSector, **When** accede al dashboard, **Then** ve solo "Jefe de Área" sin badge de sector, y solo accede a sus áreas asignadas directamente.
3. **Given** un ADMIN_HR en el dashboard, **When** ve la sección de límites, **Then** ve una sola tarjeta "Jefes" con el conteo combinado (8/10) en vez de dos tarjetas separadas.
4. **Given** el codebase, **When** se busca `CHIEF_SECTOR` en el código, **Then** no aparece en el enum Role de Prisma, ni en funciones RBAC, ni en constantes de roles.
5. **Given** invitaciones existentes de tipo CHIEF, **When** ADMIN_HR invita un nuevo jefe, **Then** el formulario solo muestra "Jefe de Área".

---

### User Story 2 — Generación masiva de turnos para rotativas (Priority: P2)

Actualmente generar turnos para 7 rotativas requiere abrir cada una individualmente, seleccionar fechas en un date picker y confirmar — un proceso de ~15-20 minutos. Se necesita un botón "Generar turnos masivo" que permita generar turnos para todas las rotativas activas en una sola acción.

**Why this priority**: Impacto directo en la eficiencia del ADMIN_HR/CHIEF que gestiona rotativas. Es la mejora UX más solicitada y con mayor ahorro de tiempo.

**Independent Test**: Verificar que un ADMIN_HR puede seleccionar un rango de fechas una vez y generar turnos para todas las rotativas activas de la organización, recibiendo un resumen consolidado con conteo de turnos por rotativa.

**Acceptance Scenarios**:

1. **Given** una organización con 7 rotativas activas, **When** el ADMIN_HR hace clic en "Generar turnos masivo", **Then** se muestra un dialog con un checklist de rotativas (todas pre-marcadas) y un selector de rango de fechas. Al confirmar, se generan turnos para las rotativas seleccionadas y se muestra un resumen con turnos generados por rotativa.
2. **Given** el proceso de generación masiva en curso, **When** alguna rotativa falla (ej: conflicto de fechas), **Then** las demás rotativas se procesan correctamente y se muestra qué rotativas fallaron con el motivo.
3. **Given** rotativas con diferentes estados (activas e inactivas), **When** se ejecuta la generación masiva, **Then** solo se procesan las rotativas con estado ACTIVE.

---

### User Story 3 — Barra de progreso en generación de nómina (Priority: P2)

Al generar nómina para ~110 empleados (proceso que toma ~2 minutos), el usuario solo ve "Generando documentos..." sin indicación de progreso. Se necesita una barra de progreso en tiempo real mostrando cuántos documentos se han generado (ej: "42/110 documentos generados").

**Why this priority**: Genera ansiedad en el usuario por la falta de feedback durante un proceso largo. Impacta la percepción de confiabilidad del sistema.

**Independent Test**: Verificar que durante la generación de nómina el usuario ve un contador actualizado en tiempo real que muestra documentos procesados vs total.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR iniciando generación de nómina para 110 empleados, **When** el proceso está en curso, **Then** se muestra una barra de progreso con el formato "X/110 documentos generados" que se actualiza conforme avanza.
2. **Given** la generación en curso, **When** se completa exitosamente, **Then** la barra muestra 110/110 y transiciona al estado "Completado" con el resumen final.
3. **Given** la generación en curso, **When** ocurre un error en algún documento, **Then** el progreso continúa mostrando el conteo y al final se indica cuántos documentos tuvieron error.

---

### User Story 4 — Flujo de completar turnos y pagos por turno (Priority: P3)

Los turnos generados por rotativas quedan en estado SCHEDULED, pero el sistema de nómina espera turnos COMPLETED con ShiftPayment asociado para calcular `shiftsAmount`. Actualmente `shiftsAmount=$0` para todos los empleados porque no existe flujo para marcar turnos como completados ni crear los registros de pago por turno.

**Why this priority**: Sin este flujo, la nómina solo calcula salario base y componentes mensuales — el cálculo de turnos (componente variable) queda en $0. Es un workflow gap que afecta la precisión del pago.

**Independent Test**: Verificar que un CHIEF_AREA puede marcar turnos como COMPLETED y que al generar nómina, `shiftsAmount` refleja los turnos completados multiplicados por los componentes de tarifa correspondientes.

**Acceptance Scenarios**:

1. **Given** turnos SCHEDULED de un día pasado, **When** un CHIEF_AREA selecciona "Completar día" en el calendario, **Then** se muestra una lista con todos los turnos del día preseleccionados, permitiendo excluir individuales antes de confirmar.
2. **Given** el CHIEF confirma el lote de turnos a completar, **When** se procesan, **Then** cada turno cambia a COMPLETED y se crea un ShiftPayment por turno con el cálculo de componentes de tarifa del contrato del usuario.
3. **Given** turnos con ShiftPayment generados, **When** se genera la nómina del período, **Then** `shiftsAmount` del documento refleja la suma de los ShiftPayments del período.
4. **Given** un turno ya COMPLETED en el lote, **When** el sistema procesa el día, **Then** lo excluye automáticamente del lote (no duplica).
5. **Given** un CHIEF_AREA, **When** ve el calendario de turnos, **Then** puede distinguir visualmente entre turnos SCHEDULED (pendientes) y COMPLETED (completados).
6. **Given** turnos SCHEDULED cuya fecha ya pasó, **When** el CHIEF_AREA accede a su dashboard, **Then** ve un aviso "X turnos pendientes de completar" con un enlace directo para procesarlos en lote por día.

---

### User Story 5 — Mejoras UX en rotativas y tarifas (Priority: P3)

Tres mejoras relacionadas con la gestión de rotativas y tarifas:
- **Date picker**: Al seleccionar fecha de inicio en el dialog de generar turnos, el calendario salta automáticamente al mes siguiente — desorientador.
- **Indicador de cobertura en lista**: Actualmente la cobertura solo se ve al entrar al detalle de una rotativa. Agregar un badge/indicador en la lista principal.
- **Conteo de componentes por tarifa**: En la lista de tarifas no se ve cuántos componentes tiene cada una sin entrar al detalle.

**Why this priority**: Mejoras de conveniencia que reducen clics y tiempo de navegación. No bloquean funcionalidad.

**Independent Test**: Verificar que (1) el date picker mantiene el mes seleccionado sin saltar, (2) cada rotativa en la lista muestra un indicador de cobertura, (3) cada tarifa en la lista muestra el conteo de componentes.

**Acceptance Scenarios**:

1. **Given** el dialog de generar turnos de una rotativa, **When** el usuario selecciona una fecha de inicio, **Then** el calendario permanece en el mes seleccionado sin saltar al mes siguiente.
2. **Given** la lista de rotativas activas, **When** se renderiza, **Then** cada fila muestra un badge con el porcentaje de cobertura (ej: "85% cobertura").
3. **Given** la lista de tarifas, **When** se renderiza, **Then** cada fila muestra un badge con el número de componentes (ej: "3 componentes").

---

### User Story 6 — Distinción visual Jefe de Sector vs Jefe de Área (Priority: P3)

En la tabla de jefes del dashboard ADMIN_HR no hay forma visual de distinguir un jefe que gestiona un sector de uno que solo gestiona áreas. Post-eliminación de CHIEF_SECTOR (US1), los CHIEF_AREA con UserSector necesitan un badge o indicador visual.

**Why this priority**: Depende de US1. Mejora informativa sin impacto funcional.

**Independent Test**: Verificar que en la tabla de jefes, los que tienen UserSector muestran un badge "Sector" junto a su nombre o rol.

**Acceptance Scenarios**:

1. **Given** la tabla de personal con jefes, **When** un jefe tiene registros en UserSector, **Then** se muestra un badge "Sector" junto a su rol.
2. **Given** la tabla de personal con jefes, **When** un jefe NO tiene registros en UserSector, **Then** se muestra solo "Jefe de Área" sin badge adicional.

---

### User Story 7 — Conteo correcto de personal por área (Priority: P2)

La vista de staff de un CHIEF muestra 16 personas para Nutricionistas cuando en realidad hay 12 STAFF. Los 4 adicionales son CHIEF_AREA cross-linked al área. El conteo debería distinguir o al menos clarificar la composición.

**Why this priority**: Confunde a los jefes de área sobre la dotación real de personal vs jefes asignados al área.

**Independent Test**: Verificar que la vista de staff de un CHIEF muestra por separado el conteo de STAFF (12) y CHIEF (4) del área, o al menos el total (16) con un desglose visible.

**Acceptance Scenarios**:

1. **Given** un CHIEF viendo la lista de personal de un área con 12 STAFF y 4 CHIEFs cross-linked, **When** la página carga, **Then** el encabezado muestra "16 personas" con un desglose visible (ej: "12 personal + 4 jefes") o filtros para distinguir.
2. **Given** la vista de personal con filtro, **When** el CHIEF filtra por "Solo STAFF", **Then** ve solo 12 registros.

---

### User Story 8 — Shift Swap UI (Priority: P4)

Las entidades backend para intercambio de turnos existen parcialmente (`swap-repository`, `swap-validation`, `swap-types`) pero no hay Server Actions, componentes UI ni rutas en la app. Se necesita implementar el flujo completo.

**Why this priority**: Feature nueva completa. Menor prioridad que correcciones y mejoras a features existentes, pero necesaria para completar el producto.

**Independent Test**: Verificar que un STAFF puede solicitar intercambio de turno, otro STAFF puede aceptar/rechazar, y un CHIEF puede aprobar el intercambio.

**Acceptance Scenarios**:

1. **Given** un STAFF con un turno asignado, **When** hace clic en un turno del calendario, **Then** ve la opción "Solicitar intercambio".
2. **Given** una solicitud de intercambio creada, **When** otro STAFF del mismo área revisa sus notificaciones, **Then** puede ver la solicitud y aceptar/rechazar.
3. **Given** un intercambio aceptado por ambas partes, **When** el CHIEF del área revisa solicitudes, **Then** puede aprobar o denegar el intercambio.
4. **Given** un intercambio aprobado por el CHIEF, **When** se completa el flujo, **Then** los turnos se intercambian en el calendario y ambos STAFF reciben notificación de confirmación.

---

### Edge Cases

- **CHIEF_SECTOR removal**: Migración de datos — los 3 registros UserSector existentes deben mantenerse (solo se elimina la referencia al enum CHIEF_SECTOR, no la tabla UserSector).
- **Generación masiva de turnos**: Si una rotativa ya tiene turnos en el rango seleccionado, debe informar la superposición sin generar duplicados.
- **Shift completion**: Un turno CANCELLED no puede marcarse como COMPLETED.
- **Shift Swap**: No se puede intercambiar un turno que ya pasó (fecha < hoy). No se puede intercambiar con un turno de otra área.
- **Payroll progress**: Si el navegador se cierra durante la generación, al volver el estado debe reflejar correctamente el progreso actual.

## Requirements

### Functional Requirements

- **FR-001**: El sistema DEBE eliminar `CHIEF_SECTOR` del enum `Role` de Prisma y de todas las referencias en código (RBAC, constantes, auth guards, sidebar, conteos), preservando la funcionalidad de acceso expandido por sector que ya está implementada en `chief-access.ts`.
- **FR-002**: El sistema DEBE mantener la tabla `UserSector` como mecanismo de acceso expandido: un CHIEF_AREA con UserSector accede a todas las áreas del sector (via SectorArea). La UI DEBE mostrar un badge "Sector: [nombre]" para estos jefes.
- **FR-003**: El sistema DEBE unificar las tarjetas de límites de jefes en el dashboard ADMIN_HR en una sola ("Jefes") con el conteo combinado.
- **FR-004**: El sistema DEBE proveer un botón "Generar turnos masivo" en la página de rotativas que muestre un checklist de rotativas activas (todas pre-marcadas), permita desmarcar las no deseadas, y procese las seleccionadas con un solo rango de fechas.
- **FR-005**: El sistema DEBE mostrar progreso en tiempo real durante la generación de nómina (documentos procesados / total).
- **FR-006**: El sistema DEBE permitir a un CHIEF_AREA completar turnos en lote por día (todos los turnos de un día seleccionado), con opción de excluir turnos individuales antes de confirmar, creando un ShiftPayment por cada turno completado.
- **FR-007**: El sistema DEBE calcular `shiftsAmount` en la nómina basándose en ShiftPayments del período.
- **FR-015**: El dashboard del CHIEF DEBE mostrar una alerta "X turnos pendientes de completar" cuando existan turnos SCHEDULED cuya fecha ya pasó, con acceso directo para completarlos en lote.
- **FR-008**: El date picker de generación de turnos DEBE mantener el mes visible al seleccionar la fecha de inicio.
- **FR-009**: La lista de rotativas DEBE mostrar un indicador de cobertura por rotativa.
- **FR-010**: La lista de tarifas DEBE mostrar el conteo de componentes por tarifa.
- **FR-011**: Las tablas de personal DEBEN distinguir visualmente a los jefes con asignación de sector.
- **FR-012**: La vista de staff de un CHIEF DEBE mostrar un desglose del conteo entre STAFF y otros CHIEFs del área.
- **FR-013**: El sistema DEBE implementar el flujo completo de Shift Swap: solicitar, aceptar/rechazar, aprobar por CHIEF.
- **FR-014**: Cada paso del flujo de Shift Swap DEBE generar una notificación al usuario correspondiente.

### Key Entities

- **ShiftPayment**: Registro de pago por turno completado. Vincula Shift + Contract + componentes de tarifa calculados. Se crea al marcar un turno como COMPLETED.
- **SwapRequest**: Solicitud de intercambio de turno. Estados: PENDING → ACCEPTED/REJECTED → APPROVED/DENIED. Referencia dos Shifts y dos Users.
- **UserSector** (existente): Se mantiene como mecanismo de acceso expandido para CHIEF_AREA. Un jefe con UserSector accede a todas las áreas de sus sectores via SectorArea. La lógica de `chief-access.ts` (getChiefAccessibleAreaIds, chiefHasAreaAccess) ya implementa esto correctamente y no requiere cambios.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El 100% de las referencias a CHIEF_SECTOR son eliminadas del código y la app compila sin errores.
- **SC-002**: Un ADMIN_HR puede generar turnos para todas las rotativas activas en menos de 2 minutos (vs 15-20 minutos actual).
- **SC-003**: Durante la generación de nómina, el usuario puede ver el progreso actualizado cada 5 segundos como máximo.
- **SC-004**: El `shiftsAmount` en documentos de nómina refleja correctamente los turnos COMPLETED del período.
- **SC-005**: Un STAFF puede completar un flujo de intercambio de turno (solicitar → aceptar → aprobar) en menos de 5 minutos.
- **SC-006**: La vista de personal para un CHIEF distingue claramente la composición del equipo (STAFF vs otros CHIEFs).
- **SC-007**: La lista de rotativas y tarifas muestra metadata adicional (cobertura y componentes) sin necesidad de entrar al detalle.

## Assumptions

- Los 6 bugs encontrados durante el QA ya están corregidos (billingDay, shift count, payroll visibility x2, area count, personal count) y no requieren trabajo adicional.
- La tabla `UserSector` se mantiene post-eliminación de CHIEF_SECTOR — solo se elimina el enum value y las funciones RBAC asociadas.
- La migración de Prisma para eliminar CHIEF_SECTOR del enum requerirá verificar que no existen registros con ese valor en la BD antes de migrar.
- El progreso de nómina usará Server-Sent Events o polling corto, no WebSockets (alineado con la arquitectura actual de Server Actions).
- Shift Swap reutilizará las entidades backend parciales existentes en `src/entities/swap/`.
