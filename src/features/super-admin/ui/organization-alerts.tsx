'use client'

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
  if (!alerts || alerts.alerts.length === 0) {
    return null
  }

  const filteredAlerts = organizationId
    ? alerts.alerts.filter((alert) => alert.organizationId === organizationId)
    : alerts.alerts

  if (filteredAlerts.length === 0) {
    return null
  }

  const criticalAlerts = filteredAlerts.filter((alert) => alert.alertType === 'critical')
  const warningAlerts = filteredAlerts.filter((alert) => alert.alertType === 'warning')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Límites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen general */}
        {!organizationId && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {alerts.organizationsWithWarnings}
              </div>
              <div className="text-sm text-muted-foreground">Organizaciones con advertencias</div>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {alerts.organizationsWithCriticals}
              </div>
              <div className="text-sm text-muted-foreground">Organizaciones críticas</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{filteredAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Total de alertas</div>
            </div>
          </div>
        )}

        {/* Alertas críticas */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              Límites Alcanzados ({criticalAlerts.length})
            </div>
            <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <div
                  key={`${alert.organizationId}-${alert.role}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {alert.usagePercentage.toFixed(1)}% utilizado
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {alert.currentCount}/{alert.maxLimit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas de advertencia */}
        {warningAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Cerca del Límite ({warningAlerts.length})
            </div>
            <div className="space-y-2">
              {warningAlerts.map((alert) => (
                <div
                  key={`${alert.organizationId}-${alert.role}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {alert.usagePercentage.toFixed(1)}% utilizado
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {alert.currentCount}/{alert.maxLimit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
