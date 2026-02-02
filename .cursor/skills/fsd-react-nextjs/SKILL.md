---
name: fsd-react-nextjs
description: Applies Feature-Sliced Design (FSD) when structuring React and Next.js code. Use when organizing layers (app, pages, widgets, features, entities, shared), placing new modules, enforcing import rules, or when the user mentions FSD, feature-sliced, or slice architecture.
---

# Feature-Sliced Design (FSD) — React & Next.js

## When to use

Apply this skill when:
- Structuring or reorganizing a React/Next.js codebase by business domains
- Deciding where to place a new component, hook, API call, or page
- Enforcing or reviewing import direction and public API
- Aligning Next.js App Router with FSD layers

---

## Layers (top → bottom)

Order of responsibility and dependencies; **a layer may only import from layers below**.

| Layer     | Purpose | Slices |
|-----------|---------|--------|
| **app**   | App-wide: providers, global styles, router config, store | Segments only (no slices) |
| **pages** | Screens; one route (or group) per slice | Yes |
| **widgets** | Large self-contained UI blocks; reused or page-sized | Yes |
| **features** | User-facing actions (auth, submit form, search) | Yes |
| **entities** | Business concepts (user, order, product) | Yes |
| **shared**  | UI kit, lib, api client, config, i18n | Segments only |

- **Processes** layer is deprecated; put that logic in `app` or `features`.
- Not every project needs every layer; typical minimum: `shared`, `pages` (or route composition), `app`.

---

## Import Rule

- A **module can only import from layers strictly below** it.
- Within the **same layer**, slices **cannot** import from each other (cross-slice imports break isolation).
- **app** and **shared** are exceptions: they have no slices, so their segments can import each other freely.

Examples:
- `features/auth` may import from `entities/user`, `shared`.
- `features/auth` must **not** import from `features/profile` or `widgets`.
- `entities/user` must **not** import from `entities/organization` (use cross-slice API with `@x` if needed; see reference).

---

## Public API (index)

- Each **slice** exposes a single public API via `index.ts` (or `index.tsx`).
- Other layers **import only from the slice's index**, not from internal segments (e.g. `ui/button.tsx`).

```ts
// ✅ Allowed: import from public API
import { LoginForm } from '@/src/features/auth';
import { useUser } from '@/src/entities/user';

// ❌ Avoid: import from segment
import { LoginForm } from '@/src/features/auth/ui/login-form';
```

- Re-export in the slice's `index` only what other layers need; keep internals private.

---

## Segments (inside a slice or app/shared)

Common segments and what belongs there:

| Segment | Use for |
|---------|--------|
| **ui**  | Components and UI of the slice |
| **api** | Requests, server actions, route handlers logic |
| **model** | State, stores, types, validation (entities/features) |
| **lib**  | Helpers, pure logic, constants used only in this slice |
| **config** | Feature flags, slice-specific config |
| **types** | Types used in the slice (or re-export from model) |

- Prefer clear segment names (e.g. `api`, `lib`) over generic ones (`utils`, `helpers`).
- **shared** typically has: `ui`, `lib`, `api`, `config`, `i18n`, `routes`. **app** may have: `routes`, `store`, `styles`, `providers`, `api-routes`.

---

## What Goes Where

- **entities**: Data shape, validation, repository/API for one concept; small UI to display that entity (card, row). No user "actions" (those are features).
- **features**: Actions users do (login, submit form, add to cart). Often use entities and shared; contain UI + api + model/lib as needed.
- **widgets**: Composite blocks that combine features and entities (sidebar, header, dashboard card). Reused across pages or big enough to deserve a slice.
- **pages**: Composition of widgets/features for one route (or route group). Keep pages thin: compose, don't put big business logic here.
- **shared**: Reusable UI, helpers, API client, config. No business logic; can be business-themed (e.g. logo, layout shell).

---

## Next.js (App Router)

- **Conflict**: Next.js uses `app/` for routes; FSD uses `app` for app-wide code.
- **Recommended**: Keep Next.js `app/` at **project root** for routes only. Keep FSD layers under `src/` (e.g. `src/entities`, `src/features`, `src/widgets`, `src/shared`, and optionally `src/pages`, `src/app`).
- **Route files**: Keep `app/[locale]/.../page.tsx` (and layout) **thin**: compose from `src/pages/...` or directly from `src/widgets` and `src/features`. No heavy logic in route files.
- **API routes**: Implement logic in `src/app/api-routes/` (or similar); re-export in root `app/api/.../route.ts` so Next.js sees the handler.
- **Alternative (full FSD pages)**: Define page slices under `src/pages/example/` with `ui` and public `index`; in root `app/example/page.tsx` do `export { ExamplePage as default } from '@/src/pages/example';`.

---

## Naming and Structure

- **Layers**: lowercase folders (`entities`, `features`, `shared`).
- **Slices**: one folder per slice, name by domain (`user`, `auth`, `organization`).
- **Segments**: lowercase (`ui`, `api`, `lib`, `model`).
- **Public API**: each slice has `index.ts` (or `index.tsx`) at slice root; re-export only public surface.

---

## Checklist for New Code

- [ ] New module is in the correct layer (entity vs feature vs widget vs page vs shared).
- [ ] Imports only from layers below; no cross-slice imports within the same layer (except via @x if used).
- [ ] Other slices import this slice only via its `index` (public API).
- [ ] Segment name reflects purpose (ui, api, lib, model, config), not "components" or "utils".
- [ ] Next.js route files are thin and delegate to FSD layers under `src/`.

---

## Additional Resources

- For segment details, cross-slice `@x` imports, and Next.js folder examples, see [reference.md](reference.md).
