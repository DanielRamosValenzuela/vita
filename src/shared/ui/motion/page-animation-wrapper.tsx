'use client'

import { m, useReducedMotion } from 'framer-motion'

import { fadeInUp, staggerContainer } from '@/src/shared/lib/animations/motion-variants'

export function PageAnimationWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={
        shouldReduceMotion
          ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
          : staggerContainer
      }
      className={className}
    >
      {children}
    </m.div>
  )
}

export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <m.section
      variants={
        shouldReduceMotion
          ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
          : fadeInUp
      }
      className={className}
    >
      {children}
    </m.section>
  )
}
