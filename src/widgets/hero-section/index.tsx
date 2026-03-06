'use client'

import { m, useReducedMotion } from 'framer-motion'
import { ArrowRight, Calendar, Play, Shield, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { fadeInUp, staggerContainer } from '@/src/shared/lib/animations/motion-variants'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Skeleton } from '@/src/shared/ui/skeleton'

import { HeroAnimatedBg } from './hero-animated-bg'
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
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : staggerContainer

  const itemVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : fadeInUp

  return (
    <section className="bg-background relative overflow-hidden px-4 py-16 md:py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 10% 10%, hsl(var(--primary) / 0.15), transparent 60%),
            radial-gradient(ellipse 70% 50% at 85% 30%, hsl(var(--primary) / 0.10), transparent 55%),
            radial-gradient(ellipse 60% 50% at 20% 90%, hsl(var(--primary) / 0.08), transparent 55%)
          `,
        }}
      />
      <HeroAnimatedBg />
      <HeroFloatingElements />

      <div className="relative z-10 container mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <m.div
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <m.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="mb-6 text-sm transition-transform duration-300 hover:scale-105"
              >
                {t('badge')}
              </Badge>
            </m.div>

            <m.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="block">{t('title.line1')}</span>
              <span className="block text-primary">{t('title.line2')}</span>
            </m.h1>

            <m.p
              variants={itemVariants}
              className="mb-8 max-w-xl text-lg text-muted-foreground sm:text-xl"
            >
              {t('description')}
            </m.p>

            {isLoading && (
              <m.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-12 w-40" />
              </m.div>
            )}

            {!isLoading && !isAuthenticated && (
              <m.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
                  className="text-base shadow-sm transition-all duration-300 hover:scale-105"
                >
                  <Link href="#how-it-works">
                    <Play className="mr-2 h-4 w-4" />
                    {t('cta.secondary')}
                  </Link>
                </Button>
              </m.div>
            )}

            {!isLoading && isAuthenticated && (
              <m.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Link href={`/${currentLocale}/dashboard`}>
                    {t('cta.dashboard')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </m.div>
            )}

            <m.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
            >
              <TrustPill icon={<Calendar className="h-4 w-4" />} label={t('features.scheduling.title')} />
              <TrustPill icon={<Users className="h-4 w-4" />} label={t('features.staff.title')} />
              <TrustPill icon={<Shield className="h-4 w-4" />} label={t('features.security.title')} />
            </m.div>
          </m.div>

          <m.div
            className="flex justify-center lg:justify-end"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <div className="w-full max-w-lg">
              <HeroDashboardMockup />
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card">
      {icon}
      <span>{label}</span>
    </div>
  )
}
