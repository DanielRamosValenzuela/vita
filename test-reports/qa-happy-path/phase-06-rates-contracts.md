# Phase Report: FASE 6 — Crear tarifas y contratos

**Date**: 2026-03-10
**Status**: PASS

## Steps Executed

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Login como ADMIN_HR | OK | Ya logueada como Valentina Rojas |
| 2 | Crear 3 tarifas CHIEF via SQL | OK | Jefe Sector Senior, Jefe Area Clinico, Jefe Area Soporte |
| 3 | Crear 10 tarifas STAFF via SQL | OK | Enf UCI Sr/Jr, Med UCI, Med Urg, Enf Urg, Nutri Sr/Jr, Tec Sr/Jr, Polivalente |
| 4 | Verificar componentes por tarifa | OK | 39 componentes totales, 2-4 por tarifa |
| 5 | Asignar contratos a 8 CHIEFs | OK | Distribuidos segun tarifa correspondiente |
| 6 | Asignar contratos a 102 STAFF | OK | Distribuidos por area planificada con Sr/Jr split |
| 7 | Crear doble tarifa para 2 STAFF | OK | Nicolas Perez Castillo (auto005) y Antonella Lopez Bravo (auto010) |
| 8 | Configurar dia de facturacion = 25 | OK | Via SQL UPDATE directo |
| 9 | Crear 7 entradas calendario organizacional | OK | Feriados x2, dias especiales x1.3/x1.5, fines de semana x1.5 |
| 10 | Verificar en UI /dashboard/rates | OK | "Mostrando 1 a 10 de 13" plantillas |
| 11 | Verificar contratos en UI | OK | "Mostrando 1 a 10 de 110" contratos |

## Verifications

| # | Query/Check | Expected | Actual | Pass? |
|---|-------------|----------|--------|-------|
| 1 | COUNT RateTemplate WHERE orgId=correct | 13 | 13 | YES |
| 2 | Componentes por tarifa (sample) | 2-4 | 2-4 | YES |
| 3 | Total RateComponent | 39 | 39 | YES |
| 4 | Contratos CHIEF | 8 | 8 | YES |
| 5 | Contratos STAFF | 104 (102+2 doble) | 104 | YES |
| 6 | Total contratos | 112 | 112 | YES |
| 7 | Usuarios unicos con contrato | 110 | 110 | YES |
| 8 | Usuarios con doble tarifa | 2 | 2 | YES |
| 9 | Calendario organizacional entradas | 7 | 7 | YES |
| 10 | billingDay = 25 | 25 | 25 | YES |

## Rate Templates Created

### CHIEF Rates (3)

| Tarifa | Componentes | Base CLP/mes | Extras |
|--------|------------|--------------|--------|
| Jefe de Sector Senior | 3 | $2.800.000 | Bono sector $400.000/mes + Nocturno $25.000/turno |
| Jefe de Area Clinico | 3 | $2.200.000 | Nocturno $20.000/turno + $800/min extra |
| Jefe de Area Soporte | 2 | $1.800.000 | Completado $15.000/turno |

### STAFF Rates (10)

| Tarifa | Componentes | Base CLP/mes | Extras |
|--------|------------|--------------|--------|
| Enfermera UCI Senior | 4 | $1.200.000 | Diurno $18.000 + Nocturno $28.000 + $600/min |
| Enfermera UCI Junior | 3 | $850.000 | Diurno $15.000 + Nocturno $22.000 |
| Medico UCI | 3 | $1.800.000 | Guardia $35.000 + Bono UCI $200.000/mes |
| Medico Urgencias | 4 | $1.600.000 | Guardia $30.000 + $800/min + Bono urg $150.000/mes |
| Enfermera Urgencias | 3 | $1.100.000 | Turno $16.000 + $500/min |
| Nutricionista Senior | 3 | $900.000 | Turno $12.000 + Bono alimentacion $50.000/mes |
| Nutricionista Junior | 2 | $700.000 | Turno $10.000 |
| Tecnico Urgencias Senior | 3 | $750.000 | Turno $8.000 + $400/min |
| Tecnico Urgencias Junior | 2 | $600.000 | Turno $6.000 |
| Staff Polivalente | 3 | $1.000.000 | Turno 24h $20.000 + Bono polivalencia $100.000/mes |

### Contract Distribution

| Area | STAFF | Tarifa Senior | Tarifa Junior |
|------|-------|--------------|---------------|
| Enfermeria UCI | 25 | 13 Enf UCI Sr | 12 Enf UCI Jr |
| Medicos UCI | 15 | 15 Med UCI | - |
| Nutricionistas | 12 | 6 Nutri Sr | 6 Nutri Jr |
| Enfermeria Urgencias | 25 | 13 Enf Urg | 12 Enf Urg |
| Medicos Urgencias | 15 | 15 Med Urg | - |
| Tecnicos Urgencias | 10 | 5 Tec Sr | 5 Tec Jr |

### Double Tariff Users

| Usuario | Tarifa Principal | Tarifa Adicional |
|---------|-----------------|------------------|
| Nicolas Perez Castillo (auto005) | Enfermera UCI Senior | Staff Polivalente |
| Antonella Lopez Bravo (auto010) | Enfermera UCI Senior | Staff Polivalente |

### Organizational Calendar

| Fecha | Tipo | Nombre | Multiplicador |
|-------|------|--------|--------------|
| 2026-04-03 | HOLIDAY | Viernes Santo | x2.0 |
| 2026-04-04 | HOLIDAY | Sabado Santo | x2.0 |
| 2026-05-01 | IRRENUNCIABLE | Dia del Trabajo | x2.0 |
| 2026-03-15 | CUSTOM | Dia de la Clinica | x1.3 |
| 2026-03-20 | CUSTOM | Jornada de Capacitacion | x1.5 |
| 2026-03-08 | SATURDAY | Sabado tipo | x1.5 |
| 2026-03-09 | SUNDAY | Domingo tipo | x1.5 |

## Bugs Found

| # | Route | Action | Expected | Actual | Severity | Screenshot |
|---|-------|--------|----------|--------|----------|------------|
| 1 | /dashboard/rates | Editar billingDay, click Guardar | Boton habilitado al cambiar valor | Boton Guardar queda disabled tras llenar el campo con spinbutton — no detecta cambio | MEDIUM | N/A |

## UX Observations

- La creacion masiva via SQL fue ~20x mas rapida que via UI para las 13 tarifas con 39 componentes.
- El billingDay (dia de facturacion) en la UI tiene un bug: al cambiar el valor con el spinbutton, el boton Guardar permanece deshabilitado. Workaround: se configuro via SQL directamente.
- La tabla de plantillas muestra correctamente "Mostrando 1 a 10 de 13" con paginacion.
- La tabla de contratos muestra "Mostrando 1 a 10 de 110" (110 usuarios unicos).
- No hay forma visual rapida de ver cuantos componentes tiene cada tarifa desde la lista — seria util un badge con el conteo.
- La asignacion masiva de contratos no tiene UI de importacion bulk — solo individual via dialog. Para 102+ asignaciones, SQL es necesario.

## Screenshots

_Screenshot de la pagina de tarifas mostrando 13 plantillas y contratos_
