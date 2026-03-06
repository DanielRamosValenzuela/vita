# Quickstart: UI/UX Redesign Development

**Branch**: `009-ui-ux-redesign`

## Prerequisites

- Node.js 18+ installed
- Git on branch `009-ui-ux-redesign`

## Setup

```bash
# 1. Install dependencies (adds framer-motion)
npm install framer-motion

# 2. Start dev server
npm run dev

# 3. Open browser
# Landing page: http://localhost:3000/es
# Dashboard: http://localhost:3000/es/dashboard (requires auth)
```

## Development Workflow

### Order of implementation (by priority)

1. **Animation primitives** (`src/shared/lib/animations/`, `src/shared/ui/motion/`) — build reusable foundation first
2. **Hero section** (P1) — highest visual impact, validates animation approach
3. **Landing sections** (P2) — Social Proof, Problem, Features, How It Works, Benefits, Testimonials, Pricing, FAQ. Many are fully redesignable.
4. **Login + Register** (P3) — password visibility toggle + visual redesign. Preserve auth logic.
5. **Navbar + Footer** (P4) — global components, affects all pages
6. **Secondary public pages** (P5) — fully redesignable from scratch (About, Contact, Features, Pricing, Support, Terms, Privacy)
7. **Dashboard polish** (P6) — subtle micro-interactions only, preserve all functionality

### Scope rules

- **Fully redesignable** (can delete/rename/rebuild): all `(global)` pages, landing sections without auth logic, footer
- **Preserve logic** (visual only): hero (auth state), benefits (tab state), pricing (auth+locale), navbar (auth state), login/register forms (auth logic), dashboard
- **New i18n keys**: allowed for redesigned pages and new UX features (password toggle), MUST exist in both `es.json` and `en.json`

### Key files to modify

| Component | Path | Strategy |
|-----------|------|----------|
| Animation hooks | `src/shared/lib/animations/` | Create new |
| Motion components | `src/shared/ui/motion/` | Create new |
| Hero | `src/widgets/hero-section/index.tsx` | Enhance (preserve auth logic) |
| Social Proof | `src/widgets/landing/social-proof-bar.tsx` | Replace (21st.dev) |
| FAQ | `src/widgets/landing/faq-section.tsx` | Replace (21st.dev) |
| Testimonials | `src/widgets/landing/testimonials-section.tsx` | Replace (21st.dev) |
| Problem, Features, HowItWorks, FinalCta | `src/widgets/landing/*.tsx` | Full redesign |
| Benefits | `src/widgets/landing/benefits-by-role-section.tsx` | Enhance (preserve tab logic) |
| Pricing | `src/widgets/landing/pricing-section.tsx` | Enhance (preserve auth+locale) |
| LoginForm | `src/features/auth/ui/login-form.tsx` | Add password toggle + visual polish |
| RegisterForm | `src/features/auth/ui/register-form.tsx` | Add password toggles + visual polish |
| Login page | `app/[locale]/(global)/login/page.tsx` | Full visual redesign |
| Register page | `app/[locale]/(global)/register/page.tsx` | Full visual redesign |
| Navbar | `src/widgets/main-navbar/index.tsx` | Enhance (preserve auth logic) |
| Footer | `src/widgets/footer/index.tsx` | Full redesign |
| Secondary pages | `app/[locale]/(global)/*/page.tsx` | Full redesign |
| Dashboard | `src/widgets/dashboard-sidebar/*.tsx` | Enhance (preserve ALL logic) |

### Validation checkpoints

After each section, verify:

```bash
# Build passes
npm run build

# Lint passes
npm run lint

# Manual checks:
# - Animation works on first viewport entry
# - Animation respects prefers-reduced-motion (toggle in browser DevTools)
# - Component renders correctly in light + dark mode
# - Component renders correctly in at least 2 TweakCN themes
# - Mobile layout has no regressions (375px viewport)
```

## Key Patterns

### Using MotionSection wrapper

```tsx
// Before
<section className="bg-background py-20">
  <div className="container">...</div>
</section>

// After
<MotionSection className="bg-background py-20">
  <div className="container">...</div>
</MotionSection>
```

### Using MotionStagger for card grids

```tsx
// Before
<div className="grid grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>

// After
<MotionStagger className="grid grid-cols-3 gap-6">
  {items.map(item => <MotionCard key={item.id}>...</MotionCard>)}
</MotionStagger>
```

### Password visibility toggle pattern

```tsx
const [showPassword, setShowPassword] = useState(false)

<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    id="password"
    name="password"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

### Theme-safe gradients and glows

```css
/* Use theme variables, never hardcoded colors */
background: linear-gradient(to-br, var(--primary), color-mix(in oklch, var(--primary) 80%, transparent));
box-shadow: 0 0 30px color-mix(in oklch, var(--primary) 20%, transparent);
```

## Useful References

- [Framer Motion docs](https://www.framer.com/motion/)
- Feature spec: `specs/009-ui-ux-redesign/spec.md`
- Component contracts: `specs/009-ui-ux-redesign/contracts/`
- Research decisions: `specs/009-ui-ux-redesign/research.md`
- TweakCN themes: `app/themes.css`
- Existing animations: `app/globals.css` (lines 308-405)
