'use client'

import { useState } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/src/shared/ui/badge'
import { MotionSection } from '@/src/shared/ui/motion'

export function FaqSection() {
  const t = useTranslations('landing')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()

  type FaqKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

  const items: { q: string; a: string }[] = ([1, 2, 3, 4, 5, 6, 7, 8] as FaqKey[]).map((n) => ({
    q: t(`faq.q${n}`),
    a: t(`faq.a${n}`),
  }))

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <MotionSection className="bg-muted/30 py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('faq.tag')}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('faq.title')}</h2>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.q}
                className="bg-card overflow-hidden rounded-lg border"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="pr-4 text-sm font-medium">{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                  >
                    <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t px-5 pb-4 pt-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </MotionSection>
  )
}
