# Test Contract: UI/UX y Consistencia Visual

## Responsive

### TC-UX-001: Dashboard responsive desktop
- **Viewport**: >= 1024px
- **Esperado**: Sidebar fija a la izquierda, contenido al lado

### TC-UX-002: Dashboard responsive mobile
- **Viewport**: < 768px
- **Esperado**: Sidebar oculta, boton hamburguesa, Sheet/drawer con navegacion

### TC-UX-003: Navegacion mobile cierra drawer
- **Accion**: Abrir drawer, click en enlace
- **Esperado**: Drawer se cierra, pagina cambia

## i18n

### TC-UX-004: Textos traducidos en dashboard
- **Ruta**: Todas las paginas del dashboard
- **Esperado**: No hay textos en ingles sin traducir (literales hardcodeados)

### TC-UX-005: Formato de fechas (Chile)
- **Esperado**: Formato dd/MM/yyyy, separador miles con punto

### TC-UX-006: Formato de moneda (Chile)
- **Esperado**: $1.000.000 (punto como separador de miles)

## Estados de carga

### TC-UX-007: Loading en formularios
- **Accion**: Submit de cualquier formulario
- **Esperado**: Boton deshabilitado con texto "Guardando..." o spinner

### TC-UX-008: Skeleton loading
- **Accion**: Navegar a pagina con datos
- **Esperado**: Skeleton o spinner mientras carga datos

## Mensajes de error

### TC-UX-009: Error en formulario
- **Accion**: Enviar formulario con campos requeridos vacios
- **Esperado**: Mensajes de error por campo (Zod validation)

### TC-UX-010: Toast de exito/error
- **Accion**: Ejecutar accion exitosa / fallida
- **Esperado**: Toast notification visible con mensaje apropiado

## Estados vacios

### TC-UX-011: Pagina sin datos
- **Ejemplo**: Area sin turnos, staff sin contrato, inbox vacio
- **Esperado**: Mensaje informativo, no tabla vacia sin explicacion

## Rutas pendientes / no implementadas

### TC-UX-012: /dashboard/analytics
- **Esperado**: Pagina funcional o "proximamente", NO error 500

### TC-UX-013: /dashboard/payments
- **Esperado**: Pagina funcional o "proximamente", NO error 500

### TC-UX-014: /dashboard/requests
- **Esperado**: Pagina funcional o "proximamente", NO error 500

### TC-UX-015: /dashboard/settings
- **Esperado**: Pagina funcional o "proximamente", NO error 500
