'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { OrganizationPlan, OrganizationStatus } from '@prisma/client'
import { toast } from 'sonner'

import {
  ORGANIZATION_PLAN_BADGE_VARIANTS,
  ORGANIZATION_STATUS_BADGE_VARIANTS,
} from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { useRouter } from '@/i18n/navigation'

import {
  changeOrganizationStatusAction,
  deleteOrganizationAction,
} from '../api/organization-actions'
import type { OrganizationsTableProps } from '../lib/types'
import { OrganizationDialogs } from './organization-dialogs'
import { OrganizationTableRow } from './organization-table-row'
import { OrganizationsFilters } from './organizations-filters'
import { useOrganizationFilters } from './use-organization-filters'

type OrganizationsTableClientProps = OrganizationsTableProps

type DialogState = { open: boolean; id: string; name: string }

const EMPTY_DIALOG: DialogState = { open: false, id: '', name: '' }

export function OrganizationsTableClient({
  initialOrganizations,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialFilters,
}: OrganizationsTableClientProps) {
  const t = useTranslations('superAdmin.organizations')
  const locale = useLocale() as 'es' | 'en'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    search,
    status,
    plan,
    country,
    pathname,
    setSearch,
    setStatus,
    setPlan,
    setCountry,
    handleFilterChange,
    handleReset,
  } = useOrganizationFilters(initialFilters)

  const [suspendDialog, setSuspendDialog] = useState<DialogState>(EMPTY_DIALOG)
  const [reactivateDialog, setReactivateDialog] = useState<DialogState>(EMPTY_DIALOG)
  const [deleteDialog, setDeleteDialog] = useState<DialogState>(EMPTY_DIALOG)

  const handleSuspend = (id: string, name: string) => {
    setSuspendDialog({ open: true, id, name })
  }

  const handleReactivate = (id: string, name: string) => {
    setReactivateDialog({ open: true, id, name })
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name })
  }

  const confirmSuspend = () => {
    startTransition(async () => {
      const result = await changeOrganizationStatusAction({
        id: suspendDialog.id,
        status: 'SUSPENDED',
      })

      if (result.success) {
        toast.success(result.message || t('suspendSuccess'))
        router.refresh()
      } else toast.error(result.error || t('suspendError'))

      setSuspendDialog(EMPTY_DIALOG)
    })
  }

  const confirmReactivate = () => {
    startTransition(async () => {
      const result = await changeOrganizationStatusAction({
        id: reactivateDialog.id,
        status: 'ACTIVE',
      })

      if (result.success) {
        toast.success(result.message || t('reactivateSuccess'))
        router.refresh()
      } else toast.error(result.error || t('reactivateError'))

      setReactivateDialog(EMPTY_DIALOG)
    })
  }

  const confirmDelete = (reason: string) => {
    if (reason.trim().length < 10) {
      toast.error(t('deleteReasonMinLength'))
      return
    }

    startTransition(async () => {
      const result = await deleteOrganizationAction({
        id: deleteDialog.id,
        reason: reason.trim(),
      })

      if (result.success) {
        toast.success(result.message || t('deleteSuccess'))
        router.refresh()
      } else toast.error(result.error || t('deleteError'))

      setDeleteDialog(EMPTY_DIALOG)
    })
  }

  const getStatusBadge = (orgStatus: OrganizationStatus) => (
    <Badge variant={ORGANIZATION_STATUS_BADGE_VARIANTS[orgStatus] ?? 'outline'}>
      {t(`statuses.${orgStatus}`)}
    </Badge>
  )

  const getPlanBadge = (orgPlan: OrganizationPlan) => (
    <Badge variant={ORGANIZATION_PLAN_BADGE_VARIANTS[orgPlan] ?? 'outline'}>
      {t(`plans.${orgPlan}`)}
    </Badge>
  )

  return (
    <section className="space-y-4" aria-label={t('table.name')}>
      <OrganizationsFilters
        search={search}
        status={status}
        plan={plan}
        country={country}
        onSearchChange={(value) => {
          setSearch(value)
          handleFilterChange({ search: value, status, plan, country })
        }}
        onStatusChange={(value) => {
          setStatus(value)
          handleFilterChange({ search, status: value, plan, country })
        }}
        onPlanChange={(value) => {
          setPlan(value)
          handleFilterChange({ search, status, plan: value, country })
        }}
        onCountryChange={(value) => {
          setCountry(value)
          handleFilterChange({ search, status, plan, country: value })
        }}
        onReset={handleReset}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.taxId')}</TableHead>
              <TableHead>{t('table.plan')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-center">{t('table.userLimits')}</TableHead>
              <TableHead className="text-right">{t('table.monthlyFee')}</TableHead>
              <TableHead>{t('table.nextPayment')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('table.loading')}
                </TableCell>
              </TableRow>
            ) : initialOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('table.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              initialOrganizations.map((org) => (
                <OrganizationTableRow
                  key={org.id}
                  org={org}
                  locale={locale}
                  onView={(id) => router.push(`/dashboard/organizations/${id}`)}
                  onEdit={(id) => router.push(`/dashboard/organizations/${id}/edit`)}
                  onSuspend={handleSuspend}
                  onReactivate={handleReactivate}
                  onDelete={handleDelete}
                  getStatusBadge={getStatusBadge}
                  getPlanBadge={getPlanBadge}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {initialTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {t('pagination.showing', {
              from: (initialPage - 1) * 20 + 1,
              to: Math.min(initialPage * 20, initialTotal),
              total: initialTotal,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(initialPage - 1))
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`)
                })
              }}
              disabled={initialPage <= 1 || isPending}
            >
              {t('pagination.previous')}
            </Button>
            <div className="text-sm">
              {t('pagination.page', { current: initialPage, total: initialTotalPages })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(initialPage + 1))
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`)
                })
              }}
              disabled={initialPage >= initialTotalPages || isPending}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}

      <OrganizationDialogs
        suspendDialog={suspendDialog}
        setSuspendDialog={setSuspendDialog}
        reactivateDialog={reactivateDialog}
        setReactivateDialog={setReactivateDialog}
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        onConfirmSuspend={confirmSuspend}
        onConfirmReactivate={confirmReactivate}
        onConfirmDelete={confirmDelete}
        isPending={isPending}
      />
    </section>
  )
}
