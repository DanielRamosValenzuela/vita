'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'

export function HowItWorksSection() {
  const t = useTranslations('landing')

  const steps = [
    {
      number: t('howItWorks.step1.number'),
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      number: t('howItWorks.step2.number'),
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      number: t('howItWorks.step3.number'),
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
  ]

  return (
    <section className={cn('bg-muted/30 py-20')}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('howItWorks.tag')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('howItWorks.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">{t('howItWorks.description')}</p>
        </div>

        <div className="relative flex flex-col gap-8 md:flex-row md:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-1 flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="bg-primary/20 absolute top-6 left-1/2 hidden h-px w-full border-t border-dashed border-primary/30 md:block"
                  style={{ left: '50%', width: '100%' }}
                />
              )}
              <div className="bg-primary text-primary-foreground relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shadow-md">
                {step.number}
              </div>
              <div className="mt-4 max-w-xs px-2">
                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
