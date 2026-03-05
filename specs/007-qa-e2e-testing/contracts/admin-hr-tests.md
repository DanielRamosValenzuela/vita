# Test Contract: Workflows ADMIN_HR

## Dashboard y Metricas

### TC-AH-001: Dashboard ADMIN_HR
- **Rol**: ADMIN_HR (emiliano@gmail.com)
- **Ruta**: `/es/dashboard/admin-hr`
- **Esperado**: Metricas reales (areas, shift types, personal, contratos, turnos activos)

### TC-AH-002: Mi Organizacion
- **Ruta**: `/es/dashboard/admin-hr/organization`
- **Esperado**: Tarjetas de uso de cuentas, lista de jefes, staff e invitaciones pendientes

## Gestion de Areas

### TC-AH-003: Lista de areas
- **Ruta**: `/es/dashboard/areas`
- **Esperado**: Tabla con areas existentes

### TC-AH-004: Crear area
- **Ruta**: `/es/dashboard/areas/new`
- **Accion**: Llenar nombre, descripcion, icono, color
- **Esperado**: Area creada (inactiva por defecto), aparece en tabla

### TC-AH-005: Editar area - asignar shift types
- **Ruta**: `/es/dashboard/areas/[id]/edit`
- **Accion**: Asignar tipos de turno via SearchableAddableList
- **Esperado**: Tipos asociados guardados

### TC-AH-006: Editar area - asignar jefes
- **Accion**: Asignar jefe de area desde lista buscable
- **Esperado**: Jefe asignado, aparece en la seccion de jefes

### TC-AH-007: Activar area
- **Accion**: Activar area con al menos un shift type activo
- **Esperado**: Area cambia a activa

### TC-AH-008: Eliminar area
- **Accion**: Eliminar area de prueba via AlertDialog
- **Esperado**: Area eliminada de la tabla

## Tipos de Turno

### TC-AH-009: Lista de shift types
- **Ruta**: `/es/dashboard/shift-types`
- **Esperado**: Tabla con tipos existentes

### TC-AH-010: Crear shift type
- **Accion**: Crear tipo global con duracion, clasificacion, colores
- **Esperado**: Tipo aparece en lista

### TC-AH-011: Editar shift type
- **Accion**: Modificar duracion o clasificacion
- **Esperado**: Cambios guardados

## Tarifas y Contratos

### TC-AH-012: Lista de rate templates
- **Ruta**: `/es/dashboard/rates`
- **Esperado**: Tabla de plantillas y tabla de personal con contratos

### TC-AH-013: Crear rate template
- **Accion**: Crear plantilla con componentes (BASE_SALARY, NIGHT_SHIFT_BONUS, etc.)
- **Esperado**: Plantilla guardada con componentes

### TC-AH-014: Usar preset de tarifa
- **Accion**: Seleccionar preset predefinido
- **Esperado**: Componentes pre-llenados del preset

### TC-AH-015: Asignar contrato a usuario
- **Accion**: Desde tabla de personal, asignar tarifa
- **Esperado**: Contrato creado, visible en tabla
- **Validar en BD**: Nuevo Contract

### TC-AH-016: Finalizar contrato
- **Accion**: Finalizar contrato existente
- **Esperado**: Contrato marcado inactivo (no eliminado)

### TC-AH-017: Contrato duplicado
- **Accion**: Intentar asignar misma plantilla 2 veces al mismo usuario
- **Esperado**: Error de validacion

## Personal

### TC-AH-018: Lista de personal
- **Ruta**: `/es/dashboard/staff`
- **Esperado**: Tabla con nombre, email, rol, area, estado contrato, tarifa

### TC-AH-019: Alerta de personal sin contrato
- **Esperado**: Si hay staff sin contrato, alerta visible con conteo

## Invitaciones

### TC-AH-020: Invitar jefe de area
- **Ruta**: `/es/dashboard/admin-hr/organization`
- **Accion**: Buscar usuario por email, enviar invitacion CHIEF_AREA
- **Esperado**: Invitacion pendiente en tabla

### TC-AH-021: Invitar staff
- **Accion**: Buscar usuario, enviar invitacion STAFF
- **Esperado**: Invitacion pendiente

### TC-AH-022: Cancelar invitacion
- **Accion**: Cancelar invitacion pendiente
- **Esperado**: Invitacion removida de tabla

## Rotativas

### TC-AH-023: Lista de rotativas
- **Ruta**: `/es/dashboard/rotations`
- **Esperado**: Lista con rotativas existentes y alertas de cobertura

### TC-AH-024: Ver detalle de rotativa existente
- **Ruta**: `/es/dashboard/rotations/[id]`
- **Esperado**: Detalle con patron, grupos, miembros, cobertura

### TC-AH-025: Crear rotativa (si el area lo permite)
- **Accion**: Nueva rotativa con area, patron, grupos
- **Esperado**: Rotativa en DRAFT

### TC-AH-026: Asignar miembros a grupo
- **Accion**: Anadir staff disponible a grupo
- **Esperado**: Miembros aparecen en tarjeta de grupo

### TC-AH-027: Activar rotativa
- **Accion**: Cambiar de DRAFT a ACTIVE
- **Esperado**: Estado ACTIVE, patron bloqueado

### TC-AH-028: Generar turnos
- **Accion**: Seleccionar rango de fechas, confirmar
- **Esperado**: Turnos creados, preview de conflictos

## Calendario Organizacional

### TC-AH-029: Calendario organizacional
- **Ruta**: `/es/dashboard/calendar`
- **Esperado**: Calendario con dias especiales, navegacion entre meses

## Sectores

### TC-AH-030: Lista de sectores
- **Ruta**: `/es/dashboard/sectors`
- **Esperado**: Tabla con sectores existentes (o estado vacio)

## Payroll

### TC-AH-031: Pagina de nominas
- **Ruta**: `/es/dashboard/payroll`
- **Esperado**: Pagina funcional o estado "proximamente"
