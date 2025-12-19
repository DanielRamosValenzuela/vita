import { requireSuperAdmin } from '@/lib/auth/session'

interface AdminDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = await params
  await requireSuperAdmin(locale)

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Hola mundo - Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Locale: {locale}</p>
    </div>
  )
}

