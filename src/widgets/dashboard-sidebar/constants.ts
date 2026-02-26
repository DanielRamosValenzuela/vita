import { Role } from '@prisma/client'
import {
  BarChart3,
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  CreditCard,
  RefreshCw,
  DollarSign,
  Inbox,
  Layers,
  LayoutGrid,
  User,
  Users,
} from 'lucide-react'

import type { NavItem } from './types'

export function getNavItems(t: (key: string) => string, userRole: Role): NavItem[] {
  const isDashboardRole = userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN_HR

  return [
    {
      href: userRole === Role.ADMIN_HR ? '/dashboard/admin-hr' : '/dashboard',
      label: isDashboardRole ? t('dashboard') : t('calendar'),
      icon: isDashboardRole ? LayoutGrid : Calendar,
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
      href: '/dashboard/inbox',
      label: t('inbox'),
      icon: Inbox,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA, Role.STAFF_HEALTH],
    },
    {
      href: '/dashboard/areas',
      label: t('areas'),
      icon: LayoutGrid,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/sectors',
      label: t('sectors'),
      icon: Layers,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA, Role.STAFF_HEALTH],
    },
    {
      href: '/dashboard/shift-types',
      label: t('shiftTypes'),
      icon: Clock,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/rates',
      label: t('rates'),
      icon: DollarSign,
      roles: [Role.ADMIN_HR],
    },
    {
      href: '/dashboard/calendar',
      label: t('calendar'),
      icon: CalendarDays,
      roles: [Role.ADMIN_HR],
    },
    {
      href: '/dashboard/admin-hr/organization',
      label: t('organization'),
      icon: Building2,
      roles: [Role.ADMIN_HR],
    },
    {
      href: '/dashboard/staff',
      label: t('staff'),
      icon: Users,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/shifts',
      label: t('shifts'),
      icon: Clock,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/rotations',
      label: t('rotations'),
      icon: RefreshCw,
      roles: [Role.ADMIN_HR, Role.CHIEF_AREA],
    },
    {
      href: '/dashboard/profile',
      label: t('profile'),
      icon: User,
      roles: [Role.SUPER_ADMIN, Role.ADMIN_HR, Role.CHIEF_AREA, Role.STAFF_HEALTH],
    },
  ]
}
