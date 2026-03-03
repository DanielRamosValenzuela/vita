# Plan: Intercambio de Turnos y Turnos Extra

> **Scope**: Feature de intercambio de turnos entre staff + solicitud de turnos extra/abiertos
> **Page nueva**: `/dashboard/requests` (Solicitudes)
> **Branch**: `006-payroll-billing-pdf` (compartida)

---

## 1. Resumen ejecutivo

Dos funcionalidades interrelacionadas para dar autonomía al staff en la gestión de sus turnos:

1. **Intercambio de turnos** — Dos modalidades:
   - **Swap directo**: Staff A propone intercambiar su turno por uno específico de Staff B.
   - **Publicación abierta**: Staff A publica su turno como disponible para intercambio; compañeros de la misma área pueden ofertar.
   - Ambos flujos requieren aprobación final del CHIEF_AREA.

2. **Turnos extra** — Staff puede postularse a turnos abiertos (sin asignar o que necesitan cobertura adicional) publicados por CHIEF_AREA o ADMIN_HR.

---

## 2. Modelo de datos

### 2.1 Nuevos modelos Prisma

```prisma
enum SwapRequestType {
  DIRECT        // Staff A elige turno específico de Staff B
  OPEN          // Staff A publica su turno, otros ofrecen
}

enum SwapRequestStatus {
  PENDING_PEER       // Esperando aceptación de Staff B (DIRECT) o que alguien oferte (OPEN)
  PENDING_SELECTION  // OPEN: hay ofertas, Staff A debe elegir una
  PENDING_CHIEF      // Ambos staff de acuerdo, esperando aprobación del CHIEF
  APPROVED           // CHIEF aprobó, turnos intercambiados
  REJECTED_BY_PEER   // Staff B rechazó (DIRECT)
  REJECTED_BY_CHIEF  // CHIEF rechazó
  CANCELLED          // Solicitante canceló
  EXPIRED            // Venció sin respuesta
}

model ShiftSwapRequest {
  id              String             @id @default(cuid())
  organizationId  String
  type            SwapRequestType
  status          SwapRequestStatus  @default(PENDING_PEER)

  // Quien solicita el intercambio
  requesterId     String
  requesterShiftId String

  // Staff B (en DIRECT se llena al crear; en OPEN se llena al aceptar oferta)
  targetUserId    String?
  targetShiftId   String?

  // Área del intercambio (ambos turnos deben pertenecer a esta área)
  areaId          String

  reason          String?            // Motivo del intercambio (opcional)
  chiefId         String?            // CHIEF que aprobó/rechazó
  chiefNote       String?            // Nota del CHIEF

  peerRespondedAt  DateTime?
  chiefRespondedAt DateTime?
  expiresAt        DateTime?         // Para OPEN: fecha límite para recibir ofertas

  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  // Relaciones
  organization    Organization       @relation(fields: [organizationId], references: [id])
  requester       User               @relation("SwapRequester", fields: [requesterId], references: [id])
  requesterShift  Shift              @relation("SwapRequesterShift", fields: [requesterShiftId], references: [id])
  targetUser      User?              @relation("SwapTarget", fields: [targetUserId], references: [id])
  targetShift     Shift?             @relation("SwapTargetShift", fields: [targetShiftId], references: [id])
  area            Area               @relation(fields: [areaId], references: [id])
  chief           User?              @relation("SwapChief", fields: [chiefId], references: [id])
  offers          ShiftSwapOffer[]

  @@index([organizationId])
  @@index([requesterId])
  @@index([targetUserId])
  @@index([areaId])
  @@index([status])
}

enum SwapOfferStatus {
  PENDING    // Esperando que Staff A elija
  ACCEPTED   // Staff A eligió esta oferta
  REJECTED   // Staff A eligió otra oferta
  WITHDRAWN  // El oferente retiró su oferta
}

model ShiftSwapOffer {
  id              String           @id @default(cuid())
  swapRequestId   String
  offererId       String
  offeredShiftId  String
  status          SwapOfferStatus  @default(PENDING)
  note            String?          // Mensaje del oferente (opcional)

  createdAt       DateTime         @default(now())

  // Relaciones
  swapRequest     ShiftSwapRequest @relation(fields: [swapRequestId], references: [id], onDelete: Cascade)
  offerer         User             @relation(fields: [offererId], references: [id])
  offeredShift    Shift            @relation(fields: [offeredShiftId], references: [id])

  @@unique([swapRequestId, offererId]) // Un usuario solo puede ofertar una vez por request
  @@index([swapRequestId])
  @@index([offererId])
}
```

### 2.2 Turnos extra — Extensión del modelo Shift

```prisma
enum ShiftCoverageStatus {
  ASSIGNED           // Turno asignado normalmente
  NEEDS_COVERAGE     // Necesita cobertura (visible en solicitudes)
  OPEN_FOR_APPLICATIONS // Abierto para postulaciones del staff
}

// Agregar al modelo Shift existente:
// coverageStatus  ShiftCoverageStatus @default(ASSIGNED)

model ShiftApplication {
  id          String    @id @default(cuid())
  shiftId     String
  userId      String
  status      String    @default("PENDING") // PENDING | APPROVED | REJECTED | WITHDRAWN
  note        String?
  createdAt   DateTime  @default(now())

  shift       Shift     @relation(fields: [shiftId], references: [id])
  user        User      @relation(fields: [userId], references: [id])

  @@unique([shiftId, userId]) // Un usuario solo puede postularse una vez
  @@index([shiftId])
  @@index([userId])
}
```

### 2.3 Nuevos NotificationType

Agregar al enum `NotificationType`:

```prisma
SWAP_REQUESTED          // Staff B recibe solicitud de swap directo
SWAP_OPEN_PUBLISHED     // Staff del área ve que hay un turno disponible para intercambio
SWAP_OFFER_RECEIVED     // Staff A recibe una oferta en su publicación abierta
SWAP_PEER_ACCEPTED      // Staff A es notificado que Staff B aceptó (ahora va al CHIEF)
SWAP_APPROVED           // Ambos staff notificados: CHIEF aprobó
SWAP_REJECTED           // Notificado de rechazo (por peer o por CHIEF)
EXTRA_SHIFT_AVAILABLE   // Staff del área: hay un turno extra disponible
EXTRA_SHIFT_APPLIED     // CHIEF: alguien se postuló a un turno extra
EXTRA_SHIFT_APPROVED    // Staff: tu postulación fue aprobada
```

---

## 3. Reglas de negocio

### 3.1 Intercambio de turnos

| Regla | Detalle |
|-------|---------|
| **Misma área** | Ambos turnos deben pertenecer a la misma `areaId` |
| **Lead time 24h** | No se puede solicitar intercambio si alguno de los dos turnos inicia en menos de 24 horas |
| **Cross-type permitido** | Se pueden intercambiar turnos de ShiftType diferentes; el CHIEF valida al aprobar |
| **Un swap activo por turno** | Un turno no puede estar en dos solicitudes de swap activas simultáneamente |
| **Solo turnos SCHEDULED** | Solo se pueden intercambiar turnos con `status = SCHEDULED` |
| **Expiración OPEN** | Las publicaciones abiertas expiran en 7 días (configurable en el futuro) |
| **Cancelación** | El solicitante puede cancelar en cualquier estado antes de APPROVED |
| **Efecto de aprobación** | Al aprobar: se intercambian los `userId` de ambos shifts + se revalidan paths |

### 3.2 Turnos extra

| Regla | Detalle |
|-------|---------|
| **Misma área** | Solo staff de la misma área puede postularse |
| **Lead time 24h** | No se puede postular si el turno inicia en menos de 24h |
| **Sin conflicto** | El staff no puede postularse si tiene un turno que solapa con el extra |
| **Una postulación por turno** | Un staff solo puede postularse una vez por turno |
| **CHIEF o ADMIN_HR publica** | Solo CHIEF_AREA o ADMIN_HR pueden marcar un turno como `OPEN_FOR_APPLICATIONS` |

---

## 4. Arquitectura FSD

```
src/
├── entities/
│   └── swap/
│       ├── lib/
│       │   ├── swap-repository.ts        # CRUD de ShiftSwapRequest + Offers
│       │   └── swap-validation.ts        # Validaciones (24h, misma área, conflictos)
│       └── types/
│           └── swap-types.ts             # SwapRequestWithRelations, etc.
│
├── features/
│   ├── shift-swap/
│   │   ├── api/
│   │   │   ├── swap-actions.ts           # Server actions: crear, cancelar, responder swap
│   │   │   ├── swap-offer-actions.ts     # Server actions: crear oferta, retirar oferta
│   │   │   └── swap-chief-actions.ts     # Server actions: aprobar/rechazar (CHIEF)
│   │   ├── lib/
│   │   │   └── swap-execution.ts         # Lógica de ejecutar el swap (intercambiar userId)
│   │   └── ui/
│   │       ├── swap-request-form.tsx      # Modal/Sheet para crear swap directo
│   │       ├── open-swap-form.tsx         # Modal/Sheet para publicar turno abierto
│   │       ├── swap-offer-form.tsx        # Modal para ofertar en publicación abierta
│   │       ├── swap-detail-panel.tsx      # Panel detalle de un swap request
│   │       ├── swap-list.tsx              # Lista de swaps (filtrable por estado)
│   │       └── swap-chief-review.tsx      # Vista de revisión para CHIEF
│   │
│   ├── extra-shifts/
│   │   ├── api/
│   │   │   ├── extra-shift-actions.ts    # Publicar turno extra, aprobar postulación
│   │   │   └── application-actions.ts    # Postularse, retirar postulación
│   │   └── ui/
│   │       ├── extra-shift-list.tsx       # Lista de turnos extra disponibles
│   │       ├── application-form.tsx       # Modal para postularse
│   │       └── applications-review.tsx    # CHIEF: revisar postulaciones
│   │
│   └── requests-dashboard/
│       └── ui/
│           └── requests-page.tsx          # Page principal con tabs
│
├── widgets/
│   └── (se actualiza dashboard-sidebar con el nuevo nav item)
```

---

## 5. Pages y rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/dashboard/requests` | STAFF, CHIEF_AREA | Tab "Intercambios": mis solicitudes y las que me llegan |
| `/dashboard/requests` | STAFF, CHIEF_AREA | Tab "Turnos Extra": turnos abiertos en mis áreas |
| `/dashboard/requests` | CHIEF_AREA | Tab "Aprobaciones": swaps y postulaciones pendientes de mi aprobación |

---

## 6. Integración con componentes existentes

### 6.1 Staff Dashboard Calendar (`shift-detail-panel.tsx`)
- Agregar botón "Solicitar intercambio" en el panel de detalle del turno.
- Abre modal con dos opciones: "Swap directo" o "Publicar para intercambio".

### 6.2 Inbox / Notifications
- Nuevos `NotificationType` con sus toasts en `PendingNotificationsToaster`.
- Cada notificación de swap incluye `actionUrl` que lleva a `/dashboard/requests`.

### 6.3 Sidebar
- Nuevo item "Solicitudes" entre "Bandeja de entrada" y "Calendario" (o donde mejor fluya).
- Badge con conteo de solicitudes pendientes que requieren acción del usuario.

---

## 7. Flujos detallados

### 7.1 Swap Directo

```
Staff A → abre turno en calendario → "Solicitar intercambio"
  → selecciona "Swap directo"
  → ve turnos de compañeros de la misma área (próximos 30 días)
  → selecciona turno de Staff B
  → agrega motivo (opcional)
  → confirma → crea ShiftSwapRequest(type=DIRECT, status=PENDING_PEER)
  → Notificación SWAP_REQUESTED a Staff B

Staff B → ve notificación → abre solicitud en /dashboard/requests
  → ve detalle: su turno vs turno de Staff A
  → Acepta → status = PENDING_CHIEF, notificación SWAP_PEER_ACCEPTED a Staff A
  → Rechaza → status = REJECTED_BY_PEER, notificación SWAP_REJECTED a Staff A

CHIEF → ve solicitud en tab "Aprobaciones"
  → Aprueba → ejecuta swap (intercambia userId), status = APPROVED
    → Notificación SWAP_APPROVED a ambos
  → Rechaza → status = REJECTED_BY_CHIEF, nota opcional
    → Notificación SWAP_REJECTED a ambos
```

### 7.2 Publicación Abierta

```
Staff A → abre turno en calendario → "Solicitar intercambio"
  → selecciona "Publicar para intercambio"
  → agrega motivo (opcional)
  → confirma → crea ShiftSwapRequest(type=OPEN, status=PENDING_PEER)
  → Notificación SWAP_OPEN_PUBLISHED a staff del área

Staff B, C, D → ven publicación en /dashboard/requests tab "Intercambios"
  → "Ofertar turno" → seleccionan uno de SUS turnos
  → Crea ShiftSwapOffer(status=PENDING)
  → Notificación SWAP_OFFER_RECEIVED a Staff A

Staff A → ve ofertas en el detalle de su publicación
  → Selecciona la oferta de Staff C → status request = PENDING_CHIEF
    → Ofertas restantes pasan a REJECTED
    → Notificación a Staff C (seleccionado, pendiente CHIEF)

CHIEF → misma revisión que swap directo
```

### 7.3 Turno Extra

```
CHIEF → crea turno sin asignar O marca turno existente como OPEN_FOR_APPLICATIONS
  → Notificación EXTRA_SHIFT_AVAILABLE a staff del área

Staff → ve turno extra en /dashboard/requests tab "Turnos Extra"
  → "Postularme" → crea ShiftApplication(status=PENDING)
  → Notificación EXTRA_SHIFT_APPLIED a CHIEF

CHIEF → ve postulaciones en tab "Aprobaciones"
  → Aprueba a Staff B → asigna shift.userId = Staff B, status = APPROVED
    → Notificación EXTRA_SHIFT_APPROVED a Staff B
    → Otras postulaciones → REJECTED
```

---

## 8. Prioridad de implementación

1. **Fase 1**: Modelo de datos + migraciones (swap + extra shifts)
2. **Fase 2**: Server actions de intercambio (swap directo primero)
3. **Fase 3**: UI de intercambio directo (integración en calendario + page requests)
4. **Fase 4**: Server actions + UI de publicación abierta
5. **Fase 5**: Server actions + UI de turnos extra
6. **Fase 6**: Notificaciones (todos los tipos nuevos)
7. **Fase 7**: i18n, testing y pulido
