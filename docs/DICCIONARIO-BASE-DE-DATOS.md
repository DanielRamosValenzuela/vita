# Diccionario de Base de Datos VITA

> **Documento para entender qué información guarda el sistema**  
> **Fecha:** Febrero 2026  
> **Audiencia:** Gerentes, administradores, personal no técnico

---

## 📋 Índice de Tablas

1. [Organización (Hospital/Clínica)](#organización-hospitalclínica)
2. [Usuario (Personal)](#usuario-personal)
3. [Emails del Usuario](#emails-del-usuario)
4. [Historial de Documentos](#historial-de-documentos)
5. [Cuenta de Acceso](#cuenta-de-acceso)
6. [Sesión Activa](#sesión-activa)
7. [Área Funcional](#área-funcional)
8. [Relación Usuario-Área](#relación-usuario-área)
9. [Invitación a Organización](#invitación-a-organización)
10. [Tipo de Turno](#tipo-de-turno)
11. [Relación Área-Tipo de Turno](#relación-área-tipo-de-turno)
12. [Turno Programado](#turno-programado)
13. [Rotativa de Turno](#rotativa-de-turno)
14. [Paso de Rotativa](#paso-de-rotativa)
15. [Configuración de Turno en Rotativa](#configuración-de-turno-en-rotativa)
16. [Grupo de Rotativa](#grupo-de-rotativa)
17. [Miembro de Grupo de Rotativa](#miembro-de-grupo-de-rotativa)
18. [Plantilla de Tarifa](#plantilla-de-tarifa)
19. [Componente de Tarifa](#componente-de-tarifa)
20. [Vinculación Componente-Tipo de Turno](#vinculación-componente-tipo-de-turno)
21. [Contrato Laboral](#contrato-laboral)
22. [Calendario Organizacional](#calendario-organizacional)
23. [Pago de Turno](#pago-de-turno)
24. [Desglose de Pago](#desglose-de-pago)

---

## 1. Organización (Hospital/Clínica)

**¿Qué guarda?**  
Información de cada hospital o clínica que contrata VITA.

### Campos:

| Campo                   | ¿Qué significa?                                              |
| ----------------------- | ------------------------------------------------------------ |
| **Nombre**              | Nombre del hospital o clínica (ej: "Clínica Santa María")    |
| **País**                | En qué país opera (Chile, Perú, Colombia, etc.)              |
| **Moneda**              | Moneda que usan para pagos (Pesos chilenos, Dólares, etc.)   |
| **RUT/Tax ID**          | Número de identificación tributaria del hospital             |
| **Plan**                | Plan contratado (Básico, Profesional o Empresarial)          |
| **Estado**              | Si está activo, suspendido, o con pago pendiente             |
| **Cuota mensual**       | Cuánto paga mensualmente a VITA                              |
| **Límite Admin HR**     | Máximo de personas de Recursos Humanos permitidas (5 gratis) |
| **Límite Jefes**        | Máximo de jefes de área que pueden contratar                 |
| **Límite Staff**        | Máximo de personal de salud que pueden gestionar             |
| **Próximo pago**        | Fecha del siguiente pago esperado                            |
| **Contacto: Nombre**    | Nombre de la persona de contacto principal                   |
| **Contacto: Email**     | Correo de contacto del hospital                              |
| **Contacto: Teléfono**  | Teléfono de contacto                                         |
| **Dirección**           | Dirección física del hospital                                |
| **Fecha de creación**   | Cuándo se dio de alta en VITA                                |
| **Última modificación** | Última vez que se actualizó su información                   |

**¿Para qué sirve?**  
Es el "contenedor" principal. Cada hospital tiene su propia información aislada del resto.

---

## 2. Usuario (Personal)

**¿Qué guarda?**  
Información personal de cada persona que usa el sistema (administradores, jefes, personal de salud).

### Campos:

| Campo                     | ¿Qué significa?                                                 |
| ------------------------- | --------------------------------------------------------------- |
| **Email**                 | Correo electrónico principal (único en todo el sistema)         |
| **Nombre**                | Nombre completo de la persona                                   |
| **País**                  | País de residencia                                              |
| **Tipo de documento**     | Tipo de identificación (RUT, DNI, Pasaporte, etc.)              |
| **Número de documento**   | Número de identificación oficial                                |
| **Email verificado**      | Si confirmó su correo electrónico                               |
| **Foto de perfil**        | Foto que se muestra (de Google, si inició sesión así)           |
| **Foto personalizada**    | Foto que subió el propio usuario                                |
| **Fuente de la foto**     | De dónde viene la foto (Google, subida por usuario, etc.)       |
| **Rol**                   | Qué tipo de usuario es (Administrador, Jefe, Personal)          |
| **Organización**          | A qué hospital/clínica pertenece actualmente                    |
| **Código de vinculación** | Código único para que lo inviten a organizaciones               |
| **Teléfono**              | Número de teléfono (opcional)                                   |
| **Dirección**             | Dirección personal (opcional)                                   |
| **Información adicional** | Campo libre para ciudad, región, código postal, etc. (opcional) |
| **Fecha de nacimiento**   | Cuándo nació (opcional)                                         |
| **Fecha de creación**     | Cuándo se registró en VITA                                      |
| **Última modificación**   | Última actualización de su perfil                               |

**¿Para qué sirve?**  
Es la información básica de cada persona. Un mismo usuario puede estar vinculado a varios hospitales, pero tiene un solo perfil personal.

---

## 3. Emails del Usuario

**¿Qué guarda?**  
Todos los correos electrónicos asociados a una persona.

### Campos:

| Campo                   | ¿Qué significa?                                              |
| ----------------------- | ------------------------------------------------------------ |
| **Email**               | Dirección de correo electrónico                              |
| **Es principal**        | Si es el correo principal del usuario (solo uno puede serlo) |
| **Está verificado**     | Si la persona confirmó que es dueña de ese email             |
| **Proveedor**           | De dónde viene el email (Google, registro manual, etc.)      |
| **Fecha de creación**   | Cuándo se agregó este email                                  |
| **Última modificación** | Última actualización                                         |

**¿Para qué sirve?**  
Permite que una persona tenga varios correos (personal, trabajo, etc.) y pueda vincular su cuenta de Google sin perder su cuenta existente.

**Ejemplo:**

- Usuario tiene: `javier@hospital.cl` (principal)
- Agrega: `javier@gmail.com` (secundario)
- Vincula con Google usando el Gmail
- Puede iniciar sesión con cualquiera de los dos

---

## 4. Historial de Documentos

**¿Qué guarda?**  
Registro histórico de todos los cambios de documento de identidad de una persona.

### Campos:

| Campo                   | ¿Qué significa?                                           |
| ----------------------- | --------------------------------------------------------- |
| **País**                | País del documento                                        |
| **Tipo de documento**   | RUT, DNI, Pasaporte, etc.                                 |
| **Número de documento** | Número de identificación                                  |
| **Válido desde**        | Desde cuándo tuvo este documento                          |
| **Válido hasta**        | Hasta cuándo lo tuvo (si ya cambió a otro)                |
| **Razón del cambio**    | Por qué cambió de documento (inicial, cambio, renovación) |
| **Fecha de registro**   | Cuándo se guardó este cambio                              |

**¿Para qué sirve?**  
Auditoría completa. Si una persona cambia de documento (ej: extranjero que obtiene RUT chileno), queda registrado el anterior para trazabilidad legal.

**Ejemplo:**

- 01/2024: Usuario se registra con Pasaporte USA #123456 (razón: inicial)
- 06/2024: Obtiene RUT chileno #12345678 (razón: cambio)
- El sistema guarda ambos registros con fechas

---

## 5. Cuenta de Acceso

**¿Qué guarda?**  
Métodos de inicio de sesión de cada usuario.

### Campos:

| Campo                   | ¿Qué significa?                                                              |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Tipo**                | Tipo de cuenta (OAuth para Google, Credentials para email/contraseña)        |
| **Proveedor**           | Servicio usado (Google, Email, GitHub, etc.)                                 |
| **ID del proveedor**    | Identificador único en ese servicio                                          |
| **Token de refresco**   | Permite renovar sesión sin pedir contraseña de nuevo                         |
| **Token de acceso**     | Información de sesión actual (o contraseña encriptada si es registro manual) |
| **Fecha de expiración** | Cuándo caduca el token                                                       |

**¿Para qué sirve?**  
Permite que una persona pueda iniciar sesión con Google Y con email/contraseña (ambos a la vez).

**Ejemplo:**

- Usuario se registra con email: tiene 1 cuenta tipo "Credentials"
- Luego vincula Google: tiene 2 cuentas (Credentials + Google)
- Puede iniciar sesión con cualquiera de los dos métodos

---

## 6. Sesión Activa

**¿Qué guarda?**  
Sesiones abiertas de usuarios que están usando el sistema actualmente.

### Campos:

| Campo                   | ¿Qué significa?                                                |
| ----------------------- | -------------------------------------------------------------- |
| **Token de sesión**     | Identificador único de esta sesión                             |
| **Usuario**             | Quién está en sesión                                           |
| **Fecha de expiración** | Cuándo caduca la sesión (después debe volver a iniciar sesión) |

**¿Para qué sirve?**  
Mantiene a los usuarios conectados sin pedirles contraseña cada vez. Por seguridad, las sesiones caducan después de 30 días.

---

## 7. Área Funcional

**¿Qué guarda?**  
Áreas o departamentos dentro de un hospital (UCI, Urgencias, Pabellón, etc.).

### Campos:

| Campo                           | ¿Qué significa?                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Nombre**                      | Nombre del área (ej: "UCI Adultos", "Urgencias Pediátricas")                                                              |
| **Descripción**                 | Información adicional sobre el área                                                                                       |
| **Icono**                       | Icono visual para identificar el área fácilmente                                                                          |
| **Color**                       | Color asignado (para visualizar en calendarios y gráficos)                                                                |
| **Está activa**                 | Si el área está operativa o fue desactivada temporalmente                                                                 |
| **Máximo de horas seguidas**    | Cuántas horas máximo puede trabajar alguien sin descanso en esta área                                                     |
| **Mínimo de horas de descanso** | Cuántas horas mínimas debe descansar entre turnos                                                                         |
| **Horario diurno (inicio/fin)** | Desde qué hora hasta qué hora se considera "día" en esta área (ej: 08:00 → 20:00). Fuera de ese rango se considera noche. |
| **Organización**                | A qué hospital pertenece                                                                                                  |
| **Fecha de creación**           | Cuándo se creó el área                                                                                                    |
| **Última modificación**         | Última actualización                                                                                                      |

**¿Para qué sirve?**  
Organiza el hospital en departamentos. Cada área tiene sus propios jefes, personal y tipos de turnos permitidos.

**Ejemplo:**

- UCI Adultos: máximo 12 horas seguidas, mínimo 8 horas de descanso, día de 08:00 a 20:00 (noche el resto).
- Urgencias: máximo 24 horas seguidas, mínimo 12 horas de descanso, día de 07:00 a 19:00.

---

## 8. Relación Usuario-Área

**¿Qué guarda?**  
Qué jefes están asignados a qué áreas.

### Campos:

| Campo       | ¿Qué significa?   |
| ----------- | ----------------- |
| **Usuario** | Jefe de área      |
| **Área**    | Área que gestiona |

**¿Para qué sirve?**  
Un jefe puede gestionar varias áreas, y un área puede tener varios jefes. Esta tabla conecta quién es responsable de qué.

**Ejemplo:**

- Dr. González es jefe de UCI y Urgencias
- Dra. Morales es jefa de UCI y Pabellón
- UCI tiene 2 jefes: González y Morales

---

## 9. Invitación a Organización

**¿Qué guarda?**  
Invitaciones pendientes, aceptadas o rechazadas de personas a hospitales.

### Campos:

| Campo                   | ¿Qué significa?                                        |
| ----------------------- | ------------------------------------------------------ |
| **Organización**        | Qué hospital está invitando                            |
| **Usuario**             | A quién están invitando                                |
| **Rol**                 | Cómo qué lo invitan (Jefe de Área o Personal de Salud) |
| **Estado**              | Pendiente, aceptada, rechazada o expirada              |
| **Invitado por**        | Quién envió la invitación                              |
| **Fecha de creación**   | Cuándo se envió la invitación                          |
| **Fecha de aceptación** | Cuándo aceptó la invitación (si la aceptó)             |
| **Última modificación** | Última actualización del estado                        |

**¿Para qué sirve?**  
Registra todas las invitaciones. El usuario ve invitaciones pendientes en su perfil y puede aceptarlas o rechazarlas.

**Ejemplo:**

- Hospital Central invita a enfermera@gmail.com como STAFF
- Ella ve la invitación en su perfil
- Acepta → queda vinculada al hospital
- Rechaza → la invitación queda marcada como rechazada

---

## 10. Tipo de Turno

**¿Qué guarda?**  
Tipos de turnos disponibles (mañana, tarde, noche, guardia 24h, etc.).

### Campos:

| Campo                            | ¿Qué significa?                                                  |
| -------------------------------- | ---------------------------------------------------------------- |
| **Nombre**                       | Nombre del tipo de turno (ej: "Guardia Nocturna", "Turno Largo") |
| **Descripción**                  | Información adicional sobre el turno                             |
| **Icono**                        | Icono visual                                                     |
| **Duración en minutos**          | Cuánto dura el turno (ej: 480 minutos = 8 horas)                 |
| **Clasificación**                | Si es diurno, nocturno o mixto                                   |
| **Color**                        | Color para identificarlo en el calendario                        |
| **Mínimo de personal requerido** | Cuántas personas mínimo se necesitan                             |
| **Personal ideal**               | Cuántas personas es ideal tener                                  |
| **Máximo de personal permitido** | Cuántas personas máximo pueden trabajar este turno               |
| **Días de descanso sugeridos**   | Cuántos días de descanso se recomienda dar después               |
| **Es global**                    | Si aplica para todas las áreas o solo algunas específicas        |
| **Está activo**                  | Si se puede usar actualmente o fue desactivado                   |
| **Organización**                 | A qué hospital pertenece                                         |
| **Fecha de creación**            | Cuándo se creó                                                   |
| **Última modificación**          | Última actualización                                             |

**¿Para qué sirve?**  
Define plantillas de turnos reutilizables. En lugar de crear cada turno desde cero, se usa un "tipo" predefinido.

**Ejemplo:**

- Tipo: "Guardia 24h UCI"
- Duración: 1440 minutos (24 horas)
- Clasificación: Mixto
- Mínimo: 2 personas, Ideal: 3, Máximo: 4
- Días descanso: 2 días después de cada guardia

---

## 11. Relación Área-Tipo de Turno

**¿Qué guarda?**  
Qué tipos de turnos se pueden usar en cada área.

### Campos:

| Campo             | ¿Qué significa?                          |
| ----------------- | ---------------------------------------- |
| **Área**          | Área funcional (UCI, Urgencias, etc.)    |
| **Tipo de turno** | Tipo de turno asignado                   |
| **Está activo**   | Si actualmente se puede usar en esa área |

**¿Para qué sirve?**  
No todas las áreas usan todos los tipos de turnos. Por ejemplo:

- UCI puede usar "Guardia 24h"
- Consultas externas NO usa "Guardia 24h", solo usa "Turno Mañana" y "Turno Tarde"

**Ejemplo:**

- UCI → Tiene asignados: Turno Mañana, Turno Tarde, Guardia 24h
- Urgencias → Tiene asignados: Turno Mañana, Turno Noche, Guardia 12h

---

## 12. Turno Programado

**¿Qué guarda?**  
Cada turno específico asignado a una persona en una fecha/hora concreta.

### Campos:

| Campo                   | ¿Qué significa?                                                  |
| ----------------------- | ---------------------------------------------------------------- |
| **Título**              | Título descriptivo del turno (opcional)                          |
| **Hora de inicio**      | Cuándo empieza el turno (fecha y hora programada)                |
| **Hora de fin**         | Cuándo termina el turno (programado)                             |
| **Hora de inicio real** | Cuándo el empleado marcó check-in (llegada real)                 |
| **Hora de fin real**    | Cuándo el empleado marcó check-out (salida real)                 |
| **Estado**              | Programado, En progreso, Completado, Cancelado o No asistió      |
| **Notas**               | Información adicional o instrucciones especiales                 |
| **Usuario**             | A quién se le asignó el turno                                    |
| **Área**                | En qué área se trabaja                                           |
| **Tipo de turno**       | Qué tipo de turno es                                             |
| **Organización**        | A qué hospital pertenece                                         |
| **Contrato**              | Qué contrato laboral aplica para este turno (para calcular pago)                 |
| **Rotativa**              | De qué rotativa se generó este turno (vacío si fue creado manualmente)           |
| **Grupo de rotativa**     | A qué grupo de rotativa pertenece (vacío si fue creado manualmente)              |
| **Modificado manualmente**| Si el turno fue editado después de generarse automáticamente                     |
| **Fecha de creación**     | Cuándo se programó el turno                                                      |
| **Última modificación**   | Última vez que se modificó                                                       |

**¿Para qué sirve?**  
Es el registro concreto de "Juan trabaja en UCI el 15/02/2026 de 8:00 a 20:00".

**Ejemplo:**

- Enfermera María Pérez
- Turno: Guardia Nocturna en UCI
- Programado: 15/02/2026 20:00 → 16/02/2026 08:00
- Check-in real: 15/02/2026 19:55 (llegó 5 min antes)
- Check-out real: 16/02/2026 08:30 (salió 30 min tarde)
- Estado: Completado
- Contrato: "Contrato Enfermería UCI" (para calcular pago automáticamente)
- Pago: $125,000 (calculado según tiempo real trabajado y multiplicadores)

---

## 13. Rotativa de Turno

**Nombre técnico:** `Rotation`

**¿Qué guarda?**
Definición de una rotativa: un patrón cíclico de turnos que se repite automáticamente para grupos de personal.

### Campos:

| Campo                   | ¿Qué significa?                                                              |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Nombre**              | Nombre de la rotativa (ej: "Rotativa UCI Enero")                             |
| **Descripción**         | Información adicional sobre la rotativa                                      |
| **Estado**              | DRAFT (borrador), ACTIVE (activa) o INACTIVE (inactiva)                      |
| **Área**                | En qué área funciona esta rotativa                                           |
| **Organización**        | A qué hospital pertenece                                                     |
| **Fecha de inicio**     | Desde cuándo comienza el ciclo (origen del patrón)                           |
| **Fecha de creación**   | Cuándo se creó la rotativa                                                   |
| **Última modificación** | Última actualización                                                         |

**¿Para qué sirve?**
Automatiza la generación de turnos. En vez de crear cada turno manualmente, se define un patrón y el sistema genera cientos de turnos automáticamente para un rango de fechas.

**Ejemplo:**

- Rotativa: "UCI Guardia Largo-Noche-Libre"
- Patrón: 3 pasos (Turno Largo → Turno Noche → Descanso)
- Área: UCI Adultos
- 4 grupos rotando con desfase de 1 día entre ellos
- Estado: ACTIVE → se pueden generar turnos

---

## 14. Paso de Rotativa

**Nombre técnico:** `RotationStep`

**¿Qué guarda?**
Cada paso individual del patrón cíclico de una rotativa.

### Campos:

| Campo              | ¿Qué significa?                                                     |
| ------------------ | ------------------------------------------------------------------- |
| **Rotativa**       | A qué rotativa pertenece este paso                                  |
| **Orden**          | Posición del paso en el ciclo (0, 1, 2...)                          |
| **Es día de descanso** | Si este paso es un día libre (no se genera turno)               |
| **Tipo de turno**  | Qué tipo de turno aplica (vacío si es día de descanso)              |

**¿Para qué sirve?**
Define la secuencia del patrón. El sistema recorre estos pasos en orden cíclico para saber qué tipo de turno asignar cada día.

**Ejemplo (patrón de 3 pasos):**

1. Paso 0: Turno Largo (12h diurno)
2. Paso 1: Turno Noche (12h nocturno)
3. Paso 2: Descanso (día libre)
4. → Vuelve al paso 0...

---

## 15. Configuración de Turno en Rotativa

**Nombre técnico:** `RotationShiftConfig`

**¿Qué guarda?**
La hora de inicio para cada tipo de turno dentro de una rotativa específica.

### Campos:

| Campo             | ¿Qué significa?                                         |
| ----------------- | ------------------------------------------------------- |
| **Rotativa**      | A qué rotativa pertenece                                |
| **Tipo de turno** | Qué tipo de turno se configura                          |
| **Hora de inicio**| A qué hora comienza el turno (formato HH:MM, ej: "08:00") |

**¿Para qué sirve?**
Permite que la misma rotativa use diferentes horas de inicio para distintos tipos de turno. El sistema combina esta hora con la fecha para generar el turno completo.

**Ejemplo:**

- Turno Largo → inicia a las 08:00
- Turno Noche → inicia a las 20:00

---

## 16. Grupo de Rotativa

**Nombre técnico:** `RotationGroup`

**¿Qué guarda?**
Sub-equipos dentro de una rotativa. Cada grupo rota por el mismo patrón pero con un desfase diferente.

### Campos:

| Campo                  | ¿Qué significa?                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| **Rotativa**           | A qué rotativa pertenece                                                 |
| **Nombre**             | Nombre del grupo (ej: "Grupo A", "Equipo Rojo")                         |
| **Color**              | Color visual para identificar el grupo (hexadecimal)                     |
| **Icono**              | Icono visual del grupo (nombre de icono lucide-react)                    |
| **Desfase del ciclo**  | Cuántos días de desfase tiene este grupo respecto al inicio del patrón   |

**¿Para qué sirve?**
Permite que varios equipos roten por el mismo patrón sin trabajar todos el mismo día. El desfase (offset) asegura que cuando un grupo descansa, otro trabaja.

**Ejemplo (4 grupos, patrón de 3 pasos):**

| Día       | Grupo A (offset 0) | Grupo B (offset 1) | Grupo C (offset 2) |
| --------- | ------------------- | ------------------- | ------------------- |
| Lunes     | Largo               | Descanso            | Noche               |
| Martes    | Noche               | Largo               | Descanso            |
| Miércoles | Descanso            | Noche               | Largo               |

---

## 17. Miembro de Grupo de Rotativa

**Nombre técnico:** `RotationMember`

**¿Qué guarda?**
Qué personas están asignadas a cada grupo de rotativa.

### Campos:

| Campo                | ¿Qué significa?                                                         |
| -------------------- | ----------------------------------------------------------------------- |
| **Grupo de rotativa**| A qué grupo pertenece                                                   |
| **Usuario**          | Qué persona está asignada                                               |
| **Fecha de ingreso** | Cuándo se unió al grupo                                                 |
| **Fecha de salida**  | Cuándo dejó el grupo (vacío si sigue activo)                            |

**¿Para qué sirve?**
Vincula personal a grupos de rotativa. Cuando se generan turnos, el sistema crea un turno por cada miembro activo del grupo para cada día de trabajo del patrón.

**Reglas importantes:**
- Una persona solo puede estar en un grupo de rotativa a la vez (dentro de la misma organización)
- Al remover un miembro, se puede elegir cancelar sus turnos futuros
- Si se re-agrega un miembro que fue removido previamente, se reactiva (no se duplica)

**Ejemplo:**

- Grupo A tiene 3 miembros: María, Juan, Pedro
- Al generar turnos para 30 días, se crean ~20 turnos por persona (10 días de descanso)
- Total generado: ~60 turnos para este grupo

---

## 18. Plantilla de Tarifa

**¿Qué guarda?**  
Plantillas reutilizables que definen cómo se calcula el pago del personal.

### Campos:

| Campo                   | ¿Qué significa?                                                                 |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Nombre**              | Nombre de la plantilla (ej: "Tarifa Enfermería UCI", "Guardia Médica Nocturna") |
| **Descripción**         | Explicación de para qué sirve esta tarifa                                       |
| **Está activa**         | Si se puede usar actualmente                                                    |
| **Organización**        | A qué hospital pertenece                                                        |
| **Fecha de creación**   | Cuándo se creó                                                                  |
| **Última modificación** | Última actualización                                                            |

**¿Para qué sirve?**  
Es un "contenedor" de componentes de tarifa. En lugar de calcular pagos manualmente, se crea una plantilla que define todas las reglas de pago.

**Ejemplo:**

- Plantilla: "Guardia Médica UCI Estándar"
- Contiene:
  - Salario base: $2.000.000/mes
  - Bono nocturno: +$50.000 por turno de noche
  - Bono fin de semana: +$80.000
  - Multiplicador feriado: x2.5

---

## 19. Componente de Tarifa

**¿Qué guarda?**  
Cada parte individual que conforma el cálculo de pago (salario, bonos, multiplicadores).

### Campos:

| Campo                       | ¿Qué significa?                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------ |
| **Plantilla**               | A qué plantilla de tarifa pertenece                                                  |
| **Tipo de componente**      | Qué tipo de pago es (salario base, bono nocturno, horas extra, etc.)                 |
| **Nombre personalizado**    | Nombre específico si es un componente custom                                         |
| **Valor**                   | Monto o porcentaje (ej: 2.000.000 o 1.5)                                             |
| **Unidad**                  | Cómo se aplica (mensual, por hora, por turno, porcentaje, etc.)                      |
| **Condición de aplicación** | Cuándo se aplica (siempre, solo para turnos específicos, solo fines de semana, etc.) |
| **Turnos aplicables**       | A qué tipos de turno aplica (si condición es "SPECIFIC_SHIFT_TYPE")                  |
| **Valor de condición**      | Información adicional de la condición                                                |
| **Descripción**             | Explicación de este componente                                                       |
| **Orden**                   | En qué orden se muestra en la lista                                                  |
| **Fecha de creación**       | Cuándo se creó                                                                       |
| **Última modificación**     | Última actualización                                                                 |

**¿Para qué sirve?**  
Define cada "pieza" del cálculo de pago. Una plantilla puede tener muchos componentes.

**Ejemplo de componentes en una plantilla de "Guardia Médica":**

1. Componente 1:
   - Tipo: Salario base
   - Valor: $3.000.000
   - Unidad: Mensual
   - Condición: Siempre (pago base, independiente de turnos)
2. Componente 2:
   - Tipo: Pago por turno
   - Valor: $120.000
   - Unidad: Por turno
   - Condición: Solo para tipo de turno específico
   - Turnos aplicables: "Guardia Médica 24h"
3. Componente 3:
   - Tipo: Bono fin de semana
   - Valor: $50.000
   - Unidad: Monto fijo
   - Condición: Solo fin de semana

---

## 20. Contrato Laboral

**¿Qué guarda?**  
Asignación de una plantilla de tarifa a una persona específica.

### Campos:

| Campo                           | ¿Qué significa?                                                         |
| ------------------------------- | ----------------------------------------------------------------------- |
| **Usuario**                     | A quién se le asigna el contrato                                        |
| **Organización**                | Qué hospital hace el contrato                                           |
| **Área**                        | En qué área específica trabaja (opcional)                               |
| **Plantilla de tarifa**         | Qué plantilla de tarifa se usa para calcular su pago                    |
| **Multiplicador personalizado** | Ajuste individual (ej: 1.2 para personal senior, 0.8 para practicantes) |
| **Fecha de inicio**             | Desde cuándo aplica el contrato                                         |
| **Fecha de fin**                | Hasta cuándo aplica (si ya terminó)                                     |
| **Está activo**                 | Si actualmente está vigente                                             |
| **Notas**                       | Observaciones adicionales                                               |
| **Fecha de creación**           | Cuándo se creó                                                          |
| **Última modificación**         | Última actualización                                                    |

**¿Para qué sirve?**  
Vincula una persona con su forma de pago. Cuando esa persona trabaja un turno, el sistema sabe qué tarifa aplicar.

**Ejemplo:**

- Enfermera María Pérez
- Plantilla: "Tarifa Enfermería UCI"
- Multiplicador: 1.1 (10% más porque tiene 5 años de experiencia)
- Activo desde: 01/01/2025
- Área: UCI Adultos
- Cuando María trabaja un turno, se usa esta tarifa x1.1 para calcular su pago

---

## 21. Calendario Organizacional

**¿Qué guarda?**  
Días especiales marcados por el hospital (feriados, eventos, días con multiplicadores).

### Campos:

| Campo                   | ¿Qué significa?                                                        |
| ----------------------- | ---------------------------------------------------------------------- |
| **Organización**        | Qué hospital lo define                                                 |
| **Fecha**               | Qué día es especial                                                    |
| **Tipo de día**         | Normal, Fin de semana, Feriado, Feriado irrenunciable, etc.            |
| **Nombre**              | Nombre del día especial (ej: "Fiestas Patrias", "Navidad")             |
| **Descripción**         | Información adicional                                                  |
| **Multiplicador**       | Cuánto se multiplica el pago ese día (ej: 2.5 = se paga 2.5 veces más) |
| **Es recurrente**       | Si se repite todos los años (ej: Navidad cada 25 de diciembre)         |
| **Fecha de creación**   | Cuándo se marcó este día                                               |
| **Última modificación** | Última actualización                                                   |

**¿Para qué sirve?**  
Define qué días se pagan diferente. Los turnos en esos días aplican multiplicadores especiales según la ley.

**Ejemplo:**

- 18 de Septiembre 2026 (Fiestas Patrias)
- Tipo: Feriado irrenunciable
- Multiplicador: 2.5
- Recurrente: Sí (todos los años)
- Si alguien trabaja ese día, su pago se multiplica x2.5

---

## 📊 Catálogos de Opciones

### Roles de Usuario

| Rol              | ¿Qué puede hacer?                                                 |
| ---------------- | ----------------------------------------------------------------- |
| **SUPER_ADMIN**  | Equipo VITA - gestiona todas las organizaciones                   |
| **ADMIN_HR**     | Recursos Humanos del hospital - gestiona personal, áreas, tarifas |
| **CHIEF_AREA**   | Jefe de área - gestiona turnos de su área y su personal           |
| **STAFF** | Personal de salud - ve sus turnos, postula, intercambia           |

### Países Soportados

| Código | País           |
| ------ | -------------- |
| **CL** | Chile          |
| **PE** | Perú           |
| **CO** | Colombia       |
| **AR** | Argentina      |
| **MX** | México         |
| **US** | Estados Unidos |

### Tipos de Documento

| Código         | Documento                                 | País típico   |
| -------------- | ----------------------------------------- | ------------- |
| **RUT**        | Rol Único Tributario                      | Chile         |
| **CC**         | Cédula de Ciudadanía                      | Colombia      |
| **CE**         | Cédula de Extranjería                     | Colombia      |
| **TI**         | Tarjeta de Identidad                      | Colombia      |
| **DNI**        | Documento Nacional de Identidad           | Perú          |
| **DNI_AR**     | DNI Argentino                             | Argentina     |
| **CUIL**       | Código Único de Identificación Laboral    | Argentina     |
| **CUIT**       | Código Único de Identificación Tributaria | Argentina     |
| **CURP**       | Clave Única de Registro de Población      | México        |
| **RFC**        | Registro Federal de Contribuyentes        | México        |
| **PASSPORT**   | Pasaporte                                 | Internacional |
| **CARNET_EXT** | Carnet de Extranjería                     | Varios países |

### Planes de Organización

| Plan           | ¿Para quién?                                               |
| -------------- | ---------------------------------------------------------- |
| **BASIC**      | Clínicas pequeñas (hasta 50 usuarios)                      |
| **PRO**        | Hospitales medianos (hasta 200 usuarios)                   |
| **ENTERPRISE** | Hospitales grandes (usuarios ilimitados + soporte premium) |

### Estados de Organización

| Estado              | ¿Qué significa?                              |
| ------------------- | -------------------------------------------- |
| **ACTIVE**          | Activa y operativa                           |
| **PENDING_PAYMENT** | Tiene pagos atrasados pero sigue funcionando |
| **SUSPENDED**       | Suspendida temporalmente por el equipo VITA  |
| **INACTIVE**        | Desactivada permanentemente                  |

### Monedas Soportadas

| Código  | Moneda               | Formato    |
| ------- | -------------------- | ---------- |
| **CLP** | Peso Chileno         | $1.000.000 |
| **USD** | Dólar Estadounidense | $1,000.00  |
| **COP** | Peso Colombiano      | $1.000.000 |
| **ARS** | Peso Argentino       | $1.000.000 |
| **MXN** | Peso Mexicano        | $1,000.00  |
| **PEN** | Sol Peruano          | S/1,000.00 |
| **EUR** | Euro                 | €1.000,00  |

### Estados de Turno

| Estado          | ¿Qué significa?                              |
| --------------- | -------------------------------------------- |
| **SCHEDULED**   | Programado (aún no comienza)                 |
| **IN_PROGRESS** | En curso (está trabajando ahora)             |
| **COMPLETED**   | Completado (trabajó y asistió)               |
| **CANCELLED**   | Cancelado (no se trabajó)                    |
| **NO_SHOW**     | No asistió (estaba programado pero no llegó) |

### Estados de Invitación

| Estado       | ¿Qué significa?                                |
| ------------ | ---------------------------------------------- |
| **PENDING**  | Pendiente de aceptar/rechazar                  |
| **ACCEPTED** | Aceptada (usuario vinculado a la organización) |
| **REJECTED** | Rechazada por el usuario                       |
| **EXPIRED**  | Expirada por tiempo (no respondió a tiempo)    |

### Clasificación de Turno

| Clasificación | ¿Qué significa?                         |
| ------------- | --------------------------------------- |
| **DAY**       | Diurno (solo de día, 6am-8pm aprox)     |
| **NIGHT**     | Nocturno (solo de noche, 8pm-6am aprox) |
| **MIXED**     | Mixto (abarca día y noche)              |

### Tipos de Día Especial

| Tipo                     | ¿Qué significa?                 | Multiplicador típico |
| ------------------------ | ------------------------------- | -------------------- |
| **NORMAL**               | Día laboral normal              | 1.0x                 |
| **WEEKEND**              | Fin de semana genérico          | 1.3x                 |
| **SATURDAY**             | Sábado específico               | 1.2x                 |
| **SUNDAY**               | Domingo específico              | 1.5x                 |
| **HOLIDAY**              | Feriado legal                   | 2.0x                 |
| **IRRENUNCIABLE**        | Feriado irrenunciable (por ley) | 2.5x o 3.0x          |
| **ORGANIZATION_HOLIDAY** | Feriado interno del hospital    | 1.5x                 |
| **CUSTOM**               | Día especial personalizado      | Variable             |

### Fuentes de Imagen de Perfil

| Fuente       | ¿De dónde viene?                            |
| ------------ | ------------------------------------------- |
| **OAUTH**    | De Google cuando inicia sesión con Google   |
| **UPLOAD**   | Subida por el propio usuario                |
| **GRAVATAR** | De Gravatar (servicio de avatares globales) |

### Proveedores de Email

| Proveedor       | ¿Qué significa?                                      |
| --------------- | ---------------------------------------------------- |
| **GOOGLE**      | Email vinculado con cuenta de Google                 |
| **CREDENTIALS** | Email registrado directamente en VITA con contraseña |
| **GITHUB**      | Email de cuenta GitHub (futuro)                      |
| **FACEBOOK**    | Email de cuenta Facebook (futuro)                    |
| **APPLE**       | Email de cuenta Apple (futuro)                       |

---

## 🔗 Relaciones Entre Tablas

### **Organización ↔ Usuario**

- Una organización puede tener muchos usuarios
- Un usuario pertenece a una organización principal
- Un usuario puede estar **invitado** a varias organizaciones (mediante invitaciones)

### **Usuario ↔ Área**

- Un jefe puede gestionar varias áreas
- Un área puede tener varios jefes

### **Área ↔ Tipo de Turno**

- Un área puede usar varios tipos de turno
- Un tipo de turno puede usarse en varias áreas

### **Usuario ↔ Turno**

- Un usuario puede tener muchos turnos programados
- Cada turno se asigna a un solo usuario

### **Plantilla de Tarifa ↔ Componentes**

- Una plantilla tiene muchos componentes (salario + bonos + multiplicadores)
- Cada componente pertenece a una sola plantilla

### **Usuario ↔ Contrato ↔ Plantilla de Tarifa**

- Un usuario puede tener varios contratos (uno por organización/área)
- Cada contrato usa una plantilla de tarifa
- Una plantilla puede usarse en muchos contratos

### **Rotativa ↔ Área**

- Una rotativa pertenece a un área
- Un área puede tener varias rotativas activas

### **Rotativa ↔ Grupos**

- Una rotativa tiene varios grupos (sub-equipos que rotan con desfase)
- Cada grupo pertenece a una sola rotativa

### **Grupo ↔ Miembros**

- Un grupo tiene varios miembros (personal de salud)
- Un miembro pertenece a un solo grupo
- Un usuario puede ser miembro de múltiples grupos en distintas rotativas

### **Rotativa ↔ Turnos**

- Una rotativa genera muchos turnos programados
- Cada turno generado referencia la rotativa y el grupo que lo originó
- Los turnos generados pueden editarse individualmente (se marcan como "modificado manualmente")

### **Turno ↔ Contrato**

- Un turno está asociado a un contrato específico
- Ese contrato define cómo se calcula el pago del turno

---

## 🔍 Casos de Uso Prácticos

### **Caso 1: Enfermera que trabaja en 2 hospitales**

**Usuario:** María González

- Email: `maria@gmail.com`
- Rol en Hospital A: STAFF
- Rol en Hospital B: STAFF

**Registros:**

- 1 registro en tabla Usuario
- 2 invitaciones aceptadas (Hospital A y Hospital B)
- 2 contratos activos (uno con cada hospital)
- Múltiples turnos (algunos en Hospital A, otros en Hospital B)

**Beneficio:** María ve todos sus turnos en un solo calendario unificado.

---

### **Caso 2: Jefe de UCI que gestiona también Urgencias**

**Usuario:** Dr. Ramírez

- Email: `ramirez@hospital.cl`
- Rol: CHIEF_AREA

**Registros:**

- 1 registro en tabla Usuario
- 2 registros en UserArea (UCI + Urgencias)
- Puede crear turnos en ambas áreas
- Ve solo personal asignado a UCI y Urgencias

---

### **Caso 3: Cálculo de pago de un turno**

**Turno:**

- Fecha: Domingo 25/12/2025 (Navidad)
- Horario: 22:00 a 06:00 (nocturno)
- Usuario: Enfermera Sandra
- Área: UCI

**Cálculo:**

1. Se busca el contrato activo de Sandra en UCI
2. Se obtiene su plantilla de tarifa
3. Se aplican componentes relevantes:
   - Salario base proporcional: $40.000 (por 8 horas)
   - Bono nocturno: +$30.000 (condición: solo noche → SÍ aplica)
   - Bono domingo: +$20.000 (condición: solo domingos → SÍ aplica)
   - Multiplicador Navidad: x2.5 (condición: solo feriados → SÍ aplica)
4. **Cálculo final:** ($40.000 + $30.000 + $20.000) × 2.5 = **$225.000**

---

## 22. Vinculación Componente-Tipo de Turno

**Nombre técnico:** `RateComponentApplicableType`

**¿Para qué sirve?**  
Vincula componentes de pago a tipos de turno específicos. Permite que un componente solo se pague cuando trabajas un tipo de turno en particular.

**Ejemplo práctico:**  
"El bono de $40,000 solo se paga si trabajas una 'Guardia Larga (12h)', no se paga en otros turnos."

### **Campos:**

| Campo             | ¿Qué es?                   |
| ----------------- | -------------------------- |
| `rateComponentId` | Qué componente de pago     |
| `shiftTypeId`     | A qué tipo de turno aplica |

**Relaciones:**

- **Pertenece a:** Un componente de tarifa (RateComponent)
- **Pertenece a:** Un tipo de turno (ShiftType)

---

## 23. Pago de Turno

**Nombre técnico:** `ShiftPayment`

**¿Para qué sirve?**  
Registra el cálculo automático del pago de cada turno trabajado. Cuando un empleado hace check-out, el sistema calcula cuánto debe cobrar basado en sus componentes de tarifa, tiempo trabajado, y multiplicadores del calendario.

**Ejemplo práctico:**  
"Juan trabajó una Guardia Larga el 25 de diciembre (Navidad). El sistema calculó: $50,000 (pago base) × 2.5 (multiplicador Navidad) = $125,000."

### **Campos:**

| Campo                 | ¿Qué es?                                                        |
| --------------------- | --------------------------------------------------------------- |
| `id`                  | Identificador único del pago                                    |
| `shiftId`             | A qué turno corresponde                                         |
| `totalAmount`         | Suma de componentes (sin multiplicador)                         |
| `baseAmount`          | Monto base antes de multiplicadores                             |
| `calendarMultiplier`  | Multiplicador del día (ej: 2.5x en Navidad)                     |
| `finalAmount`         | Pago final = totalAmount × calendarMultiplier                   |
| `minutesWorked`       | Minutos realmente trabajados                                    |
| `isPartialCompletion` | Si trabajó menos de lo programado                               |
| `status`              | Estado del pago (PENDING, CALCULATED, APPROVED, PAID, DISPUTED) |
| `calculatedAt`        | Cuándo se calculó automáticamente                               |
| `approvedAt`          | Cuándo aprobó RRHH el pago                                      |
| `approvedBy`          | Quién aprobó el pago                                            |
| `paidAt`              | Cuándo se efectuó el pago real                                  |
| `notes`               | Observaciones sobre el pago                                     |
| `createdAt`           | Fecha de creación                                               |
| `updatedAt`           | Última actualización                                            |

**Relaciones:**

- **Pertenece a:** Un turno (Shift) - relación 1:1
- **Tiene muchos:** Desgloses de pago (ShiftPaymentBreakdown)

**Estados del Pago:**

- `PENDING`: Turno completado, pendiente de cálculo
- `CALCULATED`: Sistema calculó el pago automáticamente
- `APPROVED`: RRHH aprobó el pago
- `PAID`: Pago efectuado al empleado
- `DISPUTED`: Pago en disputa, requiere revisión

---

## 24. Desglose de Pago

**Nombre técnico:** `ShiftPaymentBreakdown`

**¿Para qué sirve?**  
Muestra el detalle de cada componente que sumó al pago total del turno. Permite transparencia total: el empleado puede ver exactamente por qué le están pagando X cantidad.

**Ejemplo práctico:**

```
Turno 25-Dic Guardia Larga:
  • Pago base por turno: $50,000
  • Bono por 25 min extra: $12,500
  • Bono fin de año: $20,000
  ───────────────────────────
  Total base: $82,500
  × Multiplicador Navidad (2.5x)
  ═══════════════════════════
  TOTAL FINAL: $206,250
```

### **Campos:**

| Campo             | ¿Qué es?                                        |
| ----------------- | ----------------------------------------------- |
| `id`              | Identificador único del desglose                |
| `shiftPaymentId`  | A qué pago de turno pertenece                   |
| `componentId`     | Qué componente de tarifa se aplicó              |
| `componentName`   | Nombre del componente (guardado para historial) |
| `componentType`   | Tipo (BASE_SALARY, PER_SHIFT, etc.)             |
| `baseValue`       | Valor base ($/min, $/turno, etc.)               |
| `calculatedValue` | Valor final calculado                           |
| `appliedMinutes`  | Minutos aplicados (para componentes por tiempo) |
| `notes`           | Notas adicionales                               |
| `createdAt`       | Fecha de creación                               |

**Relaciones:**

- **Pertenece a:** Un pago de turno (ShiftPayment)
- **Referencia a:** Un componente de tarifa (RateComponent)

---

## 🔒 Seguridad y Privacidad

### **Datos sensibles protegidos:**

- ✅ Contraseñas encriptadas (nunca se guardan en texto plano)
- ✅ Documentos de identidad únicos por organización (no se comparten entre hospitales)
- ✅ Fotos de perfil almacenadas de forma segura (solo el usuario puede modificarlas)
- ✅ Información laboral aislada por organización (Hospital A no ve datos de Hospital B)

### **Datos que SÍ se comparten:**

- ⚠️ Nombre y email (necesarios para vincular usuarios entre organizaciones)
- ⚠️ Código de vinculación (para invitar personal a organizaciones)

### **Eliminación en cascada:**

- Si se elimina una organización → se eliminan todas sus áreas, turnos, contratos
- Si se elimina un usuario → se eliminan sus turnos, contratos, historial
- Si se elimina un área → sus turnos quedan sin área (no se eliminan)

---

## 📝 Resumen Ejecutivo

**¿Cuántas tablas hay?** 24 tablas principales

**¿Qué información se guarda?**

- 👥 **Personal y usuarios:** Datos personales, documentos, emails, fotos
- 🏥 **Organizaciones:** Hospitales, clínicas, límites contratados
- 📍 **Áreas:** Departamentos dentro de hospitales
- ⏰ **Turnos:** Horarios programados y trabajados
- 🔄 **Rotativas:** Patrones cíclicos de turnos, grupos rotativos, generación automática
- 💰 **Tarifas:** Plantillas de pago completamente flexibles
- 📄 **Contratos:** Asignaciones de tarifas a personal
- 📅 **Calendario:** Días especiales con multiplicadores
- 📨 **Invitaciones:** Vinculación de personal a organizaciones
- 🔐 **Seguridad:** Sesiones, métodos de acceso, verificaciones

**¿Qué NO se guarda (aún)?**

- ❌ Pagos realizados por organizaciones a VITA
- ❌ Historial de facturación de clientes
- ❌ Mensajes entre usuarios
- ❌ Solicitudes de intercambio de turnos
- ❌ Postulaciones a turnos abiertos

---

**Documento creado para:** Gerentes, administradores de hospitales, auditores, personal de cumplimiento
**Última actualización:** Febrero 2026
**Versión del sistema:** 4.1.0 (Rotativas de Turno)
