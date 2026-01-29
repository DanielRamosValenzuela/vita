'use client'

import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

import { Calendar } from '@/shared/ui/calendar'

interface CalendarEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  status: string
  userName: string
  areaName: string
  color: string
}

interface ShiftCalendarProps {
  shifts: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  onShiftClick?: (shift: CalendarEvent) => void
  selectedDate?: Date
}

export function ShiftCalendar({
  shifts,
  onDateSelect,
  onShiftClick,
  selectedDate,
}: ShiftCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Agrupar turnos por día
  const shiftsByDay = useMemo(() => {
    return shifts.reduce(
      (acc, shift) => {
        const dateKey = format(shift.startTime, 'yyyy-MM-dd')
        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        acc[dateKey].push(shift)
        return acc
      },
      {} as Record<string, CalendarEvent[]>
    )
  }, [shifts])

  // Obtener eventos para un día específico
  const getEventsForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return shiftsByDay[dateKey] || []
  }

  // Navegación de mes
  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Función para renderizar el contenido del día
  const renderDay = (day: Date) => {
    const dayShifts = getEventsForDay(day)
    const isSelected = selectedDate && isSameMonth(day, selectedDate) && isToday(day)

    return (
      <div className="relative h-full w-full">
        <div
          className={`text-sm p-1 h-full ${isSelected ? 'bg-primary text-primary-foreground rounded' : ''}`}
        >
          <div className="font-medium">{format(day, 'd')}</div>

          {/* Mostrar indicadores de turnos */}
          {dayShifts.length > 0 && (
            <div className="space-y-1 mt-1">
              {dayShifts.slice(0, 3).map((shift, index) => (
                <div
                  key={shift.id}
                  className="text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate"
                  style={{
                    backgroundColor: shift.color + '20',
                    borderLeft: `3px solid ${shift.color}`,
                    color: shift.color,
                  }}
                  onClick={() => onShiftClick?.(shift)}
                  title={`${shift.title} - ${shift.userName}`}
                >
                  {shift.userName.split(' ')[0]} {/* Solo el nombre */}
                </div>
              ))}

              {/* Indicador de más turnos */}
              {dayShifts.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{dayShifts.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </CardTitle>
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
          onMonthChange={setCurrentMonth}
          locale={es}
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
            cell: 'relative h-24 w-full p-0 text-center text-sm align-top [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l last:[&:has([aria-selected])]:rounded-r focus-within:relative focus-within:z-20',
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
                <div {...props} className="h-24 w-full p-0">
                  {renderDay(day.date)}
                </div>
              )
            },
          }}
        />

        {/* Leyenda de estados */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Programado</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>En progreso</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Completado</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Cancelado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
