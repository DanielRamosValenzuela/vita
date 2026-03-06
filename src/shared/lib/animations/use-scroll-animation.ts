'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'

interface UseScrollAnimationOptions {
  threshold?: number
  once?: boolean
}

export function useScrollAnimation(options?: UseScrollAnimationOptions) {
  const { threshold = 0.2, once = true } = options ?? {}
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: threshold, once })

  return { ref, isInView }
}
