import type { NavLink } from './types'

export function getNavLinks(t: (key: string) => string, locale: string): NavLink[] {
  return [
    { href: `/${locale}/support`, label: t('support') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]
}
