'use client'

import { useTranslations } from 'next-intl'
import { AlertCircle, AlertTriangle } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

interface LimitAlert {
  organizationId: string
  organizationName: string
  role: string
  currentCount: number
  maxLimit: number
  usagePercentage: number
  alertType: 'warning' | 'critical'
  message: string
}

interface UsageSummary {
  totalOrganizations: number
  organizationsWithWarnings: number
  organizationsWithCriticals: number
  alerts: LimitAlert[]
}

interface OrganizationAlertsProps {
  organizationId?: string
  alerts?: UsageSummary
}

export function OrganizationAlerts({ organizationId, alerts }: OrganizationAlertsProps) {
  const t = useTranslations('organizationAlerts')

  if (!alerts || alerts.alerts.length === 0) return null

  const filteredAlerts = organizationId
    ? alerts.alerts.filter((alert) => alert.organizationId === organizationId)
    : alerts.alerts

  if (filteredAlerts.length === 0) 
    return null
  

  const criticalAlerts = filteredAlerts.filter((alert) => alert.alertType === 'critical')
  const warningAlerts = filteredAlerts.filter((alert) => alert.alertType === 'warning')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!organizationId && (
          <ul className="grid gap-4 md:grid-cols-3 list-none p-0 m-0" aria-label={t('title')}>
            <li className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-muted-foreground">
                {alerts.organizationsWithWarnings}
              </p>
              <p className="text-sm text-muted-foreground">{t('withWarnings')}</p>
            </li>
            <li className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-2xl font-bold text-destructive">
                {alerts.organizationsWithCriticals}
              </p>
              <p className="text-sm text-muted-foreground">{t('withCriticals')}</p>
            </li>
            <li className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{filteredAlerts.length}</p>
              <p className="text-sm text-muted-foreground">{t('totalAlerts')}</p>
            </li>
          </ul>
        )}

        {criticalAlerts.length > 0 && (
          <section className="space-y-2" aria-labelledby="alerts-critical-heading" role="alert">
            <h3 id="alerts-critical-heading" className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4" aria-hidden />
              {t('limitsReached', { count: criticalAlerts.length })}
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {criticalAlerts.map((alert) => (
                <li
                  key={`${alert.organizationId}-${alert.role}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.usagePercentage.toFixed(1)} {t('percentUsed')}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {alert.currentCount}/{alert.maxLimit}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        )}

        {warningAlerts.length > 0 && (
          <section className="space-y-2" aria-labelledby="alerts-warning-heading">
            <h3 id="alerts-warning-heading" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {t('nearLimit', { count: warningAlerts.length })}
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {warningAlerts.map((alert) => (
                <li
                  key={`${alert.organizationId}-${alert.role}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-muted bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.usagePercentage.toFixed(1)} {t('percentUsed')}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {alert.currentCount}/{alert.maxLimit}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
