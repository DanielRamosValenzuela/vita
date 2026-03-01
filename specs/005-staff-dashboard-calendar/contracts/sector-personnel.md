# Contract: Sector Personnel Actions

**Feature**: 005-staff-dashboard-calendar
**Layer**: `src/features/staff-dashboard/api/sector-personnel-actions.ts`

## getSectorPersonnelForShiftAction

Obtiene el personal activo del sector al que pertenece el área de un turno, durante el rango horario de ese turno. Incluye detección de relevos.

**Auth**: `requireDashboardUser()` — STAFF_HEALTH, CHIEF_AREA, CHIEF_SECTOR
**Multi-tenant**: Filtra por `organizationId`

### Input

```typescript
interface GetSectorPersonnelParams {
  shiftId: string    // ID del turno seleccionado
}
```

### Output

```typescript
ActionResult<{
  shift: {
    id: string
    startTime: Date
    endTime: Date
    status: ShiftStatus
    area: { id: string; name: string; color: string; icon: string }
    shiftType: { name: string; color: string }
    isExtra: boolean
    rotation?: { name: string } | null
  }
  sector: {
    id: string
    name: string
    color: string
  } | null   // null si el área no pertenece a ningún sector
  areas: SectorAreaPersonnel[]
  totalStaff: number
}>

interface SectorAreaPersonnel {
  area: { id: string; name: string; icon: string; color: string }
  shifts: PersonnelShift[]
}

interface PersonnelShift {
  id: string
  userId: string
  userName: string
  shiftTypeName: string
  shiftTypeColor: string
  startTime: Date
  endTime: Date
  status: ShiftStatus
  isExtra: boolean
  relay?: {
    type: 'incoming' | 'outgoing'
    userId: string
    userName: string
  }
}
```

### Behavior

1. Obtiene sesión y organizationId
2. Fetch el turno con su área: `Shift.findUnique({ where: { id: shiftId }, include: { area, shiftType, rotation } })`
3. Valida que el turno pertenece al usuario autenticado
4. Busca sector del área: `SectorArea.findFirst({ where: { areaId: shift.areaId } })`
5. Si hay sector:
   - Obtiene todas las áreas del sector: `SectorArea.findMany({ where: { sectorId } })`
   - Busca shifts activos en todas esas áreas que se solapan con `shift.startTime` - `shift.endTime`
6. Si no hay sector:
   - Busca shifts activos solo en el área del turno
7. Aplica `detectRelays()` para marcar relevos (gap <=30 min en misma área)
8. Agrupa por área, calcula `totalStaff` (unique userIds)

### Errors

- `NOT_FOUND`: Turno no existe
- `FORBIDDEN`: Turno no pertenece al usuario autenticado
- `UNAUTHORIZED`: No autenticado
