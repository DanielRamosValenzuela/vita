'use client'

import { Building2, Calculator, Calendar, RefreshCw, Scale, Smartphone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

export function FeaturesSection() {
  const t = useTranslations('landing')

  const features = [
    {
      icon: Calendar,
      title: t('features.feature1.title'),
      description: t('features.feature1.description'),
      large: true,
    },
    {
      icon: Calculator,
      title: t('features.feature2.title'),
      description: t('features.feature2.description'),
      large: true,
    },
    {
      icon: Scale,
      title: t('features.feature3.title'),
      description: t('features.feature3.description'),
      large: false,
    },
    {
      icon: RefreshCw,
      title: t('features.feature4.title'),
      description: t('features.feature4.description'),
      large: false,
    },
    {
      icon: Building2,
      title: t('features.feature5.title'),
      description: t('features.feature5.description'),
      large: false,
    },
    {
      icon: Smartphone,
      title: t('features.feature6.title'),
      description: t('features.feature6.description'),
      large: false,
    },
  ]

  return (
    <section className={cn('bg-background py-20')}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('features.tag')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('features.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">{t('features.description')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={cn(
                  'hover:border-primary/30 transition-colors',
                  feature.large && 'md:col-span-1 lg:col-span-2'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="bg-primary/10 text-primary mb-3 flex h-11 w-11 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
