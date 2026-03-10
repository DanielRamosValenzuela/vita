# Feature Specification: QA Happy Path E2E — Clínica Simulada

**Feature Branch**: `010-qa-happy-path-e2e`
**Created**: 2026-03-10
**Status**: Draft
**Input**: Ejecutar prueba end-to-end del flujo feliz completo de VITA, simulando una clínica real chilena con dos sectores, seis áreas, 112 usuarios y todo el ciclo de vida operativo.

## Clarifications

### Session 2026-03-10

- Q: Que dimensiones de UX deben evaluarse durante las pruebas? → A: Evaluacion completa: tiempo por tarea, pasos innecesarios, claridad de labels/feedback, consistencia visual, responsividad, y propuestas de mejora concretas.
- Q: En que formato se documentan los hallazgos UX? → A: Archivo separado `test-reports/ux-findings.md` con tabla por hallazgo: pagina, severidad (critico/alto/medio/bajo), descripcion, propuesta de mejora, screenshot.
- Q: Cuanto tiempo maximo dedicar a arreglar un issue UX encontrado antes de solo documentarlo? → A: 15 minutos max — fixes cosmeticos y de usabilidad menor (labels, orden de campos, feedback faltante). Mas alla de eso, solo documentar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro y onboarding de organización (Priority: P1)

Un QA Tester necesita crear una organización completa desde cero: registrar cuentas de prueba (11 manuales), crear la organización como SUPER_ADMIN, invitar y vincular un ADMIN_HR, y verificar que toda la cadena de onboarding funciona correctamente. Esto establece la base para todas las pruebas posteriores.

**Why this priority**: Sin una organización con ADMIN_HR funcional, ninguna otra fase de la prueba puede ejecutarse. Es el cimiento de toda la simulación.

**Independent Test**: Se puede verificar de forma aislada registrando las 11 cuentas, creando la organización, enviando la invitación al ADMIN_HR y confirmando que acepta y ve el dashboard correcto.

**Acceptance Scenarios**:

1. **Given** la app corriendo en localhost, **When** un usuario se registra con nombre, email, contraseña, país Chile y RUT válido, **Then** la cuenta se crea exitosamente y el usuario accede al dashboard.
2. **Given** una cuenta SUPER_ADMIN existente, **When** crea una organización con nombre, país, moneda, plan y límites, **Then** la organización aparece en la tabla de organizaciones con los datos correctos.
3. **Given** una organización recién creada, **When** el SUPER_ADMIN invita a un usuario registrado con rol ADMIN_HR, **Then** la invitación aparece como pendiente.
4. **Given** una invitación pendiente, **When** el usuario invitado inicia sesión y acepta, **Then** su rol cambia a ADMIN_HR, se asigna a la organización, y ve el dashboard de ADMIN_HR con métricas.

---

### User Story 2 - Vinculación de CHIEFs y STAFF (Priority: P1)

El ADMIN_HR necesita invitar 8 jefes de área (CHIEF_AREA) y 2 STAFF manuales a la organización. Adicionalmente, se crean 100 cuentas STAFF automatizadas directamente en base de datos para simular volumen real de una clínica.

**Why this priority**: La jerarquía de roles es esencial para probar permisos, visibilidad de áreas y todas las funciones de gestión.

**Independent Test**: Invitar un CHIEF, que acepte, y verificar que ve el dashboard de CHIEF_AREA. Crear cuentas STAFF por script y verificar login funcional.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR logueado, **When** invita 8 cuentas con rol CHIEF_AREA, **Then** las 8 invitaciones aparecen como pendientes.
2. **Given** invitaciones pendientes, **When** cada CHIEF inicia sesión y acepta, **Then** todos tienen rol CHIEF_AREA con la organización correcta y ven el dashboard correspondiente.
3. **Given** un ADMIN_HR logueado, **When** invita 2 cuentas STAFF que aceptan, **Then** ambos aparecen vinculados en la lista de personal.
4. **Given** 2 cuentas STAFF vinculadas manualmente, **When** se crean 100 cuentas STAFF adicionales vía script directo en base de datos (replicando la misma estructura), **Then** las 102 cuentas STAFF son funcionales, con login operativo e indistinguibles de las creadas manualmente.

---

### User Story 3 - Estructura organizacional: sectores y áreas (Priority: P1)

El ADMIN_HR configura 2 sectores (UCI y Urgencias) con 6 áreas distribuidas, incluyendo un área compartida (Nutricionistas) entre ambos sectores.

**Why this priority**: La estructura de sectores/áreas es prerequisito para asignaciones de personal, tipos de turno y rotativas.

**Independent Test**: Crear sectores y áreas, verificar que las relaciones many-to-many funcionan y que el área Nutricionistas aparece en ambos sectores.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR logueado, **When** crea 2 sectores con nombre, descripción e ícono, **Then** ambos aparecen en la lista de sectores.
2. **Given** sectores creados, **When** crea 6 áreas con configuraciones de horario variadas y las asigna a sus sectores, **Then** cada sector muestra las áreas correctas (UCI: 3, Urgencias: 4).
3. **Given** el área Nutricionistas asignada a ambos sectores, **When** se visualizan los sectores UCI y Urgencias, **Then** Nutricionistas aparece listada en ambos.

---

### User Story 4 - Tipos de turno y configuración de jornadas (Priority: P2)

El ADMIN_HR crea al menos 10 tipos de turno que reflejan la realidad hospitalaria chilena: 4 globales (diurno normal, diurno largo, nocturno, tercer turno) y 6+ específicos por área (cuarto turno UCI, guardia 24h urgencias, turnos de nutrición, turnos técnicos).

**Why this priority**: Los tipos de turno son necesarios para crear rotativas y generar turnos, pero pueden configurarse en paralelo con la estructura de áreas.

**Independent Test**: Crear cada tipo de turno, verificar que los globales son visibles por todos los CHIEFs y los específicos solo por el área correspondiente.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR logueado, **When** crea 4 tipos de turno globales con diferentes horarios y clasificaciones, **Then** todos aparecen en la tabla y son visibles por cualquier CHIEF.
2. **Given** áreas creadas, **When** crea 6+ tipos de turno específicos vinculados a áreas concretas, **Then** cada tipo solo se ve al filtrar por su área asignada.
3. **Given** tipos de turno con duraciones de 4h, 6h, 8h, 9h, 12h y 24h creados, **When** se revisa la tabla completa, **Then** hay variedad de horarios incluyendo turnos que cruzan el umbral día/noche.

---

### User Story 5 - Tarifas, contratos y calendario organizacional (Priority: P2)

El ADMIN_HR configura 13 plantillas de tarifa (3 para CHIEFs, 10 para STAFF), asigna contratos a todo el personal, configura doble tarifa para 2 STAFF, establece el calendario organizacional con feriados/días especiales y el día de facturación.

**Why this priority**: Las tarifas y el calendario son necesarios para el cálculo de nómina pero no bloquean la asignación de personal ni la creación de rotativas.

**Independent Test**: Crear tarifas con componentes variados, asignar contratos, verificar que las tarifas se muestran correctamente en el perfil de cada usuario.

**Acceptance Scenarios**:

1. **Given** un ADMIN_HR logueado, **When** crea 13 plantillas de tarifa con componentes variados (BASE_SALARY, PER_SHIFT, PER_MINUTE, FIXED_BONUS), **Then** todas aparecen en la lista de tarifas con sus componentes.
2. **Given** tarifas creadas, **When** asigna contratos a los 110 usuarios (8 CHIEFs + 102 STAFF), **Then** cada usuario muestra su tarifa y contrato en su perfil.
3. **Given** un usuario STAFF, **When** se le asignan 2 tarifas activas simultáneamente, **Then** ambos contratos aparecen en su perfil.
4. **Given** calendario organizacional, **When** se agregan 3 feriados nacionales con multiplicador x2 y 2 días especiales con multiplicadores personalizados, **Then** el calendario muestra los días con sus multiplicadores.

---

### User Story 6 - Asignación de jefes y personal a áreas (Priority: P1)

El ADMIN_HR asigna jefes de sector, jefes de área (via UserArea) y distribuye 102 STAFF en 6 áreas con cantidades específicas por área.

**Why this priority**: La asignación de personal a áreas determina la visibilidad de datos y es prerequisito para crear rotativas y turnos.

**Independent Test**: Asignar CHIEFs a áreas, verificar que cada uno solo ve sus áreas. Asignar STAFF y verificar que las cantidades por área coinciden.

**Acceptance Scenarios**:

1. **Given** 2 jefes de sector, **When** se asignan como jefes de UCI y Urgencias respectivamente, **Then** cada uno ve todas las áreas de su sector.
2. **Given** 6 jefes de área individuales, **When** se asignan a sus áreas específicas (incluyendo 2 jefes compartiendo Nutricionistas), **Then** cada CHIEF ve únicamente sus áreas asignadas.
3. **Given** 102 STAFF, **When** se distribuyen en 6 áreas (25+15+12+25+15+10), **Then** cada CHIEF ve exactamente la cantidad de staff de sus áreas.

---

### User Story 7 - Rotativas y generación de turnos (Priority: P2)

Los CHIEFs o el ADMIN_HR crean 7+ rotativas (una por combinación área/patrón) con grupos de staff, las activan y generan turnos para los próximos 30 días.

**Why this priority**: La generación de turnos es el producto final visible que valida que toda la configuración anterior funciona correctamente.

**Independent Test**: Crear una rotativa para un área, activarla, generar turnos y verificar que aparecen en el calendario del staff asignado.

**Acceptance Scenarios**:

1. **Given** un área con staff asignado y tipos de turno configurados, **When** se crea una rotativa con patrón, grupos y miembros, **Then** la rotativa se guarda en estado DRAFT.
2. **Given** una rotativa en DRAFT, **When** se activa y se generan turnos para 30 días, **Then** los turnos aparecen en el calendario del área sin conflictos.
3. **Given** turnos generados, **When** un STAFF inicia sesión, **Then** ve sus turnos asignados en su calendario personal.
4. **Given** 7+ rotativas activas con turnos generados, **When** se revisa la cobertura por área, **Then** cada área tiene cobertura adecuada según su patrón.

---

### User Story 8 - Vista STAFF y generación de nómina (Priority: P2)

Un STAFF puede ver su calendario con turnos, crear notas personales y exportar a iCal. El ADMIN_HR genera la nómina mensual con desglose de pagos basado en tarifas y multiplicadores. Cada rol ve solo los documentos que le corresponden.

**Why this priority**: La nómina es el entregable principal de negocio y valida que el cálculo de pagos funciona con datos reales.

**Independent Test**: Login como STAFF y verificar calendario. Login como ADMIN_HR y generar nómina completa, verificar PDFs.

**Acceptance Scenarios**:

1. **Given** un STAFF con turnos asignados, **When** accede a su calendario, **Then** ve los turnos del mes actual con detalles al hacer click.
2. **Given** un ADMIN_HR logueado, **When** genera la nómina del mes con turnos, **Then** se crean documentos para todo el personal con contratos activos.
3. **Given** nómina generada, **When** un CHIEF accede a la sección de nómina, **Then** solo ve documentos de su(s) área(s).
4. **Given** nómina generada, **When** un STAFF accede a la sección de nómina, **Then** solo ve su propio documento con desglose.

---

### User Story 9 - Intercambio de turnos (Priority: P3)

Los STAFF pueden solicitar intercambios de turno directos o publicar turnos para intercambio abierto, con aprobación del CHIEF.

**Why this priority**: Esta funcionalidad puede no estar implementada aún. Si no existe la UI, se documenta como pendiente y se salta.

**Independent Test**: Si la UI existe, probar swap directo entre 2 STAFF con aprobación del CHIEF.

**Acceptance Scenarios**:

1. **Given** la UI de intercambio de turnos implementada, **When** un STAFF solicita swap directo con otro, **Then** el segundo STAFF puede aceptar y el CHIEF puede aprobar.
2. **Given** la UI de intercambio de turnos NO implementada, **When** se intenta acceder a la funcionalidad, **Then** se documenta como "pendiente de implementación" y se continúa.

---

### User Story 10 - Validaciones de negocio y edge cases (Priority: P2)

Se verifican validaciones de límites (max CHIEFs, max STAFF), documentos duplicados, visibilidad multi-área, métricas del dashboard ADMIN_HR y responsividad de la UI.

**Why this priority**: Las validaciones de negocio aseguran la integridad del sistema y son críticas para producción, pero dependen de tener datos suficientes en el sistema.

**Independent Test**: Intentar exceder límites de la organización y verificar que el sistema rechaza correctamente.

**Acceptance Scenarios**:

1. **Given** 8 CHIEFs vinculados y límite de 10, **When** se intenta invitar un CHIEF #11, **Then** el sistema rechaza la invitación.
2. **Given** 102 STAFF vinculados y límite de 150, **When** se intenta invitar STAFF #151, **Then** el sistema rechaza la invitación.
3. **Given** un RUT ya registrado en la organización, **When** se intenta crear otra cuenta con el mismo RUT, **Then** el sistema rechaza el registro.
4. **Given** el área Nutricionistas con 2 jefes (uno de cada sector), **When** el jefe del sector UCI crea un turno, **Then** el jefe del sector Urgencias también puede verlo.
5. **Given** toda la simulación completa, **When** el ADMIN_HR accede al dashboard, **Then** las métricas muestran: 6 áreas activas, 110 personal total, contratos y turnos del mes coherentes.

---

### User Story 11 - Evaluacion UX en paralelo con QA (Priority: P2)

Durante cada fase del QA, el tester evalua la experiencia de usuario de forma sistematica: mide tiempo por tarea, identifica pasos innecesarios o confusos, evalua claridad de labels y mensajes de feedback, verifica consistencia visual y responsividad, y genera propuestas concretas de mejora. Los hallazgos se documentan en un archivo separado. Si un problema UX se puede arreglar en menos de 15 minutos sin desviar el flujo QA, se corrige en el momento.

**Why this priority**: La evaluacion UX en paralelo aprovecha el recorrido completo de la app durante el QA para obtener insights de usabilidad sin costo adicional de tiempo significativo. Los hallazgos alimentan el backlog de mejoras UX.

**Independent Test**: En cualquier fase del QA, el tester puede documentar al menos una observacion UX con pagina, severidad, descripcion y propuesta.

**Acceptance Scenarios**:

1. **Given** el tester navegando cualquier pagina durante el QA, **When** identifica un punto de friccion (pasos de mas, label confuso, feedback ausente, inconsistencia visual), **Then** lo documenta en `test-reports/ux-findings.md` con pagina, severidad, descripcion, propuesta y screenshot.
2. **Given** un hallazgo UX con severidad critica o alta que requiere menos de 15 minutos de fix, **When** el tester tiene las herramientas para corregirlo, **Then** lo arregla en el momento y lo documenta como "resuelto" en el reporte.
3. **Given** un hallazgo UX que requiere mas de 15 minutos, **When** el tester lo identifica, **Then** lo documenta como "pendiente" con propuesta de mejora y continua con el QA.
4. **Given** la ejecucion completa del QA, **When** se revisa `test-reports/ux-findings.md`, **Then** contiene hallazgos de al menos 5 paginas distintas con propuestas accionables.

---

### Edge Cases

- Que sucede cuando se intenta registrar un email que ya existe en el sistema
- Que sucede cuando se exceden los limites de la organizacion (maxChiefs, maxStaff, maxAdminHR)
- Que sucede cuando un CHIEF intenta ver personal de un area que no tiene asignada
- Que sucede cuando dos CHIEFs de distintos sectores comparten la misma area (Nutricionistas)
- Que sucede cuando un STAFF tiene doble tarifa activa y se genera nomina
- Que sucede cuando un turno generado por rotativa cae en un dia feriado con multiplicador
- Que sucede cuando la UI se visualiza en modo responsive/movil
- Que sucede cuando se intenta crear un turno con horario que cruza medianoche

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir registrar cuentas con nombre, email, contraseña, pais, tipo de documento y numero de documento
- **FR-002**: El sistema DEBE validar RUTs chilenos con digito verificador correcto y rechazar duplicados dentro de la misma organizacion
- **FR-003**: El sistema DEBE permitir al SUPER_ADMIN crear organizaciones con nombre, pais, moneda, plan y limites configurables
- **FR-004**: El sistema DEBE permitir al SUPER_ADMIN y ADMIN_HR enviar invitaciones por email con rol especifico (ADMIN_HR, CHIEF_AREA, STAFF)
- **FR-005**: El sistema DEBE permitir a los usuarios aceptar invitaciones pendientes, cambiando su rol y asignandolos a la organizacion
- **FR-006**: El sistema DEBE respetar los limites de la organizacion (maxAdminHR, maxChiefs, maxStaff) al crear invitaciones
- **FR-007**: El sistema DEBE permitir al ADMIN_HR crear sectores con nombre, descripcion e icono
- **FR-008**: El sistema DEBE permitir al ADMIN_HR crear areas con configuracion de horarios dia/noche y asignarlas a uno o mas sectores (relacion many-to-many)
- **FR-009**: El sistema DEBE permitir al ADMIN_HR crear tipos de turno globales y especificos por area con horario, duracion y clasificacion
- **FR-010**: El sistema DEBE permitir al ADMIN_HR crear plantillas de tarifa con componentes modulares (BASE_SALARY, PER_SHIFT, PER_MINUTE, FIXED_BONUS y otros)
- **FR-011**: El sistema DEBE permitir asignar contratos (tarifas) a usuarios, incluyendo multiples contratos activos simultaneos
- **FR-012**: El sistema DEBE permitir al ADMIN_HR configurar el calendario organizacional con feriados y dias especiales con multiplicadores
- **FR-013**: El sistema DEBE permitir asignar CHIEFs como jefes de sector y jefes de area via UserArea
- **FR-014**: El sistema DEBE limitar la visibilidad de cada CHIEF exclusivamente a las areas que tiene asignadas
- **FR-015**: El sistema DEBE permitir asignar STAFF a areas especificas
- **FR-016**: El sistema DEBE permitir crear rotativas con patron, grupos y miembros, activarlas y generar turnos para un periodo configurable
- **FR-017**: El sistema DEBE mostrar al STAFF su calendario personal con turnos asignados y permitir crear notas personales
- **FR-018**: El sistema DEBE permitir al ADMIN_HR generar nomina mensual con documentos que desglosen componentes de tarifa y multiplicadores
- **FR-019**: El sistema DEBE restringir la visibilidad de documentos de nomina segun el rol (ADMIN_HR ve todos, CHIEF ve su area, STAFF ve solo el propio)
- **FR-020**: El sistema DEBE funcionar correctamente en modo responsive/movil con menu hamburguesa
- **FR-021**: Durante el QA, cada pagina visitada DEBE ser evaluada en dimensiones UX: tiempo por tarea, pasos innecesarios, claridad de labels/feedback, consistencia visual y responsividad
- **FR-022**: Los hallazgos UX DEBEN documentarse en `test-reports/ux-findings.md` con: pagina, severidad (critico/alto/medio/bajo), descripcion del problema, propuesta de mejora concreta y screenshot
- **FR-023**: Los hallazgos UX con severidad critica o alta que requieran menos de 15 minutos de correccion DEBEN arreglarse in-place durante el QA; el resto se documenta como pendiente

### Key Entities

- **Organization**: Entidad principal multi-tenant con nombre, pais, moneda, plan y limites (maxAdminHR, maxChiefs, maxStaff)
- **User**: Cuenta de usuario con rol (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF), documento de identidad y vinculacion a organizacion
- **Sector**: Agrupacion logica de areas dentro de una organizacion (UCI, Urgencias)
- **Area**: Unidad operativa con configuracion de horarios dia/noche, asignable a uno o mas sectores
- **ShiftType**: Tipo de turno con horario, duracion, clasificacion; puede ser global o especifico de area
- **RateTemplate**: Plantilla de tarifa con componentes modulares para calculo de pagos
- **Contract**: Vinculo entre usuario y plantilla de tarifa, permite multiples contratos activos
- **Rotation**: Rotativa que define patron de turnos con grupos de staff
- **Shift**: Turno individual asignado a un usuario en un area/fecha/horario especifico
- **PayrollDocument**: Documento de nomina generado con desglose de pagos por componentes y multiplicadores
- **Invitation**: Invitacion pendiente con rol destino para vincular usuarios a organizaciones

## Assumptions

- La cuenta SUPER_ADMIN `prueba10@gmail.com` existe y funciona. Si no, se buscara o creara una directamente en base de datos.
- La contraseña universal para todas las cuentas de prueba es `123qweASD.`
- Los RUTs se generan con algoritmo de digito verificador correcto en formato `XX.XXX.XXX-X`
- Los emails siguen el patron `vita.qa.{rol}.{numero}@gmail.com`
- Los nombres son chilenos realistas y no repetidos
- Las 100 cuentas automatizadas se crean directamente en base de datos replicando la estructura exacta de las cuentas creadas por UI
- El idioma de la app es Español (locale `es`) y el pais Chile (CL) con moneda CLP
- Los reportes de QA se almacenan en `test-reports/` y los scripts utilitarios en `scripts/`
- Si una feature no tiene UI implementada (ej: shift swap), se documenta como pendiente y se salta

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las 11 cuentas manuales se registran exitosamente en menos de 30 segundos cada una
- **SC-002**: La organizacion se crea con todos los campos configurados y limites correctos en una sola operacion
- **SC-003**: El 100% de las invitaciones enviadas (11 usuarios) se aceptan sin errores y los roles se asignan correctamente
- **SC-004**: Las 100 cuentas creadas por script son funcionalmente identicas a las manuales: login funcional, dashboard correcto, datos completos
- **SC-005**: Los 2 sectores y 6 areas se crean sin errores, con el area compartida Nutricionistas visible en ambos sectores
- **SC-006**: Se crean minimo 10 tipos de turno con variedad de duraciones (4h a 24h) sin errores
- **SC-007**: Se crean 13 tarifas con componentes variados y se asignan contratos a los 110 usuarios sin excepciones
- **SC-008**: Cada CHIEF ve exclusivamente las areas y personal que tiene asignado, sin fugas de datos cross-area
- **SC-009**: Se crean minimo 7 rotativas activas que generan turnos para 30 dias sin conflictos reportados
- **SC-010**: La nomina generada produce documentos para todo el personal con contratos activos, con desglose coherente
- **SC-011**: Las validaciones de limites rechazan correctamente intentos de exceder maxChiefs y maxStaff
- **SC-012**: El dashboard ADMIN_HR muestra metricas coherentes con los datos creados (6 areas, 110 personal, contratos, turnos)
- **SC-013**: Menos de 5 bugs criticos encontrados durante toda la ejecucion del happy path
- **SC-014**: Todo bug encontrado queda documentado con ruta, accion, resultado esperado/obtenido y screenshot
- **SC-015**: El reporte UX (`test-reports/ux-findings.md`) contiene hallazgos de al menos 5 paginas distintas con propuestas accionables
- **SC-016**: Al menos el 80% de los hallazgos UX de severidad critica/alta que requieran menos de 15 minutos son corregidos in-place durante el QA

## Scope

### In Scope

- Registro de cuentas via UI (11 manuales)
- Creacion de cuentas masivas via script directo en base de datos (100 STAFF)
- Creacion y configuracion de organizacion
- Flujo completo de invitaciones y aceptacion
- Creacion de sectores, areas y tipos de turno
- Creacion de tarifas y asignacion de contratos
- Configuracion de calendario organizacional
- Asignacion de CHIEFs a sectores/areas y STAFF a areas
- Creacion de rotativas y generacion de turnos
- Verificacion de vista STAFF (calendario, notas, iCal)
- Generacion y verificacion de nomina
- Validaciones de limites y permisos
- Pruebas de responsividad
- Evaluacion UX en paralelo: tiempo por tarea, pasos innecesarios, claridad, consistencia visual, responsividad
- Documentacion de hallazgos UX en `test-reports/ux-findings.md`
- Fix in-place de issues UX menores (menos de 15 min)

### Out of Scope

- Intercambio de turnos (Shift Swap) si la UI no esta implementada
- Pruebas de carga o performance
- Pruebas de seguridad avanzadas (penetration testing)
- Flujos de recuperacion de contraseña
- Integraciones con sistemas externos
- Pruebas en multiples navegadores (se usa el navegador del browser MCP)
- Pruebas con multiples organizaciones simultaneas

## Dependencies

- Servidor de desarrollo corriendo en localhost:3000
- MCP Server Supabase disponible para consultas/mutaciones directas
- MCP Browser disponible para automatizacion de navegacion
- Base de datos limpia o con datos que no interfieran con las cuentas de prueba (prefix `vita.qa.`)
