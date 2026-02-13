# Sistema de Validación de Traducciones (i18n)

> **Detecta traducciones faltantes antes de que lleguen a producción**  
> **Fecha:** Febrero 2026

---

## 📋 Problema

Antes, las traducciones faltantes solo se detectaban cuando el usuario veía un error en la pantalla, causando:

- Mala experiencia de usuario
- Pérdida de tiempo en debugging
- Traducciones incompletas en producción

## ✅ Solución Implementada

Ahora el sistema detecta traducciones faltantes en **3 niveles**:

### 1️⃣ Durante Desarrollo (Runtime)

**Archivo modificado:** `i18n/request.ts`

El sistema ahora incluye:

- **`onError`**: Detecta errores de i18n en consola
- **`getMessageFallback`**: Muestra un mensaje claro cuando falta una traducción

**¿Qué verás en consola?**

```
⚠️  [Missing Translation]
   Namespace: profile
   Key: personalInfo.phone
   Full path: profile.personalInfo.phone
   Error: MISSING_MESSAGE
   ---
```

**En la UI verás:**

```
[MISSING: profile.personalInfo.phone]
```

Esto te permite identificar **inmediatamente** qué traducción falta sin tener que buscar en los archivos.

### 2️⃣ Antes de Hacer Build (Pre-build)

**Script creado:** `scripts/check-translations.js`

**Uso:**

```bash
npm run i18n:check
```

**¿Qué hace?**

1. ✅ Compara todos los archivos de traducción (`messages/es.json`, `messages/en.json`)
2. ✅ Detecta claves faltantes entre idiomas
3. ✅ Detecta claves vacías (`""` o `null`)
4. ✅ Detecta claves extra que no deberían estar
5. ❌ **Bloquea el build si hay errores**

**Ejemplo de salida:**

```bash
🔍 Verificando traducciones...

📊 Total de claves únicas: 1286

❌ Problemas en [ES]:

   📌 Claves faltantes (14):
      - superAdmin.organizations.roles.SUPER_ADMIN
      - superAdmin.createOrganization.form.address
      - adminHR.rates.rateTemplateForm.name

❌ Se encontraron problemas en las traducciones.
   Por favor, corrige los archivos en la carpeta "messages/"
```

### 3️⃣ Durante el Build (Pre-producción)

**Archivo modificado:** `package.json`

El script `npm run build` ahora ejecuta:

```bash
npm run lint && npm run i18n:check && next build
```

**Esto significa:**

- ❌ **No puedes hacer build si faltan traducciones**
- ✅ Garantiza que producción siempre tiene traducciones completas
- ✅ Detecta errores antes de desplegar

---

## 🚀 Comandos Disponibles

| Comando              | Descripción                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run i18n:check` | Valida traducciones (sin hacer build)                |
| `npm run build`      | Valida traducciones + lint + build                   |
| `npm run dev`        | Desarrollo (logs en consola cuando falta traducción) |

---

## 🛠️ Cómo Corregir Traducciones Faltantes

### Opción 1: Manual

1. Ejecuta `npm run i18n:check`
2. Copia la lista de claves faltantes
3. Agrégalas a `messages/es.json` y `messages/en.json`
4. Ejecuta nuevamente `npm run i18n:check` hasta que pase ✅

### Opción 2: Durante desarrollo

1. Ejecuta `npm run dev`
2. Navega por la aplicación
3. Busca en consola los mensajes `[Missing Translation]`
4. Agrega las traducciones faltantes a los archivos JSON

---

## 📦 Estructura de Archivos de Traducción

```
messages/
├── es.json   (Idioma base, español)
└── en.json   (Idioma secundario, inglés)
```

**Reglas:**

- ✅ Todas las claves en `es.json` **deben** estar en `en.json`
- ✅ Todas las claves en `en.json` **deben** estar en `es.json`
- ❌ No dejar claves vacías (`""` o `null`)
- ❌ No usar claves que no se usan en el código

---

## 🔍 Ejemplo: Agregar Nueva Traducción

**1. Agrega la clave en `messages/es.json`:**

```json
{
  "profile": {
    "personalInfo": {
      "phone": "Teléfono",
      "phoneLabel": "Número de teléfono",
      "phonePlaceholder": "+56 9 1234 5678"
    }
  }
}
```

**2. Agrega la misma estructura en `messages/en.json`:**

```json
{
  "profile": {
    "personalInfo": {
      "phone": "Phone",
      "phoneLabel": "Phone number",
      "phonePlaceholder": "+1 (555) 123-4567"
    }
  }
}
```

**3. Valida:**

```bash
npm run i18n:check
```

**4. Usa en tu código:**

```tsx
import { useTranslations } from 'next-intl'

export function PhoneInput() {
  const t = useTranslations('profile.personalInfo')

  return <Input label={t('phoneLabel')} placeholder={t('phonePlaceholder')} />
}
```

---

## 🐛 Debugging

### El script dice que falta una clave pero yo la veo en el archivo

**Posibles causas:**

1. **Espacios en blanco extra**: `"key "` vs `"key"`
2. **Mayúsculas/minúsculas**: `"Phone"` vs `"phone"`
3. **Anidamiento incorrecto**: Verifica que la estructura JSON coincida

### El script pasa pero sigo viendo `[MISSING: ...]` en la UI

**Posibles causas:**

1. **Reinicia el servidor**: `npm run dev` (Ctrl+C y volver a ejecutar)
2. **Borra `.next`**: `rm -rf .next` (Windows: `rmdir /s .next`)
3. **Verifica el namespace**: Asegúrate de usar el namespace correcto en `useTranslations()`

### Quiero deshabilitar la validación temporalmente

**Para desarrollo:**

```json
// package.json
"scripts": {
  "build": "npm run lint && next build"  // Removimos npm run i18n:check
}
```

⚠️ **No recomendado para producción**

---

## 📚 Recursos

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18next Best Practices](https://www.i18next.com/principles/best-practices)
- [Manejo de errores en next-intl](https://next-intl-docs.vercel.app/docs/usage/configuration#onError)

---

## ✅ Estado Actual

**Ejecutado:** 02/02/2026  
**Resultado:** ❌ 25 traducciones faltantes detectadas

### Traducciones faltantes en ES (14):

- `superAdmin.organizations.roles.*` (4 claves)
- `superAdmin.organizations.actions`
- `superAdmin.createOrganization.form.address`
- `superAdmin.createOrganization.form.phone`
- `adminHR.rates.rateTemplateForm.*` (7 claves)

### Traducciones faltantes en EN (11):

- `superAdmin.organizations.actions.*` (5 claves)
- `superAdmin.createOrganization.form.address.*` (2 claves)
- `superAdmin.organizationDetails.overview.updatedAt`
- `adminHR.areas.form.icon*` (3 claves)

**Próximo paso:** Corregir estas traducciones antes del próximo build.

---

## 🎯 Beneficios

✅ Detecta errores **antes** de que lleguen a producción  
✅ Ahorra tiempo en debugging  
✅ Mejora la experiencia de usuario  
✅ Garantiza traducciones completas en todos los idiomas  
✅ Logs claros y útiles durante desarrollo  
✅ Previene builds con traducciones incompletas
