'use client'

import { useEffect, useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Mail, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
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

import { EmailDialogs } from './email-dialogs'
import { EmailListItem, type UserEmail } from './email-list-item'

type EmailsState = {
  emails: UserEmail[]
  newEmail: string
  deleteEmailId: string | null
  unlinkEmailId: string | null
  isLoading: boolean
}

type EmailsAction =
  | { type: 'SET_EMAILS'; payload: UserEmail[] }
  | { type: 'SET_NEW_EMAIL'; payload: string }
  | { type: 'SET_DELETE_EMAIL_ID'; payload: string | null }
  | { type: 'SET_UNLINK_EMAIL_ID'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: EmailsState = {
  emails: [],
  newEmail: '',
  deleteEmailId: null,
  unlinkEmailId: null,
  isLoading: true,
}

function emailsReducer(state: EmailsState, action: EmailsAction): EmailsState {
  if (action.type === 'SET_EMAILS')
    return { ...state, emails: action.payload }
  else if (action.type === 'SET_NEW_EMAIL')
    return { ...state, newEmail: action.payload }
  else if (action.type === 'SET_DELETE_EMAIL_ID')
    return { ...state, deleteEmailId: action.payload }
  else if (action.type === 'SET_UNLINK_EMAIL_ID')
    return { ...state, unlinkEmailId: action.payload }
  else if (action.type === 'SET_LOADING')
    return { ...state, isLoading: action.payload }
  return state
}

export function EmailsManagementSection({
  success,
  error,
}: {
  success?: string
  error?: string
}) {
  const t = useTranslations('profile.emails')
  const [state, dispatch] = useReducer(emailsReducer, initialState)
  const [isPending, startTransition] = useTransition()

  const { emails, newEmail, deleteEmailId, unlinkEmailId, isLoading } = state

  const loadEmails = () => {
    startTransition(async () => {
      const result = await getUserEmailsAction()
      if (result.success && result.data) dispatch({ type: 'SET_EMAILS', payload: result.data })
      dispatch({ type: 'SET_LOADING', payload: false })
    })
  }

  useEffect(() => {
    startTransition(async () => {
      await syncPrimaryEmailAction()
      loadEmails()
    })

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
      toast.error(errorMessages[error] ?? t('googleLinkError'))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [success, error, t])

  function handleAddEmail() {
    if (!newEmail.trim()) {
      toast.error(t('addEmailEmpty'))
      return
    }

    startTransition(async () => {
      const result = await addEmailAction(newEmail)

      if (result.success) {
        toast.success(result.message ?? t('addEmailSuccess'))
        dispatch({ type: 'SET_NEW_EMAIL', payload: '' })
        loadEmails()
      } else toast.error(result.error ?? t('addEmailError'))
    })
  }

  function handleRemoveEmail(emailId: string) {
    startTransition(async () => {
      const result = await removeEmailAction(emailId)

      if (result.success) {
        toast.success(result.message ?? t('removeEmailSuccess'))
        dispatch({ type: 'SET_DELETE_EMAIL_ID', payload: null })
        loadEmails()
      } else toast.error(result.error ?? t('removeEmailError'))
    })
  }

  function handleSetPrimary(emailId: string) {
    startTransition(async () => {
      const result = await setPrimaryEmailAction(emailId)

      if (result.success) {
        toast.success(result.message ?? t('setPrimarySuccess'))
        await getUserEmailsAction().then((res) => {
          if (res.success && res.data) dispatch({ type: 'SET_EMAILS', payload: res.data })
        })
      } else toast.error(result.error ?? t('setPrimaryError'))
    })
  }

  function handleLinkGoogle(emailId: string) {
    startTransition(async () => {
      const result = await initiateGoogleLinkAction(emailId)

      if (result.success && result.data?.authUrl) window.location.href = result.data.authUrl
      else toast.error(result.error ?? t('googleLinkError'))
    })
  }

  function handleUnlinkGoogle(emailId: string) {
    startTransition(async () => {
      const result = await unlinkGoogleAction(emailId)

      if (result.success) {
        toast.success(result.message ?? t('unlinkSuccess'))
        dispatch({ type: 'SET_UNLINK_EMAIL_ID', payload: null })
        loadEmails()
      } else toast.error(result.error ?? t('unlinkError'))
    })
  }

  const emailToDelete = emails.find((e) => e.id === deleteEmailId)?.email
  const emailToUnlink = emails.find((e) => e.id === unlinkEmailId)?.email

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
              onChange={(e) => dispatch({ type: 'SET_NEW_EMAIL', payload: e.target.value })}
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
            {emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                isPending={isPending}
                onLinkGoogle={handleLinkGoogle}
                onUnlinkGoogle={(id) => dispatch({ type: 'SET_UNLINK_EMAIL_ID', payload: id })}
                onSetPrimary={handleSetPrimary}
                onDelete={(id) => dispatch({ type: 'SET_DELETE_EMAIL_ID', payload: id })}
              />
            ))}
          </div>
        )}

        <EmailDialogs
          deleteEmailId={deleteEmailId}
          onCloseDelete={() => dispatch({ type: 'SET_DELETE_EMAIL_ID', payload: null })}
          unlinkEmailId={unlinkEmailId}
          onCloseUnlink={() => dispatch({ type: 'SET_UNLINK_EMAIL_ID', payload: null })}
          emailToDelete={emailToDelete}
          emailToUnlink={emailToUnlink}
          isPending={isPending}
          onConfirmDelete={handleRemoveEmail}
          onConfirmUnlink={handleUnlinkGoogle}
        />
      </CardContent>
    </Card>
  )
}
