'use client'

import { useTranslations } from 'next-intl'
import { Spinner } from '@/src/shared/ui/atoms'
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

interface EmailDialogsProps {
  deleteEmailId: string | null
  onCloseDelete: () => void
  unlinkEmailId: string | null
  onCloseUnlink: () => void
  emailToDelete: string | undefined
  emailToUnlink: string | undefined
  isPending: boolean
  onConfirmDelete: (emailId: string) => void
  onConfirmUnlink: (emailId: string) => void
}

export function EmailDialogs({
  deleteEmailId,
  onCloseDelete,
  unlinkEmailId,
  onCloseUnlink,
  emailToDelete,
  emailToUnlink,
  isPending,
  onConfirmDelete,
  onConfirmUnlink,
}: EmailDialogsProps) {
  const t = useTranslations('profile.emails')

  return (
    <>
      <AlertDialog open={!!deleteEmailId} onOpenChange={onCloseDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title') || ''}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description', { email: emailToDelete ?? '' }) || ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t('deleteConfirm.cancel') || ''}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEmailId && onConfirmDelete(deleteEmailId)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {t('deleteConfirm.deleting') || ''}
                </>
              ) : (
                t('deleteConfirm.confirm') || ''
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!unlinkEmailId} onOpenChange={onCloseUnlink}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unlinkConfirm.title') || ''}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('unlinkConfirm.description', { email: emailToUnlink ?? '' }) || ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t('unlinkConfirm.cancel') || ''}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unlinkEmailId && onConfirmUnlink(unlinkEmailId)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {t('unlinkConfirm.unlinking') || ''}
                </>
              ) : (
                t('unlinkConfirm.confirm') || ''
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
