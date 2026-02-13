'use client'

import { useTranslations } from 'next-intl'
import { Building2, UserCheck, Users, UserX } from 'lucide-react'

import { ORGANIZATION_STATUS_BADGE_VARIANTS } from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

import type { OrganizationStats } from '../data/organization-repository'

interface OrganizationViewProps {
  organization: OrganizationStats
}

export function OrganizationView({ organization }: OrganizationViewProps) {
  const t = useTranslations('adminHR.organization')
  const statusVariant =
    ORGANIZATION_STATUS_BADGE_VARIANTS[
      organization.status as keyof typeof ORGANIZATION_STATUS_BADGE_VARIANTS
    ] ?? 'secondary'

  return (
    <section className="space-y-6" aria-labelledby="org-overview-heading">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" aria-hidden />
              <div>
                <CardTitle id="org-overview-heading" className="text-2xl">
                  {organization.name}
                </CardTitle>
                <CardDescription className="mt-1">{t('organizationInfo')}</CardDescription>
              </div>
            </div>
            <Badge variant={statusVariant}>
              {t(`statuses.${organization.status}` as 'statuses.ACTIVE')}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-3" aria-label={t('organizationInfo')}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.adminHR.title')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.currentAdminHR} / {organization.maxAdminHR}
            </div>
            <p className="text-muted-foreground text-xs">{t('stats.adminHR.description')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.chiefs.title')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.currentChiefs} / {organization.maxChiefs}
            </div>
            <p className="text-muted-foreground text-xs">
              {t('stats.chiefs.description')}
              {organization.pendingInvitations.chiefs > 0 && (
                <span className="ml-1 text-muted-foreground">
                  ({organization.pendingInvitations.chiefs} {t('pending')})
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.staff.title')}</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.currentStaff} / {organization.maxStaff}
            </div>
            <p className="text-muted-foreground text-xs">
              {t('stats.staff.description')}
              {organization.pendingInvitations.staff > 0 && (
                <span className="ml-1 text-muted-foreground">
                  ({organization.pendingInvitations.staff} {t('pending')})
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </section>
    </section>
  )
}
