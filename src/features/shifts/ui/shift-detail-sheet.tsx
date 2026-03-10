'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  Edit,
  MapPin,
  RefreshCw,
  Star,
  StickyNote,
  Trash2,
  User,
} from 'lucide-react'

import {
  SHIFT_STATUS_COLORS,
  SHIFT_STATUS_I18N_KEYS,
} from '@/src/shared/lib/constants/shift-status'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/shared/ui/sheet'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'

interface ShiftDetailSheetProps {
  shift: ShiftWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (shift: ShiftWithRelations) => void
  onDelete: (shift: ShiftWithRelations) => void
}

export function ShiftDetailSheet({
  shift,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ShiftDetailSheetProps) {
  const t = useTranslations('shifts')

  if (!shift) return null

  const isNightShift = new Date(shift.endTime).getDate() !== new Date(shift.startTime).getDate()

  const isCancellable = shift.status === 'SCHEDULED' || shift.status === 'IN_PROGRESS'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('detail.title')}</SheetTitle>
          <SheetDescription>
            {shift.title || shift.rotation?.name || t('table.noTitle')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('table.user')}</p>
                <p className="text-sm font-medium">
                  {shift.user.name}
                  {shift.isExtra && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] px-1 py-0 border-amber-400 text-amber-600"
                    >
                      <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500 text-amber-500" />
                      {t('extraBadge')}
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('detail.area')}</p>
                <p className="text-sm font-medium">{shift.area.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full shrink-0"
                style={{ backgroundColor: shift.shiftType.color }}
              />
              <div>
                <p className="text-xs text-muted-foreground">{t('detail.shiftType')}</p>
                <p className="text-sm font-medium">{shift.shiftType.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('detail.date')}</p>
                <p className="text-sm font-medium">
                  {isNightShift
                    ? t('table.timeRange', {
                        start: format(new Date(shift.startTime), 'dd/MM/yyyy'),
                        end: format(new Date(shift.endTime), 'dd/MM/yyyy'),
                      })
                    : format(new Date(shift.startTime), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('detail.schedule')}</p>
                <p className="text-sm font-medium">
                  {t('table.timeRange', {
                    start: format(new Date(shift.startTime), 'HH:mm'),
                    end: format(new Date(shift.endTime), 'HH:mm'),
                  })}
                </p>
                {isNightShift && (
                  <p className="text-xs text-muted-foreground italic">{t('detail.nightShift')}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={`${SHIFT_STATUS_COLORS[shift.status]} shrink-0`}>
                {t(SHIFT_STATUS_I18N_KEYS[shift.status])}
              </Badge>
            </div>

            {shift.rotation && (
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.rotation')}</p>
                  <p className="text-sm font-medium">{shift.rotation.name}</p>
                </div>
              </div>
            )}

            {shift.notes && (
              <div className="flex items-start gap-3">
                <StickyNote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.notes')}</p>
                  <p className="text-sm whitespace-pre-wrap">{shift.notes}</p>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenChange(false)
                onEdit(shift)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              {t('detail.editAction')}
            </Button>

            {isCancellable && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  onOpenChange(false)
                  onDelete(shift)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('detail.deleteAction')}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
