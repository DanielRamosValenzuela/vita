'use client'

import { useTranslations } from 'next-intl'
import { Calendar, Clock } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'

interface UpcomingShiftsProps {
  shifts: ShiftWithRelations[]
  onShiftClick?: (shiftId: string) => void
}

function getRelativeDay(date: Date, t: (key: string) => string): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return t('today')
  if (diffDays === 1) return t('tomorrow')
  return target.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function UpcomingShifts({ shifts, onShiftClick }: UpcomingShiftsProps) {
  const t = useTranslations('staffDashboard.upcoming')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {shifts.map((shift) => (
              <button
                key={shift.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/50"
                onClick={() => onShiftClick?.(shift.id)}
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: shift.shiftType.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {shift.area.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{getRelativeDay(shift.startTime, t)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs"
                  style={{
                    borderColor: shift.shiftType.color,
                    color: shift.shiftType.color,
                  }}
                >
                  {shift.shiftType.name}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
