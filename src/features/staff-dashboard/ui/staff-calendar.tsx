'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar } from 'lucide-react'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'
import { groupShiftsForCalendar } from '@/src/entities/shift/lib/calendar-grouping'
import type { CalendarEvent } from '@/src/entities/shift/ui/shift-calendar'
import { ShiftCalendar } from '@/src/entities/shift/ui/shift-calendar'

interface StaffCalendarProps {
  shifts: ShiftWithRelations[]
  loading?: boolean
  onShiftClick?: (shift: CalendarEvent) => void
  onMonthChange?: (month: Date) => void
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
  noteDates?: Set<string>
  notePopoverContent?: ReactNode
  notePopoverOpen?: boolean
  onNotePopoverOpenChange?: (open: boolean) => void
  headerExtra?: ReactNode
}

export function StaffCalendar({
  shifts,
  loading,
  onShiftClick,
  onMonthChange,
  onDateSelect,
  selectedDate,
  noteDates,
  notePopoverContent,
  notePopoverOpen,
  onNotePopoverOpenChange,
  headerExtra,
}: StaffCalendarProps) {
  const t = useTranslations('staffDashboard')

  const events = useMemo(
    () => groupShiftsForCalendar(shifts, t('shiftDetail.shiftType')),
    [shifts, t]
  )

  return (
    <div className="flex flex-col items-center">
      <ShiftCalendar
        shifts={events}
        loading={loading}
        onShiftClick={onShiftClick}
        onMonthChange={onMonthChange}
        onDateSelect={onDateSelect}
        selectedDate={selectedDate}
        noteDates={noteDates}
        notePopoverContent={notePopoverContent}
        notePopoverOpen={notePopoverOpen}
        onNotePopoverOpenChange={onNotePopoverOpenChange}
        headerExtra={headerExtra}
      />
      {!loading && shifts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {t('emptyState')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('emptyStateDescription')}
          </p>
        </div>
      )}
    </div>
  )
}
