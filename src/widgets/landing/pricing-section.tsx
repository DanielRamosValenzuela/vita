'use client'

import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

export function PricingSection() {
  const t = useTranslations('landing')
  const params = useParams()
  const locale = (params?.locale as string) || 'es'

  type PlanKey = 'plan1' | 'plan2' | 'plan3'

  const plans: { key: PlanKey; popular: boolean }[] = [
    { key: 'plan1', popular: false },
    { key: 'plan2', popular: true },
    { key: 'plan3', popular: false },
  ]

  return (
    <section className={cn('bg-background py-20')}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('pricing.tag')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">{t('pricing.description')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map(({ key, popular }) => (
            <Card
              key={key}
              className={cn(
                'relative flex flex-col',
                popular && 'border-primary shadow-lg'
              )}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1 text-xs">{t('pricing.popular')}</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t(`pricing.${key}.name`)}</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{t(`pricing.${key}.price`)}</span>
                  <span className="text-muted-foreground text-sm">{t('pricing.monthly')}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{t(`pricing.${key}.staff`)}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-3">
                  {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-sm">{t(`pricing.${key}.${feat}`)}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Link href={`/${locale}/contact`}>{t('pricing.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
