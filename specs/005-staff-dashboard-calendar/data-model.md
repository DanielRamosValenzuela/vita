# Data Model: Staff Dashboard Calendar

**Feature**: 005-staff-dashboard-calendar
**Date**: 2026-02-28

## Existing Models (no changes needed)

### Shift (ya existe)
Modelo central del calendario. No requiere modificaciones.

- `id` (String, PK)
- `userId` → User
- `areaId` → Area
- `shiftTypeId` → ShiftType
- `organizationId` → Organization
- `startTime` (DateTime)
- `endTime` (DateTime)
- `status` (ShiftStatus: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW)
- `rotationId?` → Rotation
- `isExtra` (Boolean)

**Indexes relevantes**: `[organizationId]`, `[userId]`, `[startTime]`, `[endTime]`, `[status]`

### Sector → SectorArea → Area (ya existe)
Relación many-to-many que permite agrupar áreas en sectores.

- Sector: `id`, `name`, `organizationId`
- SectorArea: `sectorId` + `areaId` (composite PK)
- Area: `id`, `name`, `color`, `icon`, `organizationId`

### UserArea / UserSector (ya existe)
Vinculación de usuarios a áreas y sectores.

- UserArea: `userId` + `areaId` (composite PK)
- UserSector: `userId` + `sectorId` (composite PK)

## New Models

### CalendarFeedToken

Almacena tokens para feeds iCal de suscripción. Cada usuario puede tener múltiples tokens: uno por organización (feed per-org) y uno unificado (feed personal).

```
CalendarFeedToken
├── id              String    PK, cuid
├── userId          String    FK → User (cascade delete)
├── organizationId  String?   FK → Organization (cascade delete). NULL = feed unificado
├── token           String    Unique, crypto.randomUUID()
├── isActive        Boolean   Default true. False = revocado
├── createdAt       DateTime  Default now()
├── updatedAt       DateTime  @updatedAt
│
├── Indexes:
│   ├── [token]                          # Lookup rápido por token en Route Handler
│   ├── [userId]                         # Listar tokens del usuario
│   └── [userId, organizationId] UNIQUE  # Un token per-org por usuario+org, un token unified (orgId=null)
```

**Reglas de negocio**:
- Feed per-org: `organizationId` tiene valor. Solo incluye turnos de esa org.
- Feed unificado: `organizationId` es NULL. Incluye turnos de TODAS las orgs del usuario.
- Un usuario puede tener máximo 1 token activo por `(userId, organizationId)`.
- Regenerar = delete antiguo + create nuevo (cambia la URL).
- Token revocado (`isActive=false`) retorna calendario vacío, no error.

### GoogleCalendarConnection

Almacena credenciales OAuth 2.0 para importar eventos desde Google Calendar.

```
GoogleCalendarConnection
├── id              String    PK, cuid
├── userId          String    FK → User (cascade delete)
├── accessToken     String    OAuth access token (encriptado en BD)
├── refreshToken    String?   OAuth refresh token (encriptado en BD)
├── tokenExpiresAt  DateTime? Expiración del access token
├── calendarId      String?   ID del calendario seleccionado (default: "primary")
├── isActive        Boolean   Default true
├── createdAt       DateTime  Default now()
├── updatedAt       DateTime  @updatedAt
│
├── Indexes:
│   ├── [userId] UNIQUE   # Un connection por usuario
```

**Reglas de negocio**:
- No tiene `organizationId`: la conexión Google es personal del usuario, no de la org.
- Al desconectar: se revoca el token en Google API + se elimina el registro.
- Eventos importados NO se persisten en BD; se fetchean on-demand al cargar el dashboard.
- Scope: `calendar.readonly` (solo lectura).

## Derived Views (no se persisten)

### PersonalActivo (vista derivada)

Calculada en tiempo real por `getSectorPersonnelAction()`:

```
SectorPersonnelResult
├── sector          { id, name, color }
├── areas[]
│   ├── area        { id, name, icon, color }
│   └── shifts[]
│       ├── id, userId, userName
│       ├── shiftTypeName, shiftTypeColor
│       ├── startTime, endTime
│       ├── status, isExtra
│       ├── relay?   { type: 'incoming' | 'outgoing', userId, userName }
│       └── (calculado en servidor, no persistido)
└── totalStaff      number (unique users count)
```

### Relevo (vista derivada)

Calculado por `detectRelays()`:

```
Input:  shifts[] ordenados por (areaId, startTime)
Output: shifts[] con campo relay añadido

Algoritmo:
  Para cada área:
    Ordenar shifts por startTime ASC
    Para cada par consecutivo (shiftA, shiftB):
      gap = shiftB.startTime - shiftA.endTime
      Si gap <= 30 minutos:
        shiftA.relay = { type: 'outgoing', userId: shiftB.userId, userName: shiftB.userName }
        shiftB.relay = { type: 'incoming', userId: shiftA.userId, userName: shiftA.userName }
```

## Query Patterns

### Q1: Turnos personales del mes (P1)

```sql
SELECT s.*, u.name, a.name, st.name, st.color, r.name
FROM Shift s
JOIN User u ON s.userId = u.id
JOIN Area a ON s.areaId = a.id
JOIN ShiftType st ON s.shiftTypeId = st.id
LEFT JOIN Rotation r ON s.rotationId = r.id
WHERE s.userId = :currentUserId
  AND s.organizationId = :orgId
  AND s.startTime >= :monthStart
  AND s.startTime < :monthEnd
ORDER BY s.startTime ASC
```

### Q2: Próximos 7 días (P3)

```sql
SELECT s.*, a.name, st.name, st.color
FROM Shift s
JOIN Area a ON s.areaId = a.id
JOIN ShiftType st ON s.shiftTypeId = st.id
WHERE s.userId = :currentUserId
  AND s.organizationId = :orgId
  AND s.startTime >= :now
  AND s.startTime < :now + 7 days
  AND s.status IN ('SCHEDULED', 'IN_PROGRESS')
ORDER BY s.startTime ASC
```

### Q3: Personal activo del sector en rango horario (P2)

```sql
-- Paso 1: Obtener áreas del sector
SELECT sa.areaId FROM SectorArea sa WHERE sa.sectorId = :sectorId

-- Paso 2: Obtener shifts activos en esas áreas que se solapan con el rango
SELECT s.*, u.name, a.name, a.color, st.name, st.color
FROM Shift s
JOIN User u ON s.userId = u.id
JOIN Area a ON s.areaId = a.id
JOIN ShiftType st ON s.shiftTypeId = st.id
WHERE s.areaId IN (:sectorAreaIds)
  AND s.organizationId = :orgId
  AND s.status IN ('SCHEDULED', 'IN_PROGRESS')
  AND (
    (s.startTime <= :rangeStart AND s.endTime > :rangeStart) OR
    (s.startTime < :rangeEnd AND s.endTime >= :rangeEnd) OR
    (s.startTime >= :rangeStart AND s.endTime <= :rangeEnd)
  )
ORDER BY a.name ASC, s.startTime ASC
```

### Q4: Feed iCal - turnos para feed (P4)

```sql
-- Feed per-org
SELECT s.*, a.name, st.name
FROM Shift s
JOIN Area a ON s.areaId = a.id
JOIN ShiftType st ON s.shiftTypeId = st.id
WHERE s.userId = :tokenUserId
  AND s.organizationId = :tokenOrgId
  AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED')
  AND s.startTime >= :threeMonthsAgo
ORDER BY s.startTime ASC

-- Feed unificado (sin filtro orgId)
SELECT s.*, a.name, st.name, o.name as orgName
FROM Shift s
JOIN Area a ON s.areaId = a.id
JOIN ShiftType st ON s.shiftTypeId = st.id
JOIN Organization o ON s.organizationId = o.id
WHERE s.userId = :tokenUserId
  AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED')
  AND s.startTime >= :threeMonthsAgo
ORDER BY s.startTime ASC
```

### Q5: Resolver sector de un área (P2)

```sql
SELECT s.id, s.name, s.color
FROM Sector s
JOIN SectorArea sa ON s.id = sa.sectorId
WHERE sa.areaId = :areaId
  AND s.organizationId = :orgId
LIMIT 1
```
