export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname.endsWith('/dashboard')
  }
  return pathname.startsWith(href)
}
