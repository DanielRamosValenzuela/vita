# Sistema de Internacionalización (i18n)

**Fecha**: 2 Febrero 2026  
**Estado**: ✅ Implementado

---

## Resumen

El sistema de internacionalización de Vita soporta múltiples países de Latinoamérica y USA, adaptando automáticamente:
- **Formatos de fecha** (dd/MM/yyyy vs MM/dd/yyyy)
- **Formatos de moneda** (separadores de miles, símbolos)
- **Idiomas** (español e inglés)
- **Locales de date-fns** para nombres de meses y días

---

## Países Soportados

| País | Código | Moneda | Formato Fecha | Formato Hora | Separador Miles |
|------|--------|--------|---------------|--------------|-----------------|
| Chile | CL | CLP ($) | dd/MM/yyyy | HH:mm | Punto (1.000.000) |
| Perú | PE | PEN (S/) | dd/MM/yyyy | HH:mm | Punto (1.000.000) |
| Colombia | CO | COP ($) | dd/MM/yyyy | HH:mm | Punto (1.000.000) |
| Argentina | AR | ARS ($) | dd/MM/yyyy | HH:mm | Punto (1.000.000) |
| México | MX | MXN ($) | dd/MM/yyyy | HH:mm | Punto (1.000.000) |
| USA | US | USD ($) | MM/dd/yyyy | hh:mm a | Coma (1,000,000) |

---

## Arquitectura

### 1. Constantes de Configuración

**`shared/lib/constants/date-formats.ts`**:
```typescript
export const COUNTRY_DATE_FORMATS: Record<Country, string> = {
  CL: 'dd/MM/yyyy',
  PE: 'dd/MM/yyyy',
  CO: 'dd/MM/yyyy',
  AR: 'dd/MM/yyyy',
  MX: 'dd/MM/yyyy',
  US: 'MM/dd/yyyy',
}

export const COUNTRY_LOCALES: Record<Country, Locale> = {
  CL: es,    // date-fns locale español
  PE: es,
  CO: es,
  AR: es,
  MX: es,
  US: enUS,  // date-fns locale inglés
}
```

**`shared/lib/utils/format.ts`**:
```typescript
export const CURRENCY_LOCALES: Record<Currency, string> = {
  CLP: 'es-CL',  // Punto como separador de miles
  COP: 'es-CO',
  ARS: 'es-AR',
  MXN: 'es-MX',
  PEN: 'es-PE',
  USD: 'en-US',  // Coma como separador de miles
  EUR: 'de-DE',
}
```

### 2. Funciones Helper

**Formateo de Fechas** (`shared/lib/utils/date.ts`):
```typescript
// Formatea fecha según país del usuario
formatDateByCountry(date, country, { includeTime: false })
// Chile: 15/02/2026
// USA: 02/15/2026

// Formatea fecha y hora
formatDateTimeByCountry(date, country)
// Chile: 15/02/2026 14:30
// USA: 02/15/2026 02:30 PM
```

**Formateo de Moneda** (`shared/lib/utils/format.ts`):
```typescript
// Formatea moneda según país
formatCurrencyByCountry(1000000, 'CL')
// Chile: $1.000.000

// Formatea moneda según currency
formatCurrencyByCurrency(1000000, 'CLP')
// $1.000.000

// Parsea input del usuario
parseCurrencyInput('$1.000.000')
// 1000000
```

### 3. Componentes con i18n

**CurrencyInput** (`shared/ui/atoms/currency-input.tsx`):
- Acepta prop `currency: Currency`
- Formatea automáticamente según la moneda
- Parsea input del usuario correctamente
- Maneja separadores de miles dinámicos

**OrganizationCalendarView** (`widgets/calendar-view`):
- Acepta prop `country: Country`
- Usa `getLocaleByCountry()` para nombres de meses en español/inglés
- Respeta formato de fecha del país

**CalendarDayForm** (`features/admin-hr/ui`):
- Acepta prop `country: Country`
- Formatea fecha del día seleccionado según país del usuario

---

## Flujo de Uso

### En Server Components

```typescript
// Obtener país del usuario desde sesión
const session = await requireAdminHRWithOrg(locale)
const userCountry = session.country || Country.CL

// Pasar al componente cliente
<CalendarPageClient country={userCountry} />
```

### En Client Components

```typescript
'use client'
import { formatDateByCountry } from '@/src/shared/lib/utils'

function MyComponent({ country }: { country: Country }) {
  const formattedDate = formatDateByCountry(new Date(), country)
  // Chile: 02/02/2026
  // USA: 02/02/2026
}
```

### En Formularios

```typescript
import { CurrencyInput } from '@/src/shared/ui/atoms'

<CurrencyInput
  currency={organization.currency}  // CLP, USD, etc.
  value={amount}
  onChange={setAmount}
  showSymbol
/>
```

---

## Traducciones (next-intl)

**Archivos**:
- `messages/es.json`: Español (default)
- `messages/en.json`: Inglés

**Namespaces organizados por módulo**:
- `common.*`: Textos globales (appName, logout, etc.)
- `dashboard.*`: Navegación y sidebar
- `adminHR.*`: Módulo completo de ADMIN_HR
  - `adminHR.calendar.*`: Calendario organizacional
  - `adminHR.rates.*`: Gestión de tarifas
  - `adminHR.organization.*`: Mi organización
- `staff.*`: Módulo de personal
- `shifts.*`: Gestión de turnos

---

## Ejemplos de Formateo por País

### Chile (CL)

```typescript
// Fecha
formatDateByCountry(new Date(2026, 1, 15), Country.CL)
// "15/02/2026"

// Fecha y hora
formatDateTimeByCountry(new Date(2026, 1, 15, 14, 30), Country.CL)
// "15/02/2026 14:30"

// Moneda
formatCurrencyByCurrency(1500000, Currency.CLP)
// "$1.500.000"
```

### USA (US)

```typescript
// Fecha
formatDateByCountry(new Date(2026, 1, 15), Country.US)
// "02/15/2026"

// Fecha y hora
formatDateTimeByCountry(new Date(2026, 1, 15, 14, 30), Country.US)
// "02/15/2026 02:30 PM"

// Moneda
formatCurrencyByCurrency(1500000, Currency.USD)
// "$1,500,000"
```

---

## Buenas Prácticas

### ✅ Hacer

1. **Siempre usar helpers de formateo**:
   ```typescript
   // ✅ Correcto
   formatDateByCountry(date, user.country)
   
   // ❌ Incorrecto
   date.toLocaleDateString()
   ```

2. **Pasar country como prop**:
   ```typescript
   // ✅ Correcto
   <MyComponent country={session.country} />
   
   // ❌ Incorrecto
   <MyComponent locale="es" />  // locale ≠ country
   ```

3. **Usar CurrencyInput para montos**:
   ```typescript
   // ✅ Correcto
   <CurrencyInput currency={org.currency} />
   
   // ❌ Incorrecto
   <Input type="number" />  // Sin formateo
   ```

### ❌ Evitar

- No hardcodear formatos de fecha (`dd/MM/yyyy`)
- No asumir separador de miles (`.` vs `,`)
- No mezclar `locale` (idioma) con `country` (formatos)

---

## Archivos Clave

### Constantes
- `src/shared/lib/constants/date-formats.ts`
- `src/shared/lib/constants/component-types.ts`
- `src/shared/lib/constants/day-types.ts`

### Utilidades
- `src/shared/lib/utils/date.ts`
- `src/shared/lib/utils/format.ts`

### Componentes
- `src/shared/ui/atoms/currency-input.tsx`
- `src/widgets/calendar-view/organization-calendar-view.tsx`

### Traducciones
- `messages/es.json`
- `messages/en.json`

---

**Última actualización**: 2 Feb 2026, 21:45 hrs
