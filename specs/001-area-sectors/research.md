# Research: Sectores (Agrupación de Áreas)

**Date**: 2026-02-26
**Branch**: `001-area-sectors`

## Decision Log

### D1: Data Model Pattern for Sector ↔ Area

**Decision**: Explicit junction table `SectorArea` with compound primary key `(sectorId, areaId)`.

**Rationale**: Matches the existing `AreaShiftType` and `UserArea` patterns in VITA. Compound `@@id` ensures uniqueness without a separate `id` field. Cascading deletes on both FKs ensure cleanup when either entity is removed.

**Alternatives considered**:
- Implicit many-to-many via Prisma: Less control over indexes and cascade behavior. Rejected.
- Array field on Sector: No referential integrity, poor query performance for join-heavy queries. Rejected.

### D2: FSD Layer Placement

**Decision**:
- Entity layer: `src/entities/sector/` — repository functions (CRUD + query)
- Feature layer: `src/features/sector/` — Server Actions, UI components, schemas, types
- No widget layer needed (sector is a standalone feature page, not a dashboard widget)

**Rationale**: Follows Area feature structure exactly. Sector is a domain entity with its own feature slice. The feature contains server actions, form UI, and table UI.

**Alternatives considered**:
- Placing inside `src/features/area/`: Would violate FSD by mixing two distinct domain concepts. Rejected.
- Placing in `src/features/admin-hr/`: Would bloat an already large feature. Sector merits its own feature slice. Rejected.

### D3: Routing Structure

**Decision**:
```
/dashboard/sectors          → List + manage sectors (ADMIN_HR)
/dashboard/sectors/new      → Create sector form
/dashboard/sectors/[id]/edit → Edit sector + assign areas
/dashboard/sectors/[id]/staff → Query staff on shift in sector
```

**Rationale**: Follows `areas/` routing pattern (list, new, [id]/edit). The `/staff` sub-route is unique to sectors — it serves the P2 user story (query personnel by time range). Separate from edit to keep concerns clean and allow CHIEF_AREA/STAFF to access staff query without edit permissions.

**Alternatives considered**:
- All-in-one page with tabs: Too complex for initial implementation. Rejected.
- Modal-based staff query: Limits data display. A full page gives more room for grouped results. Rejected.

### D4: Shift Overlap Query Strategy

**Decision**: Three-part OR clause matching the existing `checkShiftConflicts` pattern:
```
OR: [
  { startTime <= queryStart AND endTime > queryStart },
  { startTime < queryEnd AND endTime >= queryEnd },
  { startTime >= queryStart AND endTime <= queryEnd }
]
```

**Rationale**: Proven pattern already used in `src/entities/shift/lib/shift-validation.ts`. Handles all overlap cases including shifts that cross midnight. Combined with `areaId: { in: sectorAreaIds }` for multi-area querying.

**Alternatives considered**:
- Simple range filter (`startTime BETWEEN x AND y`): Misses shifts that start before the range but extend into it. Rejected.
- Client-side filtering: Unnecessary when Prisma/Postgres can handle it efficiently. Rejected.

### D5: Role-Based Access for Sector Staff Query

**Decision**:
- **ADMIN_HR**: Can query any sector in their organization
- **CHIEF_AREA**: Can query sectors containing at least one of their assigned areas (via UserArea). Results show ALL areas in the sector, not just their own.
- **STAFF**: Same as CHIEF_AREA — can query sectors containing their assigned areas. Results show ALL areas.

**Rationale**: The whole point of sectors is cross-area visibility. Restricting results to only the user's own area would defeat the purpose. Access control happens at sector level (can you see this sector?), not at result level (can you see this area's shifts?).

**Alternatives considered**:
- Filtering results to only show user's own area shifts: Defeats the purpose. Rejected.
- No role restriction (any authenticated user sees all sectors): Violates FR-015/016. Rejected.

### D6: Sidebar Navigation Placement

**Decision**: Add "Sectores" nav item in sidebar with icon `Layers` (lucide-react), visible to `ADMIN_HR`, `CHIEF_AREA`, and `STAFF`. Position after "Áreas" in nav order.

**Rationale**: All three roles need sector access (ADMIN_HR to manage, CHIEF_AREA/STAFF to query). Using `Layers` icon visually represents stacked/grouped areas.

**Alternatives considered**:
- Only visible to ADMIN_HR: Would block the primary use case (staff querying sector). Rejected.
- Using `Building2` icon (same as areas): Confusing. A distinct icon helps differentiation. Rejected.

### D7: Shift Status Filter for Sector Query

**Decision**: Query only shifts with status `SCHEDULED` or `IN_PROGRESS`. Exclude `COMPLETED`, `CANCELLED`, `NO_SHOW`.

**Rationale**: The user asks "who IS on shift" (present/future). Showing completed or cancelled shifts would be noise. Matches the existing conflict-checking pattern. For past date queries, `SCHEDULED` shifts that haven't been marked as completed will still appear, which is acceptable.

**Alternatives considered**:
- Include COMPLETED for past queries: Adds complexity with dual logic. Deferred for future enhancement. Rejected for MVP.
- No status filter: Would show cancelled shifts, confusing users. Rejected.
