# Propuesta: Sistema de Tarifas Flexible y Separación de Módulos

## 📋 Análisis del Problema

### Estado Actual

**Módulo Personal (`/dashboard/staff`)**:

- Muestra personas, áreas, contratos
- Permite editar contratos
- Permite desvincular personas

**Módulo Tarifas (`/dashboard/rates`)**:

- Gestiona plantillas de tarifas (RateTemplate)
- Gestiona contratos individuales (Contract)
- Muestra toda la información de personal

### Problemas Identificados

1. **Superposición de funcionalidades**: Ambos módulos manejan información similar
2. **Tarifas inflexibles**: `ratePerMinute` es obligatorio en RateTemplate
3. **Falta de opciones**: No se pueden crear tarifas solo con sueldo base o solo por hora
4. **Formateo hardcodeado**: `formatCurrency` usa USD, no considera el país

---

## 🎯 Propuesta de Solución

### 1. Separación Clara de Responsabilidades

#### Módulo Personal (`/dashboard/staff`)

**Objetivo**: Gestión de personas y su vinculación a la organización

**Funcionalidades**:

- ✅ Visualizar lista de personal (jefes + staff)
- ✅ Ver áreas asignadas
- ✅ Ver si tienen contrato activo (sí/no, nombre de tarifa)
- ✅ Desvincular personas de la organización
- ✅ Filtrar por rol, área, estado de contrato
- ❌ NO editar tarifas aquí

#### Módulo Tarifas (`/dashboard/rates`)

**Objetivo**: Gestión exclusiva de tarifas y contratos

**Funcionalidades**:

- ✅ CRUD completo de plantillas de tarifas (RateTemplate)
- ✅ Asignar/editar contratos a personal
- ✅ Ver resumen de contratos activos
- ✅ Estadísticas de tarifas (promedio, rangos, etc.)
- ✅ Crear tarifas flexibles (ver punto 2)

---

### 2. Sistema de Tarifas Flexible

#### Modelos de Tarifa Propuestos

```typescript
enum RateCalculationType {
  ONLY_BASE_SALARY     // Solo sueldo fijo mensual/semanal/diario
  ONLY_PER_MINUTE      // Solo pago por minuto trabajado
  ONLY_PER_HOUR        // Solo pago por hora trabajada
  BASE_PLUS_MINUTE     // Sueldo base + bono por minuto
  BASE_PLUS_HOUR       // Sueldo base + bono por hora
  CUSTOM               // Combinación personalizada
}
```

#### Cambios al Schema de Prisma

**RateTemplate (antes)**:

```prisma
model RateTemplate {
  ratePerMinute   Float           // ❌ OBLIGATORIO
  ratePerHour     Float?          // Opcional pero no usado
  baseSalary      Float?
  baseSalaryUnit  BaseSalaryUnit?
}
```

**RateTemplate (propuesto)**:

```prisma
model RateTemplate {
  name               String
  description        String?
  calculationType    RateCalculationType @default(BASE_PLUS_MINUTE)

  // Todos opcionales, dependen de calculationType
  ratePerMinute      Float?
  ratePerHour        Float?
  baseSalary         Float?
  baseSalaryUnit     BaseSalaryUnit?

  // Validación a nivel de lógica de negocio:
  // - ONLY_BASE_SALARY: requiere baseSalary y baseSalaryUnit
  // - ONLY_PER_MINUTE: requiere ratePerMinute
  // - ONLY_PER_HOUR: requiere ratePerHour
  // - BASE_PLUS_MINUTE: requiere baseSalary, baseSalaryUnit, ratePerMinute
  // - etc.
}
```

**Contract (cambios mínimos)**:

```prisma
model Contract {
  // ... campos actuales
  ratePerHour         Float?  // Añadir este campo
  // El resto se mantiene igual
}
```

#### Ventajas

✅ **Flexibilidad total**: Cada organización define su modelo  
✅ **Escalabilidad**: Fácil añadir nuevos tipos de cálculo  
✅ **Claridad**: El tipo de cálculo está explícito  
✅ **Validación**: Se valida según el tipo elegido

---

### 3. Formateo de Números por País

#### Componente Reutilizable: `CurrencyInput`

**Ubicación**: `src/shared/ui/currency-input.tsx`

**Características**:

- Acepta solo números
- Formatea automáticamente con separador de miles
- Usa la configuración del país de la organización
- Maneja decimales opcionales
- Reutilizable en toda la app

**Formatos por País** (ejemplos):

| País     | Separador Miles | Separador Decimal | Ejemplo    |
| -------- | --------------- | ----------------- | ---------- |
| Chile    | `.`             | `,`               | $1.000.000 |
| USA      | `,`             | `.`               | $1,000,000 |
| Colombia | `.`             | `,`               | $1.000.000 |
| España   | `.`             | `,`               | €1.000.000 |

**Implementación**:

```typescript
// Usa Intl.NumberFormat con la locale del país
const formatter = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  useGrouping: true,
})
```

#### Utilidad: `formatCurrencyByCountry`

**Ubicación**: `src/shared/lib/utils/format.ts`

```typescript
export function formatCurrencyByCountry(
  amount: number,
  country: Country,
  options?: {
    showCurrency?: boolean
    decimals?: number
  }
): string
```

---

### 4. UI/UX Mejorada

#### Módulo Personal

```
┌─────────────────────────────────────────────────┐
│ Personal de la Organización                     │
├─────────────────────────────────────────────────┤
│ [Filtros: Rol | Área | Estado Contrato]        │
├─────────────────────────────────────────────────┤
│ Nombre | Rol | Área | Contrato | Acciones      │
├─────────────────────────────────────────────────┤
│ Juan   | Jefe| Emer.| ✓ Guardia| [Desvincular] │
│ María  | Staff| UCI | ✓ Enfer. | [Desvincular] │
│ Pedro  | Staff| -   | ✗ Sin    | [Desvincular] │
└─────────────────────────────────────────────────┘

Columna "Contrato":
- ✓ + nombre de la tarifa (si tiene)
- ✗ "Sin asignar" (si no tiene)
- Click en el nombre → redirige a /dashboard/rates
```

#### Módulo Tarifas

```
┌─────────────────────────────────────────────────┐
│ Gestión de Tarifas                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Plantillas de Tarifas            [+Nuevo]│   │
│ ├─────────────────────────────────────────┤   │
│ │ Guardia Nocturno                        │   │
│ │ Tipo: Sueldo base + por minuto          │   │
│ │ $800.000/mes + $150/min                 │   │
│ │ 12 contratos activos                    │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Personal con Contratos                   │   │
│ ├─────────────────────────────────────────┤   │
│ │ Nombre | Área | Tarifa | Monto | Acciones│  │
│ │ Juan   | Emer | Guardia| $950K | [Edit]  │  │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Formulario de Plantilla de Tarifa**:

```
┌─────────────────────────────────────────┐
│ Crear Plantilla de Tarifa               │
├─────────────────────────────────────────┤
│ Nombre: [Guardia Nocturno            ] │
│                                         │
│ Tipo de Cálculo:                        │
│ ○ Solo sueldo base                      │
│ ● Sueldo base + bono por minuto         │
│ ○ Sueldo base + bono por hora           │
│ ○ Solo por minuto                       │
│ ○ Solo por hora                         │
│ ○ Personalizado                         │
│                                         │
│ [Campos dinámicos según selección]     │
│                                         │
│ Sueldo Base: [$  800.000] [Mensual ▾]  │
│ Bono por minuto: [$      150]           │
│                                         │
│           [Cancelar]  [Guardar]        │
└─────────────────────────────────────────┘
```

---

## 🚀 Estado de Implementación

### Fase 1: Infraestructura ✅ COMPLETADA

1. ✅ Schema con sistema de componentes (Enfoque C)
2. ✅ `RateTemplate` con relación a `RateComponent`
3. ✅ Enums: `ComponentType`, `ComponentUnit`, `ApplyCondition`, `DayType`, `Currency`
4. ✅ `OrganizationCalendar` para días especiales
5. ✅ `Currency` añadido a `Organization`
6. ✅ Componente `CurrencyInput` reutilizable
7. ✅ Funciones `formatCurrencyByCountry` y `formatCurrencyByCurrency`
8. ✅ Base de datos reseteada y cliente Prisma generado

### Fase 2: API de Tarifas ✅ COMPLETADA

1. ✅ `getRateTemplatesAction` con componentes
2. ✅ `createRateTemplateAction` con componentes
3. ✅ `updateRateTemplateAction` con componentes
4. ✅ `deleteRateTemplateAction` con validaciones
5. ✅ `duplicateRateTemplateAction` para copiar tarifas

### Fase 3: Módulo Tarifas UI (En Progreso)

1. ⏳ Actualizar formulario de RateTemplate con componentes
2. ⏳ UI para añadir/editar/eliminar componentes
3. ⏳ Presets de tarifas comunes
4. ⏳ Vista de lista mejorada con componentes

### Fase 4: Módulo Personal (Pendiente)

1. ⏳ Simplificar tabla: solo mostrar si tiene contrato (✓/✗)
2. ⏳ Eliminar edición de contratos desde Personal
3. ⏳ Añadir link a Tarifas desde columna de contrato

### Fase 5: Testing y Documentación (Pendiente)

1. ⏳ Testing manual de todos los flujos
2. ⏳ Actualizar documentación de usuario
3. ⏳ Ejemplos de uso de componentes

---

## 💡 Recomendaciones Adicionales

1. **Caché de configuración de país**: Evitar consultar la BD en cada formateo
2. **Validaciones Zod por tipo**: Esquemas de validación dinámicos según `calculationType`
3. **Previsualización en formulario**: Mostrar ejemplo de cálculo mientras se llena
4. **Historial de contratos**: Guardar versiones anteriores al editar
5. **Calculadora de tarifas**: Tool para estimar costos antes de crear tarifa

---

## ❓ Decisiones Pendientes

1. ¿Permitir cambiar el tipo de cálculo de una tarifa existente con contratos activos?
2. ¿Migrar automáticamente las tarifas existentes a `BASE_PLUS_MINUTE`?
3. ¿Añadir campo `currency` a Organization para soportar múltiples monedas?
4. ¿Validar que el sueldo base no sea menor que el mínimo legal del país?

---

## 📊 Impacto Estimado

- **Schema changes**: 1 migración
- **Nuevos componentes**: 2 (CurrencyInput, RateTypeSelector)
- **Archivos modificados**: ~8-10
- **Tests necesarios**: ~15-20 casos
- **Tiempo estimado**: 1-2 sesiones de trabajo

---

**¿Procedo con la implementación?**  
Por favor revisa la propuesta y dame feedback sobre:

1. ¿Te gusta el enfoque de `RateCalculationType`?
2. ¿Algo que cambiarías o añadirías?
3. ¿Empezamos por la Fase 1 (infraestructura)?
