import type { NotificationType } from '@prisma/client'

import { createNotificationRecord } from '@/src/entities/notification/lib/notification-repository'

interface CreateNotificationParams {
  userId: string
  actorId: string
  organizationId?: string
  type: NotificationType
  title: string
  description?: string
  actionUrl: string
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await createNotificationRecord({
      type: params.type,
      title: params.title,
      description: params.description,
      actionUrl: params.actionUrl,
      user: { connect: { id: params.userId } },
      actor: { connect: { id: params.actorId } },
      ...(params.organizationId
        ? { organization: { connect: { id: params.organizationId } } }
        : {}),
    })
  } catch (error) {
    console.error('[notification-service] Failed to create notification:', error)
  }
}
