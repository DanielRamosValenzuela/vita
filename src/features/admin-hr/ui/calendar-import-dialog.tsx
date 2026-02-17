'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { format, isSameDay } from 'date-fns'
import { toast } from 'sonner'

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
import type { MappedHoliday } from '@/src/shared/lib/types/holidays'

import { importNationalHolidaysAction } from '../api/calendar-actions'
import { fetchNationalHolidays } from '../lib/holiday-service'

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

  const [year, setYear] = useState(currentYear)
  const [holidays, setHolidays] = useState<MappedHoliday[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingHolidays, setLoadingHolidays] = useState(false)
  const [loadError, setLoadError] = useState(false)
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
      setLoadingHolidays(true)
      setLoadError(false)
      try {
        const data = await fetchNationalHolidays(selectedYear)
        setHolidays(data)
        const initialSelected = new Set<string>()
        for (const h of data) 
          if (!isAlreadyImported(h.date)) 
            initialSelected.add(h.date)
          
        
        setSelected(initialSelected)
      } catch {
        setLoadError(true)
      } finally {
        setLoadingHolidays(false)
      }
    },
    [isAlreadyImported]
  )

  useEffect(() => {
    if (open) 
      loadHolidays(year)
    
  }, [open, year, loadHolidays])

  function handleToggle(date: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(date)) 
        next.delete(date)
       else 
        next.add(date)
      
      return next
    })
  }

  function handleSelectAll() {
    const allAvailable = holidays.filter((h) => !isAlreadyImported(h.date)).map((h) => h.date)
    if (selected.size === allAvailable.length) 
      setSelected(new Set())
     else 
      setSelected(new Set(allAvailable))
    
  }

  function handleImport() {
    const selectedHolidays = holidays
      .filter((h) => selected.has(h.date))
      .map((h) => ({ date: h.date, title: h.title, inalienable: h.inalienable }))

    if (selectedHolidays.length === 0) return

    startTransition(async () => {
      const result = await importNationalHolidaysAction({
        year,
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
      } else 
        toast.error(result.error)
      
    })
  }

  const availableCount = holidays.filter((h) => !isAlreadyImported(h.date)).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium">{t('yearLabel')}</span>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
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

        {loadingHolidays && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">{t('loadingHolidays')}</span>
          </div>
        )}

        {loadError && (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-destructive">{t('errorLoading')}</p>
            <Button variant="outline" size="sm" onClick={() => loadHolidays(year)}>
              {t('retry')}
            </Button>
          </div>
        )}

        {!loadingHolidays && !loadError && holidays.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">{t('noHolidays')}</p>
        )}

        {!loadingHolidays && !loadError && holidays.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selected.size === availableCount ? t('deselectAll') : t('selectAll')}
              </Button>
            </div>

            <div className="border rounded-lg divide-y">
              {holidays.map((holiday) => {
                const imported = isAlreadyImported(holiday.date)
                const checked = selected.has(holiday.date)
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
                    <span className="text-sm w-24 shrink-0">
                      {format(dateObj, 'dd/MM/yyyy')}
                    </span>
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
          <Button onClick={handleImport} disabled={isPending || selected.size === 0}>
            {isPending ? t('importing') : t('importButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
