import type { NotificationType } from '@prisma/client'

export type { NotificationType } from '@prisma/client'

export interface NotificationWithActor {
  id: string
  userId: string
  actorId: string | null
  organizationId: string | null
  type: NotificationType
  title: string
  description: string | null
  actionUrl: string
  isRead: boolean
  createdAt: Date
  actor: {
    id: string
    name: string
    image: string | null
    customImage: string | null
  } | null
  organization: {
    id: string
    name: string
  } | null
}

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { icon: string; colorClass: string; defaultActionUrl: string }
> = {
  INVITATION_PENDING: {
    icon: 'Mail',
    colorClass: 'text-blue-500',
    defaultActionUrl: '/dashboard/profile?section=invitations',
  },
  AREA_ASSIGNED: {
    icon: 'LayoutGrid',
    colorClass: 'text-green-500',
    defaultActionUrl: '/dashboard/areas',
  },
  SHIFT_CREATED: {
    icon: 'Calendar',
    colorClass: 'text-purple-500',
    defaultActionUrl: '/dashboard/shifts',
  },
  SHIFT_UPDATED: {
    icon: 'RefreshCw',
    colorClass: 'text-orange-500',
    defaultActionUrl: '/dashboard/shifts',
  },
  SHIFT_CANCELLED: {
    icon: 'XCircle',
    colorClass: 'text-red-500',
    defaultActionUrl: '/dashboard/shifts',
  },
  GENERAL: {
    icon: 'Bell',
    colorClass: 'text-muted-foreground',
    defaultActionUrl: '/dashboard/inbox',
  },
}
