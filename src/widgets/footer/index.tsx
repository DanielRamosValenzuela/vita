'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Logo } from '@/src/shared/ui/atoms'

export function Footer() {
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')

  return (
    <footer className="bg-background border-t">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo locale={locale} size="sm" />
            <p className="text-muted-foreground text-sm">{t('description')}</p>
            <div className="pt-4">
              <p className="text-muted-foreground text-xs">
                © {new Date().getFullYear()}{' '}
                <span className="text-primary font-medium">{tCommon('appName')}</span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{t('copyright')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('product')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/features`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
