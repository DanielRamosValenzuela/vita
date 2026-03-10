# Data Model: QA Test Data

**Date**: 2026-03-10
**Branch**: 010-qa-happy-path-e2e

## Test Data Overview

Este documento describe los datos de prueba que se crearan durante el QA E2E.

## Entity: Organization

| Field | Value |
|-------|-------|
| name | Clinica Ejemplo Santiago |
| country | CL |
| currency | CLP |
| taxId | 76.432.198-5 |
| plan | PRO |
| maxAdminHR | 5 |
| maxChiefs | 10 |
| maxStaff | 150 |
| billingDay | 25 |
| contactName | Valentina Rojas Perez |
| contactEmail | vita.qa.adminhr1@gmail.com |

## Entity: Users (112 total)

### SUPER_ADMIN (1)

| Email | Name | Note |
|-------|------|------|
| prueba10@gmail.com | (existing) | Cuenta pre-existente |

### ADMIN_HR (1)

| Email | Name | RUT |
|-------|------|-----|
| vita.qa.adminhr1@gmail.com | Valentina Rojas Perez | 12.587.698-8 |

### CHIEFs (8)

| # | Email | Name | RUT | Target Role | Sector/Area |
|---|-------|------|-----|-------------|-------------|
| 2 | vita.qa.chief.uci1@gmail.com | Rodrigo Sepulveda Diaz | 15.234.567-K | CHIEF_SECTOR | UCI (S1) |
| 3 | vita.qa.chief.urg1@gmail.com | Camila Fernandez Lagos | 18.765.432-1 | CHIEF_SECTOR | Urgencias (S2) |
| 4 | vita.qa.chief.enf1@gmail.com | Andres Morales Pinto | 16.543.210-5 | CHIEF_AREA | Enfermeria UCI (A1) |
| 5 | vita.qa.chief.med1@gmail.com | Francisca Araya Contreras | 17.890.123-4 | CHIEF_AREA | Medicos UCI (A2) |
| 6 | vita.qa.chief.nut1@gmail.com | Diego Herrera Soto | 14.321.654-7 | CHIEF_AREA | Nutricionistas (A3) |
| 7 | vita.qa.chief.enf2@gmail.com | Javiera Tapia Munoz | 19.876.543-2 | CHIEF_AREA | Enfermeria Urg (A4) |
| 8 | vita.qa.chief.med2@gmail.com | Tomas Bravo Castillo | 13.456.789-0 | CHIEF_AREA | Medicos Urg (A5) |
| 9 | vita.qa.chief.nut2@gmail.com | Isidora Reyes Fuentes | 20.123.456-3 | CHIEF_AREA | Nutricionistas (A3) |

### STAFF Manual (2)

| Email | Name | RUT |
|-------|------|-----|
| vita.qa.staff.manual1@gmail.com | Matias Gonzalez Vera | 11.234.567-6 |
| vita.qa.staff.manual2@gmail.com | Constanza Silva Riquelme | 10.987.654-9 |

### STAFF Automatizado (100)

Emails: `vita.qa.staff.auto001@gmail.com` a `vita.qa.staff.auto100@gmail.com`
Nombres: 100 nombres chilenos unicos (generados en script)
RUTs: Generados algoritmicamente (base 21.000.000 a 21.000.099, con DV calculado)

## Entity: Sectors (2)

| Name | Description | Icon |
|------|-------------|------|
| Unidad de Cuidados Intensivos (UCI) | Sector de cuidados criticos y monitoreo continuo | Heart |
| Urgencias | Atencion de emergencias 24/7 | AlertTriangle |

## Entity: Areas (6)

| # | Name | Sector(s) | dayStartTime | dayEndTime |
|---|------|-----------|-------------|-----------|
| A1 | Enfermeria UCI | UCI | 08:00 | 20:00 |
| A2 | Medicos UCI | UCI | 08:00 | 18:00 |
| A3 | Nutricionistas | UCI + Urgencias | 08:00 | 18:00 |
| A4 | Enfermeria Urgencias | Urgencias | 08:00 | 20:00 |
| A5 | Medicos Urgencias | Urgencias | 08:00 | 18:00 |
| A6 | Tecnicos Urgencias | Urgencias | 07:00 | 18:00 |

## Entity: ShiftTypes (10)

| # | Name | Classification | Start | End | Duration | isGlobal | Areas |
|---|------|---------------|-------|-----|----------|----------|-------|
| 1 | Turno Diurno Normal | DAY | 08:00 | 17:00 | 540 | true | all |
| 2 | Turno Diurno Largo | DAY | 08:00 | 20:00 | 720 | true | all |
| 3 | Turno Nocturno | NIGHT | 20:00 | 08:00 | 720 | true | all |
| 4 | Tercer Turno | NIGHT | 22:00 | 06:00 | 480 | true | all |
| 5 | Cuarto Turno UCI | MIXED | 08:00 | 08:00 | 1440 | false | A1, A2 |
| 6 | Guardia Urgencias 24h | MIXED | 08:00 | 08:00 | 1440 | false | A4, A5 |
| 7 | Turno Manana Nutricion | DAY | 08:00 | 14:00 | 360 | false | A3 |
| 8 | Turno Tarde Nutricion | DAY | 14:00 | 18:00 | 240 | false | A3 |
| 9 | Turno Tecnico Estandar | DAY | 07:00 | 15:00 | 480 | false | A6 |
| 10 | Turno Tecnico Tarde | MIXED | 15:00 | 23:00 | 480 | false | A6 |

## Entity: RateTemplates (13)

### CHIEF Rates (3)

| Name | Components |
|------|-----------|
| Jefe de Sector Senior | BASE_SALARY $2.800.000/MONTHLY + RESPONSIBILITY_BONUS $400.000/MONTHLY + NIGHT_SHIFT_BONUS $25.000/PER_SHIFT (NIGHT only) |
| Jefe de Area Clinico | BASE_SALARY $2.200.000/MONTHLY + NIGHT_SHIFT_BONUS $20.000/PER_SHIFT + PER_MINUTE $800 |
| Jefe de Area Soporte | BASE_SALARY $1.800.000/MONTHLY + ATTENDANCE_BONUS $15.000/PER_SHIFT |

### STAFF Rates (10)

| # | Name | Components |
|---|------|-----------|
| T1 | Enfermera UCI Senior | BASE_SALARY $1.200.000/MONTHLY + SHIFT_DIFFERENTIAL $18.000/PER_SHIFT (DAY) + NIGHT_SHIFT_BONUS $28.000/PER_SHIFT + PER_MINUTE $600 |
| T2 | Enfermera UCI Junior | BASE_SALARY $850.000/MONTHLY + SHIFT_DIFFERENTIAL $15.000/PER_SHIFT (DAY) + NIGHT_SHIFT_BONUS $22.000/PER_SHIFT |
| T3 | Medico UCI | BASE_SALARY $1.800.000/MONTHLY + SHIFT_DIFFERENTIAL $35.000/PER_SHIFT + AREA_BONUS $200.000/MONTHLY |
| T4 | Medico Urgencias | BASE_SALARY $1.600.000/MONTHLY + SHIFT_DIFFERENTIAL $30.000/PER_SHIFT + PER_MINUTE $800 + AREA_BONUS $150.000/MONTHLY |
| T5 | Enfermera Urgencias | BASE_SALARY $1.100.000/MONTHLY + SHIFT_DIFFERENTIAL $16.000/PER_SHIFT + PER_MINUTE $500 |
| T6 | Nutricionista Senior | BASE_SALARY $900.000/MONTHLY + SHIFT_DIFFERENTIAL $12.000/PER_SHIFT + MEAL_ALLOWANCE $50.000/MONTHLY |
| T7 | Nutricionista Junior | BASE_SALARY $700.000/MONTHLY + SHIFT_DIFFERENTIAL $10.000/PER_SHIFT |
| T8 | Tecnico Urg Senior | BASE_SALARY $750.000/MONTHLY + SHIFT_DIFFERENTIAL $8.000/PER_SHIFT + PER_MINUTE $400 + NIGHT_SHIFT_BONUS $5.000/PER_SHIFT |
| T9 | Tecnico Urg Junior | BASE_SALARY $600.000/MONTHLY + SHIFT_DIFFERENTIAL $6.000/PER_SHIFT |
| T10 | Staff Polivalente | BASE_SALARY $1.000.000/MONTHLY + SHIFT_DIFFERENTIAL $20.000/PER_SHIFT + RETENTION_BONUS $100.000/MONTHLY |

## Entity: Staff-Area Distribution

| Area | Staff Count | Rate Assignment |
|------|------------|----------------|
| Enfermeria UCI (A1) | 25 | 13x T1, 12x T2 |
| Medicos UCI (A2) | 15 | 15x T3 |
| Nutricionistas (A3) | 12 | 6x T6, 6x T7 |
| Enfermeria Urgencias (A4) | 25 | 25x T5 |
| Medicos Urgencias (A5) | 15 | 15x T4 |
| Tecnicos Urgencias (A6) | 10 | 5x T8, 5x T9 |
| **Total** | **102** | |

**Doble tarifa**: 2 STAFF de Medicos UCI reciben T3 + T10.

## Entity: Organization Calendar

| Date | Type | Name | Multiplier |
|------|------|------|-----------|
| 2026-03-21 (sabado) | WEEKEND | Fin de semana | 1.5 |
| 2026-03-22 (domingo) | WEEKEND | Fin de semana | 1.5 |
| 2026-03-29 (domingo) | HOLIDAY | Semana Santa | 2.0 |
| 2026-04-01 | ORGANIZATION_HOLIDAY | Dia de la Clinica | 1.3 |
| 2026-05-01 | IRRENUNCIABLE | Dia del Trabajo | 2.0 |

## Entity: Rotations (7)

| # | Name | Area | Pattern | Groups |
|---|------|------|---------|--------|
| R1 | Rotativa 4to Turno Enfermeria | A1 | Cuarto Turno UCI → Rest → Rest | 4 groups x ~6 |
| R2 | Rotativa Diurno/Nocturno Enf | A1 | Day → Day → Night → Night → Rest → Rest | 3 groups x ~3 |
| R3 | Rotativa Guardias Medicos UCI | A2 | Cuarto Turno UCI → Rest → Rest | 3 groups x 5 |
| R4 | Rotativa Nutricion | A3 | Manana → Tarde → Rest | 2 groups x 6 |
| R5 | Rotativa 4to Turno Enf Urg | A4 | Guardia 24h → Rest → Rest | 4 groups x ~6 |
| R6 | Rotativa Guardias Med Urg | A5 | Guardia 24h → Rest → Rest | 3 groups x 5 |
| R7 | Rotativa Tecnicos | A6 | Estandar → Tarde → Rest | 2 groups x 5 |

## State Transitions

### Invitation: PENDING → ACCEPTED (happy path)
### Rotation: DRAFT → ACTIVE (after shift generation)
### Shift: SCHEDULED (generated by rotation)
### PayrollPeriod: GENERATING → COMPLETED
### SwapRequest: PENDING_PEER → PENDING_CHIEF → APPROVED (direct swap)
