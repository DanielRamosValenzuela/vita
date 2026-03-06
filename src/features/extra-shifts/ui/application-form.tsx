'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
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
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'

import { applyToExtraShiftAction } from '../api/application-actions'

interface ApplicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shiftId: string
  onApplied?: () => void
}

export function ApplicationForm({ open, onOpenChange, shiftId, onApplied }: ApplicationFormProps) {
  const t = useTranslations('extraShifts')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    const result = await applyToExtraShiftAction(shiftId, note || undefined)
    if (result.success) {
      toast.success(t('success.applied'))
      onOpenChange(false)
      setNote('')
      onApplied?.()
    } else toast.error(result.error)
    setSubmitting(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('applyConfirm')}</AlertDialogTitle>
          <AlertDialogDescription>{t('applyConfirmDescription')}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <Label htmlFor="application-note">{t('note')}</Label>
          <Textarea
            id="application-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            className="mt-1"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('withdraw')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('apply')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
