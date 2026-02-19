import type { NotificationType } from '@prisma/client'

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
