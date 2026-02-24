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
├── entities/        # Lógica de dominio (area, invitation, organization, rotation, shift, user)
├── features/        # Features por dominio (admin-hr, auth, rotations, shifts, profile, super-admin)
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
- `app/[locale]/dashboard/rotations` - Rotativas de turno (lista)
- `app/[locale]/dashboard/rotations/[id]` - Detalle de rotativa
- `app/[locale]/dashboard/admin-hr/organization` - Mi Organización
- `app/[locale]/dashboard/organizations` - Organizaciones (SUPER_ADMIN)

## i18n (next-intl)

- Idiomas: español (default), inglés
- Keys en `messages/es.json` y `messages/en.json`
- Build falla si hay literales en JSX (`react/jsx-no-literals`)
- **Formatos por país**: Fechas, moneda, locales automáticos según `Country`
  - Latam: `dd/MM/yyyy`, separador miles `.` (punto)
  - USA: `MM/dd/yyyy`, separador miles `,` (coma)
  - Ver guía completa en [INTERNACIONALIZACION.md](./INTERNACIONALIZACION.md)

## Configuración y variables de entorno

- Variables de entorno se leen y validan **una sola vez** en `src/shared/config/env.server.ts`.
- Auth (`shared/lib/auth/config.ts`) y proxy consumen el objeto `env` exportado; no se usa `process.env` directamente en esos módulos.

## Dashboard responsive

- **Desktop (lg+):** Sidebar fija a la izquierda.
- **Móvil/tablet (&lt; lg):** Sidebar oculta; barra superior con botón hamburguesa que abre un Sheet (drawer) con la misma navegación. Al cambiar de ruta el Sheet se cierra automáticamente.
- Implementación: `DashboardShell` en `src/widgets/dashboard-sidebar/dashboard-shell.tsx` envuelve sidebar + contenido y gestiona el estado del menú móvil.

## Capacitor (app móvil nativa)

- El proyecto **no tiene Capacitor instalado aún**. Para convertirlo en app iOS/Android con Capacitor:
  1. **Opción recomendada:** Next.js con servidor (SSR). Capacitor apunta la WebView a la URL de tu backend (ej. `https://tu-dominio.com`). No hace falta `output: 'export'`; la app es un cliente que consume la misma app desplegada.
  2. **Opción estática:** Si quieres la app totalmente offline, habría que usar `output: 'export'` en `next.config` y limitar funcionalidad a lo que no requiera SSR (auth y datos vía API externa). No es el caso actual (Server Actions, sesión en servidor).
- **Preparación actual:** La UI es responsive (sidebar hamburguesa en móvil), los componentes son estándar web y funcionan en WebView. Cuando añadas Capacitor: `npm i @capacitor/core @capacitor/cli`, `npx cap init`, configurar `capacitor.config.ts` con la URL de la app (o el build estático si migras). Añadir plataformas `ios` y `android` con `npx cap add ios` / `npx cap add android`.
- Documentación oficial: [Capacitor + Next.js](https://capacitorjs.com/docs/getting-started/with-ionic).

## Multi-Tenancy

- BD compartida con `organizationId` en cada entidad
- Server Actions filtran siempre por `organizationId`
- Índices compuestos `(organizationId, ...)` para performance
