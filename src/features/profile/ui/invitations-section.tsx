'use client'

import { useEffect, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { formatDate } from '@/src/shared/lib/utils/format'
import { Alert, AlertDescription } from '@/src/shared/ui/alert'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

import {
  acceptInvitationAction,
  getPendingInvitationsAction,
  rejectInvitationAction,
} from '../api/profile-actions'

interface Invitation {
  id: string
  organization: {
    id: string
    name: string
  }
  role: string
  createdAt: Date
}

export function InvitationsSection() {
  const t = useTranslations('profile.invitations')
  const locale = useLocale() as 'es' | 'en'
  const [isPending, startTransition] = useTransition()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInvitations = async () => {
      const result = await getPendingInvitationsAction()
      if (result.success && result.data && Array.isArray(result.data))
        setInvitations(result.data as Invitation[])

      setLoading(false)
    }
    loadInvitations()
  }, [])

  const handleAccept = async (invitationId: string) => {
    startTransition(async () => {
      const result = await acceptInvitationAction(invitationId)

      if (result.success) {
        toast.success(t('acceptSuccess'))
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else toast.error(result.error || t('acceptError'))
    })
  }

  const handleReject = async (invitationId: string) => {
    startTransition(async () => {
      const result = await rejectInvitationAction(invitationId)

      if (result.success) {
        toast.success(t('rejectSuccess'))
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
      } else toast.error(result.error || t('rejectError'))
    })
  }

  if (loading)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex items-center justify-center py-8" role="status" aria-live="polite">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" aria-hidden />
          </p>
        </CardContent>
      </Card>
    )

  if (invitations.length === 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4 list-none p-0 m-0">
          {invitations.map((invitation) => (
            <li key={invitation.id}>
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {t('invitationFrom')} {invitation.organization.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t('role')}: <Badge variant="secondary">{invitation.role}</Badge>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(new Date(invitation.createdAt), locale)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAccept(invitation.id)}
                      disabled={isPending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t('accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(invitation.id)}
                      disabled={isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('reject')}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
