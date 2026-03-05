# Feature Specification: Payroll Billing PDF Generation

**Feature Branch**: `006-payroll-billing-pdf`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "En la sección de tarifas de ADMIN_HR, agregar un input para configurar la fecha de facturación mensual de la organización. Al llegar esa fecha, el sistema genera automáticamente los PDFs de liquidación/boleta de pago para todos los integrantes, los almacena en storage, y quedan disponibles como historial para ADMIN_HR, CHIEF_AREA y STAFF."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ADMIN_HR configura la fecha de facturación (Priority: P1)

Como ADMIN_HR, necesito configurar qué día del mes se genera la facturación de nómina para toda la organización, de modo que el proceso sea predecible y consistente cada mes.

**Why this priority**: Sin una fecha de facturación configurada, no se puede generar ningún documento de pago. Es el punto de entrada para todo el flujo.

**Independent Test**: Se puede probar creando una organización, navegando a la página de tarifas, configurando el día de facturación (ej. día 25), y verificando que se persiste correctamente.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR en la página de tarifas, **When** selecciona el día 25 como fecha de facturación y guarda, **Then** el sistema persiste la configuración y muestra confirmación.
2. **Given** un ADMIN_HR con fecha de facturación ya configurada (día 25), **When** la cambia al día 30, **Then** el sistema actualiza la configuración y muestra la nueva fecha.
3. **Given** un ADMIN_HR que intenta configurar un día inválido (ej. 32), **When** intenta guardar, **Then** el sistema muestra un error de validación.
4. **Given** un ADMIN_HR que configura día 31, **When** el mes tiene menos de 31 días (febrero), **Then** el sistema debe generar la facturación el último día del mes.

---

### User Story 2 - ADMIN_HR genera manualmente la nómina mensual (Priority: P1)

Como ADMIN_HR, necesito poder generar manualmente la nómina mensual para un período específico (mes/año), de modo que pueda producir los documentos de pago de todos los integrantes con contratos activos.

**Why this priority**: La generación manual es el MVP funcional. Permite producir documentos sin depender de automatización programada. Es la base sobre la cual se construye la automatización.

**Independent Test**: Se puede probar seleccionando un mes/año, ejecutando la generación, y verificando que se crean documentos PDF para cada miembro del personal con turnos completados en ese período.

**Acceptance Scenarios**:

1. **Given** una organización con 5 staff con contratos activos y turnos completados en enero 2026, **When** ADMIN_HR selecciona enero 2026 y ejecuta la generación, **Then** el sistema crea 5 documentos de nómina individuales.
2. **Given** un staff con contrato activo pero sin turnos completados en el período (ej. licencia médica), **When** se genera la nómina, **Then** ese staff recibe documento con al menos su sueldo base proporcional a los días de contrato activo en el período.
5. **Given** un staff cuyo contrato inició el día 19 y la facturación es el día 21, **When** se genera la nómina, **Then** el documento refleja el sueldo base proporcional a 2 días más cualquier turno completado en esos días.
6. **Given** un staff con contrato activo cuyo cálculo total resulta exactamente $0, **When** se genera la nómina, **Then** no se genera documento PDF para ese staff.
3. **Given** una generación ya ejecutada para enero 2026, **When** ADMIN_HR intenta regenerar el mismo período, **Then** el sistema advierte que ya existe y pide confirmación para reemplazar.
4. **Given** un staff con múltiples contratos activos (diferentes áreas/tarifas), **When** se genera la nómina, **Then** el documento incluye el desglose de todos sus contratos y el total consolidado.

---

### User Story 3 - Visualización y descarga de documentos de nómina (Priority: P1)

Como usuario de la plataforma (ADMIN_HR, CHIEF_AREA, o STAFF), necesito poder ver el historial de documentos de nómina y descargar los PDFs, de modo que tenga acceso a mis comprobantes de pago.

**Why this priority**: Sin acceso a los documentos generados, la generación no tiene utilidad práctica. Cada rol debe ver solo lo que le corresponde.

**Independent Test**: Se puede probar generando documentos de nómina y luego accediendo con cada rol para verificar que ven solo sus documentos autorizados.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR, **When** accede a la sección "Nómina" en la navegación lateral del dashboard, **Then** ve todos los documentos de todos los períodos de su organización, con opciones para descargar individual o masivamente, regenerar y eliminar.
2. **Given** un CHIEF_AREA, **When** accede a la sección "Pagos" en la navegación lateral del dashboard, **Then** ve solo los documentos del personal asignado a sus áreas, con opción de descarga.
3. **Given** un STAFF, **When** accede a la sección "Mis Pagos" en la navegación lateral del dashboard, **Then** ve solo sus propios documentos de nómina con opción de descarga.
4. **Given** un STAFF de otra organización, **When** intenta acceder a documentos de otra organización, **Then** el sistema niega el acceso (aislamiento multi-tenant).

---

### User Story 4 - Contenido del documento PDF de nómina (Priority: P2)

Como receptor de un documento de nómina, necesito que el PDF contenga toda la información relevante de mi pago mensual, incluyendo desglose por componentes de tarifa, turnos trabajados y totales.

**Why this priority**: El contenido del PDF es lo que da valor informativo. Depende de que la generación (P1) funcione.

**Independent Test**: Se puede probar generando un PDF para un staff con turnos variados (nocturnos, festivos, normales) y verificando que el desglose es correcto y legible.

**Acceptance Scenarios**:

1. **Given** un staff con 10 turnos completados en el mes, **When** se genera su documento, **Then** el PDF incluye: datos de la organización, datos del empleado, período, listado de turnos con fechas/horas, desglose por componente de tarifa, y monto total.
2. **Given** un staff con turnos que aplicaron multiplicadores de calendario (festivos, irrenunciables), **When** se genera el documento, **Then** el desglose muestra los multiplicadores aplicados y su efecto en el monto.
3. **Given** una organización con moneda CLP, **When** se genera el documento, **Then** todos los montos se formatean según la moneda configurada (ej. $1.250.000 para CLP).
4. **Given** un staff con un multiplicador personalizado en su contrato (ej. 1.2x por antigüedad), **When** se genera el documento, **Then** el multiplicador se refleja en el cálculo y se indica en el desglose.

---

### User Story 5 - Generación automática programada con notificación (Priority: P2)

Como ADMIN_HR, quiero que el sistema genere automáticamente la nómina en la fecha configurada cada mes y me notifique al completarse, para no tener que recordar ejecutarlo manualmente y estar al tanto del resultado.

**Why this priority**: Con la decisión de automatización completa, esto sube de prioridad. La generación manual (US-2) sigue siendo el fallback, pero la automatización es parte central del flujo.

**Independent Test**: Se puede probar configurando la fecha de facturación al día de mañana, y verificando que al día siguiente los documentos se generaron automáticamente y se recibió la notificación.

**Acceptance Scenarios**:

1. **Given** una organización con fecha de facturación día 25, **When** llega el día 25 del mes, **Then** el sistema genera automáticamente los documentos de nómina del mes anterior.
2. **Given** una generación automática completada exitosamente para 10 staff, **When** el proceso finaliza, **Then** el ADMIN_HR recibe una notificación indicando "10 documentos generados correctamente para enero 2026".
3. **Given** una generación automática que falla para 2 de 10 staff, **When** el proceso finaliza, **Then** el ADMIN_HR recibe una notificación indicando "8 exitosos, 2 fallidos" con detalle de los errores, y los exitosos se guardan normalmente.
4. **Given** una organización con estado SUSPENDED, **When** llega la fecha de facturación, **Then** el sistema NO genera documentos y notifica al ADMIN_HR del motivo.

---

### User Story 6 - Regenerar y eliminar documentos individuales (Priority: P2)

Como ADMIN_HR, necesito poder regenerar el documento de nómina de un usuario específico o eliminar PDFs erróneos, de modo que pueda corregir problemas sin afectar toda la nómina del período.

**Why this priority**: Es el mecanismo de corrección de errores. Sin esto, cualquier problema requiere regenerar toda la nómina.

**Independent Test**: Se puede probar generando la nómina completa, luego seleccionando un documento individual para regenerar o eliminar, y verificando que solo ese documento se ve afectado.

**Acceptance Scenarios**:

1. **Given** una nómina generada para enero 2026 con 10 documentos, **When** ADMIN_HR selecciona regenerar el documento de "Juan Pérez", **Then** solo ese documento se recalcula y reemplaza, sin afectar los otros 9.
2. **Given** un documento de nómina con un error, **When** ADMIN_HR lo elimina, **Then** el PDF se borra del storage, el registro se actualiza, y el staff ya no ve ese documento en su historial.
3. **Given** un documento eliminado, **When** ADMIN_HR regenera el documento para ese usuario, **Then** se crea un nuevo documento con los datos actualizados.

---

### Edge Cases

- Qué pasa cuando un staff tiene turnos completados pero sin contrato activo en ese período: el sistema debe omitir al staff y registrar la inconsistencia.
- Qué pasa cuando un staff tiene contrato activo pero ningún turno (licencia médica, vacaciones): recibe al menos el sueldo base proporcional a los días con contrato activo. Solo se omite si el total calculado es $0.
- Qué pasa cuando un staff ingresó a mitad del período de facturación: el sueldo base se prorratea según los días efectivos de contrato dentro del período.
- Qué pasa cuando un staff cambió de contrato/tarifa a mitad de mes: el documento debe reflejar ambos contratos con sus respectivos turnos y tarifas.
- Qué pasa cuando un turno está completado pero no tiene `actualEndTime` registrado: se usa el `endTime` programado y se marca como "horario estimado" en el documento.
- Qué pasa cuando la organización no tiene moneda configurada: se usa CLP como valor por defecto (mercado principal Chile).
- Qué pasa cuando se genera nómina para un mes futuro: el sistema debe impedir la generación para períodos que aún no finalizaron.
- Qué pasa cuando hay turnos con estado DISPUTED en su pago: se excluyen del total y se listan como "en disputa" en el documento.
- Qué pasa con la concurrencia si dos ADMIN_HR intentan generar la misma nómina simultáneamente: el sistema debe prevenir la generación duplicada.
- Qué pasa si ADMIN_HR elimina un documento y el staff lo estaba descargando en ese momento: la descarga en curso debe completarse pero el documento ya no estará disponible para futuras descargas.
- Qué pasa si la generación automática se ejecuta pero ya existe una nómina para ese período (generada manualmente antes): el sistema no debe sobrescribir; debe notificar al ADMIN_HR que la nómina ya fue generada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir al ADMIN_HR configurar un día del mes (1-31) como fecha de facturación de la organización.
- **FR-002**: El sistema DEBE validar que el día de facturación esté entre 1 y 31, y ajustar automáticamente al último día del mes cuando el mes tiene menos días.
- **FR-003**: El sistema DEBE permitir al ADMIN_HR generar manualmente la nómina para un período específico (mes/año).
- **FR-004**: El sistema DEBE generar un documento PDF individual por cada miembro del personal con contrato activo en el período seleccionado cuyo monto total calculado sea mayor a $0. Staff con contrato activo pero cálculo total de exactamente $0 no reciben documento.
- **FR-005**: El sistema DEBE calcular el monto total de pago por persona considerando: (a) el sueldo base (BASE_SALARY) proporcional a los días con contrato activo en el período, (b) los pagos de turnos completados con sus componentes de tarifa, condiciones de aplicación y multiplicadores de calendario, y (c) cualquier componente fijo mensual aplicable.
- **FR-005a**: El sistema DEBE prorratear el sueldo base cuando el contrato del staff no cubre el período completo (ej. ingreso a mitad de mes, o contrato que termina antes del cierre del período).
- **FR-005b**: El sistema DEBE incluir al menos el sueldo base proporcional para TODO staff con contrato activo en el período, aunque no tenga turnos completados (licencia médica, vacaciones, u otra razón). El sistema no distingue el motivo de ausencia — simplemente calcula el BASE_SALARY proporcional a los días de contrato activo en el período para cualquier staff con contrato vigente.
- **FR-006**: Cada documento PDF DEBE incluir: identificación de la organización, datos del empleado, período de facturación, listado de turnos con fechas y horas, desglose por componente de tarifa, multiplicadores aplicados, y monto total.
- **FR-007**: El sistema DEBE almacenar los PDFs generados en storage persistente, organizados por organización, año y mes.
- **FR-008**: El sistema DEBE mantener un registro (historial) de cada período de nómina generado, incluyendo fecha de generación, quién lo generó, cantidad de documentos, y estado.
- **FR-009**: ADMIN_HR DEBE poder ver y descargar todos los documentos de nómina de su organización.
- **FR-010**: CHIEF_AREA DEBE poder ver y descargar solo los documentos de personal asignado a sus áreas.
- **FR-011**: STAFF DEBE poder ver y descargar solo sus propios documentos de nómina.
- **FR-012**: El sistema DEBE formatear todos los montos según la moneda configurada de la organización.
- **FR-013**: El sistema DEBE prevenir la generación de nómina para períodos futuros (meses que no han terminado).
- **FR-014**: El sistema DEBE advertir al usuario cuando intenta regenerar una nómina ya existente y solicitar confirmación explícita antes de reemplazar.
- **FR-015**: El sistema DEBE manejar correctamente staff con múltiples contratos activos, consolidando todos los turnos y tarifas en un solo documento.
- **FR-016**: El sistema DEBE excluir turnos con pagos en estado DISPUTED del total, listándolos por separado en el documento.
- **FR-017**: El sistema DEBE respetar el aislamiento multi-tenant en todo momento, impidiendo acceso a documentos de otras organizaciones.
- **FR-018**: El sistema DEBE ejecutar automáticamente la generación de nómina en la fecha configurada cada mes, sin intervención manual, mediante un API Route de Next.js invocado por pg_cron + pg_net (reemplaza Edge Function original para reutilizar 100% del código existente sin duplicación).
- **FR-019**: El sistema DEBE notificar al ADMIN_HR cuando la generación automática de nómina se complete, indicando cuántos documentos se generaron exitosamente y si hubo errores.
- **FR-020**: ADMIN_HR DEBE poder regenerar manualmente el documento de nómina de un usuario individual específico, para corregir errores sin tener que regenerar toda la nómina del período.
- **FR-021**: ADMIN_HR DEBE poder eliminar documentos PDF de nómina específicos (individual o selectivamente).
- **FR-022**: El sistema DEBE calcular automáticamente el pago de un turno (ShiftPayment) cuando el turno se completa (check-out registrado), usando el contrato activo del usuario, los componentes de tarifa aplicables según las condiciones del turno, y los multiplicadores de calendario del día.
- **FR-023**: El cálculo de pago DEBE generar un desglose detallado (ShiftPaymentBreakdown) por cada componente de tarifa que aplique al turno, registrando el valor base, el valor calculado, y los minutos aplicados cuando corresponda.
- **FR-024**: El sistema DEBE respetar las condiciones de aplicación de cada componente de tarifa (ALWAYS, WEEKDAY_ONLY, WEEKEND_ONLY, HOLIDAY_ONLY, NIGHT_SHIFT, etc.) al determinar qué componentes aplican a cada turno.
- **FR-025**: El sistema DEBE aplicar el multiplicador personalizado del contrato (customMultiplier) cuando exista, y el multiplicador de calendario del día (calendarMultiplier) al monto final del turno.
- **FR-026**: El sistema DEBE proveer una nueva sección "Pagos" / "Nómina" en la navegación lateral del dashboard, accesible por los tres roles (ADMIN_HR, CHIEF_AREA, STAFF), adaptando el contenido visible según los permisos de cada rol.

### Key Entities

- **PayrollPeriod**: Representa un ciclo de facturación mensual para una organización. Atributos clave: organización, mes, año, fecha de generación, estado (GENERATING, COMPLETED, COMPLETED_WITH_ERRORS, FAILED), generado por (usuario), número total de documentos, monto total del período.
- **PayrollDocument**: Documento individual de nómina por staff por período. Atributos clave: período de nómina, usuario, monto total, moneda, ruta del archivo PDF en storage, fecha de generación, número de turnos incluidos, estado.
- **Organization (extensión)**: Se extiende con la configuración de fecha de facturación. Atributo nuevo: día de facturación mensual.

## Clarifications

### Session 2026-03-03

- Q: Cómo debe funcionar la generación automática de nómina mensual? → A: Automatización completa via Supabase Edge Function + pg_cron que genera los PDFs en la fecha configurada. Se envía notificación al ADMIN_HR al completarse. Además, ADMIN_HR puede regenerar manualmente documentos por usuario individual (para corregir errores) y eliminar PDFs específicos.
- Q: El motor de cálculo de pagos (ShiftPayment) está dentro o fuera del alcance de esta feature? → A: Dentro del alcance. El motor de cálculo se implementa como parte de esta feature: al completar un turno se calcula el pago (ShiftPayment + ShiftPaymentBreakdown) y estos datos se usan para generar los PDFs.
- Q: Se genera documento para staff sin turnos completados en el período? → A: Se calcula para TODO staff con contrato activo. El sueldo base (BASE_SALARY) se paga siempre, proporcional a los días del período con contrato activo. Si alguien entró el día 19 y se factura el 21, se le pagan esos 2 días. Si tiene licencia médica, recibe al menos el sueldo base. El único caso donde NO se genera PDF es si el cálculo total resulta exactamente $0.
- Q: Dónde acceden STAFF y CHIEF_AREA a sus documentos de nómina? → A: Nueva sección dedicada "Pagos" / "Nómina" en la navegación lateral del dashboard, con su propia página. Cada rol ve lo que le corresponde según sus permisos.

## Assumptions

- **Cálculo de pagos incluido**: Esta feature incluye la implementación del motor de cálculo de pagos por turno. Al completar un turno (check-out), el sistema calcula automáticamente el ShiftPayment y sus ShiftPaymentBreakdown basándose en el contrato activo del usuario, los componentes de tarifa aplicables, y los multiplicadores de calendario. Estos datos calculados son la fuente para los documentos PDF de nómina.
- **Formato del documento**: Se asume un formato de boleta/comprobante de pago interno de la organización, NO una liquidación de sueldo con formato legal chileno (que requeriría campos adicionales como AFP, Isapre, impuestos, etc.). El formato será informativo y profesional pero sin validez tributaria.
- **Un documento por persona por período**: Independientemente de cuántos contratos o áreas tenga, cada persona recibe un solo documento consolidado por mes.
- **Moneda única por organización**: Todos los montos de una organización se expresan en la misma moneda (campo `currency` del modelo Organization).
- **Storage**: Se usará Supabase Storage (ya configurado en el proyecto para avatares) con un bucket dedicado para documentos de nómina.
- **Idioma del PDF**: Los documentos se generan en el idioma configurado del usuario o de la organización, reutilizando las traducciones existentes del sistema i18n.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un ADMIN_HR puede configurar la fecha de facturación de su organización en menos de 1 minuto.
- **SC-002**: La generación de nómina para una organización de hasta 50 personas se completa en menos de 2 minutos.
- **SC-003**: Cada documento PDF generado contiene el desglose correcto de componentes de tarifa, coincidiendo con los datos de turnos y contratos del sistema.
- **SC-004**: El 100% de los documentos generados son accesibles para descarga por los roles autorizados dentro de los 5 minutos posteriores a la generación.
- **SC-005**: Ningún usuario puede acceder a documentos de nómina de otra organización o de personal fuera de su ámbito de acceso.
- **SC-006**: Los montos en los documentos coinciden con el cálculo basado en las tarifas y turnos del período, con exactitud al centavo según la moneda de la organización.
- **SC-007**: El historial de nómina permite a cualquier rol autorizado encontrar y descargar documentos de hasta 24 meses anteriores.
