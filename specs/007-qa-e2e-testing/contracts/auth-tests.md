# Test Contract: Autenticacion y Autorizacion

## TC-AUTH-001: Login con credenciales validas
- **Rol**: ADMIN_HR (emiliano@gmail.com)
- **Ruta**: `/es/login`
- **Accion**: Ingresar email + contrasena + click Iniciar sesion
- **Esperado**: Redireccion a `/es/dashboard`, nombre visible en navbar
- **Validar en BD**: Session activa para el usuario

## TC-AUTH-002: Login con credenciales invalidas
- **Rol**: Cualquiera
- **Ruta**: `/es/login`
- **Accion**: Ingresar email correcto + contrasena incorrecta
- **Esperado**: Mensaje de error visible, NO redireccion

## TC-AUTH-003: Login con email inexistente
- **Rol**: N/A
- **Ruta**: `/es/login`
- **Accion**: Ingresar email que no existe
- **Esperado**: Mensaje de error generico (no revelar si email existe)

## TC-AUTH-004: Acceso a ruta protegida sin autenticacion
- **Rol**: No autenticado
- **Ruta**: `/es/dashboard` (acceso directo por URL)
- **Esperado**: Redireccion a `/es/login`

## TC-AUTH-005: STAFF accede a ruta de SUPER_ADMIN
- **Rol**: STAFF (prueba1@vita.test)
- **Ruta**: `/es/dashboard/organizations`
- **Esperado**: Redireccion o pagina de acceso denegado

## TC-AUTH-006: CHIEF_AREA accede a ruta de ADMIN_HR
- **Rol**: CHIEF_AREA (javer@hospital.infierno.com)
- **Ruta**: `/es/dashboard/admin-hr/organization`
- **Esperado**: Redireccion o acceso denegado

## TC-AUTH-007: STAFF accede a ruta de ADMIN_HR
- **Rol**: STAFF (prueba1@vita.test)
- **Ruta**: `/es/dashboard/admin-hr`
- **Esperado**: Redireccion o acceso denegado

## TC-AUTH-008: Logout
- **Rol**: Cualquiera autenticado
- **Accion**: Click en avatar -> Cerrar sesion
- **Esperado**: Redireccion a landing o login, no puede acceder a dashboard

## TC-AUTH-009: Login como cada rol
- **Roles**: SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF
- **Accion**: Login secuencial con cada cuenta
- **Esperado**: Cada uno ve su dashboard correspondiente
