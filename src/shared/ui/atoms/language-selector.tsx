'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const locales = routing.locales
type Locale = (typeof locales)[number]

export function LanguageSelector() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('common.languages')
  const currentLocale = (params?.locale as Locale) || routing.defaultLocale

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 cursor-pointer"
          aria-label="Select language"
          suppressHydrationWarning
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" suppressHydrationWarning>
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
