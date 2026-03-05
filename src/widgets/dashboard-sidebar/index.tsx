'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ChevronsUpDown } from 'lucide-react'

import { cn } from '@/src/shared/lib/utils/cn'
import { LanguageSelector } from '@/src/shared/ui/atoms/language-selector'
import { ThemeSelector } from '@/src/shared/ui/atoms/theme-selector'
import { ThemeToggle } from '@/src/shared/ui/atoms/theme-toggle'
import { Badge } from '@/src/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'

import { Link, usePathname } from '@/i18n/navigation'

import { getNavItems } from './constants'
import type { DashboardSidebarProps } from './types'

export function DashboardSidebar({
  user,
  className,
  unreadNotificationCount,
  displayRole,
}: DashboardSidebarProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'es'

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: `/${locale}/login` })
  }

  const navItems = getNavItems(t, user.role)
  const userRoleStr = String(user.role)
  const filteredNavItems = navItems
    .filter((item) => item.roles.some((role) => String(role) === userRoleStr))
    .map((item) =>
      item.href === '/dashboard/inbox' && unreadNotificationCount
        ? { ...item, badge: unreadNotificationCount }
        : item
    )

  return (
    <aside
      className={cn('bg-card flex h-screen w-64 flex-col border-r', className)}
      aria-label={t('sidebarLabel')}
    >
      <Link href="/" className="group flex items-center gap-3 border-b p-6">
        <Image
          src="/logo-icon.png"
          alt=""
          width={36}
          height={36}
          className="shrink-0 transition-transform duration-300 group-hover:scale-110"
          priority
        />
        <div>
          <h2 className="text-primary text-xl font-bold">{tCommon('appName')}</h2>
          <p className="text-muted-foreground text-sm">{tCommon(`roles.${displayRole ?? user.role}`)}</p>
        </div>
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
                  ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5 text-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-3 border-t p-4">
        <div className="flex items-center justify-between">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <ThemeSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="bg-accent hover:bg-accent/80 flex w-full items-center gap-3 rounded-lg p-3 transition-colors">
              {user.customImage || user.image ? (
                <div className="ring-border relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2">
                  <Image
                    src={user.customImage || user.image || ''}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="40px"
                    loading="eager"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-muted-foreground truncate text-xs">{user.email}</p>
              </div>
              <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="w-full cursor-pointer">
                {tCommon('profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              {tCommon('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
