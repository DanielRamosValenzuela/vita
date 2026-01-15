'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { OrganizationPlan, OrganizationStatus } from '@prisma/client'
import { CreditCard, Eye, Unlock } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

import type { OrganizationSummary } from '../lib/types'

interface OrganizationsTableProps {
  organizations: OrganizationSummary[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const t = useTranslations('superAdmin.organizations')

  const getStatusColor = (status: OrganizationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 dark:text-green-400'
      case 'PENDING_PAYMENT':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'SUSPENDED':
        return 'text-red-600 dark:text-red-400'
      case 'INACTIVE':
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: OrganizationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return '🟢'
      case 'PENDING_PAYMENT':
        return '🟡'
      case 'SUSPENDED':
        return '🔴'
      case 'INACTIVE':
        return '⚫'
    }
  }

  const getStatusText = (status: OrganizationStatus) => {
    const statusMap: Record<OrganizationStatus, string> = {
      ACTIVE: t('status_active'),
      PENDING_PAYMENT: t('status_pending'),
      SUSPENDED: t('status_suspended'),
      INACTIVE: t('status_inactive'),
    }
    return statusMap[status]
  }

  const getPlanText = (plan: OrganizationPlan) => {
    const planMap: Record<OrganizationPlan, string> = {
      BASIC: t('plan_basic'),
      PRO: t('plan_pro'),
      ENTERPRISE: t('plan_enterprise'),
    }
    return planMap[plan]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription className="mt-1">
              Últimas organizaciones registradas o actualizadas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/organizations/new">{t('new')}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/organizations">{t('viewAll')}</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  {t('name')}
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  {t('status')}
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  {t('plan')}
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  {t('accounts')}
                </th>
                <th className="text-muted-foreground pb-3 text-right text-sm font-medium">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b last:border-0">
                  <td className="py-4 text-sm font-medium">{org.name}</td>
                  <td className="py-4">
                    <span
                      className={`flex items-center gap-2 text-sm ${getStatusColor(org.status)}`}
                    >
                      <span>{getStatusIcon(org.status)}</span>
                      {getStatusText(org.status)}
                    </span>
                  </td>
                  <td className="py-4 text-sm">{getPlanText(org.plan)}</td>
                  <td className="py-4 text-sm">
                    {org.userCount}/{org.maxUsers}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        aria-label={`${t('view')} ${org.name}`}
                      >
                        <Link href={`/dashboard/organizations/${org.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`${t('registerPayment')} ${org.name}`}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      {org.status === 'SUSPENDED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${t('reactivate')} ${org.name}`}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
