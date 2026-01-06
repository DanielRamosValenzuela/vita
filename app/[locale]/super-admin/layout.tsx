import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { SuperAdminSidebar } from '@/src/widgets/super-admin-sidebar'

interface SuperAdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function SuperAdminLayout({ children, params }: SuperAdminLayoutProps) {
  const { locale } = await params
  const user = await requireSuperAdmin(locale)

  return (
    <div className="flex h-screen overflow-hidden">
      <SuperAdminSidebar user={user} locale={locale} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

