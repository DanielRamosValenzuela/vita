# VITA — Context for AI Agent

This file is the **main context** for the agent: product, stack, architecture, conventions, and how to use Cursor skills and rules.

**Product:** B2B multi-tenant SaaS for medical shift scheduling in hospitals and clinics (Chile). Main competitor: Rflex.

## Stack Tecnológico

- **Frontend:** Next.js 16 (App Router), React, TypeScript (strict), Tailwind CSS v4, Shadcn UI, next-intl (i18n)
- **Backend:** Next.js Server Actions, Prisma, PostgreSQL
- **Auth:** NextAuth.js con Credentials + Google

## Arquitectura FSD (Feature-Sliced Design)

```
src/
├── shared/          # Utilidades, UI primitivos, constantes
│   ├── lib/         # utils, auth, constants, types
│   └── ui/          # Componentes Shadcn + molecules
├── entities/        # Lógica de dominio (area, invitation, organization, shift, user)
├── features/        # Features por dominio (admin-hr, auth, shifts, profile, super-admin)
└── widgets/         # Bloques UI compuestos
```

**Reglas FSD:** Features no importan de otras features. Entities no importan de features. shared no importa de entities/features.

## Convenciones Clave

- **i18n:** Todo texto visible debe usar `useTranslations` o `getTranslations`. Keys en `messages/es.json` y `messages/en.json`. Build falla si hay literales en JSX. Diálogos (Radix) deben tener `Description` o `aria-describedby` para accesibilidad.
- **Config:** Variables de entorno se leen y validan una sola vez en `src/shared/config/env.server.ts`; auth y proxy usan ese objeto.
- **Tipos:** Usar Prisma para modelos. `ActionResult<T>` en shared/lib/types para respuestas de actions.
- **Utilities:** `handleActionError`, `toastActionResult`, `revalidatePaths`, `requireAdminHRWithOrg` en shared/lib/utils.
- **Hooks:** `useFormAction` para formularios que llaman server actions.
- **Formularios modales (edición):** Patrón recomendado: `hasChanges`, botón Guardar deshabilitado si no hay cambios o `isPending`, AlertDialog de confirmación al guardar, redirección al listado tras éxito (ej. tipos de turno, área, tarifas/contratos).
- **Indentación:** 2 espacios. Standard.js para estilo.

## Estructura de Datos Principal

- **Organization** → Areas, Users, Invitations, ShiftTypes, Contracts
- **Area** ↔ **ShiftType** (many-to-many vía AreaShiftType)
- **UserArea** (userId, areaId): vincula usuario a área (jefe de área ↔ áreas que gestiona; futuro: staff ↔ áreas asignadas)
- **Shift** → User, Area, ShiftType
- **Contract** → User, Area, RateTemplate (tarifa por persona)
- **Roles:** SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF_HEALTH

## Rutas Dashboard

- `/dashboard` - Landing por rol
- `/dashboard/areas` - Gestión de áreas (ADMIN_HR)
- `/dashboard/shifts` - Turnos (ADMIN_HR, CHIEF)
- `/dashboard/shift-types` - Tipos de turno
- `/dashboard/rates` - Tarifas y contratos
- `/dashboard/staff` - Gestión de personal (pendiente)
- `/dashboard/admin-hr/organization` - Mi organización
- `/dashboard/organizations` - Organizaciones (SUPER_ADMIN)

## Cursor: Skills and Rules

**Skills** (`.cursor/skills/`) are applied automatically when the task or user message matches their "When to use" triggers:

| Skill | Use when |
|-------|----------|
| **create-skill** | Creating or templating a new Cursor skill |
| **fsd-react-nextjs** | Structuring code, placing modules, FSD layers, or user mentions FSD |
| **typescript-react-nextjs-best-practices** | Writing/reviewing TS, React, Next.js (types, server/client, actions) |
| **ui-ux-frontend-design** | Designing UI, styling, semantics, accessibility, or user mentions UI/UX |

**Rules** (`.cursor/rules/`) are applied when referenced with `@` or by glob/description:

- **@vita-plan-reference** — Plan, roadmap, phases, docs in `docs/`. Use when asking about next steps, architecture, or business decisions.
- Other rules: Accessibility, Best-Practices, Code-Style-Structure, Error-Handling-Validation, Forms-Validation, Naming-Conventions, TypeScript-Configuration, etc.

**Recommendation:** For plan/roadmap questions, mention `@vita-plan-reference` or "plan" so the agent includes the rule.

## Plan de Desarrollo

La documentación está en **docs/** dividida por tema (vita-overview.md, vita-business-model.md, vita-roles.md, vita-architecture.md, vita-roadmap.md, vita-lessons.md, vita-competitive.md). Historial de sesiones por fase en docs/vita-sessions-phase-*.md.

**Uso recomendado:**
- Índice completo: `docs/README.md`
- Índice de búsqueda: `docs/PLAN-INDEX.md`
- Regla Cursor: `@vita-plan-reference`
- Búsqueda semántica en docs/ para secciones específicas

## Próximos Pasos (resumen)

1. ~~Modelo UserArea (Jefe ↔ Área)~~ ✅ En schema. Asignar jefes a áreas desde UI (ADMIN_HR).
2. ~~Gestión de Personal (`/dashboard/staff`) - ADMIN_HR y CHIEF~~ ✅ Página activa: ADMIN_HR ve todo el personal; CHIEF ve solo personal de sus áreas (según UserArea). Sin áreas asignadas: mensaje "Contacta a RRHH".
3. Completar vistas de detalle de organización
4. Testing manual de flujos CRUD

## Comandos

- `npm run dev` - Desarrollo
- `npm run build` - Build (incluye lint)
- `npm run lint` - ESLint
- `npx prisma generate` / `prisma db push` - DB
