'use client'

import { ArrowRight, Calendar, Play, Shield, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Skeleton } from '@/src/shared/ui/skeleton'

import { HeroDashboardMockup } from './hero-dashboard-mockup'
import { HeroFloatingElements } from './hero-floating-elements'

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
    <section className="bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden px-4 py-16 md:py-24 lg:py-32">
      <HeroFloatingElements />

      <div className="relative z-10 container mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Badge
              variant="secondary"
              className="animate-fade-in-up mb-6 bg-white/20 text-sm text-white backdrop-blur-sm transition-transform duration-300 hover:scale-105"
            >
              {t('badge')}
            </Badge>

            <h1 className="animate-fade-in-up-delay-1 mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">{t('title.line1')}</span>
              <span className="block text-white/90">{t('title.line2')}</span>
            </h1>

            <p className="animate-fade-in-up-delay-2 mb-8 max-w-xl text-lg text-white/80 sm:text-xl">
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
                  className="bg-white text-primary hover:bg-white/90 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] focus-visible:ring-white active:scale-95"
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
                  className="border-white/60 bg-transparent text-base text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus-visible:ring-white active:scale-95"
                >
                  <Link href="#how-it-works">
                    <Play className="mr-2 h-4 w-4" />
                    {t('cta.secondary')}
                  </Link>
                </Button>
              </div>
            )}

            {!isLoading && isAuthenticated && (
              <div className="animate-fade-in-up-delay-3 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] focus-visible:ring-white active:scale-95"
                >
                  <Link href={`/${currentLocale}/dashboard`}>
                    {t('cta.dashboard')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}

            <div className="animate-fade-in-up-delay-4 mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <TrustPill icon={<Calendar className="h-4 w-4" />} label={t('features.scheduling.title')} />
              <TrustPill icon={<Users className="h-4 w-4" />} label={t('features.staff.title')} />
              <TrustPill icon={<Shield className="h-4 w-4" />} label={t('features.security.title')} />
            </div>
          </div>

          <div className="animate-fade-in-up-delay-2 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15">
      {icon}
      <span>{label}</span>
    </div>
  )
}
