'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link, usePathname } from '@/i18n/navigation'
import {
  Calendar,
  Building2,
  CreditCard,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  User,
  LayoutGrid,
} from 'lucide-react'
import { Role } from '@prisma/client'
import { signOut } from 'next-auth/react'
import type { CurrentUser } from '@/types'
import { cn } from '@/src/shared/lib/utils/cn'
import { ThemeToggle } from '@/src/shared/ui/atoms/theme-toggle'
import { LanguageSelector } from '@/src/shared/ui/atoms/language-selector'
import { Button } from '@/src/shared/ui/button'

interface DashboardSidebarProps {
  user: CurrentUser
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: Role[]
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'es'

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/login` })
  }

  const navItems: NavItem[] = [
    {
      href: user.role === Role.ADMIN_HR ? '/dashboard/admin-hr' : '/dashboard',
      label: user.role === Role.ADMIN_HR ? t('dashboard') : t('calendar'),
      icon: user.role === Role.ADMIN_HR ? LayoutGrid : Calendar,
      roles: [Role.SUPER_ADMIN, Role.ADMIN_HR, Role.CHIEF_AREA, Role.STAFF_HEALTH],
    },
    {
      href: '/dashboard/organizations',
      label: t('organizations'),
      icon: Building2,
      roles: [Role.SUPER_ADMIN],
    },
    {
      href: '/dashboard/payments',
      label: t('payments'),
      icon: CreditCard,
      roles: [Role.SUPER_ADMIN],
    },
    {
      href: '/dashboard/analytics',
      label: t('analytics'),
      icon: BarChart3,
      roles: [Role.SUPER_ADMIN],
    },
    {
      href: '/dashboard/areas',
      label: t('areas'),
      icon: LayoutGrid,
      roles: [Role.ADMIN_HR],
    },
    {
      href: '/dashboard/shift-types',
      label: t('shiftTypes'),
      icon: Clock,
      roles: [Role.ADMIN_HR],
    },
    {
      href: '/dashboard/rates',
      label: t('rates'),
      icon: DollarSign,
      roles: [Role.ADMIN_HR],
    },
    {
      href: '/dashboard/staff',
      label: t('staff'),
      icon: Users,
      roles: [Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/shifts',
      label: t('shifts'),
      icon: Clock,
      roles: [Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/profile',
      label: t('profile'),
      icon: User,
      roles: [Role.SUPER_ADMIN, Role.ADMIN_HR, Role.CHIEF_AREA, Role.STAFF_HEALTH],
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.endsWith('/dashboard')
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-card flex h-screen w-64 flex-col border-r">
      <Link href="/" className="border-b p-6 transition-opacity hover:opacity-80">
        <h2 className="text-primary text-xl font-bold">VITA</h2>
        <p className="text-muted-foreground text-sm">{user.role.replace('_', ' ')}</p>
      </Link>

      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>

        <div className="bg-accent flex items-center gap-3 rounded-lg p-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
        </div>

        <Button onClick={handleLogout} variant="outline" className="w-full">
          {tCommon('logout')}
        </Button>
      </div>
    </div>
  )
}
