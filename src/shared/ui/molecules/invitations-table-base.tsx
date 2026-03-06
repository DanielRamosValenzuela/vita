'use client'

import { useCallback, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { InvitationStatus, Role } from '@prisma/client'
import { Ban } from 'lucide-react'

import { INVITATION_STATUS, INVITATION_STATUS_BADGE_VARIANTS } from '@/src/shared/lib/constants'
import { useClientPagination } from '@/src/shared/lib/hooks/use-client-pagination'
import { formatDate } from '@/src/shared/lib/utils/format'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { DataTablePagination } from '@/src/shared/ui/molecules/data-table-pagination'
import { DataTableToolbar } from '@/src/shared/ui/molecules/data-table-toolbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

export interface InvitationWithUser {
  id: string
  role: Role
  status: InvitationStatus
  createdAt: Date
  acceptedAt: Date | null
  user: {
    id: string
    name: string
    email: string
  } | null
}

interface InvitationsTableBaseProps {
  invitations: InvitationWithUser[]
  translationNamespace: string
  showRoleColumn?: boolean
  roleLabels?: Partial<Record<Role, string>>
  onCancel: (id: string, name: string) => void
  isPending?: boolean
}

export function InvitationsTableBase({
  invitations,
  translationNamespace,
  showRoleColumn = false,
  roleLabels,
  onCancel,
  isPending = false,
}: InvitationsTableBaseProps) {
  const t = useTranslations(translationNamespace)
  const tFilters = useTranslations('common.filters')
  const locale = useLocale() as 'es' | 'en'
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filterFn = useCallback(
    (inv: InvitationWithUser) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      return true
    },
    [statusFilter]
  )

  const { paginatedItems, page, totalPages, total, from, to, search, setSearch, setPage } =
    useClientPagination({
      items: invitations,
      pageSize: 10,
      searchFn: (inv, query) =>
        (inv.user?.name?.toLowerCase().includes(query) ?? false) ||
        (inv.user?.email?.toLowerCase().includes(query) ?? false),
      filterFn,
    })

  const getStatusBadge = (status: InvitationStatus) => (
    <Badge variant={INVITATION_STATUS_BADGE_VARIANTS[status] ?? 'outline'}>
      {t(
        `statuses.${status}` as
          | 'statuses.PENDING'
          | 'statuses.ACCEPTED'
          | 'statuses.REJECTED'
          | 'statuses.EXPIRED'
      )}
    </Badge>
  )

  if (invitations.length === 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">{t('empty')}</p>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')} ({invitations.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTableToolbar
          search={search}
          onSearchChange={setSearch}
          total={total}
          from={from}
          to={to}
        >
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tFilters('allStatuses')}</SelectItem>
              <SelectItem value="PENDING">{t('statuses.PENDING')}</SelectItem>
              <SelectItem value="ACCEPTED">{t('statuses.ACCEPTED')}</SelectItem>
              <SelectItem value="REJECTED">{t('statuses.REJECTED')}</SelectItem>
              <SelectItem value="EXPIRED">{t('statuses.EXPIRED')}</SelectItem>
            </SelectContent>
          </Select>
        </DataTableToolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.user')}</TableHead>
              <TableHead>{t('columns.email')}</TableHead>
              {showRoleColumn && <TableHead>{t('columns.role')}</TableHead>}
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.invitedAt')}</TableHead>
              <TableHead>{t('columns.acceptedAt')}</TableHead>
              <TableHead className="text-right">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.user?.name || '-'}</TableCell>
                <TableCell>{invitation.user?.email || '-'}</TableCell>
                {showRoleColumn && (
                  <TableCell>
                    <Badge variant="outline">
                      {roleLabels?.[invitation.role] || invitation.role}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                <TableCell>{formatDate(new Date(invitation.createdAt), locale)}</TableCell>
                <TableCell>
                  {invitation.acceptedAt
                    ? formatDate(new Date(invitation.acceptedAt), locale)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {invitation.status === INVITATION_STATUS.PENDING && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onCancel(invitation.id, invitation.user?.name || 'Usuario')
                          }
                          disabled={isPending}
                          className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                        >
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('cancel')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </CardContent>
    </Card>
  )
}
