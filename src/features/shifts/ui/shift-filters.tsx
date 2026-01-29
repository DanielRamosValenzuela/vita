'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ShiftStatus } from '@prisma/client'
import { endOfDay, format, isWithinInterval, startOfDay } from 'date-fns'
import { Calendar, Clock, Filter, Search, Users, X } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

import { ShiftCalendar } from './shift-calendar'

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
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

export function ShiftFilters({
  users,
  areas,
  shiftTypes,
  onFiltersChange,
  initialFilters = {},
}: ShiftFiltersProps) {
  const t = useTranslations('shifts.filters')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    userId: '',
    areaId: '',
    shiftTypeId: '',
    ...initialFilters,
  })

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.status ||
      filters.userId ||
      filters.areaId ||
      filters.shiftTypeId ||
      filters.startDate ||
      filters.endDate
    )
  }, [filters])

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      status: '',
      userId: '',
      areaId: '',
      shiftTypeId: '',
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getStatusLabel = (status: ShiftStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return t('status.scheduled')
      case 'IN_PROGRESS':
        return t('status.inProgress')
      case 'COMPLETED':
        return t('status.completed')
      case 'CANCELLED':
        return t('status.cancelled')
      case 'NO_SHOW':
        return t('status.noShow')
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            {t('clear')}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filtro por estado */}
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilters({ status: value as ShiftStatus | '' })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('statusPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allStatuses')}</SelectItem>
            <SelectItem value="SCHEDULED">
              <Badge className={`mr-2 ${getStatusColor('SCHEDULED')}`}>
                {t('status.scheduled')}
              </Badge>
            </SelectItem>
            <SelectItem value="IN_PROGRESS">
              <Badge className={`mr-2 ${getStatusColor('IN_PROGRESS')}`}>
                {t('status.inProgress')}
              </Badge>
            </SelectItem>
            <SelectItem value="COMPLETED">
              <Badge className={`mr-2 ${getStatusColor('COMPLETED')}`}>
                {t('status.completed')}
              </Badge>
            </SelectItem>
            <SelectItem value="CANCELLED">
              <Badge className={`mr-2 ${getStatusColor('CANCELLED')}`}>
                {t('status.cancelled')}
              </Badge>
            </SelectItem>
            <SelectItem value="NO_SHOW">
              <Badge className={`mr-2 ${getStatusColor('NO_SHOW')}`}>{t('status.noShow')}</Badge>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por usuario */}
        <Select value={filters.userId} onValueChange={(value) => updateFilters({ userId: value })}>
          <SelectTrigger>
            <SelectValue placeholder={t('userPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allUsers')}</SelectItem>
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

        {/* Filtro por área */}
        <Select value={filters.areaId} onValueChange={(value) => updateFilters({ areaId: value })}>
          <SelectTrigger>
            <SelectValue placeholder={t('areaPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allAreas')}</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Filtro por tipo de turno */}
        <Select
          value={filters.shiftTypeId}
          onValueChange={(value) => updateFilters({ shiftTypeId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('shiftTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allShiftTypes')}</SelectItem>
            {shiftTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  {type.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por fecha de inicio */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {filters.startDate ? format(filters.startDate, 'PPP') : t('startDatePlaceholder')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2">
              {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy') : 'Select date'}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro por fecha de fin */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {filters.endDate ? format(filters.endDate, 'PPP') : t('endDatePlaceholder')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2">
              {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy') : 'Select date'}
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick date filters */}
        <Select
          onValueChange={(value) => {
            const now = new Date()
            let startDate: Date | undefined
            let endDate: Date | undefined

            switch (value) {
              case 'today':
                startDate = startOfDay(now)
                endDate = endOfDay(now)
                break
              case 'week':
                startDate = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate() - now.getDay()
                )
                endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
                break
              case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                break
              default:
                startDate = undefined
                endDate = undefined
            }

            updateFilters({ startDate, endDate })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('quickDatePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('customDates')}</SelectItem>
            <SelectItem value="today">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('today')}
              </div>
            </SelectItem>
            <SelectItem value="week">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('thisWeek')}
              </div>
            </SelectItem>
            <SelectItem value="month">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('thisMonth')}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">{t('activeFilters')}:</span>

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              {filters.search}
            </Badge>
          )}

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

          {filters.areaId && (
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
                  backgroundColor: shiftTypes.find((t) => t.id === filters.shiftTypeId)?.color,
                }}
              />
              {shiftTypes.find((t) => t.id === filters.shiftTypeId)?.name}
            </Badge>
          )}

          {(filters.startDate || filters.endDate) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {filters.startDate && format(filters.startDate, 'dd/MM/yyyy')}
              {filters.startDate && filters.endDate && ' - '}
              {filters.endDate && format(filters.endDate, 'dd/MM/yyyy')}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
