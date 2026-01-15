import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

import { getCurrentUser } from '@/src/shared/lib/auth'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { formatAlertsData, formatStatsData, getDashboardData } from '@/src/features/super-admin/lib/helpers/server/dashboard-helpers'
import { CalendarView } from '@/src/widgets/calendar-view'
import { AlertsPanel } from '@/src/features/super-admin/ui/alerts-panel'
import { OrganizationsTable } from '@/src/features/super-admin/ui/organizations-table'
import { StatsCards } from '@/src/features/super-admin/ui/stats-cards'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const user = await getCurrentUser()
  const t = await getTranslations({ locale, namespace: 'dashboard' })
  const tSuperAdmin = await getTranslations({ locale, namespace: 'superAdmin.dashboard' })
  const tAlerts = await getTranslations({ locale, namespace: 'superAdmin.alerts' })
  const tStats = await getTranslations({ locale, namespace: 'superAdmin.stats' })

  if (!user) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('calendarTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('calendarDescription')}</p>
        </div>
        <CalendarView user={null} />
      </div>
    )
  }

  if (user.role === Role.SUPER_ADMIN) {
    await requireSuperAdmin(locale)

    const { stats, recentOrganizations } = await getDashboardData()

    const statsData = formatStatsData(stats, tSuperAdmin, tStats)
    const alertsData = formatAlertsData(stats, tAlerts)

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{tSuperAdmin('title')}</h1>
          <p className="text-muted-foreground">{tSuperAdmin('subtitle')}</p>
        </div>

        <StatsCards data={statsData} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrganizationsTable organizations={recentOrganizations} />
          </div>
          <div>
            <AlertsPanel data={alertsData} />
          </div>
        </div>
      </div>
    )
  }

  if (user.role === Role.ADMIN_HR) {
    redirect(`/${locale}/dashboard/admin-hr`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('calendarTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('calendarWelcome', { name: user.name })}</p>
      </div>
      <CalendarView user={user} />
    </div>
  )
}
