# Component Architecture: Full UI/UX Redesign

**Feature**: 009-ui-ux-redesign
**Date**: 2026-03-05

> No database model changes. This document describes the component architecture for animation primitives and enhanced UI sections.

## Animation Primitives (shared/lib/animations/)

### motion-variants.ts

Centralized animation variant definitions used across all sections.

**Variants**:
- `fadeInUp` — opacity 0→1, y 20→0, duration 0.6s
- `fadeIn` — opacity 0→1, duration 0.5s
- `scaleIn` — opacity 0→1, scale 0.95→1, duration 0.5s
- `slideInLeft` — opacity 0→1, x -30→0, duration 0.6s
- `slideInRight` — opacity 0→1, x 30→0, duration 0.6s
- `staggerContainer` — stagger children by 0.1s delay

Each variant includes a `reducedMotion` fallback that resolves to the final visible state instantly (duration: 0).

### use-scroll-animation.ts

Hook wrapping Framer Motion's `useInView` for viewport-triggered animations.

**Parameters**:
- `threshold` (number, default 0.2) — viewport intersection ratio
- `once` (boolean, default true) — trigger only on first entry

**Returns**: `{ ref, isInView }` — ref to attach to container, boolean for conditional rendering/animation.

### use-counter-animation.ts

Hook for animating numeric values (counter effect).

**Parameters**:
- `target` (number) — final value to count to
- `duration` (number, default 2s) — animation duration
- `isInView` (boolean) — triggers animation start

**Returns**: `displayValue` (string) — current animated value formatted for display.

### reduced-motion.ts

Utility that wraps `useReducedMotion` and provides a `getVariant(variant)` helper returning either the animated variant or the instant-resolve fallback.

## Animated Wrapper Components (shared/ui/motion/)

### MotionSection

Wraps a landing page section with viewport-triggered entrance animation.

**Props**:
- `children` (ReactNode)
- `variant` (keyof motion-variants, default 'fadeInUp')
- `className` (string, optional)
- `delay` (number, optional)
- `as` (HTML element tag, default 'section')

**Behavior**: Uses `use-scroll-animation` hook internally. Renders a Framer Motion `motion[as]` element with the selected variant.

### MotionCard

Wraps a card element with hover micro-interactions.

**Props**:
- `children` (ReactNode)
- `className` (string, optional)
- `hoverScale` (number, default 1.02)
- `hoverElevation` (boolean, default true)

**Behavior**: On hover, applies subtle scale and elevated shadow. Uses CSS transitions for hover (not Framer Motion) to keep interaction lightweight.

### MotionStagger

Container that staggers the entrance of its children.

**Props**:
- `children` (ReactNode)
- `staggerDelay` (number, default 0.1s)
- `className` (string, optional)

**Behavior**: Uses `staggerContainer` variant from motion-variants. Each direct child is wrapped in a `motion.div` with `fadeInUp` variant. Triggers on viewport entry via `use-scroll-animation`.

## Auth Form Enhancements (features/auth/ui/)

### Password Visibility Toggle

Added to both `LoginForm` and `RegisterForm`. Each password field gets an independent toggle.

**State**: `showPassword` (boolean) per field, managed via `useState` (LoginForm) or added to existing `useReducer` state (RegisterForm).

**UI**: A button positioned inside the input container (right side) with `Eye` / `EyeOff` icons from lucide-react.

**Props added to Input wrapper**:
- Toggle button with `type="button"` (prevents form submission)
- `aria-label` with i18n translation key (e.g., `auth.showPassword` / `auth.hidePassword`)
- Input `type` switches between `"password"` and `"text"`

**Preserved logic**: All form submission handlers, validation, error display, signIn/signOut, OAuth, router redirects, country/docNumber formatting remain unchanged.

## Section Modification Map

| Section | Strategy | Key Changes |
|---------|----------|-------------|
| HeroSection | Enhance in-place | Upgrade entrance animations to Framer Motion stagger, add `motion.div` wrappers to badge/h1/p/buttons, enhance floating elements |
| SocialProofBar | Replace (21st.dev) | Counter animation on metrics, staggered fade-in, potential marquee/logo bar pattern |
| ProblemSection | Full redesign | Fully redesignable — new layout, animations, visual treatment |
| FeaturesSection | Full redesign | Fully redesignable — new card designs, animations, layout |
| HowItWorksSection | Full redesign | Fully redesignable — animated step connectors, new visual treatment |
| BenefitsByRoleSection | Enhance in-place | `AnimatePresence` for tab content crossfade/slide transition (has tab state logic) |
| TestimonialsSection | Replace (21st.dev) | Potential carousel/marquee pattern, quote reveal animations |
| PricingSection | Enhance in-place | `MotionStagger` for cards, popular card glow border (has auth + locale logic) |
| FaqSection | Replace (21st.dev) | Animated accordion with smooth height transitions |
| FinalCtaSection | Full redesign | Fully redesignable — enhanced gradient, new layout |
| MainNavbar | Enhance in-place | Scroll-aware shadow/blur enhancement, smooth mobile menu (has auth state logic) |
| Footer | Full redesign | Fully redesignable — new layout, hover effects |
| Login page | Visual redesign | New page layout + card design, password toggle, animations. Preserve LoginForm auth logic |
| Register page | Visual redesign | New page layout + card design, password toggles, animations. Preserve RegisterForm auth logic |
| About page | Full redesign | Fully redesignable — no logic constraints |
| Contact page | Full redesign | Fully redesignable — form is placeholder/disabled |
| Features page | Full redesign | Fully redesignable — no logic constraints |
| Pricing page | Full redesign | Fully redesignable — no logic constraints |
| Support page | Full redesign | Fully redesignable — no logic constraints |
| Terms page | Full redesign | Fully redesignable — no logic constraints |
| Privacy page | Full redesign | Fully redesignable — no logic constraints |
| Dashboard Shell | Enhance in-place | Content area fade-in on route change. Preserve all dashboard logic |
| Dashboard Sidebar | Enhance in-place | Nav item hover transitions, active indicator animation. Preserve all sidebar logic |

## Component Dependency Graph

```text
shared/lib/animations/
  ├── motion-variants.ts          (pure data, no imports)
  ├── reduced-motion.ts           (imports: framer-motion)
  ├── use-scroll-animation.ts     (imports: framer-motion)
  └── use-counter-animation.ts    (imports: framer-motion)

shared/ui/motion/
  ├── motion-section.tsx           (imports: shared/lib/animations/*)
  ├── motion-card.tsx              (imports: shared/lib/animations/reduced-motion)
  ├── motion-stagger.tsx           (imports: shared/lib/animations/*)
  └── index.ts                     (re-exports all)

features/auth/ui/                  (imports: shared/ui, lucide-react — NO new layer imports)

widgets/hero-section/              (imports: shared/ui/motion, shared/lib/animations)
widgets/landing/*                  (imports: shared/ui/motion, shared/lib/animations)
widgets/main-navbar/               (imports: framer-motion directly for scroll detection)
widgets/footer/                    (imports: shared/ui/motion)
widgets/dashboard-sidebar/         (imports: shared/lib/animations for transitions)

app/[locale]/(global)/login/       (imports: features/auth, shared/ui/motion)
app/[locale]/(global)/register/    (imports: features/auth, shared/ui/motion)
app/[locale]/(global)/*/           (imports: shared/ui/motion — fully redesignable)
```

All imports flow downward: `app → widgets/features → shared/ui → shared/lib`. No upward or lateral violations. Auth form modifications stay within `features/auth/ui/` — no FSD boundary crossed.
