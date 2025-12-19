import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { Role } from '@prisma/client'

interface HRDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function HRDashboard({ params }: HRDashboardProps) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  if (user.role !== Role.ADMIN_HR) {
    redirect(`/${locale}`)
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Hola mundo - HR Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Locale: {locale}</p>
    </div>
  )
}

