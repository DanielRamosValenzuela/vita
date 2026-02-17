# Data Model: UI para Gestión del Calendario Organizacional

**Date**: 2026-02-16
**Feature Branch**: `001-org-calendar-ui`

## Existing Model (No Changes Required)

The `OrganizationCalendar` model and `DayType` enum already exist in `prisma/schema.prisma`. **No schema migrations are needed for this feature.**

### OrganizationCalendar

```prisma
model OrganizationCalendar {
  id             String       @id @default(cuid())
  organizationId String
  date           DateTime
  type           DayType      @default(NORMAL)
  name           String?
  description    String?
  multiplier     Float        @default(1.0)
  isRecurring    Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, date])
  @@index([organizationId])
  @@index([date])
  @@index([type])
}
```

**Key constraints**:
- `@@unique([organizationId, date])` — enforces one entry per org per date (FR-003)
- `organizationId` + cascade delete — multi-tenant isolation (FR-006)
- `multiplier` default 1.0 — normal days have no pay impact

### DayType Enum

```prisma
enum DayType {
  NORMAL
  WEEKEND
  SATURDAY
  SUNDAY
  HOLIDAY
  IRRENUNCIABLE
  ORGANIZATION_HOLIDAY
  CUSTOM
}
```

**Feature-relevant types** (manually managed by ADMIN_HR):
- `HOLIDAY` — National holiday (default multiplier 1.5x)
- `IRRENUNCIABLE` — Legally protected holiday in Chile (default multiplier 2.5x)
- `ORGANIZATION_HOLIDAY` — Company-specific day off
- `CUSTOM` — Any other special day

**System-managed types** (NOT shown in create form):
- `NORMAL`, `WEEKEND`, `SATURDAY`, `SUNDAY` — detected by date, not manually created

### Related Models

- **Organization**: Parent entity. `country` field determines which national holidays are available for import.
- **ShiftPayment**: Consumes `calendarMultiplier` (Float, default 1.0) from the calendar entry matching the shift date. Existing model, no changes needed.

## New Static Data: National Holiday Datasets

### NationalHoliday Type (new, in `shared/lib/constants/holidays/types.ts`)

```typescript
export interface NationalHoliday {
  month: number           // 1-12
  day: number             // 1-31
  nameEs: string          // Spanish display name
  nameEn: string          // English display name
  type: 'HOLIDAY' | 'IRRENUNCIABLE'
  defaultMultiplier: number  // 1.5 for HOLIDAY, 2.5 for IRRENUNCIABLE
}

export interface CountryHolidays {
  countryCode: string     // ISO 3166-1 alpha-2 (CL, CO, PE, AR, MX)
  countryNameEs: string
  countryNameEn: string
  holidays: NationalHoliday[]
}
```

### Supported Countries

| Country | Code | ~Holidays/year | Has Irrenunciables |
|---------|------|----------------|-------------------|
| Chile | CL | 18 | Yes (Navidad, Año Nuevo, 1 Mayo, 18 Sep, etc.) |
| Colombia | CO | 18 | No |
| Peru | PE | 15 | No |
| Argentina | AR | 19 | No |
| Mexico | MX | 12 | No |

### Validation Rules

| Field | Rule | Enforcement |
|-------|------|-------------|
| multiplier | >= 0.1, number | Zod schema (client + server) |
| date | valid Date, no constraint on past/future | Zod schema |
| type | one of HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM | Zod enum |
| name | optional string, max 100 chars | Zod schema |
| description | optional string, max 500 chars | Zod schema |
| organizationId + date | unique | Database constraint (existing) |
