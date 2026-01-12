'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'
import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import type { OrganizationInvitation, InvitationStatus } from '@prisma/client'

interface InvitationWithUser extends OrganizationInvitation {
  user: {
    id: string
    name: string
    email: string
  }
}

interface InvitationsTableProps {
  invitations: InvitationWithUser[]
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const t = useTranslations('superAdmin.organizationDetails.invitations')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS

  const getStatusBadge = (status: InvitationStatus) => {
    const variants: Record<InvitationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> =
      {
        PENDING: 'secondary',
        ACCEPTED: 'default',
        REJECTED: 'destructive',
        EXPIRED: 'outline',
      }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {t(
          `statuses.${status}` as
            | 'statuses.PENDING'
            | 'statuses.ACCEPTED'
            | 'statuses.REJECTED'
            | 'statuses.EXPIRED'
        )}
      </Badge>
    )
  }

  if (invitations.length === 0) {
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
  }

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
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.invitedAt')}</TableHead>
              <TableHead>{t('columns.acceptedAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.user.name}</TableCell>
                <TableCell>{invitation.user.email}</TableCell>
                <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                <TableCell>
                  {format(new Date(invitation.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
                </TableCell>
                <TableCell>
                  {invitation.acceptedAt
                    ? format(new Date(invitation.acceptedAt), 'dd MMM yyyy', { locale: dateLocale })
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
