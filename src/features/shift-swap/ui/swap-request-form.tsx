'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeftRight, Loader2 } from 'lucide-react'
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

import { formatShortDate } from '@/src/shared/lib/utils/format'

import { createDirectSwapAction } from '../api/swap-actions'
import { getAvailableShiftsForSwapAction } from '../api/swap-queries'

interface SwapRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requesterShiftId: string
  areaId: string
  shiftTypeName: string
  shiftDate: string
}

export function SwapRequestForm({
  open,
  onOpenChange,
  requesterShiftId,
  areaId,
  shiftTypeName,
  shiftDate,
}: SwapRequestFormProps) {
  const t = useTranslations('swap')
  const [shifts, setShifts] = useState<
    Array<{
      id: string
      startTime: Date
      endTime: Date
      user: { id: string; name: string }
      shiftType: { id: string; name: string; color: string; icon: string | null }
    }>
  >([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting'>('idle')
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const shiftLabel = `${shiftTypeName} \u2014 ${shiftDate}`

  const loadShifts = useCallback(async () => {
    setStatus('loading')
    const result = await getAvailableShiftsForSwapAction(areaId)
    if (result.success && result.data) setShifts(result.data.shifts)
    setStatus('idle')
  }, [areaId])

  const prevOpenRef = useRef(false)
  useEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open
    if (open && !wasOpen)
      startTransition(() => {
        void loadShifts()
      })
  }, [open, loadShifts])

  const handleSubmit = async () => {
    if (!selectedShiftId) return
    setStatus('submitting')
    const result = await createDirectSwapAction(
      requesterShiftId,
      selectedShiftId,
      reason || undefined
    )
    if (result.success) {
      toast.success(t('success.created'))
      onOpenChange(false)
      setSelectedShiftId(null)
      setReason('')
    } else toast.error(result.error)
    setStatus('idle')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('directSwap')}</DialogTitle>
          <DialogDescription>{t('directSwapDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{t('myShift')}</p>
            <p className="text-sm font-medium">{shiftLabel}</p>
          </div>

          <div className="flex justify-center">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <Label>{t('selectTargetShift')}</Label>
            {status === 'loading' ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shifts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('noShiftsAvailable')}
              </p>
            ) : (
              <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{shift.user.name}</p>
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
                            {formatShortDate(shift.startTime, { weekday: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="swap-reason">{t('reason')}</Label>
            <Textarea
              id="swap-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!selectedShiftId || status === 'submitting'}>
            {status === 'submitting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
