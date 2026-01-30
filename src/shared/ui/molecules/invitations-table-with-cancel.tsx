'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Role } from '@prisma/client'
import { toast } from 'sonner'

import type { ActionResult } from '@/src/shared/lib/types'
import { useRouter } from '@/i18n/navigation'

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
import {
  InvitationsTableBase,
  type InvitationWithUser,
} from '@/src/shared/ui/molecules/invitations-table-base'

export interface InvitationsTableWithCancelProps {
  invitations: InvitationWithUser[]
  translationNamespace: string
  onCancelInvitation: (id: string) => Promise<ActionResult<unknown>>
  showRoleColumn?: boolean
  roleLabels?: Partial<Record<Role, string>>
}

export function InvitationsTableWithCancel({
  invitations,
  translationNamespace,
  onCancelInvitation,
  showRoleColumn = false,
  roleLabels,
}: InvitationsTableWithCancelProps) {
  const t = useTranslations(translationNamespace)
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
      const result = await onCancelInvitation(cancelDialog.id)

      if (result.success) {
        toast.success(result.message || t('cancelSuccess'))
        setCancelDialog({ open: false, id: '', name: '' })
        router.refresh()
      } else {
        const errorMessage = result.error || t('cancelError')
        toast.error(errorMessage)
      }
    })
  }

  return (
    <>
      <InvitationsTableBase
        invitations={invitations}
        translationNamespace={translationNamespace}
        showRoleColumn={showRoleColumn}
        roleLabels={roleLabels}
        onCancel={handleCancel}
        isPending={isPending}
      />
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
    </>
  )
}
