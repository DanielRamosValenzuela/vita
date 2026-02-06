# Estado Actual: Sistema de Tarifas Flexibles

**Fecha**: 2 Febrero 2026  
**Fase**: Sistema Core Completado ✅ (Backend + Frontend)

---

## ✅ Completado

### 1. **Schema de Base de Datos** (100%)

**Modelos Nuevos**:
- ✅ `RateTemplate`: Plantilla de tarifa con componentes
- ✅ `RateComponent`: Componentes individuales de cada tarifa
- ✅ `OrganizationCalendar`: Calendario con días especiales (feriados, etc.)

**Enums Añadidos**:
- ✅ `Currency`: CLP, USD, COP, ARS, MXN, PEN, EUR
- ✅ `ComponentType`: 18 tipos predefinidos + CUSTOM
- ✅ `ComponentUnit`: MONTHLY, BIWEEKLY, WEEKLY, DAILY, PER_SHIFT, PER_MINUTE, PER_HOUR, PERCENTAGE, MULTIPLIER, FIXED_AMOUNT
- ✅ `ApplyCondition`: ALWAYS, WEEKDAY_ONLY, WEEKEND_ONLY, HOLIDAY_ONLY, NIGHT_SHIFT_ONLY, etc.
- ✅ `DayType`: NORMAL, WEEKEND, SATURDAY, SUNDAY, HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM

**Cambios en Modelos Existentes**:
- ✅ `Organization`: añadido `currency` (Currency)
- ✅ `Contract`: simplificado - ahora solo `rateTemplateId` + `customMultiplier` opcional

### 2. **Backend API** (100%)

**Rate Template Actions** (`rate-template-actions.ts`):
- ✅ `getRateTemplatesAction`: Lista plantillas con sus componentes
- ✅ `createRateTemplateAction`: Crea plantilla con componentes
- ✅ `updateRateTemplateAction`: Actualiza plantilla y componentes
- ✅ `deleteRateTemplateAction`: Elimina plantilla (valida que no tenga contratos)
- ✅ `duplicateRateTemplateAction`: Duplica una tarifa existente

**Contract Actions** (`contract-actions.ts`):
- ✅ `getContractsPageDataAction`: Obtiene staff + tarifas + áreas
- ✅ `getStaffPageDataAction`: Versión para CHIEF (solo su personal)
- ✅ `createContractAction`: Asigna tarifa a personal
- ✅ `updateContractAction`: Actualiza contrato
- ✅ `endContractAction`: Finaliza contrato

### 3. **Componentes Reutilizables** (100%)

**CurrencyInput** (`shared/ui/atoms/currency-input.tsx`):
- ✅ Formateo automático según moneda
- ✅ Separadores de miles dinámicos por país
  - Chile: `$1.000.000` (punto como separador)
  - USA: `$1,000,000` (coma como separador)
- ✅ Manejo de decimales opcionales
- ✅ Parsing correcto de input del usuario

**Utilidades de Formateo** (`shared/lib/utils/format.ts`):
- ✅ `formatCurrencyByCountry(amount, country, options)`
- ✅ `formatCurrencyByCurrency(amount, currency, options)`
- ✅ `parseCurrencyInput(value)`: convierte string formateado a número

---

### 4. **UI del Módulo de Tarifas** (100%)

**Completado**:
- ✅ Formulario de creación/edición de RateTemplate (`RateTemplateForm`)
- ✅ UI para añadir/editar/remover componentes (`RateComponentForm`)
- ✅ Vista de lista de tarifas con componentes (`ContractsPage`)
- ✅ Presets de tarifas comunes (guardia nocturno, seguridad, etc.)
- ✅ Asignación de contratos a personal
- ✅ Acciones: crear, editar, duplicar, eliminar plantillas
- ✅ Finalizar contratos de personal

**Archivos Creados**:
- `src/features/admin-hr/ui/rate-template-form.tsx`
- `src/features/admin-hr/ui/rate-component-form.tsx`
- `src/features/admin-hr/ui/contracts-page.tsx` (reescrito)
- `app/[locale]/dashboard/rates/page.tsx` (actualizado)

### 5. **UI del Módulo de Personal** (100%)

**Completado**:
- ✅ Simplificar tabla: mostrar solo si tiene contrato (✓/✗)
- ✅ Columna con nombre de tarifa asignada
- ✅ Eliminar edición de contratos desde aquí
- ✅ Link a módulo de Tarifas para gestión
- ✅ Estadísticas de personal con/sin contrato
- ✅ Alertas para personal sin contrato

**Archivos Creados**:
- `src/features/admin-hr/ui/staff-view-page.tsx`
- `app/[locale]/dashboard/staff/page.tsx` (actualizado)

### 6. **Presets y Plantillas** (100%)

**Completado**:
- ✅ Guardia Salud Estándar (base + minuto + bono nocturno)
- ✅ Seguridad 24/7 (base + multiplicador fin de semana)
- ✅ Freelance por Hora (solo tarifa por hora)
- ✅ Personal Administrativo (solo sueldo base)
- ✅ 10 presets predefinidos con categorías
- ✅ Funciones helper: `getPresetById`, `getPresetsByCategory`

**Archivos Creados**:
- `src/features/admin-hr/lib/rate-presets.ts`

---

### 7. **Internacionalización** (100%)

**Completado**:
- ✅ Traducciones completas en español e inglés para:
  - Formulario de plantillas de tarifas
  - Formulario de componentes de tarifas
  - Tabla de plantillas y contratos
  - Módulo de visualización de personal
  - Enums (ComponentType, ComponentUnit, ApplyCondition, DayType)
  - Mensajes de error y confirmaciones
  - Tooltips explicativos en todos los campos

### 8. **Calendario Organizacional** (100%)

**Completado**:
- ✅ Backend API para gestionar días especiales
- ✅ Vista de calendario mensual interactivo
- ✅ Formulario para marcar días especiales con:
  - Tipo de día (Normal, Fin de Semana, Feriado, Irrenunciable, etc.)
  - Multiplicador de pago personalizado
  - Nombre y descripción del día
- ✅ Tooltips explicativos para cada campo
- ✅ Colores visuales por tipo de día
- ✅ Navegación mes a mes
- ✅ Leyenda de tipos de día

**Archivos Creados** (refactorizado según FSD):
- `src/features/admin-hr/api/calendar-actions.ts` (actions para ADMIN_HR)
- `src/features/admin-hr/data/calendar-repository.ts` (repositorio de datos)
- `src/features/admin-hr/ui/calendar-day-form.tsx` (formulario de edición)
- `src/widgets/calendar-view/organization-calendar-view.tsx` (widget reutilizable)
- `src/shared/lib/constants/day-types.ts` (constantes y helpers)
- `app/[locale]/dashboard/calendar/page.tsx` (página server)
- `app/[locale]/dashboard/calendar/calendar-page-client.tsx` (cliente)

---

## 🔄 En Progreso

Ninguna fase actualmente en progreso.

---

## 📝 Arquitectura del Sistema

### Flujo de Creación de Tarifa

```
ADMIN_HR crea RateTemplate
    ↓
Añade RateComponents
    - Tipo: BASE_SALARY, PER_MINUTE, etc.
    - Valor: monto
    - Unidad: MONTHLY, PER_MINUTE, etc.
    - Condición: ALWAYS, NIGHT_SHIFT_ONLY, etc.
    ↓
Asigna RateTemplate a Contract de un User
    ↓
(Opcional) Añade customMultiplier al contrato
    - Ej: 1.2x para personal senior
```

### Cálculo de Pago (Futuro)

```typescript
function calculateShiftPayment(
  shift: Shift,
  contract: Contract,
  rateTemplate: RateTemplate,
  calendar: OrganizationCalendar
) {
  let totalPay = 0
  
  // 1. Obtener tipo de día desde calendario
  const dayType = calendar.getDayType(shift.date)
  const dayMultiplier = calendar.getMultiplier(shift.date)
  
  // 2. Iterar componentes de la tarifa
  for (const component of rateTemplate.components) {
    // Verificar si el componente aplica para este turno
    if (shouldApplyComponent(component, shift, dayType)) {
      const componentValue = calculateComponentValue(
        component,
        shift,
        dayType
      )
      totalPay += componentValue
    }
  }
  
  // 3. Aplicar multiplicador personalizado del contrato
  if (contract.customMultiplier) {
    totalPay *= contract.customMultiplier
  }
  
  // 4. Aplicar multiplicador del día (feriado, etc.)
  totalPay *= dayMultiplier
  
  return totalPay
}
```

---

## 🎯 Próximos Pasos

### Corto Plazo (Futuras Sesiones)
1. Implementar cálculo de pagos de turnos (integrar componentes + calendario)
2. Vista de resumen de costos por personal
3. Reportes de tarifas y contratos

### Medio Plazo
4. Funcionalidades avanzadas del calendario:
   - Días recurrentes (ej: todos los domingos del año)
   - Importar/exportar feriados nacionales
   - Sugerencias automáticas de multiplicadores según ley del país
5. Simulador de costos antes de asignar tarifa
6. Historial de cambios de contratos

### Largo Plazo
9. Exportación de reportes PDF/Excel
10. Dashboard de análisis de costos
11. Previsualización de nómina mensual

---

## 🚨 Notas Importantes

### Para el Desarrollador
- ✅ Schema completamente nuevo - datos anteriores borrados
- ✅ Todas las acciones validadas con lint
- ✅ Build exitoso (npm run build)
- ✅ UIs antiguas reemplazadas con nuevas versiones
- ✅ Separación clara entre módulo Personal y Tarifas
- ✅ **FSD aplicado correctamente**:
  - Widgets reutilizables en `widgets/calendar-view`
  - Features específicas en `features/admin-hr`
  - Constantes compartidas en `shared/lib/constants`
- ✅ **Sin magic strings**: Uso de enums de Prisma mediante constantes
- ✅ **DRY aplicado**: Código reutilizable entre componentes

### Para el Usuario Final (ADMIN_HR)
- 🎉 Sistema ultra flexible - puedes crear cualquier tipo de tarifa
- 🎉 Formateo automático según país (Chile: $1.000.000)
- 🎉 Componentes reutilizables entre tarifas (duplicar plantillas)
- 🎉 UI completa para gestión de tarifas con tooltips explicativos
- 🎉 Módulo Personal simplificado (solo visualización)
- 🎉 Calendario organizacional para gestionar feriados y días especiales
- 🎉 Multiplicadores de pago personalizables por día

---

## 🔗 Archivos Clave

### Schema
- `prisma/schema.prisma`

### Backend API
- `src/features/admin-hr/api/rate-template-actions.ts`
- `src/features/admin-hr/api/contract-actions.ts`

### Shared (Reutilizable)
- `src/shared/ui/atoms/currency-input.tsx`
- `src/shared/lib/utils/format.ts`
- `src/shared/lib/constants/component-types.ts`
- `src/shared/lib/constants/day-types.ts`

### Widgets (Reutilizables entre roles)
- `src/widgets/calendar-view/organization-calendar-view.tsx`
- `src/widgets/calendar-view/calendar-view-placeholder.tsx`

### Features - Módulo de Tarifas (ADMIN_HR)
- `src/features/admin-hr/ui/rate-template-form.tsx`
- `src/features/admin-hr/ui/rate-component-form.tsx`
- `src/features/admin-hr/ui/contracts-page.tsx`
- `src/features/admin-hr/api/rate-template-actions.ts`
- `app/[locale]/dashboard/rates/page.tsx`

### Features - Módulo de Personal (ADMIN_HR + CHIEF)
- `src/features/admin-hr/ui/staff-view-page.tsx`
- `app/[locale]/dashboard/staff/page.tsx`

### Features - Calendario (ADMIN_HR)
- `src/features/admin-hr/ui/calendar-day-form.tsx`
- `src/features/admin-hr/api/calendar-actions.ts`
- `src/features/admin-hr/data/calendar-repository.ts`
- `app/[locale]/dashboard/calendar/page.tsx`
- `app/[locale]/dashboard/calendar/calendar-page-client.tsx`

### Traducciones
- `messages/es.json` (tooltips + calendario)
- `messages/en.json` (tooltips + calendario)

### Documentación
- `docs/PROPUESTA-TARIFAS-FLEXIBLE.md`
- `docs/ESTADO-TARIFAS-FLEXIBLES.md` (este archivo)

---

**Última actualización**: 2 Feb 2026, 21:15 hrs  
**Estado**: ✅ Sistema Completo (Tarifas + Personal + Calendario)
