---
name: ui-ux-frontend-design
description: Applies UI/UX design principles, frontend styling best practices (layout, typography, color, spacing), and HTML semantics and accessibility. Use when designing or implementing interfaces, improving styles, refining UX, or when the user mentions UI, UX, design, styling, semantics, or accessibility.
---

# UI/UX and Frontend Styling

## When to use

Apply this skill when:

- Designing or redesigning screens or components
- Reviewing or improving styles (CSS, Tailwind, design systems)
- Working on HTML semantics or accessibility (a11y)
- The user asks about visual hierarchy, spacing, consistency, or usability
- The user mentions UI, UX, design, styling, semantics, or accessibility

---

## UI/UX principles

### Visual hierarchy

- **One main focus** per view: one dominant element (title, CTA, form).
- **Size and weight**: most important larger or bolder; secondary smaller or lighter.
- **Contrast**: sufficient between text and background (min. 4.5:1 body text, 3:1 large text).
- **Grouping**: related elements close; whitespace to separate groups.

### Consistency

- Same typeface and scale across the app.
- Same border radii, shadows, and spacing (multiples of 4 or 8 px).
- Reusable components (buttons, inputs, cards) with variants, not one-off styles.
- Repeatable interaction patterns (e.g. "Save" on the right, "Cancel" on the left).

### Spacing and rhythm

- **Spacing scale**: 4, 8, 12, 16, 24, 32, 48, 64 (px or rem). Avoid arbitrary values.
- **Breathing room**: avoid crowding; generous margins and padding in lists and forms.
- **Alignment**: implicit or explicit grid; elements aligned vertically and horizontally.

### Feedback and state

- **Hover/focus**: visible change on buttons and links.
- **Loading**: indicator for async actions.
- **Error/success**: clear, visible messages; don’t rely on color alone (use icon or text).
- **Disabled**: distinct look (opacity, cursor) and not clickable.

---

## Frontend styling

### Typography

- **Scale**: 12, 14, 16, 18, 20, 24, 30, 36 (px or rem). Headings 1–2 sizes up, body 14–16.
- **Line-height**: 1.25–1.5 headings, 1.5–1.75 body.
- **Weight**: regular (400) body, medium/semibold (500–600) emphasis, bold (700) headings.
- **Line length**: 45–75 characters for paragraphs; use `max-width` on container if needed.

### Color

- **Limited palette**: primary, secondary, neutrals (grays), success/error/warning/info.
- **Usage**: primary for CTAs and links; neutrals for text and backgrounds; semantic only for states.
- **Dark mode**: use variables for background and text; avoid hard-coded #fff/#000 in components.

### Layout and components

- **Containers**: consistent max-width (e.g. 640, 768, 1024) and centered.
- **Grid/Flex**: Flex for simple rows/columns; Grid for 2+ column layouts or card grids.
- **Responsive**: mobile-first; consistent breakpoints (sm, md, lg); tap targets ≥ 44×44 px on mobile.

### Tailwind / utilities

- Prefer design-system utility classes over arbitrary values.
- Group by type: layout → spacing → typography → color → border/shadow → states.
- Avoid `!important`; use specificity or variants (hover:, focus:, dark:) instead.

---

## Semantics and accessibility

### Semantic HTML

- **Structure**: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>` as appropriate.
- **Headings**: one `<h1>` per page; hierarchy `<h2>` → `<h3>` without skips (no h1 then h4).
- **Lists**: `<ul>`/`<ol>` for lists; `<dl>` for term-definition pairs.
- **Buttons vs links**: `<button>` for actions (submit, open modal); `<a href>` for navigation to a URL.

### Accessibility (a11y)

- **Contrast**: meet WCAG AA (4.5:1 normal text, 3:1 large text).
- **Focus visible**: outline or ring on :focus; do not remove without a visible replacement.
- **Labels**: every `<input>`/`<select>`/`<textarea>` has an associated `<label>` (id/for or wrapped).
- **Icon-only**: descriptive `aria-label` on buttons or links without visible text.
- **Expanded/collapsed**: `aria-expanded`; for menus/combos, `aria-haspopup` and appropriate roles.
- **Dynamic messages**: `aria-live="polite"` (or `assertive`) for toasts and alerts.

### Keyboard interaction

- Interactive elements focusable; use `tabindex="0"` only when needed (avoid positive values).
- Logical tab order; don’t hide with `tabindex="-1"` except for modals or specific patterns.
- Enter/Space on buttons; Enter on links. Keyboard clicks handled the same as mouse.

---

## Checklist before closing

- [ ] Clear hierarchy: one main focus and consistent sizes/weights.
- [ ] Spacing on a scale (4/8) and aligned to grid.
- [ ] Colors with sufficient contrast and semantic use.
- [ ] Hover/focus/disabled states visible on controls.
- [ ] Semantic HTML and a single `<h1>` per page.
- [ ] Inputs have labels; icon-only controls have `aria-label`.
- [ ] Focus visible and keyboard navigation tested.

---

## Additional resources

- For WCAG criteria and ARIA patterns, see [reference.md](reference.md).
