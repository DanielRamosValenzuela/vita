# VITA — Guía Rápida para Agentes (Cursor / Claude)

Este archivo es el **contexto principal** para cualquier agente que trabaje en VITA: qué es el producto, cómo está armado el proyecto, dónde está la documentación y qué reglas seguir al escribir código.

## 1. Producto y contexto

- **Producto:** Plataforma SaaS B2B **multi-tenant** para gestión de turnos médicos en hospitales y clínicas de Chile.
- **Problema:** Turnos en Excel/sistemas legacy, poca visibilidad, cálculos de pago complejos, conflictos por biometría y múltiples instituciones por persona.
- **Solución:** Calendario digital centralizado, cálculo automático de tarifas, validaciones legales (Código del Trabajo CL), flujos de invitación/vinculación y futuro app móvil.
- **Docs recomendadas:** ver `docs/vita-overview.md`, `docs/vita-business-model.md`, `docs/vita-competitive.md`.

## 2. Stack y arquitectura

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Shadcn UI, lucide-react, next-intl.
- **Backend:** Server Actions (sin API Routes salvo webhooks), Prisma, PostgreSQL (Supabase), Zod, NextAuth v4 (JWT), bcryptjs.
- **Multi-tenant:** BD compartida con `organizationId` en casi todas las entidades; Server Actions siempre deben filtrar por organización.
- **App Router:** rutas principales en `app/[locale]/(global)` y `app/[locale]/dashboard/*`. Detalle en `docs/vita-architecture.md`.

### 2.1 FSD (Feature-Sliced Design)

```text
src/
├── shared/    # Utils, config, tipos, UI primitivos
├── entities/  # Lógica de dominio (area, organization, shift, user, invitation, contract...)
├── features/  # Casos de uso (admin-hr, shifts, auth, profile, super-admin...)
└── widgets/   # Bloques compuestos (dashboard, layout, etc.)
```

**Reglas FSD clave:**

- `features` **no** importan de otras `features`.
- `entities` **no** importan de `features`.
- `shared` **no** importa de `entities`/`features`.
- Revisa `docs/vita-shared-fsd.md` para detalles y ejemplos.

## 3. Roles, dominios y workflows

- **Roles:** `SUPER_ADMIN`, `ADMIN_HR`, `CHIEF_AREA`, `STAFF`.
- **Docs:** `docs/vita-roles.md` y `docs/vita-workflows.md` describen flujos completos por rol.

**Dominios principales:**

- **Organizaciones / SUPER_ADMIN:** CRUD de organizaciones, planes y límites.
- **ADMIN_HR:** configuración de organización, invitaciones, gestión de áreas, tipos de turno, tarifas flexibles y contratos, personal (`/dashboard/admin-hr/*`, `/dashboard/areas`, `/dashboard/shift-types`, `/dashboard/rates`, `/dashboard/staff`).
- **CHIEF_AREA:** gestiona turnos y ve staff solo de sus áreas (via `UserArea`).
- **STAFF:** ve sus turnos y perfil avanzado (múltiples emails, documentos, avatar).

Cuando el usuario pregunte por “cómo funciona X”, prioriza `docs/vita-workflows.md` y `docs/SISTEMA-PAGOS-Y-TARIFAS.md`.

## 4. Modelado de datos (resumen)

- **Organization** → Areas, Users, Invitations, ShiftTypes, Contracts.
- **Area** ↔ **ShiftType** (many-to-many vía `AreaShiftType`).
- **UserArea** vincula usuarios con áreas (jefes y luego staff).
- **Shift** referencia `User`, `Area`, `ShiftType` y en el futuro componentes de tarifa.
- **Contract** conecta `User`, `Area` (opcional) y `RateTemplate` (tarifas flexibles).
- **Diccionario completo:** `docs/DICCIONARIO-BASE-DE-DATOS.md`.

## 5. Convenciones de código

- **i18n:** todo texto visible usa `useTranslations` / `getTranslations`.
  - Claves en `messages/es.json` y `messages/en.json`.
  - El build falla con literales en JSX (`react/jsx-no-literals`).
  - Formatos de fecha/moneda por país en `INTERNACIONALIZACION.md` y `SISTEMA-I18N-VALIDACION.md`.
- **Config:** variables de entorno se leen/validan una sola vez en `src/shared/config/env.server.ts`. No usar `process.env` directo en nuevas piezas; importar `env`.
- **Tipos:** usar modelos de Prisma como fuente de verdad. Para actions usar `ActionResult<T>` (`src/shared/lib/types`).
- **Helpers comunes:** `handleActionError`, `toastActionResult`, `revalidatePaths`, `requireAdminHRWithOrg` en `src/shared/lib`.
- **Formularios + Server Actions:**
  - Usar `useFormAction` + Zod.
  - Manejar `isPending`, deshabilitar submit si no hay cambios (`hasChanges`).
  - Confirmar operaciones destructivas con `AlertDialog`.
- **Estilo:** indentación 2 espacios, seguir configuración de ESLint/Prettier del repo.

## 6. Sistema de tarifas flexibles y pagos

- Implementado en v2.0: plantillas de tarifa (`RateTemplate`) basadas en **componentes modulares** (18 tipos + `CUSTOM`).
- Workflows detallados en `docs/SISTEMA-PAGOS-Y-TARIFAS.md` y secciones de tarifas en `docs/vita-workflows.md`.
- Prioridad actual: cálculo automático de pagos por turno usando estos componentes y calendario organizacional (ver `ESTADO-TARIFAS-FLEXIBLES.md`).

## 7. Documentación y reglas de Cursor

- **Índice de docs:** `docs/README.md`.
- **Plan y roadmap:** `docs/vita-roadmap.md`, `docs/PLAN-INDEX.md`, sesiones por fase `docs/vita-sessions-phase-*.md`.
- **Regla principal de planificación:** `@vita-plan-reference` (resume cómo usar los docs para decisiones de producto/arquitectura).

**Skills relevantes (`.cursor/skills/`):**

- `fsd-react-nextjs` — estructura de carpetas y dependencias FSD.
- `typescript-react-nextjs-best-practices` — patrones de TS/React/Next.js.
- `ui-ux-frontend-design` — decisiones de UI/UX, semántica HTML y accesibilidad.
- `supabase-postgres-best-practices` — optimizar schema/queries (ver su `AGENTS.md` y referencias).

## 8. Cómo trabajar en este repo (para agentes)

1. **Antes de tocar código:** revisar secciones relevantes en `docs/` (overview, architecture, workflows y el doc específico del módulo).
2. **Mantener FSD e i18n:** colocar archivos en la capa correcta y nunca introducir literales de UI sin traducción.
3. **Respetar multi-tenant y roles:** nunca exponer datos de otra organización; usar siempre `organizationId` y utilidades de auth/guardas existentes.
4. **Para nuevas funcionalidades:**
   - Documentar brevemente el flujo en `docs/vita-workflows.md` o el doc que corresponda.
   - Actualizar roadmap si impacta prioridades.
5. **Comandos útiles:** `npm run dev`, `npm run build`, `npm run lint`, `npx prisma generate`, `prisma db push`.
6. **Next.js DevTools MCP:** Siempre consultar el MCP server `next-devtools` (configurado en `.mcp.json`) durante el desarrollo. Usar sus herramientas (`get_errors`, `get_logs`, `get_page_metadata`) para detectar errores de build/runtime/tipos en tiempo real antes y después de cada cambio. Requiere el dev server corriendo (`npm run dev`).

> Para Claude u otros agentes, `CLAUDE.md` es una copia de este archivo y debe mantenerse en sync.
