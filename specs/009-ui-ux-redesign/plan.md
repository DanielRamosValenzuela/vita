# Implementation Plan: Full UI/UX Redesign

**Branch**: `009-ui-ux-redesign` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-ui-ux-redesign/spec.md`

## Summary

Full UI/UX redesign of VITA covering: landing page, secondary public pages (fully redesignable), login/register (visual redesign + UX improvements like password toggle), navigation/footer, and dashboard visual polish. Public pages under `(global)` have no restrictions — they can be deleted, renamed, or rebuilt from scratch. Dashboard preserves all functionality. Uses mixed strategy: replace simple sections with 21st.dev components, enhance complex ones in-place. Framer Motion is the primary animation library. All changes respect TweakCN theme system and i18n.

## Technical Context

**Language/Version**: TypeScript strict, React 19, Next.js 16 (App Router)
**Primary Dependencies**: Tailwind CSS v4, Shadcn UI, lucide-react, next-intl, Framer Motion (new)
**Storage**: N/A (no data changes)
**Testing**: `npm run build`, `npm run lint`, manual visual testing across 3 viewports (375px, 768px, 1440px), manual auth flow testing
**Target Platform**: Web (all modern browsers)
**Project Type**: Web application (FSD architecture)
**Performance Goals**: LCP < 2.5s, CLS < 0.1, animations at 60fps using GPU-accelerated properties
**Constraints**: Dashboard = functionality preserved; Public pages = fully redesignable; Auth pages = preserve logic, redesign visuals + add password toggle; all text via i18n; theme-compatible (TweakCN CSS variables); `prefers-reduced-motion` support
**Scale/Scope**: ~20 widget/section components to modify, 10 public pages (fully changeable), 2 auth pages (visual + UX), dashboard shell + sidebar (polish only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | All modifications stay in `widgets/`, `shared/`, and `features/auth/ui/` layers. No cross-layer violations. New animation utilities go in `shared/lib/` or `shared/ui/`. Auth form modifications stay within `features/auth/ui/`. |
| II. Mandatory i18n | PASS | FR-011 requires all text via i18n. New translation keys MAY be added for redesigned pages and password toggle labels, in both `es.json` and `en.json`. |
| III. Multi-Tenant Isolation | N/A | No data queries, no Server Actions modified. Purely frontend visual layer. |
| IV. Testing Standards | PASS | `npm run build` and `npm run lint` required. Manual visual QA across viewports. Manual auth flow testing for login/register. SC-007 requires no test regressions. |
| V. Consistent UX & Accessibility | PASS | Uses Shadcn UI primitives. FR-003 mandates theme CSS variables only. FR-005 mandates `prefers-reduced-motion`. Password toggle MUST be keyboard-accessible with proper aria-label. |
| VI. Technology Stack Governance | VIOLATION (justified) | Adding Framer Motion as new dependency. See Complexity Tracking below. |

## Project Structure

### Documentation (this feature)

```text
specs/009-ui-ux-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: component architecture (no DB model)
├── quickstart.md        # Phase 1: developer setup guide
├── contracts/           # Phase 1: component interface contracts
│   ├── animation-primitives.md
│   └── section-components.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── lib/
│   │   └── animations/          # New: Framer Motion utilities & hooks
│   │       ├── use-scroll-animation.ts
│   │       ├── use-counter-animation.ts
│   │       ├── motion-variants.ts
│   │       └── reduced-motion.ts
│   └── ui/
│       └── motion/              # New: Reusable animated wrapper components
│           ├── motion-section.tsx
│           ├── motion-card.tsx
│           ├── motion-stagger.tsx
│           └── index.ts
├── features/
│   └── auth/
│       └── ui/
│           ├── login-form.tsx       # Enhance: add password toggle, visual polish
│           └── register-form.tsx    # Enhance: add password toggles, visual polish
├── widgets/
│   ├── hero-section/            # Enhanced in-place (P1)
│   │   ├── index.tsx
│   │   ├── hero-dashboard-mockup.tsx
│   │   └── hero-floating-elements.tsx
│   ├── landing/                 # Mixed: replace simple, enhance complex (P2)
│   │   ├── social-proof-bar.tsx     # Replace with 21st.dev
│   │   ├── problem-section.tsx      # Fully redesignable
│   │   ├── features-section.tsx     # Fully redesignable
│   │   ├── how-it-works-section.tsx # Fully redesignable
│   │   ├── benefits-by-role-section.tsx # Enhance in-place (complex logic)
│   │   ├── testimonials-section.tsx # Replace with 21st.dev
│   │   ├── pricing-section.tsx      # Enhance in-place (auth + locale logic)
│   │   ├── faq-section.tsx          # Replace with 21st.dev
│   │   └── final-cta-section.tsx    # Fully redesignable
│   ├── main-navbar/             # Enhanced in-place (P4)
│   │   └── index.tsx
│   ├── footer/                  # Fully redesignable (P4)
│   │   └── index.tsx
│   └── dashboard-sidebar/       # Enhanced in-place, preserve logic (P6)
│       ├── index.tsx
│       └── dashboard-shell.tsx
├── app/
│   ├── globals.css
│   └── [locale]/
│       ├── (global)/
│       │   ├── page.tsx             # Landing page wrapper
│       │   ├── login/page.tsx       # Visual redesign (P3)
│       │   ├── register/page.tsx    # Visual redesign (P3)
│       │   ├── about/page.tsx       # Fully redesignable (P5)
│       │   ├── contact/page.tsx     # Fully redesignable (P5)
│       │   ├── features/page.tsx    # Fully redesignable (P5)
│       │   ├── pricing/page.tsx     # Fully redesignable (P5)
│       │   ├── support/page.tsx     # Fully redesignable (P5)
│       │   ├── terms/page.tsx       # Fully redesignable (P5)
│       │   └── privacy/page.tsx     # Fully redesignable (P5)
│       └── dashboard/
│           ├── layout.tsx           # Dashboard layout (P6, preserve logic)
│           └── page.tsx
```

**Structure Decision**: Follows existing FSD architecture. New animation primitives go in `shared/lib/animations/` (utilities) and `shared/ui/motion/` (reusable components). Auth form enhancements stay in `features/auth/ui/`. No new FSD layers or cross-layer imports introduced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Adding Framer Motion dependency (Principle VI) | Spec requires scroll-triggered animations, staggered reveals, layout transitions, counter animations, and gesture handling across 20+ components. These capabilities exceed what CSS/Tailwind alone can provide declaratively. | Pure CSS approach was evaluated (Option A in clarification) but rejected because: (1) scroll-triggered animations require JS Intersection Observer wrappers regardless, (2) stagger orchestration across child elements needs imperative timing, (3) layout animations (AnimatePresence for tab switching) have no CSS equivalent, (4) Framer Motion is the de facto React animation standard with ~30KB gzipped overhead — acceptable for the scope of animations required. |
