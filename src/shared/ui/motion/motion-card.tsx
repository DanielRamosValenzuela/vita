'use client'

import { m, useReducedMotion } from 'framer-motion'

import { fadeInUp } from '@/src/shared/lib/animations/motion-variants'

interface MotionCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  hoverElevation?: boolean
}

export function MotionCard({
  children,
  className,
  hoverScale = 1.02,
  hoverElevation = true,
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <m.div
      variants={
        shouldReduceMotion
          ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0 } },
            }
          : fadeInUp
      }
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: hoverScale,
              ...(hoverElevation && { y: -4 }),
            }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </m.div>
  )
}
