'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { addMonths, format, subMonths } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Calendar } from '@/src/shared/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

interface CalendarEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  status: string
  userName: string
  areaName: string
  color: string
  icon?: string
}

interface ShiftCalendarProps {
  shifts: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  onShiftClick?: (shift: CalendarEvent) => void
  onMonthChange?: (month: Date) => void
  selectedDate?: Date
}

export function ShiftCalendar({
  shifts,
  onDateSelect,
  onShiftClick,
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

  const renderDay = (day: Date) => {
    const dayShifts = getEventsForDay(day)

    return (
      <div className="relative h-full w-full">
        <div className="text-sm p-1 h-full">
          <div className="font-medium">{format(day, 'd')}</div>

          {dayShifts.length > 0 && (
            <div className="space-y-0.5 mt-0.5">
              {dayShifts.slice(0, 3).map((shift) => {
                const now = new Date()
                const isPast = new Date(shift.endTime) < now
                const opacity = isPast ? 0.45 : 1
                return (
                  <Tooltip key={shift.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="text-[10px] leading-tight px-1 py-0.5 rounded cursor-pointer hover:opacity-80 truncate flex items-center gap-0.5"
                        style={{
                          backgroundColor: shift.color + (isPast ? '30' : '20'),
                          borderLeft: `3px solid ${shift.color}`,
                          color: shift.color,
                          opacity,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onShiftClick?.(shift)
                        }}
                      >
                        <span className="font-medium shrink-0">
                          {format(shift.startTime, 'HH:mm')}
                        </span>
                        <span className="truncate">{shift.userName.split(' ')[0]}</span>
                      </div>
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
                )
              })}

              {dayShifts.length > 3 && (
                <div className="text-[10px] text-muted-foreground text-center">
                  +{dayShifts.length - 3} {t('more')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
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
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect?.(date)}
            month={currentMonth}
            onMonthChange={(month) => {
              setCurrentMonth(month)
              onMonthChange?.(month)
            }}
            locale={dateLocale}
            className="rounded-md border"
            required={false}
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'text-sm font-medium',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: 'relative h-28 w-full p-0 text-center text-sm align-top [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l last:[&:has([aria-selected])]:rounded-r focus-within:relative focus-within:z-20',
              day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
              day_range_end: 'day-range-end',
              day_selected: 'bg-primary text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-muted-foreground opacity-50',
              day_disabled: 'text-muted-foreground opacity-50',
              day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
            }}
            components={{
              Day: ({ day, ...props }) => {
                return (
                  <td {...props}>
                    <div className="h-28 w-full p-0">{renderDay(day.date)}</div>
                  </td>
                )
              },
            }}
          />

          {uniqueShiftTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {uniqueShiftTypes.map((st) => (
                <div key={st.color} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="text-muted-foreground">{st.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
