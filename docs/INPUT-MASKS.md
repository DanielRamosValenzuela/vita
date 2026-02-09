# Sistema de Máscaras de Entrada con react-imask

Este proyecto utiliza **react-imask** para aplicar máscaras de entrada en campos de formulario, proporcionando una mejor experiencia de usuario y validación automática.

## 📦 Dependencias

```json
{
  "react-imask": "^7.x",
  "imask": "^7.x"
}
```

## 🎯 Componente Input Mejorado

El componente `Input` ha sido mejorado para soportar máscaras mediante la prop `mask`:

```typescript
import { Input } from '@/src/shared/ui/input'
import { getCurrencyMask } from '@/src/shared/lib/utils/input-masks'

// Input con máscara de moneda
<Input
  type="text"
  mask={getCurrencyMask(currency, true)}
  value={amount}
  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
/>
```

## 🔧 Máscaras Disponibles

### 1. Máscara de Moneda

Formatea números con separadores de miles y decimales según la moneda:

```typescript
import { getCurrencyMask } from '@/src/shared/lib/utils/input-masks'

// Con símbolo de moneda
<Input
  type="text"
  mask={getCurrencyMask('CLP', true)}
  value={amount}
  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
  placeholder="$ 0"
/>

// Sin símbolo de moneda
<Input
  type="text"
  mask={getCurrencyMask('CLP', false)}
  value={amount}
  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
  placeholder="0"
/>
```

**Formatos por moneda:**
- **CLP** (Chile): `$ 1.000.000` (punto para miles, coma para decimales)
- **USD** (USA): `$ 1,000,000.00` (coma para miles, punto para decimales)
- **COP** (Colombia): `$ 1.000.000` (punto para miles, coma para decimales)
- **ARS** (Argentina): `$ 1.000.000` (punto para miles, coma para decimales)
- **MXN** (México): `$ 1,000,000.00` (coma para miles, punto para decimales)
- **PEN** (Perú): `S/ 1,000,000.00` (coma para miles, punto para decimales)
- **EUR** (Euro): `€ 1.000.000,00` (punto para miles, coma para decimales)

### 2. Máscara de Teléfono

Formato para números telefónicos chilenos:

```typescript
import { phoneMask } from '@/src/shared/lib/utils/input-masks'

<Input
  type="text"
  mask={phoneMask}
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="+56 9 1234 5678"
/>
```

**Formato:** `+56 9 1234 5678`

### 3. Máscara de RUT/DNI

Formato para RUT chileno:

```typescript
import { rutMask } from '@/src/shared/lib/utils/input-masks'

<Input
  type="text"
  mask={rutMask}
  value={rut}
  onChange={(e) => setRut(e.target.value)}
  placeholder="12.345.678-9"
/>
```

**Formato:** `12.345.678-9`

### 4. Máscara de Porcentaje

Para valores porcentuales (0-100):

```typescript
import { percentageMask } from '@/src/shared/lib/utils/input-masks'

<Input
  type="text"
  mask={percentageMask}
  value={percent}
  onChange={(e) => setPercent(parseFloat(e.target.value) || 0)}
  placeholder="0.00"
/>
```

**Formato:** `0.00` - `100.00`

### 5. Máscara de Hora

Formato de hora HH:MM:

```typescript
import { timeMask } from '@/src/shared/lib/utils/input-masks'

<Input
  type="text"
  mask={timeMask}
  value={time}
  onChange={(e) => setTime(e.target.value)}
  placeholder="HH:MM"
/>
```

**Formato:** `08:30`, `14:45`

## 📝 Crear Máscaras Personalizadas

Puedes crear máscaras personalizadas siguiendo la API de IMask:

```typescript
import type { FactoryArg } from 'imask'

// Máscara custom para código postal
export const zipCodeMask: FactoryArg = {
  mask: '0000000',
  lazy: false,
}

// Máscara custom para placa de auto
export const licensePlateMask: FactoryArg = {
  mask: 'AAAA-00',
  definitions: {
    A: /[A-Z]/,
    '0': /[0-9]/,
  },
  lazy: false,
}

// Uso
<Input
  type="text"
  mask={licensePlateMask}
  value={plate}
  onChange={(e) => setPlate(e.target.value)}
  placeholder="ABCD-12"
/>
```

## 🎨 Callback avanzado (onMaskAccept)

Para casos donde necesites el valor con formato y sin formato:

```typescript
<Input
  type="text"
  mask={getCurrencyMask('CLP', true)}
  value={amount}
  onMaskAccept={(maskedValue, unmaskedValue) => {
    console.log('Con formato:', maskedValue)     // "$ 1.000.000"
    console.log('Sin formato:', unmaskedValue)   // "1000000"
  }}
  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
/>
```

## 🔍 Documentación Completa

Para más información sobre opciones y configuraciones, consulta la documentación oficial:

- **react-imask:** https://imask.js.org/guide.html
- **Máscaras numéricas:** https://imask.js.org/guide.html#masked-number
- **Máscaras de fecha:** https://imask.js.org/guide.html#masked-date
- **Máscaras personalizadas:** https://imask.js.org/guide.html#masked-pattern

## ✅ Ventajas

- ✅ **Performance excelente** - Sin lag al escribir
- ✅ **Cursor inteligente** - Se mantiene en la posición correcta
- ✅ **Validación automática** - Impide valores inválidos
- ✅ **TypeScript** - Tipos completos y autocompletado
- ✅ **Un solo componente** - Reutilizas `Input` para todo
- ✅ **Mantenible** - Librería activamente mantenida
- ✅ **Flexible** - Soporta cualquier tipo de máscara

## 🗑️ Componentes Obsoletos

Los siguientes componentes han sido eliminados:

- ❌ `CurrencyInput` - Reemplazado por `Input` con `mask={getCurrencyMask()}`

Use siempre el componente `Input` con la prop `mask` para inputs con formato.
