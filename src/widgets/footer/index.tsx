'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Logo } from '@/src/shared/ui/atoms'
import { MotionSection } from '@/src/shared/ui/motion'

export function Footer() {
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')

  const linkClass =
    'text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block'

  return (
    <MotionSection className="bg-background border-t" variant="fadeIn">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo locale={locale} size="sm" />
            <p className="text-muted-foreground text-sm">{t('description')}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('product')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/features`} className={linkClass}>
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className={linkClass}>
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/support`} className={linkClass}>
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/about`} className={linkClass}>
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className={linkClass}>
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className={linkClass}>
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/terms`} className={linkClass}>
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className={linkClass}>
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-muted-foreground text-center text-xs">
            © {new Date().getFullYear()}{' '}
            <span className="text-primary font-medium">{tCommon('appName')}</span>
            {' '}{t('copyright')}
          </p>
        </div>
      </div>
    </MotionSection>
  )
}
