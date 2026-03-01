'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'

export function SocialProofBar() {
  const t = useTranslations('landing')

  const metrics = [
    { value: t('socialProof.metric1'), label: t('socialProof.metric1Label') },
    { value: t('socialProof.metric2'), label: t('socialProof.metric2Label') },
    { value: t('socialProof.metric3'), label: t('socialProof.metric3Label') },
    { value: t('socialProof.metric4'), label: t('socialProof.metric4Label') },
  ]

  return (
    <section className={cn('bg-muted/30 border-y py-10')}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col items-center text-center">
              <span className="text-primary text-3xl font-bold tracking-tight sm:text-4xl">
                {metric.value}
              </span>
              <span className="text-muted-foreground mt-1 text-sm">{metric.label}</span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t('socialProof.trustedBy')}
        </p>
      </div>
    </section>
  )
}
