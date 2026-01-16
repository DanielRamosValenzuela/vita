'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { InvitationStatus, OrganizationInvitation, Role } from '@prisma/client'
import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { Ban } from 'lucide-react'
import { toast } from 'sonner'

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

import { useRouter } from '@/i18n/navigation'

interface InvitationWithUser extends OrganizationInvitation {
  user: {
    id: string
    name: string
    email: string
  } | null
}

type ActionContext = 'admin-hr' | 'super-admin'

interface InvitationsTableProps {
  invitations: InvitationWithUser[]
  translationNamespace: string
  actionContext: ActionContext
  showRoleColumn?: boolean
  roleLabels?: Partial<Record<Role, string>>
}

export function InvitationsTable({
  invitations,
  translationNamespace,
  actionContext,
  showRoleColumn = false,
  roleLabels,
}: InvitationsTableProps) {
  const t = useTranslations(translationNamespace)
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    id: string
    name: string
  }>({
    open: false,
    id: '',
    name: '',
  })

  const handleCancel = (id: string, name: string) => {
    setCancelDialog({ open: true, id, name })
  }

  const confirmCancel = () => {
    startTransition(async () => {
      const actions =
        actionContext === 'admin-hr'
          ? await import('@/src/features/admin-hr/api/invitation-actions')
          : await import('@/src/features/super-admin/api/admin-hr-invitation-actions')

      const result = await actions.cancelInvitationAction(cancelDialog.id)

      if (result.success) {
        toast.success(t('cancelSuccess'))
        setCancelDialog({ open: false, id: '', name: '' })
        router.refresh()
      } else {
        toast.error(result.error || t('cancelError'))
      }
    })
  }

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
                  {format(new Date(invitation.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
                </TableCell>
                <TableCell>
                  {invitation.acceptedAt
                    ? format(new Date(invitation.acceptedAt), 'dd MMM yyyy', { locale: dateLocale })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {invitation.status === 'PENDING' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCancel(invitation.id, invitation.user?.name || 'Usuario')
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
      </CardContent>
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancelConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cancelConfirm.description', { name: cancelDialog.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancelConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('cancelConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
