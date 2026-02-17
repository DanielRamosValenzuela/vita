import type { Notification, NotificationType, Prisma } from '@prisma/client'

import { prisma } from '@/src/shared/lib/db'

import type { NotificationWithActor } from './types'

const NOTIFICATION_INCLUDE = {
  actor: {
    select: {
      id: true,
      name: true,
      image: true,
      customImage: true,
    },
  },
  organization: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.NotificationInclude

export async function createNotificationRecord(
  data: Prisma.NotificationCreateInput
): Promise<Notification> {
  return prisma.notification.create({ data })
}

export async function getNotificationsByUser(
  userId: string,
  options: {
    cursor?: string
    limit: number
    isRead?: boolean
    type?: NotificationType
    types?: NotificationType[]
  }
): Promise<{ notifications: NotificationWithActor[]; nextCursor: string | null }> {
  const { cursor, limit, isRead, type, types } = options

  const where: Prisma.NotificationWhereInput = { userId }
  if (isRead !== undefined) where.isRead = isRead
  if (types && types.length > 0) where.type = { in: types }
  else if (type) where.type = type

  const notifications = await prisma.notification.findMany({
    where,
    include: NOTIFICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  })

  const hasMore = notifications.length > limit
  if (hasMore) notifications.pop()

  const nextCursor = hasMore ? notifications[notifications.length - 1]?.id ?? null : null

  return { notifications, nextCursor }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAsRead(id: string, userId: string): Promise<Notification> {
  return prisma.notification.update({
    where: { id, userId },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
  return result.count
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  await prisma.notification.delete({
    where: { id, userId },
  })
}

export async function getRecentUnread(
  userId: string,
  sinceMinutes: number
): Promise<NotificationWithActor[]> {
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000)

  return prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      createdAt: { gte: since },
    },
    include: NOTIFICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}
