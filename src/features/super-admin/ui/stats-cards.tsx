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
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: t('suspendedOrgs'),
      value: data.suspendedOrgs,
      subtitle: 'Requieren atención',
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
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
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">{stat.subtitle}</p>
                </div>
                <div className={`rounded-lg p-3 transition-transform duration-200 group-hover:scale-110 ${stat.bg}`}>
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
