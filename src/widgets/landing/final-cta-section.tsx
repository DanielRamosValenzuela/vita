'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { m, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { fadeInUp, staggerContainer } from '@/src/shared/lib/animations'
import { Button } from '@/src/shared/ui/button'
import { MotionSection } from '@/src/shared/ui/motion'

export function FinalCtaSection() {
  const t = useTranslations('landing')
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : staggerContainer

  const itemVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : fadeInUp

  return (
    <MotionSection className="bg-gradient-to-br from-primary to-primary/80 py-24" variant="fadeIn">
      <m.div
        className="container mx-auto max-w-4xl px-4 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <m.h2
          variants={itemVariants}
          className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          {t('finalCta.title')}
        </m.h2>
        <m.p variants={itemVariants} className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
          {t('finalCta.description')}
        </m.p>
        <m.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] focus-visible:ring-white active:scale-95"
          >
            <Link href={`/${locale}/contact`}>
              {t('finalCta.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/60 bg-transparent text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white focus-visible:ring-white active:scale-95"
          >
            <Link href={`/${locale}/contact`}>{t('finalCta.secondary')}</Link>
          </Button>
        </m.div>
      </m.div>
    </MotionSection>
  )
}
