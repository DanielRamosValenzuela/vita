'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Country } from '@prisma/client'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { DAY_TYPES, getDayTypeColor, getLocaleByCountry } from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

interface CalendarDay {
  id: string
  date: Date
  type: string
  name: string | null
  description: string | null
  multiplier: number
}

interface OrganizationCalendarViewProps {
  calendarDays: CalendarDay[]
  country: Country
  onDayClick?: (date: Date) => void
  onMonthChange?: (year: number, month: number) => void
  canEdit?: boolean
  initialDate?: Date
  isLoading?: boolean
}

export function OrganizationCalendarView({
  calendarDays,
  country,
  onDayClick,
  onMonthChange,
  canEdit = false,
  initialDate,
  isLoading = false,
}: OrganizationCalendarViewProps) {
  const t = useTranslations('adminHR.calendar')
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())

  const dateLocale = getLocaleByCountry(country)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const calendarMap = new Map<string, CalendarDay>()
  calendarDays.forEach((day) => {
    const key = format(new Date(day.date), 'yyyy-MM-dd')
    calendarMap.set(key, day)
  })

  const summary = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const day of calendarDays)
      if (day.type !== DAY_TYPES.NORMAL) counts[day.type] = (counts[day.type] || 0) + 1

    return counts
  }, [calendarDays])

  function handlePreviousMonth() {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setCurrentDate(prev)
    onMonthChange?.(prev.getFullYear(), prev.getMonth() + 1)
  }

  function handleNextMonth() {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setCurrentDate(next)
    onMonthChange?.(next.getFullYear(), next.getMonth() + 1)
  }

  function handleDayClick(date: Date) {
    if (canEdit && onDayClick) onDayClick(date)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              {t('previousMonth')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              {t('nextMonth')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {t(`weekdays.${day}`)}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((date) => {
            const key = format(date, 'yyyy-MM-dd')
            const calendarDay = calendarMap.get(key)
            const isToday = isSameDay(date, new Date())
            const dayType = calendarDay?.type || DAY_TYPES.NORMAL

            return (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleDayClick(date)}
                      disabled={!canEdit}
                      className={`
                        relative p-2 rounded-lg text-center transition-all
                        ${canEdit ? 'hover:ring-2 hover:ring-primary cursor-pointer' : 'cursor-default'}
                        ${getDayTypeColor(dayType as never)}
                        ${isToday ? 'ring-2 ring-primary' : ''}
                        ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">{format(date, 'd')}</div>
                      {calendarDay && calendarDay.type !== DAY_TYPES.NORMAL && (
                        <div className="absolute top-1 right-1">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                      {calendarDay && calendarDay.multiplier !== 1.0 && (
                        <div className="text-xs font-semibold text-primary mt-1">
                          {t('multiplierBadge', { value: calendarDay.multiplier })}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {calendarDay && (
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {calendarDay.name || t(`dayTypes.${calendarDay.type}`)}
                        </p>
                        {calendarDay.description && (
                          <p className="text-xs text-muted-foreground">{calendarDay.description}</p>
                        )}
                        {calendarDay.multiplier !== 1.0 && (
                          <p className="text-xs">
                            {t('multiplier')}:{' '}
                            {t('multiplierBadge', { value: calendarDay.multiplier })}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(summary).length > 0 ? (
            Object.entries(summary).map(([type, count]) => (
              <Badge key={type} variant="secondary">
                {t('summary.total', { count })} {t(`dayTypes.${type}`)}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t('summary.noSpecialDays')}</p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium mb-3">{t('legend')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-background border" />
              <span className="text-xs">{t('dayTypes.NORMAL')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-50 dark:bg-blue-950/30 border" />
              <span className="text-xs">{t('dayTypes.WEEKEND')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-50 dark:bg-green-950/30 border" />
              <span className="text-xs">{t('dayTypes.HOLIDAY')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-50 dark:bg-red-950/30 border" />
              <span className="text-xs">{t('dayTypes.IRRENUNCIABLE')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-purple-50 dark:bg-purple-950/30 border" />
              <span className="text-xs">{t('dayTypes.ORGANIZATION_HOLIDAY')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-50 dark:bg-yellow-950/30 border" />
              <span className="text-xs">{t('dayTypes.CUSTOM')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
