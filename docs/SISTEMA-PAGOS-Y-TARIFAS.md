# Sistema de Pagos y Tarifas VITA

> **Sistema completo de cálculo automático de pagos por turnos trabajados**  
> **Fecha:** Febrero 2026

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Conceptos Clave](#conceptos-clave)
3. [Modelos de la Base de Datos](#modelos-de-la-base-de-datos)
4. [Tipos de Componentes de Pago](#tipos-de-componentes-de-pago)
5. [Flujo Completo de Pago](#flujo-completo-de-pago)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [API y Cálculos](#api-y-cálculos)

---

## Visión General

El sistema permite a cada organización definir sus propias estructuras de pago totalmente personalizables, combinando:

- **Pagos fijos** (sueldos base mensuales)
- **Pagos por turno** (cuando trabajas un tipo de turno específico)
- **Pagos por tiempo** (por minuto/hora trabajados)
- **Multiplicadores** (calendario: feriados, fin de semana)
- **Check-in/Check-out** (tiempo real trabajado vs programado)

---

## Conceptos Clave

### 1. **Plantilla de Tarifa (RateTemplate)**
Una plantilla reutilizable que contiene múltiples componentes de pago.

**Ejemplo:** "Tarifa Enfermería UCI"
- Componente 1: Sueldo Base $500,000 mensual
- Componente 2: $20,000 por turno completado de "Guardia Larga"
- Componente 3: $500 por minuto extra trabajado

### 2. **Componente de Tarifa (RateComponent)**
Un elemento individual de pago dentro de una plantilla.

**Propiedades:**
- `type`: Tipo de componente (BASE_SALARY, PER_SHIFT, PER_MINUTE, etc.)
- `value`: Monto a pagar
- `unit`: Unidad de pago (MONTHLY, PER_SHIFT, PER_MINUTE, etc.)
- `applyCondition`: Cuándo se aplica este componente
- `applicableShiftTypes`: A qué tipos de turno aplica (relación muchos a muchos)

### 3. **Contrato (Contract)**
Asigna una plantilla de tarifa a un empleado específico.

### 4. **Turno (Shift)**
Un turno de trabajo con:
- Horario programado (`startTime`, `endTime`)
- Horario real trabajado (`actualStartTime`, `actualEndTime`)
- Tipo de turno asociado

### 5. **Pago de Turno (ShiftPayment)**
Registro del cálculo automático del pago de un turno, con desglose completo.

---

## Modelos de la Base de Datos

### `RateComponent` (Componente de Tarifa)

```prisma
model RateComponent {
  id                      String
  rateTemplateId          String
  type                    ComponentType      // BASE_SALARY, PER_SHIFT, etc.
  value                   Float              // Monto
  unit                    ComponentUnit      // MONTHLY, PER_SHIFT, PER_MINUTE, etc.
  applyCondition          ApplyCondition     // ALWAYS, SPECIFIC_SHIFT_TYPE, etc.
  applicableShiftTypes    RateComponentApplicableType[]  // 👈 NUEVO
  // ... otros campos
}
```

### `RateComponentApplicableType` (Relación Muchos a Muchos)

```prisma
model RateComponentApplicableType {
  rateComponentId String
  shiftTypeId     String
  rateComponent   RateComponent
  shiftType       ShiftType
}
```

**Uso:** Permite anexar un componente a turnos específicos.

**Ejemplo:**
- Componente "Bono Guardia Larga" → Aplica solo a ShiftType "Guardia Larga (12h)"
- Componente "Bono Noche" → Aplica solo a ShiftType "Guardia Nocturna"

### `Shift` (Turno)

```prisma
model Shift {
  id              String
  startTime       DateTime     // Horario programado inicio
  endTime         DateTime     // Horario programado fin
  actualStartTime DateTime?    // 👈 NUEVO - Check-in real
  actualEndTime   DateTime?    // 👈 NUEVO - Check-out real
  status          ShiftStatus
  contractId      String?
  payment         ShiftPayment?
  // ... otros campos
}
```

### `ShiftPayment` (Pago de Turno)

```prisma
model ShiftPayment {
  id                    String
  shiftId               String             @unique
  totalAmount           Float              // Pago base (sin multiplicador)
  baseAmount            Float              // Suma de componentes base
  calendarMultiplier    Float              // Multiplicador del calendario (ej: 2.5x navidad)
  finalAmount           Float              // Total final = totalAmount × calendarMultiplier
  minutesWorked         Int                // Minutos realmente trabajados
  isPartialCompletion   Boolean            // Si trabajó menos de lo programado
  status                PaymentStatus      // PENDING, CALCULATED, APPROVED, PAID
  calculatedAt          DateTime
  approvedAt            DateTime?
  paidAt                DateTime?
  breakdowns            ShiftPaymentBreakdown[]  // Desglose
}
```

### `ShiftPaymentBreakdown` (Desglose de Pago)

```prisma
model ShiftPaymentBreakdown {
  id              String
  shiftPaymentId  String
  componentId     String
  componentName   String           // Nombre del componente
  componentType   ComponentType    // Tipo de componente
  baseValue       Float            // Valor base del componente
  calculatedValue Float            // Valor calculado final
  appliedMinutes  Int?             // Minutos aplicados (para componentes por tiempo)
  notes           String?
}
```

---

## Tipos de Componentes de Pago

### 1. **Componentes de Contrato Base (`applyCondition: ALWAYS`)**

✅ **Características:**
- Se pagan independientemente de los turnos trabajados
- Son pagos fijos mensuales/quincenales
- NO se suman al cálculo de turnos individuales

**Ejemplos:**
```
Componente: Sueldo Base
- Type: BASE_SALARY
- Value: 500000
- Unit: MONTHLY
- ApplyCondition: ALWAYS
→ Se paga $500,000 cada mes, sin importar turnos
```

```
Componente: Bono Antigüedad
- Type: SENIORITY_BONUS
- Value: 50000
- Unit: MONTHLY
- ApplyCondition: ALWAYS
→ Se paga $50,000 cada mes adicional
```

### 2. **Componentes por Turno Específico (`applyCondition: SPECIFIC_SHIFT_TYPE`)**

✅ **Características:**
- Se anexan a tipos de turno específicos
- Solo se pagan cuando trabajas ese tipo de turno
- Pueden ser montos fijos o por tiempo

**Ejemplo 1: Pago fijo por turno completado**
```
Componente: Pago Guardia Larga
- Type: PER_SHIFT
- Value: 50000
- Unit: PER_SHIFT
- ApplyCondition: SPECIFIC_SHIFT_TYPE
- ApplicableShiftTypes: ["Guardia Larga (12h)"]
→ Se pagan $50,000 cada vez que completas una Guardia Larga
```

**Ejemplo 2: Pago por minuto para turno específico**
```
Componente: Pago por Minuto Guardia Nocturna
- Type: PER_MINUTE
- Value: 500
- Unit: PER_MINUTE
- ApplyCondition: SPECIFIC_SHIFT_TYPE
- ApplicableShiftTypes: ["Guardia Nocturna"]
→ Se pagan $500 × minutos trabajados, solo en Guardia Nocturna
```

### 3. **Componentes por Tiempo (Todos los Turnos)**

**Ejemplo:**
```
Componente: Pago por Hora Extra
- Type: PER_HOUR
- Value: 5000
- Unit: PER_HOUR
- ApplyCondition: OVERTIME_ONLY
→ Se pagan $5,000 × horas extra (más allá del horario programado)
```

### 4. **Componentes por Calendario**

**Ejemplo:**
```
Componente: Bono Fin de Semana
- Type: WEEKEND_BONUS
- Value: 30000
- Unit: FIXED_AMOUNT
- ApplyCondition: WEEKEND_ONLY
→ Se pagan $30,000 adicionales si trabajas sábado o domingo
```

---

## Flujo Completo de Pago

### Paso 1: Configuración Inicial (ADMIN_HR)

1. **Crear Plantillas de Tarifa**
   ```
   Plantilla: "Tarifa Enfermería Estándar"
   ├─ Componente 1: Sueldo Base $500,000 (MONTHLY, ALWAYS)
   ├─ Componente 2: $50,000 por Guardia Larga (PER_SHIFT, SPECIFIC_SHIFT_TYPE → "Guardia Larga")
   └─ Componente 3: $500/min extra (PER_MINUTE, OVERTIME_ONLY)
   ```

2. **Asignar Contrato al Empleado**
   ```
   Contract:
   - User: Juan Pérez
   - RateTemplate: "Tarifa Enfermería Estándar"
   ```

3. **Configurar Calendario**
   ```
   OrganizationCalendar:
   - Date: 25-Dic-2024
   - Type: IRRENUNCIABLE
   - Multiplier: 2.5
   ```

### Paso 2: Turno Programado

```
Shift:
- User: Juan Pérez
- ShiftType: "Guardia Larga (12h)"
- StartTime: 25-Dic-2024 08:00
- EndTime: 25-Dic-2024 20:00
- Status: SCHEDULED
```

### Paso 3: Check-in (Inicio del Turno)

```
Usuario marca llegada → actualStartTime = 25-Dic-2024 08:05
Status → IN_PROGRESS
```

### Paso 4: Check-out (Fin del Turno)

```
Usuario marca salida → actualEndTime = 25-Dic-2024 20:30
Status → COMPLETED
```

### Paso 5: Cálculo Automático del Pago

El sistema calcula:

1. **Minutos trabajados:**
   - Programado: 720 minutos (12h)
   - Real: 745 minutos (12h 25min)
   - Extra: 25 minutos

2. **Componentes que aplican:**

   **a) Componente "Pago Guardia Larga"**
   - Aplica porque trabajó "Guardia Larga"
   - Valor: $50,000 (fijo por turno)
   - Calculado: $50,000

   **b) Componente "Pago por Minuto Extra"**
   - Aplica porque trabajó 25 minutos extra
   - Valor: $500/min
   - Calculado: $500 × 25 = $12,500

   **Total Base:** $50,000 + $12,500 = **$62,500**

3. **Multiplicador de Calendario:**
   - Fecha: 25-Dic (Navidad)
   - Multiplicador: 2.5×
   - **Total Final:** $62,500 × 2.5 = **$156,250**

### Paso 6: Registro en ShiftPayment

```sql
ShiftPayment:
  shiftId: [id del turno]
  baseAmount: 62500
  totalAmount: 62500
  calendarMultiplier: 2.5
  finalAmount: 156250
  minutesWorked: 745
  isPartialCompletion: false
  status: CALCULATED
  
  breakdowns:
    - componentName: "Pago Guardia Larga"
      baseValue: 50000
      calculatedValue: 50000
      appliedMinutes: 720
    
    - componentName: "Pago por Minuto Extra"
      baseValue: 500
      calculatedValue: 12500
      appliedMinutes: 25
```

### Paso 7: Pago Mensual Final

Al final del mes:

```
Pago Total de Juan Pérez:
├─ Sueldo Base (ALWAYS): $500,000
└─ Turnos trabajados:
    ├─ Guardia Larga 25-Dic: $156,250
    ├─ Guardia Larga 26-Dic: $125,000 (sin multiplicador)
    └─ Guardia Corta 27-Dic: $75,000
────────────────────────────────────
TOTAL MES: $856,250
```

---

## Ejemplos Prácticos

### Ejemplo 1: Sueldo Base Fijo Sin Turnos

**Escenario:** Empleado administrativo con sueldo fijo mensual, no trabaja turnos.

**Configuración:**
```
Plantilla: "Tarifa Administrativa"
└─ Componente: Sueldo Base
   - Type: BASE_SALARY
   - Value: 800000
   - Unit: MONTHLY
   - ApplyCondition: ALWAYS
```

**Resultado:** Se paga $800,000 cada mes, sin importar asistencia ni turnos.

---

### Ejemplo 2: Pago por Turno Específico

**Escenario:** Médico que cobra por guardia completada, no por horas.

**Configuración:**
```
Plantilla: "Tarifa Médico por Guardia"
└─ Componente: Pago Guardia Médica
   - Type: PER_SHIFT
   - Value: 120000
   - Unit: PER_SHIFT
   - ApplyCondition: SPECIFIC_SHIFT_TYPE
   - ApplicableShiftTypes: ["Guardia Médica 24h"]
```

**Resultado:** 
- Trabaja 3 guardias en el mes
- Pago: $120,000 × 3 = **$360,000**

---

### Ejemplo 3: Pago Mixto (Sueldo + Por Turno)

**Escenario:** Enfermera con sueldo base + bono por guardias nocturnas.

**Configuración:**
```
Plantilla: "Tarifa Enfermería Mixta"
├─ Componente 1: Sueldo Base
│  - Type: BASE_SALARY
│  - Value: 400000
│  - Unit: MONTHLY
│  - ApplyCondition: ALWAYS
│
└─ Componente 2: Bono Guardia Nocturna
   - Type: PER_SHIFT
   - Value: 40000
   - Unit: PER_SHIFT
   - ApplyCondition: SPECIFIC_SHIFT_TYPE
   - ApplicableShiftTypes: ["Guardia Nocturna"]
```

**Resultado:**
- Sueldo base: $400,000
- 4 guardias nocturnas: $40,000 × 4 = $160,000
- **Total:** $560,000

---

### Ejemplo 4: Pago por Minuto con Turno Parcial

**Escenario:** Personal que cobra por minuto trabajado, se enfermó a mitad de turno.

**Configuración:**
```
Plantilla: "Tarifa por Tiempo"
└─ Componente: Pago por Minuto
   - Type: PER_MINUTE
   - Value: 300
   - Unit: PER_MINUTE
   - ApplyCondition: ALWAYS
```

**Turno:**
- Programado: 08:00 - 20:00 (720 minutos)
- Real: 08:00 - 12:00 (240 minutos) ← Se retiró enfermo

**Cálculo:**
```
minutesWorked: 240
totalAmount: $300 × 240 = $72,000
isPartialCompletion: true
finalAmount: $72,000
```

---

### Ejemplo 5: Multiplicadores de Calendario

**Escenario:** Guardia en feriado irrenunciable con multiplicador.

**Configuración:**
```
Plantilla: "Tarifa Estándar"
└─ Componente: Pago por Turno
   - Value: 60000
   - Unit: PER_SHIFT

Calendario:
- Date: 01-Ene-2024
- Type: IRRENUNCIABLE
- Multiplier: 3.0
```

**Cálculo:**
```
baseAmount: $60,000
calendarMultiplier: 3.0
finalAmount: $60,000 × 3.0 = $180,000
```

---

## API y Cálculos

### Función de Cálculo Automático (Pseudocódigo)

```typescript
async function calculateShiftPayment(shiftId: string) {
  const shift = await prisma.shift.findUnique({
    include: {
      shiftType: true,
      contract: {
        include: {
          rateTemplate: {
            include: {
              components: {
                include: {
                  applicableShiftTypes: true
                }
              }
            }
          }
        }
      }
    }
  })

  // 1. Calcular minutos trabajados
  const minutesWorked = calculateMinutes(
    shift.actualStartTime,
    shift.actualEndTime
  )

  // 2. Filtrar componentes que aplican
  const applicableComponents = shift.contract.rateTemplate.components.filter(
    component => {
      // Si es ALWAYS, NO incluir en el pago de turno (es pago base mensual)
      if (component.applyCondition === 'ALWAYS') return false

      // Si es SPECIFIC_SHIFT_TYPE, verificar si aplica a este turno
      if (component.applyCondition === 'SPECIFIC_SHIFT_TYPE') {
        return component.applicableShiftTypes.some(
          ast => ast.shiftTypeId === shift.shiftTypeId
        )
      }

      // Si es por calendario (WEEKEND_ONLY, HOLIDAY_ONLY, etc.)
      return checkCalendarCondition(component, shift.startTime)
    }
  )

  // 3. Calcular valor de cada componente
  let totalAmount = 0
  const breakdowns = []

  for (const component of applicableComponents) {
    let calculatedValue = 0

    switch (component.unit) {
      case 'PER_SHIFT':
        calculatedValue = component.value
        break
      case 'PER_MINUTE':
        calculatedValue = component.value * minutesWorked
        break
      case 'PER_HOUR':
        calculatedValue = component.value * (minutesWorked / 60)
        break
      // ... otros casos
    }

    totalAmount += calculatedValue

    breakdowns.push({
      componentId: component.id,
      componentName: component.customName || component.type,
      componentType: component.type,
      baseValue: component.value,
      calculatedValue,
      appliedMinutes: minutesWorked
    })
  }

  // 4. Aplicar multiplicador de calendario
  const calendarDay = await prisma.organizationCalendar.findUnique({
    where: {
      organizationId_date: {
        organizationId: shift.organizationId,
        date: startOfDay(shift.startTime)
      }
    }
  })

  const calendarMultiplier = calendarDay?.multiplier || 1.0
  const finalAmount = totalAmount * calendarMultiplier

  // 5. Crear registro de pago
  const payment = await prisma.shiftPayment.create({
    data: {
      shiftId: shift.id,
      baseAmount: totalAmount,
      totalAmount,
      calendarMultiplier,
      finalAmount,
      minutesWorked,
      isPartialCompletion: minutesWorked < shift.shiftType.durationMinutes,
      status: 'CALCULATED',
      breakdowns: {
        create: breakdowns
      }
    }
  })

  return payment
}
```

---

## Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Turno completado, pendiente de cálculo |
| `CALCULATED` | Pago calculado automáticamente |
| `APPROVED` | Pago aprobado por supervisor/RRHH |
| `PAID` | Pago efectuado al empleado |
| `DISPUTED` | Pago en disputa, requiere revisión |

---

## Ventajas del Sistema

✅ **Flexibilidad Total** - Cada organización define sus reglas de pago
✅ **Automatización** - Cálculo automático al hacer check-out
✅ **Transparencia** - Desglose completo de cada pago
✅ **Pagos Parciales** - Maneja turnos incompletos correctamente
✅ **Auditoría** - Historial completo de cálculos y aprobaciones
✅ **Multiplicadores** - Integración con calendario (feriados, etc.)
✅ **Sin Código Duro** - Todo configurable por ADMIN_HR

---

## Próximos Pasos

1. **UI para Anexar Componentes a Turnos** - Interfaz para seleccionar ShiftTypes al crear componentes
2. **Check-in/Check-out UI** - Botones para que el staff marque entrada/salida
3. **Dashboard de Pagos** - Vista para aprobar pagos calculados
4. **Reportes Mensuales** - Resumen de pagos por empleado
5. **Exportar a Nómina** - Integración con sistemas de pago externos

---

**Documentación creada:** Febrero 2026  
**Versión:** 1.0
