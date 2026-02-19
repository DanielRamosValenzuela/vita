'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'

import { type ShiftType, type ShiftTypesAction } from './shift-types-utils'

export interface DeleteShiftTypeDialogProps {
  deleteDialogOpen: boolean
  deleteTarget: ShiftType | null
  dispatch: Dispatch<ShiftTypesAction>
  isPending: boolean
  onConfirm: () => void
}

export function DeleteShiftTypeDialog({
  deleteDialogOpen,
  deleteTarget,
  dispatch,
  isPending,
  onConfirm,
}: DeleteShiftTypeDialogProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <Dialog
      open={deleteDialogOpen}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'CLOSE_DELETE' })
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>{t('delete.description')}</DialogDescription>
        </DialogHeader>
        {deleteTarget && (
          <div className="py-5">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: deleteTarget.color }}
              />
              <div>
                <div className="font-medium">{deleteTarget.name}</div>
                {deleteTarget.description && (
                  <div className="text-sm text-muted-foreground">{deleteTarget.description}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t('delete.shiftsCount', { count: deleteTarget._count?.shifts ?? 0 })}
                </div>
              </div>
            </div>
            {(deleteTarget._count?.shifts ?? 0) === 0 && (
              <div className="text-sm text-primary">
                <Check className="inline-block mr-1 h-4 w-4" />
                {t('delete.noShiftsWarning')}
              </div>
            )}
            {(deleteTarget._count?.shifts ?? 0) > 0 && (
              <div className="text-sm text-muted-foreground">
                <X className="inline-block mr-1 h-4 w-4" />
                {t('delete.hasShiftsWarning')}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch({ type: 'CLOSE_DELETE' })}>
            {t('delete.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending || Boolean(deleteTarget && (deleteTarget._count?.shifts ?? 0) > 0)}
          >
            {isPending ? t('delete.deleting') : t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
