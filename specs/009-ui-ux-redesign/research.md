# Research: Full UI/UX Redesign

**Feature**: 009-ui-ux-redesign
**Date**: 2026-03-05

## R1: Framer Motion + React 19 + Next.js 16 Compatibility

**Decision**: Use `framer-motion` (latest v11+) which supports React 19 and Next.js App Router.

**Rationale**: Framer Motion v11+ is fully compatible with React 19 and Server Components. Components using Framer Motion must be client components (`'use client'`), which aligns with the existing pattern in VITA — all widget sections already use `'use client'` for `useTranslations`, `useSession`, and `useState`.

**Alternatives considered**:
- `motion` (lightweight fork) — smaller bundle but less ecosystem support and fewer features for layout animations
- `react-spring` — verbose API, less suited for scroll-triggered animations
- `@formkit/auto-animate` — too limited for the scope required (only entrance/exit, no scroll triggers)

## R2: 21st.dev Component Integration Strategy

**Decision**: Use 21st.dev Magic MCP to discover and copy component source code, adapting it to the existing TweakCN theme and i18n system.

**Rationale**: 21st.dev components are built on shadcn/ui and Tailwind CSS, making them directly compatible with VITA's stack. Components are copied as source (not installed as packages), allowing full customization. The existing TweakCN theme variables (`--primary`, `--background`, etc.) are compatible since both TweakCN and 21st.dev derive from the same shadcn/ui theming system.

**Alternatives considered**:
- Installing 21st.dev as npm package — not available as package, copy-paste is the standard pattern
- Building from scratch — more time-consuming, 21st.dev provides production-tested patterns

## R3: Scroll Animation Pattern

**Decision**: Create a reusable `MotionSection` wrapper component using Framer Motion's `useInView` hook for viewport-triggered animations, with `once: true` to prevent re-triggering.

**Rationale**: A single wrapper component ensures consistent animation behavior across all landing sections. Using `useInView` with `once: true` matches FR-003 (fire only once). The wrapper accepts configurable variants (fade-up, fade-in, slide-left, etc.) for section-specific customization.

**Alternatives considered**:
- CSS-only Intersection Observer — requires custom hook, no stagger support, no AnimatePresence
- Per-section custom animations — inconsistent behavior, code duplication

## R4: Counter Animation for Social Proof

**Decision**: Implement a custom `useCounterAnimation` hook using Framer Motion's `useMotionValue` and `useTransform` to animate numeric values when entering viewport.

**Rationale**: Counter animations (e.g., "500+" counting up from 0) are a standard social proof pattern. Framer Motion's motion values provide smooth interpolation without re-renders. The hook triggers via `useInView` for viewport-aware activation.

**Alternatives considered**:
- `react-countup` library — additional dependency for a single use case
- CSS counter-increment — no smooth interpolation, browser inconsistencies

## R5: Reduced Motion Strategy

**Decision**: Use Framer Motion's built-in `useReducedMotion` hook to conditionally disable all animations. Wrap animation variants with a `reducedMotion` check that falls back to `{ opacity: 1, y: 0 }` (instant visible state).

**Rationale**: Framer Motion natively supports `prefers-reduced-motion` via its `useReducedMotion` hook. By integrating this at the variant level in `motion-variants.ts`, all animated components automatically respect the preference without per-component logic.

**Alternatives considered**:
- CSS `@media (prefers-reduced-motion: reduce)` overrides — doesn't cover JS-driven animations
- Per-component checks — inconsistent, easy to miss

## R6: Theme Compatibility Assessment

**Decision**: All new visual effects (gradients, glows, shadows) must use CSS custom properties from the TweakCN system (`--primary`, `--background`, `--border`, `--muted`, etc.) or relative color functions (`color-mix`, `oklch` adjustments).

**Rationale**: The project defines 20+ theme variants in `themes.css` (e.g., `.theme-soleil`), each overriding the same CSS variables. Using hardcoded colors would break theme switching. The existing `globals.css` already uses `color-mix(in oklch, ...)` for derived colors (e.g., `--calendar-weekend`), establishing the pattern for creating tinted/transparent variants of theme colors.

**Alternatives considered**:
- Tailwind arbitrary values with theme colors — works but less readable
- Hardcoded rgba values — breaks theme switching, rejected per FR-002

## R7: FSD Placement for Animation Utilities

**Decision**: Animation utilities split into two FSD layers:
- `src/shared/lib/animations/` — hooks (`useScrollAnimation`, `useCounterAnimation`), variant definitions, reduced motion helper
- `src/shared/ui/motion/` — reusable React wrapper components (`MotionSection`, `MotionCard`, `MotionStagger`)

**Rationale**: Follows FSD convention: `lib/` for pure utilities/hooks, `ui/` for React components. Both live in `shared/` since they're used across multiple `widgets/`. No entity or feature layer involvement since animations are purely presentational.

**Alternatives considered**:
- Single `shared/lib/animations/` folder with both hooks and components — mixes concerns
- Per-widget animation code — code duplication across 15+ widgets

## R8: Dashboard Animation Scope (P5)

**Decision**: Dashboard polish focuses on three areas: (1) sidebar navigation hover/active transitions, (2) card and table row hover elevation effects, (3) page content entrance fade. No scroll animations in dashboard (content is above-fold or paginated).

**Rationale**: Dashboard content is primarily interactive (forms, tables, modals) not scrollable marketing content. Heavy animations would feel distracting in a work tool. Subtle micro-interactions (150ms hover transitions, fade-in on route change) are appropriate for productivity UX.

**Alternatives considered**:
- Full scroll animations in dashboard — inappropriate for productivity tool UX
- No dashboard changes — rejected per clarification (full scope P1-P6 confirmed)

## R9: Login/Register Password Visibility Toggle Pattern

**Decision**: Add a toggle button inside the password `Input` field using an eye/eye-off icon from lucide-react. Toggle switches the input `type` between `"password"` and `"text"` via local state. Each password field has independent toggle state.

**Rationale**: Password visibility toggle is a standard UX pattern expected by users. The implementation is straightforward: a button with `Eye`/`EyeOff` icon positioned inside the input via relative/absolute positioning or a custom input wrapper. Each field (`password`, `confirmPassword`) maintains its own `showPassword` boolean state. The toggle MUST have an `aria-label` for accessibility.

**Alternatives considered**:
- Checkbox "Show password" below the field — less modern UX, takes extra space
- shadcn/ui `PasswordInput` component — doesn't exist as a standard component, custom implementation needed regardless

## R10: Public Pages Full Redesign Strategy

**Decision**: All public pages under `(global)` (About, Contact, Features, Pricing, Support, Terms, Privacy) are treated as fully redesignable. Their current content is purely presentational — i18n text, static cards, and navigation links. No Server Actions, no data fetching beyond i18n, no auth guards.

**Rationale**: These pages have zero business logic. They use `getTranslations` for text and `Link` for navigation. Their structure, naming, layout, and visual treatment can be completely changed. The only constraints are: (1) maintain i18n for all visible text, (2) use TweakCN theme variables, (3) preserve navigation links that other parts of the app reference (e.g., `/${locale}/contact` linked from landing CTAs).

**Key observation**: The Contact page form is currently disabled (`disabled` prop on all inputs and submit button) — it's a placeholder, not functional. This means even the contact form layout can be freely redesigned.

**Alternatives considered**:
- Conservative approach (add animations only) — rejected by user; full redesign explicitly authorized
- Delete unused pages — possible but keeping them with redesigned content is better for SEO and brand presence

## R11: Login/Register Visual Redesign Scope

**Decision**: Login and Register pages get a full visual redesign of their page wrappers (`login/page.tsx`, `register/page.tsx`) while preserving the auth form components (`LoginForm`, `RegisterForm`) internal logic. The form components themselves receive: (1) password visibility toggles, (2) improved visual styling (card treatment, spacing, animations), (3) no changes to submission handlers, validation, error display, or OAuth flows.

**Rationale**: The page wrappers are simple layout shells — they can be completely redesigned (background, card positioning, animations, decorative elements). The form components contain critical auth logic (signIn, registerAction, Zod validation, error handling, Google OAuth, country/docNumber logic) that MUST be preserved. Adding password toggles is a contained change (new state variable + icon button per password field) that doesn't interfere with form submission.

**Current state analysis**:
- `LoginForm`: email + password fields, remember me checkbox, forgot password link, submit button, Google OAuth button. Missing: password toggle.
- `RegisterForm`: name, email, country select, doc number (with formatting/validation), password + confirm password, submit. Uses `useReducer` for state management. Missing: password toggles on both password fields.

**Alternatives considered**:
- Redesign only the page wrappers, leave forms untouched — would miss the password toggle UX improvement
- Rewrite forms from scratch — too risky, auth logic is complex and tested
