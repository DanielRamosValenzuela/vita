import { useTranslations } from 'next-intl'
import { AlertTriangle, Building2, CheckCircle2, Clock, DollarSign, Users } from 'lucide-react'

import { Card, CardContent } from '@/src/shared/ui/card'

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

interface StatsCardsProps {
  data: StatsData
}

export function StatsCards({ data }: StatsCardsProps) {
  const t = useTranslations('superAdmin.stats')

  const stats = [
    {
      title: t('totalOrgs'),
      value: data.totalOrgs,
      subtitle: data.orgGrowth,
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: t('activeOrgs'),
      value: data.activeOrgs,
      subtitle: 'De todas las organizaciones',
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: t('suspendedOrgs'),
      value: data.suspendedOrgs,
      subtitle: 'Requieren atención',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: t('monthlyRevenue'),
      value: data.monthlyRevenue,
      subtitle: data.revenueGrowth,
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: t('totalUsers'),
      value: data.totalUsers,
      subtitle: data.userGrowth,
      icon: Users,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-100 dark:bg-cyan-900/20',
    },
    {
      title: t('upcomingPayments'),
      value: data.upcomingPayments,
      subtitle: data.upcomingPaymentsDays,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">{stat.subtitle}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
