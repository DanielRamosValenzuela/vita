import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { Role } from '@prisma/client'

interface ChiefDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function ChiefDashboard({ params }: ChiefDashboardProps) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  if (user.role !== Role.CHIEF_AREA) {
    redirect(`/${locale}`)
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Hola mundo - Chief Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Locale: {locale}</p>
    </div>
  )
}

