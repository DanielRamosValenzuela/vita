'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'

import { createOpenSwapAction } from '../api/swap-actions'

interface OpenSwapFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requesterShiftId: string
  shiftTypeName: string
  shiftDate: string
}

export function OpenSwapForm({
  open,
  onOpenChange,
  requesterShiftId,
  shiftTypeName,
  shiftDate,
}: OpenSwapFormProps) {
  const t = useTranslations('swap')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const shiftLabel = `${shiftTypeName} \u2014 ${shiftDate}`

  const handleSubmit = async () => {
    setSubmitting(true)
    const result = await createOpenSwapAction(requesterShiftId, reason || undefined)
    if (result.success) {
      toast.success(t('success.created'))
      onOpenChange(false)
      setReason('')
    } else toast.error(result.error)
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('openSwap')}</DialogTitle>
          <DialogDescription>{t('openSwapDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{t('myShift')}</p>
            <p className="text-sm font-medium">{shiftLabel}</p>
          </div>

          <div>
            <Label htmlFor="open-swap-reason">{t('reason')}</Label>
            <Textarea
              id="open-swap-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('confirmOpen')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
