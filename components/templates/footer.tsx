'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/atoms'

export function Footer() {
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const t = useTranslations('footer')

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo locale={locale} size="sm" />
            <p className="text-sm text-muted-foreground">{t('description')}</p>
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} <span className="text-primary font-medium">VITA</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('copyright')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('product')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/features`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/support`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/terms`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground transition-colors hover:text-foreground">
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

