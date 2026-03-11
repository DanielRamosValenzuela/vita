'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Checkbox } from '@/src/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import { completeShiftsByDayAction, getShiftsAction } from '../api/shift-actions'

interface ShiftCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  areaId: string
  areaName: string
  onCompleted: () => void
}

interface ShiftItem {
  id: string
  userName: string
  shiftTypeName: string
  startTime: string
  endTime: string
}

export function ShiftCompletionDialog({
  open,
  onOpenChange,
  date,
  areaId,
  areaName,
  onCompleted,
}: ShiftCompletionDialogProps) {
  const t = useTranslations('shifts')
  const [shifts, setShifts] = useState<ShiftItem[]>([])
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    let cancelled = false

    const dayStart = new Date(date)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setUTCHours(23, 59, 59, 999)

    getShiftsAction({
      areaId,
      status: 'SCHEDULED',
      startDate: dayStart,
      endDate: dayEnd,
      pageSize: 100,
    }).then((result) => {
      if (cancelled) return
      if (result.success && result.data)
        setShifts(
          result.data.shifts.map((s) => ({
            id: s.id,
            userName: s.user.name,
            shiftTypeName: s.shiftType.name,
            startTime: new Date(s.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            endTime: new Date(s.endTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        )

      setLoading(false)
    })

    return () => { cancelled = true }
  }, [open, date, areaId])

  const toggleExclude = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeShiftsByDayAction({
        date,
        areaId,
        excludeShiftIds: Array.from(excludedIds),
      })

      if (result.success) {
        toast.success(result.message)
        onCompleted()
        onOpenChange(false)
      } else 
        toast.error(result.error ?? t('completion.error'))
      
    })
  }

  const selectedCount = shifts.length - excludedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('completion.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('completion.dialogDescription', {
              area: areaName,
              date: date.toLocaleDateString(),
            })}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : shifts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('completion.noShifts')}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{t('completion.selectedCount', { count: selectedCount })}</span>
              <Badge variant="secondary">{shifts.length} {t('completion.total')}</Badge>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>{t('completion.employee')}</TableHead>
                    <TableHead>{t('completion.shiftType')}</TableHead>
                    <TableHead>{t('completion.time')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <Checkbox
                          checked={!excludedIds.has(shift.id)}
                          onCheckedChange={() => toggleExclude(shift.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{shift.userName}</TableCell>
                      <TableCell>{shift.shiftTypeName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {shift.startTime} - {shift.endTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t('~common.cancel')}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isPending || selectedCount === 0}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden />
            )}
            {t('completion.confirmButton', { count: selectedCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
