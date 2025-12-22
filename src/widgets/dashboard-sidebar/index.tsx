'use client'

import { useTranslations } from 'next-intl'
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
  Settings,
  LayoutGrid,
} from 'lucide-react'
import { Role } from '@prisma/client'
import type { CurrentUser } from '@/types'
import { cn } from '@/shared/lib/utils'

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
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('calendar'),
      icon: Calendar,
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
    <aside className="bg-muted/40 flex h-screen w-64 flex-col border-r">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">VITA</h2>
        <p className="text-muted-foreground text-xs">{user.role.replace('_', ' ')}</p>
      </div>
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
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
