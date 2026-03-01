'use client'

import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Skeleton } from '@/src/shared/ui/skeleton'

interface HeroSectionProps {
  locale?: string
}

export function HeroSection({ locale }: HeroSectionProps) {
  const { data: session, status } = useSession()
  const params = useParams()
  const currentLocale = locale || (params?.locale as string) || 'es'
  const t = useTranslations('hero')
  const isLoading = status === 'loading'
  const isAuthenticated = !!session

  return (
    <section className="bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden px-4 py-20 md:py-28 lg:py-36">
      <div className="relative z-10 container mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <Badge
            variant="secondary"
            className="animate-fade-in-up mb-6 bg-white/20 text-sm text-white backdrop-blur-sm"
          >
            {t('badge')}
          </Badge>

          <h1 className="animate-fade-in-up-delay-1 mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">{t('title.line1')}</span>
            <span className="block text-white/90">{t('title.line2')}</span>
          </h1>

          <p className="animate-fade-in-up-delay-2 mb-10 max-w-2xl text-lg text-white/80 sm:text-xl">
            {t('description')}
          </p>

          {isLoading && (
            <div className="animate-fade-in-up-delay-3 flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-12 w-48 bg-white/20" />
              <Skeleton className="h-12 w-40 bg-white/20" />
            </div>
          )}

          {!isLoading && !isAuthenticated && (
            <div className="animate-fade-in-up-delay-3 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base focus-visible:ring-white"
              >
                <Link href={`/${currentLocale}/contact`}>
                  {t('cta.primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/60 bg-transparent text-base text-white hover:bg-white/10 hover:text-white focus-visible:ring-white"
              >
                <Link href="#how-it-works">{t('cta.secondary')}</Link>
              </Button>
            </div>
          )}

          {!isLoading && isAuthenticated && (
            <div className="animate-fade-in-up-delay-3 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base focus-visible:ring-white"
              >
                <Link href={`/${currentLocale}/dashboard`}>
                  {t('cta.dashboard')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />
    </section>
  )
}
