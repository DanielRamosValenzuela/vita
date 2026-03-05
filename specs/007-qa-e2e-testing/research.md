# Research: QA End-to-End Testing

## Rutas del Dashboard (descubiertas en codebase)

### Rutas por rol esperado

**SUPER_ADMIN:**
- `/dashboard` - Dashboard principal
- `/dashboard/organizations` - Lista de organizaciones
- `/dashboard/organizations/new` - Crear organizacion
- `/dashboard/organizations/[id]` - Detalle organizacion
- `/dashboard/organizations/[id]/edit` - Editar organizacion
- `/dashboard/payments` - Pagos (pendiente?)

**ADMIN_HR:**
- `/dashboard` - Dashboard principal
- `/dashboard/admin-hr` - Dashboard ADMIN_HR con metricas
- `/dashboard/admin-hr/organization` - Mi Organizacion
- `/dashboard/admin-hr-users/[id]/edit` - Editar usuario
- `/dashboard/areas` - Gestion de areas
- `/dashboard/areas/new` - Nueva area
- `/dashboard/areas/[id]/edit` - Editar area
- `/dashboard/shift-types` - Tipos de turno
- `/dashboard/shifts` - Turnos
- `/dashboard/rates` - Tarifas y contratos
- `/dashboard/rates/guide` - Guia de tarifas
- `/dashboard/staff` - Personal
- `/dashboard/rotations` - Rotativas
- `/dashboard/rotations/[id]` - Detalle rotativa
- `/dashboard/calendar` - Calendario organizacional
- `/dashboard/payroll` - Nominas
- `/dashboard/sectors` - Sectores
- `/dashboard/sectors/new` - Nuevo sector
- `/dashboard/sectors/[id]/edit` - Editar sector
- `/dashboard/sectors/[id]/staff` - Staff de sector

**CHIEF_AREA:**
- `/dashboard` - Dashboard principal
- `/dashboard/areas` - Areas asignadas
- `/dashboard/staff` - Personal de sus areas
- `/dashboard/shifts` - Turnos de sus areas
- `/dashboard/rotations` - Rotativas de sus areas
- `/dashboard/rotations/[id]` - Detalle rotativa

**STAFF:**
- `/dashboard` - Calendario personal
- `/dashboard/inbox` - Bandeja de notificaciones
- `/dashboard/profile` - Perfil

**Transversal (todos los roles):**
- `/dashboard/profile` - Perfil personal
- `/dashboard/inbox` - Bandeja de entrada
- `/dashboard/settings` - Configuracion
- `/dashboard/requests` - Solicitudes (pendiente?)
- `/dashboard/analytics` - Analiticas (pendiente?)

## Estado de datos en BD

| Tabla | Registros | Notas |
|-------|-----------|-------|
| Organization | 2 | 1 activa ("Hospital vete al infierno") |
| User | 65 | 2 SUPER_ADMIN, 2 ADMIN_HR, 1 CHIEF_AREA, 60 STAFF |
| Area | 1 | Necesita verificacion de configuracion |
| ShiftType | 2 | Tipos activos a verificar |
| Shift | 323 | Suficientes para testing de calendario |
| Rotation | 1 | 1 rotativa para testing |
| RateTemplate | 2 | 2 plantillas para testing de tarifas |
| Contract | 59 | Contratos activos a verificar |
| Notification | 73 | Notificaciones existentes para testing |
| OrganizationInvitation | 7 | Invitaciones para testing |
| Sector | ? | Tabla nueva - verificar |
| CalendarNote | ? | Verificar si hay notas existentes |
| CalendarFeedToken | ? | Verificar tokens iCal |

## Decisiones de research

### Decision 1: Cuenta SUPER_ADMIN para testing
- **Decision**: Promover prueba10@gmail.com a SUPER_ADMIN via UPDATE en BD
- **Rationale**: No toca cuentas protegidas, cuenta ya existe, facil de revertir
- **SQL**: `UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'prueba10@gmail.com'`

### Decision 2: Alcance de workflows
- **Decision**: Testar implementados completos + verificar que pendientes no expongan UI rota
- **Rationale**: Detecta bugs funcionales Y botones/links muertos que degradan UX
- **Workflows pendientes a verificar**: intercambios de turno, postulaciones, vinculacion por codigo, reportes exportables

### Decision 3: Formato de reporte de bugs
- **Decision**: Incluir ubicacion de codigo (archivo:linea) + sugerencia de fix en cada bug
- **Rationale**: El usuario quiere reportes directamente accionables para el siguiente SPEC de correcciones

### Decision 4: Rutas nuevas descubiertas
- **Decision**: Testar rutas no documentadas en workflows (analytics, payments, payroll, sectors, requests, settings)
- **Rationale**: Pueden ser paginas parciales o en desarrollo que expongan errores
