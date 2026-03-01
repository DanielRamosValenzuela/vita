# Contract: iCal Feed Actions & Route Handler

**Feature**: 005-staff-dashboard-calendar

## Server Actions (`src/features/staff-dashboard/api/ical-actions.ts`)

### generateIcsFileAction

Genera un archivo .ics descargable con los turnos del mes seleccionado.

**Auth**: `requireDashboardUser()`

#### Input

```typescript
interface GenerateIcsParams {
  month: number  // 0-11
  year: number
}
```

#### Output

```typescript
ActionResult<{
  icsContent: string    // Contenido del archivo .ics (text/calendar)
  filename: string      // e.g. "turnos-marzo-2026.ics"
}>
```

#### Behavior

1. Obtiene sesión y organizationId
2. Fetch turnos del usuario en el mes/año con status `SCHEDULED | IN_PROGRESS`
3. Genera contenido iCal usando `ical-generator`:
   - VCALENDAR con PRODID y VERSION
   - VTIMEZONE para America/Santiago
   - Un VEVENT por turno:
     - UID: `shift-{shiftId}@vita.app`
     - SUMMARY: `Turno {shiftType.name} - {area.name}`
     - DTSTART/DTEND: con timezone
     - DESCRIPTION: estado, notas, rotación (si aplica)
     - LOCATION: área
4. Retorna string iCal y nombre de archivo sugerido

---

### getMyFeedTokensAction

Lista los tokens de feed iCal del usuario.

**Auth**: `requireDashboardUser()`

#### Output

```typescript
ActionResult<{
  tokens: {
    id: string
    organizationId: string | null
    organizationName: string | null
    feedUrl: string
    isActive: boolean
    createdAt: Date
  }[]
}>
```

---

### createFeedTokenAction

Crea (o regenera) un token de feed iCal.

**Auth**: `requireDashboardUser()`

#### Input

```typescript
interface CreateFeedTokenParams {
  type: 'per-org' | 'unified'
}
```

#### Behavior

1. Si `type === 'per-org'`: usa `organizationId` de la sesión
2. Si `type === 'unified'`: `organizationId = null`
3. Delete token existente con mismo `(userId, organizationId)`
4. Crea nuevo token con `crypto.randomUUID()`
5. Retorna URL completa del feed: `{baseUrl}/api/ical/{token}`

---

### revokeFeedTokenAction

Revoca un token de feed iCal.

**Auth**: `requireDashboardUser()`

#### Input

```typescript
{ tokenId: string }
```

#### Behavior

1. Valida que el token pertenece al usuario
2. Marca `isActive = false`

---

## Route Handler (`app/api/ical/[token]/route.ts`)

### GET /api/ical/:token

Endpoint público que retorna el feed iCal para un token dado.

**Auth**: Token-based (no sesión requerida)

#### Response

- **200**: `text/calendar; charset=utf-8` — contenido iCalendar
- **404**: Token no encontrado o revocado — retorna calendario vacío
- **Headers**:
  - `Content-Type: text/calendar; charset=utf-8`
  - `Content-Disposition: inline; filename="vita-shifts.ics"`
  - `Cache-Control: no-cache, no-store, must-revalidate`

#### Behavior

1. Busca `CalendarFeedToken` por `token` donde `isActive = true`
2. Si no existe: retorna calendario vacío (VCALENDAR sin VEVENT)
3. Si `organizationId` es null (unified): fetch turnos del usuario en todas las orgs
4. Si `organizationId` tiene valor (per-org): fetch turnos solo de esa org
5. Rango temporal: desde 3 meses atrás hasta todos los futuros
6. Excluye turnos CANCELLED y NO_SHOW
7. Genera contenido iCal con `ical-generator`
8. Retorna Response con headers apropiados
