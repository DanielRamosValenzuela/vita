'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { InvitationStatus, Role } from '@prisma/client'
import { Ban } from 'lucide-react'

import { formatDate } from '@/src/shared/lib/utils/format'

import {
  INVITATION_STATUS,
  INVITATION_STATUS_BADGE_VARIANTS,
} from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/src/shared/ui/tooltip'

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

export interface InvitationsTableBaseProps {
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
  const locale = useLocale() as 'es' | 'en'

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
      <CardContent>
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
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">
                  {invitation.user?.name || '-'}
                </TableCell>
                <TableCell>{invitation.user?.email || '-'}</TableCell>
                {showRoleColumn && (
                  <TableCell>
                    <Badge variant="outline">
                      {roleLabels?.[invitation.role] || invitation.role}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                <TableCell>
                  {formatDate(new Date(invitation.createdAt), locale)}
                </TableCell>
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
                          onClick={() => onCancel(invitation.id, invitation.user?.name || 'Usuario')}
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
      </CardContent>
    </Card>
  )
}
