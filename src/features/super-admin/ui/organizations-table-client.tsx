'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Country, OrganizationPlan, OrganizationStatus } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Ban, CheckCircle, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { formatCurrency } from '@/src/shared/lib/utils/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { usePathname, useRouter } from '@/i18n/navigation'

import {
  changeOrganizationStatusAction,
  deleteOrganizationAction,
} from '../api/organization-actions'
import type { OrganizationsTableProps } from '../lib/types'
import { OrganizationsFilters } from './organizations-filters'

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

  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  })
  const [reactivateDialog, setReactivateDialog] = useState<{
    open: boolean
    id: string
    name: string
  }>({
    open: false,
    id: '',
    name: '',
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  })
  const [deleteReason, setDeleteReason] = useState('')

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

  const handleSuspend = (id: string, name: string) => {
    setSuspendDialog({ open: true, id, name })
  }

  const handleReactivate = (id: string, name: string) => {
    setReactivateDialog({ open: true, id, name })
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name })
    setDeleteReason('')
  }

  const confirmSuspend = async () => {
    startTransition(async () => {
      const result = await changeOrganizationStatusAction({
        id: suspendDialog.id,
        status: 'SUSPENDED',
      })

      if (result.success) {
        toast.success(result.message || t('suspendSuccess'))
        router.refresh()
      } else {
        toast.error(result.error || t('suspendError'))
      }
      setSuspendDialog({ open: false, id: '', name: '' })
    })
  }

  const confirmReactivate = async () => {
    startTransition(async () => {
      const result = await changeOrganizationStatusAction({
        id: reactivateDialog.id,
        status: 'ACTIVE',
      })

      if (result.success) {
        toast.success(result.message || t('reactivateSuccess'))
        router.refresh()
      } else {
        toast.error(result.error || t('reactivateError'))
      }
      setReactivateDialog({ open: false, id: '', name: '' })
    })
  }

  const confirmDelete = async () => {
    if (deleteReason.trim().length < 10) {
      toast.error(t('deleteReasonMinLength'))
      return
    }

    startTransition(async () => {
      const result = await deleteOrganizationAction({
        id: deleteDialog.id,
        reason: deleteReason.trim(),
      })

      if (result.success) {
        toast.success(result.message || t('deleteSuccess'))
        router.refresh()
      } else {
        toast.error(result.error || t('deleteError'))
      }
      setDeleteDialog({ open: false, id: '', name: '' })
      setDeleteReason('')
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
                      {/*Desktop: Iconos individuales con tooltips*/}
                      <div className="hidden md:flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                              onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
                            >
                              <span className="sr-only">{t('actions.view')}</span>
                              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('actions.view')}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                              onClick={() => router.push(`/dashboard/organizations/${org.id}/edit`)}
                            >
                              <span className="sr-only">{t('actions.edit')}</span>
                              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('actions.edit')}</p>
                          </TooltipContent>
                        </Tooltip>
                        {org.status === 'ACTIVE' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950 dark:hover:text-orange-400"
                                onClick={() => handleSuspend(org.id, org.name)}
                              >
                                <span className="sr-only">{t('actions.suspend')}</span>
                                <Ban className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('actions.suspend')}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {(org.status === 'SUSPENDED' ||
                          org.status === 'PENDING_PAYMENT' ||
                          org.status === 'INACTIVE') && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
                                onClick={() => handleReactivate(org.id, org.name)}
                              >
                                <span className="sr-only">{t('actions.reactivate')}</span>
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('actions.reactivate')}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {org.status !== 'INACTIVE' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                                onClick={() => handleDelete(org.id, org.name)}
                              >
                                <span className="sr-only">{t('actions.delete')}</span>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('actions.delete')}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/*Mobile: Dropdown menu*/}
                      <div className="flex md:hidden items-center justify-end">
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
                              onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t('actions.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/organizations/${org.id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t('actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {org.status === 'ACTIVE' && (
                              <DropdownMenuItem
                                className="cursor-pointer text-orange-600"
                                onClick={() => handleSuspend(org.id, org.name)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {t('actions.suspend')}
                              </DropdownMenuItem>
                            )}
                            {(org.status === 'SUSPENDED' ||
                              org.status === 'PENDING_PAYMENT' ||
                              org.status === 'INACTIVE') && (
                              <DropdownMenuItem
                                className="cursor-pointer text-green-600"
                                onClick={() => handleReactivate(org.id, org.name)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t('actions.reactivate')}
                              </DropdownMenuItem>
                            )}
                            {org.status !== 'INACTIVE' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive cursor-pointer"
                                  onClick={() => handleDelete(org.id, org.name)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('actions.delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

      <AlertDialog
        open={suspendDialog.open}
        onOpenChange={(open) => setSuspendDialog({ ...suspendDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.suspend')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmSuspend', { name: suspendDialog.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {t('actions.suspend')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={reactivateDialog.open}
        onOpenChange={(open) => setReactivateDialog({ ...reactivateDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.reactivate')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmReactivate', { name: reactivateDialog.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReactivate}
              className="bg-green-600 hover:bg-green-700"
            >
              {t('actions.reactivate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.delete')}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>{t('confirmDelete', { name: deleteDialog.name })}</p>
              <p className="text-muted-foreground text-sm">{t('confirmDeleteWarning')}</p>
              <div className="space-y-2">
                <Label htmlFor="delete-reason">{t('deleteReasonPrompt')}</Label>
                <Input
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder={t('deleteReasonPlaceholder')}
                />
                {deleteReason.length > 0 && deleteReason.length < 10 && (
                  <p className="text-destructive text-xs">{t('deleteReasonMinLength')}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteReason('')
              }}
            >
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteReason.trim().length < 10}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
