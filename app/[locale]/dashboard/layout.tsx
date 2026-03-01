import { Role } from '@prisma/client'

import { getCurrentUser } from '@/src/shared/lib/auth'
import { prisma } from '@/src/shared/lib/db'
import { DashboardShell } from '@/src/widgets/dashboard-sidebar/dashboard-shell'
import { PendingNotificationsToaster } from '@/src/features/notifications/ui/pending-notifications-toaster'

import { getUnreadCount } from '@/src/entities/notification/lib/notification-repository'
import { getUserPendingNotifications } from '@/src/entities/notification/lib/pending-notifications'

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

  const [pendingNotifications, unreadNotificationCount, displayRole] = await Promise.all([
    getUserPendingNotifications({ userId: user.id }),
    getUnreadCount(user.id),
    user.role === Role.CHIEF_AREA
      ? prisma.userSector.count({ where: { userId: user.id } }).then((c) => c > 0 ? Role.CHIEF_SECTOR : undefined)
      : Promise.resolve(undefined),
  ])

  return (
    <DashboardShell user={user} unreadNotificationCount={unreadNotificationCount} displayRole={displayRole}>
      <PendingNotificationsToaster notifications={pendingNotifications} />
      {children}
    </DashboardShell>
  )
}
