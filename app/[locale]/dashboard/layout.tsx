import { getCurrentUser } from '@/src/shared/lib/auth'
import { DashboardSidebar } from '@/src/widgets/dashboard-sidebar'

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
  

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="bg-background flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
