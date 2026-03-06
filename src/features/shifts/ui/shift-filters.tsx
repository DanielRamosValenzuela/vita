'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ShiftStatus } from '@prisma/client'
import { endOfDay, startOfDay } from 'date-fns'
import { Calendar as CalendarIcon, Clock, Filter, Users, X } from 'lucide-react'

import { SHIFT_STATUS } from '@/src/shared/lib/constants'
import { formatDateLong, formatDateShort } from '@/src/shared/lib/utils/format'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Calendar as DatePicker } from '@/src/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

const FILTER_ALL = '__all__'
const FILTER_CUSTOM = '__custom__'

interface FilterState {
  search: string
  status: ShiftStatus | ''
  userId: string
  areaId: string
  shiftTypeId: string
  startDate?: Date
  endDate?: Date
}

interface ShiftFiltersProps {
  users: Array<{ id: string; name: string; role: string }>
  areas: Array<{ id: string; name: string }>
  shiftTypes: Array<{ id: string; name: string; color: string }>
  selectedAreaId?: string | null
  onFiltersChange?: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

const EMPTY_INITIAL_FILTERS: Partial<FilterState> = {}

const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case SHIFT_STATUS.SCHEDULED:
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case SHIFT_STATUS.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case SHIFT_STATUS.COMPLETED:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    case SHIFT_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800 hover:bg-red-200'
    case SHIFT_STATUS.NO_SHOW:
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

interface StatusSelectItemProps {
  status: ShiftStatus
  label: string
}

function StatusSelectItem({ status, label }: StatusSelectItemProps) {
  return (
    <SelectItem value={status}>
      <Badge className={`mr-2 ${getStatusColor(status)}`}>{label}</Badge>
    </SelectItem>
  )
}

interface ActiveFiltersBadgesProps {
  filters: FilterState
  users: Array<{ id: string; name: string; role: string }>
  areas: Array<{ id: string; name: string }>
  shiftTypes: Array<{ id: string; name: string; color: string }>
  selectedAreaId?: string | null
  locale: 'es' | 'en'
  getStatusColor: (status: ShiftStatus) => string
  getStatusLabel: (status: ShiftStatus) => string
}

function ActiveFiltersBadges({
  filters,
  users,
  areas,
  shiftTypes,
  selectedAreaId,
  locale,
  getStatusColor,
  getStatusLabel,
}: ActiveFiltersBadgesProps) {
  const t = useTranslations('shifts.filters')

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
      <span className="text-sm text-muted-foreground">{t('activeFilters')}:</span>

      {filters.status && (
        <Badge className={`gap-1 ${getStatusColor(filters.status as ShiftStatus)}`}>
          {getStatusLabel(filters.status as ShiftStatus)}
        </Badge>
      )}

      {filters.userId && (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {users.find((u) => u.id === filters.userId)?.name}
        </Badge>
      )}

      {filters.areaId && !selectedAreaId && (
        <Badge variant="secondary" className="gap-1">
          <Filter className="h-3 w-3" />
          {areas.find((a) => a.id === filters.areaId)?.name}
        </Badge>
      )}

      {filters.shiftTypeId && (
        <Badge variant="secondary" className="gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: shiftTypes.find((st) => st.id === filters.shiftTypeId)?.color,
            }}
          />
          {shiftTypes.find((st) => st.id === filters.shiftTypeId)?.name}
        </Badge>
      )}

      {(filters.startDate || filters.endDate) && (
        <Badge variant="secondary" className="gap-1">
          <CalendarIcon className="h-3 w-3" />
          {filters.startDate && formatDateShort(filters.startDate, locale)}
          {filters.startDate && filters.endDate && ' - '}
          {filters.endDate && formatDateShort(filters.endDate, locale)}
        </Badge>
      )}
    </div>
  )
}

interface DateRangeFiltersProps {
  filters: FilterState
  quickRange: '' | 'today' | 'week' | 'month'
  locale: 'es' | 'en'
  updateFilters: (newFilters: Partial<FilterState>) => void
  setQuickRange: (range: '' | 'today' | 'week' | 'month') => void
  t: ReturnType<typeof useTranslations<'shifts.filters'>>
}

function DateRangeFilters({
  filters,
  quickRange,
  locale,
  updateFilters,
  setQuickRange,
  t,
}: DateRangeFiltersProps) {
  return (
    <div className="col-span-2 grid grid-cols-1 gap-4 border-t border-border/60 pt-4 lg:col-span-4 lg:grid-cols-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('startDatePlaceholder')}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 w-full justify-start bg-background text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {filters.startDate
                  ? formatDateLong(filters.startDate, locale)
                  : t('startDatePlaceholder')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => date && updateFilters({ startDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('endDatePlaceholder')}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 w-full justify-start bg-background text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {filters.endDate
                  ? formatDateLong(filters.endDate, locale)
                  : t('endDatePlaceholder')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => date && updateFilters({ endDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('quickDatePlaceholder')}
        </label>
        <Select
          value={quickRange || FILTER_CUSTOM}
          onValueChange={(value) => {
            const now = new Date()
            let startDate: Date | undefined
            let endDate: Date | undefined
            let range: '' | 'today' | 'week' | 'month' = ''

            if (value === FILTER_CUSTOM) {
              setQuickRange('')
              updateFilters({ startDate: undefined, endDate: undefined })
              return
            }

            switch (value) {
              case 'today':
                startDate = startOfDay(now)
                endDate = endOfDay(now)
                range = 'today'
                break
              case 'week':
                startDate = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate() - now.getDay()
                )
                endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
                range = 'week'
                break
              case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                range = 'month'
                break
              default:
                startDate = undefined
                endDate = undefined
            }

            setQuickRange(range)
            updateFilters({ startDate, endDate })
          }}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder={t('quickDatePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_CUSTOM}>{t('customDates')}</SelectItem>
            <SelectItem value="today">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('today')}
              </div>
            </SelectItem>
            <SelectItem value="week">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('thisWeek')}
              </div>
            </SelectItem>
            <SelectItem value="month">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('thisMonth')}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function ShiftFilters({
  users,
  areas,
  shiftTypes,
  selectedAreaId,
  onFiltersChange,
  initialFilters = EMPTY_INITIAL_FILTERS,
}: ShiftFiltersProps) {
  const t = useTranslations('shifts.filters')
  const locale = useLocale() as 'es' | 'en'
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    userId: '',
    areaId: '',
    shiftTypeId: '',
    ...initialFilters,
  })
  const [quickRange, setQuickRange] = useState<'' | 'today' | 'week' | 'month'>('')

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status ||
      filters.userId ||
      filters.shiftTypeId ||
      filters.startDate ||
      filters.endDate ||
      (filters.areaId && !selectedAreaId)
    )
  }, [filters, selectedAreaId])

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    setQuickRange('')
    const clearedFilters: FilterState = {
      search: '',
      status: '',
      userId: '',
      areaId: '',
      shiftTypeId: '',
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const showAreaFilter = !selectedAreaId

  const getStatusLabel = (status: ShiftStatus) => {
    switch (status) {
      case SHIFT_STATUS.SCHEDULED:
        return t('status.scheduled')
      case SHIFT_STATUS.IN_PROGRESS:
        return t('status.inProgress')
      case SHIFT_STATUS.COMPLETED:
        return t('status.completed')
      case SHIFT_STATUS.CANCELLED:
        return t('status.cancelled')
      case SHIFT_STATUS.NO_SHOW:
        return t('status.noShow')
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t('title')}</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            {t('clear')}
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('statusPlaceholder')}
            </label>
            <Select
              value={filters.status || FILTER_ALL}
              onValueChange={(value) =>
                updateFilters({ status: value === FILTER_ALL ? '' : (value as ShiftStatus) })
              }
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>{t('allStatuses')}</SelectItem>
                <StatusSelectItem status={SHIFT_STATUS.SCHEDULED} label={t('status.scheduled')} />
                <StatusSelectItem
                  status={SHIFT_STATUS.IN_PROGRESS}
                  label={t('status.inProgress')}
                />
                <StatusSelectItem status={SHIFT_STATUS.COMPLETED} label={t('status.completed')} />
                <StatusSelectItem status={SHIFT_STATUS.CANCELLED} label={t('status.cancelled')} />
                <StatusSelectItem status={SHIFT_STATUS.NO_SHOW} label={t('status.noShow')} />
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('userPlaceholder')}
            </label>
            <Select
              value={filters.userId || FILTER_ALL}
              onValueChange={(value) =>
                updateFilters({ userId: value === FILTER_ALL ? '' : value })
              }
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={t('allUsers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>{t('allUsers')}</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showAreaFilter ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('areaPlaceholder')}
              </label>
              <Select
                value={filters.areaId || FILTER_ALL}
                onValueChange={(value) =>
                  updateFilters({ areaId: value === FILTER_ALL ? '' : value })
                }
              >
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder={t('allAreas')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>{t('allAreas')}</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div aria-hidden className="hidden lg:block" />
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('shiftTypePlaceholder')}
            </label>
            <Select
              value={filters.shiftTypeId || FILTER_ALL}
              onValueChange={(value) =>
                updateFilters({ shiftTypeId: value === FILTER_ALL ? '' : value })
              }
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={t('allShiftTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>{t('allShiftTypes')}</SelectItem>
                {shiftTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DateRangeFilters
            filters={filters}
            quickRange={quickRange}
            locale={locale}
            updateFilters={updateFilters}
            setQuickRange={setQuickRange}
            t={t}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <ActiveFiltersBadges
          filters={filters}
          users={users}
          areas={areas}
          shiftTypes={shiftTypes}
          selectedAreaId={selectedAreaId}
          locale={locale}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      )}
    </div>
  )
}
