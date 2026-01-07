import { requireSuperAdmin } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/auth'
import { StatsCards } from '@/src/features/super-admin/ui/stats-cards'
import { OrganizationsTable } from '@/src/features/super-admin/ui/organizations-table'
import { AlertsPanel } from '@/src/features/super-admin/ui/alerts-panel'
import { formatCurrency, formatPercentage } from '@/src/shared/lib/utils/format'

interface SuperAdminDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function SuperAdminDashboard({ params }: SuperAdminDashboardProps) {
  const { locale } = await params
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
    orgGrowth: '+3 este mes',
    revenueGrowth: '+$2,400 ↑',
    userGrowth: '+45 este mes',
    upcomingPaymentsDays: 'en 7 días',
  }

  const alertsData = {
    upcomingPaymentsText: `${upcomingPayments} organizaciones con pago próximo a vencer`,
    suspendedText: `${suspendedOrgs} organizaciones suspendidas por falta de pago`,
    paymentsTodayText: `3 pagos registrados hoy (${formatCurrency(8200)})`,
    showUpcoming: upcomingPayments > 0,
    showSuspended: suspendedOrgs > 0,
    showToday: true,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard SUPER ADMIN</h1>
        <p className="text-muted-foreground">
          Vista general de todas las organizaciones y métricas
        </p>
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
