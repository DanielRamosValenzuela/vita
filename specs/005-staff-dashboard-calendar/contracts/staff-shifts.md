# Contract: Staff Shifts Actions

**Feature**: 005-staff-dashboard-calendar
**Layer**: `src/features/staff-dashboard/api/staff-shifts-actions.ts`

## getMyShiftsAction

Obtiene los turnos del usuario autenticado para un rango de fechas.

**Auth**: `requireDashboardUser()` — STAFF_HEALTH, CHIEF_AREA, CHIEF_SECTOR
**Multi-tenant**: Filtra por `organizationId` de la sesión activa

### Input

```typescript
interface GetMyShiftsParams {
  startDate: Date    // Inicio del rango (inclusive)
  endDate: Date      // Fin del rango (exclusive)
  status?: ShiftStatus | ''  // Opcional: filtrar por estado
}
```

### Output

```typescript
ActionResult<{
  shifts: ShiftWithRelations[]
}>
```

### Behavior

1. Obtiene sesión con `requireDashboardUser()`
2. Resuelve `organizationId` (para CHIEF usa `resolveChiefOrganizationId`)
3. Query: `Shift.where({ userId: session.user.id, organizationId, startTime >= startDate, startTime < endDate })`
4. Include: `user`, `area`, `shiftType`, `rotation`
5. OrderBy: `startTime ASC`
6. Retorna todos los turnos sin paginación (max ~30/mes por usuario)

### Errors

- `UNAUTHORIZED`: Usuario no autenticado
- `FORBIDDEN`: Rol no permitido (SUPER_ADMIN, ADMIN_HR no usan esta action)

---

## getUpcomingShiftsAction

Obtiene los próximos turnos del usuario (7 días).

**Auth**: `requireDashboardUser()`
**Multi-tenant**: Filtra por `organizationId`

### Input

Ninguno (usa fecha actual del servidor).

### Output

```typescript
ActionResult<{
  shifts: ShiftWithRelations[]
}>
```

### Behavior

1. Calcula rango: `now` → `now + 7 days`
2. Query: turnos del usuario con `status IN (SCHEDULED, IN_PROGRESS)` en ese rango
3. Include: `area`, `shiftType`
4. OrderBy: `startTime ASC`
5. Limit: 10 (suficiente para 7 días)

---

## getMyShiftsAllOrgsAction

Obtiene turnos del usuario en TODAS las organizaciones (para feed unificado).

**Auth**: Token-based (llamada interna desde Route Handler del feed iCal)
**Multi-tenant**: NO filtra por org (es el propósito del feed unificado)

### Input

```typescript
interface GetMyShiftsAllOrgsParams {
  userId: string     // Del token validado
  startDate: Date
  endDate: Date
}
```

### Output

```typescript
ActionResult<{
  shifts: (ShiftWithRelations & { organizationName: string })[]
}>
```

### Behavior

1. NO usa sesión (llamada interna con userId del token)
2. Query: `Shift.where({ userId, startTime >= startDate, status IN (SCHEDULED, IN_PROGRESS, COMPLETED) })`
3. Include: `area`, `shiftType`, `organization { name }`
4. OrderBy: `startTime ASC`
