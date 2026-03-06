'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/src/shared/lib/animations/motion-variants'

export function PageAnimationWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
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
    </motion.div>
  )
}

export function PageSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      variants={
        shouldReduceMotion
          ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
          : fadeInUp
      }
      className={className}
    >
      {children}
    </motion.section>
  )
}
