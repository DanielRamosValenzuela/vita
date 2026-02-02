# Lecciones Aprendidas y Mejores Prácticas

## React con Next.js

- Usar `suppressHydrationWarning` en elementos dinámicos
- Usar `resolvedTheme` en lugar de `theme` para evitar undefined
- Evitar `useEffect` + `setState` para estado inicial
- Usar `useWatch()` en lugar de `watch()` en React Hook Form
- Patrón `{...register('field', { onChange: ... })}` para onChange custom

## Traducciones (next-intl)

- Usar path completo `t('table.actions')` si la key es objeto
- Mantener estructura consistente entre `es.json` y `en.json`

## FSD

- Tipos locales: inline. Tipos de feature: `features/[name]/lib/types.ts`
- Tipos compartidos: `shared/lib/types/`
- Pages: Server Components. UI interactivo: Client Components
- Server Actions en `features/*/api/`

## Colores y Temas

- Usar variables CSS semánticas (`--primary`, `--destructive`, `--muted`)
- Evitar `text-orange-600`, `text-red-600`; usar `text-destructive`, `text-muted-foreground`

## AlertDialogs

- No usar `window.confirm` ni `window.prompt`
- Usar AlertDialog de Shadcn UI
- Para acciones destructivas: input de confirmación (ej: razón de eliminación)

## Constantes

- Crear constantes tipadas para Roles, InvitationStatus, etc.
- Usar `as const` para inferencia estricta
- Exportar desde `shared/lib/constants/`

## UI (Atomic Design)

- `ui/` - shadcn (atoms)
- `ui/atoms/` - propios
- `ui/molecules/` - componentes compuestos
- Barrel exports en `index.ts`
