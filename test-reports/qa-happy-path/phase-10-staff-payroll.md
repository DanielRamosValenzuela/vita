# Phase Report: FASE 10 — Verificar vista STAFF y nómina

**Date**: 2026-03-10
**Status**: PASS (with bugs)

## Steps Executed

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Login como STAFF (Matías González) | OK | Dashboard "Mi Calendario" cargado correctamente |
| 2 | Verificar calendario con turnos | OK | Marzo 2026 muestra turnos Técnico Estándar/Tarde alternando |
| 3 | Verificar panel Próximos Turnos | OK | 4+ turnos visibles con fecha, horario, área |
| 4 | Verificar tooltip de turno | OK | Muestra tipo, horario (04:00–12:00), área (Técnicos Urgencias), "1 persona" |
| 5 | Verificar Bandeja de entrada | OK | 1 notificación: invitación de Valentina Rojas. Filtros por tipo funcionan |
| 6 | Verificar vista Sectores | OK | Solo muestra sector Urgencias (1 de 2) — filtrado por área del usuario |
| 7 | Verificar Mis Pagos (antes de generar) | OK | "No hay períodos de nómina generados" |
| 8 | Exportar iCal — menú | OK | 4 opciones: descargar .ics, suscripción org, suscripción todas orgs, gestionar feeds |
| 9 | Suscripción iCal creada | OK | Token en CalendarFeedToken confirmado en BD |
| 10 | Login como ADMIN_HR | OK | Dashboard de administrador |
| 11 | Generar nómina Febrero 2026 | OK | 110 documentos, $152.457.143 CLP, ~2 min procesamiento |
| 12 | Verificar período completado | OK | Badge "Completado" en tarjeta de período |
| 13 | Login como CHIEF (Andrés Morales) | OK | Ve período en sección "Pagos" sin botón generar |
| 14 | Login como STAFF — verificar nómina | OK | Ve período en sección "Mis Pagos", 2 notificaciones en bandeja |

## Verifications

| # | Query/Check | Expected | Actual | Pass? |
|---|-------------|----------|--------|-------|
| 1 | STAFF ve calendario Marzo | Turnos asignados visibles | ~15 turnos visibles (Técnico Estándar/Tarde) | YES |
| 2 | Panel Próximos Turnos | Turnos con fecha y área | 4 turnos visibles con detalles | YES |
| 3 | Tooltip de turno | Tipo, horario, área, personal | "Turno Tecnico Estandar 04:00-12:00 Tecnicos Urgencias 1 persona" | YES |
| 4 | Bandeja de entrada STAFF | Notificaciones visibles | 1 notificación (invitación), filtros por tipo | YES |
| 5 | Sectores STAFF | Solo sector del usuario | Urgencias (1 de 2) — correcto | YES |
| 6 | Exportar iCal token | Token creado en BD | CalendarFeedToken con userId y organizationId | YES |
| 7 | PayrollPeriod status | COMPLETED | COMPLETED | YES |
| 8 | PayrollDocument count | ~110 | 110 | YES |
| 9 | Total nómina | >$0 | $152,457,142.62 CLP | YES |
| 10 | ADMIN_HR ve botón generar | Sí | Sí, con selector mes/año | YES |
| 11 | CHIEF NO ve botón generar | No | Correcto, solo ve período | YES |
| 12 | STAFF notificaciones post-nómina | 2 (invitación + nómina) | 2 | YES |

## Payroll Breakdown (Sample)

| Rol/Usuario | Total | Base | Turnos | Componentes Mensuales |
|-------------|-------|------|--------|----------------------|
| Jefe Sector (Rodrigo) | $3,314,286 | $2,900,000 | $0 | $414,286 |
| Jefe Sector (Camila) | $3,314,286 | $2,900,000 | $0 | $414,286 |
| Doble tarifa (Antonella) | $2,382,143 | $2,278,571 | $0 | $103,571 |
| Doble tarifa (Nicolas) | $2,382,143 | $2,278,571 | $0 | $103,571 |
| Jefe Área Clínico (Andrés) | $2,278,571 | $2,278,571 | $0 | $0 |
| Médico UCI (staff) | $2,071,429 | $1,864,286 | $0 | $207,143 |
| Enfermera UCI Sr (staff) | $1,342,857 | $1,242,857 | $0 | $100,000 (estimado) |
| Técnico Jr (Matías) | $621,429 | $621,429 | $0 | $0 |

**Nota**: shiftsAmount = $0 para todos porque los turnos generados son de Marzo (SCHEDULED), no Febrero. El cálculo de turnos requiere status COMPLETED + ShiftPayment. Base salary está correctamente prorrateado (29 días de contrato / 28 días de febrero).

## Bugs Found

| # | Route | Action | Expected | Actual | Severity | Screenshot |
|---|-------|--------|----------|--------|----------|------------|
| 1 | /dashboard/payroll | CHIEF ve tarjeta período | Mostrar solo documentos de su área (~25) | Muestra 110 documentos y $152.457.143 (total org) | MEDIUM | fase10-chief-payroll.png |
| 2 | /dashboard/payroll | STAFF ve tarjeta período | Mostrar solo 1 documento y monto personal | Muestra 110 documentos y $152.457.143 (total org) | HIGH | fase10-staff-payroll-after.png |
| 3 | Payroll generation | shiftsAmount debería reflejar turnos | Cálculo de turnos con componentes | $0 para todos — requiere flujo SCHEDULED → COMPLETED + ShiftPayment | LOW (workflow gap, no bug) |

## UX Observations

- **Exportar iCal**: Excelente UX — menú desplegable con 3 opciones de exportación + gestionar feeds. URL se copia al portapapeles automáticamente sin dialog intrusivo.
- **Calendario STAFF**: El tooltip al hover es informativo (tipo, horario, área, personal). Los turnos se muestran con íconos de reloj y conteo.
- **Panel Próximos Turnos**: Muy útil — muestra los próximos turnos con día/fecha, horario y badge de área.
- **Bandeja de entrada**: Filtros por categoría (Invitaciones, Turnos, Áreas, Nómina, General) son intuitivos. Toggle Todas/No leídas/Leídas funciona bien.
- **Sidebar diferenciado por rol**: ADMIN_HR ve "Nómina", CHIEF ve "Pagos", STAFF ve "Mis Pagos" — buena nomenclatura contextual.
- **Generación de nómina ~2 min para 110 docs**: El botón muestra "Generando documentos..." con loading state. La tarjeta pasa de "Generando" (0 docs) a "Completado" (110 docs). El feedback podría mejorar con una barra de progreso o contador en tiempo real.
- **BUG de visibilidad**: La tarjeta de período muestra datos globales a todos los roles. CHIEF y STAFF no deberían ver el total de la organización — esto podría causar confusión o ser un problema de privacidad salarial.
- **Nombres de sección en sidebar**: "Mis Pagos" para STAFF es claro. "Pagos" para CHIEF podría ser "Nómina de mi Área" para mayor claridad.
- **Notificaciones de nómina**: Se generan correctamente y aparecen en la bandeja del STAFF (2 notificaciones: invitación + nómina).

## Scripts Used

- Contratos backdateados a 2026-01-01 via SQL UPDATE para habilitar nómina de Febrero

## Screenshots

- `fase10-staff-dashboard.png` — Dashboard STAFF con calendario y próximos turnos
- `fase10-staff-shift-detail.png` — Tooltip de detalle de turno
- `fase10-staff-export-dialog.png` — Menú exportar iCal con 4 opciones
- `fase10-staff-inbox.png` — Bandeja de entrada con notificación de invitación
- `fase10-staff-sectors.png` — Vista Sectores filtrada (solo Urgencias)
- `fase10-staff-mispagos.png` — Mis Pagos antes de generar nómina
- `fase10-adminhr-payroll.png` — Vista ADMIN_HR con formulario generar nómina
- `fase10-payroll-confirm.png` — Estado "Generando documentos..."
- `fase10-payroll-completed.png` — Período completado: 110 docs, $152.457.143
- `fase10-chief-payroll.png` — Vista CHIEF (Jefe de Área) de nómina
- `fase10-staff-payroll-after.png` — Vista STAFF post-generación
