'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  Mail,
  Plus,
  Star,
  Trash2,
  Unlink,
} from 'lucide-react'
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
import { GoogleIcon } from '@/src/shared/ui/icons'
import { Input } from '@/src/shared/ui/input'

import {
  addEmailAction,
  getUserEmailsAction,
  initiateGoogleLinkAction,
  removeEmailAction,
  setPrimaryEmailAction,
  syncPrimaryEmailAction,
  unlinkGoogleAction,
} from '../api'

interface UserEmail {
  id: string
  email: string
  isPrimary: boolean
  isVerified: boolean
  provider: string | null
  createdAt: Date
}

export function EmailsManagementSection() {
  const t = useTranslations('profile.emails')
  const searchParams = useSearchParams()
  const [emails, setEmails] = useState<UserEmail[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deleteEmailId, setDeleteEmailId] = useState<string | null>(null)
  const [unlinkEmailId, setUnlinkEmailId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadEmails = () => {
    startTransition(async () => {
      const result = await getUserEmailsAction()
      if (result.success && result.data) setEmails(result.data)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    startTransition(async () => {
      await syncPrimaryEmailAction()
      loadEmails()
    })

    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'google_linked') {
      toast.success(t('googleLinkSuccess'))
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        google_link_error: t('googleLinkError'),
        missing_params: t('googleLinkMissingParams'),
        invalid_email: t('googleLinkInvalidEmail'),
        email_mismatch: t('googleLinkEmailMismatch'),
        server_error: t('googleLinkServerError'),
      }
      toast.error(errorMessages[error] || t('googleLinkError'))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams, t])

  function handleAddEmail() {
    if (!newEmail.trim()) {
      toast.error('Ingresa un email')
      return
    }

    startTransition(async () => {
      const result = await addEmailAction(newEmail)

      if (result.success) {
        toast.success(result.message || 'Email agregado')
        setNewEmail('')
        loadEmails()
      } else toast.error(result.error || 'Error al agregar email')
    })
  }

  function handleRemoveEmail(emailId: string) {
    startTransition(async () => {
      const result = await removeEmailAction(emailId)

      if (result.success) {
        toast.success(result.message || 'Email eliminado')
        setDeleteEmailId(null)
        loadEmails()
      } else toast.error(result.error || 'Error al eliminar email')
    })
  }

  const handleSetPrimary = (emailId: string) => {
    startTransition(async () => {
      const result = await setPrimaryEmailAction(emailId)

      if (result.success) {
        toast.success(result.message || 'Email principal actualizado')
        await getUserEmailsAction().then((res) => {
          if (res.success && res.data) setEmails(res.data)
        })
      } else toast.error(result.error || 'Error al establecer email principal')
    })
  }

  function handleLinkGoogle(emailId: string) {
    startTransition(async () => {
      const result = await initiateGoogleLinkAction(emailId)

      if (result.success && result.data?.authUrl) window.location.href = result.data.authUrl
      else toast.error(result.error || 'Error al vincular con Google')
    })
  }

  function handleUnlinkGoogle(emailId: string) {
    startTransition(async () => {
      const result = await unlinkGoogleAction(emailId)

      if (result.success) {
        toast.success(result.message || 'Vinculación eliminada')
        setUnlinkEmailId(null)
        loadEmails()
      } else toast.error(result.error || 'Error al desvincular')
    })
  }

  const emailToDelete = emails.find((e) => e.id === deleteEmailId)
  const emailToUnlink = emails.find((e) => e.id === unlinkEmailId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="email"
              placeholder={t('addEmailPlaceholder')}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isPending) handleAddEmail()
              }}
              disabled={isPending}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddEmail} disabled={isPending || !newEmail.trim()}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {t('addEmail')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('noEmails')}</p>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => {
              const isGmail = email.email.endsWith('@gmail.com')
              const isLinkedWithGoogle = email.provider === 'GOOGLE'

              return (
                <div
                  key={email.id}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{email.email}</p>
                        {email.isPrimary && (
                          <Badge variant="default" className="text-xs">
                            {t('primary')}
                          </Badge>
                        )}
                        {email.isVerified && <CheckCircle2 className="text-green-600 h-4 w-4" />}
                        {email.provider && (
                          <Badge variant="outline" className="text-xs">
                            {email.provider}
                          </Badge>
                        )}
                      </div>
                      {!email.isVerified && (
                        <p className="text-muted-foreground text-xs">{t('notVerified')}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isGmail && !isLinkedWithGoogle && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkGoogle(email.id)}
                        disabled={isPending}
                        title={t('linkWithGoogle')}
                        className="gap-2"
                      >
                        <GoogleIcon className="h-4 w-4" />
                        <LinkIcon className="h-3 w-3" />
                      </Button>
                    )}

                    {isLinkedWithGoogle && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUnlinkEmailId(email.id)}
                        disabled={isPending}
                        title={t('unlinkGoogle')}
                        className="gap-2"
                      >
                        <GoogleIcon className="h-4 w-4" />
                        <Unlink className="h-3 w-3" />
                      </Button>
                    )}

                    {!email.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(email.id)}
                        disabled={isPending}
                        title={t('setPrimary')}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}

                    {!email.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteEmailId(email.id)}
                        disabled={isPending}
                        title={t('removeEmail')}
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <AlertDialog open={!!deleteEmailId} onOpenChange={() => setDeleteEmailId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirm.title') || ''}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteConfirm.description', { email: emailToDelete?.email || '' }) || ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                {t('deleteConfirm.cancel') || ''}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteEmailId && handleRemoveEmail(deleteEmailId)}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('deleteConfirm.deleting') || ''}
                  </>
                ) : (
                  t('deleteConfirm.confirm') || ''
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!unlinkEmailId} onOpenChange={() => setUnlinkEmailId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('unlinkConfirm.title') || ''}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('unlinkConfirm.description', { email: emailToUnlink?.email || '' }) || ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                {t('unlinkConfirm.cancel') || ''}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => unlinkEmailId && handleUnlinkGoogle(unlinkEmailId)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('unlinkConfirm.unlinking') || ''}
                  </>
                ) : (
                  t('unlinkConfirm.confirm') || ''
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
