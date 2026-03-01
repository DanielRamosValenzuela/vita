import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import {
  Calendar,
  Calculator,
  Scale,
  RefreshCw,
  Building2,
  Smartphone,
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent } from '@/src/shared/ui/card'

interface FeaturesPageProps {
  params: Promise<{ locale: string }>
}

const featureSections = [
  { key: 'calendar', Icon: Calendar, reverse: false },
  { key: 'payments', Icon: Calculator, reverse: true },
  { key: 'legal', Icon: Scale, reverse: false },
  { key: 'rotations', Icon: RefreshCw, reverse: true },
  { key: 'multiArea', Icon: Building2, reverse: false },
  { key: 'mobile', Icon: Smartphone, reverse: true },
] as const

const featureItems = ['feature1', 'feature2', 'feature3', 'feature4'] as const

type SectionKey = (typeof featureSections)[number]['key']

export default async function FeaturesPage({ params }: FeaturesPageProps) {
  const { locale } = await params
  const t = await getTranslations('featuresPage')

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

      {featureSections.map((section, index) => {
        const { Icon, key, reverse } = section
        const sectionKey = key as SectionKey
        const isEven = index % 2 === 0

        return (
          <section
            key={key}
            className={isEven ? 'bg-background py-20' : 'bg-muted/30 py-20'}
          >
            <div className="container mx-auto max-w-6xl px-4">
              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="p-0">
                  <div
                    className={`flex flex-col gap-12 lg:flex-row lg:items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
                  >
                    <div className="flex flex-1 items-center justify-center">
                      <div className="bg-primary/10 text-primary flex h-40 w-40 items-center justify-center rounded-3xl">
                        <Icon className="h-20 w-20" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h2 className="mb-3 text-3xl font-bold tracking-tight">
                        {t(`${sectionKey}.title`)}
                      </h2>
                      <p className="text-muted-foreground mb-8 text-lg">
                        {t(`${sectionKey}.description`)}
                      </p>
                      <ul className="space-y-4">
                        {featureItems.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                            <span className="text-base">
                              {t(`${sectionKey}.${feature}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )
      })}

      <section className="bg-primary/5 py-20 text-center">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
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
