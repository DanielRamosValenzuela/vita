# Data Model: Test Data State

Estado actual de los datos en Supabase para el QA E2E.

## Cuentas de prueba

| Email | Nombre | Rol actual | Org | Rol para QA |
|-------|--------|-----------|-----|-------------|
| daniel.andres.ramos.v@gmail.com | Daniel Ramos | SUPER_ADMIN | - | PROTEGIDO |
| luisgonel@gmail.com | Luis Alberto Gonel | SUPER_ADMIN | - | PROTEGIDO |
| prueba10@gmail.com | Prueba 10 | ADMIN_HR | - | SUPER_ADMIN (promover) |
| emiliano@gmail.com | Javer Perez | ADMIN_HR | Hospital vete al infierno | ADMIN_HR |
| javer@hospital.infierno.com | Javer Valenzuela | CHIEF_AREA | Hospital vete al infierno | CHIEF_AREA |
| prueba1@vita.test | Prueba 1 | STAFF | Hospital vete al infierno | STAFF (con turnos) |
| prueba2@vita.test | Prueba 2 | STAFF | Hospital vete al infierno | STAFF (perfil) |
| javer2@gmail.com | Javer R | STAFF | - | STAFF (sin org) |

## Organizaciones

| Nombre | ID | Estado | Usuarios |
|--------|-----|--------|----------|
| Hospital vete al infierno | cml9ztnzs0006boulaeocgod1 | Activa | ~60 |
| (segunda org) | TBD | Verificar | TBD |

## Datos disponibles para testing

- **323 turnos**: Suficientes para calendario STAFF y vista CHIEF/ADMIN
- **1 rotativa**: Para testar flujo de rotativas existente
- **2 plantillas de tarifa**: Para testar asignacion de contratos
- **59 contratos**: Para verificar vista de personal con/sin contrato
- **73 notificaciones**: Para testar bandeja de entrada
- **7 invitaciones**: Para testar flujo de invitaciones
- **1 area**: Necesita al menos 1 mas para testar filtrado por area en CHIEF

## Setup requerido antes de testing

1. `UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'prueba10@gmail.com'`
2. Verificar que prueba10@gmail.com puede hacer login
3. Verificar que el area tiene shift types y jefes asignados
