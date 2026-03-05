# Test Contract: Workflows SUPER_ADMIN

## TC-SA-001: Dashboard SUPER_ADMIN
- **Rol**: SUPER_ADMIN (prueba10@gmail.com)
- **Ruta**: `/es/dashboard`
- **Esperado**: Ve dashboard con metricas globales o redireccion a organizations

## TC-SA-002: Lista de organizaciones
- **Ruta**: `/es/dashboard/organizations`
- **Esperado**: Tabla con organizaciones existentes, datos correctos

## TC-SA-003: Crear organizacion
- **Ruta**: `/es/dashboard/organizations/new`
- **Accion**: Llenar formulario (nombre, pais, plan, limites)
- **Esperado**: Organizacion creada, aparece en tabla
- **Validar en BD**: Nuevo registro en Organization

## TC-SA-004: Editar organizacion
- **Ruta**: `/es/dashboard/organizations/[id]/edit`
- **Accion**: Modificar nombre o limites
- **Esperado**: Cambios reflejados en tabla y BD

## TC-SA-005: Suspender organizacion
- **Ruta**: `/es/dashboard/organizations`
- **Accion**: Accion "Suspender" con razon obligatoria
- **Esperado**: Estado cambia a suspendida
- **Validar en BD**: status = SUSPENDED

## TC-SA-006: Reactivar organizacion
- **Accion**: Accion "Reactivar" sobre org suspendida
- **Esperado**: Estado vuelve a activa

## TC-SA-007: Eliminar organizacion (org de prueba)
- **Accion**: Accion "Eliminar" con confirmacion
- **Esperado**: Org eliminada de la tabla
- **NOTA**: Solo eliminar la org creada en TC-SA-003

## TC-SA-008: Validacion de limites
- **Accion**: Intentar bajar limites por debajo del uso actual
- **Esperado**: Error de validacion claro
