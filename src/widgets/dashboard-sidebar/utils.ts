export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/admin-hr'

  if (pathname === href) return true

  if (pathname.startsWith(`${href}/`)) return true

  return false
}
