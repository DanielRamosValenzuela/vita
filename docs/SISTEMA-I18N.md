# Sistema de Internacionalizacion (i18n)

**Estado**: Implementado

---

## Resumen

VITA soporta multiples paises de Latinoamerica y USA, adaptando automaticamente formatos de fecha, moneda, idiomas y locales de date-fns.

---

## Paises Soportados

| Pais      | Codigo | Moneda   | Formato Fecha | Formato Hora | Separador Miles   |
| --------- | ------ | -------- | ------------- | ------------ | ----------------- |
| Chile     | CL     | CLP ($)  | dd/MM/yyyy    | HH:mm        | Punto (1.000.000) |
| Peru      | PE     | PEN (S/) | dd/MM/yyyy    | HH:mm        | Punto (1.000.000) |
| Colombia  | CO     | COP ($)  | dd/MM/yyyy    | HH:mm        | Punto (1.000.000) |
| Argentina | AR     | ARS ($)  | dd/MM/yyyy    | HH:mm        | Punto (1.000.000) |
| Mexico    | MX     | MXN ($)  | dd/MM/yyyy    | HH:mm        | Punto (1.000.000) |
| USA       | US     | USD ($)  | MM/dd/yyyy    | hh:mm a      | Coma (1,000,000)  |

---

## Arquitectura

### Constantes

- `shared/lib/constants/date-formats.ts` — `COUNTRY_DATE_FORMATS`, `COUNTRY_LOCALES`
- `shared/lib/utils/format.ts` — `CURRENCY_LOCALES` por moneda

### Funciones Helper

**Fechas** (`shared/lib/utils/date.ts`):

```typescript
formatDateByCountry(date, country, { includeTime: false })
// Chile: 15/02/2026 | USA: 02/15/2026

formatDateTimeByCountry(date, country)
// Chile: 15/02/2026 14:30 | USA: 02/15/2026 02:30 PM
```

**Moneda** (`shared/lib/utils/format.ts`):

```typescript
formatCurrencyByCountry(1000000, 'CL')   // $1.000.000
formatCurrencyByCurrency(1000000, 'CLP')  // $1.000.000
parseCurrencyInput('$1.000.000')          // 1000000
```

### Traducciones (next-intl)

- `messages/es.json` (default) y `messages/en.json`
- Namespaces: `common.*`, `dashboard.*`, `adminHR.*`, `staff.*`, `shifts.*`, `profile.*`, `superAdmin.*`, `staffDashboard.*`
- Regla ESLint `react/jsx-no-literals`: el build falla si hay texto en duro en JSX

### Componentes con i18n

- **Input con mascara de moneda** (`shared/ui/input.tsx` con prop `mask`) — usa `getCurrencyMask(currency)` de `shared/lib/utils/input-masks.ts`
- **OrganizationCalendarView** — acepta `country` para nombres de meses
- **CalendarDayForm** — formatea fecha segun pais

---

## Validacion de Traducciones

El sistema detecta traducciones faltantes en 3 niveles:

### 1. Runtime (desarrollo)

En `i18n/request.ts`: `onError` loga a consola, `getMessageFallback` muestra `[MISSING: path.to.key]` en la UI.

### 2. Pre-build

```bash
npm run i18n:check   # Valida sin hacer build
```

Compara `es.json` vs `en.json`, detecta claves faltantes, vacias y extras.

### 3. Build

```bash
npm run build   # Ejecuta lint + i18n:check + next build
```

No se puede hacer build si faltan traducciones.

---

## Buenas Practicas

1. Siempre usar `formatDateByCountry(date, country)` en vez de `date.toLocaleDateString()`
2. Pasar `country` como prop (country != locale)
3. Usar `Input` con `mask={getCurrencyMask(currency)}` para montos
4. No hardcodear formatos de fecha ni separadores de miles

---

## Mascaras de Entrada (react-imask)

El componente `Input` soporta mascaras via prop `mask`. Mascaras disponibles en `shared/lib/utils/input-masks.ts`:

| Mascara           | Ejemplo             | Uso                              |
| ----------------- | ------------------- | -------------------------------- |
| `getCurrencyMask` | `$ 1.000.000`       | Montos segun moneda              |
| `phoneMask`       | `+56 9 1234 5678`   | Telefonos chilenos               |
| `rutMask`         | `12.345.678-9`      | RUT chileno                      |
| `percentageMask`  | `0.00` - `100.00`   | Porcentajes                      |
| `timeMask`        | `08:30`             | Formato HH:MM                    |

Para mascaras custom, seguir la API de IMask (`FactoryArg`). Documentacion: https://imask.js.org/guide.html
