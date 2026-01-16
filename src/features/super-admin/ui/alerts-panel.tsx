import { useTranslations } from 'next-intl'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

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
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      text: data.upcomingPaymentsText,
      show: data.showUpcoming,
    },
    {
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      text: data.suspendedText,
      show: data.showSuspended,
    },
    {
      icon: CheckCircle,
      color: 'text-primary',
      bg: 'bg-primary/10',
      text: data.paymentsTodayText,
      show: data.showToday,
    },
  ]

  const visibleAlerts = alerts.filter((alert) => alert.show)

  if (visibleAlerts.length === 0) 
    return null
  

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
              <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
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
