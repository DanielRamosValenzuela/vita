'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Minus, RefreshCw } from 'lucide-react'

import holidaysClSample from '@/src/shared/lib/constants/holidays-cl-sample.json'
import type { BoostrHolidaysResponse } from '@/src/shared/lib/types/holidays'
import { cn } from '@/src/shared/lib/utils'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Skeleton } from '@/src/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

const LEGEND_SEP = '\u00B7'

interface CalendarEventBase {
  id: string
  title: string
  startTime: Date
  endTime: Date
  color: string
  areaName: string
}

export interface IndividualCalendarEvent extends CalendarEventBase {
  kind: 'individual'
  status: string
  userName: string
  icon?: string
}

export interface RotationGroupCalendarEvent extends CalendarEventBase {
  kind: 'rotation-group'
  rotationId: string
  shiftTypeId: string
  personCount: number
  shiftIds: string[]
}

export type CalendarEvent = IndividualCalendarEvent | RotationGroupCalendarEvent

interface ShiftCalendarProps {
  shifts: CalendarEvent[]
  loading?: boolean
  onDateSelect?: (date: Date) => void
  onShiftClick?: (shift: CalendarEvent) => void
  onShiftDelete?: (shift: CalendarEvent) => void
  onRotationBlockClick?: (block: RotationGroupCalendarEvent) => void
  onMonthChange?: (month: Date) => void
  selectedDate?: Date
}

interface ShiftCalendarDayCellProps {
  date: Date
  shifts: CalendarEvent[]
  onShiftClick?: (shift: CalendarEvent) => void
  onShiftDelete?: (shift: CalendarEvent) => void
  onRotationBlockClick?: (block: RotationGroupCalendarEvent) => void
}

const SKELETON_PATTERN = [2, 0, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 0, 1, 2, 3, 0, 1, 0, 2, 1, 3, 0, 0, 2, 1, 0, 3, 1, 2, 0, 1, 2, 0, 3, 1, 0, 2, 1, 0, 3, 2]
const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6']
const SKELETON_SLOT_IDS = ['a', 'b', 'c']

function ShiftCalendarDayCellSkeleton({ date, dayIndex }: { date: Date; dayIndex: number }) {
  const formattedDay = format(date, 'd')
  const barCount = SKELETON_PATTERN[dayIndex % SKELETON_PATTERN.length]

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="shrink-0 p-0.5">
        <div className="text-sm font-medium">{formattedDay}</div>
      </div>
      {barCount > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-1 pt-0">
          {SKELETON_SLOT_IDS.slice(0, barCount).map((slotId, pos) => (
            <Skeleton
              key={`sk-${dayIndex}-${slotId}`}
              className={cn('h-4 rounded', SKELETON_WIDTHS[(dayIndex + pos) % SKELETON_WIDTHS.length])}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ShiftCalendarDayCell({
  date,
  shifts,
  onShiftClick,
  onShiftDelete,
  onRotationBlockClick,
}: ShiftCalendarDayCellProps) {
  const t = useTranslations('shifts')
  const dayShifts = shifts
  const formattedDay = format(date, 'd')

  if (dayShifts.length === 0)
    return (
      <div className="relative flex h-full w-full flex-col">
        <div className="shrink-0 p-0.5">
          <div className="text-sm font-medium">{formattedDay}</div>
        </div>
      </div>
    )

  const now = new Date()

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="shrink-0 p-0.5">
        <div className="text-sm font-medium">{formattedDay}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-0.5 pt-0">
        {dayShifts.map((shift) => {
          const isPast = new Date(shift.endTime) < now
          const opacity = isPast ? 0.45 : 1

          if (shift.kind === 'rotation-group')
            return (
              <div
                key={shift.id}
                className="flex min-h-0 flex-1 items-stretch overflow-hidden rounded"
                style={{
                  backgroundColor: shift.color + (isPast ? '30' : '20'),
                  borderLeft: `3px solid ${shift.color}`,
                  opacity,
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-1 px-1 py-1 text-left text-[10px] leading-tight cursor-pointer hover:opacity-80 overflow-hidden"
                      style={{ color: shift.color }}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRotationBlockClick?.(shift)
                      }}
                    >
                      <RefreshCw className="h-2.5 w-2.5 shrink-0" />
                      <span className="font-medium shrink-0">{format(shift.startTime, 'HH:mm')}</span>
                      <span className="truncate">{t('calendar.rotationBlockPersons', { count: shift.personCount })}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-semibold">{shift.title}</p>
                    <p>
                      {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                    </p>
                    <p className="text-muted-foreground">{shift.areaName}</p>
                    <p className="text-muted-foreground">
                      {t('calendar.rotationBlockPersons', { count: shift.personCount })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )

          return (
            <div
              key={shift.id}
              className="flex min-h-0 flex-1 items-stretch gap-0.5 overflow-hidden rounded"
              style={{
                backgroundColor: shift.color + (isPast ? '30' : '20'),
                borderLeft: `3px solid ${shift.color}`,
                opacity,
              }}
            >
              {onShiftDelete && (
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center rounded-l p-0.5 text-muted-foreground/70 hover:bg-black/10 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-inset focus:ring-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    onShiftDelete(shift)
                  }}
                  aria-label={t('deleteConfirm.action')}
                >
                  <Minus className="h-3 w-3" />
                </button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-0 px-1 py-1 text-left text-[10px] leading-tight cursor-pointer hover:opacity-80 overflow-hidden"
                    style={{ color: shift.color }}
                    onClick={(event) => {
                      event.stopPropagation()
                      onShiftClick?.(shift)
                    }}
                  >
                    <span className="font-medium shrink-0">{format(shift.startTime, 'HH:mm')}</span>
                    <span className="truncate">{shift.userName.split(' ')[0]}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{shift.userName}</p>
                  <p>
                    {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                  </p>
                  <p className="text-muted-foreground">{shift.areaName}</p>
                  {shift.title && <p className="text-muted-foreground">{shift.title}</p>}
                </TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ShiftCalendar({
  shifts,
  loading,
  onDateSelect,
  onShiftClick,
  onShiftDelete,
  onRotationBlockClick,
  onMonthChange,
  selectedDate,
}: ShiftCalendarProps) {
  const t = useTranslations('shifts')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const shiftsByDay = useMemo(() => {
    return shifts.reduce(
      (acc, shift) => {
        const dateKey = format(shift.startTime, 'yyyy-MM-dd')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(shift)
        return acc
      },
      {} as Record<string, CalendarEvent[]>
    )
  }, [shifts])

  const uniqueShiftTypes = useMemo(() => {
    const seen = new Map<string, { color: string; name: string }>()
    for (const shift of shifts)
      if (!seen.has(shift.color))
        seen.set(shift.color, { color: shift.color, name: shift.areaName })

    return Array.from(seen.values())
  }, [shifts])

  const holidayDatesSet = useMemo(() => {
    const data = (holidaysClSample as BoostrHolidaysResponse).data
    const year = currentMonth.getFullYear()
    return new Set(data.filter((h) => h.date.startsWith(String(year))).map((h) => h.date))
  }, [currentMonth])

  const getEventsForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return shiftsByDay[dateKey] || []
  }

  const handlePreviousMonth = () => {
    const prev = subMonths(currentMonth, 1)
    setCurrentMonth(prev)
    onMonthChange?.(prev)
  }
  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1)
    setCurrentMonth(next)
    onMonthChange?.(next)
  }

  const formatMonthTitle = (date: Date) => {
    const monthStr = format(date, 'MMMM yyyy', { locale: dateLocale })
    return monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
  }

  const calendarDays = useMemo(() => {
    const first = startOfWeek(startOfMonth(currentMonth), { locale: dateLocale })
    return Array.from({ length: 42 }, (_, i) => addDays(first, i))
  }, [currentMonth, dateLocale])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(startOfWeek(new Date(), { locale: dateLocale }), i), 'EEEEEE', {
        locale: dateLocale,
      })
    )
  }, [dateLocale])

  const today = new Date()

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{formatMonthTitle(currentMonth)}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <div className="w-full min-w-0 overflow-x-auto rounded-md border">
            <table
              className="w-full table-fixed border-collapse"
              style={{ tableLayout: 'fixed' }}
              role="grid"
              aria-label={formatMonthTitle(currentMonth)}
            >
              <thead>
                <tr>
                  {weekDays.map((dayName) => (
                    <th
                      key={dayName}
                      className="border-b p-1 text-center text-[0.8rem] font-normal text-muted-foreground"
                      scope="col"
                    >
                      {dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {calendarDays.slice(rowIndex * 7, rowIndex * 7 + 7).map((date, colIndex) => {
                      const dayIndex = rowIndex * 7 + colIndex
                      const dateKey = format(date, 'yyyy-MM-dd')
                      const isCurrentMonth = isSameMonth(date, currentMonth)
                      const isTodayCell = isSameDay(date, today)
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      const isHoliday = holidayDatesSet.has(dateKey)
                      const isSelected =
                        selectedDate != null && isSameDay(date, selectedDate)
                      return (
                        <td
                          key={dateKey}
                          className={cn(
                            'relative h-32 min-h-32 border-b border-r p-0 align-top last:border-r-0',
                            !isCurrentMonth && 'text-muted-foreground/60',
                            isTodayCell &&
                              'bg-primary/25 ring-2 ring-primary/50 ring-inset',
                            isHoliday && !isTodayCell && 'bg-amber-500/15',
                            isWeekend && !isHoliday && !isTodayCell && 'bg-muted/75',
                            isSelected && 'bg-accent'
                          )}
                          onClick={() => onDateSelect?.(date)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') onDateSelect?.(date)
                          }}
                          role="gridcell"
                          tabIndex={0}
                          aria-selected={isSelected}
                        >
                          <div className="h-full w-full overflow-hidden p-0.5">
                            {loading
                              ? <ShiftCalendarDayCellSkeleton date={date} dayIndex={dayIndex} />
                              : (
                                <ShiftCalendarDayCell
                                  date={date}
                                  shifts={getEventsForDay(date)}
                                  onShiftClick={onShiftClick}
                                  onShiftDelete={onShiftDelete}
                                  onRotationBlockClick={onRotationBlockClick}
                                />
                              )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
            {uniqueShiftTypes.length > 0 && (
              <>
                {uniqueShiftTypes.map((st) => (
                  <div key={st.color} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="text-muted-foreground">{st.name}</span>
                  </div>
                ))}
                <span className="text-muted-foreground/50" aria-hidden>{LEGEND_SEP}</span>
              </>
            )}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 shrink-0 rounded bg-primary/50 ring-1 ring-primary/60" />
              <span className="text-muted-foreground">{t('legend.today')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 shrink-0 rounded bg-muted" />
              <span className="text-muted-foreground">{t('legend.weekend')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 shrink-0 rounded bg-amber-500/30" />
              <span className="text-muted-foreground">{t('legend.holiday')}</span>
            </div>
            <span className="text-muted-foreground/50" aria-hidden>{LEGEND_SEP}</span>
            <div className="flex items-center gap-1.5 text-xs">
              <RefreshCw className="h-2.5 w-2.5 shrink-0 text-blue-500" />
              <span className="text-muted-foreground">{t('legend.rotation')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
