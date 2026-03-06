import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

import { getCurrentUser } from '@/src/shared/lib/auth'
import { resolveChiefOrganizationId } from '@/src/shared/lib/auth/chief-access'
import { isChief } from '@/src/shared/lib/auth/rbac'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { CalendarView } from '@/src/widgets/calendar-view'
import { getNotesForMonthAction } from '@/src/features/staff-dashboard/api/calendar-note-actions'
import { getMyAreasAndSectorsAction } from '@/src/features/staff-dashboard/api/staff-filter-actions'
import {
  getMyShiftsAction,
  getUpcomingShiftsAction,
} from '@/src/features/staff-dashboard/api/staff-shifts-actions'
import { StaffDashboardContent } from '@/src/features/staff-dashboard/ui/staff-dashboard-content'
import {
  formatAlertsData,
  formatStatsData,
  getDashboardData,
} from '@/src/features/super-admin/lib/helpers/server/dashboard-helpers'
import { AlertsPanel, OrganizationsTable, StatsCards } from '@/src/features/super-admin/ui'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const [user, t, tSuperAdmin, tAlerts, tStats] = await Promise.all([
    getCurrentUser(),
    getTranslations({ locale, namespace: 'dashboard' }),
    getTranslations({ locale, namespace: 'superAdmin.dashboard' }),
    getTranslations({ locale, namespace: 'superAdmin.alerts' }),
    getTranslations({ locale, namespace: 'superAdmin.stats' }),
  ])

  if (!user)
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('calendarTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('calendarDescription')}</p>
        </div>
        <CalendarView user={null} />
      </div>
    )

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

  if (user.role === Role.ADMIN_HR) redirect(`/${locale}/dashboard/admin-hr`)

  const organizationId = isChief(user)
    ? await resolveChiefOrganizationId(user.id, user.organizationId ?? null)
    : (user.organizationId ?? null)

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const [shiftsResult, upcomingResult, notesResult, filtersResult, org] = await Promise.all([
    getMyShiftsAction({ startDate, endDate }),
    getUpcomingShiftsAction(),
    getNotesForMonthAction(now.getMonth(), now.getFullYear()),
    getMyAreasAndSectorsAction(),
    organizationId
      ? prisma.organization.findUnique({ where: { id: organizationId }, select: { name: true } })
      : null,
  ])
  const initialShifts = shiftsResult.success && shiftsResult.data ? shiftsResult.data.shifts : []
  const initialUpcoming =
    upcomingResult.success && upcomingResult.data ? upcomingResult.data.shifts : []
  const initialNotes = notesResult.success && notesResult.data ? notesResult.data.notes : []
  const filterOptions = filtersResult.success && filtersResult.data ? filtersResult.data : undefined

  return (
    <StaffDashboardContent
      initialShifts={initialShifts}
      initialUpcoming={initialUpcoming}
      initialNotes={initialNotes}
      organizationName={org?.name}
      filterOptions={filterOptions}
      currentUserId={user.id}
    />
  )
}
