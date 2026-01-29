import type { Role } from '@prisma/client'
import { AlertCircle, AlertTriangle, Users } from 'lucide-react'

import { ROLES } from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'

import { Progress } from '@/shared/ui/progress'
import { getOrganizationUsageSummary } from '@/src/entities/organization/lib/organization-usage'

interface OrganizationLimitsCardProps {
  organizationId: string
  maxAdminHR?: number
  maxChiefs?: number
  maxStaff?: number
}

export async function OrganizationLimitsCard({
  organizationId,
  maxAdminHR = 0,
  maxChiefs = 0,
  maxStaff = 0,
}: OrganizationLimitsCardProps) {
  let usageSummary

  try {
    usageSummary = await getOrganizationUsageSummary(organizationId)
  } catch (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se pudo cargar la información de límites
      </div>
    )
  }

  const getRoleInfo = (role: Role) => {
    switch (role) {
      case ROLES.ADMIN_HR:
        return {
          label: 'Administradores RRHH',
          icon: '👔',
          color: 'blue',
        }
      case ROLES.CHIEF_AREA:
        return {
          label: 'Jefes de Área',
          icon: '🏥',
          color: 'green',
        }
      case ROLES.STAFF_HEALTH:
        return {
          label: 'Personal de Salud',
          icon: '⚕️',
          color: 'purple',
        }
      default:
        return {
          label: 'Desconocido',
          icon: '❓',
          color: 'gray',
        }
    }
  }

  const getUsageVariant = (usage: {
    isOverLimit: boolean
    isAtLimit: boolean
    isNearLimit: boolean
  }) => {
    if (usage.isOverLimit) return 'destructive'
    if (usage.isAtLimit) return 'destructive'
    if (usage.isNearLimit) return 'secondary'
    return 'outline'
  }

  return (
    <div className="space-y-4">
      {/* Alertas generales */}
      {usageSummary.hasCriticals && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">
            Algunos roles han alcanzado o superado sus límites
          </span>
        </div>
      )}

      {usageSummary.hasWarnings && !usageSummary.hasCriticals && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm text-orange-800 dark:text-orange-200 font-medium">
            Algunos roles están cerca de alcanzar sus límites
          </span>
        </div>
      )}

      {/* Tarjetas por rol */}
      <div className="grid gap-4 md:grid-cols-3">
        {usageSummary.roleUsage.map((usage) => {
          const roleInfo = getRoleInfo(usage.role)

          return (
            <div key={usage.role} className="relative p-4 rounded-lg border bg-card">
              {/* Indicador de estado */}
              {(usage.isNearLimit || usage.isAtLimit || usage.isOverLimit) && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant={getUsageVariant(usage)} className="text-xs">
                    {usage.isOverLimit && 'Excedido'}
                    {usage.isAtLimit && 'Lleno'}
                    {usage.isNearLimit && '80%'}
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{roleInfo.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">{roleInfo.label}</h4>
                    <p className="text-xs text-muted-foreground">Límite: {usage.maxLimit}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold text-lg">{usage.currentCount}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uso</span>
                    <span>{usage.usagePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(usage.usagePercentage, 100)} className="h-2" />
                </div>

                <div className="text-xs text-muted-foreground">
                  {usage.canAddMore ? (
                    <span className="text-green-600 dark:text-green-400">
                      Disponible: {usage.maxLimit - usage.currentCount}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">Sin cupos disponibles</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen general */}
      <div className="p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm">Uso Total de la Organización</h4>
            <p className="text-xs text-muted-foreground">
              {usageSummary.totalUsers} de {usageSummary.totalLimit} cuentas utilizadas
            </p>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{usageSummary.usagePercentage.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {usageSummary.totalLimit - usageSummary.totalUsers} disponibles
            </div>
          </div>
        </div>
        <Progress value={Math.min(usageSummary.usagePercentage, 100)} className="h-2 mt-3" />
      </div>
    </div>
  )
}
