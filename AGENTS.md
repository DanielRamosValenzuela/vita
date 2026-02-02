# VITA - Contexto para Agente IA

Sistema SaaS B2B multi-tenant para gestión de turnos médicos en hospitales y clínicas (Chile). Competidor principal: Rflex.

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

- **i18n:** Todo texto visible debe usar `useTranslations` o `getTranslations`. Keys en `messages/es.json` y `messages/en.json`. Build falla si hay literales en JSX.
- **Tipos:** Usar Prisma para modelos. `ActionResult<T>` en shared/lib/types para respuestas de actions.
- **Utilities:** `handleActionError`, `toastActionResult`, `revalidatePaths`, `requireAdminHRWithOrg` en shared/lib/utils.
- **Hooks:** `useFormAction` para formularios que llaman server actions.
- **Indentación:** 2 espacios. Standard.js para estilo.

## Estructura de Datos Principal

- **Organization** → Areas, Users, Invitations, ShiftTypes, Contracts
- **Area** ↔ **ShiftType** (many-to-many vía AreaShiftType)
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

## Plan de Desarrollo

La documentación está en **docs/** dividida por tema (vita-overview.md, vita-business-model.md, vita-roles.md, vita-architecture.md, vita-roadmap.md, vita-lessons.md, vita-competitive.md). Historial de sesiones por fase en docs/vita-sessions-phase-*.md.

**Uso recomendado:**
- Índice completo: `docs/README.md`
- Índice de búsqueda: `docs/PLAN-INDEX.md`
- Regla Cursor: `@vita-plan-reference`
- Búsqueda semántica en docs/ para secciones específicas

## Próximos Pasos (resumen)

1. Gestión de Personal (`/dashboard/staff`) - ADMIN_HR y CHIEF
2. Modelo UserArea (Jefe ↔ Área) en schema
3. Completar vistas de detalle de organización
4. Testing manual de flujos CRUD

## Comandos

- `npm run dev` - Desarrollo
- `npm run build` - Build (incluye lint)
- `npm run lint` - ESLint
- `npx prisma generate` / `prisma db push` - DB
