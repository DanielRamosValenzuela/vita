import { headers } from 'next/headers'

import { routing } from '@/i18n/routing'

export async function getLocaleFromHeaders(): Promise<string> {
  try {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || headersList.get('referer') || ''

    const localeMatch = pathname.match(/\/(es|en)(\/|$)/)
    if (localeMatch) return localeMatch[1]

    return routing.defaultLocale
  } catch {
    return routing.defaultLocale
  }
}
