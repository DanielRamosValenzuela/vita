# Test Contract: Workflows CHIEF_AREA

## TC-CA-001: Dashboard CHIEF_AREA
- **Rol**: CHIEF_AREA (javer@hospital.infierno.com)
- **Ruta**: `/es/dashboard`
- **Esperado**: Dashboard con informacion de sus areas

## TC-CA-002: Areas asignadas
- **Ruta**: `/es/dashboard/areas`
- **Esperado**: Solo ve areas donde esta asignado via UserArea
- **Validar**: Si tiene 0 areas, ve mensaje de ayuda

## TC-CA-003: Personal filtrado por area
- **Ruta**: `/es/dashboard/staff`
- **Esperado**: Solo ve staff con contrato en sus areas (no todo el personal de la org)
- **Validar en BD**: Cruzar UserArea + Contract.areaId

## TC-CA-004: Turnos de sus areas
- **Ruta**: `/es/dashboard/shifts`
- **Esperado**: Solo turnos de sus areas
- **Accion extra**: Intentar crear turno - solo debe mostrar sus areas en selector

## TC-CA-005: Rotativas de sus areas
- **Ruta**: `/es/dashboard/rotations`
- **Esperado**: Solo rotativas de areas asignadas

## TC-CA-006: NO puede acceder a admin-hr
- **Ruta**: `/es/dashboard/admin-hr`
- **Esperado**: Redireccion o acceso denegado

## TC-CA-007: NO puede acceder a organizations
- **Ruta**: `/es/dashboard/organizations`
- **Esperado**: Redireccion o acceso denegado

## TC-CA-008: NO puede ver shift types globales (solo los de sus areas)
- **Ruta**: `/es/dashboard/shift-types`
- **Esperado**: Solo ve tipos de turno asignados a sus areas o acceso limitado

## TC-CA-009: NO puede gestionar tarifas
- **Ruta**: `/es/dashboard/rates`
- **Esperado**: Redireccion o acceso denegado
