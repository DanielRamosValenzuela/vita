# FSD — Reference (React & Next.js)

Segment details, cross-slice imports, and Next.js structure. See [SKILL.md](SKILL.md) for core rules.

---

## Segment Reference

### shared

| Segment    | Contents                                                                                |
| ---------- | --------------------------------------------------------------------------------------- |
| **ui**     | UI kit: Button, Input, Card, etc. No business logic; can be themed (logo, layout).      |
| **lib**    | Focused libraries (dates, format, validation). One concern per lib; avoid dump folders. |
| **api**    | API client, base fetch/axios; optionally shared endpoint helpers.                       |
| **config** | Env vars, feature flags, global config.                                                 |
| **routes** | Route constants or path patterns.                                                       |
| **i18n**   | Translation setup, global strings.                                                      |

### entities (per slice)

| Segment            | Contents                                                                          |
| ------------------ | --------------------------------------------------------------------------------- |
| **ui**             | Small UI for the entity (card, row, badge). Reused across pages; logic via props. |
| **model**          | Types, validation schemas, default values.                                        |
| **api** or **lib** | Repository, API calls for this entity.                                            |
| **index**          | Public API: re-export only what other layers need.                                |

### features (per slice)

| Segment             | Contents                                               |
| ------------------- | ------------------------------------------------------ |
| **ui**              | Forms, buttons, modals that perform the action.        |
| **api**             | Server actions, mutations, API calls for this feature. |
| **model** / **lib** | Validation, internal state, feature-specific helpers.  |
| **config**          | Feature flags for this feature (optional).             |
| **index**           | Public API.                                            |

### widgets (per slice)

| Segment             | Contents                                             |
| ------------------- | ---------------------------------------------------- |
| **ui**              | Composite component(s) that use features + entities. |
| **model** / **api** | Optional; only if widget-specific.                   |
| **index**           | Public API.                                          |

### app

| Segment        | Contents                                                   |
| -------------- | ---------------------------------------------------------- |
| **routes**     | Router config (if not in Next.js app folder).              |
| **store**      | Global store setup.                                        |
| **styles**     | Global CSS, theme.                                         |
| **providers**  | Context providers composition.                             |
| **api-routes** | Route Handler logic (re-exported from root `app/api/...`). |

---

## Cross-Slice Imports (@x)

Slices in the **same layer** must not import each other. When one entity references another (e.g. `Artist` has `songs: Song[]`), use a **cross-reference API** so the dependency is explicit:

- In the **consumer** slice, import from a special segment `@x/<slice-name>`.
- In the **provider** slice, add `@x/<consumer-slice>/` that re-exports only what the consumer needs.

Example: `entities/artist` needs type `Song` from `entities/song`.

**entities/song/@x/artist.ts** (inside `song` slice):

```ts
export type { Song } from '../model/song'
```

**entities/artist/model/artist.ts**:

```ts
import type { Song } from 'entities/song/@x/artist'

export interface Artist {
  name: string
  songs: Song[]
}
```

- Keep `@x` usage rare; prefer putting relations in **features** or **pages** when possible.

---

## Next.js App Router + FSD (folder layout)

**Option A — FSD in src, routes in root app (recommended):**

```
├── app                    # Next.js (root): routes only
│   ├── [locale]
│   │   ├── dashboard
│   │   │   └── page.tsx    # Thin: compose from src
│   │   └── login
│   │       └── page.tsx
│   └── api
│       └── example
│           └── route.ts    # Re-export from src/app/api-routes
├── pages                   # Empty (or README) so Next doesn't use src/pages as router
└── src
    ├── app                 # FSD app layer
    │   ├── api-routes
    │   │   └── get-example.ts
    │   ├── providers
    │   └── styles
    ├── pages               # Optional: page slices (re-exported in app/*/page.tsx)
    │   └── dashboard
    │       ├── index.ts
    │       └── ui
    │           └── dashboard-page.tsx
    ├── widgets
    ├── features
    ├── entities
    └── shared
```

**Thin route file example:**

```tsx
// app/[locale]/dashboard/page.tsx
export { DashboardPage as default } from '@/src/pages/dashboard'
// or compose directly:
// import { DashboardLayout } from '@/src/widgets/dashboard-layout';
// export default function Page() { return <DashboardLayout />; }
```

**API route re-export:**

```ts
// app/api/example/route.ts
export { getExampleData as GET } from '@/src/app/api-routes/get-example'
```

---

## Public API (index) Examples

**entities/user/index.ts:**

```ts
export { UserCard } from './ui/user-card'
export { useUser, type User } from './model'
export { getUserById } from './lib/user-repository'
```

**features/auth/index.ts:**

```ts
export { LoginForm, RegisterForm } from './ui'
export { loginAction, registerAction } from './api'
```

- Do **not** export internal files (e.g. `auth/lib/validation.ts`) from the slice index if they are only used inside the slice.

---

## Slice Isolation Summary

| Rule                | Meaning                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Layers              | Import only from layers **below**.                                                              |
| Slices (same layer) | No direct imports between slices; use public API of lower layers or `@x` for cross-slice types. |
| Public API          | Other code imports only from slice **index**, not from segments.                                |
| app / shared        | No slices; segments can import each other.                                                      |
