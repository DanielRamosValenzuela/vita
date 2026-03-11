import { redirect } from 'next/navigation'
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
  const [resolvedParams, user] = await Promise.all([params, getCurrentUser()])

  if (!user) redirect(`/${resolvedParams.locale}/login`)

  const [pendingNotifications, unreadNotificationCount, sectorName] = await Promise.all([
    getUserPendingNotifications({ userId: user.id }),
    getUnreadCount(user.id),
    user.role === Role.CHIEF_AREA
      ? prisma.userSector
          .findFirst({
            where: { userId: user.id },
            select: { sector: { select: { name: true } } },
          })
          .then((us) => us?.sector.name ?? null)
      : Promise.resolve(null),
  ])

  return (
    <DashboardShell
      user={user}
      unreadNotificationCount={unreadNotificationCount}
      sectorName={sectorName}
    >
      <PendingNotificationsToaster notifications={pendingNotifications} />
      {children}
    </DashboardShell>
  )
}
