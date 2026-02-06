'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'
import type { Country } from '@prisma/client'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/shared/ui/tooltip'
import { getDayTypeColor, DAY_TYPES, getLocaleByCountry } from '@/src/shared/lib/constants'

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
  canEdit?: boolean
  initialDate?: Date
}

export function OrganizationCalendarView({
  calendarDays,
  country,
  onDayClick,
  canEdit = false,
  initialDate,
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

  function handlePreviousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  function handleNextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  function handleDayClick(date: Date) {
    if (canEdit && onDayClick)
      onDayClick(date)
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
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
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
                        <p className="font-medium">{calendarDay.name || t(`dayTypes.${calendarDay.type}`)}</p>
                        {calendarDay.description && (
                          <p className="text-xs text-muted-foreground">{calendarDay.description}</p>
                        )}
                        {calendarDay.multiplier !== 1.0 && (
                          <p className="text-xs">
                            {t('multiplier')}: {t('multiplierBadge', { value: calendarDay.multiplier })}
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
