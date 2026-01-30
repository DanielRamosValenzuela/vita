import { getTranslations } from 'next-intl/server'
import { AlertCircle, AlertTriangle, Users } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { getRoleDisplayMeta, getUsageBadgeVariant } from '@/src/shared/lib/utils/role-display'

import { Progress } from '@/shared/ui/progress'
import { getOrganizationUsageSummary } from '@/src/entities/organization/lib/organization-usage'

interface OrganizationLimitsCardProps {
  organizationId: string
}

export async function OrganizationLimitsCard({ organizationId }: OrganizationLimitsCardProps) {
  const t = await getTranslations('organizationLimits')
  let usageSummary

  try {
    usageSummary = await getOrganizationUsageSummary(organizationId)
  } catch (_error) {
    return (
      <div className="text-center py-8 text-muted-foreground">{t('loadError')}</div>
    )
  }

  return (
    <div className="space-y-4">
      {usageSummary.hasCriticals && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">{t('criticalsMessage')}</span>
        </div>
      )}

      {usageSummary.hasWarnings && !usageSummary.hasCriticals && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-muted bg-muted/50">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            {t('warningsMessage')}
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {usageSummary.roleUsage.map((usage) => {
          const meta = getRoleDisplayMeta(usage.role)

          return (
            <div key={usage.role} className="relative p-4 rounded-lg border bg-card">
              {(usage.isNearLimit || usage.isAtLimit || usage.isOverLimit) && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant={getUsageBadgeVariant(usage)} className="text-xs">
                    {usage.isOverLimit && t('badgeExceeded')}
                    {usage.isAtLimit && t('badgeFull')}
                    {usage.isNearLimit && t('badgeNear')}
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">{t(meta.translationKey)}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t('limitLabel')}: {usage.maxLimit}
                    </p>
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
                    <span>{t('usage')}</span>
                    <span>{usage.usagePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(usage.usagePercentage, 100)} className="h-2" />
                </div>

                <div className="text-xs text-muted-foreground">
                  {usage.canAddMore ? (
                    <span className="text-primary">
                      {t('available')}: {usage.maxLimit - usage.currentCount}
                    </span>
                  ) : (
                    <span className="text-destructive">{t('noSlots')}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm">{t('totalUsage')}</h4>
            <p className="text-xs text-muted-foreground">
              {t('accountsUsed', {
                current: usageSummary.totalUsers,
                total: usageSummary.totalLimit,
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{usageSummary.usagePercentage.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {usageSummary.totalLimit - usageSummary.totalUsers} {t('availableCount')}
            </div>
          </div>
        </div>
        <Progress value={Math.min(usageSummary.usagePercentage, 100)} className="h-2 mt-3" />
      </div>
    </div>
  )
}
