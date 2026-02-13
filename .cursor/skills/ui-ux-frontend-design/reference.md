# Reference: Accessibility and Patterns

## WCAG 2.1 criteria (summary)

| Level | Text contrast | Large text contrast |
| ----- | ------------- | ------------------- |
| AA    | 4.5:1         | 3:1                 |
| AAA   | 7:1           | 4.5:1               |

- **Large text**: ≥ 18 px normal or ≥ 14 px bold.
- **Focus visible**: focus indicator must have contrast ≥ 3:1 against the background.

## Common ARIA attributes

| Attribute          | Typical use                                                     |
| ------------------ | --------------------------------------------------------------- |
| `aria-label`       | Short name for controls with no visible text                    |
| `aria-labelledby`  | Reference to id of element that acts as label                   |
| `aria-describedby` | Help or additional description text                             |
| `aria-expanded`    | true/false for accordions, menus, combos                        |
| `aria-haspopup`    | menu, listbox, dialog when opening a popup                      |
| `aria-live`        | polite or assertive for regions that update                     |
| `aria-current`     | page, step for current item in navigation                       |
| `role`             | Use only when HTML has no semantics (e.g. role="button" on div) |

## Rule: Prefer semantic HTML

- `<button>` instead of `<div role="button">`.
- `<nav>` for navigation blocks.
- `<main>` for main content; once per page.
- Use ARIA to complement, not replace, structure and native elements.
