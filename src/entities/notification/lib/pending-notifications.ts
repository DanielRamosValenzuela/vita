import { getRecentUnread } from './notification-repository'
import type { NotificationWithActor } from './types'

interface GetUserPendingNotificationsParams {
  userId: string
}

export async function getUserPendingNotifications({
  userId,
}: GetUserPendingNotificationsParams): Promise<NotificationWithActor[]> {
  return getRecentUnread(userId, 15)
}
