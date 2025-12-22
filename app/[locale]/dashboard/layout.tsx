import { getCurrentUser } from '@/src/shared/lib/auth'
import { DashboardSidebar } from '@/src/widgets/dashboard-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
