'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { cn } from '@/src/shared/lib/utils'
import { Button } from '@/src/shared/ui/button'

export function FinalCtaSection() {
  const t = useTranslations('landing')
  const params = useParams()
  const locale = (params?.locale as string) || 'es'

  return (
    <section className={cn('bg-gradient-to-br from-primary to-primary/80 py-24')}>
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t('finalCta.title')}
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
          {t('finalCta.description')}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 focus-visible:ring-white"
          >
            <Link href={`/${locale}/contact`}>
              {t('finalCta.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-white"
          >
            <Link href={`/${locale}/contact`}>{t('finalCta.secondary')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
