'use client'

import { m, useReducedMotion } from 'framer-motion'

import { useScrollAnimation } from '@/src/shared/lib/animations/use-scroll-animation'

interface MotionStaggerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function MotionStagger({ children, staggerDelay = 0.1, className }: MotionStaggerProps) {
  const { ref, isInView } = useScrollAnimation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={
        shouldReduceMotion
          ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0 } },
            }
          : {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: staggerDelay,
                  delayChildren: 0.1,
                },
              },
            }
      }
      className={className}
    >
      {children}
    </m.div>
  )
}
