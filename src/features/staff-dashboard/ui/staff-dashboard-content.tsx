'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'
import type { CalendarEvent } from '@/src/entities/shift/ui/shift-calendar'

import {
  deleteNoteAction,
  getNotesForMonthAction,
  upsertNoteAction,
} from '../api/calendar-note-actions'
import type { FilterOptions } from '../api/staff-filter-actions'
import { getMyShiftsAction, getUpcomingShiftsAction } from '../api/staff-shifts-actions'
import { CalendarExportMenu } from './calendar-export-menu'
import { CalendarFilters } from './calendar-filters'
import { NotePopoverContent } from './note-popover-content'
import { ShiftDetailPanel } from './shift-detail-panel'
import { StaffCalendar } from './staff-calendar'
import { UpcomingShifts } from './upcoming-shifts'

interface CalendarNoteData {
  id: string
  content: string
}

interface StaffDashboardContentProps {
  initialShifts: ShiftWithRelations[]
  initialUpcoming: ShiftWithRelations[]
  initialNotes?: Array<{ id: string; date: string; content: string }>
  organizationName?: string
  filterOptions?: FilterOptions
  currentUserId?: string
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return { startDate: start, endDate: end }
}

export function StaffDashboardContent({
  initialShifts,
  initialUpcoming,
  initialNotes,
  organizationName,
  filterOptions,
  currentUserId,
}: StaffDashboardContentProps) {
  const t = useTranslations('staffDashboard')
  const [shiftsState, setShiftsState] = useState({ data: initialShifts, prev: initialShifts })
  if (initialShifts !== shiftsState.prev)
    setShiftsState({ data: initialShifts, prev: initialShifts })

  const [upcomingState, setUpcomingState] = useState({
    data: initialUpcoming,
    prev: initialUpcoming,
  })
  if (initialUpcoming !== upcomingState.prev)
    setUpcomingState({ data: initialUpcoming, prev: initialUpcoming })

  const [isPending, startTransition] = useTransition()
  const [nav, setNav] = useState({
    viewingShiftId: null as string | null,
    monthDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    sectorId: null as string | null,
    areaId: null as string | null,
  })

  const shifts = shiftsState.data
  const upcoming = upcomingState.data
  const currentMonth = nav.monthDate.getMonth()
  const currentYear = nav.monthDate.getFullYear()
  const selectedAreaId = nav.areaId
  const selectedSectorId = nav.sectorId
  const panelOpen = nav.viewingShiftId !== null

  const [noteState, setNoteState] = useState<{
    notes: Map<string, CalendarNoteData>
    selectedDate: Date | null
    popoverOpen: boolean
  }>(() => {
    const map = new Map<string, CalendarNoteData>()
    if (initialNotes)
      for (const n of initialNotes) map.set(n.date, { id: n.id, content: n.content })
    return { notes: map, selectedDate: null, popoverOpen: false }
  })
  const [isSavingNote, startNoteTransition] = useTransition()

  const selectedDate = noteState.selectedDate
  const notePopoverOpen = noteState.popoverOpen
  const noteDates = useMemo(() => new Set(noteState.notes.keys()), [noteState.notes])

  const currentNote = useMemo(() => {
    if (!selectedDate) return null
    const key = format(selectedDate, 'yyyy-MM-dd')
    return noteState.notes.get(key) ?? null
  }, [selectedDate, noteState.notes])

  const fetchNotes = useCallback((month: number, year: number) => {
    startTransition(async () => {
      const result = await getNotesForMonthAction(month, year)
      if (result.success && result.data) {
        const map = new Map<string, CalendarNoteData>()
        for (const n of result.data.notes) map.set(n.date, { id: n.id, content: n.content })
        setNoteState((prev) => ({ ...prev, notes: map }))
      }
    })
  }, [])

  const resolveFilterParams = useCallback(
    (areaId: string | null, sectorId: string | null) => {
      if (areaId) return { areaId }
      if (sectorId && filterOptions) {
        const sector = filterOptions.sectors.find((s) => s.id === sectorId)
        if (sector?.areaIds.length) return { areaIds: sector.areaIds }
      }
      return {}
    },
    [filterOptions]
  )

  const fetchShifts = useCallback(
    (month: Date, areaId?: string | null, sectorId?: string | null) => {
      startTransition(async () => {
        const { startDate, endDate } = getMonthRange(month)
        const filterParams = resolveFilterParams(areaId ?? nav.areaId, sectorId ?? nav.sectorId)
        const result = await getMyShiftsAction({ startDate, endDate, ...filterParams })
        if (result.success && result.data)
          setShiftsState((prev) => ({ ...prev, data: result.data!.shifts }))
      })
    },
    [resolveFilterParams, nav.areaId, nav.sectorId]
  )

  const handleMonthChange = useCallback(
    (month: Date) => {
      setNav((prev) => ({ ...prev, monthDate: new Date(month.getFullYear(), month.getMonth(), 1) }))
      setNoteState((prev) => ({ ...prev, popoverOpen: false, selectedDate: null }))
      fetchShifts(month, nav.areaId, nav.sectorId)
      fetchNotes(month.getMonth(), month.getFullYear())
    },
    [fetchShifts, fetchNotes, nav.areaId, nav.sectorId]
  )

  const handleSectorChange = useCallback(
    (sectorId: string | null) => {
      setNav((prev) => ({ ...prev, sectorId, areaId: null }))
      fetchShifts(nav.monthDate, null, sectorId)
    },
    [nav.monthDate, fetchShifts]
  )

  const handleAreaChange = useCallback(
    (areaId: string | null) => {
      setNav((prev) => ({ ...prev, areaId }))
      fetchShifts(nav.monthDate, areaId, nav.sectorId)
    },
    [nav.monthDate, nav.sectorId, fetchShifts]
  )

  const handleDateSelect = useCallback((date: Date) => {
    setNoteState((prev) => {
      if (
        prev.selectedDate &&
        format(prev.selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
        return { ...prev, popoverOpen: !prev.popoverOpen }
      return { ...prev, selectedDate: date, popoverOpen: true }
    })
  }, [])

  const handleNoteSave = useCallback(
    (content: string) => {
      if (!selectedDate) return
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      startNoteTransition(async () => {
        const result = await upsertNoteAction(dateKey, content)
        if (result.success && result.data) {
          setNoteState((prev) => {
            const next = new Map(prev.notes)
            next.set(result.data!.note.date, {
              id: result.data!.note.id,
              content: result.data!.note.content,
            })
            return { ...prev, notes: next, popoverOpen: false }
          })
          toast.success(t('notes.saved'))
        } else toast.error(t('notes.error'))
      })
    },
    [selectedDate, t]
  )

  const handleNoteDelete = useCallback(
    (noteId: string) => {
      if (!selectedDate) return
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      startNoteTransition(async () => {
        const result = await deleteNoteAction(noteId)
        if (result.success) {
          setNoteState((prev) => {
            const next = new Map(prev.notes)
            next.delete(dateKey)
            return { ...prev, notes: next, popoverOpen: false }
          })
          toast.success(t('notes.deleted'))
        } else toast.error(t('notes.error'))
      })
    },
    [selectedDate, t]
  )

  const handleShiftClick = useCallback((event: CalendarEvent) => {
    if (event.kind === 'individual') setNav((prev) => ({ ...prev, viewingShiftId: event.id }))
    else if (event.kind === 'rotation-group')
      setNav((prev) => ({ ...prev, viewingShiftId: event.shiftIds?.[0] ?? event.id }))
  }, [])

  const handleUpcomingClick = useCallback((shiftId: string) => {
    setNav((prev) => ({ ...prev, viewingShiftId: shiftId }))
  }, [])

  const refreshUpcoming = useCallback(async () => {
    const result = await getUpcomingShiftsAction()
    if (result.success && result.data)
      setUpcomingState((prev) => ({ ...prev, data: result.data!.shifts }))
  }, [])

  useEffect(() => {
    if (!nav.viewingShiftId)
      startTransition(() => {
        void refreshUpcoming()
      })
  }, [nav.viewingShiftId, refreshUpcoming])

  const notePopoverContent = selectedDate ? (
    <NotePopoverContent
      date={selectedDate}
      existingNote={currentNote}
      onSave={handleNoteSave}
      onDelete={handleNoteDelete}
      isSaving={isSavingNote}
    />
  ) : null

  const headerExtra = filterOptions ? (
    <CalendarFilters
      areas={filterOptions.areas}
      sectors={filterOptions.sectors}
      selectedAreaId={selectedAreaId}
      selectedSectorId={selectedSectorId}
      onAreaChange={handleAreaChange}
      onSectorChange={handleSectorChange}
    />
  ) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">{t('title')}</h1>
            {organizationName && (
              <Badge variant="outline" className="text-muted-foreground">
                <Building2 />
                {organizationName}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t('description')}</p>
        </div>
        <CalendarExportMenu currentMonth={currentMonth} currentYear={currentYear} />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <StaffCalendar
            shifts={shifts}
            loading={isPending}
            onShiftClick={handleShiftClick}
            onMonthChange={handleMonthChange}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate ?? undefined}
            noteDates={noteDates}
            notePopoverContent={notePopoverContent}
            notePopoverOpen={notePopoverOpen}
            onNotePopoverOpenChange={(open) =>
              setNoteState((prev) => ({ ...prev, popoverOpen: open }))
            }
            headerExtra={headerExtra}
          />
        </div>
        <div className="lg:col-span-4">
          <UpcomingShifts shifts={upcoming} onShiftClick={handleUpcomingClick} />
        </div>
      </div>
      <ShiftDetailPanel
        shiftId={nav.viewingShiftId}
        open={panelOpen}
        onOpenChange={(open) => {
          if (!open) setNav((prev) => ({ ...prev, viewingShiftId: null }))
        }}
        currentUserId={currentUserId}
      />
    </div>
  )
}
