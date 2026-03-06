# Contract: Section Component Modifications

**Scope**: All widget components, auth forms, and page files modified or replaced in this feature.

## Scope Classification

### Fully Redesignable (no logic constraints)
Public pages and landing sections with zero business logic. Can be deleted, renamed, restructured, or rebuilt from scratch. Only constraints: i18n text and TweakCN theme variables.

- ProblemSection, FeaturesSection, HowItWorksSection, FinalCtaSection
- SocialProofBar, TestimonialsSection, FaqSection (replace with 21st.dev)
- Footer
- About, Contact, Features, Pricing, Support, Terms, Privacy pages

### Preserve Logic (visual changes only)
Components with auth state, locale routing, complex state management, or Server Action integration.

- HeroSection (session-aware CTAs)
- BenefitsByRoleSection (tab state logic)
- PricingSection (auth + locale logic)
- MainNavbar (auth state, settings popover, mobile menu)
- LoginForm, RegisterForm (auth logic, validation, OAuth)
- DashboardShell, DashboardSidebar (all dashboard logic)

## Contracts for Logic-Preserved Components

### HeroSection (enhance in-place)

**Input props**: `{ locale?: string }` (unchanged)
**Preserved behavior**: Session-aware CTA buttons (unauthenticated vs authenticated), TrustPill display, locale-aware links
**Visual changes**:
- Badge, h1, p, and CTA buttons wrapped in Framer Motion `motion.div` with staggered `fadeInUp`
- HeroFloatingElements enhanced with smoother Framer Motion animations
- HeroDashboardMockup entrance animation upgraded to `scaleIn` via Framer Motion
- Button hover micro-interactions enhanced (scale + glow)

### BenefitsByRoleSection (enhance in-place)

**Input props**: none (unchanged)
**Preserved behavior**: 3-tab interface (HR, Chief, Staff) with content panel showing title, description, and 5 benefits per role. Tab state via `useState`.
**Visual changes**: `AnimatePresence` for tab content crossfade, section entrance animation

### PricingSection (enhance in-place)

**Input props**: none (unchanged)
**Preserved behavior**: 3 pricing plans with features, CTA buttons, "popular" badge on plan2, locale-aware links
**Visual changes**: `MotionStagger` entrance, popular plan animated glow border, `MotionCard` hover, feature list stagger

### MainNavbar (enhance in-place)

**Input props**: none (unchanged)
**Preserved behavior**: Logo, nav links, settings popover (theme/language), auth state (login/register vs avatar dropdown), mobile hamburger sheet, all signOut/signIn calls
**Visual changes**: Scroll-aware shadow/blur enhancement, smoother mobile menu animation

### LoginForm (enhance + password toggle)

**Preserved logic** (MUST NOT change):
- `handleSubmit` — form submission with `loginAction` + `signIn('credentials', ...)` + router push
- Error state management (`errors`, `generalError`)
- `loading` state and button disable
- Google OAuth via `signIn('google', ...)`
- `callbackUrl` resolution
- All `useTranslations('auth')` keys

**Allowed changes**:
- Add `showPassword` state (boolean, default false)
- Add toggle button with `Eye`/`EyeOff` icon inside password field
- Toggle button: `type="button"`, `aria-label={t('auth.showPassword')}` / `t('auth.hidePassword')`
- Password `Input` type changes from `"password"` to `showPassword ? "text" : "password"`
- Visual styling improvements (card, spacing, animations) on the form wrapper
- New i18n keys: `auth.showPassword`, `auth.hidePassword` (in both es.json and en.json)

### RegisterForm (enhance + password toggles)

**Preserved logic** (MUST NOT change):
- `useReducer` state management (all dispatch actions)
- `handleSubmit` — form submission with `registerAction` + router push
- `handleCountryChange` — country select with doc number format reset
- `handleDocNumberChange` — tax ID formatting and validation
- Error scrolling/focus behavior via `useEffect`
- All field validations and error display
- All `useTranslations('auth')` keys

**Allowed changes**:
- Add `showPassword` and `showConfirmPassword` to reducer state (or separate `useState`)
- Add toggle buttons with `Eye`/`EyeOff` icons for both password fields
- Toggle buttons: `type="button"`, proper aria-labels
- Password and confirmPassword `Input` types switch based on toggle state
- Visual styling improvements (card, spacing, animations) on the form wrapper
- New i18n keys: `auth.showPassword`, `auth.hidePassword`

### Login Page (visual redesign)

**Current**: Simple centered card layout with title + form
**Preserved**: `getServerSession` redirect check, `LoginForm` component import, `searchParams` handling (callbackUrl, registered)
**Allowed**: Complete redesign of page layout, background effects, card styling, animations, decorative elements. Can add split-screen layout, illustration side, gradient background, etc.

### Register Page (visual redesign)

**Current**: Simple centered card layout with title + subtitle + form
**Preserved**: `getServerSession` redirect check, `RegisterForm` component import
**Allowed**: Complete redesign of page layout, background effects, card styling, animations, decorative elements

### DashboardShell (enhance in-place)

**Input props**: `{ children }` (unchanged)
**Preserved behavior**: Sidebar + main content layout, responsive collapse, all routing
**Visual changes**: Content area fade-in on mount/route change

### DashboardSidebar (enhance in-place)

**Input props**: existing props (unchanged)
**Preserved behavior**: All navigation items, collapsible behavior, active state, role-based menu items
**Visual changes**: Nav item hover transitions (background + scale), active indicator animation

## Contracts for Fully Redesignable Components

These sections have NO logic constraints. They can be completely rewritten. The only requirements:
1. All visible text MUST use `useTranslations` / `getTranslations` (existing or new keys)
2. All colors MUST use TweakCN theme CSS variables
3. Navigation links referenced elsewhere in the app MUST remain functional (e.g., `/${locale}/contact`)
4. Components that are imported by the landing page.tsx MUST maintain their named exports or the page.tsx import must be updated accordingly

### Landing Sections (widgets/landing/)

| Section | i18n namespace | Referenced links |
|---------|---------------|-----------------|
| SocialProofBar | `landing.socialProof.*` | none |
| ProblemSection | `landing.problem.*` | none |
| FeaturesSection | `landing.features.*` | none |
| HowItWorksSection | `landing.howItWorks.*` | none |
| TestimonialsSection | `landing.testimonials.*` | none |
| FaqSection | `landing.faq.*` | none |
| FinalCtaSection | `landing.finalCta.*` | `/${locale}/contact` |

### Secondary Pages (app/[locale]/(global)/)

| Page | i18n namespace | External references |
|------|---------------|-------------------|
| About | `aboutPage` | linked from footer |
| Contact | `contactPage` | linked from hero CTAs, pricing, footer |
| Features | `featuresPage` | linked from nav, footer |
| Pricing | `pricingPage` | linked from nav, footer |
| Support | `supportPage` | linked from footer |
| Terms | `termsPage` | linked from footer |
| Privacy | `privacyPage` | linked from footer |

### Footer (widgets/footer/)

| Component | i18n namespace | Notes |
|-----------|---------------|-------|
| Footer | `footer`, `common` | Can be fully redesigned. Must maintain links to existing pages. |
