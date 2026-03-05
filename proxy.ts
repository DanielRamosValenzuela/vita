import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '@/src/shared/config'

import { routing } from './i18n/routing'

const { defaultLocale } = routing

const intlMiddleware = createMiddleware(routing)

const publicRoutes = [
  '/login',
  '/register',
  '/test-auth',
  '/test-auth-actions',
  '/forgot-password',
  '/',
]

const authRoutes = ['/login', '/register']

const isPublicCalendarRoute = (path: string): boolean => {
  return path === '/dashboard' || path === '/dashboard/'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'

  const isPublicRoute = publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))

  const isPublicCalendar = isPublicCalendarRoute(pathnameWithoutLocale)

  if (!isPublicRoute && !isPublicCalendar) {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const locale = pathname.split('/')[1] || defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isAuthRoute) {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    })

    if (token) {
      const locale = pathname.split('/')[1] || defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
