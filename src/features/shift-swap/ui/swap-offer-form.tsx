'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'
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

import { createSwapOfferAction } from '../api/swap-offer-actions'
import { getAvailableShiftsForSwapAction } from '../api/swap-queries'

interface SwapOfferFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  swapRequestId: string
  areaId: string
}

function formatShortDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SwapOfferForm({
  open,
  onOpenChange,
  swapRequestId,
  areaId,
}: SwapOfferFormProps) {
  const t = useTranslations('swap')
  const [shifts, setShifts] = useState<Array<{
    id: string
    startTime: Date
    endTime: Date
    user: { id: string; name: string }
    shiftType: { id: string; name: string; color: string; icon: string | null }
  }>>([])
  const [loading, setLoading] = useState(false)
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadShifts = useCallback(async () => {
    setLoading(true)
    const result = await getAvailableShiftsForSwapAction(areaId)
    if (result.success && result.data)
      setShifts(result.data.shifts)
    setLoading(false)
  }, [areaId])

  useEffect(() => {
    if (open)
      startTransition(() => { void loadShifts() })
  }, [open, loadShifts])

  const handleSubmit = async () => {
    if (!selectedShiftId) return
    setSubmitting(true)
    const result = await createSwapOfferAction(
      swapRequestId,
      selectedShiftId,
      note || undefined
    )
    if (result.success) {
      toast.success(t('success.offerCreated'))
      onOpenChange(false)
      setSelectedShiftId(null)
      setNote('')
    } else
      toast.error(result.error)
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('makeOffer')}</DialogTitle>
          <DialogDescription>{t('selectMyShift')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : shifts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('noShiftsAvailable')}
            </p>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {shifts.map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setSelectedShiftId(shift.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedShiftId === shift.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: shift.shiftType.color,
                        color: shift.shiftType.color,
                      }}
                    >
                      {shift.shiftType.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(shift.startTime)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="offer-note">{t('offerNote')}</Label>
            <Textarea
              id="offer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('offerNotePlaceholder')}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedShiftId || submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('makeOffer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
