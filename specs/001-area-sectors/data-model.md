# Data Model: Sectores (Agrupación de Áreas)

**Date**: 2026-02-26
**Branch**: `001-area-sectors`

## New Entities

### Sector

Agrupación lógica/física de múltiples áreas que trabajan en conjunto dentro de una organización.

| Field          | Type     | Constraints                              | Notes                        |
| -------------- | -------- | ---------------------------------------- | ---------------------------- |
| id             | String   | PK, CUID                                | Auto-generated               |
| name           | String   | Required, 2-100 chars                    | Unique per organization      |
| description    | String?  | Optional, max 500 chars                  |                              |
| icon           | String?  | Optional, default "Layers"               | lucide-react icon name       |
| color          | String   | Required, default "#3b82f6", hex format  | Visual identification        |
| organizationId | String   | FK → Organization, NOT NULL              | Multi-tenant scope           |
| createdAt      | DateTime | Auto                                     |                              |
| updatedAt      | DateTime | Auto                                     |                              |

**Indexes**:
- `@@index([organizationId])` — Multi-tenant queries
- `@@unique([organizationId, name])` — Prevent duplicate names per org

**Relations**:
- `organization` → Organization (many-to-one, cascade delete)
- `sectorAreas` → SectorArea[] (one-to-many)

### SectorArea (Junction Table)

Vínculo muchos-a-muchos entre Sector y Area.

| Field    | Type   | Constraints            | Notes                |
| -------- | ------ | ---------------------- | -------------------- |
| sectorId | String | FK → Sector, NOT NULL  | Part of compound PK  |
| areaId   | String | FK → Area, NOT NULL    | Part of compound PK  |

**Indexes**:
- `@@id([sectorId, areaId])` — Compound primary key
- `@@index([sectorId])` — Query areas by sector
- `@@index([areaId])` — Query sectors by area

**Relations**:
- `sector` → Sector (many-to-one, cascade delete)
- `area` → Area (many-to-one, cascade delete)

## Modified Entities

### Organization

Add relation:
- `sectors` → Sector[] (one-to-many)

### Area

Add relation:
- `sectorAreas` → SectorArea[] (one-to-many)

**No schema changes to Area fields** — only a new back-relation is added.

## Prisma Schema Addition

```prisma
model Sector {
  id             String       @id @default(cuid())
  name           String
  description    String?
  icon           String?      @default("Layers")
  color          String       @default("#3b82f6")
  organizationId String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  sectorAreas    SectorArea[]

  @@unique([organizationId, name])
  @@index([organizationId])
}

model SectorArea {
  sectorId String
  areaId   String

  sector   Sector @relation(fields: [sectorId], references: [id], onDelete: Cascade)
  area     Area   @relation(fields: [areaId], references: [id], onDelete: Cascade)

  @@id([sectorId, areaId])
  @@index([sectorId])
  @@index([areaId])
}
```

## Validation Rules

### Sector Create
- `name`: string, min 2, max 100, required
- `description`: string, max 500, optional (empty string → null)
- `icon`: string, optional
- `color`: string, regex `/^#[0-9A-Fa-f]{6}$/`, optional (default "#3b82f6")

### Sector Update
- All fields optional
- Same validation rules as create

### SectorArea Assignment
- `sectorId`: valid CUID, must exist in same organization
- `areaIds`: array of valid CUIDs, all must exist in same organization
- Duplicate assignments silently ignored (upsert pattern)

## State Transitions

Sectors have no lifecycle states (no isActive). They exist or don't.

```
Created → (areas assigned/removed) → Deleted
```

Deletion cascade:
- Deleting a Sector → deletes all SectorArea records (cascade)
- Deleting an Area → deletes all SectorArea records for that area (cascade)
- Neither cascade affects the other entity (Sector deletion doesn't delete Areas, Area deletion doesn't delete Sectors)

## Query Patterns

### Get sectors for user (role-based)

**ADMIN_HR**:
```
SELECT * FROM Sector WHERE organizationId = :orgId
```

**CHIEF_AREA / STAFF_HEALTH**:
```
SELECT DISTINCT s.* FROM Sector s
JOIN SectorArea sa ON s.id = sa.sectorId
JOIN UserArea ua ON sa.areaId = ua.areaId
WHERE s.organizationId = :orgId AND ua.userId = :userId
```

### Get staff on shift in sector (time overlap)

```
SELECT sh.*, u.name, a.name, st.name, st.color
FROM Shift sh
JOIN User u ON sh.userId = u.id
JOIN Area a ON sh.areaId = a.id
JOIN ShiftType st ON sh.shiftTypeId = st.id
JOIN SectorArea sa ON sh.areaId = sa.areaId
WHERE sa.sectorId = :sectorId
  AND sh.organizationId = :orgId
  AND sh.status IN ('SCHEDULED', 'IN_PROGRESS')
  AND (
    (sh.startTime <= :queryStart AND sh.endTime > :queryStart)
    OR (sh.startTime < :queryEnd AND sh.endTime >= :queryEnd)
    OR (sh.startTime >= :queryStart AND sh.endTime <= :queryEnd)
  )
ORDER BY a.name, sh.startTime
```
