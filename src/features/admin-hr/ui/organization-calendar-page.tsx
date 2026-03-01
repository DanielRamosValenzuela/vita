'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Country } from '@prisma/client'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { OrganizationCalendarView } from '@/src/widgets/calendar-view'

import { getOrganizationCalendarAction, type OrganizationCalendarDay } from '../api'
import { CalendarDayForm } from './calendar-day-form'
import { CalendarImportDialog } from './calendar-import-dialog'

interface OrganizationCalendarPageProps {
  calendarDays: OrganizationCalendarDay[]
  country: Country
}

export function OrganizationCalendarPage({
  calendarDays: initialDays,
  country,
}: OrganizationCalendarPageProps) {
  const t = useTranslations('adminHR.calendar')
  const [calendarDays, setCalendarDays] = useState<OrganizationCalendarDay[]>(initialDays)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isLoading, startTransition] = useTransition()

  const existingDates = useMemo(() => calendarDays.map((d) => new Date(d.date)), [calendarDays])

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setEditDialogOpen(true)
  }

  function handleMonthChange(year: number, month: number) {
    startTransition(async () => {
      const result = await getOrganizationCalendarAction(year, month)
      if (result.success && result.data) setCalendarDays(result.data)
      else toast.error(result.error ?? t('errorLoading'))
    })
  }

  const existingDay = selectedDate
    ? calendarDays.find((day) => {
        const dayDate = new Date(day.date)
        return (
          dayDate.getDate() === selectedDate.getDate() &&
          dayDate.getMonth() === selectedDate.getMonth() &&
          dayDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    : undefined

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
          <Download className="mr-2 h-4 w-4" />
          {t('import.button')}
        </Button>
      </div>

      <OrganizationCalendarView
        calendarDays={calendarDays}
        country={country}
        onDayClick={handleDayClick}
        onMonthChange={handleMonthChange}
        isLoading={isLoading}
        canEdit
      />

      <CalendarDayForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedDate={selectedDate}
        existingDay={existingDay}
        country={country}
      />

      <CalendarImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        existingDates={existingDates}
      />
    </>
  )
}
