'use server'

import { revalidatePath } from 'next/cache'
import type { NotificationType } from '@prisma/client'

import { requireAuth } from '@/src/shared/lib/auth'
import type { ActionResult } from '@/src/shared/lib/types'
import { handleActionError } from '@/src/shared/lib/utils/action-error-handler'

import {
  deleteNotification,
  getNotificationsByUser,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '@/src/entities/notification/lib/notification-repository'
import type { NotificationWithActor } from '@/src/entities/notification/lib/types'

interface GetNotificationsParams {
  cursor?: string
  limit?: number
  filter?: 'all' | 'unread' | 'read'
  types?: NotificationType[]
}

export async function getNotificationsAction(
  params: GetNotificationsParams = {}
): Promise<ActionResult<{ notifications: NotificationWithActor[]; nextCursor: string | null }>> {
  try {
    const user = await requireAuth()

    const limit = Math.min(params.limit ?? 20, 50)
    const isRead =
      params.filter === 'unread' ? false : params.filter === 'read' ? true : undefined

    const result = await getNotificationsByUser(user.id, {
      cursor: params.cursor,
      limit,
      isRead,
      types: params.types,
    })

    return { success: true, data: result }
  } catch (error) {
    return handleActionError(error, 'getNotificationsAction', 'Error al cargar notificaciones')
  }
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  try {
    const user = await requireAuth()
    const count = await getUnreadCount(user.id)
    return { success: true, data: count }
  } catch (error) {
    return handleActionError(error, 'getUnreadCountAction', 'Error al contar notificaciones')
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()
    await markAsRead(notificationId, user.id)
    revalidatePath('/dashboard/inbox')
    revalidatePath('/dashboard')
    return { success: true, data: null }
  } catch (error) {
    return handleActionError(
      error,
      'markNotificationReadAction',
      'Error al marcar notificación como leída'
    )
  }
}

export async function markAllNotificationsReadAction(): Promise<
  ActionResult<{ count: number }>
> {
  try {
    const user = await requireAuth()
    const count = await markAllAsRead(user.id)
    revalidatePath('/dashboard/inbox')
    revalidatePath('/dashboard')
    return { success: true, data: { count } }
  } catch (error) {
    return handleActionError(
      error,
      'markAllNotificationsReadAction',
      'Error al marcar notificaciones como leídas'
    )
  }
}

export async function deleteNotificationAction(
  notificationId: string
): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()
    await deleteNotification(notificationId, user.id)
    revalidatePath('/dashboard/inbox')
    revalidatePath('/dashboard')
    return { success: true, data: null }
  } catch (error) {
    return handleActionError(
      error,
      'deleteNotificationAction',
      'Error al eliminar notificación'
    )
  }
}
