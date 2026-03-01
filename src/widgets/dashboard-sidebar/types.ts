import type { Role } from '@prisma/client'
import type { LucideIcon } from 'lucide-react'

import type { CurrentUser } from '@/types'

export interface DashboardSidebarProps {
  user: CurrentUser
  className?: string
  unreadNotificationCount?: number
  displayRole?: Role
}

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: Role[]
  badge?: number
}
