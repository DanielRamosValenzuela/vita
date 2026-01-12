import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/src/shared/lib/auth'
import { Role } from '@prisma/client'
import { CalendarView } from '@/src/widgets/calendar-view'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (user?.role === Role.ADMIN_HR) {
    redirect(`/${locale}/dashboard/admin-hr`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendario</h1>
        <p className="text-muted-foreground mt-2">
          {user
            ? `Bienvenido, ${user.name}. Aquí puedes ver todos tus turnos.`
            : 'Visualiza el calendario de turnos. Inicia sesión para gestionar tus turnos.'}
        </p>
      </div>
      <CalendarView user={user} />
    </div>
  )
}
