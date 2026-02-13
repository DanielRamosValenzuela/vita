import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export const locales = routing.locales
export type Locale = (typeof locales)[number]
export const defaultLocale = routing.defaultLocale

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,

    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [i18n Error]:', error.message)
        console.error('   Locale:', locale)
        if (error.message.includes('MISSING_MESSAGE'))
          console.error('   ⚠️  TRADUCCIÓN FALTANTE detectada')
      }
    },

    getMessageFallback: ({ namespace, key, error }) => {
      const path = [namespace, key].filter((part) => part != null).join('.')

      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  [Missing Translation]')
        console.warn('   Namespace:', namespace || 'default')
        console.warn('   Key:', key)
        console.warn('   Full path:', path)
        console.warn('   Error:', error.message)
        console.warn('   ---')
      }

      return `[MISSING: ${path}]`
    },
  }
})
