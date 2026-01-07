'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/src/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'
import { Badge } from '@/src/shared/ui/badge'
import { OrganizationsFilters } from './organizations-filters'
import { formatCurrency } from '@/src/shared/lib/utils/format'
import type { OrganizationStatus, OrganizationPlan, Country } from '@prisma/client'
import type { OrganizationsTableProps } from '../lib/types'

type OrganizationsTableClientProps = OrganizationsTableProps

export function OrganizationsTableClient({
  initialOrganizations,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialFilters,
}: OrganizationsTableClientProps) {
  const t = useTranslations('superAdmin.organizations')
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialFilters.search)
  const [status, setStatus] = useState<OrganizationStatus | 'ALL'>(initialFilters.status)
  const [plan, setPlan] = useState<OrganizationPlan | 'ALL'>(initialFilters.plan)
  const [country, setCountry] = useState<Country | 'ALL'>(initialFilters.country)

  const handleFilterChange = (newFilters: {
    search?: string
    status?: OrganizationStatus | 'ALL'
    plan?: OrganizationPlan | 'ALL'
    country?: Country | 'ALL'
  }) => {
    const params = new URLSearchParams()

    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.status && newFilters.status !== 'ALL') params.set('status', newFilters.status)
    if (newFilters.plan && newFilters.plan !== 'ALL') params.set('plan', newFilters.plan)
    if (newFilters.country && newFilters.country !== 'ALL')
      params.set('country', newFilters.country)

    params.set('page', '1')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('ALL')
    setPlan('ALL')
    setCountry('ALL')

    startTransition(() => {
      router.push(pathname)
    })
  }

  const getStatusBadge = (status: OrganizationStatus) => {
    const variants = {
      ACTIVE: 'default',
      PENDING_PAYMENT: 'secondary',
      SUSPENDED: 'destructive',
      INACTIVE: 'outline',
    } as const

    return <Badge variant={variants[status]}>{t(`statuses.${status}`)}</Badge>
  }

  const getPlanBadge = (plan: OrganizationPlan) => {
    const variants = {
      BASIC: 'outline',
      PRO: 'secondary',
      ENTERPRISE: 'default',
    } as const

    return <Badge variant={variants[plan]}>{t(`plans.${plan}`)}</Badge>
  }

  const getUserCounts = (users: Array<{ role: string }>) => {
    const counts = {
      ADMIN_HR: 0,
      CHIEF: 0,
      STAFF: 0,
    }

    users.forEach((user) => {
      if (user.role === 'ADMIN_HR') counts.ADMIN_HR++
      else if (user.role === 'CHIEF') counts.CHIEF++
      else if (user.role === 'STAFF') counts.STAFF++
    })

    return counts
  }

  return (
    <div className="space-y-4">
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
              initialOrganizations.map((org) => {
                const userCounts = getUserCounts(org.users)
                return (
                  <TableRow key={org.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="font-medium">
                      <div>
                        <div>{org.name}</div>
                        <div className="text-muted-foreground text-sm">{org.contactName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{org.taxId}</TableCell>
                    <TableCell>{getPlanBadge(org.plan)}</TableCell>
                    <TableCell>{getStatusBadge(org.status)}</TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Admin HR:</span>
                          <span className="font-medium">
                            {userCounts.ADMIN_HR}/{org.maxAdminHR}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Jefes:</span>
                          <span className="font-medium">
                            {userCounts.CHIEF}/{org.maxChiefs}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Staff:</span>
                          <span className="font-medium">
                            {userCounts.STAFF}/{org.maxStaff}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(org.monthlyFee)}</TableCell>
                    <TableCell>
                      {org.nextPayment
                        ? format(new Date(org.nextPayment), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t('actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/super-admin/organizations/${org.id}/edit`)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {org.status === 'ACTIVE' ? (
                            <DropdownMenuItem className="cursor-pointer text-orange-600">
                              <Ban className="mr-2 h-4 w-4" />
                              {t('actions.suspend')}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('actions.reactivate')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
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
    </div>
  )
}
