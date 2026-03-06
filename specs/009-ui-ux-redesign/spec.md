# Feature Specification: Full UI/UX Redesign

**Feature Branch**: `009-ui-ux-redesign`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Mejorar la UI/UX completa del proyecto actual. Solo cambios de diseno, componentes visuales, animaciones y experiencia de usuario. Paginas publicas (global) son completamente cambiables — se pueden borrar, renombrar, redisenar desde cero. Dashboard preserva funcionalidad core. Login y Register necesitan mejoras UX (password toggle, visual polish)."

## Scope Rules

- **Public pages** (`app/[locale]/(global)/*`): Fully changeable. Content, structure, component names, layout — everything can be redesigned from scratch, deleted, or renamed. The only constraint is i18n (all visible text via translation keys) and theme compatibility (TweakCN CSS variables).
- **Auth pages** (Login, Register): Visual redesign + UX improvements (password visibility toggle, better layout). Core auth logic (Server Actions, signIn/signOut, validation, redirects) MUST be preserved.
- **Dashboard pages** (`app/[locale]/dashboard/*`): Only visual polish (micro-interactions, hover states, transitions). All functionality, logic, data flow, and Server Actions MUST remain unchanged.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visually Compelling First Impression (Priority: P1)

A first-time visitor arrives at the landing page and immediately perceives a polished, professional product. The hero section features smooth entrance animations, an engaging background effect, and clear visual hierarchy that guides the eye from headline to call-to-action. The visitor scrolls down and discovers each section reveals itself with subtle, purposeful animations that maintain engagement without distracting from content.

**Why this priority**: The hero section and above-the-fold experience is the single most important visual element for conversion. A visitor forms their first impression within 3 seconds. Upgrading this section alone delivers the highest visual impact.

**Independent Test**: Can be fully tested by loading the landing page and verifying the hero section displays enhanced animations, improved visual effects, and a more compelling layout while maintaining all existing CTAs and navigation links.

**Acceptance Scenarios**:

1. **Given** a visitor loads the landing page, **When** the page renders, **Then** the hero section displays with smooth entrance animations (fade, slide, scale) that complete within 1 second
2. **Given** a visitor views the hero section, **When** they observe the background, **Then** animated gradient effects or particle elements create visual depth without affecting text readability
3. **Given** a visitor views the hero CTA buttons, **When** they hover over buttons, **Then** micro-interactions (scale, glow, ripple) provide tactile feedback
4. **Given** a visitor is authenticated, **When** the hero renders, **Then** the dashboard CTA button replaces the contact/demo buttons (existing behavior preserved)

---

### User Story 2 - Engaging Content Sections with Scroll Animations (Priority: P2)

As a visitor scrolls through the landing page, each content section (Social Proof, Problem, Features, How It Works, Benefits by Role, Testimonials, Pricing, FAQ) animates into view with coordinated entrance effects. Sections can be completely redesigned — replaced with 21st.dev components, restructured, or rebuilt from scratch. Feature cards have hover interactions, the step-by-step section has visual connectors, and testimonials feel dynamic rather than static.

**Why this priority**: Once the hero captures attention, the scrolling experience determines whether visitors stay and explore. Animated section reveals and interactive cards create a sense of quality and engagement that correlates with higher conversion rates.

**Independent Test**: Can be tested by scrolling through the full landing page and verifying that each section animates into view on scroll, cards respond to hover with visual feedback, and the overall experience feels fluid and cohesive.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls past the hero, **When** the Social Proof bar enters the viewport, **Then** the metrics animate in (counter animation or fade-up) with staggered timing
2. **Given** a visitor views the Features section, **When** feature cards enter the viewport, **Then** they animate in with staggered delays and respond to hover with elevation/border effects
3. **Given** a visitor views the How It Works section, **When** the steps appear, **Then** the numbered circles and connecting lines animate sequentially to guide the eye
4. **Given** a visitor interacts with the Benefits tabs, **When** they switch between roles, **Then** the content transitions smoothly with a crossfade or slide animation
5. **Given** a visitor views the Pricing section, **When** pricing cards are visible, **Then** the popular/highlighted plan has a distinct visual treatment (glow, elevated shadow, animated border)

---

### User Story 3 - Polished Login & Register Experience (Priority: P3)

A user navigates to the login or registration page and finds a visually refined, modern auth experience. The login form includes a password visibility toggle button. Both pages have improved visual design with animations, better spacing, and a professional feel that matches the landing page quality.

**Why this priority**: Login and register are the conversion gateway — every user must pass through them. A polished auth experience directly impacts user confidence and completion rate. The missing password toggle is a basic UX expectation.

**Independent Test**: Can be tested by navigating to login and register pages, verifying the password toggle works, the visual design matches the landing page's level of quality, and all auth flows (credential login, Google OAuth, registration with validation) still work correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the login page, **When** they click the password visibility toggle, **Then** the password field switches between hidden (dots) and visible (plain text)
2. **Given** a user is on the register page, **When** they click the password visibility toggle on either password field, **Then** each field independently toggles visibility
3. **Given** a user is on login/register, **When** they view the page, **Then** the layout features an improved visual design with animations, better card styling, and consistent quality with the landing page
4. **Given** a user submits invalid credentials, **When** the error appears, **Then** error messages display with the same styling and animations as before (existing error handling preserved)
5. **Given** a user clicks "Continue with Google", **When** OAuth flow triggers, **Then** the redirect and callback behavior is unchanged
6. **Given** a user successfully registers, **When** redirected to login, **Then** the success message appears as before

---

### User Story 4 - Enhanced Navigation and Footer (Priority: P4)

The main navigation bar feels premium with smooth transitions, a refined appearance on scroll (enhanced blur/shadow), and responsive mobile menu with polished animations. The footer has improved visual treatment with better spacing and subtle hover effects on links.

**Why this priority**: Navigation is used on every page and the footer anchors the page experience. While not the first thing visitors focus on, a polished nav and footer complete the professional feel.

**Independent Test**: Can be tested by interacting with the navigation bar (scroll behavior, mobile menu toggle, settings popover) and the footer (link hovers, layout) on both desktop and mobile viewports.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls down the page, **When** the navigation header becomes sticky, **Then** a subtle shadow or enhanced backdrop blur activates smoothly
2. **Given** a mobile visitor taps the hamburger menu, **When** the side menu opens, **Then** it animates in with a smooth slide and menu items stagger in
3. **Given** a visitor hovers over footer links, **When** the cursor is over a link, **Then** a subtle underline or color transition provides feedback
4. **Given** a visitor interacts with the settings popover, **When** the theme/language selectors appear, **Then** the popover animates in smoothly

---

### User Story 5 - Redesigned Secondary Public Pages (Priority: P5)

All secondary public pages (About, Contact, Features, Pricing, Support, Terms, Privacy) are fully redesigned with modern layouts, animations, and a visual language consistent with the upgraded landing page. Pages can be restructured, renamed, or rebuilt from scratch — they are purely presentational.

**Why this priority**: Secondary pages extend the brand experience. They can be completely redesigned since they contain no core logic — only i18n text and navigation links.

**Independent Test**: Can be tested by navigating to each secondary public page and verifying the redesigned layout is visually polished, responsive, and uses consistent animation patterns.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to any secondary public page, **When** the page loads, **Then** the page features a redesigned layout with entrance animations and consistent visual language
2. **Given** a visitor is on a secondary page, **When** they interact with page elements, **Then** hover states, transitions, and micro-interactions match the landing page's quality
3. **Given** a visitor is on the Contact page, **When** they view the contact form, **Then** the form maintains its current disabled state but has improved visual treatment

---

### User Story 6 - Dashboard Visual Polish (Priority: P6)

An authenticated user enters the dashboard and experiences a refined visual environment. The sidebar, cards, tables, and interactive elements have subtle micro-interactions (hover states, transitions, loading states) that make the application feel responsive and modern without altering any functionality.

**Why this priority**: The dashboard is the core product experience for paying users. While the landing page drives acquisition, the dashboard drives retention. Dashboard changes are restricted to visual polish only — no functionality changes.

**Independent Test**: Can be tested by logging into the dashboard and interacting with sidebar navigation, cards, and tables to verify smooth transitions and hover feedback without any change in data or behavior.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens the dashboard, **When** the sidebar and content area render, **Then** elements appear with subtle entrance animations
2. **Given** a user hovers over dashboard cards or table rows, **When** the cursor enters the element, **Then** a smooth elevation or highlight transition provides feedback
3. **Given** a user navigates between dashboard pages, **When** the page transitions, **Then** content fades or slides in rather than appearing abruptly

---

### Edge Cases

- What happens when a visitor has `prefers-reduced-motion` enabled? All animations MUST be disabled or minimized to respect accessibility preferences.
- What happens when JavaScript fails to load? Content MUST still be visible and readable without animations (progressive enhancement).
- What happens on low-end devices with limited GPU? Animations MUST use `transform` and `opacity` only (GPU-accelerated properties) to avoid jank.
- What happens when theme colors change (TweakCN themes)? All new visual elements MUST use CSS custom properties from the existing theme system, not hardcoded colors.
- What happens when the page is viewed in dark mode? All gradient effects, glows, and shadows MUST adapt appropriately to the dark color scheme.
- What happens when login/register password toggle is clicked while form has validation errors? Errors MUST persist and toggle MUST work independently of form state.

## Clarifications

### Session 2026-03-05

- Q: Component replacement strategy — replace sections wholesale with 21st.dev or enhance existing? → A: Mixed approach: replace simple sections (Social Proof, FAQ, etc.) with 21st.dev components; enhance complex sections (Hero, Benefits by Role, Pricing) in-place using 21st.dev patterns and animations.
- Q: Animation implementation approach — CSS/Tailwind only or allow animation library? → A: Framer Motion (~30KB gzipped). Provides declarative scroll animations, stagger, layout transitions, and gesture handling for React.
- Q: Should dashboard visual polish (P5) be included in this iteration or deferred? → A: Include in this iteration. Full scope (P1-P6) covering both public pages and dashboard.
- Q: How much freedom for public pages? → A: Public/presentation pages under `(global)` are completely changeable — can be deleted, renamed, redesigned from scratch. Dashboard pages with core logic preserve functionality only. Login/Register get visual redesign + UX improvements (password visibility toggle).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Public pages under `(global)` are fully redesignable — structure, layout, components, and names can be changed freely. Only constraints: i18n for all visible text and TweakCN theme compatibility.
- **FR-002**: Dashboard pages MUST preserve all existing functionality (Server Actions, data flow, auth guards, routing). Only visual polish (transitions, hover states, animations) is permitted.
- **FR-003**: All new visual components MUST use the existing TweakCN theme system CSS custom properties for colors, borders, and shadows.
- **FR-004**: Scroll-triggered animations MUST use Intersection Observer (or equivalent) and only fire when elements enter the viewport for the first time.
- **FR-005**: All animations MUST respect the `prefers-reduced-motion` media query by disabling or reducing motion.
- **FR-006**: Hero section MUST display enhanced entrance animations (staggered fade/slide/scale) with a total sequence duration under 1.5 seconds.
- **FR-007**: Feature cards, testimonial cards, and pricing cards MUST have hover interactions (elevation change, border highlight, or subtle scale).
- **FR-008**: The How It Works section MUST feature animated step connectors that reveal sequentially as the section enters the viewport.
- **FR-009**: The FAQ accordion MUST animate open/close with smooth height transitions instead of instant show/hide.
- **FR-010**: The Social Proof metrics MUST animate values (counting up) when entering the viewport.
- **FR-011**: All text content MUST remain internationalized via `useTranslations` / `getTranslations`. New translation keys MAY be added for redesigned pages but MUST exist in both `es.json` and `en.json`.
- **FR-012**: Simple, self-contained sections (Social Proof, FAQ, Testimonials, and similar) MUST be replaced with 21st.dev components; complex sections with integrated logic (Hero, Benefits by Role, Pricing) MUST be enhanced in-place using 21st.dev visual patterns and animations.
- **FR-013**: The Benefits by Role tab switching MUST feature a crossfade or slide transition between content panels.
- **FR-014**: The navigation bar MUST enhance its visual appearance (shadow/blur) on scroll.
- **FR-015**: Mobile responsive behavior MUST be preserved or improved — no regressions in mobile layout.
- **FR-016**: All new animations MUST use Framer Motion as the primary animation library, leveraging GPU-accelerated properties (transform, opacity) for performance. CSS transitions remain acceptable for simple hover states.
- **FR-017**: Login page MUST include a password visibility toggle button that switches the password field between hidden and visible states.
- **FR-018**: Register page MUST include independent password visibility toggles for both the password and confirm password fields.
- **FR-019**: Login and Register pages MUST receive a visual redesign (improved layout, card styling, animations) while preserving all auth logic (form submission, validation, OAuth, redirects, error handling).
- **FR-020**: Auth form logic (LoginForm, RegisterForm components in `src/features/auth/ui/`) MUST preserve: form submission handlers, validation (Zod), error display, signIn/signOut calls, router redirects, Google OAuth flow, country/docNumber logic in register.

### Assumptions

- The existing TweakCN theme system provides sufficient CSS custom properties to style all new components without modification.
- 21st.dev components are compatible with the existing Tailwind CSS v4 and shadcn/ui setup.
- The project already includes animation utilities (custom Tailwind animations visible in hero-floating-elements) that can be extended.
- Framer Motion will be added as a new dependency (~30KB gzipped); this is acceptable given the animation scope required.
- No new backend changes or data model changes are required — this is purely a frontend visual layer effort.
- New translation keys MAY be needed for redesigned public pages and login/register UX improvements (e.g., password toggle aria-label). These MUST be added to both `es.json` and `en.json`.
- Secondary public pages (About, Contact, Features, Pricing, Support, Terms, Privacy) can be fully restructured since they are purely presentational with no core business logic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of landing page sections display entrance animations when scrolling into view for the first time.
- **SC-002**: All interactive elements (cards, buttons, links) provide visual hover feedback within 150ms of cursor entry.
- **SC-003**: No Cumulative Layout Shift (CLS) regressions — page maintains a CLS score below 0.1.
- **SC-004**: Largest Contentful Paint (LCP) remains under 2.5 seconds after visual improvements.
- **SC-005**: All animations complete or are suppressed when `prefers-reduced-motion: reduce` is active.
- **SC-006**: The landing page passes visual consistency review across 3 viewports: mobile (375px), tablet (768px), and desktop (1440px).
- **SC-007**: No existing Playwright or end-to-end tests break after the visual changes.
- **SC-008**: All theme variants (light/dark + TweakCN color themes) render correctly without hardcoded color values.
- **SC-009**: Users perceive the landing page as more professional and engaging (qualitative — stakeholder review).
- **SC-010**: Login and Register password visibility toggles work correctly across all browsers and do not interfere with form validation or submission.
- **SC-011**: All auth flows (credential login, Google OAuth, registration, error handling, redirects) pass manual testing after visual redesign.
