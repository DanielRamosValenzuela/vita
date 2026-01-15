import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

import { getCurrentUser, prisma } from '@/src/shared/lib/auth'
import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { formatCurrency, formatPercentage } from '@/src/shared/lib/utils/format'
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

    const totalOrgs = await prisma.organization.count()
    const activeOrgs = await prisma.organization.count({
      where: { status: 'ACTIVE' },
    })
    const suspendedOrgs = await prisma.organization.count({
      where: { status: 'SUSPENDED' },
    })
    const totalUsers = await prisma.user.count({
      where: {
        organizationId: { not: null },
      },
    })

    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const upcomingPayments = await prisma.organization.count({
      where: {
        status: 'ACTIVE',
        nextPayment: {
          lte: sevenDaysFromNow,
          gte: new Date(),
        },
      },
    })

    const recentOrganizations = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        plan: true,
        maxStaff: true,
        _count: {
          select: { users: true },
        },
      },
    })

    const organizationsWithUserCount = recentOrganizations.map((org) => ({
      id: org.id,
      name: org.name,
      status: org.status,
      plan: org.plan,
      userCount: org._count.users,
      maxUsers: org.maxStaff,
    }))

    const statsData = {
      totalOrgs: totalOrgs.toString(),
      activeOrgs: formatPercentage(activeOrgs, totalOrgs),
      suspendedOrgs: formatPercentage(suspendedOrgs, totalOrgs),
      monthlyRevenue: formatCurrency(28600),
      totalUsers: totalUsers.toString(),
      upcomingPayments: upcomingPayments.toString(),
      orgGrowth: tSuperAdmin('stats.orgGrowth', { count: 3 }),
      revenueGrowth: tSuperAdmin('stats.revenueGrowth', { amount: '$2,400' }),
      userGrowth: tSuperAdmin('stats.userGrowth', { count: 45 }),
      upcomingPaymentsDays: tStats('inDays', { days: 7 }),
    }

    const alertsData = {
      upcomingPaymentsText: tAlerts('upcomingPayments', { count: upcomingPayments }),
      suspendedText: tAlerts('suspended', { count: suspendedOrgs }),
      paymentsTodayText: tAlerts('paymentsToday', {
        count: 3,
        amount: formatCurrency(8200),
      }),
      showUpcoming: upcomingPayments > 0,
      showSuspended: suspendedOrgs > 0,
      showToday: true,
    }

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{tSuperAdmin('title')}</h1>
          <p className="text-muted-foreground">{tSuperAdmin('subtitle')}</p>
        </div>

        <StatsCards data={statsData} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrganizationsTable organizations={organizationsWithUserCount} />
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
