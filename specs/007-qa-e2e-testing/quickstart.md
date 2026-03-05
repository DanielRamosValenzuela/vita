# Quickstart: QA End-to-End Testing

## Pre-requisitos

1. Servidor corriendo: `npm run dev` (puerto 3001 o disponible)
2. Browser MCP extension conectada en Chrome
3. Supabase MCP disponible para consultas BD

## Setup inicial

```sql
-- Promover cuenta de prueba a SUPER_ADMIN
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'prueba10@gmail.com';
```

## Credenciales

- **Contrasena universal**: `123qweASD.`
- **NO USAR**: daniel.andres.ramos.v@gmail.com, luisgonel@gmail.com

## Orden de ejecucion

1. Setup BD (promover SUPER_ADMIN)
2. Auth tests (login/logout/rutas protegidas)
3. SUPER_ADMIN tests (CRUD organizaciones)
4. ADMIN_HR tests (areas, shift types, rates, staff, invitaciones)
5. ADMIN_HR rotations tests
6. CHIEF_AREA tests (vistas filtradas, turnos)
7. STAFF tests (calendario, notas, iCal)
8. Profile tests (documento, emails, avatar)
9. Notifications tests (inbox)
10. UI/UX tests (responsive, i18n, estados)
11. Generar reportes en `/test-reports/`

## Output esperado

Reportes en `/test-reports/` con bugs priorizados por severidad e indicando ubicacion exacta del codigo a corregir.
