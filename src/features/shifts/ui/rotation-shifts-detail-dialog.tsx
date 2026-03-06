'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Pencil, RefreshCw } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

import type { ShiftWithRelations } from '../types/shift-types'

interface RotationShiftsDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shifts: ShiftWithRelations[]
  shiftTypeName: string
  date: string
  onEditShift: (shift: ShiftWithRelations) => void
  getStatusColor: (status: string) => string
  getStatusLabel: (status: string) => string
}

export function RotationShiftsDetailDialog({
  open,
  onOpenChange,
  shifts,
  shiftTypeName,
  date,
  onEditShift,
  getStatusColor,
  getStatusLabel,
}: RotationShiftsDetailDialogProps) {
  const t = useTranslations('shifts')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            {t('rotationDetail.title')}
          </DialogTitle>
          <DialogDescription>{t('rotationDetail.description', { date })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{shiftTypeName}</Badge>
            <Badge variant="outline">{shifts.length}</Badge>
          </div>

          {shifts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">
              {t('rotationDetail.noShifts')}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('rotationDetail.person')}</TableHead>
                    <TableHead>{t('rotationDetail.time')}</TableHead>
                    <TableHead>{t('rotationDetail.status')}</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-1.5">
                          {shift.user.name}
                          {shift.isManuallyModified && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {t('rotationDetail.modified')}
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shift.status)}>
                          {getStatusLabel(shift.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditShift(shift)}
                          aria-label={t('rotationDetail.editShift')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
