# Requerimientos del Proyecto VITA

> **Fecha de actualización:** Febrero 2026
> **Versión:** 4.1.0
> **Estado general:** ~18% completado

---

## 🎯 ¿Qué problema resolvemos?

### Situación actual en hospitales y clínicas

Los hospitales y clínicas en Chile enfrentan diariamente estos desafíos:

- **Gestión manual**: Los horarios del personal se manejan en planillas Excel, lo que genera errores frecuentes y dificulta la planificación
- **Falta de visibilidad**: El personal de salud no sabe con certeza cuándo le toca trabajar hasta que revisa físicamente el calendario impreso
- **Cálculos complejos**: Calcular los pagos correctos es una pesadilla - hay que considerar turnos diurnos, nocturnos, fines de semana, feriados y horas extra
- **Sistemas biométricos problemáticos**: Los sistemas de control de asistencia fallan constantemente y generan conflictos sobre quién trabajó realmente
- **Múltiples empleadores**: El personal trabaja en varios hospitales simultáneamente pero cada institución maneja su propia información sin coordinación
- **Intercambios informales**: Cuando alguien necesita cambiar un turno, debe llamar a compañeros uno por uno hasta encontrar reemplazo

### ¿Cómo VITA soluciona esto?

VITA es una plataforma digital que permite a hospitales y clínicas:

✅ Ver todos los horarios en un calendario digital centralizado  
✅ Calcular automáticamente los pagos según las horas trabajadas y las condiciones especiales  
✅ Validar que se cumplan las leyes laborales chilenas  
✅ Permitir que el personal trabaje en múltiples hospitales sin perder control  
✅ Aprobar intercambios de turnos de forma digital y rápida  
✅ Registrar asistencias manualmente (con opción futura de integrar sistemas biométricos)  
✅ Acceder desde celulares mediante una aplicación móvil

---

## ✅ Requerimientos Completados

### 1. Página de Presentación y Marca

**¿Qué se logró?**

- Página web atractiva donde los hospitales pueden conocer VITA y sus beneficios
- Identidad visual profesional (colores, logotipos, diseño)
- Secciones informativas sobre precios, funcionalidades y contacto

**¿Para quién?**

- Hospitales y clínicas interesados en contratar el servicio
- Inversionistas que quieran conocer el proyecto

---

### 2. Sistema de Acceso y Seguridad

**¿Qué se logró?**

- Registro de usuarios con correo electrónico y contraseña
- Inicio de sesión con cuenta de Google
- Recuperación de contraseña cuando se olvida
- Protección de información personal de cada usuario

**¿Para quién?**

- Todo el personal: administradores, jefes de área y personal de salud

---

### 3. Panel de Control para Administrador Principal (SUPER_ADMIN)

**¿Qué se logró?**

- Vista completa de todas las organizaciones (hospitales/clínicas) que usan VITA
- Crear nuevas organizaciones en el sistema
- Modificar información de organizaciones existentes (nombre, dirección, contacto)
- Suspender organizaciones que no paguen o desactivarlas temporalmente
- Establecer límites de usuarios por organización:
  - Cuántos administradores de recursos humanos pueden tener
  - Cuántos jefes de área pueden contratar
  - Cuánto personal de salud pueden gestionar
- Ver alertas cuando una organización se acerca a sus límites contratados

**¿Para quién?**

- Equipo interno de VITA que supervisa a todas las organizaciones

**¿Qué falta?**

- Registrar pagos de las organizaciones
- Ver historial de pagos y morosidad
- Enviar notificaciones automáticas sobre pagos pendientes

---

### 4. Panel de Recursos Humanos (ADMIN_HR)

**¿Qué se logró?**

#### 4.1. Vista General de la Organización

- Ver información resumida del hospital/clínica
- Consultar cuántos jefes y personal de salud están contratados
- Ver cuánto espacio queda disponible según el plan contratado
- Alertas visuales cuando se está cerca del límite de usuarios

#### 4.2. Invitaciones de Personal

- Buscar personas por correo electrónico o número de documento
- Invitar nuevos jefes de área al sistema
- Invitar personal de salud (enfermeros, médicos, técnicos)
- Ver todas las invitaciones pendientes
- Cancelar invitaciones que aún no han sido aceptadas
- Validar que no se repitan documentos de identidad dentro de la misma organización

#### 4.3. Gestión de Áreas

- Crear áreas funcionales (UCI, Urgencias, Pabellón, etc.)
- Asignar un color e icono visual a cada área
- Definir qué tipos de turnos se pueden usar en cada área
- Configurar límites de trabajo:
  - Máximo de horas seguidas que se puede trabajar
  - Mínimo de horas de descanso entre turnos
- Asignar jefes responsables de cada área
- Activar o desactivar áreas según necesidad
- Ver qué personal está asignado a cada área

#### 4.4. Tipos de Turnos

- Crear diferentes tipos de turnos (mañana, tarde, noche, guardia de 24h, etc.)
- Definir la duración de cada tipo de turno
- Clasificar turnos como diurnos, nocturnos o mixtos
- Asignar colores para identificarlos fácilmente en el calendario
- Marcar si un tipo de turno aplica para todas las áreas o solo algunas específicas
- Establecer límites de personal por turno
- Ver cuántas áreas usan cada tipo de turno antes de eliminarlo

#### 4.5. Sistema de Tarifas y Contratos

- **Plantillas de Tarifas Personalizables:**
  - Crear tarifas completamente flexibles usando componentes modulares
  - Usar plantillas predefinidas (guardias médicas, seguridad, construcción, etc.) o crear desde cero
  - Añadir múltiples componentes a una tarifa:
    - Salarios base (mensual, quincenal, semanal)
    - Pagos por tiempo (por minuto, hora o turno completo)
    - Bonos especiales (nocturno, fin de semana, feriados)
    - Multiplicadores (horas extra, antigüedad, peligrosidad)
    - Bonos fijos y porcentuales
    - Compensaciones por disponibilidad y guardias
  - Definir condiciones de aplicación (siempre, solo de noche, solo fines de semana, etc.)
  - Formateo automático según moneda del país (Chile, EE.UU., etc.)
  - Duplicar plantillas existentes para crear variaciones rápidas
- **Asignación de Contratos:**
  - Asignar una plantilla de tarifa a cada persona del personal
  - Asociar contratos a áreas específicas
  - Aplicar multiplicadores personalizados (ej: 1.2x para personal senior)
  - Ver quién tiene contrato activo y quién no
  - Finalizar contratos cuando termine la relación laboral
  - Añadir notas adicionales a cada contrato

#### 4.6. Gestión de Personal

- Ver listado completo de todo el personal de la organización
- Filtrar por jefes de área o personal de salud
- Ver qué áreas tiene asignadas cada persona
- Consultar estado de contrato (activo o sin contrato)
- Ver qué tarifa tiene asignada cada persona
- Identificar rápidamente personal sin contrato mediante alertas
- Acceso directo al módulo de tarifas para gestionar contratos

#### 4.7. Tablero de Métricas

- Ver en tiempo real:
  - Total de áreas creadas
  - Tipos de turno activos
  - Cantidad total de personal (jefes + personal de salud)
  - Contratos laborales activos
  - Turnos programados del mes actual
- Alertas visuales sobre límites de usuarios contratados

**¿Para quién?**

- Departamento de Recursos Humanos del hospital/clínica

**¿Qué falta?**

- Calcular automáticamente cuánto se debe pagar por cada turno trabajado
- Gestionar el calendario organizacional para marcar feriados y días especiales
- Generar reportes exportables (Excel/PDF) de personal y contratos
- Cambiar área principal de un empleado de forma masiva
- Ver métricas avanzadas de horas trabajadas por área

---

### 5. Panel de Jefes de Área (CHIEF_AREA)

**¿Qué se logró?**

- Ver únicamente las áreas donde están asignados como jefes
- Consultar qué personal trabaja en sus áreas
- Ver contratos y tarifas del personal a su cargo
- Crear y gestionar turnos en sus áreas
- Usar solo los tipos de turnos permitidos para sus áreas
- Crear y gestionar rotativas de turno en sus áreas
- Asignar turnos extra usando el motor de recomendación por tiers

**¿Para quién?**

- Jefes de UCI, Urgencias, Pabellón, y otras áreas del hospital

**¿Qué falta?**

- Vincular nuevo personal directamente mediante código de vinculación
- Aprobar o rechazar intercambios de turnos solicitados por su personal
- Marcar asistencia del personal manualmente
- Gestionar ausencias y buscar reemplazos de último momento

---

### 6. Panel de Personal de Salud (STAFF)

**¿Qué se logró?**

- Al registrarse, obtienen un código personal de vinculación
- Pueden ser invitados por Recursos Humanos o Jefes de Área
- Ver sus propios turnos asignados en una organización

**¿Para quién?**

- Enfermeros, médicos, técnicos y todo el personal que trabaja turnos

**¿Qué falta?**

- Ver un calendario unificado con turnos de TODAS las organizaciones donde trabajan
- Ver turnos disponibles y postular a ellos
- Solicitar intercambio de turnos con compañeros
- Aceptar o rechazar solicitudes de intercambio
- Recibir notificaciones de cambios en sus turnos
- Confirmar asistencia a turnos

---

### 7. Calendario Visual de Turnos

**¿Qué se logró?**

- Calendario digital donde se ven todos los turnos programados
- Vista mensual con colores diferentes para cada tipo de turno
- Filtros por área y por persona
- Información completa de cada turno al hacer clic
- Creación y edición de turnos desde el calendario

**¿Para quién?**

- Recursos Humanos, Jefes de Área y Personal de Salud (cada uno ve según sus permisos)

**¿Qué falta?**

- Arrastrar y soltar turnos para moverlos fácilmente
- Vista semanal y diaria del calendario
- Indicadores visuales de conflictos de horario
- Exportar calendario a PDF
- Sincronizar con calendarios personales (Google Calendar, Apple Calendar)

---

### 8. Sistema de Perfiles Avanzados

**¿Qué se logró?**

#### 8.1. Gestión de Documentos de Identidad

- Cada persona puede actualizar su país, tipo de documento (RUT, DNI, etc.) y número
- El sistema verifica que no haya documentos duplicados dentro de la misma organización
- Se guarda un historial completo de todos los cambios de documento para auditorías
- Al invitar personal, se valida que no exista duplicidad de documentos

#### 8.2. Múltiples Correos Electrónicos

- Cada persona puede registrar varios correos electrónicos
- Solo uno puede ser el correo principal
- Se puede agregar y eliminar correos secundarios
- Todos los correos deben ser únicos en el sistema (no se pueden repetir)
- Preparado para vincular cuentas de Google en el futuro

#### 8.3. Fotos de Perfil Personalizadas

- Subir foto personal desde el celular o computadora
- Formatos permitidos: JPG, PNG, WEBP
- Tamaño máximo: 5MB por imagen
- Eliminar foto personalizada cuando se desee
- Si se inició sesión con Google, se usa esa foto automáticamente
- Si no hay foto, se muestran las iniciales del nombre
- Las fotos se almacenan de forma segura y privada

**¿Para quién?**

- Todos los usuarios del sistema

**¿Qué falta?**

- Verificar correos secundarios mediante email de confirmación
- Vincular/desvincular cuentas de Google a cuentas existentes
- Cambiar contraseña más fácilmente
- Ver historial de cambios de perfil

---

### 9. Rotativas de Turno

**¿Qué se logró?**

#### 9.1. Creación y Configuración de Rotativas

- Crear rotativas cíclicas con nombre, fecha de inicio y período de repetición
- Definir pasos (patrón): cada paso indica un tipo de turno con horario específico o día libre
- Configurar la duración del ciclo (ej: 7 días, 14 días, 28 días)
- Asignar la rotativa a un área funcional específica
- Activar/desactivar rotativas según necesidad

#### 9.2. Grupos y Miembros

- Crear múltiples grupos dentro de una rotativa (sub-equipos que rotan con desfase)
- Asignar personal de salud a cada grupo
- Configurar el desfase de cada grupo (ej: Grupo B empieza 7 días después que Grupo A)
- Ver listado de miembros por grupo con estado y orden

#### 9.3. Generación Automática de Turnos

- Generar turnos masivamente para un rango de fechas (hasta 300+ turnos por rotativa)
- El sistema aplica el patrón cíclico a cada grupo respetando el desfase
- Los turnos generados aparecen en el calendario general
- Posibilidad de regenerar turnos (elimina anteriores y crea nuevos)
- Indicador visual de progreso durante la generación

#### 9.4. Monitoreo de Cobertura

- Visualizar qué porcentaje del período está cubierto por cada grupo
- Detectar brechas de cobertura (días sin personal asignado)
- Ver estadísticas: días cubiertos, descubiertos, y tipo de turnos

#### 9.5. Asignación de Turnos Extra (Motor de Tiers)

- Sistema inteligente que clasifica candidatos para turnos extra en niveles:
  - **Tier 1:** Personas que no trabajan ese día ni los días contiguos (ideal)
  - **Tier 2:** Personas que trabajan días contiguos pero no ese día
  - **Tier 3:** Personas que trabajan ese día en otro horario (posible conflicto)
  - **Nunca recomendar:** Personas que superan 48h de trabajo reciente
- Respetar restricciones legales de horas máximas de trabajo
- Asignar turnos extra directamente desde la recomendación

#### 9.6. Edición Individual de Turnos Generados

- Cada turno generado por rotativa puede editarse individualmente
- Los turnos editados se marcan como "modificado manualmente"
- La regeneración de rotativas respeta que los turnos modificados pueden perderse (confirmación al usuario)

**¿Para quién?**

- Recursos Humanos (ADMIN_HR) y Jefes de Área (CHIEF_AREA)

**¿Qué falta?**

- Intercambios de turnos dentro de rotativas
- Notificaciones por email de cambios en rotativas
- Vista de calendario con agrupación visual de turnos de rotativa
- Clonar rotativas existentes para crear variantes

---

### 10. Sistema de Notificaciones (Parcial)

**¿Qué se logró?**

- Bandeja de entrada de notificaciones para ADMIN_HR, CHIEF_AREA y STAFF
- Notificaciones in-app para eventos de rotativas:
  - Asignación a rotativa
  - Generación de turnos desde rotativa
  - Asignación de turnos extra
- Marcar notificaciones como leídas
- Contador de notificaciones no leídas en la navegación

**¿Para quién?**

- Todo el personal (cada rol ve sus propias notificaciones)

**¿Qué falta?**

- Envío de notificaciones por email
- Notificaciones en tiempo real (WebSocket/SSE)
- Notificaciones para SUPER_ADMIN
- Notificaciones push en móvil
- Preferencias de notificación por usuario

---

## ⏳ Requerimientos Pendientes

### 1. Sistema de Pagos y Facturación

**¿Qué se necesita?**

- Calcular automáticamente cuánto cuesta cada turno según:
  - Tarifa base del personal
  - Bonos por horario (nocturno, fin de semana)
  - Multiplicadores por día especial (feriados irrenunciables)
  - Horas extra trabajadas
- Generar preview del costo antes de confirmar un turno
- Panel para el equipo VITA donde registren pagos recibidos de organizaciones
- Ver historial de pagos y detectar organizaciones morosas
- Calcular automáticamente cuánto debe pagar cada organización según usuarios activos
- Generar reportes mensuales de facturación

**¿Por qué es importante?**

- Automatiza el cálculo de nómina, evitando errores manuales
- Transparenta los costos para hospitales
- Facilita la gestión financiera del negocio VITA

---

### 2. Calendario Organizacional

**¿Qué se necesita?**

- Marcar días especiales en el calendario:
  - Feriados nacionales
  - Feriados irrenunciables (pagan doble o triple)
  - Días festivos locales
  - Días con eventos especiales del hospital
- Definir multiplicadores de pago por cada tipo de día
- Importar feriados chilenos automáticamente
- Crear días recurrentes (ej: todos los domingos tienen bono extra)

**¿Por qué es importante?**

- Los turnos en feriados se pagan diferente según la ley chilena
- Automatiza el cálculo correcto de pagos especiales

---

### 3. Sistema de Notificaciones (completar)

**¿Qué se necesita?** (parcialmente implementado — ver sección 10 en Completados)

- Enviar correos electrónicos automáticos cuando:
  - Se les asigna un nuevo turno
  - Alguien solicita intercambio de turno
  - Se cancela o modifica un turno
  - Se acerca la fecha de un turno (recordatorio)
  - Hay invitaciones pendientes por aceptar
- Notificaciones en tiempo real (WebSocket/SSE)
- Notificaciones push en celulares (para la app móvil futura)
- Preferencias de notificación por usuario

**¿Por qué es importante?**

- El personal no tiene que revisar constantemente el sistema
- Reduce ausencias por olvido de turnos
- Mejora la comunicación entre jefes y personal

---

### 4. Gestión Completa de Turnos

**¿Qué se necesita?**

#### 4.1. Intercambios de Turnos

- Personal puede solicitar intercambio con un compañero
- El compañero recibe notificación y puede aceptar o rechazar
- El jefe de área debe aprobar el intercambio final
- Historial de intercambios realizados

#### 4.2. Postulaciones a Turnos Abiertos

- Jefe publica turno como "abierto" (sin asignar a nadie específico)
- Personal interesado puede postular al turno
- Jefe ve todas las postulaciones y elige a alguien
- Sistema confirma asignación automáticamente

#### 4.3. Registro de Asistencia

- Marcar manualmente quién asistió realmente a su turno
- Registrar llegadas tarde o salidas anticipadas
- Justificar ausencias
- Buscar reemplazos de emergencia
- Integración futura con sistemas biométricos

**¿Por qué es importante?**

- Da flexibilidad al personal para organizar su vida personal
- Reduce ausentismo
- Permite cubrir urgencias de forma ágil

---

### 5. Reportes y Analytics

**¿Qué se necesita?**

#### Para Recursos Humanos:

- Horas trabajadas por persona en un período
- Costos de nómina por área
- Distribución de personal por horario
- Turnos con más ausencias
- Personal con más horas extra

#### Para Jefes de Área:

- Resumen de cobertura de sus áreas
- Personal con mejor puntualidad
- Turnos críticos sin cubrir

#### Para SUPER_ADMIN:

- Uso de la plataforma por organización
- Organizaciones más activas
- Crecimiento de usuarios por mes

**Formatos de exportación:**

- Excel (para procesar datos)
- PDF (para impresión y presentaciones)
- CSV (para integrar con otros sistemas)

**¿Por qué es importante?**

- Permite tomar decisiones basadas en datos reales
- Facilita auditorías laborales
- Identifica problemas antes de que se agraven

---

### 6. Validaciones Legales

**¿Qué se necesita?**

- Alertas cuando se superen límites legales del Código del Trabajo:
  - Máximo de horas semanales permitidas
  - Mínimo de descanso entre turnos
  - Máximo de horas continuas de trabajo
- Bloquear creación de turnos que violen leyes laborales
- Generar reportes de cumplimiento legal para fiscalizaciones
- Adaptar validaciones según leyes de cada país (Chile, Argentina, etc.)

**¿Por qué es importante?**

- Evita multas laborales para los hospitales
- Protege la salud del personal (evita agotamiento)
- Demuestra cumplimiento normativo ante auditorías

---

### 7. Aplicación Móvil

**¿Qué se necesita?**

- App nativa para celulares Android e iOS, o
- Versión web optimizada para celulares (PWA)
- Funcionalidades prioritarias:
  - Ver calendario personal
  - Recibir notificaciones push
  - Solicitar intercambios de turno
  - Postular a turnos abiertos
  - Confirmar asistencia
  - Chat con jefes y compañeros (futuro)

**¿Por qué es importante?**

- El personal de salud no siempre tiene acceso a computadores
- Mayor adopción y uso frecuente de la plataforma
- Facilita comunicación en tiempo real

---

### 8. Personal Trabajando en Múltiples Organizaciones

**¿Qué se necesita?**

- Una misma persona puede estar vinculada a varios hospitales/clínicas
- Ver calendario unificado con turnos de todas sus organizaciones
- Detectar conflictos de horario entre organizaciones
- Alertar cuando se asigne turno que choque con otro hospital
- Cada organización paga solo por los turnos trabajados en su institución

**¿Por qué es importante?**

- Es muy común que personal de salud trabaje en 2-3 lugares
- Evita que acepten turnos que se traslapan
- Cada hospital tiene visibilidad solo de su información, pero el personal ve todo

---

### 9. Mejoras de Usabilidad

**¿Qué se necesita?**

- Modo oscuro (para usar de noche sin cansar la vista)
- Arrastrar y soltar turnos en el calendario
- Atajos de teclado para acciones comunes
- Tutorial interactivo para nuevos usuarios
- Búsqueda global (buscar persona, área o turno desde cualquier parte)
- Filtros avanzados con guardado de preferencias
- Comparación de períodos (comparar este mes vs mes anterior)

**¿Por qué es importante?**

- Reduce el tiempo de capacitación
- Hace más eficiente el trabajo diario
- Mejora la experiencia de usuario

---

## 📊 Resumen del Estado Actual

### Por Funcionalidad:

| Área                       | Estado  | Comentarios                                                                                      |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| **Página de presentación** | ✅ 100% | Completada y funcional                                                                           |
| **Acceso y seguridad**     | ✅ 100% | Registro, login con Google, recuperación de contraseña                                           |
| **Panel SUPER_ADMIN**      | ✅ 85%  | Falta gestión de pagos                                                                           |
| **Panel ADMIN_HR**         | ✅ 95%  | Completado: áreas, turnos, tarifas, personal, rotativas. Falta: cálculo de pagos, calendario org |
| **Panel CHIEF_AREA**       | ⏳ 65%  | Funcional: turnos, rotativas, personal. Falta: vinculación directa, aprobaciones, asistencia     |
| **Panel STAFF**     | ⏳ 30%  | Solo vista básica. Falta todo el ecosistema de turnos                                            |
| **Calendario visual**      | ✅ 75%  | Funcional. Falta: drag-and-drop, vistas múltiples, sincronización                                |
| **Sistema de tarifas**     | ✅ 95%  | Completado: plantillas flexibles, contratos. Falta: cálculo automático de pagos                  |
| **Perfiles avanzados**     | ✅ 90%  | Completado: documentos, emails, fotos. Falta: verificación de emails                             |
| **Rotativas de turno**     | ✅ 95%  | Completado: CRUD, grupos, generación, cobertura, extras. Falta: vista agrupada en calendario     |
| **Notificaciones**         | ⏳ 30%  | Bandeja in-app funcional. Falta: email, tiempo real, push                                        |
| **Reportes**               | ❌ 0%   | Pendiente                                                                                        |
| **App móvil**              | ❌ 0%   | Pendiente                                                                                        |
| **Multi-organización**     | ⏳ 40%  | Backend listo. Falta: UI de calendario unificado                                                 |

### Por Rol de Usuario:

| Rol              | Puede hacer hoy                                                                                                                | Le falta                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **SUPER_ADMIN**  | Gestionar todas las organizaciones, crear usuarios ADMIN_HR, establecer límites                                                | Registrar pagos, ver morosidad, notificaciones                                                     |
| **ADMIN_HR**     | Crear áreas, tipos de turno, tarifas flexibles, invitar personal, asignar contratos, ver métricas, crear y gestionar rotativas | Calcular pagos automáticos, gestionar calendario organizacional, exportar reportes                 |
| **CHIEF_AREA**   | Ver sus áreas, gestionar turnos y rotativas, ver su personal, asignar extras con motor de tiers                                | Vincular personal directamente, aprobar intercambios, marcar asistencia                            |
| **STAFF** | Ver sus turnos en una organización, recibir notificaciones in-app                                                              | Ver calendario unificado multi-org, postular a turnos, intercambiar turnos, notificaciones por email |

---

## 🎯 Próximos Pasos Recomendados

**Para Febrero-Marzo 2026:**

1. **Vista híbrida del calendario** (en progreso)
   - Agrupar turnos de rotativa en bloques compactos en el calendario
   - Turnos manuales se muestran individualmente
   - Click en bloque → detalle con lista de personas

2. **Gestión del calendario organizacional**
   - UI para marcar feriados y días especiales
   - Multiplicadores de pago por tipo de día
   - Importar feriados chilenos automáticamente

3. **Completar cálculo automático de pagos**
   - Implementar lógica de cálculo por componentes de tarifa
   - Mostrar preview de costo al crear turno
   - Generar resumen de costos mensuales

4. **Testing manual exhaustivo**
   - Probar todos los flujos con datos reales (rotativas, tarifas, contratos)
   - Identificar y corregir errores
   - Optimizar rendimiento

**Para Abril-Junio 2026:**

5. **Intercambios de turnos**
6. **Reportes exportables (Excel/PDF)**
7. **Gestión de asistencia manual**
8. **Validaciones legales avanzadas**

**Para segundo semestre 2026:**

9. **Aplicación móvil (PWA)**
10. **Calendario unificado multi-organización**
11. **Postulaciones a turnos abiertos**
12. **Analytics avanzado**

---

## 📝 Notas Finales

Este documento refleja el estado del proyecto en **Febrero 2026**.

**Fortalezas actuales:**

- ✅ Base sólida de gestión de organizaciones, áreas y personal
- ✅ Sistema de tarifas completamente flexible y profesional
- ✅ Rotativas de turno con generación automática masiva
- ✅ Motor de asignación de extras con clasificación por tiers (cumplimiento laboral)
- ✅ Calendario visual funcional
- ✅ Perfiles de usuario completos con múltiples emails y fotos
- ✅ Validaciones de documentos únicos por organización
- ✅ Sistema multi-tenant bien estructurado
- ✅ Notificaciones in-app funcionales

**Áreas de oportunidad:**

- ⚠️ Cálculo automático de pagos (crítico para el valor del producto)
- ⚠️ Notificaciones por email y tiempo real (clave para adopción)
- ⚠️ Experiencia móvil (el personal de salud trabaja en movimiento)
- ⚠️ Multi-organización para staff (diferenciador clave vs competencia)

**Competidor principal:** Rflex
**Ventaja competitiva de VITA:** Flexibilidad total en tarifas, rotativas inteligentes con motor de extras, soporte multi-organización para personal

---

**Documento creado para:** Stakeholders no técnicos, inversores, gerentes de producto  
**Última actualización:** Febrero 2026
