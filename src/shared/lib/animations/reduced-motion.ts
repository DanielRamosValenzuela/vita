'use client'

import { useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'

export function useReducedMotionVariant<T extends Variants>(variant: T): T {
  const shouldReduceMotion = useReducedMotion()

  if (!shouldReduceMotion) return variant

  const reduced = {} as Record<string, unknown>
  for (const key of Object.keys(variant)) {
    const state = variant[key]
    if (typeof state === 'object' && state !== null)
      reduced[key] = {
        ...state,
        transition: { duration: 0 },
      }
    else reduced[key] = state
  }

  return reduced as T
}
