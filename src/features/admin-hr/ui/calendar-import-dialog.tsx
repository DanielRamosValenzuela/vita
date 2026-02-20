'use client'

import { useCallback, useReducer, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { format, isSameDay } from 'date-fns'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import type { MappedHoliday } from '@/src/shared/lib/types/holidays'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Checkbox } from '@/src/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

import { importNationalHolidaysAction } from '../api/calendar-actions'
import { fetchNationalHolidays } from '../lib/holiday-service'

interface ImportDialogState {
  year: number
  holidays: MappedHoliday[]
  selected: Set<string>
  loadingHolidays: boolean
  loadError: boolean
}

type ImportDialogAction =
  | { type: 'SET_YEAR'; payload: number }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { holidays: MappedHoliday[]; selected: Set<string> } }
  | { type: 'LOAD_FAIL' }
  | { type: 'TOGGLE_HOLIDAY'; payload: string }
  | { type: 'SELECT_ALL'; payload: Set<string> }

const createInitialState = (currentYear: number): ImportDialogState => ({
  year: currentYear,
  holidays: [],
  selected: new Set(),
  loadingHolidays: false,
  loadError: false,
})

const importDialogReducer = (
  state: ImportDialogState,
  action: ImportDialogAction
): ImportDialogState => {
  switch (action.type) {
    case 'SET_YEAR':
      return { ...state, year: action.payload }
    case 'LOAD_START':
      return { ...state, loadingHolidays: true, loadError: false }
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loadingHolidays: false,
        holidays: action.payload.holidays,
        selected: action.payload.selected,
      }
    case 'LOAD_FAIL':
      return { ...state, loadingHolidays: false, loadError: true }
    case 'TOGGLE_HOLIDAY': {
      const next = new Set(state.selected)
      if (next.has(action.payload)) next.delete(action.payload)
      else next.add(action.payload)
      return { ...state, selected: next }
    }
    case 'SELECT_ALL':
      return { ...state, selected: action.payload }
    default:
      return state
  }
}

interface CalendarImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingDates: Date[]
  onImportComplete?: () => void
}

export function CalendarImportDialog({
  open,
  onOpenChange,
  existingDates,
  onImportComplete,
}: CalendarImportDialogProps) {
  const t = useTranslations('adminHR.calendar.import')
  const tCalendar = useTranslations('adminHR.calendar')
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [state, dispatch] = useReducer(importDialogReducer, currentYear, createInitialState)
  const [isPending, startTransition] = useTransition()

  const isAlreadyImported = useCallback(
    (dateStr: string) => {
      const [y, m, d] = dateStr.split('-').map(Number)
      const holidayDate = new Date(y, m - 1, d)
      return existingDates.some((ed) => isSameDay(new Date(ed), holidayDate))
    },
    [existingDates]
  )

  const loadHolidays = useCallback(
    async (selectedYear: number) => {
      dispatch({ type: 'LOAD_START' })
      try {
        const data = await fetchNationalHolidays(selectedYear)
        const initialSelected = new Set<string>()
        for (const h of data) if (!isAlreadyImported(h.date)) initialSelected.add(h.date)
        dispatch({ type: 'LOAD_SUCCESS', payload: { holidays: data, selected: initialSelected } })
      } catch {
        dispatch({ type: 'LOAD_FAIL' })
      }
    },
    [isAlreadyImported]
  )

  function handleYearChange(value: string) {
    const newYear = Number(value)
    dispatch({ type: 'SET_YEAR', payload: newYear })
    loadHolidays(newYear)
  }

  function handleDialogAutoFocus() {
    loadHolidays(state.year)
  }

  function handleToggle(date: string) {
    dispatch({ type: 'TOGGLE_HOLIDAY', payload: date })
  }

  function handleSelectAll() {
    const allAvailable = state.holidays.filter((h) => !isAlreadyImported(h.date)).map((h) => h.date)
    if (state.selected.size === allAvailable.length)
      dispatch({ type: 'SELECT_ALL', payload: new Set() })
    else dispatch({ type: 'SELECT_ALL', payload: new Set(allAvailable) })
  }

  function handleImport() {
    const selectedHolidays = state.holidays
      .filter((h) => state.selected.has(h.date))
      .map((h) => ({ date: h.date, title: h.title, inalienable: h.inalienable }))

    if (selectedHolidays.length === 0) return

    startTransition(async () => {
      const result = await importNationalHolidaysAction({
        year: state.year,
        selectedHolidays,
      })

      if (result.success && result.data) {
        const messages: string[] = []
        if (result.data.imported > 0)
          messages.push(t('successMessage', { count: result.data.imported }))

        if (result.data.skipped > 0)
          messages.push(t('skippedMessage', { skipped: result.data.skipped }))

        toast.success(messages.join(' — '))
        onOpenChange(false)
        onImportComplete?.()
        router.refresh()
      } else toast.error(result.error)
    })
  }

  const availableCount = state.holidays.filter((h) => !isAlreadyImported(h.date)).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onOpenAutoFocus={handleDialogAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium">{t('yearLabel')}</span>
          <Select value={String(state.year)} onValueChange={handleYearChange}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => currentYear - 1 + i).map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state.loadingHolidays && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" className="text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">{t('loadingHolidays')}</span>
          </div>
        )}

        {state.loadError && (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-destructive">{t('errorLoading')}</p>
            <Button variant="outline" size="sm" onClick={() => loadHolidays(state.year)}>
              {t('retry')}
            </Button>
          </div>
        )}

        {!state.loadingHolidays && !state.loadError && state.holidays.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">{t('noHolidays')}</p>
        )}

        {!state.loadingHolidays && !state.loadError && state.holidays.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {state.selected.size === availableCount ? t('deselectAll') : t('selectAll')}
              </Button>
            </div>

            <div className="border rounded-lg divide-y">
              {state.holidays.map((holiday) => {
                const imported = isAlreadyImported(holiday.date)
                const checked = state.selected.has(holiday.date)
                const [y, m, d] = holiday.date.split('-').map(Number)
                const dateObj = new Date(y, m - 1, d)

                return (
                  <label
                    key={holiday.date}
                    className={`flex items-center gap-3 px-4 py-3 ${imported ? 'opacity-50' : 'cursor-pointer hover:bg-muted/50'}`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleToggle(holiday.date)}
                      disabled={imported}
                    />
                    <span className="text-sm w-24 shrink-0">{format(dateObj, 'dd/MM/yyyy')}</span>
                    <span className="text-sm flex-1">{holiday.title}</span>
                    <Badge variant={holiday.inalienable ? 'destructive' : 'secondary'}>
                      {holiday.inalienable ? t('irrenunciable') : t('holiday')}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {tCalendar('multiplierBadge', { value: holiday.defaultMultiplier })}
                    </span>
                    {imported && (
                      <span className="text-xs text-muted-foreground">{t('alreadyImported')}</span>
                    )}
                  </label>
                )
              })}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {tCalendar('form.cancel')}
          </Button>
          <Button onClick={handleImport} disabled={isPending || state.selected.size === 0}>
            {isPending ? t('importing') : t('importButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
