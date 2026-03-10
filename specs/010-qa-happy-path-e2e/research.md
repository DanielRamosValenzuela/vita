# Research: QA Happy Path E2E

**Date**: 2026-03-10
**Branch**: 010-qa-happy-path-e2e

## R1: User Roles and Auth System

**Decision**: Usar NextAuth v4 Credentials provider para login/registro. Los roles disponibles son: SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, CHIEF_SECTOR, STAFF.

**Rationale**: El sistema ya tiene CHIEF_SECTOR como rol separado de CHIEF_AREA. Los jefes de sector (#2 Rodrigo, #3 Camila) deben usar este rol o ser promovidos post-invitacion.

**Alternatives considered**:
- Invitar todos como CHIEF_AREA y diferenciar solo por UserSector → No aprovecha el rol dedicado
- Crear via Supabase MCP con rol CHIEF_SECTOR directo → Mas rapido pero no prueba el flujo UI

**Impact on QA**: Al registrar via UI todos obtienen rol por defecto. La invitacion asigna rol. Verificar si existe la opcion CHIEF_SECTOR en el formulario de invitacion.

## R2: ShiftType Classification Values

**Decision**: Usar DAY, NIGHT, MIXED como clasificaciones (no MORNING/AFTERNOON/NIGHT/CUSTOM).

**Rationale**: El enum en Prisma es `DAY | NIGHT | MIXED`. Turnos que cruzan dia/noche (como cuarto turno 08:00-08:00) son MIXED.

**Alternatives considered**: N/A - definido por el schema.

**Impact on QA**: Actualizar los 10 tipos de turno para usar las clasificaciones correctas del enum.

## R3: Shift Swap UI Availability

**Decision**: La UI de Shift Swap EXISTE y debe probarse (Phase 11 no se salta).

**Rationale**: Se encontraron componentes completos en `/src/features/shift-swap/ui/`:
- `swap-request-form.tsx` (swap directo)
- `open-swap-form.tsx` (swap abierto)
- `swap-chief-review.tsx` (aprobacion CHIEF)
- `swap-detail-panel.tsx` (detalle)
- `swap-list.tsx` (listado)

La pagina `/dashboard/requests` unifica swaps + applications.

**Impact on QA**: Phase 11 se ejecuta completa. Probar ambos flujos (DIRECT y OPEN).

## R4: RateComponent Types and Conditions

**Decision**: Usar los 18 tipos de ComponentType del schema con sus condiciones.

**Rationale**: El schema define:
- **Types**: BASE_SALARY, PER_MINUTE, NIGHT_SHIFT_BONUS, WEEKEND_BONUS, HOLIDAY_BONUS, IRRENUNCIABLE_BONUS, OVERTIME_PREMIUM, EXTRA_SHIFT_BONUS, ATTENDANCE_BONUS, SENIORITY_BONUS, AREA_BONUS, RESPONSIBILITY_BONUS, TRANSPORT_ALLOWANCE, MEAL_ALLOWANCE, SHIFT_DIFFERENTIAL, RETENTION_BONUS, PERFORMANCE_BONUS, CUSTOM
- **Conditions**: ALWAYS, WEEKDAY_ONLY, WEEKEND_ONLY, HOLIDAY_ONLY, IRRENUNCIABLE_ONLY, OVERTIME_ONLY, EXTRA_SHIFT_ONLY, SPECIFIC_AREA, SPECIFIC_SHIFT_TYPE, CUSTOM_RULE
- **Units**: MONTHLY, BIWEEKLY, WEEKLY, DAILY, PER_SHIFT, PER_MINUTE, PER_HOUR, PERCENTAGE, MULTIPLIER, FIXED_AMOUNT

**Impact on QA**: Las 13 tarifas deben usar variedad de estos tipos para maximizar cobertura del sistema de pagos.

## R5: Rotation Model Structure

**Decision**: Las rotativas usan RotationStep (pasos del ciclo) + RotationGroup (equipos) + RotationMember (staff en cada grupo).

**Rationale**: Cada RotationStep tiene un order y puede ser restDay o un shiftType. Cada RotationGroup tiene un cycleOffset que determina en que paso del ciclo empieza cada grupo. Los miembros se asignan a grupos.

**Impact on QA**: Al crear rotativas, definir steps (incluyendo dias de descanso), crear groups con offsets escalonados, y asignar members a cada group.

## R6: Payroll Generation

**Decision**: La nomina usa PayrollPeriod (mes/year) que genera PayrollDocument por usuario.

**Rationale**: PayrollPeriod tiene status (GENERATING, COMPLETED, COMPLETED_WITH_ERRORS, FAILED) y agrupa documentos. Cada PayrollDocument contiene totalAmount, baseSalaryAmount, shiftsAmount, monthlyComponentsAmount, shiftsCount, y referencia al PDF.

**Impact on QA**: Generar PayrollPeriod para el mes actual, verificar que genera documentos para todos los usuarios con contratos activos.

## R7: Organization Calendar

**Decision**: OrganizationCalendar define dias especiales con tipos y multiplicadores.

**Rationale**: Tipos disponibles: NORMAL, WEEKEND, SATURDAY, SUNDAY, HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM. Cada dia tiene un multiplier que afecta el calculo de pagos.

**Impact on QA**: Crear al menos 5 dias especiales con multiplicadores variados para probar el calculo de nomina.

## R8: RUT Validation

**Decision**: Generar RUTs validos con digito verificador correcto usando algoritmo modulo 11.

**Rationale**: El sistema valida RUTs chilenos. El formato es XX.XXX.XXX-X donde X final es el digito verificador (0-9 o K).

**Impact on QA**: Todos los 112 usuarios necesitan RUTs unicos y validos. Los 100 STAFF automatizados se generan por script con RUTs calculados.

## R9: Sector-Area Relationship

**Decision**: La relacion Sector-Area es many-to-many via tabla SectorArea.

**Rationale**: El schema tiene modelo implicito SectorArea (via sectorAreas en ambos modelos). Esto permite que Nutricionistas pertenezca a ambos sectores.

**Impact on QA**: Al crear areas, asignar a sectores es una operacion separada. Verificar la UI de edicion de sector para agregar areas.

## R10: User-Area and User-Sector Relationships

**Decision**: UserArea vincula CHIEF_AREA con areas. UserSector vincula CHIEF_SECTOR con sectores.

**Rationale**: Son tablas separadas que controlan visibilidad. Un CHIEF_SECTOR ve todas las areas de sus sectores asignados. Un CHIEF_AREA ve solo sus areas especificas.

**Impact on QA**: Los 2 jefes de sector necesitan UserSector. Los 6 jefes de area necesitan UserArea. Verificar que la visibilidad funciona correctamente.
