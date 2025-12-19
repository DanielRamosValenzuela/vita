'use client'

import { ArrowRight, Calendar, Shield, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  locale?: string
}

export function HeroSection({ locale }: HeroSectionProps) {
  const { data: session } = useSession()
  const params = useParams()
  const currentLocale = locale || (params?.locale as string) || 'es'
  const t = useTranslations('hero')
  const isAuthenticated = !!session

  const features = [
    {
      icon: Calendar,
      title: t('features.scheduling.title'),
      description: t('features.scheduling.description'),
    },
    {
      icon: Users,
      title: t('features.staff.title'),
      description: t('features.staff.description'),
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
    },
  ]

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-16 md:py-24">
      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">{t('title.line1')}</span>
            <span className="from-primary to-primary/60 block bg-linear-to-r bg-clip-text text-transparent">
              {t('title.line2')}
            </span>
          </h1>

          <p className="text-muted-foreground mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl">
            {t('description')}
          </p>

          {!isAuthenticated && (
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link href={`/${currentLocale}/register`}>
                  {t('cta.primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href={`/${currentLocale}/login`}>{t('cta.secondary')}</Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link href={`/${currentLocale}/dashboard`}>
                  {t('cta.dashboard')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <article
                  key={index}
                  className="group bg-card hover:border-primary/50 rounded-lg border p-6 text-left transition-all hover:shadow-md"
                >
                  <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <div className="from-background via-background/95 to-background absolute inset-0 z-0 bg-linear-to-b" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
    </section>
  )
}
