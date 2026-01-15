import { formatCurrency, formatPercentage } from '@/src/shared/lib/utils/format'

import { getDashboardStats, getRecentOrganizations } from '../../../data/organization-repository'
import type { OrganizationSummary } from '../../types'

interface DashboardStatsRaw {
  totalOrgs: number
  activeOrgs: number
  suspendedOrgs: number
  totalUsers: number
  upcomingPayments: number
}

interface StatsData {
  totalOrgs: string
  activeOrgs: string
  suspendedOrgs: string
  monthlyRevenue: string
  totalUsers: string
  upcomingPayments: string
  orgGrowth: string
  revenueGrowth: string
  userGrowth: string
  upcomingPaymentsDays: string
}

interface AlertsData {
  upcomingPaymentsText: string
  suspendedText: string
  paymentsTodayText: string
  showUpcoming: boolean
  showSuspended: boolean
  showToday: boolean
}

export async function getDashboardData() {
  const stats = await getDashboardStats()
  const recentOrganizations = await getRecentOrganizations()

  return {
    stats,
    recentOrganizations,
  }
}

export function formatStatsData(
  stats: DashboardStatsRaw,
  tSuperAdmin: (key: string, values?: Record<string, string | number>) => string,
  tStats: (key: string, values?: Record<string, string | number>) => string
): StatsData {
  return {
    totalOrgs: stats.totalOrgs.toString(),
    activeOrgs: formatPercentage(stats.activeOrgs, stats.totalOrgs),
    suspendedOrgs: formatPercentage(stats.suspendedOrgs, stats.totalOrgs),
    monthlyRevenue: formatCurrency(28600),
    totalUsers: stats.totalUsers.toString(),
    upcomingPayments: stats.upcomingPayments.toString(),
    orgGrowth: tSuperAdmin('stats.orgGrowth', { count: 3 }),
    revenueGrowth: tSuperAdmin('stats.revenueGrowth', { amount: '$2,400' }),
    userGrowth: tSuperAdmin('stats.userGrowth', { count: 45 }),
    upcomingPaymentsDays: tStats('inDays', { days: 7 }),
  }
}

export function formatAlertsData(
  stats: DashboardStatsRaw,
  tAlerts: (key: string, values?: Record<string, string | number>) => string
): AlertsData {
  return {
    upcomingPaymentsText: tAlerts('upcomingPayments', { count: stats.upcomingPayments }),
    suspendedText: tAlerts('suspended', { count: stats.suspendedOrgs }),
    paymentsTodayText: tAlerts('paymentsToday', {
      count: 3,
      amount: formatCurrency(8200),
    }),
    showUpcoming: stats.upcomingPayments > 0,
    showSuspended: stats.suspendedOrgs > 0,
    showToday: true,
  }
}
