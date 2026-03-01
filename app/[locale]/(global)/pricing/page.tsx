import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/src/shared/ui/card'
import { Badge } from '@/src/shared/ui/badge'

interface PricingPageProps {
  params: Promise<{ locale: string }>
}

const plans = [
  { key: 'plan1', popular: false },
  { key: 'plan2', popular: true },
  { key: 'plan3', popular: false },
] as const

const planFeatures = ['feature1', 'feature2', 'feature3', 'feature4'] as const
const includedItems = [
  'included1',
  'included2',
  'included3',
  'included4',
  'included5',
  'included6',
] as const

type PlanKey = 'plan1' | 'plan2' | 'plan3'

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params
  const t = await getTranslations('pricingPage')
  const tLanding = await getTranslations('landing')

  return (
    <div className="flex flex-col">
      <section className="bg-background py-20 text-center">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">
            {t('description')}
          </p>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => {
              const planKey = plan.key as PlanKey
              return (
                <Card
                  key={plan.key}
                  className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="px-4 py-1 text-sm">
                        {tLanding('pricing.popular')}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                      {tLanding(`pricing.${planKey}.name`)}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {tLanding(`pricing.${planKey}.price`)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {tLanding(`pricing.${planKey}.currency`)}
                        {tLanding('pricing.monthly')}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {tLanding(`pricing.${planKey}.staff`)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <ul className="flex-1 space-y-3">
                      {planFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-sm">
                            {tLanding(`pricing.${planKey}.${feature}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant={plan.popular ? 'default' : 'outline'}
                      className="mt-4 w-full"
                    >
                      <Link href={`/${locale}/contact`}>
                        {tLanding('pricing.cta')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold">{t('allPlans')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {includedItems.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                <span className="text-sm">{t(item)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-20 text-center">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {t('cta.description')}
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href={`/${locale}/contact`}>{t('cta.button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
