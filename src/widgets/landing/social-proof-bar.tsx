'use client'

import { useTranslations } from 'next-intl'

import { useCounterAnimation, useScrollAnimation } from '@/src/shared/lib/animations'
import { MotionSection } from '@/src/shared/ui/motion'

function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const { ref, isInView } = useScrollAnimation()
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10)
  const suffix = value.replace(/[0-9,.]/g, '')
  const isNumeric = !isNaN(numericValue)
  const animatedValue = useCounterAnimation({
    target: isNumeric ? numericValue : 0,
    duration: 2,
    isInView,
  })

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="text-primary text-3xl font-bold tracking-tight sm:text-4xl">
        {isNumeric ? `${animatedValue}${suffix}` : value}
      </span>
      <span className="text-muted-foreground mt-1 text-sm">{label}</span>
    </div>
  )
}

export function SocialProofBar() {
  const t = useTranslations('landing')

  const metrics = [
    { value: t('socialProof.metric1'), label: t('socialProof.metric1Label') },
    { value: t('socialProof.metric2'), label: t('socialProof.metric2Label') },
    { value: t('socialProof.metric3'), label: t('socialProof.metric3Label') },
    { value: t('socialProof.metric4'), label: t('socialProof.metric4Label') },
  ]

  return (
    <MotionSection className="bg-muted/30 border-y py-10" variant="fadeIn">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <AnimatedMetric key={metric.label} value={metric.value} label={metric.label} />
          ))}
        </div>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t('socialProof.trustedBy')}
        </p>
      </div>
    </MotionSection>
  )
}
