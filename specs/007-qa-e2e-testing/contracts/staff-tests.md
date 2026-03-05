# Test Contract: Workflows STAFF

## Calendario Personal

### TC-ST-001: Dashboard STAFF - Calendario
- **Rol**: STAFF (prueba1@vita.test)
- **Ruta**: `/es/dashboard`
- **Esperado**: Calendario mensual interactivo con turnos del mes
- **Validar**: Turnos diferenciados por color y tipo

### TC-ST-002: Navegacion entre meses
- **Accion**: Click en flechas de navegacion
- **Esperado**: Carga turnos del mes anterior/siguiente

### TC-ST-003: Click en turno - detalle
- **Accion**: Click en un turno del calendario
- **Esperado**: Panel lateral con detalle completo (tipo, hora, area, estado)
- **Esperado extra**: Lista de personal activo del mismo sector

### TC-ST-004: Deteccion de relevos
- **Esperado**: Si hay turnos consecutivos (gap <30min), muestra indicador de relevo

## Proximos Turnos

### TC-ST-005: Panel proximos turnos (7 dias)
- **Esperado**: Lista de turnos proximos con fechas relativas (Hoy, Manana, etc.)
- **Accion**: Click en turno de la lista -> navega al detalle

## Notas Personales

### TC-ST-006: Crear nota
- **Accion**: Click en dia del calendario -> popover -> escribir nota
- **Esperado**: Nota guardada, indicador visual (punto azul) en el dia

### TC-ST-007: Editar nota
- **Accion**: Click en dia con nota -> modificar texto
- **Esperado**: Nota actualizada

### TC-ST-008: Eliminar nota
- **Accion**: Click en dia con nota -> eliminar
- **Esperado**: Nota eliminada, indicador visual desaparece

### TC-ST-009: Limite de nota (500 caracteres)
- **Accion**: Intentar escribir mas de 500 caracteres
- **Esperado**: Truncado o validacion visible

## Exportacion iCal

### TC-ST-010: Descargar .ics
- **Accion**: Boton de exportar iCal
- **Esperado**: Descarga archivo .ics con turnos del mes

### TC-ST-011: Feed iCal por organizacion
- **Accion**: Crear token de suscripcion
- **Esperado**: URL generada para suscripcion externa

### TC-ST-012: Revocar token iCal
- **Accion**: Revocar token existente
- **Esperado**: Token eliminado, URL deja de funcionar

## Estado vacio

### TC-ST-013: STAFF sin turnos
- **Rol**: STAFF sin turnos (javer2@gmail.com o cuenta sin org)
- **Esperado**: Mensaje informativo de estado vacio, no error

## Bandeja de Notificaciones

### TC-ST-014: Ver notificaciones
- **Ruta**: `/es/dashboard/inbox`
- **Esperado**: Lista de notificaciones con icono, titulo, fecha relativa

### TC-ST-015: Filtrar notificaciones
- **Accion**: Usar filtros (todas/no leidas/leidas, por tipo)
- **Esperado**: Lista filtrada correctamente

### TC-ST-016: Marcar como leida
- **Accion**: Click en notificacion
- **Esperado**: Notificacion marcada como leida

### TC-ST-017: Marcar todas como leidas
- **Accion**: Boton "Marcar todas como leidas"
- **Esperado**: Todas cambian a leidas, badge desaparece

### TC-ST-018: Eliminar notificacion
- **Accion**: Eliminar notificacion con AlertDialog
- **Esperado**: Notificacion eliminada de la lista

## Perfil

### TC-ST-019: Editar documento
- **Ruta**: `/es/dashboard/profile`
- **Accion**: Cambiar tipo de documento o numero
- **Esperado**: Guardado, historial actualizado

### TC-ST-020: Agregar email secundario
- **Accion**: Agregar nuevo email
- **Esperado**: Email aparece como no verificado

### TC-ST-021: Subir avatar
- **Accion**: Subir imagen JPG/PNG/WEBP < 2MB
- **Esperado**: Avatar actualizado, preview visible

### TC-ST-022: Eliminar avatar
- **Accion**: Eliminar imagen custom
- **Esperado**: Fallback a iniciales o OAuth image

### TC-ST-023: Upload de avatar invalido
- **Accion**: Intentar subir archivo > 2MB o formato invalido
- **Esperado**: Error de validacion visible
