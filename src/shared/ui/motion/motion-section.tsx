'use client'

import { m, useReducedMotion } from 'framer-motion'
import { useScrollAnimation } from '@/src/shared/lib/animations/use-scroll-animation'
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
} from '@/src/shared/lib/animations/motion-variants'

const variantMap = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
} as const

interface MotionSectionProps {
  children: React.ReactNode
  variant?: keyof typeof variantMap
  className?: string
  delay?: number
}

export function MotionSection({
  children,
  variant = 'fadeInUp',
  className,
  delay = 0,
}: MotionSectionProps) {
  const { ref, isInView } = useScrollAnimation()
  const shouldReduceMotion = useReducedMotion()
  const selectedVariant = variantMap[variant]

  return (
    <m.section
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
              ...selectedVariant,
              visible: {
                ...(selectedVariant.visible as object),
                transition: {
                  ...((selectedVariant.visible as Record<string, unknown>)
                    ?.transition as object),
                  delay,
                },
              },
            }
      }
      className={className}
    >
      {children}
    </m.section>
  )
}
