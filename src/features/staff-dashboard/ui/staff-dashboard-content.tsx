'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'

import type { ShiftWithRelations } from '@/src/entities/shift/types/shift-types'
import type { CalendarEvent } from '@/src/entities/shift/ui/shift-calendar'

import { Badge } from '@/src/shared/ui/badge'

import type { FilterOptions } from '../api/staff-filter-actions'
import { deleteNoteAction, getNotesForMonthAction, upsertNoteAction } from '../api/calendar-note-actions'
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
  const [shifts, setShifts] = useState<ShiftWithRelations[]>(initialShifts)
  const [upcoming, setUpcoming] = useState<ShiftWithRelations[]>(initialUpcoming)
  const [isPending, startTransition] = useTransition()
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  const [notes, setNotes] = useState<Map<string, CalendarNoteData>>(() => {
    const map = new Map<string, CalendarNoteData>()
    if (initialNotes)
      for (const n of initialNotes)
        map.set(n.date, { id: n.id, content: n.content })
    return map
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [notePopoverOpen, setNotePopoverOpen] = useState(false)
  const [isSavingNote, startNoteTransition] = useTransition()

  const noteDates = useMemo(() => new Set(notes.keys()), [notes])

  const currentNote = useMemo(() => {
    if (!selectedDate) return null
    const key = format(selectedDate, 'yyyy-MM-dd')
    return notes.get(key) ?? null
  }, [selectedDate, notes])

  const fetchNotes = useCallback((month: number, year: number) => {
    startTransition(async () => {
      const result = await getNotesForMonthAction(month, year)
      if (result.success && result.data) {
        const map = new Map<string, CalendarNoteData>()
        for (const n of result.data.notes)
          map.set(n.date, { id: n.id, content: n.content })
        setNotes(map)
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
        const filterParams = resolveFilterParams(
          areaId ?? selectedAreaId,
          sectorId ?? selectedSectorId
        )
        const result = await getMyShiftsAction({ startDate, endDate, ...filterParams })
        if (result.success && result.data)
          setShifts(result.data.shifts)
      })
    },
    [resolveFilterParams, selectedAreaId, selectedSectorId]
  )

  const handleMonthChange = useCallback(
    (month: Date) => {
      setCurrentMonth(month.getMonth())
      setCurrentYear(month.getFullYear())
      setNotePopoverOpen(false)
      setSelectedDate(null)
      fetchShifts(month, selectedAreaId, selectedSectorId)
      fetchNotes(month.getMonth(), month.getFullYear())
    },
    [fetchShifts, fetchNotes, selectedAreaId, selectedSectorId]
  )

  const handleSectorChange = useCallback(
    (sectorId: string | null) => {
      setSelectedSectorId(sectorId)
      setSelectedAreaId(null)
      const month = new Date(currentYear, currentMonth, 1)
      fetchShifts(month, null, sectorId)
    },
    [currentMonth, currentYear, fetchShifts]
  )

  const handleAreaChange = useCallback(
    (areaId: string | null) => {
      setSelectedAreaId(areaId)
      const month = new Date(currentYear, currentMonth, 1)
      fetchShifts(month, areaId, selectedSectorId)
    },
    [currentMonth, currentYear, selectedSectorId, fetchShifts]
  )

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        setNotePopoverOpen((prev) => !prev)
      else {
        setSelectedDate(date)
        setNotePopoverOpen(true)
      }
    },
    [selectedDate]
  )

  const handleNoteSave = useCallback(
    (content: string) => {
      if (!selectedDate) return
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      startNoteTransition(async () => {
        const result = await upsertNoteAction(dateKey, content)
        if (result.success && result.data) {
          setNotes((prev) => {
            const next = new Map(prev)
            next.set(result.data!.note.date, {
              id: result.data!.note.id,
              content: result.data!.note.content,
            })
            return next
          })
          setNotePopoverOpen(false)
          toast.success(t('notes.saved'))
        } else
          toast.error(t('notes.error'))
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
          setNotes((prev) => {
            const next = new Map(prev)
            next.delete(dateKey)
            return next
          })
          setNotePopoverOpen(false)
          toast.success(t('notes.deleted'))
        } else
          toast.error(t('notes.error'))
      })
    },
    [selectedDate, t]
  )

  const handleShiftClick = useCallback((event: CalendarEvent) => {
    if (event.kind === 'individual') {
      setSelectedShiftId(event.id)
      setPanelOpen(true)
    } else if (event.kind === 'rotation-group') {
      const firstShiftId = event.shiftIds?.[0] ?? event.id
      setSelectedShiftId(firstShiftId)
      setPanelOpen(true)
    }
  }, [])

  const handleUpcomingClick = useCallback((shiftId: string) => {
    setSelectedShiftId(shiftId)
    setPanelOpen(true)
  }, [])

  const refreshUpcoming = useCallback(async () => {
    const result = await getUpcomingShiftsAction()
    if (result.success && result.data)
      setUpcoming(result.data.shifts)
  }, [])

  useEffect(() => {
    if (!panelOpen)
      refreshUpcoming()
  }, [panelOpen, refreshUpcoming])

  const notePopoverContent = selectedDate
    ? (
      <NotePopoverContent
        date={selectedDate}
        existingNote={currentNote}
        onSave={handleNoteSave}
        onDelete={handleNoteDelete}
        isSaving={isSavingNote}
      />
    )
    : null

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
        <CalendarExportMenu
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
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
            onNotePopoverOpenChange={setNotePopoverOpen}
            headerExtra={headerExtra}
          />
        </div>
        <div className="lg:col-span-4">
          <UpcomingShifts
            shifts={upcoming}
            onShiftClick={handleUpcomingClick}
          />
        </div>
      </div>
      <ShiftDetailPanel
        shiftId={selectedShiftId}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        currentUserId={currentUserId}
      />
    </div>
  )
}
