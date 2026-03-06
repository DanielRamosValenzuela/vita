# Tasks: Full UI/UX Redesign

**Input**: Design documents from `/specs/009-ui-ux-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual visual testing and `npm run build` / `npm run lint` at each checkpoint. Browser MCP verification at the end.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install Framer Motion dependency and create animation primitive infrastructure

- [x] T001 Install framer-motion dependency via `npm install framer-motion`
- [x] T002 [P] Create animation variants file with fadeInUp, fadeIn, scaleIn, slideInLeft, slideInRight, staggerContainer variants in `src/shared/lib/animations/motion-variants.ts`
- [x] T003 [P] Create reduced motion utility wrapping Framer Motion's useReducedMotion with variant fallback helper in `src/shared/lib/animations/reduced-motion.ts`
- [x] T004 [P] Create useScrollAnimation hook wrapping useInView with once:true default in `src/shared/lib/animations/use-scroll-animation.ts`
- [x] T005 [P] Create useCounterAnimation hook for animated numeric values in `src/shared/lib/animations/use-counter-animation.ts`
- [x] T006 Create barrel export for animation utilities in `src/shared/lib/animations/index.ts`

**Checkpoint**: Animation utilities ready. Run `npm run build` to verify no type errors.

---

## Phase 2: Foundational (Reusable Motion Components)

**Purpose**: Build reusable animated wrapper components used by ALL user stories

- [x] T007 [P] Create MotionSection component (viewport-triggered entrance animation wrapper) in `src/shared/ui/motion/motion-section.tsx`
- [x] T008 [P] Create MotionCard component (hover micro-interactions wrapper) in `src/shared/ui/motion/motion-card.tsx`
- [x] T009 [P] Create MotionStagger component (staggered children entrance) in `src/shared/ui/motion/motion-stagger.tsx`
- [x] T010 Create barrel export for motion components in `src/shared/ui/motion/index.ts`

**Checkpoint**: Foundation ready. Run `npm run build` and `npm run lint`. All motion components importable from `@/src/shared/ui/motion`.

---

## Phase 3: User Story 1 - Visually Compelling First Impression (Priority: P1)

**Goal**: Hero section with enhanced entrance animations, background effects, and CTA micro-interactions. Preserve auth-aware CTA behavior.

**Independent Test**: Load landing page, verify hero animations play on load, CTA buttons have hover effects, authenticated state shows dashboard button.

### Implementation for User Story 1

- [x] T011 [US1] Enhance HeroFloatingElements with Framer Motion animations replacing CSS keyframes in `src/widgets/hero-section/hero-floating-elements.tsx`
- [x] T012 [US1] Enhance HeroDashboardMockup with Framer Motion scaleIn entrance in `src/widgets/hero-section/hero-dashboard-mockup.tsx`
- [x] T013 [US1] Upgrade HeroSection with Framer Motion staggered entrance for badge, h1, description, CTAs, and TrustPills. Enhance button hover micro-interactions. Preserve session-aware CTA logic in `src/widgets/hero-section/index.tsx`
- [x] T014 [US1] Verify hero renders correctly in light/dark mode and 2+ TweakCN themes. Check mobile layout (375px) and prefers-reduced-motion

**Checkpoint**: Hero section fully animated. Run `npm run build`. Visually verify landing page hero at `http://localhost:3000/es`.

---

## Phase 4: User Story 2 - Engaging Content Sections (Priority: P2)

**Goal**: All landing page sections below the hero animate on scroll, have hover interactions, and sections without logic constraints are fully redesigned using 21st.dev as reference.

**Independent Test**: Scroll through full landing page. Each section animates in on first viewport entry. Cards have hover effects. FAQ animates open/close. Metrics count up.

### Implementation for User Story 2

- [x] T015 [P] [US2] Replace SocialProofBar with 21st.dev-inspired component featuring counter animations via useCounterAnimation and staggered entrance in `src/widgets/landing/social-proof-bar.tsx`
- [x] T016 [P] [US2] Redesign ProblemSection with MotionStagger, MotionCard hover effects, and improved visual treatment in `src/widgets/landing/problem-section.tsx`
- [x] T017 [P] [US2] Redesign FeaturesSection with MotionStagger for card grid, MotionCard hover with border glow, and icon animation in `src/widgets/landing/features-section.tsx`
- [x] T018 [P] [US2] Redesign HowItWorksSection with sequential step reveal animation and animated connecting lines between steps in `src/widgets/landing/how-it-works-section.tsx`
- [x] T019 [US2] Enhance BenefitsByRoleSection with AnimatePresence for tab content crossfade transition and section entrance animation. Preserve tab state logic in `src/widgets/landing/benefits-by-role-section.tsx`
- [x] T020 [P] [US2] Replace TestimonialsSection with 21st.dev-inspired component featuring carousel or marquee pattern with staggered reveal in `src/widgets/landing/testimonials-section.tsx`
- [x] T021 [US2] Enhance PricingSection with MotionStagger entrance, popular plan animated glow border, MotionCard hover. Preserve auth + locale logic in `src/widgets/landing/pricing-section.tsx`
- [x] T022 [P] [US2] Replace FaqSection with 21st.dev-inspired animated accordion using AnimatePresence for smooth height transitions in `src/widgets/landing/faq-section.tsx`
- [x] T023 [P] [US2] Redesign FinalCtaSection with enhanced gradient background animation and staggered text/button entrance in `src/widgets/landing/final-cta-section.tsx`
- [x] T024 [US2] Update landing page imports if any component names changed in `app/[locale]/(global)/page.tsx`
- [x] T025 [US2] Add any new i18n keys needed for redesigned sections to both `messages/es.json` and `messages/en.json`
- [x] T026 [US2] Verify all landing sections animate correctly on scroll, hover interactions work, and no layout regressions on mobile (375px)

**Checkpoint**: Full landing page animated. Run `npm run build` and `npm run lint`. Scroll test at `http://localhost:3000/es`.

---

## Phase 5: User Story 3 - Polished Login & Register (Priority: P3)

**Goal**: Login and Register pages get visual redesign + password visibility toggles. All auth logic preserved.

**Independent Test**: Navigate to login and register. Verify password toggle works. Submit valid/invalid credentials. Google OAuth still works. Registration with country/docNumber validation still works.

### Implementation for User Story 3

- [x] T027 [P] [US3] Add password visibility toggle (Eye/EyeOff icons, showPassword state) to LoginForm. Preserve all form submission, validation, and OAuth logic in `src/features/auth/ui/login-form.tsx`
- [x] T028 [P] [US3] Add independent password visibility toggles for password and confirmPassword fields in RegisterForm. Preserve all reducer state, validation, and submission logic in `src/features/auth/ui/register-form.tsx`
- [x] T029 [P] [US3] Add i18n keys `auth.showPassword` and `auth.hidePassword` to both `messages/es.json` and `messages/en.json`
- [x] T030 [US3] Redesign Login page layout with improved card styling, background effects, and entrance animations. Preserve getServerSession redirect and LoginForm import in `app/[locale]/(global)/login/page.tsx`
- [x] T031 [US3] Redesign Register page layout with improved card styling, background effects, and entrance animations. Preserve getServerSession redirect and RegisterForm import in `app/[locale]/(global)/register/page.tsx`
- [x] T032 [US3] Manual test: verify credential login, Google OAuth, registration (all countries), password toggle, error display, and redirect flows all work correctly

**Checkpoint**: Auth pages polished. Run `npm run build`. Test all auth flows manually.

---

## Phase 6: User Story 4 - Enhanced Navigation and Footer (Priority: P4)

**Goal**: Navbar with scroll-aware visual enhancement and smoother mobile menu. Footer with improved design and hover effects.

**Independent Test**: Scroll page to verify navbar shadow/blur transition. Open/close mobile menu. Hover footer links.

### Implementation for User Story 4

- [x] T033 [P] [US4] Enhance MainNavbar with scroll-aware shadow/blur transition using Framer Motion useScroll or scroll event. Improve mobile Sheet animation. Preserve all auth state, settings popover, and nav link logic in `src/widgets/main-navbar/index.tsx`
- [x] T034 [P] [US4] Redesign Footer with improved layout, link hover animations (underline/color transitions), and staggered column entrance. Fully redesignable in `src/widgets/footer/index.tsx`
- [x] T035 [US4] Add any new i18n keys for footer redesign to both `messages/es.json` and `messages/en.json`
- [x] T036 [US4] Verify navbar and footer render correctly across all viewports (375px, 768px, 1440px) and in light/dark mode

**Checkpoint**: Global navigation polished. Run `npm run build`. Check navbar scroll behavior and footer on all pages.

---

## Phase 7: User Story 5 - Redesigned Secondary Public Pages (Priority: P5)

**Goal**: All secondary public pages fully redesigned with modern layouts, entrance animations, and consistent visual language.

**Independent Test**: Navigate to each secondary page. Verify redesigned layout, animations, and responsive behavior.

### Implementation for User Story 5

- [x] T037 [P] [US5] Redesign About page with modern layout, MotionSection wrappers, card animations, and improved visual treatment in `app/[locale]/(global)/about/page.tsx`
- [x] T038 [P] [US5] Redesign Contact page with improved form layout, info cards, and entrance animations in `app/[locale]/(global)/contact/page.tsx`
- [x] T039 [P] [US5] Redesign Features page with animated feature sections, improved icon treatment, and scroll-triggered reveals in `app/[locale]/(global)/features/page.tsx`
- [x] T040 [P] [US5] Redesign Pricing page with animated pricing cards, hover effects, and popular plan highlight in `app/[locale]/(global)/pricing/page.tsx`
- [x] T041 [P] [US5] Redesign Support page with improved layout and entrance animations in `app/[locale]/(global)/support/page.tsx`
- [x] T042 [P] [US5] Redesign Terms page with improved typography and entrance animations in `app/[locale]/(global)/terms/page.tsx`
- [x] T043 [P] [US5] Redesign Privacy page with improved typography and entrance animations in `app/[locale]/(global)/privacy/page.tsx`
- [x] T044 [US5] Add any new i18n keys for redesigned pages to both `messages/es.json` and `messages/en.json`
- [x] T045 [US5] Verify all secondary pages render correctly across viewports and themes. Check all navigation links from footer/navbar still work

**Checkpoint**: All public pages redesigned. Run `npm run build` and `npm run lint`.

---

## Phase 8: User Story 6 - Dashboard Visual Polish (Priority: P6)

**Goal**: Dashboard sidebar and shell have subtle micro-interactions and transitions without any functionality changes.

**Independent Test**: Log in to dashboard. Verify sidebar hover transitions, card hover effects, and page content fade-in. Confirm no data or behavior changes.

### Implementation for User Story 6

- [x] T046 [P] [US6] Add nav item hover transitions (background + subtle scale) and active indicator animation to DashboardSidebar. Preserve all navigation, collapsible behavior, and role-based items in `src/widgets/dashboard-sidebar/index.tsx`
- [x] T047 [P] [US6] Add content area fade-in animation on mount/route change to DashboardShell. Preserve sidebar + content layout and responsive collapse in `src/widgets/dashboard-sidebar/dashboard-shell.tsx`
- [x] T048 [US6] Verify dashboard functionality is fully preserved: navigate all pages, check sidebar collapse, verify role-based menu items appear correctly

**Checkpoint**: Dashboard polished. Run `npm run build`. Manual test all dashboard navigation and features.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, accessibility checks, and build validation

- [x] T049 Verify prefers-reduced-motion disables/minimizes all animations across entire app (toggle in browser DevTools > Rendering > Emulate CSS media feature)
- [x] T050 Verify all pages render correctly with at least 3 different TweakCN themes in both light and dark mode
- [x] T051 Check all pages for hardcoded color values — replace any found with TweakCN CSS variables
- [x] T052 Verify mobile responsiveness across all modified pages at 375px, 768px, and 1440px viewports
- [x] T053 Use Browser MCP to take screenshots and visually verify the complete application flow: landing page scroll, secondary pages, login, register, and dashboard
- [x] T054 Run `npm run build` to verify final production build passes with zero errors
- [x] T055 Run `npm run lint` to verify no linting issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T006 barrel export)
- **User Stories (Phase 3-8)**: All depend on Phase 2 completion (motion components ready)
  - US1-US6 can proceed in priority order OR in parallel if team capacity allows
  - US4 (navbar/footer) improves all pages, so ideally before US5 (secondary pages)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Hero)**: Phase 2 only. No dependencies on other stories.
- **US2 (Landing sections)**: Phase 2 only. Independent of US1 (hero uses different files).
- **US3 (Login/Register)**: Phase 2 only. Independent. Uses motion components for page layout.
- **US4 (Navbar/Footer)**: Phase 2 only. Independent. Recommend before US5 for consistency.
- **US5 (Secondary pages)**: Phase 2 only. Independent. Benefits from US4 being done first (shared nav/footer).
- **US6 (Dashboard)**: Phase 2 only. Fully independent from public page stories.

### Within Each User Story

- Files marked [P] can be modified in parallel (different files)
- i18n key additions should happen alongside or after component changes
- Verification tasks run after all implementation tasks in that phase

### Parallel Opportunities

- T002-T005 (Phase 1 animation utilities): all parallel
- T007-T009 (Phase 2 motion components): all parallel
- T015-T018, T020, T022-T023 (Phase 4 landing sections): all parallel (different files, no shared logic)
- T027-T029 (Phase 5 auth forms + i18n): all parallel
- T033-T034 (Phase 6 navbar + footer): parallel
- T037-T043 (Phase 7 secondary pages): ALL parallel (7 independent pages)
- T046-T047 (Phase 8 dashboard): parallel

---

## Parallel Example: User Story 2 (Landing Sections)

```bash
# All of these can run simultaneously (different files):
Task T015: "Replace SocialProofBar in src/widgets/landing/social-proof-bar.tsx"
Task T016: "Redesign ProblemSection in src/widgets/landing/problem-section.tsx"
Task T017: "Redesign FeaturesSection in src/widgets/landing/features-section.tsx"
Task T018: "Redesign HowItWorksSection in src/widgets/landing/how-it-works-section.tsx"
Task T020: "Replace TestimonialsSection in src/widgets/landing/testimonials-section.tsx"
Task T022: "Replace FaqSection in src/widgets/landing/faq-section.tsx"
Task T023: "Redesign FinalCtaSection in src/widgets/landing/final-cta-section.tsx"

# These depend on other files' logic, so run after or with care:
Task T019: "Enhance BenefitsByRoleSection (preserve tab state)"
Task T021: "Enhance PricingSection (preserve auth + locale)"
```

## Parallel Example: User Story 5 (Secondary Pages)

```bash
# ALL 7 pages can run simultaneously (completely independent files):
Task T037: "Redesign About page"
Task T038: "Redesign Contact page"
Task T039: "Redesign Features page"
Task T040: "Redesign Pricing page"
Task T041: "Redesign Support page"
Task T042: "Redesign Terms page"
Task T043: "Redesign Privacy page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install framer-motion, create animation utilities)
2. Complete Phase 2: Foundational (MotionSection, MotionCard, MotionStagger)
3. Complete Phase 3: User Story 1 (Hero section)
4. **STOP and VALIDATE**: Verify hero animations, auth state, themes, mobile
5. This alone delivers the highest visual impact

### Incremental Delivery

1. Phase 1 + 2 → Animation infrastructure ready
2. + US1 (Hero) → Immediate visual impact on landing page
3. + US2 (Landing sections) → Full landing page experience complete
4. + US3 (Login/Register) → Auth flow polished with password toggle
5. + US4 (Navbar/Footer) → Global elements polished
6. + US5 (Secondary pages) → All public pages redesigned
7. + US6 (Dashboard) → Complete app polish
8. Phase 9: Final verification → Browser MCP screenshots + `npm run build`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Fully redesignable sections can be completely rewritten — use 21st.dev MCP to find inspiration components
- Logic-preserved sections: only change visuals, never touch handlers/state/actions
- Every phase checkpoint includes `npm run build` verification
- Final phase includes Browser MCP visual verification per user request
- All i18n keys must exist in both `messages/es.json` and `messages/en.json`
- All colors must use TweakCN CSS variables — never hardcode
