import { getCurrentUser } from '@/src/shared/lib/auth'
import { DashboardShell } from '@/src/widgets/dashboard-sidebar/dashboard-shell'
import { getUserPendingNotifications } from '@/src/entities/notification/lib/pending-notifications'
import { PendingNotificationsToaster } from '@/src/features/notifications/ui/pending-notifications-toaster'

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

  const pendingNotifications = await getUserPendingNotifications({
    userId: user.id,
  })

  return (
    <DashboardShell user={user}>
      <PendingNotificationsToaster notifications={pendingNotifications} />
      {children}
    </DashboardShell>
  )
}
