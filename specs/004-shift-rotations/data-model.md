# Data Model: Shift Rotations (Rotativas)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2026-02-24

## Overview

5 new models + 1 extended model + 1 extended enum. All new models follow existing conventions: `cuid()` IDs, `organizationId` for multi-tenant isolation, `createdAt`/`updatedAt` timestamps, cascade deletes matching parent-child relationships.

## New Enum

```prisma
enum RotationStatus {
  DRAFT      // Being configured, not yet ready for generation
  ACTIVE     // Ready for shift generation
  INACTIVE   // Paused, no new generation allowed
}
```

## Extended Enum

```prisma
enum NotificationType {
  // ... existing values ...
  ROTATION_ASSIGNED          // Staff added to rotation group
  ROTATION_SHIFTS_GENERATED  // Batch: shifts generated for member
  EXTRA_SHIFT_ASSIGNED       // Extra shift assigned to fill gap
}
```

## New Models

### Rotation

The top-level rotation configuration tied to one area.

```prisma
model Rotation {
  id             String         @id @default(cuid())
  name           String
  description    String?
  status         RotationStatus @default(DRAFT)
  areaId         String
  organizationId String
  startDate      DateTime?      // Optional: when this rotation's cycle begins
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  area           Area           @relation(fields: [areaId], references: [id], onDelete: Cascade)
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  steps          RotationStep[]
  shiftConfigs   RotationShiftConfig[]
  groups         RotationGroup[]
  shifts         Shift[]        // Generated shifts linked back

  @@index([organizationId])
  @@index([areaId])
  @@index([status])
  @@index([organizationId, areaId])
}
```

**Relationships**:
- Belongs to one Area (area can have multiple rotations)
- Belongs to one Organization (multi-tenant)
- Has many RotationSteps (the pattern)
- Has many RotationShiftConfigs (start times per shift type)
- Has many RotationGroups (A, B, C, D...)
- Has many Shifts (generated shifts reference back)

### RotationStep

A single step in the rotation's cyclic pattern.

```prisma
model RotationStep {
  id          String    @id @default(cuid())
  rotationId  String
  order       Int       // 0-based position in pattern
  isRestDay   Boolean   @default(false)
  shiftTypeId String?   // null when isRestDay=true
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  rotation    Rotation  @relation(fields: [rotationId], references: [id], onDelete: Cascade)
  shiftType   ShiftType? @relation(fields: [shiftTypeId], references: [id], onDelete: Restrict)

  @@unique([rotationId, order])
  @@index([rotationId])
}
```

**Rules**:
- `isRestDay=true` → `shiftTypeId` MUST be null
- `isRestDay=false` → `shiftTypeId` MUST be set
- `order` is unique per rotation (enforced by `@@unique`)
- Pattern length = count of steps for this rotation
- Application validates: shiftTypeId must be active + assigned to the rotation's area

### RotationShiftConfig

Start time configuration for each shift type used in a rotation.

```prisma
model RotationShiftConfig {
  id          String    @id @default(cuid())
  rotationId  String
  shiftTypeId String
  startTime   String    // HH:mm format (e.g., "08:00", "20:00")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  rotation    Rotation  @relation(fields: [rotationId], references: [id], onDelete: Cascade)
  shiftType   ShiftType @relation(fields: [shiftTypeId], references: [id], onDelete: Restrict)

  @@unique([rotationId, shiftTypeId])
  @@index([rotationId])
}
```

**Rules**:
- One config per (rotation, shiftType) combination
- `startTime` stored as HH:mm string, parsed with date-fns during generation
- End time calculated: startTime + ShiftType.durationMinutes
- Must exist for every ShiftType referenced in RotationSteps (application validates)

### RotationGroup

A named group within a rotation with its cycle offset.

```prisma
model RotationGroup {
  id          String    @id @default(cuid())
  rotationId  String
  name        String    // "A", "B", "C", "D" or custom
  cycleOffset Int       // 0-based offset in the pattern
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  rotation    Rotation  @relation(fields: [rotationId], references: [id], onDelete: Cascade)
  members     RotationMember[]
  shifts      Shift[]   // Generated shifts linked to this group

  @@unique([rotationId, name])
  @@unique([rotationId, cycleOffset])
  @@index([rotationId])
}
```

**Rules**:
- `name` is unique per rotation
- `cycleOffset` is unique per rotation and auto-assigned (0, 1, 2...)
- Minimum 2 groups, maximum 6 per rotation (application validates)
- `cycleOffset` determines pattern position on any day: `(dayIndex + cycleOffset) % patternLength`

### RotationMember

Links a staff member to a rotation group.

```prisma
model RotationMember {
  id              String        @id @default(cuid())
  rotationGroupId String
  userId          String
  joinedAt        DateTime      @default(now())
  leftAt          DateTime?     // null = active member
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  rotationGroup   RotationGroup @relation(fields: [rotationGroupId], references: [id], onDelete: Cascade)
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([rotationGroupId, userId])
  @@index([rotationGroupId])
  @@index([userId])
}
```

**Rules**:
- User can only be active (`leftAt=null`) in one group per rotation (application validates)
- Application warns (but allows) if user is in another active rotation in the same area (FR-004)
- Only STAFF_HEALTH users with UserArea assignment to the rotation's area can be added
- `leftAt` set when member is removed (soft tracking for history)

## Extended Models

### Shift (existing - add fields)

```prisma
model Shift {
  // ... all existing fields unchanged ...

  // New optional fields for rotation linkage
  rotationId         String?
  rotationGroupId    String?
  isManuallyModified Boolean    @default(false)

  rotation           Rotation?       @relation(fields: [rotationId], references: [id], onDelete: SetNull)
  rotationGroup      RotationGroup?  @relation(fields: [rotationGroupId], references: [id], onDelete: SetNull)

  // New indexes
  @@index([rotationId])
  @@index([rotationGroupId])
}
```

**Rules**:
- `rotationId` + `rotationGroupId` set together for generated shifts, both null for manual shifts
- `isManuallyModified=true` when a generated shift is individually edited → excluded from regeneration
- `onDelete: SetNull` → deleting a rotation doesn't delete the shifts, just unlinks them
- Existing shift functionality (calendar, payments, contracts, notifications) works unchanged

### Organization (existing - add relation)

```prisma
model Organization {
  // ... all existing fields ...
  rotations     Rotation[]
}
```

### Area (existing - add relation)

```prisma
model Area {
  // ... all existing fields ...
  rotations     Rotation[]
}
```

### User (existing - add relation)

```prisma
model User {
  // ... all existing fields ...
  rotationMemberships  RotationMember[]
}
```

### ShiftType (existing - add relations)

```prisma
model ShiftType {
  // ... all existing fields ...
  rotationSteps       RotationStep[]
  rotationShiftConfigs RotationShiftConfig[]
}
```

## Entity Relationship Diagram (text)

```
Organization ──1:N──► Rotation ──1:N──► RotationStep ──N:1──► ShiftType
                           │                                       ▲
                           ├──1:N──► RotationShiftConfig ──N:1─────┘
                           │
                           ├──1:N──► RotationGroup ──1:N──► RotationMember ──N:1──► User
                           │              │
                           │              └──1:N──► Shift (generated, via rotationGroupId)
                           │
                           └──1:N──► Shift (generated, via rotationId)

Area ──1:N──► Rotation
```

## Indexes Summary

| Model | Index | Purpose |
|-------|-------|---------|
| Rotation | `(organizationId)` | Multi-tenant list queries |
| Rotation | `(areaId)` | List by area |
| Rotation | `(status)` | Filter by status |
| Rotation | `(organizationId, areaId)` | Composite for area-scoped org queries |
| RotationStep | `(rotationId)` | Get pattern for rotation |
| RotationShiftConfig | `(rotationId)` | Get configs for rotation |
| RotationGroup | `(rotationId)` | Get groups for rotation |
| RotationMember | `(rotationGroupId)` | Get members for group |
| RotationMember | `(userId)` | Find user's rotations |
| Shift | `(rotationId)` | Find generated shifts for rotation |
| Shift | `(rotationGroupId)` | Find generated shifts for group |

## Migration Notes

- All new fields on Shift are optional → no breaking changes to existing data
- Existing shifts get `rotationId=null`, `rotationGroupId=null`, `isManuallyModified=false` by default
- New NotificationType enum values are additive → no migration needed for existing notifications
- Recommend running `prisma db push` for dev, proper migration for production
