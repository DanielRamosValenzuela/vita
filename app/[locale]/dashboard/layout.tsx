import { getCurrentUser } from '@/src/shared/lib/auth'
import { DashboardShell } from '@/src/widgets/dashboard-sidebar/dashboard-shell'
import { PendingNotificationsToaster } from '@/src/features/notifications/ui/pending-notifications-toaster'

import { getUserPendingNotifications } from '@/src/entities/notification/lib/pending-notifications'
import { getUnreadCount } from '@/src/entities/notification/lib/notification-repository'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const [, user] = await Promise.all([params, getCurrentUser()])

  if (!user)
    return (
      <div className="flex min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    )

  const [pendingNotifications, unreadNotificationCount] = await Promise.all([
    getUserPendingNotifications({ userId: user.id }),
    getUnreadCount(user.id),
  ])

  return (
    <DashboardShell user={user} unreadNotificationCount={unreadNotificationCount}>
      <PendingNotificationsToaster notifications={pendingNotifications} />
      {children}
    </DashboardShell>
  )
}
