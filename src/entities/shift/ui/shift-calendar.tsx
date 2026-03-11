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
import { CheckCircle2, ChevronLeft, ChevronRight, Minus, RefreshCw, Star, StickyNote } from 'lucide-react'

import holidaysClSample from '@/src/shared/lib/constants/holidays-cl-sample.json'
import type { BoostrHolidaysResponse } from '@/src/shared/lib/types/holidays'
import { cn } from '@/src/shared/lib/utils'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Popover, PopoverAnchor, PopoverContent } from '@/src/shared/ui/popover'
import { Skeleton } from '@/src/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

interface CalendarEventBase {
  id: string
  title: string
  startTime: Date
  endTime: Date
  color: string
  areaName: string
  shiftTypeName: string
}

export interface IndividualCalendarEvent extends CalendarEventBase {
  kind: 'individual'
  status: string
  userName: string
  icon?: string
  isExtra?: boolean
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
  onDayComplete?: (date: Date) => void
  onMonthChange?: (month: Date) => void
  selectedDate?: Date
  noteDates?: Set<string>
  notePopoverContent?: React.ReactNode
  notePopoverOpen?: boolean
  onNotePopoverOpenChange?: (open: boolean) => void
  headerExtra?: React.ReactNode
}

interface ShiftCalendarDayCellProps {
  date: Date
  shifts: CalendarEvent[]
  onShiftClick?: (shift: CalendarEvent) => void
  onShiftDelete?: (shift: CalendarEvent) => void
  onRotationBlockClick?: (block: RotationGroupCalendarEvent) => void
  onDayComplete?: (date: Date) => void
}

const SKELETON_PATTERN = [
  2, 0, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 0, 1, 2, 3, 0, 1, 0, 2, 1, 3, 0, 0, 2, 1, 0, 3, 1, 2, 0, 1, 2,
  0, 3, 1, 0, 2, 1, 0, 3, 2,
]
const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6']
const SKELETON_SLOT_IDS = ['a', 'b', 'c']

function ShiftCalendarDayCellSkeleton({ date, dayIndex }: { date: Date; dayIndex: number }) {
  const formattedDay = format(date, 'd')
  const barCount = SKELETON_PATTERN[dayIndex % SKELETON_PATTERN.length]

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="shrink-0 p-0.5">
        <div className="text-xs font-medium sm:text-sm">{formattedDay}</div>
      </div>
      {barCount > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-1 pt-0">
          {SKELETON_SLOT_IDS.slice(0, barCount).map((slotId, pos) => (
            <Skeleton
              key={`sk-${dayIndex}-${slotId}`}
              className={cn(
                'h-4 rounded',
                SKELETON_WIDTHS[(dayIndex + pos) % SKELETON_WIDTHS.length]
              )}
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
  onDayComplete,
}: ShiftCalendarDayCellProps) {
  const t = useTranslations('shifts')
  const dayShifts = shifts
  const formattedDay = format(date, 'd')

  if (dayShifts.length === 0)
    return (
      <div className="relative flex h-full w-full flex-col">
        <div className="shrink-0 p-0.5">
          <div className="text-xs font-medium sm:text-sm">{formattedDay}</div>
        </div>
      </div>
    )

  const now = new Date()
  const isPastDay = date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const hasScheduled = dayShifts.some(
    (s) => s.kind === 'individual' && s.status === 'SCHEDULED'
  )
  const showCompleteButton = onDayComplete && isPastDay && hasScheduled

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between p-0.5">
        <div className="text-xs font-medium sm:text-sm">{formattedDay}</div>
        {showCompleteButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex items-center rounded p-0.5 text-emerald-600 hover:bg-emerald-100 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  onDayComplete(date)
                }}
              >
                <CheckCircle2 className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {t('completion.completeDay')}
            </TooltipContent>
          </Tooltip>
        )}
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
                      className="flex min-w-0 flex-1 items-center gap-0.5 px-0.5 py-0.5 text-left text-[8px] leading-tight cursor-pointer hover:opacity-80 overflow-hidden sm:gap-1 sm:px-1 sm:py-1 sm:text-[10px]"
                      style={{ color: shift.color }}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRotationBlockClick?.(shift)
                      }}
                    >
                      <RefreshCw className="h-2.5 w-2.5 shrink-0" />
                      <span className="font-medium shrink-0">
                        {format(shift.startTime, 'HH:mm')}
                      </span>
                      <span className="truncate">
                        {t('calendar.rotationBlockPersons', { count: shift.personCount })}
                      </span>
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

          const isCompleted = shift.status === 'COMPLETED'

          return (
            <div
              key={shift.id}
              className="flex min-h-0 flex-1 items-stretch gap-0.5 overflow-hidden rounded"
              style={{
                backgroundColor: shift.color + (isCompleted ? '15' : isPast ? '30' : '20'),
                borderLeft: `3px ${isCompleted ? 'dashed' : 'solid'} ${shift.color}`,
                opacity: isCompleted ? 0.55 : opacity,
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
                    className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-0 px-0.5 py-0.5 text-left text-[8px] leading-tight cursor-pointer hover:opacity-80 overflow-hidden sm:px-1 sm:py-1 sm:text-[10px]"
                    style={{ color: shift.color }}
                    onClick={(event) => {
                      event.stopPropagation()
                      onShiftClick?.(shift)
                    }}
                  >
                    <span className="flex items-center gap-0.5 font-medium shrink-0">
                      {isCompleted && <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-600" />}
                      {format(shift.startTime, 'HH:mm')}
                    </span>
                    {shift.isExtra && (
                      <Star className="h-2.5 w-2.5 shrink-0 fill-amber-500 text-amber-500" />
                    )}
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
                  {shift.isExtra && <p className="font-medium text-amber-600">{t('extraBadge')}</p>}
                  {isCompleted && <p className="font-medium text-emerald-600">{t('status.completed')}</p>}
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
  onDayComplete,
  onMonthChange,
  selectedDate,
  noteDates,
  notePopoverContent,
  notePopoverOpen,
  onNotePopoverOpenChange,
  headerExtra,
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
        seen.set(shift.color, { color: shift.color, name: shift.shiftTypeName })

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
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                {formatMonthTitle(currentMonth)}
              </CardTitle>
              <div className="flex items-center gap-1 sm:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handlePreviousMonth}
                  aria-label={t('calendar.previousMonth')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleNextMonth}
                  aria-label={t('calendar.nextMonth')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerExtra}
              <div className="hidden sm:flex sm:items-center sm:gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  aria-label={t('calendar.previousMonth')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  aria-label={t('calendar.nextMonth')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full px-2 sm:px-6">
          <Popover open={notePopoverOpen} onOpenChange={onNotePopoverOpenChange}>
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
                        className="border-b p-0.5 text-center text-[0.65rem] font-normal text-muted-foreground sm:p-1 sm:text-[0.8rem]"
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
                        const isSelected = selectedDate != null && isSameDay(date, selectedDate)
                        const hasNote = noteDates?.has(dateKey)

                        const cellContent = (
                          <div className="h-full w-full overflow-hidden p-0.5">
                            {hasNote && (
                              <>
                                <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="sr-only">{t('legend.note')}</span>
                              </>
                            )}
                            {loading ? (
                              <ShiftCalendarDayCellSkeleton date={date} dayIndex={dayIndex} />
                            ) : (
                              <ShiftCalendarDayCell
                                date={date}
                                shifts={getEventsForDay(date)}
                                onShiftClick={onShiftClick}
                                onShiftDelete={onShiftDelete}
                                onRotationBlockClick={onRotationBlockClick}
                                onDayComplete={onDayComplete}
                              />
                            )}
                          </div>
                        )

                        return (
                          <td
                            key={dateKey}
                            className={cn(
                              'relative h-20 min-h-20 border-b border-r p-0 align-top last:border-r-0 cursor-pointer transition-colors duration-150 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] sm:h-24 sm:min-h-24 md:h-32 md:min-h-32',
                              !isCurrentMonth && 'text-muted-foreground/60',
                              isTodayCell && 'bg-primary/25 ring-2 ring-primary/50 ring-inset',
                              isHoliday && !isTodayCell && 'bg-calendar-holiday',
                              isWeekend && !isHoliday && !isTodayCell && 'bg-calendar-weekend',
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
                            {isSelected ? (
                              <PopoverAnchor asChild>{cellContent}</PopoverAnchor>
                            ) : (
                              cellContent
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PopoverContent
              side="bottom"
              align="center"
              className="w-[calc(100vw-2rem)] sm:w-80 sm:max-w-80"
              sideOffset={4}
            >
              {notePopoverContent}
            </PopoverContent>
          </Popover>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t pt-3 sm:mt-4 sm:gap-4 sm:pt-4">
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
                <div className="mx-1 h-3.5 w-px bg-border" aria-hidden />
              </>
            )}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 shrink-0 rounded bg-primary/50 ring-1 ring-primary/60" />
              <span className="text-muted-foreground">{t('legend.today')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 shrink-0 rounded bg-primary/15 ring-1 ring-primary/30" />
              <span className="text-muted-foreground">{t('legend.weekend')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 shrink-0 rounded bg-amber-400/35" />
              <span className="text-muted-foreground">{t('legend.holiday')}</span>
            </div>
            <div className="mx-1 h-3.5 w-px bg-border" aria-hidden />
            <div className="flex items-center gap-1.5 text-xs">
              <RefreshCw className="h-2.5 w-2.5 shrink-0 text-blue-500" />
              <span className="text-muted-foreground">{t('legend.rotation')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Star className="h-2.5 w-2.5 shrink-0 fill-amber-500 text-amber-500" />
              <span className="text-muted-foreground">{t('legend.extra')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-600" />
              <span className="text-muted-foreground">{t('legend.completed')}</span>
            </div>
            {noteDates && noteDates.size > 0 && (
              <>
                <div className="mx-1 h-3.5 w-px bg-border" aria-hidden />
                <div className="flex items-center gap-1.5 text-xs">
                  <StickyNote className="h-2.5 w-2.5 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">{t('legend.note')}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
