import type { NavLink } from './types'

export function getNavLinks(t: (key: string) => string, locale: string): NavLink[] {
  return [
    { href: `/${locale}/features`, label: t('features') },
    { href: `/${locale}/pricing`, label: t('pricing') },
    { href: `/${locale}/support`, label: t('support') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]
}
