---
name: typescript-react-nextjs-best-practices
description: Applies TypeScript, React, and Next.js best practices when writing or reviewing code. Use when working with TypeScript in React, Next.js App Router, server/client components, actions, or when the user mentions TS/React/Next.js patterns, typing, or conventions.
---

# TypeScript, React & Next.js Best Practices

## When to use

Apply this skill when:

- Writing or reviewing TypeScript in React/Next.js
- Implementing server or client components
- Typing props, hooks, or route params
- Defining server actions or API routes
- Structuring pages and layouts in the App Router

---

## TypeScript

### Strict Typing

- Prefer `interface` for object shapes (especially for public APIs and props); use `type` for unions, intersections, and mapped types.
- Avoid `any`. Use `unknown` when the type is truly unknown, then narrow with type guards.
- Enable `strict: true` and resolve strict-null issues instead of using non-null assertions (`!`) unless the value is guaranteed.

### Props and Components

```tsx
// Prefer explicit props interface; export if reused
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children?: React.ReactNode
}

export function Button({ label, variant = 'primary', onClick, children }: ButtonProps) {
  // ...
}
```

- Use `React.ReactNode` for `children` when accepting any renderable content.
- Use `React.ComponentPropsWithoutRef<'element'>` or `React.ComponentProps<'component'>` when extending native or library components.

### Hooks

- Type state with the narrowest type that makes sense; avoid optional state when a default is always set.
- Type custom hook return values explicitly:

```tsx
function useCounter(initial = 0): { count: number; increment: () => void } {
  const [count, setCount] = useState(initial)
  const increment = useCallback(() => setCount((c) => c + 1), [])
  return { count, increment }
}
```

- Type `useRef` by usage: `useRef<HTMLInputElement>(null)` for DOM refs, `useRef<ValueType | null>(null)` for mutable values.

### Event Handlers

- Prefer `React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`, etc., over generic `React.SyntheticEvent` when you need target or specific props.

---

## React

### Component Patterns

- Prefer function components; type props at the top.
- Use `React.memo` only when profiling shows benefit; avoid by default.
- Keep components focused; extract sub-components or hooks when a file grows or logic repeats.

### State and Data

- Colocate state; lift only when multiple components need it or when it's shared data (e.g. context).
- Prefer `useCallback`/`useMemo` only when passing to memoized children or when the dependency list is stable and expensive; avoid wrapping everything.

### Accessibility and Semantics

- Use semantic HTML and ARIA where needed; ensure interactive elements are keyboard-accessible and have clear labels.

---

## Next.js (App Router)

### Server vs Client

- Default to Server Components; add `'use client'` only when using hooks, browser APIs, or event handlers.
- Keep client boundaries small: wrap only the interactive subtree in a client component; keep data fetching and layout in server components when possible.

### Routes and Params

- Type dynamic segments and searchParams in page/layout props:

```tsx
// app/[locale]/dashboard/[id]/page.tsx
interface PageProps {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale, id } = await params
  const { q } = await searchParams
  // ...
}
```

- In Next.js 15+, `params` and `searchParams` are Promises; await them before use.

### Data Fetching

- Fetch in server components; pass serializable data to client components (no functions or non-serializable values).
- Use `loading.tsx` and `error.tsx` for loading and error states on routes.

### Server Actions

- Type input with Zod or a similar schema when accepting user input; parse and validate before use.
- Return a result shape (e.g. `{ success: boolean; error?: string; data?: T }`) for consistent client handling.

```tsx
'use server'

import { z } from 'zod'

const schema = z.object({ name: z.string().min(1) })

export async function submitForm(formData: FormData) {
  const parsed = schema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { success: false, error: parsed.error.message }
  // ...
  return { success: true, data: result }
}
```

### Layouts and Metadata

- Type `generateMetadata` return as `Metadata`; use `params` as a Promise when needed (Next 15+).

---

## File and Naming Conventions

- Use PascalCase for components and their files (e.g. `UserProfile.tsx`).
- Use kebab-case or camelCase for utilities, hooks, and non-component modules per project convention.
- Colocate route-specific components under the route folder when they are not shared; use `components/` or `src/shared/ui/` for reusable UI.

---

## Checklist for New Code

- [ ] No `any`; use proper types or `unknown` + narrowing.
- [ ] Page/layout props typed (params, searchParams as Promise when applicable).
- [ ] Server vs client boundary is minimal and intentional.
- [ ] Props interfaces are explicit and exported if reused.
- [ ] Event handlers and refs use correct React types.
- [ ] Server actions validate input and return a clear result shape.
- [ ] No non-serializable data passed from server to client components.

---

## Additional Resources

- For extended examples (forms with React Hook Form + Zod, typed context, middleware, API routes, generateMetadata, extending HTML elements), see [reference.md](reference.md).
