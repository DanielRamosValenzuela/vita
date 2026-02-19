'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

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
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

interface DialogState {
  open: boolean
  id: string
  name: string
}

interface OrganizationDialogsProps {
  suspendDialog: DialogState
  setSuspendDialog: (state: DialogState) => void
  reactivateDialog: DialogState
  setReactivateDialog: (state: DialogState) => void
  deleteDialog: DialogState
  setDeleteDialog: (state: DialogState) => void
  onConfirmSuspend: () => void
  onConfirmReactivate: () => void
  onConfirmDelete: (reason: string) => void
  isPending: boolean
}

export function OrganizationDialogs({
  suspendDialog,
  setSuspendDialog,
  reactivateDialog,
  setReactivateDialog,
  deleteDialog,
  setDeleteDialog,
  onConfirmSuspend,
  onConfirmReactivate,
  onConfirmDelete,
  isPending,
}: OrganizationDialogsProps) {
  const t = useTranslations('superAdmin.organizations')
  const [deleteReason, setDeleteReason] = useState('')

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteDialog({ ...deleteDialog, open })
    if (!open) setDeleteReason('')
  }

  const handleDeleteConfirm = () => {
    onConfirmDelete(deleteReason)
    setDeleteReason('')
  }

  const handleDeleteCancel = () => {
    setDeleteReason('')
  }

  return (
    <>
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
            <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmSuspend}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmReactivate}
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('actions.reactivate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={handleDeleteOpenChange}>
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
                  disabled={isPending}
                />
                {deleteReason.length > 0 && deleteReason.length < 10 && (
                  <p className="text-destructive text-xs">{t('deleteReasonMinLength')}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isPending}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteReason.trim().length < 10 || isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
