'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { OrganizationPlan, OrganizationStatus } from '@prisma/client'
import { Ban, CheckCircle, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'

import { countUsersByRole } from '@/src/shared/lib/utils/count-users-by-role'
import { formatCurrency, formatDate } from '@/src/shared/lib/utils/format'
import { Button } from '@/src/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'
import { TableCell, TableRow } from '@/src/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { OrganizationWithCount } from '../lib/types'

interface OrganizationTableRowProps {
  org: OrganizationWithCount
  locale: 'es' | 'en'
  onView: (id: string) => void
  onEdit: (id: string) => void
  onSuspend: (id: string, name: string) => void
  onReactivate: (id: string, name: string) => void
  onDelete: (id: string, name: string) => void
  getStatusBadge: (status: OrganizationStatus) => ReactNode
  getPlanBadge: (plan: OrganizationPlan) => ReactNode
}

export function OrganizationTableRow({
  org,
  locale,
  onView,
  onEdit,
  onSuspend,
  onReactivate,
  onDelete,
  getStatusBadge,
  getPlanBadge,
}: OrganizationTableRowProps) {
  const t = useTranslations('superAdmin.organizations')
  const userCounts = countUsersByRole(org.users)

  const canSuspend = org.status === 'ACTIVE'
  const canReactivate =
    org.status === 'SUSPENDED' || org.status === 'PENDING_PAYMENT' || org.status === 'INACTIVE'
  const canDelete = org.status !== 'INACTIVE'

  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer">
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
            <span className="text-muted-foreground">{t('accountsAdminHR')}</span>
            <span className="font-medium">
              {userCounts.ADMIN_HR}/{org.maxAdminHR}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t('accountsChiefs')}</span>
            <span className="font-medium">
              {userCounts.CHIEF_AREA}/{org.maxChiefs}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t('accountsStaff')}</span>
            <span className="font-medium">
              {userCounts.STAFF}/{org.maxStaff}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right">{formatCurrency(org.monthlyFee)}</TableCell>

      <TableCell>{org.nextPayment ? formatDate(new Date(org.nextPayment), locale) : '-'}</TableCell>

      <TableCell className="text-right">
        <div className="hidden md:flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                onClick={() => onView(org.id)}
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
                onClick={() => onEdit(org.id)}
              >
                <span className="sr-only">{t('actions.edit')}</span>
                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('actions.edit')}</p>
            </TooltipContent>
          </Tooltip>

          {canSuspend && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted hover:text-muted-foreground"
                  onClick={() => onSuspend(org.id, org.name)}
                >
                  <span className="sr-only">{t('actions.suspend')}</span>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('actions.suspend')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {canReactivate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  onClick={() => onReactivate(org.id, org.name)}
                >
                  <span className="sr-only">{t('actions.reactivate')}</span>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('actions.reactivate')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                  onClick={() => onDelete(org.id, org.name)}
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

        <div className="flex md:hidden items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t('openMenu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(org.id)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                {t('actions.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(org.id)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                {t('actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canSuspend && (
                <DropdownMenuItem
                  className="cursor-pointer text-muted-foreground"
                  onClick={() => onSuspend(org.id, org.name)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {t('actions.suspend')}
                </DropdownMenuItem>
              )}
              {canReactivate && (
                <DropdownMenuItem
                  className="cursor-pointer text-primary"
                  onClick={() => onReactivate(org.id, org.name)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('actions.reactivate')}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => onDelete(org.id, org.name)}
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
}
