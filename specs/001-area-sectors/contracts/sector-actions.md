# Server Action Contracts: Sector

**Pattern**: Server Actions (no API Routes). All return `ActionResult<T>`.

## CRUD Actions

### createSectorAction

**Auth**: `requireAdminHRWithOrg()`
**Input**: `CreateSectorInput` (Zod validated)
```typescript
{
  name: string        // 2-100 chars, required
  description?: string // max 500 chars
  icon?: string       // lucide-react icon name
  color?: string      // hex color, default "#3b82f6"
}
```
**Output**: `ActionResult<Sector>`
**Revalidates**: `/dashboard/sectors`, `/dashboard/admin-hr`
**Errors**:
- Duplicate name in org → `{ success: false, error: t('duplicateName') }`
- Validation failure → `handleActionError`

### updateSectorAction

**Auth**: `requireAdminHRWithOrg()`
**Input**: `{ id: string } & UpdateSectorInput` (Zod validated)
```typescript
{
  id: string
  name?: string
  description?: string
  icon?: string
  color?: string
}
```
**Output**: `ActionResult<Sector>`
**Revalidates**: `/dashboard/sectors`, `/dashboard/admin-hr`
**Errors**:
- Sector not found → `{ success: false, error: t('notFound') }`
- Duplicate name → `{ success: false, error: t('duplicateName') }`

### deleteSectorAction

**Auth**: `requireAdminHRWithOrg()`
**Input**: `id: string`
**Output**: `ActionResult<void>`
**Revalidates**: `/dashboard/sectors`, `/dashboard/admin-hr`
**Side effects**: Cascade deletes SectorArea records
**Errors**:
- Sector not found → `{ success: false, error: t('notFound') }`

### getSectorsAction

**Auth**: `requireAdminHROrChiefArea()` (also STAFF via custom check)
**Input**: None (uses session organizationId)
**Output**: `ActionResult<SectorWithCounts[]>`
```typescript
{
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string
  organizationId: string
  _count: { sectorAreas: number }
  sectorAreas: Array<{
    area: {
      id: string
      name: string
      icon: string | null
      color: string
    }
  }>
}
```
**Role filtering**:
- ADMIN_HR: all sectors in org
- CHIEF_AREA/STAFF: sectors containing their assigned areas (via UserArea join)

## Area Assignment Actions

### assignAreasToSectorAction

**Auth**: `requireAdminHRWithOrg()`
**Input**: `{ sectorId: string, areaIds: string[] }`
**Output**: `ActionResult<void>`
**Strategy**: Transaction — delete all existing SectorArea for sector, then create new ones
**Revalidates**: `/dashboard/sectors`
**Errors**:
- Sector not found → error
- Area IDs not in org → filtered silently (only valid IDs processed)

## Staff Query Action

### getSectorStaffAction

**Auth**: `requireAdminHROrChiefArea()` (also STAFF via custom check)
**Input**:
```typescript
{
  sectorId: string
  date: string       // ISO date "YYYY-MM-DD"
  startTime: string  // "HH:mm" format
  endTime: string    // "HH:mm" format
}
```
**Output**: `ActionResult<SectorStaffResult>`
```typescript
{
  sector: { id: string, name: string, color: string }
  areas: Array<{
    area: { id: string, name: string, icon: string | null, color: string }
    shifts: Array<{
      id: string
      userId: string
      userName: string
      shiftTypeName: string
      shiftTypeColor: string
      startTime: Date
      endTime: Date
      isExtra: boolean
      status: string
    }>
  }>
  totalStaff: number
}
```
**Query logic**: Three-part OR overlap, filtered by `areaId IN sectorAreaIds`, status `SCHEDULED`/`IN_PROGRESS`
**Role filtering**: CHIEF_AREA/STAFF can only query sectors containing their areas (validated server-side)
**Revalidates**: None (read-only query)
