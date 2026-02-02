# TypeScript + React + Next.js — Reference

Extended examples for forms, context, middleware, and API routes. See [SKILL.md](SKILL.md) for core instructions.

---

## Forms (React Hook Form + Zod)

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ onSubmit }: { onSubmit: (data: FormValues) => Promise<void> }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

- Use `z.infer<typeof schema>` for form values type.
- Type `onSubmit` and other callbacks explicitly; avoid passing untyped `FormData` from client to server when you can pass a typed object.

---

## Context (typed)

```tsx
'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- Define a single `ContextValue` interface and type `createContext<Value | null>(null)`.
- Throw in the hook when context is null so callers get a non-null type.

---

## Middleware (Next.js)

```ts
// middleware.ts at project root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = request.cookies.get('locale')?.value ?? 'en';

  // Redirect or rewrite as needed
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
```

- Use `NextRequest` and `NextResponse` from `next/server`.
- Type `config.matcher` as in Next.js docs; avoid `any` in middleware.

---

## API Routes (App Router)

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ name: z.string(), email: z.string().email() });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ?? '1';
  // fetch and return
  return NextResponse.json({ data: [], page: Number(page) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // persist and return
  return NextResponse.json({ success: true, data: parsed.data });
}
```

- Parse request body with Zod (or similar) and use `safeParse`; return 400 with clear errors on failure.
- Type response bodies explicitly when useful (e.g. `NextResponse.json<{ data: User[] }>(...)`).

---

## generateMetadata (Next.js 15+)

```tsx
// app/[locale]/dashboard/[id]/page.tsx
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resource = await fetchResource(id);
  return {
    title: resource.title,
    description: resource.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

- Return type `Metadata`; await `params` before use in Next 15+.

---

## Extending HTML elements

```tsx
import { forwardRef } from 'react';

interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';
```

- Use `ComponentPropsWithoutRef<'input'>` to keep native props and omit `ref` from the spread; add custom props in your interface.
- Forward ref with `forwardRef<HTMLInputElement, InputProps>` and set `displayName` for debugging.
