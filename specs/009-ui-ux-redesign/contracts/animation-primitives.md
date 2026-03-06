# Contract: Animation Primitives

**Location**: `src/shared/lib/animations/` and `src/shared/ui/motion/`

## Hooks

### useScrollAnimation

```typescript
interface UseScrollAnimationOptions {
  threshold?: number  // default: 0.2
  once?: boolean      // default: true
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLElement>
  isInView: boolean
}

function useScrollAnimation(options?: UseScrollAnimationOptions): UseScrollAnimationReturn
```

### useCounterAnimation

```typescript
interface UseCounterAnimationOptions {
  target: number
  duration?: number   // default: 2 (seconds)
  isInView: boolean
}

function useCounterAnimation(options: UseCounterAnimationOptions): string
```

### useReducedMotionVariant

```typescript
// Returns the animated variant or instant-resolve fallback
function useReducedMotionVariant<T extends Variants>(
  variant: T
): T
```

## Variants (motion-variants.ts)

```typescript
// All variants follow Framer Motion Variants interface
export const fadeInUp: Variants
export const fadeIn: Variants
export const scaleIn: Variants
export const slideInLeft: Variants
export const slideInRight: Variants
export const staggerContainer: Variants

// Each variant has { hidden, visible } states
// Example:
// fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
// }
```

## Components

### MotionSection

```typescript
interface MotionSectionProps {
  children: React.ReactNode
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight'
  className?: string
  delay?: number
  as?: keyof HTMLElementTagNameMap  // default: 'section'
}
```

### MotionCard

```typescript
interface MotionCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number       // default: 1.02
  hoverElevation?: boolean  // default: true
}
```

### MotionStagger

```typescript
interface MotionStaggerProps {
  children: React.ReactNode
  staggerDelay?: number  // default: 0.1
  className?: string
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn'  // default: 'fadeInUp'
}
```

## Constraints

- All components MUST be `'use client'` (Framer Motion requires client-side React)
- All components MUST respect `prefers-reduced-motion` via `useReducedMotion`
- All style values MUST use CSS custom properties from TweakCN theme (no hardcoded colors)
- Hover effects on `MotionCard` use CSS transitions (not Framer Motion) for performance
- `MotionSection` triggers animation only on first viewport entry (`once: true`)
