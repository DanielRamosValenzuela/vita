# Tasks: Intercambio de Turnos y Turnos Extra

> Referencia: `docs/PLAN-SHIFT-SWAP-AND-EXTRA.md`
> Branch: `006-payroll-billing-pdf`

---

## Fase 1 — Modelo de datos y migraciones

### T001: Crear enums para ShiftSwapRequest
- [ ] Agregar `SwapRequestType` (DIRECT, OPEN)
- [ ] Agregar `SwapRequestStatus` (PENDING_PEER, PENDING_SELECTION, PENDING_CHIEF, APPROVED, REJECTED_BY_PEER, REJECTED_BY_CHIEF, CANCELLED, EXPIRED)
- [ ] Agregar `SwapOfferStatus` (PENDING, ACCEPTED, REJECTED, WITHDRAWN)
- [ ] Agregar `ShiftCoverageStatus` (ASSIGNED, NEEDS_COVERAGE, OPEN_FOR_APPLICATIONS)
- **Archivo:** `prisma/schema.prisma`

### T002: Crear modelo ShiftSwapRequest
- [ ] Modelo con todos los campos definidos en el plan (sección 2.1)
- [ ] Relaciones: Organization, User (requester, target, chief), Shift (requester, target), Area, Offers
- [ ] Índices: organizationId, requesterId, targetUserId, areaId, status
- **Archivo:** `prisma/schema.prisma`

### T003: Crear modelo ShiftSwapOffer
- [ ] Modelo con todos los campos definidos en el plan (sección 2.1)
- [ ] Unique constraint: [swapRequestId, offererId]
- [ ] onDelete: Cascade desde SwapRequest
- **Archivo:** `prisma/schema.prisma`

### T004: Crear modelo ShiftApplication (turnos extra)
- [ ] Modelo con campos definidos en el plan (sección 2.2)
- [ ] Unique constraint: [shiftId, userId]
- **Archivo:** `prisma/schema.prisma`

### T005: Extender modelo Shift
- [ ] Agregar campo `coverageStatus ShiftCoverageStatus @default(ASSIGNED)`
- [ ] Agregar relaciones inversas: swapRequestsAsRequester, swapRequestsAsTarget, swapOffers, applications
- **Archivo:** `prisma/schema.prisma`

### T006: Extender modelo User
- [ ] Agregar relaciones inversas: swapRequestsAsRequester, swapRequestsAsTarget, swapRequestsAsChief, swapOffers, shiftApplications
- **Archivo:** `prisma/schema.prisma`

### T007: Agregar nuevos NotificationType
- [ ] SWAP_REQUESTED, SWAP_OPEN_PUBLISHED, SWAP_OFFER_RECEIVED, SWAP_PEER_ACCEPTED, SWAP_APPROVED, SWAP_REJECTED
- [ ] EXTRA_SHIFT_AVAILABLE, EXTRA_SHIFT_APPLIED, EXTRA_SHIFT_APPROVED
- **Archivo:** `prisma/schema.prisma`

### T008: Aplicar migración
- [ ] `npx prisma generate`
- [ ] `npx prisma db push` o crear migración con `prisma migrate dev`
- **Dependencia:** T001-T007

---

## Fase 2 — Entity layer + validaciones

### T009: Crear entity `swap` — tipos
- [ ] Crear `src/entities/swap/types/swap-types.ts`
- [ ] Tipos: `SwapRequestWithRelations`, `SwapOfferWithRelations`, `SwapRequestFilters`
- [ ] Exportar desde `src/entities/swap/index.ts`

### T010: Crear entity `swap` — repositorio
- [ ] Crear `src/entities/swap/lib/swap-repository.ts`
- [ ] Funciones: `createSwapRequest`, `getSwapRequestById`, `getSwapRequestsForUser`, `getSwapRequestsForArea`, `getPendingSwapsForChief`, `updateSwapRequestStatus`
- [ ] Funciones de ofertas: `createSwapOffer`, `getOffersForRequest`, `updateOfferStatus`
- **Dependencia:** T008, T009

### T011: Crear entity `swap` — validaciones
- [ ] Crear `src/entities/swap/lib/swap-validation.ts`
- [ ] `validateSwapEligibility(shiftId)`: turno SCHEDULED, no en otro swap activo, >= 24h antes
- [ ] `validateSameArea(shiftA, shiftB)`: ambos en la misma área
- [ ] `validateNoConflict(userId, shift)`: usuario no tiene turno que solape
- [ ] `canUserSwapInArea(userId, areaId)`: usuario pertenece al área
- **Dependencia:** T008

### T012: Crear entity para ShiftApplication
- [ ] Crear `src/entities/shift-application/lib/application-repository.ts`
- [ ] Funciones: `createApplication`, `getApplicationsForShift`, `getApplicationsByUser`, `updateApplicationStatus`
- [ ] Crear `src/entities/shift-application/types/application-types.ts`
- **Dependencia:** T008

---

## Fase 3 — Server Actions: Swap Directo

### T013: Crear `swap-actions.ts` — solicitud directa
- [ ] Crear `src/features/shift-swap/api/swap-actions.ts`
- [ ] `createDirectSwapAction(requesterShiftId, targetShiftId, reason?)`: valida, crea request, notifica Staff B
- [ ] Auth guard: `requireDashboardUser` + verificar que es STAFF o CHIEF_AREA
- [ ] Multi-tenant: filtrar por organizationId
- **Dependencia:** T010, T011

### T014: Crear `swap-actions.ts` — respuesta del peer
- [ ] `respondToSwapAction(requestId, accept: boolean)`: Staff B acepta o rechaza
- [ ] Si acepta: status → PENDING_CHIEF, notificar CHIEF del área
- [ ] Si rechaza: status → REJECTED_BY_PEER, notificar Staff A
- **Dependencia:** T013

### T015: Crear `swap-chief-actions.ts` — aprobación del CHIEF
- [ ] Crear `src/features/shift-swap/api/swap-chief-actions.ts`
- [ ] `reviewSwapAction(requestId, approve: boolean, note?)`: CHIEF aprueba o rechaza
- [ ] Si aprueba: ejecutar swap (intercambiar userId entre shifts), status → APPROVED
- [ ] Si rechaza: status → REJECTED_BY_CHIEF
- [ ] Auth guard: `requireAdminHROrChief` + verificar acceso al área
- **Dependencia:** T013

### T016: Crear `swap-execution.ts` — ejecución del intercambio
- [ ] Crear `src/features/shift-swap/lib/swap-execution.ts`
- [ ] `executeSwap(request)`: transacción Prisma que intercambia userId de ambos shifts
- [ ] Revalidar paths del calendario de ambos usuarios
- **Dependencia:** T010

### T017: Crear `swap-actions.ts` — cancelación
- [ ] `cancelSwapAction(requestId)`: solo el solicitante, solo antes de APPROVED
- [ ] Status → CANCELLED, notificar partes involucradas
- **Dependencia:** T013

### T018: Crear `swap-queries.ts` — consultas
- [ ] Crear `src/features/shift-swap/api/swap-queries.ts`
- [ ] `getMySwapRequestsAction(filters?)`: mis solicitudes enviadas y recibidas
- [ ] `getPendingActionsAction()`: swaps que requieren MI acción (como peer o chief)
- [ ] `getSwapDetailAction(requestId)`: detalle completo de un swap
- [ ] `getAvailableShiftsForSwapAction(areaId, excludeUserId)`: turnos de compañeros para swap directo
- **Dependencia:** T010

---

## Fase 4 — Server Actions: Publicación Abierta

### T019: Crear `swap-actions.ts` — publicación abierta
- [ ] `createOpenSwapAction(requesterShiftId, reason?, expiresInDays?)`: crea request type=OPEN
- [ ] Notifica staff del área (SWAP_OPEN_PUBLISHED)
- **Dependencia:** T013

### T020: Crear `swap-offer-actions.ts`
- [ ] Crear `src/features/shift-swap/api/swap-offer-actions.ts`
- [ ] `createSwapOfferAction(swapRequestId, offeredShiftId, note?)`: Staff oferta turno
- [ ] `withdrawSwapOfferAction(offerId)`: Retirar oferta
- [ ] `selectSwapOfferAction(offerId)`: Staff A elige oferta → status PENDING_CHIEF
- [ ] Validaciones: misma área, turno elegible, una oferta por usuario por request
- **Dependencia:** T010, T011

### T021: Crear lógica de expiración
- [ ] Crear `src/features/shift-swap/lib/swap-expiration.ts`
- [ ] `expireOldSwapRequests()`: marca como EXPIRED los OPEN que pasaron su expiresAt
- [ ] Puede ejecutarse vía cron o al cargar la lista de swaps (lazy expiration)
- **Dependencia:** T010

---

## Fase 5 — Server Actions: Turnos Extra

### T022: Crear `extra-shift-actions.ts` — publicar turno extra
- [ ] Crear `src/features/extra-shifts/api/extra-shift-actions.ts`
- [ ] `publishExtraShiftAction(shiftId)`: CHIEF marca turno como OPEN_FOR_APPLICATIONS
- [ ] `createOpenShiftAction(data)`: CHIEF crea turno nuevo sin userId + OPEN_FOR_APPLICATIONS
- [ ] Notificar staff del área (EXTRA_SHIFT_AVAILABLE)
- [ ] Auth guard: `requireAdminHROrChief`
- **Dependencia:** T008, T012

### T023: Crear `application-actions.ts` — postulaciones
- [ ] Crear `src/features/extra-shifts/api/application-actions.ts`
- [ ] `applyToExtraShiftAction(shiftId, note?)`: Staff se postula
- [ ] `withdrawApplicationAction(applicationId)`: Staff retira postulación
- [ ] Validaciones: misma área, sin conflicto de horario, >= 24h
- [ ] Notificar CHIEF (EXTRA_SHIFT_APPLIED)
- **Dependencia:** T012

### T024: Crear `application-actions.ts` — aprobación
- [ ] `approveApplicationAction(applicationId)`: CHIEF aprueba → asigna userId al shift
- [ ] Rechaza otras postulaciones automáticamente
- [ ] Notificar staff aprobado (EXTRA_SHIFT_APPROVED)
- [ ] Auth guard: `requireAdminHROrChief`
- **Dependencia:** T023

### T025: Crear queries de turnos extra
- [ ] `getExtraShiftsForAreaAction(areaId)`: turnos abiertos en un área
- [ ] `getMyApplicationsAction()`: mis postulaciones
- [ ] `getApplicationsForShiftAction(shiftId)`: postulaciones a un turno (CHIEF)
- **Dependencia:** T012

---

## Fase 6 — UI: Page de Solicitudes

### T026: Crear ruta `/dashboard/requests`
- [ ] Crear `app/[locale]/dashboard/requests/page.tsx`
- [ ] Crear `app/[locale]/dashboard/requests/loading.tsx`
- [ ] Auth: redirigir SUPER_ADMIN, permitir STAFF + CHIEF_AREA + ADMIN_HR
- **Dependencia:** ninguna (puede crearse en paralelo)

### T027: Crear `requests-page.tsx` — componente principal
- [ ] Crear `src/features/requests-dashboard/ui/requests-page.tsx`
- [ ] Tabs: "Intercambios" | "Turnos Extra" | "Aprobaciones" (solo CHIEF)
- [ ] Estado de tab activo, integración con URL search params
- **Dependencia:** T026

### T028: Crear `swap-list.tsx` — lista de intercambios
- [ ] Crear `src/features/shift-swap/ui/swap-list.tsx`
- [ ] Lista de SwapRequests con filtros: Enviadas, Recibidas, Abiertas (del área)
- [ ] Cards con: turno origen → turno destino, estado, fecha, acciones
- [ ] Empty state diferenciado por filtro
- **Dependencia:** T018, T027

### T029: Crear `swap-detail-panel.tsx`
- [ ] Crear `src/features/shift-swap/ui/swap-detail-panel.tsx`
- [ ] Sheet/Panel con detalle completo del swap
- [ ] Muestra ambos turnos, timeline de estados, ofertas (si OPEN)
- [ ] Botones de acción según rol y estado: Aceptar/Rechazar (peer), Aprobar/Rechazar (CHIEF), Cancelar (requester)
- **Dependencia:** T018

### T030: Crear formulario de swap directo
- [ ] Crear `src/features/shift-swap/ui/swap-request-form.tsx`
- [ ] Dialog/Sheet: muestra turno del usuario + selector de turno destino
- [ ] Lista de turnos de compañeros del área (próximos 30 días), con búsqueda por nombre
- [ ] Campo de motivo (opcional)
- [ ] Validación client-side: 24h, misma área
- **Dependencia:** T013, T018

### T031: Crear formulario de publicación abierta
- [ ] Crear `src/features/shift-swap/ui/open-swap-form.tsx`
- [ ] Dialog simple: muestra turno seleccionado + campo motivo + confirmar
- **Dependencia:** T019

### T032: Crear formulario de oferta
- [ ] Crear `src/features/shift-swap/ui/swap-offer-form.tsx`
- [ ] Dialog: selector de MIS turnos disponibles para ofertar
- [ ] Campo nota opcional
- **Dependencia:** T020

### T033: Crear vista de revisión CHIEF
- [ ] Crear `src/features/shift-swap/ui/swap-chief-review.tsx`
- [ ] Tab "Aprobaciones" con lista de swaps PENDING_CHIEF
- [ ] Detalle: ambos turnos lado a lado, ambos staff, info de cobertura
- [ ] Botones Aprobar (con confirmación) / Rechazar (con nota obligatoria)
- **Dependencia:** T015, T029

---

## Fase 7 — UI: Turnos Extra

### T034: Crear `extra-shift-list.tsx`
- [ ] Crear `src/features/extra-shifts/ui/extra-shift-list.tsx`
- [ ] Lista de turnos con coverageStatus = OPEN_FOR_APPLICATIONS en mis áreas
- [ ] Card: tipo de turno, fecha/hora, área, número de postulantes
- [ ] Botón "Postularme" → abre dialog de confirmación
- **Dependencia:** T025, T027

### T035: Crear `application-form.tsx`
- [ ] Crear `src/features/extra-shifts/ui/application-form.tsx`
- [ ] Dialog de confirmación: detalle del turno + campo nota + validación de conflictos
- **Dependencia:** T023

### T036: Crear `applications-review.tsx` (CHIEF)
- [ ] Crear `src/features/extra-shifts/ui/applications-review.tsx`
- [ ] Lista de turnos extra con postulaciones pendientes
- [ ] Por cada turno: lista de postulantes con botón Aprobar
- [ ] Al aprobar uno, los demás se rechazan automáticamente
- **Dependencia:** T024, T025

---

## Fase 8 — Integración con calendario y sidebar

### T037: Integrar botón "Solicitar intercambio" en ShiftDetailPanel
- [ ] Modificar `src/features/staff-dashboard/ui/shift-detail-panel.tsx`
- [ ] Agregar botón que abre dialog con opciones: "Swap directo" | "Publicar para intercambio"
- [ ] Solo visible para turnos propios, SCHEDULED, >= 24h
- **Dependencia:** T030, T031

### T038: Mostrar indicadores de swap en el calendario
- [ ] Modificar `src/entities/shift/ui/shift-calendar.tsx`
- [ ] Indicador visual (icono de flechas) en turnos con swap request activo
- [ ] Indicador de turno extra disponible (icono de + o badge)
- **Dependencia:** T018

### T039: Agregar "Solicitudes" al sidebar
- [ ] Modificar `src/widgets/dashboard-sidebar/constants.ts`
- [ ] Nuevo NavItem "Solicitudes" con ruta `/dashboard/requests`
- [ ] Visible para: STAFF, CHIEF_AREA, CHIEF_SECTOR
- [ ] Badge con count de acciones pendientes (swaps + postulaciones que requieren mi acción)
- **Dependencia:** T026

### T040: Agregar badge count al sidebar
- [ ] Crear server action `getPendingRequestsCountAction()`: count de swaps pendientes de mi acción + postulaciones pendientes
- [ ] Integrar en `dashboard/layout.tsx` similar a `unreadNotificationCount`
- **Dependencia:** T018, T039

---

## Fase 9 — Notificaciones

### T041: Registrar nuevos NotificationType en toaster
- [ ] Modificar `src/features/notifications/ui/pending-notifications-toaster.tsx`
- [ ] Agregar los 9 nuevos tipos al `TOAST_METHOD` map
- [ ] Definir iconos y colores para cada tipo de notificación
- **Dependencia:** T007

### T042: Hook notificaciones en swap actions
- [ ] En `createDirectSwapAction`: SWAP_REQUESTED a Staff B
- [ ] En `createOpenSwapAction`: SWAP_OPEN_PUBLISHED a staff del área
- [ ] En `createSwapOfferAction`: SWAP_OFFER_RECEIVED a Staff A
- [ ] En `respondToSwapAction(accept)`: SWAP_PEER_ACCEPTED a Staff A
- [ ] En `reviewSwapAction(approve)`: SWAP_APPROVED a ambos
- [ ] En `reviewSwapAction(reject)`: SWAP_REJECTED a involucrados
- [ ] En `respondToSwapAction(reject)`: SWAP_REJECTED a Staff A
- **Dependencia:** T013-T020, T041

### T043: Hook notificaciones en extra-shift actions
- [ ] En `publishExtraShiftAction`: EXTRA_SHIFT_AVAILABLE a staff del área
- [ ] En `applyToExtraShiftAction`: EXTRA_SHIFT_APPLIED a CHIEF
- [ ] En `approveApplicationAction`: EXTRA_SHIFT_APPROVED al staff aprobado
- **Dependencia:** T022-T024, T041

---

## Fase 10 — i18n y pulido

### T044: Agregar traducciones es.json
- [ ] Namespace `requests`: títulos de tabs, estados, botones, mensajes de confirmación
- [ ] Namespace `swap`: formularios, validaciones, detalle
- [ ] Namespace `extraShifts`: formularios, estados
- [ ] Namespace `notifications`: mensajes para los 9 nuevos tipos
- **Archivo:** `messages/es.json`

### T045: Agregar traducciones en.json
- [ ] Mismo scope que T044
- **Archivo:** `messages/en.json`

### T046: Verificación de build y lint
- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` sin warnings nuevos
- [ ] No hay literales de UI sin traducción (`react/jsx-no-literals`)

### T047: Verificar seguridad multi-tenant
- [ ] Todas las queries filtran por `organizationId`
- [ ] Un usuario no puede interactuar con swaps de otra organización
- [ ] CHIEF solo ve/aprueba swaps de sus áreas
- [ ] Staff solo ve swaps de sus áreas

---

## Resumen de dependencias críticas

```
T001-T008 (Schema) → T009-T012 (Entity layer) → T013-T025 (Server Actions)
                                                        ↓
T026-T027 (Page base) ←——————————————————————→ T028-T036 (UI components)
                                                        ↓
                                                T037-T040 (Integraciones)
                                                        ↓
                                                T041-T043 (Notificaciones)
                                                        ↓
                                                T044-T047 (i18n + QA)
```

**Total: 47 tasks en 10 fases**
**Estimación de complejidad: Media-Alta**
