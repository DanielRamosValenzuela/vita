# 🏥 VITA - Plan Maestro de Desarrollo

**Sistema de Gestión de Turnos Médicos Multi-Tenant SaaS B2B**

**Última actualización:** 18 de diciembre de 2025

**Versión:** 3.2.0

**Estado:** FASE 2 completada - Setup Técnico 95% completado (pendiente testing)

**Competidor Principal:** Rflex (análisis competitivo en sección de Negocio)

---

## 🎉 PROGRESO RECIENTE (Diciembre 2025)

### ✅ FASE 2: Setup Técnico (95% completado - pendiente testing)

**Completado:**
- ✅ Prisma + Supabase configurado y funcionando
- ✅ Schema de BD diseñado con multi-country support (docNumber, docType)
- ✅ ESLint + Prettier configurado (no muy estricto)
- ✅ NextAuth v4 instalado y configurado
- ✅ Estructura de carpetas organizada (`lib/`, `types/`)
- ✅ Dark mode implementado con next-themes (funcionando)
- ✅ **next-intl implementado según documentación oficial** (español e inglés, routing completo)
- ✅ Landing page con Hero Section, Navbar y Footer
- ✅ Componentes organizados con Atomic Design (atoms, molecules, templates)
- ✅ Tema "Healthcare Modern" implementado (colores médicos)
- ✅ Estructura de rutas implementada: `(global)` para páginas públicas, rutas normales para dashboards (`admin/`, `hr/`, `chief/`, `staff/`)
- ✅ **Limpieza de código:** Eliminados archivos redundantes (`lib/providers/theme-provider.tsx`, `i18n/request-config.ts`, `ROUTES_STRUCTURE.md`, SVGs no usados)
- ✅ **Configuración i18n optimizada:** Implementación según [next-intl docs](https://next-intl.dev/docs/routing/setup)

**Completado (adicional):**
- ✅ Página de onboarding implementada (`/onboarding`)
- ✅ Middleware mejorado con redirección a onboarding
- ✅ Checklist de testing creado (`TESTING_CHECKLIST.md`)

**En progreso:**
- 🔄 Google OAuth (configurado, funcionando en desarrollo - verificar en testing)

**Pendiente:**
- ⏸️ TODO 2.5: Probar app completa usando `TESTING_CHECKLIST.md`

---

## 📖 ÍNDICE

1. [¿Qué es VITA?](#qué-es-vita)
2. [Modelo de Negocio](#modelo-de-negocio)
3. [Análisis Competitivo](#análisis-competitivo)
4. [Casos de Uso](#casos-de-uso)
5. [Sistema de Roles](#sistema-de-roles)
6. [Mapas de Procesos](#mapas-de-procesos)
7. [Stack Tecnológico](#stack-tecnológico)
8. [Arquitectura de Datos](#arquitectura-de-datos)
9. [Arquitectura de Carpetas](#arquitectura-de-carpetas)
10. [Guías de Desarrollo](#guías-de-desarrollo)
11. [Plan de Desarrollo por Fases](#plan-de-desarrollo-por-fases)
12. [Diseño y UX](#diseño-y-ux)
13. [Preparación para Capacitor](#preparación-para-capacitor-mvp2)
14. [Decisiones Técnicas](#decisiones-técnicas)
15. [Comandos Útiles](#comandos-útiles)

---

## 🎯 ¿QUÉ ES VITA?

**VITA** es una plataforma SaaS B2B multi-tenant para la gestión integral de turnos médicos en hospitales y clínicas de Chile.

### Problema que Resuelve

**Situación Actual:**

- [ ] Hospitales gestionan turnos en Excel o sistemas legacy
- Falta de visibilidad del personal sobre sus horarios
- [ ] Dificultad para calcular pagos (día/noche, feriados, extras)
- Sistemas biométricos fallan y generan conflictos
- [ ] Personal trabaja en múltiples instituciones sin coordinación
- Intercambios de turnos son manuales y lentos

**Solución VITA:**

- [ ] Calendario digital centralizado para personal y jefes
- Cálculo automático de tarifas según horas trabajadas
- [ ] Validaciones legales (Código del Trabajo de Chile)
- Sistema de vinculación transparente (personal trabaja en múltiples hospitales)
- [ ] Aprobación digital de intercambios de turnos
- Acreditación de asistencia manual + integración biométrica futura
- [ ] App móvil para el personal de salud

---

## 💰 MODELO DE NEGOCIO

### SaaS Multi-Tenant B2B

**Target Principal:** Hospitales y clínicas en Chile

**Cómo Funciona:**

1. **Venta B2B:** Vendemos directamente a hospitales/clínicas, no a usuarios individuales
2. **Cobro Mensual:** Facturación manual según usuarios activos de cada organización
3. **Implementación:** Onboarding asistido + capacitación + soporte
4. **Pricing Flexible:** Cada hospital negocia según sus necesidades específicas

### Modelo de Pricing (B2B Negociado)

**IMPORTANTE:** No hay planes fijos. Cada hospital tiene pricing personalizado.

**Calculadora de Precios (Referencia Pública):**

```
Costo Base: $200 USD/mes
(Incluye: Plataforma + 5 cuentas ADMIN_HR gratis)

+ Personal de Salud (STAFF_HEALTH): $15 USD/mes por persona
+ Jefes de Área (CHIEF_AREA): $40 USD/mes por jefe
```

**Ejemplos de Pricing:**

| Organización         | Staff | Chiefs | HR         | Cálculo                     | Total/Mes      |
| -------------------- | ----- | ------ | ---------- | --------------------------- | -------------- |
| **Clínica Pequeña**  | 30    | 3      | 5 (gratis) | $200 + (30×$15) + (3×$40)   | **$770 USD**   |
| **Hospital Mediano** | 80    | 10     | 5 (gratis) | $200 + (80×$15) + (10×$40)  | **$1,800 USD** |
| **Hospital Grande**  | 200   | 25     | 5 (gratis) | $200 + (200×$15) + (25×$40) | **$4,200 USD** |

**Descuentos por Volumen (Negociables):**

- 100+ cuentas: 10% descuento
- 200+ cuentas: 15% descuento
- Contrato anual: 20% descuento adicional

**Cuentas GRATUITAS:**

- `ADMIN_HR` (Recursos Humanos): **5 cuentas gratis** por organización
- `SUPER_ADMIN` (Equipo VITA): Ilimitadas y gratis

### Pool de Cuentas

**Cómo Funciona:**

1. Hospital contrata X cantidad de cuentas (ej: 50 staff + 8 chiefs)
2. `ADMIN_HR` distribuye límites de vinculación entre jefes
3. Cada `CHIEF_AREA` puede vincular hasta su límite asignado
4. La organización paga por cuentas **activas y vinculadas**

**Ejemplo Práctico:**

```
Hospital Clínico Santiago:
- Contrata: 80 staff + 12 chiefs
- Paga: $200 (base) + $1,200 (staff) + $480 (chiefs) = $1,880 USD/mes

Distribución de límites:
├─ Jefe Enfermería UCI: 25 staff máx
├─ Jefe Médicos Urgencia: 20 staff máx
├─ Jefe Kinesiología: 15 staff máx
├─ Jefe Nutrición: 10 staff máx
└─ Jefe Técnicos Enfermería: 10 staff máx

Recursos Humanos: 5 cuentas (no se cobran)
```

**Facturación:**

- Manual por parte de SUPER_ADMIN
- Registro de pagos en el sistema
- Si no pagan: Alerta en dashboard (NO se suspende automáticamente)
- SUPER_ADMIN decide suspensión manual con razón obligatoria

---

## 🎯 ANÁLISIS COMPETITIVO

### Competidor Principal: Rflex

**Fuente:** https://rflex.io/ (análisis web Nov 2025)

**Estado del Mercado:**

- 🏥 +100 instituciones en Latinoamérica
- 🌎 Presencia: Chile, Perú, Colombia
- 💼 Clientes grandes confirmados:
  - RedSalud Vitacura, Clínica Alemana
  - Bupa, UC Christus, FALP
  - Integramédica, Ciudad del Mar

**Features Confirmados de Rflex:**

| Categoría       | Features                                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| **Gestión**     | Turnos y jornadas, ofertador de turnos, cambio de turnos                            |
| **Asistencia**  | Web, app móvil+GPS, app offline, biometría (integración), tarjeta/pin (integración) |
| **Cálculo**     | Remuneraciones automáticas con reglas de negocio                                    |
| **Validación**  | Pre-liquidación validada por colaboradores                                          |
| **Mobile**      | ✅ App móvil (iOS + Android)                                                        |
| **Integración** | API para cualquier sistema, portabilidad de asistencia                              |

**Resultados según Testimonios:**

- "95% reducción de reprocesos" (RedSalud)
- "De 5 días a 1 día de tareo" (Inmater)
- "Disminución considerable de costos"

**⚠️ INSIGHT CLAVE - Sistema de Asistencia:**

Rflex **NO es dueño** de los sistemas biométricos:

- 👤 Biometría facial y huella = **integración con hardware de terceros**
- 🔢 Tarjeta/Pin = **integración con sistemas existentes del hospital**
- 💰 Hardware biométrico = Costo adicional (~$500-2000 USD por dispositivo)

**🎯 OPORTUNIDAD PARA VITA:**

Rflex depende de hardware caro. VITA puede ofrecer alternativas propias:

- ✅ GPS check-in (app detecta ubicación)
- ✅ QR code scanning
- ✅ Web check-in dedicado
- ✅ Sin hardware adicional = Más económico

**Áreas de Oportunidad para VITA:**

1. **Cobertura Parcial:**
   - Rflex NO está en todas las áreas de los hospitales
   - Kinesiología y Nutrición siguen usando Excel/papel
   - **Estrategia VITA:** Entrar por áreas sin cobertura

2. **Dependencia de Hardware:**
   - Rflex requiere hardware biométrico de terceros (caro)
   - **Ventaja VITA:** Check-in por GPS/QR (MVP3) sin hardware

3. **UX/UI:**
   - ⚠️ Pendiente: Análisis de usabilidad de Rflex
   - **Ventaja VITA:** UI moderna con Next.js 16 + Tailwind v4

4. **Validaciones Legales:**
   - ⚠️ Pendiente: Verificar si Rflex tiene validaciones automáticas
   - **Ventaja VITA:** Validaciones en tiempo real del Código del Trabajo

5. **Flexibilidad de Asistencia:**
   - Rflex ofrece múltiples opciones, pero todas requieren integración o hardware
   - **Ventaja VITA:** Solución integral (software + método de marcaje nativo)

### Propuesta de Valor VITA vs. Rflex

**Para Hospitales que YA usan Rflex:**

```
"VITA complementa Rflex sin reemplazarlo.
Implementamos en áreas donde Rflex no está,
sin romper lo que ya funciona."
```

**Para Hospitales SIN Sistema:**

```
"¿Siguen usando Excel y libros de asistencia?
VITA digitaliza en 1 semana.
Piloto gratis en 1 área, expandes cuando estés listo."
```

### Estrategia Go-to-Market

**Fase 1: Piloto (Mes 1-2)**

- Hospital del director (contacto existente)
- Área: Kinesiología (NO usa Rflex)
- Objetivo: 100% adopción + testimonial
- Costo: $0 (piloto gratis)

**Fase 2: Caso de Estudio (Mes 3)**

- Video testimonial del jefe de Kinesiología
- Métricas: Horas ahorradas, errores reducidos
- "Cómo el Hospital X mejoró gestión de turnos con VITA"

**Fase 3: Expansión Horizontal (Mes 4-6)**

- Mismo hospital, otras áreas sin Rflex
- Nutrición, Técnicos, etc.
- Primera facturación real

**Fase 4: Expansión a Otros Hospitales (Mes 7+)**

- Usar caso de estudio como referencia
- "Si funciona en Hospital X, puede funcionar en el tuyo"
- Target: 3-5 hospitales en primer año

### Tabla Comparativa (Landing Page)

| Feature                    | Rflex                                      | VITA                                    |
| -------------------------- | ------------------------------------------ | --------------------------------------- |
| **Gestión de Turnos**      | ✅ Completo                                | ✅ Completo                             |
| **Ofertador de Turnos**    | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| **Cambio de Turnos**       | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| **App Móvil**              | ✅ iOS + Android                           | ✅ iOS + Android (MVP2 Capacitor)       |
| **Calendario Visual**      | ⚠️ A validar UI                            | ✅ react-big-calendar moderno           |
| **Validaciones Legales**   | ⚠️ A validar                               | ✅ Automáticas en tiempo real           |
| **UI Moderna**             | ⚠️ A validar                               | ✅ Next.js 16 + Tailwind v4 + Dark mode |
| **Sistema de Asistencia:** |                                            |                                         |
| - Web                      | ✅ Sí                                      | ✅ Sí (MVP1: manual, MVP2: automático)  |
| - App móvil + GPS          | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| - App offline              | ✅ Sí                                      | ✅ Sí (Capacitor MVP2)                  |
| - Biometría                | ✅ **Integración** (requiere hardware $$$) | ✅ Webhook API (MVP2)                   |
| - Tarjeta/Pin              | ✅ **Integración** (requiere hardware)     | ✅ Pin propio en app/web (MVP2)         |
| - **GPS check-in nativo**  | ❌ No                                      | ✅ **DIFERENCIADOR** (MVP3)             |
| - **QR code check-in**     | ❌ No confirmado                           | ✅ **DIFERENCIADOR** (MVP3)             |
| **Costo Hardware**         | ⚠️ Biometría = $500-2000 USD/dispositivo   | ✅ **$0** (métodos nativos)             |
| **Integración API**        | ✅ Sí                                      | ✅ Sí (MVP2)                            |
| **Pre-liquidación**        | ✅ Validación colaboradores                | ✅ Validación colaboradores             |
| **Precio Base**            | ⚠️ A investigar                            | Desde $200/mes (sin hardware)           |
| **Expansión LATAM**        | ✅ Chile, Perú, Colombia                   | 🎯 Objetivo MVP2                        |

**✅ Confirmado** | **⚠️ A validar** | **❌ No tiene**

**DIFERENCIADORES CLAVE DE VITA:**

1. 🎯 **GPS Check-in Nativo (MVP3):** Sin hardware, más económico
2. 🎯 **QR Code Scanning (MVP3):** Flexibilidad sin inversión
3. 🎯 **Solución Integral:** Software + métodos de marcaje incluidos
4. 🎯 **Sin Hardware Costoso:** Todo por software

### Preguntas de Investigación Pendientes

**✅ CONFIRMADO (vía web rflex.io):**

1. ✅ App móvil: Sí, iOS + Android
2. ✅ Métodos de marcaje: Web, app+GPS, offline, biometría (integración), tarjeta/pin (integración)
3. ✅ Clientes: +100 instituciones, clientes grandes confirmados
4. ✅ Ofertador y cambio de turnos: Sí
5. ✅ Pre-liquidación con validación: Sí

**🔍 ALTA PRIORIDAD - Investigar ANTES de MVP1:**

1. **Pricing:**
   - ¿Cuánto cobra Rflex mensualmente por usuario?
   - ¿Costos de setup/implementación?
   - ¿Costo de módulos adicionales (biometría, API)?
   - ¿Costo de hardware biométrico?

2. **UX/UI:**
   - ¿Cómo es el calendario visual? (screenshot si es posible)
   - ¿Es intuitivo o complejo de usar?
   - ¿Cómo es la app móvil? (rating en stores)

3. **Pain Points:**
   - ¿Qué 3 cosas odian más los usuarios de Rflex?
   - ¿Qué features faltan o son confusos?
   - ¿Problemas de rendimiento o bugs conocidos?

4. **Adopción:**
   - ¿Por qué Kinesiología y Nutrición NO usan Rflex en el hospital del director?
   - ¿Qué áreas del hospital NO tienen Rflex implementado?
   - ¿Barreras de adopción?

5. **Validaciones Legales:**
   - ¿Rflex tiene validaciones automáticas del Código del Trabajo?
   - ¿Alerta de horas extra excedidas?
   - ¿Control de descansos obligatorios?

6. **Proceso Comercial:**
   - ¿Qué proceso de venta/implementación tiene Rflex?
   - ¿Cuánto demora la implementación?
   - ¿Requiere capacitación presencial?

**📋 TAREAS INMEDIATAS (FASE 0):**

- [ ] **Entrevistar a novia (usuaria Rflex)**
  - Guion de preguntas: Pain points, UI/UX, features faltantes
  - Solicitar screenshots si es posible
  - ¿Por qué algunas áreas no lo usan?

- [ ] **Entrevistar a jefe de Kinesiología**
  - ¿Por qué no usan Rflex?
  - ¿Qué necesitan que Rflex no ofrece?
  - ¿Cuánto paga el hospital por Rflex?

- [ ] **Investigar precios**
  - Contactar comercial de Rflex (como posible cliente)
  - Solicitar cotización de ejemplo
  - Comparar con pricing de VITA

- [ ] **Documentar findings**
  - Actualizar tabla comparativa con datos reales
  - Ajustar propuesta de valor de VITA
  - Definir diferenciadores claros

---

## 👥 SISTEMA DE ROLES

### Jerarquía y Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│ SUPER_ADMIN (Equipo VITA - Ilimitado)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • Crear/editar/suspender organizaciones                 │ │
│ │ • Registrar pagos manualmente                           │ │
│ │ • Ver analytics globales                                │ │
│ │ • Gestionar suspensiones por falta de pago             │ │
│ │ • Soporte técnico                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │
           │ Gestiona
           ▼
┌─────────────────────────────────────────────────────────────┐
│ ORGANIZACIÓN (Hospital/Clínica)                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ADMIN_HR (Recursos Humanos - 5 gratis)            │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ • Crear áreas (Enfermería, Médicos, etc.)     │ │    │
│  │ │ • Crear tipos de turno globales               │ │    │
│  │ │ • Asignar pool de cuentas a cada jefe         │ │    │
│  │ │ • Configurar tarifas por persona              │ │    │
│  │ │ • Ver reportes de toda la organización        │ │    │
│  │ │ • MVP2: Generar liquidaciones                 │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           │ Asigna límites                                  │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ CHIEF_AREA (Jefe de Área - SE COBRA)              │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ • Vincular personal (con aprobación)          │ │    │
│  │ │ • Crear tipos de turno específicos            │ │    │
│  │ │ • Asignar turnos manualmente                  │ │    │
│  │ │ • Crear turnos abiertos                       │ │    │
│  │ │ • Aprobar/rechazar intercambios               │ │    │
│  │ │ • Aprobar/rechazar postulaciones              │ │    │
│  │ │ • Acreditar asistencia manualmente (MVP1)     │ │    │
│  │ │ • Override validaciones legales               │ │    │
│  │ │ • Ver calendario de su equipo                 │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           │ Gestiona                                        │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ STAFF_HEALTH (Personal - SE COBRA)                 │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ Roles: Doctor, Enfermero, Técnico, etc.       │ │    │
│  │ │                                                │ │    │
│  │ │ • Ver calendario unificado (multi-org)        │ │    │
│  │ │ • Aprobar/rechazar vinculaciones              │ │    │
│  │ │ • Postular a turnos abiertos                  │ │    │
│  │ │ • Solicitar intercambios                      │ │    │
│  │ │ • Recibir notificaciones                      │ │    │
│  │ │ • Alertas de conflictos de horarios           │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Detalles por Rol

#### SUPER_ADMIN

**Scope:** Global (todas las organizaciones)

**Funcionalidades:**

- [ ] Dashboard con métricas: organizaciones activas, ingresos, usuarios totales
- CRUD de organizaciones
- [ ] Registro manual de pagos
- Suspensión/reactivación de organizaciones (con razón obligatoria)
- [ ] Historial de pagos y eventos de cada organización

**NO puede:**

- [ ] Ver datos internos de turnos de una organización (privacidad)
- Crear usuarios dentro de organizaciones

---

#### ADMIN_HR (Recursos Humanos)

**Scope:** Una organización específica

**Funcionalidades:**

- [ ] **Áreas:** Crear áreas (Enfermería UCI, Médicos Urgencia, etc.)
- **Tipos de Turno:** Crear tipos globales disponibles para todos los jefes
- [ ] **Pool de Cuentas:** Asignar límites a cada `CHIEF_AREA` (ej: Jefe Enfermería puede vincular 20 personas)
- **Tarifas:** Configurar tarifa por persona (día/noche, bonos, multiplicadores)
- [ ] **Reportes:** Ver resumen de turnos y horas trabajadas (MVP2: liquidaciones PDF)

**Ejemplo de Tarifa:**

```typescript
{
  userId: "staff-123",
  dayHourlyRate: 8000,        // CLP por hora de día
  nightHourlyRate: 10000,     // CLP por hora de noche
  weekendMultiplier: 1.5,     // x1.5 fin de semana
  holidayMultiplier: 2.0,     // x2 feriado normal
  mandatoryHolidayMultiplier: 2.5,  // x2.5 feriado irrenunciable
  extraBonus: 50000,          // Bono fijo por turno extra
  validFrom: "2024-01-01",
  validUntil: "2024-12-31"
}
```

**NO puede:**

- [ ] Asignar turnos directamente
- Ver calendario detallado del personal (eso es del jefe)

---

#### CHIEF_AREA (Jefe de Área)

**Scope:** Su área específica (ej: Enfermería UCI)

**Funcionalidades Principales:**

**1. Vinculación de Personal:**

- [ ] Ingresa código de vinculación del personal
- Sistema envía notificación al personal
- [ ] Personal aprueba → Se agrega al equipo
- Puede desvincular fácilmente

**2. Tipos de Turno:**

- [ ] Usa tipos globales (creados por HR)
- Crea tipos específicos para su área
- [ ] Configura: nombre, duración, clasificación (día/noche), color, mín/máx personal

**3. Asignación de Turnos:**

- [ ] **Manual:** Arrastra y asigna a persona específica
- **Abierto:** Crea turno sin asignar, personal postula, jefe elige
- [ ] Calendario mensual/semanal de su equipo

**4. Aprobaciones:**

- [ ] Intercambios entre personal
- Postulaciones a turnos abiertos
- [ ] Override de validaciones legales (con justificación)

**5. Asistencia (MVP1):**

- [ ] Acreditar manualmente que personal llegó
- Sistema alerta si no hay check-in 30 min después

**NO puede:**

- [ ] Ver turnos de otras áreas
- Modificar tarifas
- [ ] Crear cuentas de otros jefes

---

#### STAFF_HEALTH (Personal de Salud)

**Scope:** Multi-organización (puede trabajar en varios hospitales)

**Características Únicas:**

- [ ] **Código de Vinculación:** Al crear cuenta obtiene código único (ej: `PERS-2024-001234`)
- **Calendario Unificado:** Ve turnos de TODAS las organizaciones donde trabaja
- [ ] **Alertas de Conflicto:** Si tiene turnos superpuestos en distintos hospitales

**Funcionalidades:**

**1. Vinculaciones:**

- [ ] Recibe solicitud de vinculación
- Ve: Hospital, Área, Jefe que solicita
- [ ] Aprueba o rechaza

**2. Turnos:**

- [ ] Ve calendario mensual con todos sus turnos
- Filtra por organización
- [ ] Badges: `Largo Día`, `Noche`, `Extra`, `Feriado`

**3. Postulaciones:**

- [ ] Ve turnos abiertos de sus áreas
- Postula con mensaje opcional
- [ ] Recibe notificación si es seleccionado

**4. Intercambios:**

- [ ] Solicita intercambio a compañero
- Compañero acepta → Jefe aprueba
- [ ] Ambos reciben notificaciones

**5. Notificaciones:**

- [ ] Turno asignado
- Turno intercambiado
- [ ] Recordatorio 24h antes
- Confirmación de asistencia

**NO puede:**

- [ ] Ver turnos de otros compañeros (solo los suyos)
- Modificar turnos asignados (solo intercambiar)

---

## 📊 CASOS DE USO

### Caso 1: Hospital Contrata VITA

**Actores:** SUPER_ADMIN, Hospital

**Flujo:**

1. Hospital contacta a VITA
2. SUPER_ADMIN crea organización: "Hospital Central"
3. Hospital elige plan: PRO (200 cuentas)
4. SUPER_ADMIN registra primer pago
5. Hospital recibe credenciales de 1 cuenta `ADMIN_HR` inicial

**Resultado:** Hospital tiene acceso al dashboard

---

### Caso 2: Recursos Humanos Configura el Sistema

**Actores:** ADMIN_HR

**Flujo:**

1. ADMIN_HR ingresa al dashboard
2. Crea áreas:
   - Enfermería UCI (necesita 25 personas)
   - Médicos Urgencia (necesita 15 personas)
   - Kinesiología (necesita 10 personas)
3. Crea tipos de turno globales:
   - `Largo Día`: 12 horas, día
   - `Noche`: 8 horas, noche
   - `Extra`: 6 horas, día
4. Crea cuentas de jefes:
   - Jefe Enfermería UCI → Asigna 25 cuentas
   - Jefe Médicos Urgencia → Asigna 15 cuentas
   - Jefe Kinesiología → Asigna 10 cuentas
5. Configura tarifas de cada persona (lo hace después de vincular)

**Resultado:** Sistema listo para que jefes vinculen personal

---

### Caso 3: Jefe Vincula Personal

**Actores:** CHIEF_AREA, STAFF_HEALTH

**Flujo:**

1. Personal (ej: Enfermera María) crea cuenta en VITA
2. Sistema genera código: `PERS-2024-001234`
3. María da código a su jefe
4. Jefe ingresa código en "Vincular Personal"
5. Sistema muestra: "María González - Enfermera - RUT 12.345.678-9"
6. Jefe confirma vinculación
7. María recibe notificación: "Jefe Juan Pérez te invitó a Enfermería UCI - Hospital Central"
8. María aprueba
9. María aparece en lista de personal del jefe

**Resultado:** María puede ser asignada a turnos

---

### Caso 4: Jefe Asigna Turno Manual

**Actores:** CHIEF_AREA, STAFF_HEALTH

**Flujo:**

1. Jefe abre calendario mensual
2. Hace clic en día 15 de diciembre
3. Selecciona tipo: `Largo Día` (12 horas)
4. Selecciona horario: 08:00 - 20:00
5. Busca personal: "María González"
6. Sistema valida:
   - ✅ María no tiene otro turno ese día
   - ✅ María no excede 48 horas semanales
   - ✅ María tiene 12 horas de descanso desde último turno
7. Jefe confirma
8. María recibe notificación: "Turno asignado: 15 dic - Largo Día 08:00-20:00"

**Resultado:** Turno en calendario de María y del jefe

---

### Caso 5: Jefe Crea Turno Abierto

**Actores:** CHIEF_AREA, STAFF_HEALTH (varios)

**Flujo:**

1. Jefe necesita cubrir turno extra 20 de diciembre
2. Crea turno abierto: `Extra` - 14:00-20:00
3. Todo el equipo recibe notificación: "Turno disponible para postular"
4. María postula: "Puedo hacerlo, necesito horas extras"
5. Pedro postula: "Disponible"
6. Jefe ve lista de postulaciones
7. Jefe selecciona a María
8. María recibe: "Fuiste seleccionada para turno 20 dic"
9. Pedro recibe: "Turno fue asignado a otro compañero"

**Resultado:** Turno cubierto con personal motivado

---

### Caso 6: Personal Solicita Intercambio

**Actores:** STAFF_HEALTH (2), CHIEF_AREA

**Flujo:**

1. María tiene turno 25 dic pero necesita el día libre
2. María abre app → "Solicitar intercambio"
3. Selecciona turno: 25 dic - Largo Día
4. Ve lista de compañeros con turnos compatibles
5. Selecciona a Pedro (tiene turno 28 dic)
6. Pedro recibe notificación: "María quiere intercambiar 25 dic por tu 28 dic"
7. Pedro acepta
8. Jefe recibe solicitud pendiente
9. Jefe revisa y aprueba
10. Ambos reciben confirmación

**Resultado:** Turnos intercambiados, todos felices

---

### Caso 7: Validación Legal Activada

**Actores:** CHIEF_AREA

**Flujo:**

1. Jefe intenta asignar turno a María
2. María ya trabajó: Lun 12h, Mar 12h, Mié 12h, Jue 12h = 48 horas
3. Jefe intenta asignar Vie 12h
4. Sistema alerta: "❌ Excede 48 horas semanales (Código del Trabajo)"
5. Jefe tiene 2 opciones:
   - Cancelar asignación
   - Override con justificación: "Emergencia COVID, personal insuficiente"
6. Si hace override → Queda registrado

**Resultado:** Protección legal + flexibilidad con trazabilidad

---

### Caso 8: Acreditación de Asistencia (MVP1 - Manual)

**Actores:** CHIEF_AREA, STAFF_HEALTH

**Flujo:**

1. María tiene turno 10 dic 08:00-20:00
2. María llega al hospital 07:55
3. Jefe abre dashboard: "Asistencia Hoy"
4. Ve: "María González - Turno 08:00 - Sin check-in"
5. Jefe marca: "Acreditar llegada"
6. María recibe notificación: "Llegada acreditada por Jefe Juan - 07:58"
7. A las 08:30, si no hay check-in, sistema alerta a jefe

**Resultado:** Asistencia registrada y notificada

---

## 🗺️ MAPAS DE PROCESOS

### Proceso: Flujo de Vinculación de Personal

```
[STAFF crea cuenta] → [Sistema genera código PERS-XXXX]
         │
         ▼
[STAFF da código a CHIEF] → [CHIEF ingresa código]
         │
         ▼
[Sistema valida código] → [Muestra datos del STAFF]
         │
         ▼
[CHIEF confirma vinculación]
         │
         ▼
[STAFF recibe notificación]
         │
         ├─→ [STAFF acepta] → [Vinculación activa]
         │
         └─→ [STAFF rechaza] → [Vinculación cancelada]
```

---

### Proceso: Flujo de Asignación de Turno

```
[CHIEF abre calendario] → [Selecciona fecha]
         │
         ▼
[Selecciona tipo de turno] → [Define horario]
         │
         ▼
[Selecciona personal]
         │
         ▼
[Sistema valida]:
  ├─→ Conflictos de horario
  ├─→ 48 horas semanales
  ├─→ Descanso mínimo 12h
  └─→ Personal suficiente
         │
         ├─→ [✅ Válido] → [Turno asignado] → [STAFF notificado]
         │
         └─→ [❌ Inválido] → [Muestra error] → [CHIEF puede override]
```

---

### Proceso: Flujo de Intercambio de Turnos

```
[STAFF A solicita intercambio] → [Selecciona turno propio]
         │
         ▼
[Selecciona STAFF B] → [STAFF B recibe notificación]
         │
         ├─→ [STAFF B rechaza] → [Fin]
         │
         └─→ [STAFF B acepta]
                  │
                  ▼
         [CHIEF recibe solicitud]
                  │
                  ├─→ [CHIEF rechaza] → [Ambos notificados]
                  │
                  └─→ [CHIEF aprueba]
                           │
                           ▼
                  [Turnos intercambiados]
                           │
                           ▼
                  [Ambos notificados]
```

---

### Proceso: Flujo de Turno Abierto

```
[CHIEF crea turno abierto] → [Define tipo y horario]
         │
         ▼
[Todo el equipo notificado]
         │
         ▼
[Múltiples STAFF postulan]
         │
         ▼
[CHIEF ve lista de postulaciones]
         │
         ▼
[CHIEF selecciona un STAFF]
         │
         ├─→ [STAFF seleccionado notificado] → [Turno asignado]
         │
         └─→ [Otros STAFF notificados] → [Turno fue asignado a otro]
```

---

### Proceso: Flujo de Pago (SUPER_ADMIN)

```
[Hospital paga] → [Envía comprobante]
         │
         ▼
[SUPER_ADMIN registra pago]
  ├─→ Monto
  ├─→ Fecha
  ├─→ Método
  └─→ Próximo vencimiento
         │
         ▼
[Sistema actualiza estado] → [Organización: Activa]
         │
         ▼
[Dashboard muestra próximo pago]
```

---

### Proceso: Flujo de Suspensión

```
[Hospital no paga]
         │
         ▼
[Dashboard SUPER_ADMIN: ⚠️ DEUDA]
         │
         ▼
[SUPER_ADMIN decide suspender]
         │
         ▼
[Ingresa razón obligatoria: "Falta de pago - 60 días"]
         │
         ▼
[Organización suspendida]
  ├─→ ADMIN_HR no puede acceder
  ├─→ CHIEF no puede acceder
  └─→ STAFF ve mensaje: "Tu hospital suspendió el servicio"
         │
         ▼
[Hospital paga] → [SUPER_ADMIN reactiva] → [Acceso restaurado]
```

---

## 🏗️ STACK TECNOLÓGICO

### Frontend

- [ ] **Framework:** Next.js 16.0.3 (App Router)
- **React:** 19.2.0 (Server Components + Client Components)
- [ ] **TypeScript:** 5+ (Strict mode)
- **Estilos:** Tailwind CSS v4 con dark mode
- [ ] **UI:** shadcn/ui v2
- **Temas:** next-themes (requerido para dark mode)
- [ ] **Iconos:** lucide-react (instalado automáticamente por shadcn)
- **Notificaciones:** sonner (toast notifications)
- [ ] **Calendario:** react-big-calendar + date-fns (localización español)
- **Fechas:** date-fns-tz (manejo de timezone Chile con horario de verano)

### Backend

- [ ] **Patrón Principal:** Server Actions (no API Routes tradicionales salvo webhooks)
- **ORM:** Prisma ORM
- [ ] **Base de Datos:** PostgreSQL (Supabase)
- **Auth:** Auth.js v5 beta (configurado con JWT strategy)
- [ ] **Validación:** Zod (schemas + RUT chileno)
- **Hashing:** bcryptjs
- [ ] **Emails:** Resend (FASE 8)
- **Rate Limiting:** @upstash/ratelimit con Redis (protección anti-spam)
- [ ] **Storage:** Supabase Storage (fotos de perfil MVP1, PDFs liquidaciones MVP2)

### Estado

- [ ] **UI Local:** Zustand (sidebar, modales, filtros, preferencias de usuario)
- **Server State:** Server Components + Server Actions como patrón principal
  - [ ] **MVP1:** Server Actions + useState (simple, directo)
  - **React Query:** Opcional solo si setState en múltiples componentes se vuelve engorroso
  - [ ] Evaluar necesidad real durante desarrollo
- [ ] **Formularios:** FormData nativo con Server Actions (sin react-hook-form)

### Mobile

**Estrategia Mobile:**

- [ ] **MVP1:** Web responsive (mobile, tablet, desktop)
  - [ ] STAFF usa en navegador mobile
  - [ ] CHIEF y HR usan en desktop
  - [ ] Sin instalación, acceso directo desde navegador
- [ ] **MVP2:** Capacitor.js SOLO para STAFF (app nativa iOS/Android)
  - [ ] Reutiliza código web existente
  - [ ] APIs nativas (notificaciones push, geolocalización)
  - [ ] CHIEF y HR siguen usando web

**Razones de esta estrategia:**

- Web responsive cubre todas las necesidades del MVP1
- Capacitor solo cuando realmente se necesiten features nativos
- Enfoque en features core primero
- Evita complejidad innecesaria en fase inicial

### Observability

- [ ] **Error Tracking:** Sentry free tier desde MVP1 (5K eventos/mes)
  - [ ] Captura errores de Server Actions
  - [ ] Stack traces con contexto (userId, organizationId)
  - [ ] Alertas por email cuando hay errores críticos
- [ ] **Error Boundaries:** React Error Boundaries en cada sección
- **Health Checks:** Endpoint `/api/health` monitoreado por UptimeRobot (gratis)
- [ ] **Logging Estructurado:** Pino con rotación de logs (MVP2)

### Despliegue

**DECISIÓN IMPORTANTE:** No usaremos Vercel. Usaremos VPS + Docker.

- [ ] **Hosting:** VPS (DigitalOcean/Hetzner/AWS Lightsail) + Dockploy
- **Specs VPS:** 2 vCPU, 4GB RAM, 80GB SSD (~$20/mes)
- [ ] **Containerización:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- [ ] **SSL:** Let's Encrypt (renovación automática)
- **Process Manager:** PM2 (mantiene app corriendo 24/7)
- [ ] **Base de Datos:** Supabase PostgreSQL (plan Free o Pro según crecimiento)
- **CI/CD:** Manual inicialmente, GitHub Actions opcional después

**Gestión de Secrets:**

- [ ] Variables de entorno en `.env` (nunca commitear)
- Variables sensibles en Dockploy UI o Docker secrets
- [ ] Rotar secrets cada 6 meses (DATABASE_URL, AUTH_SECRET, RESEND_API_KEY)

**Proceso de Migrations:**

```bash
# Desarrollo local
npx prisma migrate dev --name nombre_migracion

# Producción (SSH manual MVP1)
ssh vps
cd /app
npx prisma migrate deploy

# MVP2: GitHub Actions automático
```

**Backups:**

- [ ] Supabase: Backups automáticos diarios (retención 7 días en free tier)
- Backup manual pre-migración: `pg_dump` antes de cambios críticos
- [ ] Probar restauración 1 vez al mes

**Ventajas VPS vs Vercel:**

- ✅ No hay cold starts (servidor corre 24/7)
- ✅ Prisma Client se carga una sola vez
- ✅ Más económico a largo plazo
- ✅ Control total sobre configuración
- ✅ No hay límites de ejecución de funciones

**Stack de Infraestructura:**

```
Internet → Cloudflare (DNS + CDN) → Nginx (Reverse Proxy) → Next.js (Puerto 3000)
                                                            ↓
                                                    Supabase PostgreSQL
```

---

## 🌍 INTERNACIONALIZACIÓN (i18n)

**Estrategia:** Preparado para i18n, pero MVP1 solo español

**MVP1: Estructura preparada**

```typescript
// lib/i18n/messages.ts
export const messages = {
  auth: {
    welcome: 'Bienvenido a VITA',
    login: 'Iniciar sesión',
    register: 'Registrarse',
  },
  shifts: {
    title: 'Turnos',
    create: 'Crear turno',
    edit: 'Editar turno',
  },
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
  }
}

// Uso en componentes
import { messages } from '@/lib/i18n/messages'
<h1>{messages.auth.welcome}</h1>
```

**MVP2: Activar multi-idioma**

```typescript
// lib/i18n/messages.ts
export const messages = {
  es: {
    auth: {
      welcome: 'Bienvenido a VITA',
    },
  },
  en: {
    auth: {
      welcome: 'Welcome to VITA',
    },
  },
  pt: {
    auth: {
      welcome: 'Bem-vindo ao VITA',
    },
  },
}

// lib/i18n/use-translation.ts
export function useTranslation() {
  const locale = useLocale() // 'es' | 'en' | 'pt'
  return (key: string) => messages[locale][key]
}
```

**✅ IMPLEMENTADO:** next-intl v4.6.1 con routing completo. Ver documentación completa arriba.

**Idiomas objetivo:**

- [ ] **MVP1:** Español (Chile)
- **MVP2:** Inglés (internacionalización)
- [ ] **MVP3:** Portugués (Brasil - mercado grande)

---

## 💾 ARQUITECTURA DE DATOS

### Multi-Tenancy: Base de Datos Compartida

**Decisión:** Todos los hospitales en una BD PostgreSQL con `organizationId`

**Ventajas:**

- [ ] Económico de operar (1 servidor PostgreSQL)
- Más fácil de desarrollar inicialmente
- [ ] Queries cross-tenant para analytics de SUPER_ADMIN
- Backup centralizado
- [ ] Migraciones únicas

**Seguridad:**

- [ ] **RLS (Row Level Security) en PostgreSQL** (MVP2)
- **Middleware Next.js** valida `organizationId` en cada request
- [ ] **Server Actions** siempre filtran por `organizationId`
- **Índices compuestos** en `(organizationId, ...)` para performance

**Escalabilidad futura:**

- [ ] Diseñado para microservicios
- Dominios lógicos separados: `auth`, `shifts`, `billing`, `attendance`
- [ ] Server Actions agrupados por dominio
- Posible migración a BD por tenant si es necesario

---

### Estrategia de Identificación por País

**Problema resuelto:** Cada país tiene diferentes tipos de documentos de identidad.

**Solución implementada:** Sistema flexible con validación en código, no en BD.

#### Enum de Tipos de Documento (DocType)

```prisma
enum DocType {
  RUT              // Chile
  CC               // Cédula de Ciudadanía (Colombia)
  CE               // Cédula de Extranjería (Colombia)
  TI               // Tarjeta de Identidad (Colombia)
  DNI              // Perú
  CARNET_EXT       // Carné de Extranjería (Perú)
  DNI_AR           // Argentina
  CUIL             // Argentina
  CUIT             // Argentina
  CURP             // México
  RFC              // México
  PASSPORT         // Universal
}
```

#### Mapeo de Documentos por País

**Archivo:** `lib/validations/document.ts`

```typescript
export const DOC_TYPES_BY_COUNTRY = {
  CL: ['RUT', 'PASSPORT'],
  CO: ['CC', 'CE', 'TI', 'PASSPORT'],
  PE: ['DNI', 'CARNET_EXT', 'PASSPORT'],
  AR: ['DNI_AR', 'CUIL', 'CUIT', 'PASSPORT'],
  MX: ['CURP', 'RFC', 'PASSPORT'],
  US: ['PASSPORT'],
} as const
```

#### Validación con Zod

**Archivo:** `lib/validations/user.ts`

```typescript
const userSchema = z
  .object({
    country: z.nativeEnum(Country),
    docType: z.nativeEnum(DocType),
    docNumber: z.string(),
  })
  .refine((data) => isValidDocTypeForCountry(data.country, data.docType), {
    message: 'Tipo de documento no válido para el país seleccionado',
  })
```

#### Ventajas de esta Arquitectura

1. **Flexible:** BD permite cualquier combinación (casos edge)
2. **Seguro:** Validación estricta en Server Actions con Zod
3. **UX mejorado:** Frontend muestra solo tipos válidos por país
4. **Escalable:** Agregar país nuevo = editar un objeto
5. **Type-safe:** TypeScript autocomplete funciona
6. **Una persona = una cuenta:** Constraint `@@unique([country, docType, docNumber])`

#### Login Multi-Método

Los usuarios pueden autenticarse con:

- ✅ Email (OAuth con Google/Microsoft)
- ✅ docNumber (para futuro login con credenciales si se requiere)

---

### Schema Prisma: Entidades Principales

#### 1. User (Usuario Universal)

**Propósito:** Representa a cualquier usuario del sistema. Un usuario puede trabajar en múltiples organizaciones.

**Campos clave:**

- `email`: Para autenticación (único)
- `name`: Nombre completo
- `country`: País del usuario (enum: CL, PE, CO, AR, MX, US)
- `docType`: Tipo de documento de identidad (enum: RUT, DNI, CC, CE, PASSPORT, etc.)
- `docNumber`: Número de documento de identidad
- `linkingCode`: Código único permanente para vinculación (ej: `clxxx-xxxxx`)
- `role`: Rol actual (SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF_HEALTH)
- `organizationId`: Organización actual (nullable para SUPER_ADMIN)
- `image`: URL foto de perfil (OAuth)
- `emailVerified`: Fecha de verificación email

**Constraint único:** `@@unique([country, docType, docNumber])`

- Una persona = una cuenta (sin importar en cuántos hospitales trabaje)
- Login posible por email O por docNumber

**Relaciones:**

- `organization`: Organización actual
- `accounts`: Cuentas OAuth (Google, Microsoft)
- `sessions`: Sesiones activas
- `shifts`: Turnos asignados (en FASE 3)
- `exchangeRequests`: Intercambios de turnos (en FASE 3)

---

#### 2. Organization (Hospital/Clínica)

**Propósito:** Representa un cliente (hospital o clínica)

**Campos clave:**

- `name`: Nombre del hospital/clínica
- `country`: País de la organización (enum: CL, PE, CO, AR, MX, US)
- `taxId`: Identificador fiscal/tributario del país (RUT en Chile, RUC en Perú, NIT en Colombia, etc.)
- `maxAdminHR`: Límite de cuentas ADMIN_HR (default: 5, gratis)
- `maxChiefs`: Límite de jefes contratados
- `maxStaff`: Límite de personal contratado
- `status`: `ACTIVE`, `SUSPENDED`, `CANCELLED` (en FASE 6)
- `suspensionReason`: Razón de suspensión (en FASE 6)

**Relaciones:**

- `users`: Usuarios vinculados a esta organización
- `areas`: Áreas del hospital (en FASE 3)
- `shiftTypes`: Tipos de turno globales (en FASE 3)
- `payments`: Historial de pagos (en FASE 6)

---

#### 3. OrganizationMember (Roles Multi-Tenant)

**Propósito:** Vincula usuarios con organizaciones y asigna roles

**Campos clave:**

- [ ] `role`: `ADMIN_HR`, `CHIEF_AREA`, `STAFF_HEALTH`
- `staffType`: Si es `STAFF_HEALTH` → `DOCTOR`, `NURSE`, `TECH`, etc.
- [ ] `status`: `PENDING`, `ACTIVE`, `DEACTIVATED`
- `maxLinkedStaff`: Si es `CHIEF_AREA`, cuántas personas puede vincular
- [ ] `activatedAt`: Fecha de aceptación de vinculación
- `deactivatedAt`: Fecha de desvinculación

**Relaciones:**

- [ ] `user`: Usuario global
- `organization`: Hospital
- [ ] `areas`: Áreas donde trabaja (si es STAFF o CHIEF)

---

#### 4. Area (Área del Hospital)

**Propósito:** Sección del hospital (Enfermería UCI, Médicos Urgencia, etc.)

**Campos clave:**

- [ ] `name`: Nombre del área
- `description`: Descripción opcional
- [ ] `organizationId`: Hospital al que pertenece

**Relaciones:**

- [ ] `chiefs`: Jefes de esta área
- `staff`: Personal de esta área
- [ ] `shifts`: Turnos de esta área

---

#### 5. ShiftType (Tipo de Turno)

**Propósito:** Define tipos de turno reutilizables (Largo, Noche, Extra, etc.)

**Campos clave:**

- [ ] `name`: Nombre del turno
- `durationHours`: Duración en horas
- [ ] `classification`: `DAY`, `NIGHT`, `MIXED`
- `color`: Color para el calendario (hex)
- [ ] `minStaffRequired`: Mínimo personal requerido
- `idealStaffCount`: Personal ideal
- [ ] `maxStaffAllowed`: Máximo permitido
- `suggestedRestDays`: Días de descanso recomendados
- [ ] `isGlobal`: `true` si lo creó HR, `false` si lo creó un jefe

**Relaciones:**

- [ ] `shifts`: Turnos que usan este tipo

---

#### 6. Shift (Turno Individual)

**Propósito:** Instancia de un turno asignado a personal en una fecha específica

**Campos clave:**

- [ ] `date`: Fecha del turno
- `startTime`: Hora de inicio
- [ ] `endTime`: Hora de fin
- `status`: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- [ ] `assignmentType`: `MANUAL`, `OPEN`, `EXCHANGE`
- `legalOverride`: Si se hizo override de validación legal
- [ ] `overrideReason`: Razón del override

**Relaciones:**

- [ ] `shiftType`: Tipo de turno
- `assignedUser`: Personal asignado
- [ ] `area`: Área donde se realiza
- `attendance`: Registro de asistencia

---

#### 7. ShiftExchange (Intercambio de Turnos)

**Propósito:** Solicitudes de intercambio entre personal

**Campos clave:**

- [ ] `status`: `PENDING_STAFF`, `PENDING_CHIEF`, `APPROVED`, `REJECTED`
- `reason`: Razón del intercambio (opcional)
- [ ] `rejectionReason`: Si fue rechazado

**Flujo de estados:**

```
PENDING_STAFF → (STAFF B acepta) → PENDING_CHIEF → (CHIEF aprueba) → APPROVED
             ↓                                   ↓
          REJECTED                            REJECTED
```

**Relaciones:**

- [ ] `requestedByUser`: Usuario que solicita
- `requestedToUser`: Usuario que recibe la solicitud
- [ ] `originalShift`: Turno que quiere dar
- `targetShift`: Turno que quiere recibir
- [ ] `approvedByChief`: Jefe que aprobó

---

#### 8. StaffRate (Tarifas Personalizadas)

**Propósito:** Define cuánto gana cada persona según tipo de hora

**Campos clave:**

- [ ] `dayHourlyRate`: CLP por hora de día
- `nightHourlyRate`: CLP por hora de noche
- [ ] `weekendMultiplier`: Multiplicador fin de semana
- `holidayMultiplier`: Multiplicador feriado
- [ ] `mandatoryHolidayMultiplier`: Multiplicador feriado irrenunciable
- `extraBonus`: Bono fijo por turno extra
- [ ] `validFrom`: Fecha de inicio de vigencia
- `validUntil`: Fecha de fin de vigencia

**Nota:** Se crea un nuevo registro cada vez que cambia la tarifa → Historial de tarifas

---

#### 9. Attendance (Asistencia)

**Propósito:** Registro de check-in/check-out del personal

**Campos clave:**

- [ ] `checkInTime`: Hora de llegada
- `checkOutTime`: Hora de salida
- [ ] `checkInMethod`: `MANUAL`, `BIOMETRIC`, `AUTO`
- `checkInByUser`: Si fue manual, quién acreditó
- [ ] `lateMinutes`: Minutos de retraso
- `notes`: Notas adicionales

**Relaciones:**

- [ ] `shift`: Turno correspondiente
- `user`: Personal que asistió

---

#### 10. Holiday (Feriados Chilenos)

**Propósito:** Feriados oficiales de Chile

**Campos clave:**

- [ ] `name`: Nombre del feriado
- `date`: Fecha
- [ ] `isMandatory`: `true` si es irrenunciable
- `region`: Si es regional (ej: Arica y Parinacota)

**Feriados Irrenunciables:**

- [ ] 1 enero (Año Nuevo)
- 1 mayo (Día del Trabajo)
- [ ] 18 y 19 sept (Fiestas Patrias)
- 25 diciembre (Navidad)
- [ ] 29 junio (San Pedro y San Pablo - irrenunciable desde 2023)

---

#### 11. Payment (Pagos de Organizaciones)

**Propósito:** Historial de pagos de cada hospital

**Campos clave:**

- [ ] `amount`: Monto en USD
- `currency`: `USD` o `CLP`
- [ ] `paymentMethod`: `TRANSFER`, `CHECK`, `CASH`, `OTHER`
- `paymentDate`: Fecha de pago
- [ ] `periodStart`: Inicio del período cubierto
- `periodEnd`: Fin del período cubierto
- [ ] `dueDate`: Fecha de vencimiento
- `notes`: Notas adicionales

**Relaciones:**

- [ ] `organization`: Hospital que pagó
- `recordedBy`: SUPER_ADMIN que registró el pago

---

### Índices Importantes

**Performance Multi-Tenant:**

```prisma
@@index([organizationId, date])         // Shifts por organización y fecha
@@index([organizationId, userId])       // Turnos de un usuario en una org
@@index([userId, date])                 // Turnos de un usuario (multi-org)
@@index([areaId, date])                 // Turnos de un área
@@index([linkingCode])                  // Búsqueda rápida de usuarios
```

---

## 🔑 CARACTERÍSTICAS CLAVE

### 1. Vinculación de Personal (Transparente)

**Concepto:** Sistema de doble validación donde tanto el jefe como el personal deben aprobar la vinculación.

---

#### **Flujo de Vinculación (MVP1):**

```
1. Personal crea cuenta en VITA
   → Sistema genera código PERMANENTE: PERS-2024-001234

2. Personal comunica código al jefe (verbal, email, WhatsApp)

3. Jefe ingresa código en "Vincular Personal"
   → Sistema busca al usuario por código
   → Muestra preview: "María González - Enfermera - RUT 12.345.678-9"

4. Jefe confirma vinculación
   → Sistema crea registro con status 'PENDING'

5. Personal recibe notificación popup/email/push:
   "El Jefe Juan Pérez te invitó a unirte a Enfermería UCI - Hospital Central"
   [Aceptar] [Rechazar]

6. Personal decide:
   → Acepta: Vinculación activa (status: 'ACTIVE')
   → Rechaza: Vinculación cancelada (status: 'REJECTED')

7. Si acepta → Personal aparece en lista del jefe
   → Jefe puede asignarle turnos
   → Personal ve turnos de esa organización en su calendario
```

**Características del Código (MVP1):**

- ✅ **Permanente:** No expira, se usa cada vez que cambia de trabajo
- ✅ **Reutilizable:** Mismo código para vincular a múltiples organizaciones
- ✅ **Único:** Un código por usuario, no se puede duplicar
- ✅ **Formato:** `PERS-YYYY-NNNNNN` (ej: PERS-2024-001234)
- ⚠️ **Riesgo:** Si se filtra, cualquiera puede intentar vincular
- ✅ **Mitigación:** Doble validación (jefe ingresa + personal aprueba)

---

#### **Mejoras para MVP2 (Códigos Temporales):**

**Problema identificado:**
Si el código es permanente y se filtra públicamente, podría haber intentos de vinculación no autorizados.

**Solución MVP2:**

```typescript
// Código temporal de un solo uso
model LinkingCode {
  id        String   @id @default(cuid())
  code      String   @unique // Ej: PS-A1B2C3 (6 caracteres, más fácil)
  userId    String
  expiresAt DateTime // Expira en 30 días
  maxUses   Int      @default(1) // Solo se puede usar 1 vez
  usedCount Int      @default(0)
  createdAt DateTime @default(now())
}
```

**Flujo MVP2:**

1. Personal genera nuevo código temporal (válido 30 días)
2. Si expira, debe generar uno nuevo
3. Código se "consume" al vincularse (usedCount++)
4. Si alcanza maxUses, no se puede usar más
5. Más seguro, pero menos conveniente (debe regenerar si expira)

**Decisión:** Empezamos con código permanente (más simple para MVP1), mejoramos seguridad en MVP2 si es necesario.

---

#### **Desvinculación:**

**Jefe puede desvincular:**

- En cualquier momento
- Desde lista de personal
- Confirmación obligatoria
- Personal recibe notificación
- Turnos futuros se cancelan automáticamente
- Turnos pasados se mantienen en historial

**Personal NO puede desvincularse:**

- Debe solicitarlo al jefe
- Razón: Evitar que se desvincule días antes de turnos asignados

---

#### **Multi-Organización:**

**Personal puede:**

- [ ] Trabajar en **múltiples hospitales simultáneamente**
  - Hospital A paga su vinculación
  - Hospital B paga su vinculación
  - Ambos independientes
- [ ] Estar en **múltiples áreas** del mismo hospital
  - Enfermería UCI
  - Enfermería UTI
  - Cada área puede asignarle turnos
- [ ] Ver **calendario unificado** de TODAS sus organizaciones
  - Filtrar por organización
  - Filtrar por área
  - Vista consolidada
- [ ] Recibir **alertas de conflictos** de horarios
  - Si tiene turnos superpuestos en distintos hospitales
  - Sistema marca el conflicto con badge rojo
  - Personal debe resolver (solicitar cambio de turno)

### 2. Tipos de Turno Flexibles

**Creados por:**

- [ ] ADMIN_HR: Tipos globales (disponibles para todas las áreas)
- CHIEF_AREA: Tipos específicos de su área

**Configuración:**

```typescript
{
  name: "Largo Día",
  duration: 12,
  classification: "DAY" | "NIGHT" | "MIXED",
  color: "#3b82f6",
  minStaffRequired: 1,
  idealStaffCount: 3,
  maxStaffAllowed: 5,
  suggestedRestDays: 1
}
```

**Flexibilidad:**

- [ ] No hay límite de horas por turno
- Pueden combinarse (ej: Largo + Noche en un día)
- [ ] Personal puede hacer turnos extra
- Jefe decide descansos (puede dar 5 días libres después de turnos pesados)

### 3. Asignación de Turnos

**Tres modos:**

**A) Asignación Directa:**

- [ ] Jefe asigna turno a personal específico
- Sistema valida conflictos automáticamente

**B) Turno Abierto:**

- [ ] Jefe crea turno sin asignar
- Personal postula con mensaje opcional
- [ ] Jefe elige entre postulaciones

**C) Intercambio:**

1. Personal A solicita intercambio a Personal B
2. Personal B acepta o rechaza
3. Si acepta → Jefe aprueba o rechaza
4. Si jefe aprueba → Turnos se intercambian

### 4. Validaciones Legales (Código del Trabajo Chile)

**⚠️ IMPORTANTE - RESPONSABILIDAD LEGAL:**

VITA es un software de servicio. **La responsabilidad del cumplimiento legal recae en el hospital/clínica.**

VITA solo **advierte** cuando se exceden límites legales, pero permite override con justificación.

**Disclaimer Legal (Mostrado en Override):**

```
⚠️ ADVERTENCIA LEGAL

Este turno excede las 48 horas semanales permitidas por el
Código del Trabajo de Chile (Art. 22).

VITA no es responsable del cumplimiento legal. Su organización
asume la responsabilidad de este override.

Esta acción quedará registrada en el sistema con timestamp,
usuario que aprobó y razón del override.
```

---

**Validaciones Implementadas:**

**1. Máximo 48 horas semanales:**

- [ ] Sistema calcula horas automáticamente
- Alerta en tiempo real si excede
- [ ] Override posible con justificación **obligatoria**
- Se registra en log auditable (sin generar PDF)

**2. Descanso mínimo:**

- [ ] 12 horas entre turnos
- Warning si no se cumple
- [ ] Override posible con justificación

**3. Feriados irrenunciables:**

- [ ] 18 sept, 1 mayo, 25 dic, 1 enero, 29 junio
- Sistema marca con badge especial
- [ ] Alerta al asignar turno en feriado irrenunciable
- Override posible (algunos trabajadores aceptan trabajar)

**4. Mínimo/Máximo personal:**

- [ ] Jefe configura por tipo de turno
- Sistema alerta si no hay mínimo requerido
- [ ] Muestra "Turno OK (1/3 doctores)" o "Turno ideal (3/3 doctores)"
- No requiere override (es recomendación, no requisito legal)

---

**Sistema de Logs de Override:**

```typescript
// Schema Prisma
model LegalOverrideLog {
  id             String   @id @default(cuid())
  shiftId        String
  overrideType   String   // 'WEEKLY_HOURS', 'REST_HOURS', 'HOLIDAY'
  reason         String   // Razón obligatoria
  approvedBy     String   // ID del CHIEF que aprobó
  organizationId String
  timestamp      DateTime @default(now())

  shift        Shift        @relation(fields: [shiftId], references: [id])
  approver     User         @relation(fields: [approvedBy], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])
}
```

**Auditoría:**

- ✅ Todos los overrides quedan registrados
- ✅ Timestamp exacto de cuándo se aprobó
- ✅ Quién aprobó (nombre del jefe)
- ✅ Razón específica
- ✅ SUPER_ADMIN puede ver todos los overrides de todas las organizaciones
- ✅ ADMIN_HR puede ver overrides de su organización
- ❌ NO se genera PDF automáticamente (hospital puede exportar si lo necesita)

### 5. Sistema de Tarifas

**Configuración por persona:**

```typescript
{
  userId: "user-123",
  dayHourlyRate: 8000,      // CLP
  nightHourlyRate: 10000,
  weekendMultiplier: 1.5,
  holidayMultiplier: 2.0,
  mandatoryHolidayMultiplier: 2.5,
  extraBonus: 50000,
  validFrom: "2024-01-01",
  validUntil: "2024-12-31"  // Historial de cambios
}
```

**Cálculo (MVP2):**

- [ ] Automático según horario trabajado
- Considera día/noche, feriados, extras
- [ ] Genera liquidación PDF

### 6. Sistema de Asistencia

**ESTRATEGIA POR FASES:**

- **MVP1:** Acreditación manual por CHIEF (casos excepcionales)
- **MVP2:** Integración con biométricos de terceros (webhook API)
- **MVP3:** Métodos nativos de VITA (GPS, QR, Web check-in) - **DIFERENCIADOR vs Rflex**

**⚠️ CLARIFICACIÓN IMPORTANTE:**

Al igual que Rflex, VITA **NO será dueña del hardware biométrico**:

- Sistemas de huella dactilar = **Hardware de terceros** (~$500-800 USD)
- Sistemas faciales = **Hardware de terceros** (~$1500-2000 USD)
- **Estrategia:** Integración vía webhook API en MVP2
- **Ventaja MVP3:** Métodos propios por software (sin hardware adicional)

---

#### **MVP1: Acreditación Manual (Casos Excepcionales)**

**Contexto:**

- Hospitales ya tienen sistemas biométricos (huella/facial)
- La integración con esos sistemas es para MVP2
- MVP1: Jefe puede acreditar manualmente cuando sistema biométrico falla

**Flujo MVP1:**

```
1. Personal tiene turno asignado (ej: 08:00-20:00)
2. Personal llega y marca en sistema biométrico del hospital
3. Si sistema biométrico FALLA:
   - Personal avisa al jefe
   - Jefe abre VITA → "Asistencia Hoy"
   - Jefe acredita llegada manualmente
   - Personal recibe notificación: "Llegada acreditada por [Jefe] a las 08:05"
```

**Features MVP1:**

- [ ] Dashboard "Asistencia Hoy" para jefes
- Lista de personal con turnos del día
- [ ] Botón "Acreditar llegada" por cada persona
- Badge de alerta si no hay check-in 30 min después del inicio del turno
- [ ] Registro manual de hora de llegada
- Notificación al personal de confirmación

**Limitaciones MVP1:**

- ❌ No hay integración con sistemas biométricos
- ❌ No hay self-check-in del personal desde VITA
- ❌ No hay geolocalización
- ✅ Solo acreditación manual del jefe (casos excepcionales)

---

#### **MVP2: Integración Biométrica + Self Check-in**

**Problema actual de hospitales:**
Sistemas biométricos (huella/facial) tienen fallas frecuentes, generan notificaciones falsas, personal debe avisar manualmente.

**Solución VITA MVP2:**

**Escenario 1: Sistema Biométrico Funciona (Flujo Ideal)**

1. Personal marca huella/facial en dispositivo biométrico: 07:58
2. Sistema biométrico → Webhook POST a VITA API
3. VITA registra check-in automático
4. Personal recibe notificación: "✅ Llegada acreditada 07:58"
5. Jefe ve en dashboard: "✓ María González - Presente 07:58"

**Escenario 2: Sistema Biométrico Falla (Fallback Manual)**

1. Personal intenta marcar → Error del dispositivo
2. Personal avisa al jefe por teléfono/radio
3. Jefe acredita manualmente desde VITA
4. Personal recibe: "✅ Llegada acreditada por Jefe Juan 08:05 (Manual)"
5. Se registra `checkInMethod: 'MANUAL'` en BD

**Escenario 3: Self Check-in desde App (Alternativa)**

1. Personal abre app VITA en celular
2. Click en "He llegado"
3. Sistema valida geolocalización (dentro de radio de 100m del hospital)
4. Si está dentro → Check-in automático
5. Si está fuera → Requiere aprobación manual del jefe

**Escenario 4: Retraso sin Check-in**

1. Turno inicia 08:00
2. 08:30 → No hay check-in (ni biométrico, ni manual, ni app)
3. Sistema envía alerta push:
   - Al jefe: "⚠️ María González no ha marcado llegada"
   - Al personal: "⚠️ Recuerda marcar tu asistencia"
4. Jefe puede contactar o acreditar

**Sistemas Biométricos Compatibles (MVP2):**

- [ ] ZKTeco (huella) - Webhook API
- Anviz (facial + huella) - Webhook API
- [ ] Suprema BioStar (facial) - Webhook API
- Hikvision (facial) - Webhook API

**Arquitectura MVP2:**

```typescript
// app/api/webhooks/biometric/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-webhook-signature')

  // Validar firma del webhook (seguridad)
  if (!validateWebhookSignature(signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { userId, timestamp, deviceId, method } = await request.json()

  // Registrar check-in automático
  await prisma.attendance.create({
    data: {
      userId,
      checkInTime: new Date(timestamp),
      checkInMethod: 'BIOMETRIC',
      deviceId,
      biometricMethod: method, // 'fingerprint' | 'facial'
    },
  })

  // Enviar notificación al personal
  await sendNotification(userId, 'Llegada acreditada')

  return Response.json({ success: true })
}
```

---

#### **MVP3: Métodos Nativos de VITA (DIFERENCIADOR)**

**🎯 VENTAJA COMPETITIVA vs Rflex:**

Rflex depende de hardware biométrico de terceros (caro). VITA ofrece alternativas propias por software.

**Métodos Nativos Propuestos:**

**1. GPS Check-in (App Capacitor)**

**Concepto:**

- App detecta ubicación GPS del personal
- Si está dentro del radio del hospital → Check-in habilitado
- Sin hardware adicional, sin costos extra

**Flujo:**

```
1. Personal llega al hospital (dentro de 100m del área)
2. Abre app VITA → Botón "He llegado" habilitado (GPS validado)
3. Confirma llegada con un tap
4. Sistema registra:
   - Timestamp
   - Coordenadas GPS (lat/lng)
   - Precisión del GPS (ej: ±10m)
   - Device ID
5. Check-in confirmado con notificación
6. Jefe ve en dashboard: "✓ María - Presente 08:02 (GPS)"
```

**Validaciones:**

```typescript
// lib/utils/geolocation.ts
const HOSPITAL_COORDINATES = { lat: -33.4372, lng: -70.6506 } // Ej: Santiago
const CHECK_IN_RADIUS = 100 // metros

export const isWithinCheckInRadius = (userLat: number, userLng: number): boolean => {
  const distance = calculateDistance(
    HOSPITAL_COORDINATES.lat,
    HOSPITAL_COORDINATES.lng,
    userLat,
    userLng
  )
  return distance <= CHECK_IN_RADIUS
}
```

**Configuración por Organización:**

- ADMIN_HR configura coordenadas del hospital
- Radio de check-in ajustable (50m, 100m, 200m)
- Alertas si check-in desde ubicación sospechosa

**Ventajas:**

- ✅ Sin hardware ($0 costo adicional)
- ✅ Funciona offline (guarda marca, sincroniza después)
- ✅ Prueba de ubicación (evita marcajes remotos)
- ✅ Más flexible que huellero fijo

**Limitaciones:**

- ⚠️ Requiere app nativa (Capacitor MVP2)
- ⚠️ Depende de GPS del celular (precisión variable)
- ⚠️ Posible spoofing de GPS (mitigable con otras validaciones)

---

**2. QR Code Check-in (App o Web)**

**Concepto:**

- Jefe genera QR code diario/por turno
- Personal escanea QR al llegar
- Validación simple, sin hardware biométrico

**Flujo:**

```
1. Jefe abre VITA → "Generar QR del día"
2. Sistema genera QR único con:
   - Turno ID
   - Área ID
   - Fecha válida (hoy)
   - Token temporal
3. Jefe imprime o muestra QR en tablet en entrada
4. Personal llega → Escanea QR con app VITA
5. Check-in registrado automáticamente
6. Notificación: "✅ Llegada acreditada 08:03 (QR)"
```

**Variantes:**

- **QR Diario:** Un QR para todos los turnos del día
- **QR por Turno:** Un QR específico por turno
- **QR Estático:** QR permanente del hospital (menos seguro)

**Implementación:**

```typescript
// actions/attendance/generate-qr-action.ts
export async function generateQRCodeAction(shiftId: string) {
  const token = await generateSecureToken() // JWT con expiración
  const qrData = {
    type: 'CHECK_IN',
    shiftId,
    organizationId,
    validUntil: addHours(new Date(), 24), // Válido 24h
    token,
  }

  const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData))
  return { success: true, qrCodeUrl }
}

// En la app: Escanear con Capacitor Barcode Scanner
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

const handleScan = async () => {
  const result = await BarcodeScanner.startScan()
  if (result.hasContent) {
    await checkInWithQRAction(result.content)
  }
}
```

**Ventajas:**

- ✅ Muy económico (solo imprimir o tablet)
- ✅ Funciona en app y web
- ✅ Fácil de implementar
- ✅ No requiere internet en el momento (offline capable)

**Limitaciones:**

- ⚠️ Menos seguro (QR puede compartirse)
- ⚠️ Requiere que jefe genere/muestre QR
- ⚠️ Posible fraude si personal comparte screenshot

---

**3. Web Check-in Dedicado (Kiosco Virtual)**

**Concepto:**

- Tablet/computadora en entrada del hospital
- Personal ingresa RUT o código
- Check-in sin necesidad de app

**Flujo:**

```
1. Hospital coloca tablet en entrada con VITA abierto
2. Personal llega → Toca pantalla "Marcar Asistencia"
3. Ingresa RUT: 12.345.678-9
4. Sistema valida:
   - Usuario existe
   - Tiene turno hoy
   - Está dentro de horario válido (±30 min)
5. Check-in registrado
6. Pantalla: "✅ María González - Llegada acreditada 08:04"
```

**Seguridad:**

```typescript
// Validaciones
- RUT debe tener turno programado hoy
- Solo permitir check-in dentro de ventana de tiempo (±30 min del inicio)
- IP whitelisting (solo desde red del hospital)
- Rate limiting (max 1 check-in por usuario cada 5 min)
```

**Ventajas:**

- ✅ No requiere que personal tenga app
- ✅ Accesible para todos (incluso sin smartphone)
- ✅ Tablet única vs múltiples huelleros

**Limitaciones:**

- ⚠️ Requiere tablet/PC en entrada
- ⚠️ Menos seguro (cualquiera puede ingresar RUT ajeno)
- ⚠️ Mejor como complemento, no método principal

---

**Comparación de Métodos MVP3:**

| Método                | Costo Hardware | Seguridad  | UX         | Offline |
| --------------------- | -------------- | ---------- | ---------- | ------- |
| **GPS Check-in**      | $0             | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ✅      |
| **QR Code**           | ~$200 (tablet) | ⭐⭐⭐     | ⭐⭐⭐⭐   | ✅      |
| **Web Kiosco**        | ~$200 (tablet) | ⭐⭐       | ⭐⭐⭐     | ❌      |
| **Biométrico** (MVP2) | $500-2000      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ❌      |

**Recomendación de Implementación:**

1. **MVP3 FASE 1:** GPS Check-in (diferenciador fuerte)
2. **MVP3 FASE 2:** QR Code (complemento flexible)
3. **MVP3 FASE 3:** Web Kiosco (para hospitales sin app adoption)

**Estrategia Comercial:**

```
Rflex: "Necesitas comprar huelleros de $800 USD c/u"
VITA:  "Check-in por GPS desde tu celular. $0 hardware adicional."
```

**🎯 PITCH:**
"Mientras otros te venden hardware, nosotros te damos software inteligente que funciona con lo que ya tienes: celulares."

---

## 🎨 PALETA DE COLORES (Healthcare Modern Theme)

**Tema implementado:** "Healthcare Modern" - Optimizado para sector salud desde tweakcn.com

**Filosofía de diseño:**
- ❌ **Evitado:** Tema "Cyberpunk" (colores neón, fondos muy oscuros) - No apropiado para sector salud
- ❌ **Evitado:** Tema "Violet Bloom" (púrpura/violeta) - No transmite confianza médica
- ✅ **Implementado:** Paleta médica moderna adaptada desde tweakcn con azules de confianza, verdes de bienestar y acentos sutiles

**Análisis y adaptación:**
- Tema base importado desde tweakcn.com (Violet Bloom)
- Colores primarios cambiados de púrpura (277°) a azul médico (250°)
- Secondary cambiado de gris a verde salud (150°)
- Charts adaptados a paleta médica (azules, verdes, ámbar)
- Dark mode optimizado con azul oscuro suave en lugar de púrpura

**Tailwind v4 CSS (OKLCH):**

```css
:root {
  --background: oklch(0.99 0.003 250);
  --foreground: oklch(0.15 0.01 250);
  --primary: oklch(0.5 0.15 250);
  --secondary: oklch(0.7 0.12 150);
  --accent: oklch(0.85 0.08 200);
  --destructive: oklch(0.55 0.2 25);
  --chart-1: oklch(0.5 0.15 250);
  --chart-2: oklch(0.7 0.12 150);
  --chart-3: oklch(0.65 0.15 45);
}

.dark {
  --background: oklch(0.12 0.01 250);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.65 0.15 250);
  --secondary: oklch(0.75 0.12 150);
}
```

**Colores de estado (para turnos):**
- `scheduled`: Azul médico (primary) - oklch(0.5 0.15 250)
- `in-progress`: Ámbar/amarillo suave - oklch(0.65 0.15 45)
- `completed`: Verde salud (secondary) - oklch(0.7 0.12 150)
- `cancelled`: Gris con tinte azul - oklch(0.5 0.01 250)

**Justificación de colores:**
- **Azul médico (250°):** Transmite confianza, profesionalismo, tecnología médica
- **Verde salud (150°):** Asociado con bienestar, calma, éxito
- **Grises modernos:** Limpieza, tecnología, neutralidad
- **Acentos sutiles:** Modernidad sin ser agresivo o "gaming"
- **Dark mode azul:** Más apropiado que púrpura para sector salud

**Implementado en:** `app/globals.css`
**Fecha:** Diciembre 2024
**Fuente base:** tweakcn.com (adaptado para salud)

---

## 🖥️ DASHBOARDS POR ROL - ESPECIFICACIÓN VISUAL

Esta sección detalla qué verá cada administrador en su dashboard y menú de navegación.

---

### 1️⃣ SUPER_ADMIN - Dashboard Principal

**Rol:** Equipo VITA (tu empresa)
**Acceso:** Global a todas las organizaciones
**Color de tema:** Púrpura/Violeta (#8B5CF6)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  🏥 VITA                   │
│  Super Administrador       │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  🏢 Organizaciones         │
│  💳 Pagos                  │
│  📈 Analytics              │
│  ⚙️  Configuración         │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  👤 Admin Usuario          │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard SUPER_ADMIN                                  [Filtros ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🏢 Total Orgs  │  │ ✅ Activas     │  │ ⚠️  Suspendidas│       │
│  │                │  │                │  │                │       │
│  │      24        │  │      22        │  │       2        │       │
│  │                │  │                │  │                │       │
│  │  +3 este mes   │  │  91.7%         │  │  8.3%          │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 💰 Ingresos    │  │ 👥 Usuarios    │  │ ⏰ Próx. Pago  │       │
│  │                │  │                │  │                │       │
│  │  $28,600 USD   │  │     1,234      │  │       5        │       │
│  │                │  │                │  │                │       │
│  │  +$2,400       │  │  +45 este mes  │  │  en 7 días     │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Organizaciones Recientes                         [Ver todas →]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Organización        Estado    Plan      Cuentas   Acciones   │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ Hospital Central    🟢 Activa PRO      45/200    [Ver][💳]   │  │
│  │ Clínica Santa María 🟢 Activa BASIC    28/50     [Ver][💳]   │  │
│  │ Hospital Regional   🟡 Deuda  PRO      156/200   [Ver][💳]   │  │
│  │ Clínica San José    🔴 Suspnd BASIC    0/50      [Ver][🔓]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Alertas y Notificaciones                                           │
│                                                                      │
│  ⚠️  5 organizaciones con pago próximo a vencer (próximos 7 días)  │
│  🔴 2 organizaciones suspendidas por falta de pago                  │
│  ✅ 3 pagos registrados hoy ($8,200 USD)                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Páginas Secundarias

**1. Organizaciones** (`/super-admin/organizations`)

- [ ] Lista completa con tabla
- Filtros: Estado, Plan, Fecha de creación
- [ ] Búsqueda por nombre
- Botón: "Nueva Organización"

**2. Ver Organización** (`/super-admin/organizations/[id]`)

- [ ] Detalles completos
- Historial de pagos
- [ ] Métricas: usuarios activos, áreas, turnos del mes
- Acciones: Editar, Suspender/Reactivar, Registrar Pago

**3. Pagos** (`/super-admin/payments`)

- [ ] Formulario para registrar pago
- Select de organización
- [ ] Historial global de pagos

**4. Analytics** (`/super-admin/analytics`)

- [ ] Gráficos de ingresos (mensual)
- Distribución de planes
- [ ] Crecimiento de usuarios
- Tabla de organizaciones por ingresos

---

### 2️⃣ ADMIN_HR - Dashboard de Recursos Humanos

**Rol:** Recursos Humanos de una organización
**Acceso:** Su organización solamente
**Color de tema:** Azul (#3B82F6)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  🏥 Hospital Central       │
│  Recursos Humanos          │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  🏢 Áreas                  │
│  🔄 Tipos de Turno         │
│  💰 Tarifas                │
│  👔 Gestionar Jefes        │
│  👥 Personal               │
│  📋 Reportes               │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  👤 María González         │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Recursos Humanos - Hospital Central      [Mes: Nov 2024] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🏢 Áreas       │  │ 👥 Personal    │  │ 👔 Jefes       │       │
│  │                │  │                │  │                │       │
│  │       8        │  │      156       │  │       12       │       │
│  │                │  │                │  │                │       │
│  │  Activas       │  │  Activos       │  │  Activos       │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🔄 Tipos Turno │  │ 📅 Turnos/Mes  │  │ 💰 Costo/Mes   │       │
│  │                │  │                │  │                │       │
│  │      12        │  │     1,847      │  │  $124,500,000  │       │
│  │                │  │                │  │                │       │
│  │  Configurados  │  │  Este mes      │  │  CLP           │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Acciones Rápidas                                                   │
│                                                                      │
│  [➕ Nueva Área]  [➕ Nuevo Tipo Turno]  [👔 Crear Jefe]           │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Áreas de la Organización                         [Ver todas →]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Área                    Jefes   Personal  Turnos/Mes  Estado │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ Enfermería UCI            2       24       456       🟢       │  │
│  │ Médicos Urgencia          3       18       389       🟢       │  │
│  │ Kinesiología              1       12       245       🟢       │  │
│  │ Técnicos Enfermería       2       32       578       🟢       │  │
│  │ Nutrición                 1        8       134       🟢       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Límites de Cuentas por Jefe                                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Jefe                    Área              Usado    Límite    │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ Juan Pérez              Enfermería UCI    24/30   [Editar]  │  │
│  │ Ana Torres              Médicos Urgencia  18/25   [Editar]  │  │
│  │ Carlos Ruiz             Kinesiología      12/15   [Editar]  │  │
│  │ ⚠️  María Silva         Téc. Enfermería   32/32   [Editar]  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Páginas Secundarias

**1. Áreas** (`/hr/areas`)

- [ ] Lista de áreas con CRUD
- Formulario: Nombre, Descripción
- [ ] Ver jefes y personal asignado

**2. Tipos de Turno** (`/hr/shift-types`)

- [ ] Lista de tipos de turno
- Formulario: Nombre, Duración, Clasificación (DAY/NIGHT/MIXED), Color
- [ ] Configurar: mín/máx personal, descanso sugerido

**3. Tarifas** (`/hr/rates`)

- [ ] Lista de personal con sus tarifas
- Formulario por persona:
  - [ ] Tarifa día/noche
  - [ ] Multiplicadores (fin de semana, feriado, irrenunciable)
  - [ ] Bonos extra
  - [ ] Fecha de vigencia
- [ ] Historial de cambios de tarifa

**4. Gestionar Jefes** (`/hr/chiefs`)

- [ ] Lista de jefes
- Crear cuenta de jefe
- [ ] Asignar límite de cuentas
- Asignar a áreas

**5. Personal** (`/hr/staff`)

- [ ] Vista de todo el personal
- Filtrar por área
- [ ] Ver tarifas
- Ver turnos del mes

---

### 3️⃣ CHIEF_AREA - Dashboard de Jefe de Área

**Rol:** Jefe de área específica
**Acceso:** Su área y personal asignado
**Color de tema:** Verde (#16A34A)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  🏥 Hospital Central       │
│  Jefe - Enfermería UCI     │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  📅 Calendario             │
│  👥 Mi Personal            │
│  ➕ Vincular Personal      │
│  🔄 Asignar Turnos         │
│  📝 Turnos Abiertos        │
│  ✅ Aprobaciones           │
│  📋 Asistencia             │
│  📊 Reportes               │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  👤 Juan Pérez             │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Jefe - Enfermería UCI                [Semana: 11-17 Nov] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 👥 Mi Equipo   │  │ 📅 Turnos Hoy  │  │ ✅ Presentes   │       │
│  │                │  │                │  │                │       │
│  │      24/30     │  │       12       │  │      11/12     │       │
│  │                │  │                │  │                │       │
│  │  Vinculados    │  │  En progreso   │  │  91.7%         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🔔 Pendientes  │  │ 🔄 Intercambios│  │ ⚠️  Alertas    │       │
│  │                │  │                │  │                │       │
│  │       3        │  │       2        │  │       1        │       │
│  │                │  │                │  │                │       │
│  │  Aprobaciones  │  │  Por aprobar   │  │  Retrasos      │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Acciones Rápidas                                                   │
│                                                                      │
│  [➕ Asignar Turno]  [🔗 Vincular Personal]  [✅ Acreditar Asist.] │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Turnos de Hoy                                    [Ver calendario →]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Personal           Turno        Horario      Estado   Acción │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ María González     Largo Día    08:00-20:00  🟢 Pres  [Ver] │  │
│  │ Pedro Sánchez      Largo Día    08:00-20:00  🟢 Pres  [Ver] │  │
│  │ Ana Torres         Noche        20:00-08:00  🟡 Prog  [✅]   │  │
│  │ Luis Martínez      Largo Día    08:00-20:00  🟢 Pres  [Ver] │  │
│  │ Carmen Rojas       Noche        20:00-08:00  🟡 Prog  [✅]   │  │
│  │ ⚠️  Diego Silva    Largo Día    08:00-20:00  🔴 Aust  [✅]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Solicitudes Pendientes                                             │
│                                                                      │
│  🔄 Intercambio: María González ↔ Pedro Sánchez (15 Nov)          │
│     [Aprobar] [Rechazar] [Ver Detalles]                            │
│                                                                      │
│  📝 Postulación: Ana Torres → Turno Extra 20 Nov                   │
│     [Aprobar] [Rechazar] [Ver Detalles]                            │
│                                                                      │
│  🔗 Vinculación: Carlos Vega (PERS-2024-005678)                    │
│     [Ver Perfil] [Confirmar] [Rechazar]                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Páginas Secundarias

**1. Calendario** (`/chief/calendar`)

- [ ] Vista mensual/semanal
- Todos los turnos de su equipo
- [ ] Color-coded por tipo de turno
- Click para ver detalles o editar

**2. Mi Personal** (`/chief/staff`)

- [ ] Lista de personal vinculado
- Ver perfil, turnos, historial
- [ ] Desvincular

**3. Vincular Personal** (`/chief/staff/link`)

- [ ] Input para código de vinculación
- Preview del personal
- [ ] Confirmar vinculación

**4. Asignar Turnos** (`/chief/shifts/assign`)

- [ ] Formulario de asignación
- Seleccionar: Fecha, Tipo turno, Horario, Personal
- [ ] Validaciones en tiempo real:
  - [ ] ✅ Sin conflictos
  - [ ] ✅ Dentro de 48h semanales
  - [ ] ✅ Descanso de 12h
  - [ ] ⚠️ Warnings con opción de override

**5. Turnos Abiertos** (`/chief/shifts/open`)

- [ ] Crear turno sin asignar
- Ver postulaciones
- [ ] Seleccionar personal

**6. Aprobaciones** (`/chief/approvals`)

- [ ] Lista de intercambios pendientes
- Lista de postulaciones a turnos abiertos
- [ ] Aprobar/rechazar con razón

**7. Asistencia** (`/chief/attendance`)

- [ ] Lista de turnos del día
- Acreditar llegada manualmente
- [ ] Ver historial de asistencia

---

### 4️⃣ STAFF_HEALTH - Dashboard de Personal de Salud

**Rol:** Personal de salud (Doctor, Enfermero, Técnico, etc.)
**Acceso:** Sus propios turnos y datos
**Color de tema:** Ámbar/Naranja (#F59E0B)

#### Sidebar/Menú de Navegación

```
┌────────────────────────────┐
│  👨‍⚕️ María González         │
│  Enfermera - UCI           │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  📊 Dashboard              │ ← Activo
│  📅 Mi Calendario          │
│  🔄 Intercambios           │
│  📝 Turnos Disponibles     │
│  🔗 Mis Vinculaciones      │
│  👤 Mi Perfil              │
│  📋 Mi Historial           │
│                            │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│                            │
│  🌙 Dark Mode              │
│  🚪 Cerrar Sesión          │
└────────────────────────────┘
```

#### Dashboard Principal - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mi Dashboard - María González                   [Mes: Noviembre]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 📅 Turnos/Mes  │  │ ⏰ Horas/Mes   │  │ 💰 Estimado    │       │
│  │                │  │                │  │                │       │
│  │      18        │  │      156       │  │  $1,248,000    │       │
│  │                │  │                │  │                │       │
│  │  Este mes      │  │  de 192 máx    │  │  CLP           │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ 🏢 Organizac.  │  │ 🔄 Intercambios│  │ ⏳ Próx. Turno │       │
│  │                │  │                │  │                │       │
│  │       2        │  │       1        │  │  Mañana 08:00  │       │
│  │                │  │                │  │                │       │
│  │  Activas       │  │  Pendiente     │  │  Largo Día     │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Mi Código de Vinculación                                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PERS-2024-001234                                  [Copiar]   │  │
│  │                                                                │  │
│  │  Comparte este código con tu jefe para que te vincule        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Mis Próximos Turnos                              [Ver calendario →]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Fecha       Organización        Turno        Horario         │  │
│  │ ──────────────────────────────────────────────────────────── │  │
│  │ 18 Nov      Hospital Central    Largo Día    08:00-20:00    │  │
│  │ 19 Nov      Hospital Central    Noche        20:00-08:00    │  │
│  │ 20 Nov      Clínica Santa M.    Largo Día    08:00-20:00    │  │
│  │ 23 Nov      Hospital Central    Libre        ---             │  │
│  │ 24 Nov      Hospital Central    Libre        ---             │  │
│  │ 25 Nov 🎉   Hospital Central    Largo Día    08:00-20:00    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Notificaciones y Alertas                                           │
│                                                                      │
│  🔔 Turno asignado: 25 Nov - Largo Día (Hospital Central)         │
│  🔄 Intercambio aprobado: 28 Nov con Pedro Sánchez                 │
│  ⚠️  Conflicto detectado: 20 Nov tienes turnos en 2 organizaciones │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Dashboard Principal - Vista Mobile

```
┌──────────────────────┐
│  👨‍⚕️ María González   │
│  ▾ Hospital Central  │
├──────────────────────┤
│                      │
│  📅 Turnos Este Mes  │
│  ┌────────────────┐  │
│  │      18        │  │
│  │   turnos       │  │
│  └────────────────┘  │
│                      │
│  ⏰ Horas Trabajadas │
│  ┌────────────────┐  │
│  │   156h / 192h  │  │
│  │   █████░░░     │  │
│  └────────────────┘  │
│                      │
│  💰 Estimado Mes     │
│  ┌────────────────┐  │
│  │  $1,248,000    │  │
│  │    CLP         │  │
│  └────────────────┘  │
│                      │
│  ━━━━━━━━━━━━━━━━  │
│                      │
│  ⏳ Próximo Turno    │
│  ┌────────────────┐  │
│  │ 18 Nov - 08:00 │  │
│  │  Largo Día     │  │
│  │  Hospital C.   │  │
│  └────────────────┘  │
│                      │
│  ━━━━━━━━━━━━━━━━  │
│                      │
│  [Ver Calendario]    │
│  [Intercambios]      │
│  [Turnos Dispo.]     │
│                      │
└──────────────────────┘
```

#### Páginas Secundarias

**1. Mi Calendario** (`/staff/calendar`)

- [ ] Vista mensual de todos los turnos
- Filtrar por organización
- [ ] Color-coded por tipo de turno
- Badges para feriados

**2. Intercambios** (`/staff/exchanges`)

- [ ] Mis solicitudes enviadas
- Solicitudes recibidas
- [ ] Historial de intercambios
- Crear nueva solicitud

**3. Turnos Disponibles** (`/staff/shifts/open`)

- [ ] Lista de turnos abiertos en mis áreas
- Postular con mensaje
- [ ] Ver estado de mis postulaciones

**4. Mis Vinculaciones** (`/staff/linking`)

- [ ] Lista de organizaciones donde estoy vinculado
- Solicitudes pendientes de aprobar/rechazar
- [ ] Ver áreas asignadas

**5. Mi Perfil** (`/staff/profile`)

- [ ] Datos personales
- Código de vinculación
- [ ] RUT, email, teléfono
- Cambiar contraseña

**6. Mi Historial** (`/staff/history`)

- [ ] Historial de turnos trabajados
- Horas totales por mes
- [ ] Estimado de pagos (si hay tarifas configuradas)

---

## 📱 Adaptación Responsive

### Desktop (>1024px)

- [ ] Sidebar siempre visible
- Grid de 3 columnas para stats cards
- [ ] Tablas completas

### Tablet (768px - 1024px)

- [ ] Sidebar colapsable con botón hamburguesa
- Grid de 2 columnas para stats cards
- [ ] Tablas con scroll horizontal

### Mobile (<768px)

- [ ] Sidebar como overlay (se oculta al hacer clic fuera)
- Stats cards en 1 columna
- [ ] Tablas convertidas a cards verticales
- Botones flotantes para acciones rápidas

---

## 🎨 Convenciones de Color por Estado

**Estados de Turno:**

- [ ] 🟢 Verde: Presente/Activo/Completado
- 🟡 Amarillo: En progreso/Pendiente
- [ ] 🔴 Rojo: Ausente/Cancelado/Suspendido
- 🟣 Púrpura: Abierto (sin asignar)
- [ ] 🔵 Azul: Programado

**Prioridades:**

- [ ] 🔴 Alta: Rojo
- 🟡 Media: Amarillo
- [ ] 🟢 Baja: Verde

**Notificaciones:**

- [ ] ✅ Éxito: Verde
- ⚠️ Advertencia: Amarillo
- [ ] ❌ Error: Rojo
- 🔔 Info: Azul

---

**Esta especificación visual debe usarse como referencia al implementar las FASES 4-9 del plan.**

## 📂 ESTRUCTURA DE DIRECTORIOS

```
vita/
├── app/                                 # Next.js 16 App Router
│   ├── globals.css                      # Tailwind v4 + variables CSS
│   ├── layout.tsx                        # Layout root (Server Component)
│   ├── error.tsx                        # Error Boundary root
│   │
│   ├── [locale]/                        # Rutas localizadas (es, en)
│   │   ├── layout.tsx                    # Layout raíz con Providers
│   │   │
│   │   ├── (global)/                    # Páginas públicas globales
│   │   │   ├── layout.tsx               # Layout con Navbar + Footer
│   │   │   ├── page.tsx                 # Home / Landing
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Página de login
│   │   │   ├── register/
│   │   │   │   └── page.tsx             # Página de registro
│   │   │   ├── support/
│   │   │   │   └── page.tsx             # Soporte
│   │   │   └── contact/
│   │   │       └── page.tsx             # Contacto
│   │   │
│   │   ├── admin/                       # Dashboard SUPER_ADMIN
│   │   │   ├── layout.tsx               # Layout con Sidebar
│   │   │   ├── page.tsx                 # Dashboard admin (/admin)
│   │   │   ├── organizations/
│   │   │   │   ├── page.tsx             # Lista de organizaciones
│   │   │   │   ├── new/page.tsx         # Crear organización
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Ver detalles
│   │   │   │       └── edit/page.tsx     # Editar organización
│   │   │   ├── payments/page.tsx        # Registrar pagos
│   │   │   └── analytics/page.tsx       # Métricas globales
│   │   │
│   │   ├── hr/                          # Dashboard ADMIN_HR
│   │   │   ├── layout.tsx               # Layout con Sidebar
│   │   │   ├── page.tsx                 # Resumen HR (/hr)
│   │   │   ├── areas/page.tsx           # CRUD Áreas
│   │   │   ├── shift-types/page.tsx     # CRUD Tipos de Turno
│   │   │   ├── rates/page.tsx           # CRUD Tarifas
│   │   │   └── chiefs/page.tsx          # Gestionar jefes y límites
│   │   │
│   │   ├── chief/                       # Dashboard CHIEF_AREA
│   │   │   ├── layout.tsx               # Layout con Sidebar
│   │   │   ├── page.tsx                 # Resumen del equipo (/chief)
│   │   │   ├── calendar/page.tsx        # Calendario del equipo
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx             # Lista de personal
│   │   │   │   └── link/page.tsx        # Vincular personal
│   │   │   ├── shifts/
│   │   │   │   ├── page.tsx             # Lista de turnos
│   │   │   │   ├── assign/page.tsx      # Asignar turnos
│   │   │   │   └── open/page.tsx        # Crear turnos abiertos
│   │   │   ├── attendance/page.tsx      # Acreditar asistencia
│   │   │   └── approvals/page.tsx       # Aprobar intercambios/postulaciones
│   │   │
│   │   └── staff/                       # Dashboard STAFF_HEALTH
│   │       ├── layout.tsx               # Layout con Sidebar
│   │       ├── page.tsx                 # Resumen personal (/staff)
│   │       ├── calendar/page.tsx        # Calendario unificado
│   │       ├── shifts/
│   │       │   ├── open/page.tsx        # Postular a turnos abiertos
│   │       │   └── exchanges/page.tsx    # Solicitar intercambios
│   │       ├── linking/page.tsx         # Aprobar vinculaciones
│   │       └── profile/page.tsx         # Perfil y configuración
│   │
│   └── api/                             # API Routes (solo webhooks)
│       ├── auth/[...nextauth]/route.ts  # Auth.js v5 handler
│       └── webhooks/
│           └── biometric/route.ts      # Webhook para sistemas biométricos (MVP2)
│
├── actions/                             # Server Actions (patrón principal)
│   ├── auth/
│   │   └── auth-actions.ts              # register, login, logout
│   ├── organizations/
│   │   ├── organization-actions.ts      # CRUD organizaciones
│   │   ├── suspension-actions.ts        # Suspender/reactivar
│   │   └── payment-actions.ts           # Registrar pagos
│   ├── users/
│   │   ├── user-actions.ts              # CRUD usuarios
│   │   └── linking-actions.ts           # Vinculación de personal
│   ├── areas/
│   │   └── area-actions.ts              # CRUD áreas
│   ├── shifts/
│   │   ├── shift-actions.ts             # CRUD turnos
│   │   ├── assign-actions.ts            # Asignar turnos
│   │   └── validation-actions.ts        # Validaciones legales
│   ├── shift-types/
│   │   └── shift-type-actions.ts        # CRUD tipos de turno
│   ├── exchanges/
│   │   └── exchange-actions.ts          # Solicitar/aprobar intercambios
│   ├── rates/
│   │   └── rate-actions.ts              # CRUD tarifas
│   ├── attendance/
│   │   └── attendance-actions.ts        # Check-in/check-out
│   └── analytics/
│       └── analytics-actions.ts         # Métricas y reportes
│
├── components/                          # Componentes React
│   ├── auth/
│   │   ├── login-form.tsx               # Formulario login (Client Component)
│   │   └── register-form.tsx            # Formulario registro (Client Component)
│   │
│   ├── calendar/
│   │   ├── calendar-month.tsx           # Vista mensual (Client Component)
│   │   ├── calendar-week.tsx            # Vista semanal (Client Component)
│   │   ├── shift-card.tsx               # Tarjeta de turno (Server Component)
│   │   └── holiday-badge.tsx            # Badge de feriado (Server Component)
│   │
│   ├── dashboard/
│   │   ├── sidebar.tsx                  # Sidebar (Client Component - interactivo)
│   │   ├── header.tsx                   # Header (Server Component)
│   │   ├── navbar.tsx                   # Navbar (Server Component)
│   │   ├── footer.tsx                   # Footer (Server Component)
│   │   └── stats-card.tsx               # Tarjeta de estadísticas (Server Component)
│   │
│   ├── shifts/
│   │   ├── shift-form.tsx               # Formulario crear/editar turno
│   │   ├── shift-table.tsx              # Tabla de turnos
│   │   └── shift-dialog.tsx             # Dialog de detalles
│   │
│   ├── staff/
│   │   ├── staff-table.tsx              # Tabla de personal
│   │   ├── link-dialog.tsx              # Dialog vincular personal
│   │   └── staff-card.tsx               # Tarjeta de personal
│   │
│   ├── exchanges/
│   │   ├── exchange-request-form.tsx    # Formulario solicitar intercambio
│   │   ├── exchange-list.tsx            # Lista de intercambios
│   │   └── exchange-approval.tsx        # Aprobar/rechazar
│   │
│   ├── attendance/
│   │   ├── attendance-table.tsx         # Tabla de asistencia
│   │   └── check-in-dialog.tsx          # Dialog acreditar asistencia
│   │
│   ├── organizations/
│   │   ├── organization-form.tsx        # Formulario crear/editar org
│   │   ├── organization-table.tsx       # Tabla de organizaciones
│   │   ├── suspend-dialog.tsx           # Dialog suspender org
│   │   ├── payment-form.tsx             # Formulario registrar pago
│   │   └── payment-history-table.tsx    # Historial de pagos
│   │
│   ├── error/
│   │   └── error-fallback.tsx           # Componente de error genérico
│   │
│   ├── providers/
│   │   ├── theme-provider.tsx           # Provider de tema (Client Component)
│   │   └── session-provider.tsx         # Provider de sesión (Client Component - si se usa)
│   │
│   └── ui/                              # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       └── ...
│
├── lib/                                 # Librerías y utilidades
│   ├── auth/
│   │   ├── config.ts                    # Configuración Auth.js v5
│   │   ├── index.ts                     # Exports de auth (handlers, signIn, signOut)
│   │   └── session.ts                   # Helpers de sesión y RBAC
│   │
│   ├── db/
│   │   └── prisma.ts                    # Cliente Prisma singleton
│   │
│   ├── validations/
│   │   ├── auth.ts                      # Schemas Zod para auth
│   │   ├── organization.ts              # Schemas Zod para organizaciones
│   │   ├── shift.ts                     # Schemas Zod para turnos
│   │   ├── rate.ts                      # Schemas Zod para tarifas
│   │   └── rut.ts                       # Validación RUT chileno
│   │
│   ├── holidays/
│   │   └── chile.ts                     # Lógica de feriados chilenos
│   │
│   ├── capacitor/                       # Capacitor plugins (MVP2)
│   │   ├── index.ts                     # Helpers de detección
│   │   ├── push.ts                      # Push notifications
│   │   ├── geolocation.ts               # Geolocalización
│   │   └── scanner.ts                   # Scanner QR
│   │
│   └── utils.ts                         # Utilidades generales (cn, formatters, etc.)
│
├── hooks/                               # Custom React Hooks (Client Components)
│   ├── use-sidebar.ts                   # Hook para controlar sidebar (Zustand)
│   ├── use-calendar.ts                  # Hook para lógica de calendario
│   └── use-debounce.ts                  # Hook para debounce
│
├── types/                               # Tipos TypeScript compartidos
│   ├── auth.ts                          # Tipos de autenticación
│   ├── database.ts                      # Tipos generados por Prisma
│   └── calendar.ts                      # Tipos para calendario
│
├── store/                               # Zustand stores (solo UI local)
│   └── sidebar-store.ts                 # Estado del sidebar
│
├── prisma/
│   ├── schema.prisma                    # Schema de Prisma (un solo archivo)
│   ├── seed.ts                          # Script de seed (feriados chilenos)
│   └── migrations/                      # Migraciones generadas
│
├── proxy.ts                             # Next.js 16 Proxy (antes middleware.ts)
├── next.config.ts                       # Configuración Next.js 16
├── tailwind.config.ts                   # Configuración Tailwind v4
├── tsconfig.json                        # Configuración TypeScript
├── .env.local                           # Variables de entorno (no en Git)
├── .env.example                         # Template de variables de entorno
└── package.json                         # Dependencias
```

---

## 📐 GUÍAS DE DESARROLLO

### Cómo Programar Componentes React en VITA

#### 1. Server Components vs Client Components

**Regla de Oro:** Todo es Server Component por defecto, usa Client Component solo cuando sea necesario.

**Usa Server Component cuando:**

- [ ] No necesitas interactividad (botones con `onClick`, inputs, etc.)
- No necesitas hooks de React (`useState`, `useEffect`, etc.)
- [ ] No necesitas acceso al navegador (`window`, `localStorage`, etc.)
- Puedes hacer fetch de datos directamente

**Ejemplo de Server Component:**

```typescript
// components/dashboard/stats-card.tsx
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-lg border p-6">
      <div className="rounded-full bg-primary/10 p-3">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </article>
  )
}
```

**Usa Client Component cuando:**

- [ ] Necesitas `useState`, `useEffect`, `useRef`
- Necesitas event handlers (`onClick`, `onChange`, etc.)
- [ ] Necesitas acceso a APIs del navegador
- Usas librerías que requieren el cliente (ej: Zustand, react-hook-form)

**Ejemplo de Client Component:**

```typescript
// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/auth/auth-actions'
import { toast } from 'sonner'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result.success) {
      toast.success('¡Bienvenido!')
      router.push('/staff/calendar')
    } else {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... campos del formulario ... */}
    </form>
  )
}
```

---

#### 2. Server Actions: Patrón Principal

**¿Qué son?** Funciones que se ejecutan en el servidor pero se pueden llamar desde el cliente.

**Ventajas:**

- [ ] No necesitas crear API Routes
- Type-safe (TypeScript end-to-end)
- [ ] Automáticamente POST requests
- Revalidación de caché automática

**Estructura de un Server Action:**

```typescript
// actions/shifts/shift-actions.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

const createShiftSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  shiftTypeId: z.string(),
  assignedUserId: z.string(),
  areaId: z.string(),
})

export async function createShiftAction(formData: FormData) {
  try {
    const session = await requireAuth()
    
    const rawData = {
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      shiftTypeId: formData.get('shiftTypeId') as string,
      assignedUserId: formData.get('assignedUserId') as string,
      areaId: formData.get('areaId') as string,
    }

    const validation = createShiftSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const { data } = validation

    const shift = await prisma.shift.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'SCHEDULED',
        assignmentType: 'MANUAL',
        shiftTypeId: data.shiftTypeId,
        assignedUserId: data.assignedUserId,
        areaId: data.areaId,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath('/chief/calendar')

    return {
      success: true,
      data: shift,
    }
  } catch (error) {
    console.error('Error creating shift:', error)
    return {
      success: false,
      error: 'Error al crear el turno',
    }
  }
}
```

**Pasos clave:**

1. `'use server'` al inicio del archivo
2. Validar con Zod
3. Verificar autenticación/autorización
4. Ejecutar lógica de negocio
5. Revalidar caché con `revalidatePath()` si es necesario
6. Retornar `{ success, data, error }`

---

#### 3. Patrones de Diseño

**Patrón: Server Component fetches → pasa props a Client Component**

```typescript
// app/(dashboard)/chief/calendar/page.tsx (Server Component)
import { getShiftsAction } from '@/actions/shifts/shift-actions'
import { CalendarClient } from '@/components/calendar/calendar-client'

export default async function ChiefCalendarPage() {
  const result = await getShiftsAction()

  if (!result.success) {
    return <div>Error al cargar turnos</div>
  }

  return (
    <main className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Calendario del Equipo</h1>
      <CalendarClient initialShifts={result.data} />
    </main>
  )
}
```

```typescript
// components/calendar/calendar-client.tsx (Client Component)
'use client'

import { useState } from 'react'

interface CalendarClientProps {
  initialShifts: Shift[]
}

export function CalendarClient({ initialShifts }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div>
      {/* Lógica interactiva del calendario */}
    </div>
  )
}
```

---

#### 4. Naming Conventions

**Componentes:**

- [ ] PascalCase: `StatsCard`, `LoginForm`
- Archivo: `stats-card.tsx`, `login-form.tsx`

**Server Actions:**

- [ ] camelCase con sufijo `Action`: `createShiftAction`, `loginAction`
- Archivo: `shift-actions.ts`, `auth-actions.ts`

**Hooks:**

- [ ] camelCase con prefijo `use`: `useCalendar`, `useSidebar`
- Archivo: `use-calendar.ts`, `use-sidebar.ts`

**Event Handlers:**

- [ ] camelCase con prefijo `handle`: `handleSubmit`, `handleClick`, `handleKeyDown`

---

#### 5. Accesibilidad

**Siempre incluir:**

- [ ] `aria-label` en botones sin texto
- `tabIndex={0}` en elementos interactivos no nativos
- [ ] `role` en elementos personalizados
- Manejar `onKeyDown` además de `onClick`

**Ejemplo:**

```typescript
<button
  type="button"
  onClick={handleOpenDialog}
  onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog()}
  aria-label="Abrir diálogo de crear turno"
  className="rounded-lg p-2 hover:bg-accent"
>
  <PlusIcon className="h-5 w-5" />
</button>
```

---

#### 6. Manejo de Errores

**Error Boundaries por sección:**

```typescript
// app/(dashboard)/error.tsx
'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || 'Error inesperado'}
      </p>
      <button onClick={reset} className="btn-primary">
        Intentar de nuevo
      </button>
    </div>
  )
}
```

---

#### 7. Estilos con Tailwind

**Siempre usa Tailwind, nunca CSS inline o archivos `.css` separados (excepto `globals.css`).**

**Utilidades personalizadas:**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
```

**Uso:**

```typescript
<div className={cn(
  "rounded-lg border p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Contenido
</div>
```

---

#### 8. Sin Comentarios Innecesarios

**❌ Mal:**

```typescript
// Función que crea un turno
export async function createShiftAction(formData: FormData) {
  // Validamos los datos
  const validation = createShiftSchema.safeParse(rawData)
  // Si falla la validación, retornamos error
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }
  // ...
}
```

**✅ Bien:**

```typescript
export async function createShiftAction(formData: FormData) {
  const validation = createShiftSchema.safeParse(rawData)
  
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const shift = await prisma.shift.create({
    /* ... */
  })

  revalidatePath('/chief/calendar')

  return { success: true, data: shift }
}
```

El código es auto-explicativo con nombres descriptivos y estructura clara.

---

## 🏛️ ARQUITECTURA DE CÓDIGO Y MEJORES PRÁCTICAS

### Principios Fundamentales

#### 1. SOLID Principles

**S - Single Responsibility (Responsabilidad Única)**

Cada función, componente o módulo debe hacer UNA sola cosa.

❌ **Mal:**

```typescript
// Un componente que hace demasiado
export function UserDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Fetch users
  useEffect(() => { /* ... */ }, [])
  
  // Handle delete
  const handleDelete = async (id: string) => { /* ... */ }
  
  // Handle edit
  const handleEdit = async (id: string) => { /* ... */ }
  
  // Render table, modals, forms, etc.
  return (
    <div>
      {/* 500 líneas de JSX */}
    </div>
  )
}
```

✅ **Bien:**

```typescript
// components/users/user-dashboard.tsx (Server Component)
import { getUsersAction } from '@/actions/users/user-actions'
import { UserTable } from './user-table'

export async function UserDashboard() {
  const result = await getUsersAction()
  
  if (!result.success) {
    return <ErrorState message={result.error} />
  }
  
  return <UserTable users={result.data} />
}

// components/users/user-table.tsx (Client Component)
'use client'

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="space-y-4">
      <UserTableHeader />
      <UserTableBody users={users} />
    </div>
  )
}

// components/users/user-table-row.tsx
interface UserTableRowProps {
  user: User
}

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <UserTableActions userId={user.id} />
      </td>
    </tr>
  )
}
```

---

**O - Open/Closed (Abierto/Cerrado)**

Abierto para extensión, cerrado para modificación.

✅ **Ejemplo: Variantes de Button con CVA**

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Uso: Fácil de extender sin modificar el componente
<Button variant="destructive" size="sm">Eliminar</Button>
```

---

**L - Liskov Substitution (Sustitución de Liskov)**

Los componentes derivados deben poder sustituir a los base.

✅ **Ejemplo: Interfaces consistentes**

```typescript
// types/form-field.ts
interface BaseFieldProps {
  name: string
  label: string
  error?: string
  required?: boolean
}

// components/form/text-field.tsx
interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password'
  placeholder?: string
}

export function TextField({ name, label, error, required, ...props }: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={name} name={name} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  )
}

// components/form/select-field.tsx
interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string; label: string }>
}

export function SelectField({ name, label, error, required, options }: SelectFieldProps) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Select name={name}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  )
}

// Uso: Ambos componentes son intercambiables en un formulario
```

---

**I - Interface Segregation (Segregación de Interfaces)**

Interfaces específicas mejor que una genérica grande.

❌ **Mal:**

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
  rut: string
  globalRole: string
  organizationMembers: OrganizationMember[]
  shifts: Shift[]
  createdAt: Date
  updatedAt: Date
}

// Componente que solo necesita nombre y email
function UserGreeting({ user }: { user: User }) {
  return <p>Hola, {user.name}</p>
}
```

✅ **Bien:**

```typescript
// types/user.ts
interface UserBase {
  id: string
  name: string
  email: string
}

interface UserWithAuth extends UserBase {
  rut: string
  globalRole: string
}

interface UserWithRelations extends UserBase {
  organizationMembers: OrganizationMember[]
  shifts: Shift[]
}

interface UserComplete extends UserWithAuth, UserWithRelations {
  createdAt: Date
  updatedAt: Date
}

// Componente usa solo lo que necesita
function UserGreeting({ user }: { user: UserBase }) {
  return <p>Hola, {user.name}</p>
}
```

---

**D - Dependency Inversion (Inversión de Dependencias)**

Depende de abstracciones, no de implementaciones concretas.

✅ **Ejemplo: Servicios abstractos**

```typescript
// lib/logger/types.ts
interface Logger {
  info(message: string, meta?: Record<string, unknown>): void
  error(message: string, error?: Error): void
  warn(message: string, meta?: Record<string, unknown>): void
}

// lib/logger/pino-logger.ts
import pino from 'pino'

export class PinoLogger implements Logger {
  private logger = pino()

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(meta, message)
  }

  error(message: string, error?: Error) {
    this.logger.error({ err: error }, message)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(meta, message)
  }
}

// lib/logger/console-logger.ts (para desarrollo)
export class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, unknown>) {
    console.log('[INFO]', message, meta)
  }

  error(message: string, error?: Error) {
    console.error('[ERROR]', message, error)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn('[WARN]', message, meta)
  }
}

// lib/logger/index.ts
const logger: Logger =
  process.env.NODE_ENV === 'production' ? new PinoLogger() : new ConsoleLogger()

export { logger }

// Uso: No depende de la implementación concreta
import { logger } from '@/lib/logger'

logger.info('Usuario creado', { userId: '123' })
```

---

### 2. Atomic Design Pattern

**Átomos → Moléculas → Organismos → Templates → Páginas**

#### Átomos (components/ui/)

Componentes más pequeños, no divisibles.

```typescript
// components/ui/button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}

// components/ui/input.tsx
export function Input({ ...props }: InputProps) {
  return <input {...props} />
}

// components/ui/label.tsx
export function Label({ children, ...props }: LabelProps) {
  return <label {...props}>{children}</label>
}

// components/ui/badge.tsx
export function Badge({ children, variant }: BadgeProps) {
  return <span className={badgeVariants({ variant })}>{children}</span>
}
```

---

#### Moléculas (components/form/, components/common/)

Combinación de átomos que forman una unidad funcional.

```typescript
// components/form/form-field.tsx
interface FormFieldProps {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, name, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// Uso:
<FormField label="Email" name="email" error={errors.email}>
  <Input type="email" name="email" />
</FormField>
```

```typescript
// components/common/status-badge.tsx
interface StatusBadgeProps {
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    ACTIVE: { label: 'Activo', variant: 'success' as const },
    PENDING: { label: 'Pendiente', variant: 'warning' as const },
    SUSPENDED: { label: 'Suspendido', variant: 'destructive' as const },
  }

  const { label, variant } = config[status]

  return <Badge variant={variant}>{label}</Badge>
}
```

---

#### Organismos (components/shifts/, components/staff/, etc.)

Secciones complejas de la interfaz.

```typescript
// components/shifts/shift-card.tsx
interface ShiftCardProps {
  shift: Shift
  onEdit?: (shiftId: string) => void
  onDelete?: (shiftId: string) => void
}

export function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  return (
    <Card>
      <CardHeader>
        <ShiftCardTitle shift={shift} />
        <ShiftCardBadges shift={shift} />
      </CardHeader>
      <CardContent>
        <ShiftCardDetails shift={shift} />
      </CardContent>
      <CardFooter>
        <ShiftCardActions
          shiftId={shift.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardFooter>
    </Card>
  )
}
```

---

#### Templates (app/(dashboard)/layout.tsx)

Estructuras de página reutilizables.

```typescript
// components/layouts/dashboard-layout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  header: React.ReactNode
}

export function DashboardLayout({ children, sidebar, header }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r">{sidebar}</aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b">{header}</header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

---

#### Páginas (app/\*\*/page.tsx)

Instancias específicas de templates con datos reales.

```typescript
// app/(dashboard)/chief/calendar/page.tsx
import { getShiftsAction } from '@/actions/shifts/shift-actions'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function ChiefCalendarPage() {
  const result = await getShiftsAction()

  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  return <CalendarView shifts={result.data} />
}
```

---

### 3. Composición sobre Herencia

**Usa composición para compartir funcionalidad.**

✅ **Ejemplo: Render Props Pattern**

```typescript
// components/common/data-loader.tsx
interface DataLoaderProps<T> {
  loadData: () => Promise<{ success: boolean; data?: T; error?: string }>
  children: (data: T) => React.ReactNode
  loadingFallback?: React.ReactNode
  errorFallback?: (error: string) => React.ReactNode
}

export async function DataLoader<T>({
  loadData,
  children,
  loadingFallback = <LoadingSpinner />,
  errorFallback = (error) => <ErrorState message={error} />,
}: DataLoaderProps<T>) {
  const result = await loadData()

  if (!result.success) {
    return errorFallback(result.error!)
  }

  return children(result.data!)
}

// Uso:
<DataLoader loadData={getShiftsAction}>
  {(shifts) => <ShiftList shifts={shifts} />}
</DataLoader>
```

---

### 4. Custom Hooks para Lógica Reutilizable

**Extrae lógica repetitiva en hooks personalizados.**

```typescript
// hooks/use-form-validation.ts
import { useState } from 'react'
import { z } from 'zod'

export const useFormValidation = <T extends z.ZodType>(schema: T) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: unknown) => {
    const result = schema.safeParse(data)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  const clearErrors = () => setErrors({})

  return { errors, validate, clearErrors }
}

// Uso:
const { errors, validate } = useFormValidation(loginSchema)

const handleSubmit = (data: unknown) => {
  if (!validate(data)) {
    return
  }
  // Continuar con el submit
}
```

---

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Uso:
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearch) {
    // Hacer búsqueda
  }
}, [debouncedSearch])
```

---

```typescript
// hooks/use-async-action.ts
import { useState } from 'react'
import { toast } from 'sonner'

interface UseAsyncActionOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
}

export const useAsyncAction = <T extends unknown[], R>(
  action: (...args: T) => Promise<{ success: boolean; data?: R; error?: string }>,
  options: UseAsyncActionOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false)

  const execute = async (...args: T) => {
    setIsLoading(true)

    try {
      const result = await action(...args)

      if (result.success) {
        if (options.successMessage) {
          toast.success(options.successMessage)
        }
        if (options.onSuccess) {
          options.onSuccess()
        }
        return result.data
      } else {
        toast.error(result.error || options.errorMessage || 'Error desconocido')
        return null
      }
    } catch (error) {
      toast.error('Error inesperado')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { execute, isLoading }
}

// Uso:
const { execute: deleteShift, isLoading } = useAsyncAction(deleteShiftAction, {
    successMessage: 'Turno eliminado',
    errorMessage: 'No se pudo eliminar el turno',
    onSuccess: () => router.refresh(),
})
```

---

### 5. Utilidades y Helpers

**Agrupa funciones utilitarias en módulos específicos.**

```typescript
// lib/utils/date.ts
export const formatDate = (date: Date, locale: string = 'es-CL'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const getWeekDays = (date: Date): Date[] => {
  const week: Date[] = []
  const currentDay = date.getDay()
  const firstDay = new Date(date)
  firstDay.setDate(date.getDate() - currentDay + 1)

  for (let i = 0; i < 7; i++) {
    week.push(addDays(firstDay, i))
  }

  return week
}
```

---

```typescript
// lib/utils/currency.ts
export const formatCurrency = (amount: number, currency: 'CLP' | 'USD' = 'CLP'): string => {
  const locale = currency === 'CLP' ? 'es-CL' : 'en-US'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Uso:
formatCurrency(50000, 'CLP') // "$50.000"
formatCurrency(50, 'USD') // "$50.00"
```

---

```typescript
// lib/utils/array.ts
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (acc, item) => {
    const groupKey = String(item[key])
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
    },
    {} as Record<string, T[]>
  )
}

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set()
  return array.filter((item) => {
    const keyValue = item[key]
    if (seen.has(keyValue)) {
      return false
    }
    seen.add(keyValue)
    return true
  })
}

// Uso:
const shiftsByDate = groupBy(shifts, 'date')
const uniqueUsers = uniqueBy(users, 'email')
```

---

### 6. Constantes y Configuración

**Centraliza valores mágicos y configuración.**

```typescript
// lib/constants/roles.ts
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_HR: 'ADMIN_HR',
  CHIEF_AREA: 'CHIEF_AREA',
  STAFF_HEALTH: 'STAFF_HEALTH',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN_HR: 'Recursos Humanos',
  CHIEF_AREA: 'Jefe de Área',
  STAFF_HEALTH: 'Personal de Salud',
}

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN_HR: ['areas:*', 'shift-types:*', 'rates:*', 'chiefs:manage'],
  CHIEF_AREA: ['staff:link', 'shifts:*', 'exchanges:approve'],
  STAFF_HEALTH: ['shifts:view', 'exchanges:request'],
} as const
```

---

```typescript
// lib/constants/shifts.ts
export const SHIFT_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type ShiftStatus = (typeof SHIFT_STATUSES)[keyof typeof SHIFT_STATUSES]

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export const SHIFT_STATUS_COLORS: Record<ShiftStatus, string> = {
  SCHEDULED: 'hsl(var(--status-scheduled))',
  IN_PROGRESS: 'hsl(var(--status-in-progress))',
  COMPLETED: 'hsl(var(--status-completed))',
  CANCELLED: 'hsl(var(--status-cancelled))',
}
```

---

```typescript
// lib/constants/validation.ts
export const VALIDATION_LIMITS = {
  MAX_WEEKLY_HOURS: 48,
  MIN_REST_HOURS: 12,
  MAX_STAFF_NAME_LENGTH: 100,
  MAX_ORGANIZATION_NAME_LENGTH: 200,
  MAX_SHIFT_DURATION_HOURS: 24,
} as const

export const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/
```

---

### 7. Tipos TypeScript Compartidos

**Define tipos reutilizables y específicos.**

```typescript
// types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
}
```

---

```typescript
// types/forms.ts
export interface FormState {
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
}

export type FormMode = 'create' | 'edit' | 'view'
```

---

```typescript
// types/calendar.ts
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  metadata?: Record<string, unknown>
}

export type CalendarView = 'month' | 'week' | 'day'
```

---

### 8. Archivos Pequeños y Enfocados

**Límite sugerido: ~100-150 líneas por archivo.**

❌ **Mal: Archivo gigante**

```
components/shifts/shift-management.tsx (800 líneas)
├── ShiftList
├── ShiftCard
├── ShiftForm
├── ShiftDialog
├── ShiftFilters
└── ShiftActions
```

✅ **Bien: Archivos pequeños y enfocados**

```
components/shifts/
├── shift-list.tsx (60 líneas)
├── shift-card.tsx (40 líneas)
├── shift-form.tsx (80 líneas)
├── shift-dialog.tsx (50 líneas)
├── shift-filters.tsx (70 líneas)
├── shift-actions.tsx (45 líneas)
└── index.ts (exports)
```

---

### 9. Barrel Exports

**Facilita imports con archivos index.ts.**

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Label } from './label'
export { Card, CardHeader, CardContent, CardFooter } from './card'
export { Dialog, DialogTrigger, DialogContent } from './dialog'
export { Badge } from './badge'

// Uso:
import { Button, Card, Badge } from '@/components/ui'
```

---

```typescript
// lib/utils/index.ts
export * from './date'
export * from './currency'
export * from './array'
export * from './string'
export { cn } from './cn'
```

---

### 10. Documentación en Código

**JSDoc para funciones complejas o utilidades públicas.**

````typescript
/**
 * Valida si un RUT chileno es válido.
 * 
 * @param rut - RUT en formato 12.345.678-9 o 12345678-9
 * @returns true si el RUT es válido, false en caso contrario
 * 
 * @example
 * ```typescript
 * validateRut('12.345.678-9') // true
 * validateRut('12.345.678-0') // false
 * ```
 */
export const validateRut = (rut: string): boolean => {
  const cleanRut = cleanRutFormat(rut)
  const [body, verifier] = cleanRut.split('-')
  
  const calculatedVerifier = calculateVerifier(body)
  
  return verifier.toUpperCase() === calculatedVerifier.toUpperCase()
}
````

---

### Estructura de Archivos Ideal

```
components/shifts/
├── index.ts                    # Barrel exports
├── shift-list.tsx              # 60 líneas - Lista principal
├── shift-card.tsx              # 40 líneas - Tarjeta individual
├── shift-card-header.tsx       # 25 líneas - Header de tarjeta
├── shift-card-body.tsx         # 30 líneas - Body de tarjeta
├── shift-card-actions.tsx      # 35 líneas - Acciones
├── shift-form.tsx              # 80 líneas - Formulario
├── shift-dialog.tsx            # 50 líneas - Modal
├── shift-filters.tsx           # 70 líneas - Filtros
└── types.ts                    # 30 líneas - Tipos específicos
```

---

## 📋 PLAN DE DESARROLLO PASO A PASO

**Filosofía:** Desarrollo incremental orientado a valor. Empezamos con Marketing y Core Features, dejando features administrativas para el final.

**Orden estratégico:** Landing Page → Core (Turnos + Calendario) → Vinculación → Validaciones → Dashboards Admin

### 🔌 MCP Servers Conectados

**IMPORTANTE:** Este proyecto usa **Model Context Protocol (MCP)** para acceder a documentación actualizada:

- **shadcn MCP Server:** Documentación oficial de shadcn/ui con componentes, estilos y dark mode
- **Supabase MCP Server:** Documentación de Supabase para PostgreSQL y Prisma

**Instrucción para la IA:** Cuando veas "Consultar MCP server de shadcn" o similar en un TODO, debes usar el MCP server correspondiente para obtener la información más actualizada antes de implementar.

---

### 📊 FASE 0: Investigación Competitiva (1 semana)

**Objetivo:** Validar mercado y entender competencia (Rflex) ANTES de desarrollar.

**Duración:** 1 semana (investigación, no desarrollo)

**Por qué primero:** Necesitamos datos reales de Rflex para la landing page y para definir propuesta de valor.

#### TODO 0.1: Entrevista a Usuarios de Rflex

- [ ] Preparar guion de preguntas (10-15 preguntas)
- Entrevistar a novia (usuaria activa de Rflex)
- Preguntas clave:
  - ¿Qué te gusta de Rflex?
  - ¿Qué 3 cosas odias de Rflex?
  - ¿Lo usas en celular o desktop?
  - ¿Cuántas veces al día lo abres?
  - ¿Qué feature te gustaría que tuviera?
  - ¿Cómo es el calendario visual?
  - ¿Tiene validaciones legales automáticas?
- **Resultado:** Lista de pain points validados

#### TODO 0.2: Análisis Técnico de Rflex

- [ ] Si es posible, obtener screenshots de Rflex
- Analizar calendario visual
- Ver si tiene app móvil nativa
- Identificar gaps de features
- Pricing aproximado
- **Resultado:** Tabla comparativa actualizada

#### TODO 0.3: Entrevista al Hospital del Director

- [ ] Contactar jefe de Kinesiología (área sin Rflex)
- Preguntas:
  - ¿Por qué Kinesiología NO usa Rflex?
  - ¿Cómo gestionan turnos actualmente? (Excel/papel)
  - ¿Cuáles son los 3 mayores problemas?
  - ¿Cuántas personas son en el equipo?
  - ¿Estarían dispuestos a piloto gratis de VITA?
- **Resultado:** Validación de necesidad + compromiso de piloto

#### TODO 0.4: Documentar Findings

- [ ] Actualizar sección "Análisis Competitivo" del plan
- Llenar tabla comparativa Rflex vs VITA con datos reales
- Ajustar pricing en base a lo que cobra Rflex
- Preparar argumentos de venta basados en pain points reales
- **Resultado:** Plan actualizado con datos validados

**✅ Checkpoint FASE 0:**

- Tienes usuarios reales dispuestos a piloto
- Conoces pain points específicos de Rflex
- Tienes argumentos de venta claros basados en evidencia
- Pricing validado vs competencia
- Compromiso de piloto con hospital

---

### 🎨 FASE 1: Landing Page & Branding (Marketing First)

**Objetivo:** Crear la cara pública de VITA con componentes reutilizables.

**Dependencias a instalar:**

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
```

**Nota:** shadcn instalará automáticamente las dependencias que necesite (como `lucide-react` si los componentes usan iconos). NO instalar dependencias extra manualmente.

#### TODO 1.1: Configurar Tailwind v4 con paleta médica

- [ ] [ ] Editar `app/globals.css`
- [ ] Agregar variables CSS para colores médicos (azul, verde, ámbar)
- [ ] Configurar dark mode
- [ ] Agregar `cursor: pointer` para botones y links
- [ ] **Resultado:** Paleta de colores lista para usar

#### TODO 1.2: Instalar shadcn/ui y componentes base

- [ ] [ ] Ejecutar `npx shadcn@latest init`
- [ ] Instalar: `button`, `card`, `badge`
- [ ] Configurar `components.json`
- [ ] **Resultado:** Componentes UI listos

#### TODO 1.3: Crear componentes atómicos reutilizables

- [ ] [ ] `components/ui/button.tsx` - Botón con variantes
- [ ] `components/ui/badge.tsx` - Badge para estados
- [ ] `components/ui/card.tsx` - Tarjetas
- [ ] **Resultado:** Átomos listos para componer

#### TODO 1.4: Crear Navbar reutilizable

- [ ] [ ] `components/dashboard/navbar.tsx` (Server Component)
- [ ] Logo VITA (ícono médico)
- [ ] Links: Inicio, Características, Planes, Contacto
- [ ] Botón "Iniciar Sesión" (deshabilitado por ahora)
- [ ] Responsive con menú hamburguesa para mobile
- [ ] **Resultado:** Navbar funcional y responsive

#### TODO 1.5: Crear Footer reutilizable

- [ ] [ ] `components/dashboard/footer.tsx` (Server Component)
- [ ] 3 columnas: Producto, Legal, Redes Sociales
- [ ] Links a páginas legales (crearemos después)
- [ ] Copyright dinámico con año actual
- [ ] **Resultado:** Footer completo

#### TODO 1.6: Landing Page - Hero Section

- [ ] [ ] `app/page.tsx` (Server Component)
- [ ] Título: "Gestiona turnos médicos con VITA"
- [ ] Subtítulo: Descripción breve del problema que resuelve
- [ ] CTA: "Solicitar Demo" (deshabilitado por ahora)
- [ ] Imagen o ilustración médica (placeholder por ahora)
- [ ] **Resultado:** Hero section atractivo

#### TODO 1.7: Landing Page - Sección de Características

- [ ] [ ] Grid de 3 características principales:
  - [ ] 📅 Calendario Inteligente
  - [ ] 👥 Multi-organización
  - [ ] ✅ Validaciones Legales
- [ ] Cada una con ícono, título y descripción
- [ ] **Resultado:** Características visibles

#### TODO 1.8: Landing Page - Sección de Planes

- [ ] [ ] 3 tarjetas de pricing:
  - [ ] BASIC: 50 cuentas
  - [ ] PRO: 200 cuentas
  - [ ] ENTERPRISE: Custom
- [ ] Mostrar precio, features incluidas
- [ ] Botón "Contactar Ventas" (placeholder)
- [ ] **Resultado:** Pricing claro

#### TODO 1.9: Crear páginas legales con contenido dummy

- [ ] [ ] `app/(legal)/terminos/page.tsx` - Términos y Condiciones
- [ ] `app/(legal)/privacidad/page.tsx` - Política de Privacidad
- [ ] Usar Lorem Ipsum estructurado con headings
- [ ] Layout simple con navbar y footer
- [ ] **Resultado:** Páginas legales funcionales

#### TODO 1.10: Implementar Dark Mode con next-themes

- [ ] **IMPORTANTE:** shadcn/ui NO tiene dark mode nativo. Requiere `next-themes`.
- [ ] Instalar: `npm install next-themes`
- [ ] Seguir documentación oficial de shadcn: https://ui.shadcn.com/docs/dark-mode
- [ ] Crear `components/providers/theme-provider.tsx` con NextThemesProvider
- [ ] Agregar ThemeProvider al layout root
- [ ] Crear componente `theme-toggle.tsx` con switch luz/oscuro
- [ ] Agregar toggle al navbar
- [ ] Probar que todos los colores se ven bien en ambos modos
- [ ] **Resultado:** Dark mode funcional con next-themes

**✅ Checkpoint FASE 1:**

- `npm run dev` → Landing page completa y bonita
- Dark mode funciona
- Todas las páginas navegables
- Responsive en mobile/tablet/desktop

---

### 🗄️ FASE 2: Base de Datos y Configuración (Backend Setup)

**Objetivo:** Configurar Prisma, base de datos y modelos básicos.

**Dependencias a instalar:**

```bash
npm install prisma @prisma/client
npm install zod
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

#### TODO 2.1: Configurar Prisma con Supabase

- [ ] [ ] **IMPORTANTE:** Consultar MCP server de Supabase para configuración actualizada con Prisma
- [ ] `npx prisma init`
- [ ] Crear `.env.local` con template
- [ ] Configurar `DATABASE_URL` y `DIRECT_URL` según documentación de Supabase
- [ ] Agregar `.env.local` a `.gitignore`
- [ ] Crear `.env.example` con template
- [ ] **Resultado:** Prisma configurado correctamente con Supabase

#### TODO 2.2: Definir schema Prisma - Modelos de Usuario y Auth

- [ ] [ ] Modelo `User` completo
- [ ] Modelo `Account` (para Auth.js)
- [ ] Modelo `Session` (para Auth.js)
- [ ] Índices necesarios
- [ ] **Resultado:** Modelos de autenticación listos

#### TODO 2.3: Definir schema Prisma - Modelos de Organización

- [ ] [ ] Modelo `Organization`
- [ ] Modelo `OrganizationMember` (roles multi-tenant)
- [ ] Modelo `Area`
- [ ] Relaciones entre modelos
- [ ] **Resultado:** Multi-tenancy configurado

#### TODO 2.4: Definir schema Prisma - Modelos de Turnos

- [ ] [ ] Modelo `ShiftType`
- [ ] Modelo `Shift`
- [ ] Modelo `ShiftExchange`
- [ ] Enums para estados
- [ ] **Resultado:** Sistema de turnos modelado

#### TODO 2.5: Definir schema Prisma - Modelos Complementarios

- [ ] [ ] Modelo `StaffRate` (tarifas)
- [ ] Modelo `Holiday` (feriados chilenos)
- [ ] Modelo `Payment` (pagos de organizaciones)
- [ ] Modelo `Attendance` (asistencia)
- [ ] **Resultado:** Schema completo

#### TODO 2.6: Ejecutar primera migración

- [ ] [ ] `npx prisma migrate dev --name init`
- [ ] Verificar que se crea la BD en Supabase
- [ ] `npx prisma generate` para generar cliente
- [ ] **Resultado:** Base de datos creada

#### TODO 2.7: Crear cliente Prisma singleton

- [ ] [ ] `lib/db/prisma.ts`
- [ ] Singleton pattern para desarrollo y producción
- [ ] **Resultado:** Cliente Prisma listo para usar

#### TODO 2.8: Seed - Feriados chilenos 2024-2025

- [ ] [ ] `prisma/seed.ts`
- [ ] Feriados normales e irrenunciables
- [ ] Script de upsert
- [ ] Agregar script en `package.json`
- [ ] `npm run prisma:seed`
- [ ] **Resultado:** Feriados en BD

#### TODO 2.9: Crear utilidades de validación RUT

- [ ] [ ] `lib/validations/rut.ts`
- [ ] Funciones: `cleanRut`, `formatRut`, `validateRut`, `calculateVerifier`
- [ ] Tests manuales con console.log
- [ ] **Resultado:** Validación RUT funcional

#### TODO 2.10: Schemas Zod para autenticación

- [ ] [ ] `lib/validations/auth.ts`
- [ ] `loginSchema` (email, password)
- [ ] `registerSchema` (name, email, rut, password, confirmPassword)
- [ ] Validación de RUT integrada
- [ ] **Resultado:** Validaciones listas

**✅ Checkpoint FASE 2:**

- Prisma Studio funciona: `npx prisma studio`
- Se pueden ver todas las tablas vacías
- Tabla `Holiday` tiene datos
- Validación de RUT funciona

---

### 🔐 FASE 3: Autenticación Completa (Auth.js v5)

**Objetivo:** Sistema de login y registro funcional.

**Dependencias a instalar:**

```bash
npm install next-auth@beta
npm install @auth/core @auth/prisma-adapter
```

#### TODO 3.1: Configurar Auth.js v5

- [x] `lib/auth/config.ts`
- [x] Configurar `PrismaAdapter` con `@prisma/adapter-pg`
- [x] Configurar `Credentials` provider
- [x] Configurar Google OAuth provider
- [x] JWT y session callbacks
- [x] **Resultado:** Auth.js configurado ✅

#### TODO 3.2: Crear helpers de sesión

- [x] `lib/auth/session.ts`
- [x] `getCurrentUser()` - Obtener usuario actual
- [x] `requireAuth()` - Proteger rutas
- [x] `requireSuperAdmin()` - Solo SUPER_ADMIN
- [x] `getUserWithOrganization()` - Usuario con organización
- [x] **Resultado:** Helpers de autenticación ✅

#### TODO 3.3: Crear helpers RBAC

- [x] `lib/auth/rbac.ts` (separado para mejor organización)
- [x] `hasRole()`, `isSuperAdmin()`, `isAdminHR()`, etc.
- [x] `canManageOrganization()`, `canManageShifts()`, etc.
- [x] `canViewShifts()`, `canManageStaff()`, `canManageRates()`
- [x] **Resultado:** Sistema de permisos ✅

#### TODO 3.4: Exportar handlers de Auth.js

- [x] `lib/auth/index.ts`
- [x] Exportar `authOptions`, `prisma`, helpers de sesión y RBAC
- [x] Exportar tipos `CurrentUser`
- [x] **Resultado:** Auth listo para usar ✅

#### TODO 3.5: Crear route handler para Auth.js

- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] Exportar `GET` y `POST` handlers
- [x] **Resultado:** API de auth funcionando ✅

#### TODO 3.6: Server Actions de autenticación

- [x] `actions/auth/auth-actions.ts`
- [x] `registerAction(formData)` - Crear usuario con hash de password (bcrypt)
- [x] `loginAction(formData)` - Verificar credenciales
- [x] `logoutAction()` - Cerrar sesión
- [x] Validación con Zod (`lib/validations/auth.ts`)
- [x] Validación de RUT chileno (`lib/validations/rut.ts`)
- [x] **Resultado:** Actions de auth ✅

#### TODO 3.7: Crear proxy.ts (middleware)

- [x] `proxy.ts` en raíz
- [x] Proteger rutas privadas con `getToken` de NextAuth
- [x] Redirect a login si no autenticado
- [x] Redirect a home si ya autenticado en rutas de auth
- [x] Mantener lógica de i18n
- [x] **Resultado:** Rutas protegidas ✅

#### TODO 3.8: Página de Registro - UI

- [x] `app/[locale]/register/page.tsx` (Server Component wrapper)
- [x] `components/auth/register-form.tsx` (Client Component)
- [x] Campos: Nombre, Email, RUT, Password, Confirmar Password
- [x] Validación en tiempo real del RUT
- [x] Loading states
- [x] Manejo de errores por campo
- [x] **Resultado:** UI de registro completa ✅

#### TODO 3.9: Página de Login - UI

- [x] `app/[locale]/login/page.tsx` (Server Component wrapper)
- [x] `components/auth/login-form.tsx` (Client Component)
- [x] Campos: Email, Password
- [x] Checkbox "Recordarme" (opcional)
- [x] Link a "¿Olvidaste tu contraseña?" (placeholder)
- [x] Botón de Google OAuth
- [x] Loading states
- [x] **Resultado:** UI de login completa ✅

#### TODO 3.10: Conectar formularios con Server Actions

- [x] Integrar `registerAction` en `RegisterForm`
- [x] Integrar `loginAction` en `LoginForm`
- [x] Integrar `signIn('credentials')` después de validación
- [x] Redirect después del éxito
- [x] Manejo de errores por campo
- [x] **Resultado:** Auth funcional end-to-end ✅

#### TODO 3.11: Actualizar navbar con estado de sesión

- [x] `components/layout/navbar.tsx`
- [x] Mostrar "Iniciar Sesión" si no hay sesión
- [x] Mostrar nombre de usuario y avatar si hay sesión
- [x] Dropdown con "Cerrar Sesión"
- [x] Integrado en `app/[locale]/layout.tsx`
- [x] **Resultado:** Navbar con auth ✅

**✅ Checkpoint FASE 3:**

- ✅ Registrar usuario nuevo funciona (con validación de RUT)
- ✅ Login con credenciales funciona
- ✅ Login con Google OAuth funciona
- ✅ Sesión persiste después de refresh
- ✅ Logout funciona
- ✅ Rutas protegidas redirigen a login
- ✅ Rutas de auth redirigen a home si ya autenticado
- ✅ Navbar muestra estado de sesión
- ✅ Validación completa con Zod
- ✅ Hash de contraseñas con bcrypt
- ✅ Prisma configurado con adapter de PostgreSQL para Supabase

**Notas de implementación:**
- Prisma 7.1.0 requiere `engineType = "library"` y adapter explícito
- Usado `@prisma/adapter-pg` con `pg.Pool` para Supabase
- Validación de RUT chileno implementada y funcionando
- Server Actions separados en `actions/auth/`
- Helpers RBAC separados en `lib/auth/rbac.ts` para mejor organización

---

### 👨‍💼 FASE 4: Dashboard SUPER_ADMIN (Gestión de Organizaciones)

**Objetivo:** Panel para administrar hospitales/clínicas.

**Dependencias a instalar:**

```bash
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npm install sonner
```

#### TODO 4.1: Layout del dashboard SUPER_ADMIN

- [ ] `app/(super-admin)/layout.tsx`
- [ ] Sidebar con navegación
- [ ] Links: Dashboard, Organizaciones, Pagos, Analytics
- [ ] Header con usuario y logout
- [ ] Solo accesible para SUPER_ADMIN
- [ ] **Resultado:** Layout del dashboard

#### TODO 4.2: Página principal del dashboard

- [ ] `app/(super-admin)/page.tsx`
- [ ] Mensaje de bienvenida
- [ ] 4 tarjetas de estadísticas (mock data por ahora):
  - [ ] Total organizaciones
  - [ ] Organizaciones activas
  - [ ] Pagos pendientes
  - [ ] Ingresos mensuales
- [ ] **Resultado:** Dashboard principal

#### TODO 4.3: Schemas Zod para organizaciones

- [ ] `lib/validations/organization.ts`
- [ ] `createOrganizationSchema`
- [ ] Validaciones de businessName, contactEmail, phone, etc.
- [ ] **Resultado:** Validación lista

#### TODO 4.4: Server Actions - CRUD organizaciones

- [ ] `actions/organizations/organization-actions.ts`
- [ ] `createOrganizationAction(formData)`
- [ ] `getOrganizationsAction()` - Listar todas
- [ ] `getOrganizationByIdAction(id)`
- [ ] `updateOrganizationAction(id, formData)`
- [ ] `deleteOrganizationAction(id)` - Soft delete
- [ ] **Resultado:** Actions de organizaciones

#### TODO 4.5: Página listar organizaciones

- [ ] `app/(super-admin)/organizations/page.tsx`
- [ ] Tabla con todas las organizaciones
- [ ] Columnas: Nombre, Estado, Plan, Cuentas, Acciones
- [ ] Badges de color según estado
- [ ] Botón "Nueva Organización"
- [ ] **Resultado:** Lista de organizaciones

#### TODO 4.6: Componente tabla de organizaciones

- [ ] `components/organizations/organization-table.tsx`
- [ ] Reutilizable con props
- [ ] Acciones: Ver, Editar, Suspender
- [ ] **Resultado:** Tabla reutilizable

#### TODO 4.7: Página crear organización

- [ ] `app/(super-admin)/organizations/new/page.tsx`
- [ ] Formulario con `OrganizationForm`
- [ ] Campos: businessName, contactName, contactEmail, phone, maxAccounts
- [ ] **Resultado:** Crear organización funciona

#### TODO 4.8: Componente formulario de organización

- [ ] `components/organizations/organization-form.tsx` (Client Component)
- [ ] Reutilizable para crear y editar
- [ ] Validación con Zod
- [ ] Loading states
- [ ] **Resultado:** Formulario reutilizable

#### TODO 4.9: Página ver detalles de organización

- [ ] `app/(super-admin)/organizations/[id]/page.tsx`
- [ ] Mostrar toda la información
- [ ] Badges de estado
- [ ] Botones: Editar, Suspender/Reactivar
- [ ] Historial de pagos (lista vacía por ahora)
- [ ] **Resultado:** Ver detalles

#### TODO 4.10: Página editar organización

- [ ] `app/(super-admin)/organizations/[id]/edit/page.tsx`
- [ ] Reutiliza `OrganizationForm` con datos pre-cargados
- [ ] **Resultado:** Editar funciona

#### TODO 4.11: Server Actions - Suspensión

- [ ] `actions/organizations/suspension-actions.ts`
- [ ] `suspendOrganizationAction(id, reason)` - Razón obligatoria
- [ ] `reactivateOrganizationAction(id)`
- [ ] **Resultado:** Suspender/reactivar listo

#### TODO 4.12: Componente dialog de suspensión

- [ ] `components/organizations/suspend-dialog.tsx` (Client Component)
- [ ] Dialog con textarea para razón
- [ ] Confirmación destructiva
- [ ] **Resultado:** Suspender con razón

#### TODO 4.13: Botón de reactivación

- [ ] `components/organizations/reactivate-button.tsx` (Client Component)
- [ ] Confirmación simple
- [ ] **Resultado:** Reactivar funciona

**✅ Checkpoint FASE 4:**

- Crear organización funciona
- Ver lista de organizaciones
- Editar organización funciona
- Suspender con razón funciona
- Reactivar funciona
- Estado se refleja en badges

---

### 💳 FASE 5: Gestión de Pagos (SUPER_ADMIN)

**Objetivo:** Registrar pagos manualmente para organizaciones.

#### TODO 5.1: Server Actions - Pagos

- [ ] `actions/organizations/payment-actions.ts`
- [ ] `recordPaymentAction(organizationId, formData)`
- [ ] `getPaymentHistoryAction(organizationId)`
- [ ] **Resultado:** Actions de pagos

#### TODO 5.2: Componente formulario de pago

- [ ] `components/organizations/payment-form.tsx` (Client Component)
- [ ] Campos: amount, currency, paymentMethod, paymentDate, periodStart, periodEnd, notes
- [ ] Selects para currency y paymentMethod
- [ ] Date pickers
- [ ] **Resultado:** Formulario de pago

#### TODO 5.3: Página registrar pagos

- [ ] `app/(super-admin)/payments/page.tsx`
- [ ] Select para elegir organización
- [ ] Formulario de pago
- [ ] **Resultado:** Registrar pagos funciona

#### TODO 5.4: Componente historial de pagos

- [ ] `components/organizations/payment-history-table.tsx`
- [ ] Tabla con: Fecha, Monto, Método, Período, Estado
- [ ] Mostrar en página de detalles de organización
- [ ] **Resultado:** Ver historial

#### TODO 5.5: Integrar pagos en detalles de organización

- [ ] Actualizar `app/(super-admin)/organizations/[id]/page.tsx`
- [ ] Mostrar historial de pagos
- [ ] Botón "Registrar Pago" inline
- [ ] **Resultado:** Pagos integrados

**✅ Checkpoint FASE 5:**

- Registrar pago funciona
- Ver historial de pagos
- Pagos se asocian a la organización correcta

---

### 📊 FASE 6: Analytics Básicas (SUPER_ADMIN)

**Objetivo:** Métricas y reportes para el super admin.

#### TODO 6.1: Server Actions - Analytics

- [ ] `actions/analytics/analytics-actions.ts`
- [ ] `getSuperAdminAnalyticsAction()`
- [ ] Calcular: total organizaciones, activas, suspendidas, ingresos del mes, etc.
- [ ] **Resultado:** Analytics listo

#### TODO 6.2: Componente tarjeta de estadísticas

- [ ] `components/dashboard/stats-card.tsx`
- [ ] Reutilizable con props: title, value, icon, trend
- [ ] **Resultado:** Stats card

#### TODO 6.3: Página de analytics

- [ ] `app/(super-admin)/analytics/page.tsx`
- [ ] Grid de stats cards
- [ ] Tabla de organizaciones con próximo pago debido
- [ ] **Resultado:** Analytics funcional

#### TODO 6.4: Actualizar dashboard principal

- [ ] Conectar `app/(super-admin)/page.tsx` con analytics reales
- [ ] Reemplazar mock data
- [ ] **Resultado:** Dashboard con datos reales

**✅ Checkpoint FASE 6:**

- Analytics muestran datos reales
- Estadísticas se actualizan al crear/editar/suspender
- Dashboard principal funcional

---

### 🏢 FASE 7: Dashboard ADMIN_HR (Recursos Humanos)

**Objetivo:** Panel para que RRHH gestione áreas, tipos de turno y tarifas.

**Dependencias nuevas:** Ninguna

#### TODO 7.1: Layout del dashboard ADMIN_HR

- [ ] `app/(dashboard)/hr/layout.tsx`
- [ ] Sidebar con navegación específica
- [ ] Links: Dashboard, Áreas, Tipos de Turno, Tarifas, Jefes
- [ ] **Resultado:** Layout HR

#### TODO 7.2: Página principal HR

- [ ] `app/(dashboard)/hr/page.tsx`
- [ ] Resumen: Total áreas, tipos de turno, personal, jefes
- [ ] **Resultado:** Dashboard HR

#### TODO 7.3: CRUD Áreas - Server Actions

- [ ] `actions/areas/area-actions.ts`
- [ ] `createAreaAction`, `getAreasAction`, `updateAreaAction`, `deleteAreaAction`
- [ ] **Resultado:** Actions de áreas

#### TODO 7.4: Página de áreas

- [ ] `app/(dashboard)/hr/areas/page.tsx`
- [ ] Lista de áreas con nombre y descripción
- [ ] Botón crear nueva área
- [ ] **Resultado:** Gestión de áreas

#### TODO 7.5: CRUD Tipos de Turno - Server Actions

- [ ] `actions/shift-types/shift-type-actions.ts`
- [ ] Crear, listar, editar, eliminar tipos de turno
- [ ] **Resultado:** Actions de tipos de turno

#### TODO 7.6: Página de tipos de turno

- [ ] `app/(dashboard)/hr/shift-types/page.tsx`
- [ ] Lista con: nombre, duración, clasificación, color
- [ ] Formulario para crear/editar
- [ ] **Resultado:** Gestión de tipos de turno

#### TODO 7.7: CRUD Tarifas - Server Actions

- [ ] `actions/rates/rate-actions.ts`
- [ ] Crear, listar, editar tarifas por usuario
- [ ] **Resultado:** Actions de tarifas

#### TODO 7.8: Página de tarifas

- [ ] `app/(dashboard)/hr/rates/page.tsx`
- [ ] Lista de tarifas por personal
- [ ] Formulario para configurar tarifa
- [ ] Historial de cambios
- [ ] **Resultado:** Gestión de tarifas

**✅ Checkpoint FASE 7:**

- HR puede crear áreas
- HR puede crear tipos de turno
- HR puede configurar tarifas
- Todo se guarda en BD correctamente

---

### 👔 FASE 8: Dashboard CHIEF_AREA (Jefe de Área)

**Objetivo:** Panel para que jefes gestionen su personal y turnos.

#### TODO 8.1: Layout del dashboard CHIEF

- [ ] `app/(dashboard)/chief/layout.tsx`
- [ ] Sidebar: Dashboard, Calendario, Personal, Turnos, Aprobaciones
- [ ] **Resultado:** Layout CHIEF

#### TODO 8.2: Sistema de vinculación - Generar código

- [ ] Agregar campo `linkingCode` a User al registrarse
- [ ] Formato: `PERS-2024-001234`
- [ ] **Resultado:** Códigos generados

#### TODO 8.3: Server Actions - Vinculación

- [ ] `actions/users/linking-actions.ts`
- [ ] `linkStaffAction(linkingCode, areaId)`
- [ ] `getStaffByCodeAction(code)`
- [ ] `approveLink Action(membershipId)`
- [ ] `unlinkStaffAction(membershipId)`
- [ ] **Resultado:** Actions de vinculación

#### TODO 8.4: Página vincular personal

- [ ] `app/(dashboard)/chief/staff/link/page.tsx`
- [ ] Input para código de vinculación
- [ ] Mostrar preview del personal
- [ ] Botón confirmar
- [ ] **Resultado:** Vincular funciona

#### TODO 8.5: Página lista de personal

- [ ] `app/(dashboard)/chief/staff/page.tsx`
- [ ] Tabla con personal vinculado
- [ ] Acciones: Ver, Desvincular
- [ ] **Resultado:** Ver personal

#### TODO 8.6: Server Actions - Turnos

- [ ] `actions/shifts/shift-actions.ts`
- [ ] `createShiftAction`, `getShiftsAction`, `updateShiftAction`, `deleteShiftAction`
- [ ] **Resultado:** Actions de turnos

#### TODO 8.7: Validaciones legales

- [ ] `actions/shifts/validation-actions.ts`
- [ ] `validateWeeklyHoursAction(userId, date)`
- [ ] `validateMinimumRestAction(userId, date)`
- [ ] **Resultado:** Validaciones

#### TODO 8.8: Página asignar turnos

- [ ] `app/(dashboard)/chief/shifts/assign/page.tsx`
- [ ] Seleccionar fecha, tipo de turno, horario, personal
- [ ] Mostrar validaciones en tiempo real
- [ ] **Resultado:** Asignar turnos

**✅ Checkpoint FASE 8:**

- Jefe puede vincular personal
- Jefe puede asignar turnos
- Validaciones funcionan
- Turnos se guardan en BD

---

### 👨‍⚕️ FASE 9: Dashboard STAFF_HEALTH (Personal de Salud)

**Objetivo:** Panel para que el personal vea sus turnos.

#### TODO 9.1: Layout del dashboard STAFF

- [ ] `app/(dashboard)/staff/layout.tsx`
- [ ] Sidebar: Dashboard, Mi Calendario, Turnos Abiertos, Intercambios, Perfil
- [ ] **Resultado:** Layout STAFF

#### TODO 9.2: Página Mi Calendario

- [ ] `app/(dashboard)/staff/calendar/page.tsx`
- [ ] Ver todos sus turnos
- [ ] Filtrar por organización
- [ ] Vista mensual simple (sin calendario complejo)
- [ ] **Resultado:** Ver turnos

#### TODO 9.3: Página de perfil

- [ ] `app/(dashboard)/staff/profile/page.tsx`
- [ ] Ver y editar datos personales
- [ ] Ver código de vinculación
- [ ] **Resultado:** Perfil funcional

**✅ Checkpoint FASE 9:**

- Personal puede ver sus turnos
- Personal puede ver su código de vinculación
- Personal puede editar su perfil

---

### 🛡️ FASE 10: Seguridad y Upload de Archivos

**Objetivo:** Rate limiting, health checks, y upload de fotos de perfil.

**Duración:** 3-5 días

**Dependencias a instalar:**

```bash
npm install @upstash/ratelimit @upstash/redis
npm install @supabase/supabase-js
```

#### TODO 10.1: Configurar Upstash Redis (Rate Limiting)

- [ ] Crear cuenta en Upstash (free tier: 10K requests/día)
- [ ] Obtener `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- [ ] Agregar a `.env.local`
- [ ] **Resultado:** Redis configurado

#### TODO 10.2: Rate Limiting en Server Actions críticos

- [ ] `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests cada 10 seg
})

export const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 intentos cada 15 min
})
```

- [ ] Aplicar en `loginAction` y `registerAction`
- [ ] Aplicar en actions críticos (crear turno, vincular personal)
- [ ] **Resultado:** Anti-spam funcional

#### TODO 10.3: Health Check Endpoint

- [ ] `app/api/health/route.ts`

```typescript
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        database: 'disconnected',
      },
      { status: 503 }
    )
  }
}
```

- [ ] Configurar UptimeRobot para pingear cada 5 min
- [ ] **Resultado:** Monitoreo activo

#### TODO 10.4: Configurar Supabase Storage

- [ ] Crear bucket `avatars` en Supabase Storage (público)
- [ ] Políticas RLS:
  - Cualquiera puede leer
  - Solo usuario autenticado puede subir su propia foto
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Resultado:** Storage configurado

#### TODO 10.5: Server Action para Upload de Avatar

- [ ] `actions/user/upload-avatar-action.ts`

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { auth } from '@/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadAvatarAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const file = formData.get('avatar') as File
  if (!file) {
    return { success: false, error: 'No se recibió archivo' }
  }

  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Solo imágenes' }
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'Máximo 2MB' }
  }

  const fileName = `${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) {
    return { success: false, error: error.message }
  }

  const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl

  // Actualizar BD
  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: publicUrl },
  })

  return { success: true, url: publicUrl }
}
```

- [ ] **Resultado:** Upload funcional

#### TODO 10.6: UI para Cambiar Avatar

- [ ] `components/profile/avatar-upload.tsx` (Client Component)
- [ ] Input file con preview
- [ ] Drag & drop opcional
- [ ] Loading state durante upload
- [ ] Mostrar avatar actual si existe
- [ ] **Resultado:** UI completa

#### TODO 10.7: Integrar en Perfil de Usuario

- [ ] Agregar en `app/(dashboard)/staff/profile/page.tsx`
- [ ] Mostrar avatar en header/navbar de todos los dashboards
- [ ] **Resultado:** Avatar visible en toda la app

**✅ Checkpoint FASE 10:**

- Rate limiting protege endpoints críticos
- Health check monitoreado por UptimeRobot
- Usuarios pueden subir foto de perfil
- Fotos se muestran en navbar
- Sin vulnerabilidades de upload

---

### 📅 FASE 11: Calendario Visual con react-big-calendar

**Objetivo:** Calendario visual para ver turnos del mes con react-big-calendar.

**Duración:** 4-6 días

**Dependencias:**

```bash
npm install react-big-calendar date-fns date-fns-tz
```

#### TODO 11.1: Configurar date-fns con timezone Chile

- [ ] `lib/utils/date.ts`

```typescript
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CHILE_TZ = 'America/Santiago'

export const toChileTime = (date: Date) => utcToZonedTime(date, CHILE_TZ)
export const toUTC = (date: Date) => zonedTimeToUtc(date, CHILE_TZ)
export const formatChileDate = (date: Date, formatStr: string) =>
  format(toChileTime(date), formatStr, { locale: es })
```

- [ ] **Resultado:** Timezone configurado

#### TODO 11.2: Configurar react-big-calendar

- [ ] `components/calendar/big-calendar.tsx` (Client Component)
- [ ] Importar estilos: `import 'react-big-calendar/lib/css/react-big-calendar.css'`
- [ ] Configurar localización español con date-fns
- [ ] Custom toolbar con filtros
- [ ] **Resultado:** Calendario base

#### TODO 11.3: Estilizar calendario con Tailwind

- [ ] `app/globals.css` - Custom CSS para react-big-calendar
- [ ] Colores según tipo de turno (día/noche/mixto)
- [ ] Responsive mobile
- [ ] Dark mode compatible
- [ ] **Resultado:** Calendario estilizado

#### TODO 11.4: Adaptar turnos a formato de react-big-calendar

- [ ] Server Action: `getCalendarShiftsAction(month, year)`
- [ ] Transformar `Shift` de Prisma a formato `Event` de react-big-calendar

```typescript
{
  title: 'Turno Largo - María González',
  start: new Date(shift.startTime),
  end: new Date(shift.endTime),
  resource: { shiftId: shift.id, color: shift.type.color }
}
```

- [ ] **Resultado:** Data adapter funcional

#### TODO 11.5: Integrar calendario en CHIEF dashboard

- [ ] `app/(dashboard)/chief/calendar/page.tsx`
- [ ] Vista mensual por defecto
- [ ] Click en turno → Modal con detalles
- [ ] Drag & drop para reasignar turnos (opcional MVP1)
- [ ] **Resultado:** CHIEF puede ver calendario

#### TODO 11.6: Integrar calendario en STAFF dashboard

- [ ] `app/(dashboard)/staff/calendar/page.tsx`
- [ ] Solo turnos del usuario actual
- [ ] Vista read-only (sin drag & drop)
- [ ] **Resultado:** STAFF puede ver sus turnos

**✅ Checkpoint FASE 11:**

- Calendario muestra turnos correctamente
- Localización español funciona
- Se ve bien en mobile y desktop
- Colores según tipo de turno
- Timezone Chile con horario de verano

---

### 🔔 FASE 12: Sistema de Notificaciones

**Objetivo:** Notificaciones toast y emails básicos.

**Duración:** 3-4 días

**Dependencias:**

```bash
npm install resend
npm install @sentry/nextjs
```

#### TODO 12.1: Configurar Sentry (Error Tracking)

- [ ] Crear cuenta en Sentry (free tier: 5K eventos/mes)
- [ ] `npx @sentry/wizard@latest -i nextjs`
- [ ] Agregar `SENTRY_DSN` a `.env.local`
- [ ] Configurar contexto en Server Actions:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.setUser({
  id: session.user.id,
  email: session.user.email,
  organizationId: session.user.organizationId,
})
```

- [ ] Test error boundary con error intencional
- [ ] **Resultado:** Errores capturados en Sentry con contexto

#### TODO 12.2: Configurar toast notifications

- [ ] Ya instalamos `sonner`
- [ ] Agregar `<Toaster />` al layout root
- [ ] **Resultado:** Toasts funcionan

#### TODO 12.3: Configurar Resend

- [ ] Crear cuenta en Resend
- [ ] Verificar dominio o usar dominio de prueba
- [ ] Agregar `RESEND_API_KEY` a `.env`
- [ ] Crear templates de email básicos en `lib/emails/`
- [ ] **Resultado:** Emails configurados

#### TODO 12.4: Enviar email al registrarse

- [ ] Agregar en `registerAction`
- [ ] Email de bienvenida con instrucciones
- [ ] **Resultado:** Email de bienvenida

#### TODO 12.5: Enviar email al asignar turno

- [ ] Agregar en `createShiftAction`
- [ ] Notificar al personal con detalles del turno
- [ ] **Resultado:** Notificación de turno

**✅ Checkpoint FASE 12:**

- Sentry captura errores en producción
- Toasts funcionan en todas las acciones
- Emails se envían correctamente
- Contexto de usuario en error tracking

---

### 🧪 FASE 13: Testing y Pulido

**Objetivo:** Probar todo el flujo end-to-end y pulir detalles.

**Duración:** 1-2 semanas

#### TODO 13.1: Testing manual completo

- [ ] Crear organización
- [ ] Registrar usuario
- [ ] Login
- [ ] Crear áreas y tipos de turno
- [ ] Vincular personal
- [ ] Asignar turnos
- [ ] Ver turnos como personal
- [ ] Subir foto de perfil
- [ ] Probar rate limiting (intentar spam)
- [ ] Verificar timezone Chile (horario de verano)
- [ ] **Resultado:** Flujo completo funciona

#### TODO 13.2: Corregir bugs encontrados

- [ ] Lista de bugs del testing
- [ ] Corregir uno por uno
- [ ] **Resultado:** Bugs corregidos

#### TODO 13.3: Mejorar loading states

- [ ] Asegurar que todos los botones tienen loading
- [ ] Skeletons donde sea necesario
- [ ] **Resultado:** UX mejorada

#### TODO 13.4: Mejorar mensajes de error

- [ ] Mensajes claros y en español
- [ ] **Resultado:** Errores claros

#### TODO 13.5: Accessibility audit

- [ ] Probar navegación por teclado
- [ ] Probar con screen reader
- [ ] **Resultado:** Accesibilidad mejorada

#### TODO 13.6: Performance audit

- [ ] Ejecutar Lighthouse
- [ ] Optimizar imágenes si es necesario
- [ ] **Resultado:** Performance optimizada

#### TODO 13.7: README completo

- [ ] Instrucciones de instalación
- [ ] Variables de entorno necesarias
- [ ] Comandos útiles
- [ ] **Resultado:** README listo

**✅ Checkpoint FASE 13:**

- Todo funciona end-to-end
- Sin bugs críticos
- Accesibilidad buena
- Performance aceptable
- Rate limiting funcional
- Error tracking con Sentry
- Upload de fotos funcional

---

## 🎯 MVP1 COMPLETADO

**Lo que tienes funcionando:**

- ✅ Landing page profesional
- ✅ Sistema de autenticación completo con rate limiting
- ✅ Dashboard SUPER_ADMIN con gestión de organizaciones y pagos
- ✅ Dashboard ADMIN_HR con gestión de áreas, tipos de turno y tarifas
- ✅ Dashboard CHIEF_AREA con vinculación de personal y asignación de turnos
- ✅ Dashboard STAFF_HEALTH para ver turnos
- ✅ Calendario visual con react-big-calendar y timezone Chile
- ✅ Notificaciones email y toast
- ✅ Web responsive (mobile, tablet, desktop)
- ✅ Upload de fotos de perfil con Supabase Storage
- ✅ Error tracking con Sentry
- ✅ Health checks monitoreados

---

## 🔮 MVP2 - Funcionalidades Avanzadas

### FASE 14: Intercambios de Turnos

- [ ] Sistema de solicitudes
- [ ] Aprobación por jefes
- [ ] Notificaciones

### FASE 15: Turnos Abiertos

- [ ] Jefe crea turno sin asignar
- [ ] Personal postula
- [ ] Jefe selecciona

### FASE 16: Asistencia Biométrica (Integraciones MVP2)

- [ ] Webhook API para sistemas biométricos de terceros
  - [ ] ZKTeco (huella)
  - [ ] Anviz (facial + huella)
  - [ ] Suprema BioStar (facial)
- [ ] Check-in/out automático desde webhook
- [ ] Fallback a acreditación manual si falla
- [ ] Alertas de retraso (30 min sin check-in)
- [ ] Dashboard de asistencia para CHIEF

**NOTA:** Hardware biométrico NO incluido (hospitales usan sistemas existentes)

### FASE 17: Liquidaciones Automáticas

- [ ] Cálculo automático de salarios basado en turnos
- [ ] Generación de PDF con Supabase Storage
- [ ] Historial y descarga de liquidaciones
- [ ] Validación de colaboradores (pre-liquidación)

### FASE 18: Reportes Avanzados

- [ ] Reportes por área (turnos, asistencia, costos)
- [ ] Reportes por personal (horas trabajadas, extras)
- [ ] Exportar a Excel/CSV
- [ ] Gráficos con recharts

### FASE 19: App Nativa con Capacitor (Solo STAFF - MVP2)

- [ ] Configurar Capacitor para iOS/Android
- [ ] Adaptar páginas STAFF para export estático
- [ ] Build scripts para iOS y Android
- [ ] Push notifications nativas con @capacitor/push-notifications
- [ ] Publicar en App Store y Google Play (versión beta)

**Preparación para MVP3:** App funcional para integrar GPS y QR

### FASE 20: Métodos Nativos de Asistencia (MVP3 - DIFERENCIADOR)

**🎯 OBJETIVO:** Ofrecer check-in SIN hardware biométrico costoso

#### FASE 20.1: GPS Check-in

- [ ] Configuración de coordenadas por hospital (ADMIN_HR)
- [ ] Radio de check-in configurable (50m, 100m, 200m)
- [ ] Plugin @capacitor/geolocation
- [ ] Validación de ubicación en Server Action
- [ ] UI en app: Botón "He llegado" (solo habilitado dentro del radio)
- [ ] Registro con coordenadas GPS + precisión
- [ ] Dashboard CHIEF: Ver método de check-in (GPS, Manual, Biométrico)

**Ventaja:** $0 hardware vs $500-2000 USD por huellero

#### FASE 20.2: QR Code Check-in

- [ ] Generador de QR diario/por turno (CHIEF)
- [ ] Plugin @capacitor-community/barcode-scanner
- [ ] Escaneo QR desde app
- [ ] Validación de token temporal con expiración
- [ ] Opción web: Mostrar QR en tablet en entrada
- [ ] Security: JWT con firma, validez 24h

**Ventaja:** Flexibilidad sin inversión en hardware biométrico

#### FASE 20.3: Web Check-in Kiosco (Opcional)

- [ ] Página dedicada para tablet en entrada
- [ ] Input RUT + validación de turno
- [ ] Rate limiting (1 check-in cada 5 min por usuario)
- [ ] IP whitelisting (solo red del hospital)
- [ ] UI grande para touch (tipo kiosco)

**Uso:** Complemento para personal sin smartphone

**✅ Checkpoint FASE 20:**

- GPS check-in funcional desde app nativa
- QR code check-in implementado
- Hospital puede elegir método según su necesidad
- **DIFERENCIADOR CLAVE vs Rflex** (sin hardware costoso)

### FASE 21: Internacionalización

- [ ] Migrar `messages.ts` a estructura multi-idioma
- [ ] Implementar `useTranslation` hook
- [ ] Traducir al inglés
- [ ] Selector de idioma en UI
- [ ] (Opcional) Traducir al portugués para Brasil

---

**Este plan es mucho más realista y paso a paso. Cada fase produce algo visible y testeable.**

---

## 📦 DEPENDENCIAS DEL PROYECTO

**Nota:** Las dependencias se instalan **incrementalmente** según las fases. Esta lista muestra las dependencias finales del MVP1.

### Dependencias de Producción

```json
{
  "dependencies": {
    // Framework
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    
    // Autenticación
    "@auth/core": "^0.41.0",
    "@auth/prisma-adapter": "^2.11.1",
    "next-auth": "^5.0.0-beta.30",
    "bcryptjs": "^3.0.3",
    
    // Base de Datos
    "@prisma/client": "^6.19.0",
    
    // Validación
    "zod": "^4.1.12",
    
    // UI (instaladas por shadcn automáticamente)
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "lucide-react": "^0.469.0", // Instalado por shadcn si lo requiere

    // Dark Mode
    "next-themes": "^0.3.0", // REQUERIDO para dark mode

    // Calendario
    "react-big-calendar": "^1.13.0", // FASE 4
    "date-fns": "^3.0.0", // Para localización del calendario
    
    // Notificaciones
    "sonner": "^1.x", // FASE 8
    "resend": "^3.x", // FASE 8 (emails)

    // State Management
    "zustand": "^4.5.0", // Para UI local (sidebar, modales)
    
    // Utilidades
    "tsx": "^4.x"
  }
}
```

### Dependencias de Desarrollo

```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/bcryptjs": "^2.4.6",
    "eslint": "^9",
    "eslint-config-next": "16.0.3",
    "postcss": "^8",
    "prisma": "^6.19.0",
    "tailwindcss": "^4.0.14",
    "typescript": "^5"
  }
}
```

### Dependencias NO Necesarias

❌ **NO instalar estas dependencias:**

- `react-hook-form` - Usaremos FormData nativo con Server Actions
- `react-query` / `@tanstack/react-query` - Usaremos Server Components directamente
- `moment.js` - Usamos date-fns (más ligero)
- `axios` - Usamos fetch nativo
- `lodash` - Implementamos utilidades necesarias manualmente
- `@capacitor/*` - Solo en MVP2 (app nativa)

**Principio:** Instalar solo lo estrictamente necesario. Evitar dependencias pesadas innecesarias.

---

## 🎨 DISEÑO Y UX

### Principios de Diseño

**1. Clean & Professional (Limpio y Profesional)**

- [ ] Espacios en blanco generosos
- Tipografía clara y legible (Inter)
- [ ] Sin elementos decorativos innecesarios
- Enfoque en funcionalidad sobre estética excesiva

**2. Accesibilidad First**

- [ ] Contraste WCAG AAA
- Navegación por teclado completa
- [ ] Screen reader friendly
- Textos descriptivos en todas las acciones

**3. Mobile-First**

- [ ] Diseñado primero para pantallas pequeñas
- Touch targets de mínimo 44x44px
- [ ] Menús colapsables
- Sin hover states críticos (usar click/tap)

**4. Feedback Inmediato**

- [ ] Loading states visibles
- Animaciones sutiles (150-300ms)
- [ ] Toast notifications claras
- Confirmaciones explícitas en acciones destructivas

**5. Consistencia Visual**

- [ ] Mismo diseño de botones en toda la app
- Paleta de colores limitada y consistente
- [ ] Iconografía uniforme (lucide-react)
- Espaciado basado en sistema (4px, 8px, 12px, 16px, 24px, 32px)

---

### Paleta de Colores Expandida

**Colores Primarios (Psicología del Color Médico):**

```css
/* Azul Médico - Confianza, profesionalismo, seguridad */
--primary: 217 91% 60%; /* #3b82f6 */
--primary-foreground: 0 0% 100%; /* Texto sobre azul */

/* Verde Salud - Vida, salud, aprobación */
--secondary: 142 71% 45%; /* #16a34a */
--secondary-foreground: 0 0% 100%;

/* Ámbar Atención - Advertencias, pendientes */
--accent: 38 92% 50%; /* #f59e0b */
--accent-foreground: 0 0% 0%;
```

**Colores de Estado (Turnos):**

```css
/* Turno Programado */
--status-scheduled: 217 91% 60%; /* Azul */

/* Turno En Progreso */
--status-in-progress: 38 92% 50%; /* Ámbar */

/* Turno Completado */
--status-completed: 142 71% 45%; /* Verde */

/* Turno Cancelado */
--status-cancelled: 215 16% 47%; /* Gris */

/* Turno Abierto (sin asignar) */
--status-open: 280 83% 48%; /* Púrpura */
```

**Colores de Feriados:**

```css
/* Feriado Normal */
--holiday-normal: 14 87% 55%; /* Naranja */

/* Feriado Irrenunciable */
--holiday-mandatory: 0 72% 51%; /* Rojo */

/* Fin de Semana */
--weekend: 262 83% 58%; /* Índigo */
```

**Colores Semánticos:**

```css
/* Éxito */
--success: 142 71% 45%;
--success-foreground: 0 0% 100%;

/* Error/Destructivo */
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;

/* Advertencia */
--warning: 38 92% 50%;
--warning-foreground: 0 0% 0%;

/* Información */
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
```

**Grises (Fondos y Textos):**

```css
/* Light Mode */
--background: 0 0% 100%; /* Blanco */
--foreground: 240 10% 3.9%; /* Casi negro */
--muted: 240 4.8% 95.9%; /* Gris muy claro */
--muted-foreground: 240 3.8% 46.1%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;

/* Dark Mode */
.dark {
  --background: 240 10% 3.9%; /* Casi negro */
  --foreground: 0 0% 98%; /* Casi blanco */
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
}
```

---

### Tipografía

**Font Family:**

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

**Escala Tipográfica:**

| Elemento   | Clase Tailwind           | Tamaño | Peso | Uso                           |
| ---------- | ------------------------ | ------ | ---- | ----------------------------- |
| H1         | `text-4xl font-bold`     | 36px   | 700  | Títulos principales de página |
| H2         | `text-3xl font-bold`     | 30px   | 700  | Secciones importantes         |
| H3         | `text-2xl font-semibold` | 24px   | 600  | Sub-secciones                 |
| H4         | `text-xl font-semibold`  | 20px   | 600  | Títulos de tarjetas           |
| Body Large | `text-lg`                | 18px   | 400  | Texto destacado               |
| Body       | `text-base`              | 16px   | 400  | Texto normal                  |
| Body Small | `text-sm`                | 14px   | 400  | Texto secundario              |
| Caption    | `text-xs`                | 12px   | 400  | Metadatos, labels pequeños    |

---

### Componentes Clave

#### 1. Calendario (Vista Mensual)

**Wireframe ASCII:**

```
┌─────────────────────────────────────────────────────────────┐
│  ← Noviembre 2024 →                       [Mes] [Semana]    │
├─────────────────────────────────────────────────────────────┤
│  Lun    Mar    Mié    Jue    Vie    Sáb    Dom             │
├─────────────────────────────────────────────────────────────┤
│        │       │       │       │  1     │  2     │  3 🎉   │ Feriado
│        │       │       │       │ Largo  │        │        │
│        │       │       │       │ 8:00   │        │        │
├────────┼───────┼───────┼───────┼────────┼────────┼────────┤
│  4     │  5    │  6    │  7    │  8     │  9     │  10    │
│ Noche  │ Libre │ Largo │ Noche │ Largo  │        │        │
│ 20:00  │       │ 8:00  │ 20:00 │ 8:00   │        │        │
├────────┼───────┼───────┼───────┼────────┼────────┼────────┤
│  11    │  12   │  13   │  14   │  15    │  16    │  17    │
│ Noche  │ Libre │ Libre │ Largo │ Noche  │        │        │
│ 20:00  │       │       │ 8:00  │ 20:00  │        │        │
└─────────────────────────────────────────────────────────────┘

Leyenda:
🔵 Programado  🟡 En progreso  🟢 Completado  🟣 Abierto  🎉 Feriado
```

**Interacción:**

- [ ] Click en día vacío → Dialog "Crear Turno"
- Click en turno → Dialog "Detalles del Turno" (ver/editar/eliminar)
- [ ] Drag & drop para reasignar (MVP2)

---

#### 2. Sidebar de Navegación

**Wireframe ASCII:**

```
┌──────────────────┐
│  🏥 VITA         │
│                  │
│  ──────────────  │
│                  │
│  📊 Dashboard    │
│  📅 Calendario   │ ← Activo
│  👥 Personal     │
│  🔄 Intercambios │
│  ✅ Asistencia   │
│  ⚙️  Aprobaciones│
│                  │
│  ──────────────  │
│                  │
│  🌙 Dark Mode    │
│  👤 Juan Pérez   │
│  🚪 Cerrar Sesión│
└──────────────────┘
```

**Comportamiento:**

- [ ] Desktop: Siempre visible (240px ancho)
- Tablet: Colapsable con botón hamburguesa
- [ ] Mobile: Overlay con fondo oscuro

---

#### 3. Tarjeta de Estadísticas (Stats Card)

**Wireframe ASCII:**

```
┌────────────────────────────────────┐
│  👥  Personal Activo               │
│                                    │
│      48                            │
│      personas                      │
│                                    │
│  +5 desde el mes pasado            │
└────────────────────────────────────┘
```

**Variantes:**

- [ ] `variant="default"` - Fondo blanco con borde
- `variant="primary"` - Fondo azul con texto blanco
- [ ] `variant="success"` - Fondo verde con texto blanco

---

#### 4. Formulario de Crear Turno

**Wireframe ASCII:**

```
┌─────────────────────────────────────────┐
│  Crear Turno                       [×]  │
├─────────────────────────────────────────┤
│                                         │
│  Fecha *                                │
│  [15/12/2024               ] 📅         │
│                                         │
│  Tipo de Turno *                        │
│  [Largo Día                ▼]           │
│                                         │
│  Horario *                              │
│  [08:00] - [20:00]                      │
│                                         │
│  Personal *                             │
│  [Buscar personal...       🔍]          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✅ Sin conflictos               │   │
│  │ ✅ Dentro de límite semanal     │   │
│  │ ✅ Descanso suficiente          │   │
│  └─────────────────────────────────┘   │
│                                         │
│            [Cancelar] [Crear Turno]    │
└─────────────────────────────────────────┘
```

---

#### 5. Lista de Personal

**Wireframe ASCII:**

```
┌──────────────────────────────────────────────────────────┐
│  Personal de Enfermería UCI              [+ Vincular]    │
├──────────────────────────────────────────────────────────┤
│  [Buscar por nombre o RUT...                        🔍] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Nombre             RUT          Rol        Estado      │
│  ─────────────────────────────────────────────────────  │
│  👤 María González  12.345.678-9 Enfermera  🟢 Activa   │
│  👤 Pedro Sánchez   98.765.432-1 Enfermero  🟢 Activo   │
│  👤 Ana Torres      45.678.901-2 Téc. Enf.  🟡 Pendiente│
│  👤 Luis Martínez   78.901.234-5 Enfermero  🟢 Activo   │
│                                                          │
│  Mostrando 4 de 16                      [1] 2 3 >       │
└──────────────────────────────────────────────────────────┘
```

**Acciones:**

- [ ] Click en fila → Ver detalles del personal
- Hover → Mostrar acciones rápidas (editar, desvincular)

---

#### 6. Toast Notifications

**Diseño:**

```
┌────────────────────────────────────────┐
│  ✅ Turno creado exitosamente          │
│  María González - 15 dic, Largo Día    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ❌ Error al crear turno               │
│  María ya tiene un turno ese día       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⚠️  Advertencia                       │
│  Excede 48 horas semanales             │
└────────────────────────────────────────┘
```

**Posición:** Top-center
**Duración:** 5 segundos
**Animación:** Slide down + fade in/out

---

### Responsive Breakpoints

```typescript
// Tailwind default breakpoints
sm: '640px'   // Tablet portrait
md: '768px'   // Tablet landscape
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large desktop
```

**Comportamiento por pantalla:**

| Elemento    | Mobile (<640px)  | Tablet (640-1024px)         | Desktop (>1024px)      |
| ----------- | ---------------- | --------------------------- | ---------------------- |
| Sidebar     | Overlay (hidden) | Colapsable                  | Siempre visible        |
| Calendario  | Vista semanal    | Vista mensual (compacta)    | Vista mensual (amplia) |
| Tablas      | Cards verticales | Tabla con scroll horizontal | Tabla completa         |
| Formularios | 1 columna        | 2 columnas                  | 2 columnas             |
| Stats Cards | 1 por fila       | 2 por fila                  | 4 por fila             |

---

### Animaciones y Transiciones

**Principio:** Sutiles y rápidas (150-300ms)

```css
/* Transiciones globales en globals.css */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover en botones */
button {
  transition: all 150ms ease-in-out;
}

/* Modals/Dialogs */
dialog {
  animation: slideIn 200ms ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast notifications */
.toast {
  animation: slideDown 300ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Estados de Carga (Loading States)

**Skeletons:**

```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Ejemplo de uso:
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>
```

**Spinners:**

```typescript
// Para botones
<button disabled>
  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
  Cargando...
</button>

// Para páginas completas
<div className="flex items-center justify-center min-h-screen">
  <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
</div>
```

---

### Accesibilidad (WCAG 2.1 AAA)

**Contraste:**

- [ ] Texto normal: mínimo 7:1
- Texto grande (18px+): mínimo 4.5:1
- [ ] Elementos UI: mínimo 3:1

**Navegación por Teclado:**

- [ ] Tab: Avanzar entre elementos
- Shift + Tab: Retroceder
- [ ] Enter/Space: Activar botones
- Escape: Cerrar modales
- [ ] Arrow keys: Navegar en calendarios y listas

**Screen Readers:**

- [ ] Todos los botones tienen `aria-label`
- Formularios con `<label>` asociados
- [ ] Mensajes de error con `aria-live="polite"`
- Estado de carga con `aria-busy="true"`

**Ejemplo completo:**

```typescript
<button
  type="button"
  onClick={handleDelete}
  onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
  aria-label="Eliminar turno del 15 de diciembre"
  className="btn-destructive"
  disabled={isDeleting}
>
  {isDeleting ? (
    <>
      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Eliminando...</span>
    </>
  ) : (
    <>
      <TrashIcon className="mr-2 h-4 w-4" aria-hidden="true" />
      <span>Eliminar</span>
    </>
  )}
</button>
```

---

### Dark Mode

**Implementación:**

```typescript
// components/providers/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Toggle:**

```typescript
// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      className="rounded-lg p-2 hover:bg-accent"
    >
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
```

---

## ✅ PRINCIPIOS DE DESARROLLO

**Código:**

- [ ] Limpio y auto-descriptivo
- **Sin comentarios innecesarios** (el código debe explicarse solo)
- [ ] SOLID principles
- DRY (Don't Repeat Yourself)

**Arquitectura:**

- [ ] Server Components por defecto
- Server Actions para mutations
- [ ] Multi-tenant con aislamiento
- Preparado para Capacitor

**Observability:**

- [ ] Error Boundary en todos los niveles
- Logging estructurado
- [ ] Sentry para producción

---

## 🛠️ COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Prisma
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
npx prisma migrate dev --name nombre_migracion

# Linter
npm run lint

# Build
npm run build
```

---

## 📱 PREPARACIÓN PARA CAPACITOR (MVP2)

### ¿Qué es Capacitor?

**Capacitor** es un "wrapper" que convierte tu app web en app nativa (iOS/Android) sin reescribir código.

```
Tu App Next.js (build estático)
         ↓
   WebView Nativo (iOS/Android)
         ↓
  APIs Nativas (camera, GPS, push, etc.)
```

**Ventaja principal:** Reutilizas el 90% del código web en la app móvil.

---

### 🎯 Alcance en VITA

**Solo para STAFF_HEALTH (Personal de Salud):**

- ✅ Necesitan ver turnos desde el celular
- ✅ Recibir notificaciones push de turnos asignados
- ✅ Self check-in con geolocalización (MVP2)
- ✅ Escanear QR de vinculación (MVP2)

**NO para CHIEF_AREA ni ADMIN_HR:**

- ❌ Estos roles usan 100% desktop
- ❌ Solo necesitan web responsive
- ❌ No necesitan app instalable

---

### ✅ Librerías Actuales: 100% Compatibles

**Todas nuestras librerías funcionan en Capacitor sin cambios:**

| Librería            | Web | Capacitor | Cambios                        |
| ------------------- | --- | --------- | ------------------------------ |
| React 19            | ✅  | ✅        | ❌ Ninguno                     |
| Next.js 16 (static) | ✅  | ✅        | ⚠️ Requiere `output: 'export'` |
| react-big-calendar  | ✅  | ✅        | ❌ Ninguno                     |
| shadcn/ui           | ✅  | ✅        | ❌ Ninguno                     |
| Tailwind CSS v4     | ✅  | ✅        | ❌ Ninguno                     |
| next-themes         | ✅  | ✅        | ❌ Ninguno                     |
| sonner (toasts)     | ✅  | ✅        | ❌ Ninguno                     |
| zustand             | ✅  | ✅        | ❌ Ninguno                     |
| Server Actions      | ✅  | ✅        | ❌ Ninguno (hacen fetch)       |

**Conclusión: No necesitamos cambiar librerías ni arquitectura.**

---

### 📋 Reglas de Código "Capacitor-Ready"

**Sigue estas reglas desde MVP1 para que MVP2 sea fácil:**

#### **1. Diseño Mobile-First (Ya lo hacemos)**

```typescript
// ✅ BIEN: Responsive con Tailwind
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Mis Turnos</h1>
</div>

// ❌ MAL: Ancho fijo desktop
<div className="w-[1200px]">
  <h1 className="text-6xl">Mis Turnos</h1>
</div>
```

**Razón:** Capacitor = app móvil, debe verse perfecto en pantallas pequeñas.

---

#### **2. Usar `useEffect` para APIs del Navegador**

```typescript
// ❌ MAL: window directo puede romper en build
'use client'

export function Component() {
  const screenWidth = window.innerWidth // Error en build
  return <div>{screenWidth}</div>
}

// ✅ BIEN: useEffect para código cliente
'use client'

import { useEffect, useState } from 'react'

export function Component() {
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    setScreenWidth(window.innerWidth)

    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <div>Ancho: {screenWidth}px</div>
}

// ✅ MEJOR: Custom hook reutilizable
import { useWindowSize } from '@/hooks/use-window-size'

export function Component() {
  const { width } = useWindowSize()
  return <div>Ancho: {width}px</div>
}
```

---

#### **3. Server Actions Funcionan Sin Cambios**

```typescript
// ✅ Server Actions hacen fetch automáticamente en Capacitor
'use server'

export async function getMyShiftsAction(userId: string) {
  const shifts = await prisma.shift.findMany({
    where: { assignedUserId: userId },
    include: { shiftType: true, area: true },
  })

  return { success: true, data: shifts }
}

// En web: Ejecuta en servidor VPS
// En Capacitor: Hace fetch a https://vita.cl/api (VPS)
// MISMO CÓDIGO, funciona en ambos ✅
```

---

#### **4. Rutas Relativas en Assets**

```typescript
// ✅ BIEN: Rutas desde public/
<img src="/images/logo.png" alt="VITA" />
<img src="/icons/calendar.svg" alt="Calendario" />

// ❌ MAL: Rutas absolutas externas
<img src="https://vita.cl/images/logo.png" alt="VITA" />

// ✅ BIEN: Con Next.js Image (config especial)
import Image from 'next/image'
<Image
  src="/images/logo.png"
  alt="VITA"
  width={200}
  height={100}
/>
```

---

#### **5. No Depender de SSR en Páginas de STAFF**

```typescript
// ❌ MAL: SSR no funciona en Capacitor
// app/(dashboard)/staff/calendar/page.tsx
export default async function StaffCalendarPage() {
  const shifts = await getMyShiftsAction() // Esto falla en Capacitor
  return <CalendarView shifts={shifts} />
}

// ✅ BIEN: Client Component + useEffect
'use client'

export default function StaffCalendarPage() {
  const [shifts, setShifts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMyShiftsAction().then(result => {
      setShifts(result.data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) return <LoadingSpinner />

  return <CalendarView shifts={shifts} />
}

// ✅ MEJOR: Custom hook
export default function StaffCalendarPage() {
  const { shifts, isLoading } = useMyShifts()

  if (isLoading) return <LoadingSpinner />

  return <CalendarView shifts={shifts} />
}
```

---

### 🚀 Proceso de Migración a Capacitor (MVP2)

**Cuando termines MVP1, agregar Capacitor será así:**

#### **Paso 1: Instalar Capacitor (5 min)**

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

**Configuración:**

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cl.vita.app',
  appName: 'VITA',
  webDir: 'out', // Next.js static export
  server: {
    url: 'https://vita.cl', // Tu VPS
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6', // Azul médico VITA
    },
  },
}

export default config
```

---

#### **Paso 2: Ajustar Next.js Config (2 min)**

```typescript
// next.config.ts
const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

const nextConfig = {
  output: isCapacitor ? 'export' : undefined,

  images: {
    unoptimized: isCapacitor, // Capacitor no soporta Image Optimization
  },

  // Rutas trailing slash para Capacitor
  trailingSlash: isCapacitor,

  // Base path si lo necesitas
  basePath: isCapacitor ? '' : undefined,
}

export default nextConfig
```

---

#### **Paso 3: Script de Build (1 min)**

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:capacitor": "BUILD_TARGET=capacitor next build && npx cap sync",
    "ios": "npm run build:capacitor && npx cap open ios",
    "android": "npm run build:capacitor && npx cap open android"
  }
}
```

---

#### **Paso 4: Agregar Plugins Nativos (según necesidad)**

**Notificaciones Push:**

```bash
npm install @capacitor/push-notifications
```

```typescript
// lib/capacitor/push.ts
import { PushNotifications } from '@capacitor/push-notifications'

export const initPushNotifications = async () => {
  // Pedir permisos
  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    await PushNotifications.register()
  }

  // Listener para notificaciones
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    toast.success(`Nuevo turno: ${notification.title}`)
  })
}
```

**Geolocalización (Self Check-in):**

```bash
npm install @capacitor/geolocation
```

```typescript
// lib/capacitor/geolocation.ts
import { Geolocation } from '@capacitor/geolocation'

export const checkIfInsideHospital = async (
  hospitalLat: number,
  hospitalLon: number,
  radiusMeters: number = 100
): Promise<boolean> => {
  const position = await Geolocation.getCurrentPosition()

  const distance = calculateDistance(
    position.coords.latitude,
    position.coords.longitude,
    hospitalLat,
    hospitalLon
  )

  return distance <= radiusMeters
}
```

**Cámara (QR de vinculación):**

```bash
npm install @capacitor/camera
npm install @capacitor-community/barcode-scanner
```

```typescript
// lib/capacitor/scanner.ts
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

export const scanLinkingCode = async (): Promise<string | null> => {
  // Pedir permisos
  const permission = await BarcodeScanner.checkPermission({ force: true })

  if (!permission.granted) {
    return null
  }

  // Escanear
  const result = await BarcodeScanner.startScan()

  if (result.hasContent) {
    return result.content // Código PERS-2024-001234
  }

  return null
}
```

---

### 🎯 Checklist "Capacitor-Ready" para Desarrollo

**Durante TODO el MVP1, seguir estas reglas en páginas de STAFF:**

- [ ] ✅ **Diseño responsive:** Mobile-first con Tailwind
- [ ] ✅ **Touch-friendly:** Botones mínimo 44x44px
- [ ] ✅ **Sin `window` directo:** Usar `useEffect` o custom hooks
- [ ] ✅ **Client Components:** Páginas de STAFF como `'use client'`
- [ ] ✅ **Server Actions:** Para toda la lógica de negocio
- [ ] ✅ **Assets relativos:** Rutas desde `/public`
- [ ] ✅ **No SSR crítico:** Data loading en cliente (useEffect)
- [ ] ✅ **Error boundaries:** Manejo de errores robusto
- [ ] ✅ **Loading states:** Spinners/skeletons siempre visibles

---

### 📊 Comparación de Esfuerzo

**Si seguimos reglas desde MVP1:**

- ✅ Agregar Capacitor en MVP2: **2-3 días**
- ✅ 90% del código funciona sin cambios
- ✅ Solo agregar plugins para features nativos

**Si NO seguimos reglas (código legacy):**

- ❌ Refactorizar para Capacitor: **2-3 semanas**
- ❌ Reescribir componentes que usan `window`
- ❌ Convertir SSR a Client Components
- ❌ Arreglar rutas rotas, assets rotos

**Conclusión: Vale la pena hacerlo bien desde el inicio.**

---

### 🏗️ Arquitectura Propuesta para STAFF

**Estructura de archivos optimizada para web Y Capacitor:**

```
app/(dashboard)/staff/
├── layout.tsx                    # Layout STAFF (Client Component)
├── page.tsx                      # Dashboard STAFF
├── calendar/
│   ├── page.tsx                  # Calendario (Client Component)
│   └── components/
│       ├── calendar-view.tsx     # Vista calendario
│       └── shift-card.tsx        # Tarjeta de turno
├── shifts/
│   ├── open/page.tsx             # Turnos abiertos
│   └── exchanges/page.tsx        # Intercambios
└── profile/
    └── page.tsx                  # Perfil

hooks/
├── use-my-shifts.ts              # Hook para obtener turnos
├── use-window-size.ts            # Hook para tamaño de ventana
└── use-capacitor.ts              # Hook para detectar si es Capacitor

lib/capacitor/
├── index.ts                      # Exports principales
├── push.ts                       # Push notifications
├── geolocation.ts                # Geolocalización
└── scanner.ts                    # Scanner QR
```

---

### 🔍 Detección de Capacitor

**Helper para saber si está corriendo en app nativa:**

```typescript
// lib/capacitor/index.ts
import { Capacitor } from '@capacitor/core'

export const isCapacitor = Capacitor.isNativePlatform()
export const isIOS = Capacitor.getPlatform() === 'ios'
export const isAndroid = Capacitor.getPlatform() === 'android'
export const isWeb = Capacitor.getPlatform() === 'web'

// Hook personalizado
// hooks/use-capacitor.ts
'use client'

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export const useCapacitor = () => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')

  useEffect(() => {
    setPlatform(Capacitor.getPlatform() as any)
  }, [])

  return {
    isCapacitor: platform !== 'web',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    platform
  }
}

// Uso en componentes
export function MyComponent() {
  const { isCapacitor, platform } = useCapacitor()

  return (
    <div>
      {isCapacitor ? (
        <button onClick={handleNativePush}>
          Activar notificaciones
        </button>
      ) : (
        <p>Las notificaciones push requieren la app móvil</p>
      )}
    </div>
  )
}
```

---

### ⚠️ Problemas Comunes y Soluciones

#### **Problema 1: CORS en Capacitor**

```typescript
// En VPS, permitir peticiones desde app Capacitor
// next.config.ts o en Nginx

headers: [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'capacitor://localhost' },
      { key: 'Access-Control-Allow-Origin', value: 'http://localhost' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
    ],
  },
]
```

#### **Problema 2: LocalStorage/Cookies**

```typescript
// Web: localStorage funciona
localStorage.setItem('theme', 'dark')

// Capacitor: Mejor usar Preferences (persiste mejor)
import { Preferences } from '@capacitor/preferences'

export const storage = {
  async set(key: string, value: string) {
    if (isCapacitor) {
      await Preferences.set({ key, value })
    } else {
      localStorage.setItem(key, value)
    }
  },

  async get(key: string): Promise<string | null> {
    if (isCapacitor) {
      const { value } = await Preferences.get({ key })
      return value
    } else {
      return localStorage.getItem(key)
    }
  },
}
```

#### **Problema 3: Status Bar / Safe Area**

```typescript
// Para iOS: Respetar notch/safe area
// app/globals.css

@supports (padding: env(safe-area-inset-top)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

// Capacitor: Configurar status bar
import { StatusBar, Style } from '@capacitor/status-bar'

if (isIOS) {
  StatusBar.setStyle({ style: Style.Light })
  StatusBar.setBackgroundColor({ color: '#3b82f6' })
}
```

---

### 📝 TODOs para MVP2 (Capacitor)

**Cuando termines MVP1, agregar estas tareas a FASE "MVP2 - App Nativa":**

- [ ] **Setup Capacitor:** Instalar y configurar
- [ ] **Build estático:** Configurar `output: 'export'` condicional
- [ ] **Testing:** Probar en simulador iOS/Android
- [ ] **Push Notifications:** Integrar plugin + backend
- [ ] **Geolocalización:** Self check-in con GPS
- [ ] **Scanner QR:** Vincular personal escaneando código
- [ ] **Icons & Splash:** Diseñar iconos de app y splash screen
- [ ] **App Store Assets:** Screenshots, descripción, keywords
- [ ] **Testing Beta:** TestFlight (iOS) y Google Play Beta
- [ ] **Publicación:** Submit a stores

**Estimado de tiempo MVP2:** 3-4 semanas adicionales después de MVP1 completo.

---

## ❗ DECISIONES IMPORTANTES

### 1. Next.js 16 - PPR

**Situación:** Next.js 16 activa PPR automáticamente con React 19 suspense boundaries.

**Configuración final:**

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '2mb',
  },
}
```

**No se requiere** `ppr: true` manual. Se usa automáticamente con Server Components + Client Components.

### 2. Middleware Next.js 16

Cambiado de `export default auth()` a `export function middleware()`.

### 3. Calendario con react-big-calendar

**Decisión:** Usar react-big-calendar en lugar de calendario custom

**Razón:**

- ✅ Ahorra 40-60 horas de desarrollo
- ✅ Librería madura, probada en producción
- ✅ Soporte de drag & drop out of the box
- ✅ Localización español con date-fns
- ✅ Enfoque en features core, no en reinventar la rueda

**Instalación:**

```bash
npm install react-big-calendar date-fns
```

### 4. Estrategia Mobile: Web Responsive + Capacitor

**Decisión:** Web responsive en MVP1, app nativa con Capacitor en MVP2

**Razón:**

- ✅ Web responsive cubre todas las plataformas inicialmente
- ✅ Desktop para CHIEF/HR, mobile para STAFF
- ✅ Capacitor solo cuando realmente se necesiten features nativos (push, GPS)
- ✅ Evita complejidad innecesaria en fase inicial

### 5. Schema Prisma: Un Solo Archivo

**Razón:** Prisma NO soporta múltiples archivos nativamente

**Solución:** Organizamos con comentarios por secciones

### 6. VPS + Dockploy en vez de Vercel

**Decisión:** Hosting en VPS con Docker, NO en Vercel

**Razón:**

- ✅ No hay cold starts (servidor 24/7)
- ✅ Prisma Client se carga una sola vez
- ✅ Más económico (~$20/mes vs ~$50+/mes)
- ✅ Control total de configuración

### 7. NextAuth v4 (Estable) con JWT Strategy

**Decisión:** Usar NextAuth v4 estable (NO v5 beta) con JWT sessions

**Razón:**

- ✅ v4 es estable y producción-ready (v5 está en beta)
- ✅ Documentación completa y soporte de comunidad
- ✅ JWT evita problemas del Prisma Adapter en database sessions
- ✅ Más rápido (no query a BD por cada request)
- ✅ Funciona perfecto en VPS

**Configuración:**

```typescript
import NextAuth from 'next-auth' // v4.24.13
import GoogleProvider from 'next-auth/providers/google'

session: {
  strategy: "jwt", // IMPORTANTE
  maxAge: 30 * 24 * 60 * 60
}
```

### 7.1 Estrategia de OAuth + Onboarding

**Decisión:** Solo Google OAuth en MVP1, sin registro tradicional

**Flujo:**
```
1. Usuario hace login con Google
2. NextAuth crea usuario (email, name, image automáticos)
3. Middleware detecta perfil incompleto (sin docNumber)
4. Redirige a /onboarding
5. Usuario completa: país, docType, docNumber
6. Validación de docNumber duplicado
7. Acceso a dashboard según rol
```

**MVP2:** Agregar Microsoft OAuth (hospitales usan Microsoft 365)

**MVP3:** Considerar registro tradicional si clientes lo piden

### 7.2 Problema de Email Corporativo y Soluciones

**Problema identificado:**
- Doctor trabaja en Hospital A: `juan@hospitalA.cl`
- Luego es despedido y pierde acceso al email
- No puede hacer login con Google

**Solución MVP1:** Feature "Cambiar email" en settings
- Usuario puede agregar email personal preventivamente
- VITA envía código de verificación
- Email actualizado → Puede hacer login con nuevo email

**Solución MVP2:** Soporte manual
- SUPER_ADMIN puede actualizar email tras verificar identidad
- Para casos excepcionales

**Solución MVP3:** Login tradicional como backup (si es necesario)

### 8. React Query: Opcional, No Requerido en MVP1

**Decisión:** Server Actions + useState por defecto, React Query solo si es necesario

**Razón:**

- ✅ Next.js 16 Server Components + Server Actions cubren 90% de casos
- ✅ Server Actions funcionan desde Client Components sin `useEffect` engorroso
- ✅ React Query solo útil para: polling, cache compartido complejo, optimistic updates
- ⚠️ Evaluar necesidad real durante desarrollo (agregar si setState se vuelve caótico)

### 9. Rate Limiting con Upstash Redis

**Decisión:** Rate limiting en Server Actions críticos desde MVP1

**Razón:**

- ✅ Protege contra spam y ataques DoS
- ✅ Upstash free tier suficiente (10K requests/día)
- ✅ Login: 5 intentos cada 15 min
- ✅ Crear turno: 10 requests cada 10 seg

### 10. Supabase Storage para Uploads

**Decisión:** Supabase Storage para archivos

**Casos de uso:**

- ✅ MVP1: Fotos de perfil
- ✅ MVP2: PDFs de liquidaciones

**Razón:**

- ✅ Free tier: 1GB storage + CDN
- ✅ RLS policies para seguridad

### 11. Timezone Chile con date-fns-tz

**Decisión:** Manejar timezone explícitamente

**Razón:**

- ✅ Chile tiene horario de verano (DST)
- ✅ Almacenar en UTC, mostrar en America/Santiago
- ✅ Evita bugs con fechas de turnos

### 12. Error Tracking con Sentry desde MVP1

**Decisión:** Sentry desde MVP1, no MVP2

**Razón:**

- ✅ Free tier: 5K eventos/mes
- ✅ Stack traces con contexto (userId, organizationId)
- ✅ Crítico para detectar bugs en producción temprano

### 13. i18n Preparado pero Simple

**Decisión:** Estructura preparada, MVP1 solo español

**Razón:**

- ✅ Textos centralizados en `lib/i18n/messages.ts`
- ✅ Fácil migrar a multi-idioma en MVP2
- ✅ Preparado para expansión (inglés, portugués Brasil)

---

## 📚 REFERENCIAS

**Stack:**

- [ ] Next.js 16: https://nextjs.org/docs
- Auth.js v5: https://authjs.dev
- [ ] Prisma: https://www.prisma.io/docs
- Tailwind v4: https://tailwindcss.com/docs
- [ ] shadcn/ui: https://ui.shadcn.com

**Herramientas:**

- [ ] Supabase: https://supabase.com/docs
- Zod: https://zod.dev
- [ ] Capacitor: https://capacitorjs.com

---

## ❌ COSAS QUE EVITAR

- [ ] ❌ NO usar PPR en `next.config.ts` (deprecated en Next.js 16)
- ❌ NO usar `export default auth()` en middleware
- [ ] ❌ NO dividir schema de Prisma en múltiples archivos
- ❌ NO usar comentarios innecesarios en el código
- [ ] ❌ NO instalar dependencias que no se usen todavía

---

## 🎯 PRÓXIMO PASO INMEDIATO

**Empezamos con FASE 0 (Investigación) y luego FASE 1 (Landing Page)**

### Opción A: Si ya tienes datos de Rflex → Saltar a FASE 1

**TODO 1.1:** Configurar Tailwind v4 con paleta médica

**Archivos a crear/modificar:**

1. `app/globals.css` - Variables CSS de colores médicos
2. `tailwind.config.ts` - Configuración Tailwind v4
3. Definir paleta de neuromarketing médico

### Opción B: Si NO tienes datos de Rflex → Empezar FASE 0

**TODO 0.1:** Entrevista a usuarios de Rflex

**Acciones:**

1. Preparar guion de preguntas para novia (usuaria Rflex)
2. Contactar jefe de Kinesiología del hospital del director
3. Documentar pain points y validar necesidad
4. Actualizar tabla comparativa con datos reales

---

## ❓ PREGUNTAS PENDIENTES

**IMPORTANTE:** Estas preguntas deben responderse lo antes posible. Algunas bloquean el desarrollo, otras son para optimizar el plan.

---

### 🔴 PRIORIDAD ALTA - Responder ANTES de empezar desarrollo

#### 1. Experiencia con Dockploy

**Pregunta:** ¿Ya tienes experiencia desplegando con Dockploy? ¿O necesitas guía detallada?

**Por qué importa:** Si es tu primera vez con Docker/Dockploy, necesitamos agregar una FASE de "Setup de Infraestructura" con guía paso a paso.

**Opciones:**

- **A)** Tengo experiencia → Seguimos con el plan actual
- **B)** No tengo experiencia → Agregamos FASE extra con tutorial completo de:
  - VPS (DigitalOcean/Hetzner/AWS Lightsail)
  - Docker + Docker Compose
  - Nginx como reverse proxy
  - SSL con Let's Encrypt
  - PM2 para mantener app corriendo

---

#### 2. Código de Vinculación - Formato

**Pregunta:** ¿El formato `PERS-2024-001234` es fijo o prefieres algo más corto?

**Opciones:**

- **A)** `PERS-2024-001234` (actual) - 17 caracteres
- **B)** `PERS-A1B2C3` (corto) - 11 caracteres, más fácil de dictar por teléfono
- **C)** `PS-12345` (ultra corto) - 8 caracteres
- **D)** QR code - Personal genera QR, jefe escanea (sin escribir)

**Recomendación:** Opción B o D (QR code es muy conveniente)

---

#### 3. Timeline y Dedicación

**Pregunta:** ¿Cuántas horas/semana puedes dedicar a VITA?

**Por qué importa:** Esto determina cuándo tendrás MVP1 listo.

**Estimaciones:**

- 10h/semana → MVP1 en 4-5 meses
- 20h/semana → MVP1 en 2-3 meses
- 40h/semana (full-time) → MVP1 en 1-1.5 meses

**¿Cuándo necesitas tener algo mostrable al director del hospital?**

- ¿En 1 mes? → Priorizamos landing + 1 core feature
- ¿En 3 meses? → MVP1 completo
- ¿En 6 meses? → MVP1 + Piloto funcionando

---

### 🟡 PRIORIDAD MEDIA - Responder durante FASE 0 (Investigación)

#### 4. Datos de Rflex

**✅ CONFIRMADO (vía https://rflex.io/):**

1. ✅ App móvil: Sí, iOS + Android
2. ✅ Métodos de asistencia: Web, app+GPS, offline, biometría (integración), tarjeta/pin
3. ✅ Hardware biométrico: NO es de Rflex, son integraciones con terceros ($500-2000 USD)

**⚠️ PENDIENTE INVESTIGAR:**

1. ⚠️ Pricing: ¿Cuánto cobra Rflex mensualmente por usuario?
2. ⚠️ UX: ¿Qué 3 cosas odia más tu novia de Rflex?
3. ⚠️ Calendario: ¿Cómo es el visual? (screenshot si es posible)
4. ⚠️ Validaciones legales: ¿Tiene automáticas del Código del Trabajo?
5. ⚠️ Adopción: ¿Por qué Kinesiología y Nutrición NO usan Rflex?

**Acción:** Entrevistar a novia + jefe de Kinesiología durante FASE 0

---

#### 5. Formato de Código Alternativo para MVP2

**Pregunta:** Para MVP2, ¿prefieres códigos temporales de un solo uso o mantener códigos permanentes?

**Códigos permanentes (MVP1):**

- ✅ Simple, mismo código siempre
- ⚠️ Si se filtra, cualquiera puede intentar vincular (mitigado por doble validación)

**Códigos temporales (MVP2):**

- ✅ Más seguro (expiran, un solo uso)
- ⚠️ Menos conveniente (hay que regenerar)

**Recomendación:** Mantener permanentes si no has tenido problemas de seguridad.

---

### 🟢 PRIORIDAD BAJA - Responder cuando sea conveniente

#### 6. Nombre de Dominio

**Pregunta:** ¿Ya tienes dominio para VITA? ¿O necesitas comprarlo?

**Sugerencias:**

- `vitaturno.cl` / `vita-turnos.cl`
- `vitahospital.cl`
- `turnovita.cl`

**Costo:** ~$12 USD/año en NIC Chile

---

#### 7. Logo y Branding

**Pregunta:** ¿Necesitas diseño de logo o usarás algo temporal?

**Opciones:**

- **A)** Logo profesional (Fiverr ~$50-200 USD)
- **B)** Logo generado con IA (Midjourney/DALL-E ~$20/mes)
- **C)** Temporal con emoji médico 🏥 (gratis, mejoramos después)

**Recomendación:** Opción C para MVP1, profesional después del piloto

---

#### 8. Estrategia de Emails

**Pregunta:** Para notificaciones por email, ¿usaremos Resend o necesitas algo más económico?

**Opciones:**

- **Resend:** $20/mes por 50K emails, muy fácil de integrar
- **SendGrid:** Plan free (100 emails/día), después $15/mes
- **Amazon SES:** ~$1 por 10K emails, más complejo de configurar

**Recomendación:** Resend para MVP1 (simplicidad), evaluar costo después

---

## 📝 DECISIONES Y ARQUITECTURA DEFINIDA

**Última actualización:** 19 Nov 2025

### Análisis y Modelo de Negocio

- ✅ Análisis competitivo con Rflex como referencia principal
- ✅ Modelo B2B con pricing negociado (no planes fijos)
- ✅ Calculadora de precios como referencia
- ✅ Enfoque inicial: hospitales y clínicas en Chile

### Stack Tecnológico

- ✅ Next.js 16 + React 19 + TypeScript
- ✅ Prisma ORM + PostgreSQL (Supabase)
- ✅ Auth.js v5 con JWT strategy
- ✅ Tailwind CSS v4 + shadcn/ui + next-themes
- ✅ react-big-calendar + date-fns + date-fns-tz (timezone Chile)
- ✅ Resend para emails
- ✅ VPS + Dockploy para hosting
- ✅ **NUEVO:** Upstash Redis para rate limiting
- ✅ **NUEVO:** Supabase Storage para uploads (fotos, PDFs)
- ✅ **NUEVO:** Sentry para error tracking desde MVP1

### Estrategia de Estado

- ✅ Server Components + Server Actions (patrón principal)
- ✅ useState para estado local en Client Components
- ✅ Zustand para UI state (sidebar, modales, filtros)
- ⚠️ React Query opcional (solo si setState se vuelve engorroso)

### Estrategia Mobile

- ✅ MVP1: Web responsive (todos los roles)
- ✅ MVP2: Capacitor para app nativa (solo STAFF)
- ✅ Código "Capacitor-Ready" desde MVP1

### Seguridad

- ✅ Rate limiting en Server Actions críticos (login, registro, crear turno)
- ✅ Upstash Redis free tier (10K requests/día)
- ✅ Login: 5 intentos cada 15 min
- ✅ Operaciones: 10 requests cada 10 seg

### Upload de Archivos

- ✅ Supabase Storage con RLS policies
- ✅ MVP1: Fotos de perfil (max 2MB)
- ✅ MVP2: PDFs liquidaciones
- ✅ Validación de tipo y tamaño en Server Actions

### Timezone y Fechas

- ✅ Almacenar en UTC en PostgreSQL
- ✅ Mostrar en America/Santiago con date-fns-tz
- ✅ Manejar horario de verano (DST) automáticamente
- ✅ Helpers: `toChileTime()`, `toUTC()`, `formatChileDate()`

### Error Tracking y Monitoreo

- ✅ Sentry desde MVP1 (5K eventos/mes free tier)
- ✅ Contexto en errores (userId, organizationId)
- ✅ Health check endpoint `/api/health`
- ✅ UptimeRobot para monitoreo (ping cada 5 min)

### Internacionalización

- ✅ **next-intl v4.6.1 implementado y funcionando**
- ✅ Routing basado en locale prefix (`/es/...`, `/en/...`)
- ✅ Componentes de navegación localizados (`@/i18n/navigation`)
- ✅ Cambio de idioma funcional en `LanguageSelector`
- ✅ Mensajes organizados en `messages/{locale}.json`
- ✅ Configuración centralizada en `i18n/routing.ts`
- 📖 Ver sección completa: [INTERNACIONALIZACIÓN (i18n)](#-internacionalización-i18n---implementación-completa)

### Sistemas Core

- ✅ Multi-tenancy con `organizationId`
- ✅ 4 roles: SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF_HEALTH
- ✅ Vinculación de personal con códigos permanentes (MVP1)
- ✅ Validaciones legales con disclaimer y logs auditables
- ✅ Sistema de notificaciones (email + toast)

### Sistema de Asistencia (Estrategia por Fases)

- ✅ **MVP1:** Acreditación manual por CHIEF (casos excepcionales)
- ✅ **MVP2:** Integración con biométricos de terceros vía webhook API
  - Hardware de terceros: Huelleros ($500-800), faciales ($1500-2000)
  - VITA NO vende hardware, solo integración
  - Webhook API para ZKTeco, Anviz, Suprema, Hikvision
- ✅ **MVP3 (DIFERENCIADOR vs Rflex):** Métodos nativos por software
  - **GPS Check-in:** App detecta ubicación, check-in sin hardware ($0 adicional)
  - **QR Code:** Jefe genera QR, personal escanea al llegar
  - **Web Kiosco:** Tablet en entrada, check-in por RUT
  - **Ventaja competitiva:** Sin hardware costoso, solo software

### Arquitectura y Patrones

- ✅ Server Components + Client Components + Server Actions
- ✅ Atomic Design Pattern
- ✅ SOLID principles
- ✅ Custom Hooks para lógica reutilizable
- ✅ Zustand para UI state local

### Orden de Desarrollo

- ✅ **MVP1 (FASES 0-13):**
  - FASE 0: Investigación competitiva (Rflex)
  - FASE 1: Landing page y branding
  - FASE 2-9: Features core y dashboards
  - FASE 10: Seguridad y uploads (rate limiting + fotos)
  - FASE 11: Calendario con react-big-calendar
  - FASE 12: Notificaciones + Sentry
  - FASE 13: Testing y pulido

- ✅ **MVP2 (FASES 14-19):**
  - FASE 14: Intercambios de turnos
  - FASE 15: Turnos abiertos
  - FASE 16: Asistencia biométrica (webhooks para hardware de terceros)
  - FASE 17: Liquidaciones automáticas (PDFs)
  - FASE 18: Reportes avanzados
  - FASE 19: App nativa Capacitor (iOS + Android)

- ✅ **MVP3 (FASES 20-21):**
  - FASE 20: Métodos nativos de asistencia (GPS, QR, Web kiosco)
    - 🎯 **DIFERENCIADOR:** Check-in sin hardware biométrico costoso
  - FASE 21: Internacionalización (inglés, portugués)

---

**Este es el archivo maestro del plan de VITA. Mantenerlo actualizado es crítico para el éxito del proyecto.**
