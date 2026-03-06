'use client'

import { Building2, Calculator, Calendar, RefreshCw, Scale, Smartphone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/src/shared/lib/utils'
import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { MotionCard, MotionSection, MotionStagger } from '@/src/shared/ui/motion'

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
    <MotionSection className="bg-background py-20">
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

        <MotionStagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <MotionCard
                key={feature.title}
                className={cn(feature.large && 'md:col-span-1 lg:col-span-2')}
              >
                <Card className="h-full transition-all hover:border-primary/30 hover:shadow-[0_0_20px_rgba(var(--primary),0.08)]">
                  <CardHeader className="pb-2">
                    <div className="bg-primary/10 text-primary mb-3 flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </MotionCard>
            )
          })}
        </MotionStagger>
      </div>
    </MotionSection>
  )
}
