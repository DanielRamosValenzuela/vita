import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

import { requireAuth } from '@/src/shared/lib/auth'
import { getNotificationsAction, getUnreadCountAction } from '@/src/features/notifications/api'
import { InboxPage } from '@/src/features/notifications/ui/inbox-page'

export default async function InboxRoute() {
  const user = await requireAuth()

  if (user.role === Role.SUPER_ADMIN) redirect(`/dashboard`)

  const [notificationsResult, countResult] = await Promise.all([
    getNotificationsAction({ limit: 20 }),
    getUnreadCountAction(),
  ])

  const notifications = notificationsResult.success
    ? (notificationsResult.data?.notifications ?? [])
    : []
  const nextCursor = notificationsResult.success
    ? (notificationsResult.data?.nextCursor ?? null)
    : null
  const unreadCount = countResult.success ? (countResult.data ?? 0) : 0

  return (
    <InboxPage
      initialNotifications={notifications}
      nextCursor={nextCursor}
      unreadCount={unreadCount}
    />
  )
}
