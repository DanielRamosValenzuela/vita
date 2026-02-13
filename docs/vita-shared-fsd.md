# shared (FSD)

Capa **shared** del proyecto. Solo segmentos (sin slices). Otros layers importan desde aquí.

## Segmentos

| Segmento   | Ruta             | Uso                                                                                     |
| ---------- | ---------------- | --------------------------------------------------------------------------------------- |
| **config** | `shared/config/` | Variables de entorno (env, isDev). Una sola fuente de verdad para `process.env`.        |
| **lib**    | `shared/lib/`    | Lógica pura, helpers, constantes, auth, db, providers, temas, tipos, validación, utils. |
| **ui**     | `shared/ui/`     | Componentes reutilizables (atoms, molecules, primitivos).                               |
| **hooks**  | `shared/hooks/`  | Hooks reutilizables (ej. `useFormAction`).                                              |

## Dentro de lib

- **auth/** — NextAuth, sesión, RBAC, `requireAdminHR`, etc.
- **constants/** — Constantes compartidas: roles, invitación, turnos, badges, iconos, validación, país. **Un solo punto de entrada:** `shared/lib/constants` (carpeta con `index.ts`).
- **db/** — Cliente Prisma singleton (usado por Server Actions y auth). Punto de entrada: `shared/lib/db`.
- **providers/** — Providers de React (app, tema).
- **themes/** — Temas y utilidades de tema.
- **types/** — Tipos compartidos (ActionResult, mensajes de validación).
- **utils/** — Helpers: `handleActionError`, `cn`, `revalidatePaths`, etc.
- **validation/** — Esquemas/reglas de validación reutilizables.

## Regla de imports

- **shared** solo importa desde dentro de shared (entre segmentos está permitido).
- El resto del proyecto importa desde `@/src/shared/config`, `@/src/shared/lib/...`, `@/src/shared/ui/...`, `@/src/shared/hooks`.
