import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface AlertsData {
  upcomingPaymentsText: string
  suspendedText: string
  paymentsTodayText: string
  showUpcoming: boolean
  showSuspended: boolean
  showToday: boolean
}

interface AlertsPanelProps {
  data: AlertsData
}

export function AlertsPanel({ data }: AlertsPanelProps) {
  const t = useTranslations('superAdmin.alerts')

  const alerts = [
    {
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      text: data.upcomingPaymentsText,
      show: data.showUpcoming,
    },
    {
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: data.suspendedText,
      show: data.showSuspended,
    },
    {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: data.paymentsTodayText,
      show: data.showToday,
    },
  ]

  const visibleAlerts = alerts.filter((alert) => alert.show)

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleAlerts.map((alert, index) => {
            const Icon = alert.icon
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className={`rounded-lg p-2 ${alert.bg}`}>
                  <Icon className={`h-5 w-5 ${alert.color}`} />
                </div>
                <p className="text-sm">{alert.text}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
