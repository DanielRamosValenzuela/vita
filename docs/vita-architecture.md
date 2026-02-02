# Arquitectura y Stack Tecnológico

## Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **React:** 19 + Server Components + Client Components
- **TypeScript:** Strict mode
- **Estilos:** Tailwind CSS v4 con dark mode
- **UI:** Shadcn UI, lucide-react
- **i18n:** next-intl (ES/EN)
- **Fechas:** date-fns, date-fns-tz (timezone Chile)

### Backend

- **Patrón:** Server Actions (no API Routes salvo webhooks)
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js v4 con JWT
- **Validación:** Zod
- **Hashing:** bcryptjs

### Estado

- **UI Local:** Zustand (sidebar, modales)
- **Server State:** Server Components + Server Actions

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

## Estructura de Rutas (App Router)

- `app/[locale]/(global)/` - Páginas públicas (login, register)
- `app/[locale]/dashboard/` - Dashboard por rol
- `app/[locale]/dashboard/areas` - Áreas (ADMIN_HR)
- `app/[locale]/dashboard/shifts` - Turnos
- `app/[locale]/dashboard/shift-types` - Tipos de turno
- `app/[locale]/dashboard/rates` - Tarifas y contratos
- `app/[locale]/dashboard/admin-hr/organization` - Mi Organización
- `app/[locale]/dashboard/organizations` - Organizaciones (SUPER_ADMIN)

## i18n (next-intl)

- Idiomas: español (default), inglés
- Keys en `messages/es.json` y `messages/en.json`
- Build falla si hay literales en JSX (`react/jsx-no-literals`)

## Configuración y variables de entorno

- Variables de entorno se leen y validan **una sola vez** en `src/shared/lib/config/env.server.ts`.
- Auth (`shared/lib/auth/config.ts`) y proxy consumen el objeto `env` exportado; no se usa `process.env` directamente en esos módulos.

## Multi-Tenancy

- BD compartida con `organizationId` en cada entidad
- Server Actions filtran siempre por `organizationId`
- Índices compuestos `(organizationId, ...)` para performance
