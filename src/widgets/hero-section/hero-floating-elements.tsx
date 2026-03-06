'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function HeroFloatingElements() {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion)
    return (
      <>
        <div className="pointer-events-none absolute top-20 left-[10%] z-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-[5%] bottom-20 z-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </>
    )

  return (
    <>
      <motion.div
        className="pointer-events-none absolute top-20 left-[10%] z-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute right-[5%] bottom-20 z-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, 15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/3 z-0 h-64 w-64 rounded-full bg-primary/[0.03] blur-3xl"
        animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute top-10 right-1/4 z-0 h-48 w-48 rounded-full bg-primary/[0.04] blur-3xl"
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </>
  )
}
