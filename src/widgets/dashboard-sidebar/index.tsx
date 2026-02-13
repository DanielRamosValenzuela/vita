'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useParams } from 'next/navigation'

import { cn } from '@/src/shared/lib/utils/cn'
import { LanguageSelector } from '@/src/shared/ui/atoms/language-selector'
import { ThemeSelector } from '@/src/shared/ui/atoms/theme-selector'
import { ThemeToggle } from '@/src/shared/ui/atoms/theme-toggle'
import { Button } from '@/src/shared/ui/button'

import { Link, usePathname } from '@/i18n/navigation'

import { getNavItems } from './constants'
import type { DashboardSidebarProps } from './types'

export function DashboardSidebar({ user, className }: DashboardSidebarProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'es'

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/login` })
  }

  const navItems = getNavItems(t, user.role)
  const userRoleStr = String(user.role)
  const filteredNavItems = navItems.filter((item) =>
    item.roles.some((role) => String(role) === userRoleStr)
  )

  return (
    <aside
      className={cn('bg-card flex h-screen w-64 flex-col border-r', className)}
      aria-label={t('sidebarLabel')}
    >
      <Link href="/" className="border-b p-6 transition-opacity hover:opacity-80">
        <h2 className="text-primary text-xl font-bold">{tCommon('appName')}</h2>
        <p className="text-muted-foreground text-sm">{user.role.replace('_', ' ')}</p>
      </Link>

      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isExactMatch = pathname === item.href
          const isNestedRoute = pathname.startsWith(`${item.href}/`)
          const hasMoreSpecificMatch = filteredNavItems.some(
            (otherItem) =>
              otherItem.href !== item.href &&
              otherItem.href.length > item.href.length &&
              (pathname === otherItem.href || pathname.startsWith(`${otherItem.href}/`))
          )
          const active = (isExactMatch || isNestedRoute) && !hasMoreSpecificMatch
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-4 border-t p-4">
        <div className="flex flex-col gap-2">
          <ThemeSelector />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-accent flex items-center gap-3 rounded-lg p-3">
          {user.customImage || user.image ? (
            <div className="ring-border relative h-10 w-10 overflow-hidden rounded-full ring-2">
              <Image
                src={user.customImage || user.image || ''}
                alt={user.name}
                fill
                className="rounded-full object-cover"
                sizes="40px"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
        </div>

        <Button onClick={handleLogout} variant="outline" className="w-full">
          {tCommon('logout')}
        </Button>
      </div>
    </aside>
  )
}
