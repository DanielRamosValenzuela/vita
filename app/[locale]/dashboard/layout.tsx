import { getCurrentUser } from '@/src/shared/lib/auth'
import { DashboardShell } from '@/src/widgets/dashboard-sidebar/dashboard-shell'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user)
    return (
      <div className="flex min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    )

  return <DashboardShell user={user}>{children}</DashboardShell>
}
