# Contract: Google Calendar Actions (P5 - Diferible)

**Feature**: 005-staff-dashboard-calendar
**Priority**: P5 — puede implementarse en iteración posterior
**Layer**: `src/features/staff-dashboard/api/google-calendar-actions.ts`

## connectGoogleCalendarAction

Inicia el flujo OAuth con Google. Genera la URL de autorización.

**Auth**: `requireDashboardUser()`

### Output

```typescript
ActionResult<{
  authUrl: string    // URL de Google OAuth consent screen
}>
```

### Behavior

1. Configura OAuth2 client con credentials de la app
2. Scope: `https://www.googleapis.com/auth/calendar.readonly`
3. Genera state token (CSRF protection) almacenado en sesión
4. Retorna URL de autorización con redirect_uri al callback de la app

---

## handleGoogleCallbackAction

Procesa el callback de Google OAuth después del consent.

**Auth**: `requireDashboardUser()`

### Input

```typescript
interface GoogleCallbackParams {
  code: string    // Authorization code de Google
  state: string   // CSRF state token
}
```

### Output

```typescript
ActionResult<{ connected: boolean }>
```

### Behavior

1. Valida state token contra sesión
2. Exchange code por access_token + refresh_token
3. Crea/actualiza `GoogleCalendarConnection` en BD
4. Revalida paths del dashboard

---

## getGoogleCalendarEventsAction

Obtiene eventos del Google Calendar conectado para el mes visible.

**Auth**: `requireDashboardUser()`

### Input

```typescript
interface GetGoogleEventsParams {
  startDate: Date
  endDate: Date
}
```

### Output

```typescript
ActionResult<{
  events: GoogleCalendarEvent[]
  connected: boolean
}>

interface GoogleCalendarEvent {
  id: string
  summary: string
  startTime: Date
  endTime: Date
  isAllDay: boolean
  color?: string
}
```

### Behavior

1. Busca `GoogleCalendarConnection` del usuario
2. Si no existe: retorna `{ events: [], connected: false }`
3. Si access_token expirado: refresh con refresh_token
4. Fetch eventos vía Google Calendar API v3: `events.list()`
5. Transforma a formato interno `GoogleCalendarEvent`
6. Si Google API falla: retorna `{ events: [], connected: true }` con warning

---

## disconnectGoogleCalendarAction

Desconecta Google Calendar y revoca tokens.

**Auth**: `requireDashboardUser()`

### Output

```typescript
ActionResult<{ disconnected: boolean }>
```

### Behavior

1. Busca `GoogleCalendarConnection` del usuario
2. Revoca token en Google API (best-effort)
3. Elimina registro de BD
4. Revalida paths
