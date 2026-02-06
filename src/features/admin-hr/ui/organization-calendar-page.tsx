'use client'

import { useState } from 'react'
import type { Country } from '@prisma/client'

import { OrganizationCalendarView } from '@/src/widgets/calendar-view'
import type { OrganizationCalendarDay } from '../api'
import { CalendarDayForm } from './calendar-day-form'

interface OrganizationCalendarPageProps {
  calendarDays: OrganizationCalendarDay[]
  country: Country
}

export function OrganizationCalendarPage({ calendarDays, country }: OrganizationCalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setEditDialogOpen(true)
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
      <OrganizationCalendarView
        calendarDays={calendarDays}
        country={country}
        onDayClick={handleDayClick}
        canEdit
      />

      <CalendarDayForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedDate={selectedDate}
        existingDay={existingDay}
        country={country}
      />
    </>
  )
}
