'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

import type { AreaFilterOption, SectorFilterOption } from '../api/staff-filter-actions'

interface CalendarFiltersProps {
  areas: AreaFilterOption[]
  sectors: SectorFilterOption[]
  selectedAreaId: string | null
  selectedSectorId: string | null
  onAreaChange: (areaId: string | null) => void
  onSectorChange: (sectorId: string | null) => void
}

const ALL_VALUE = '__all__'

export function CalendarFilters({
  areas,
  sectors,
  selectedAreaId,
  selectedSectorId,
  onAreaChange,
  onSectorChange,
}: CalendarFiltersProps) {
  const t = useTranslations('staffDashboard.filters')

  const filteredAreas = useMemo(() => {
    if (!selectedSectorId) return areas
    const sector = sectors.find((s) => s.id === selectedSectorId)
    if (!sector) return areas
    const sectorAreaIds = new Set(sector.areaIds)
    return areas.filter((a) => sectorAreaIds.has(a.id))
  }, [areas, sectors, selectedSectorId])

  const showFilters = areas.length > 1 || sectors.length > 0
  if (!showFilters) return null

  return (
    <div className="flex w-full items-center gap-1.5 sm:w-auto sm:gap-2">
      {sectors.length > 0 && (
        <Select
          value={selectedSectorId ?? ALL_VALUE}
          onValueChange={(value) => onSectorChange(value === ALL_VALUE ? null : value)}
        >
          <SelectTrigger size="sm" className="flex-1 sm:w-auto sm:flex-none sm:max-w-[200px]">
            <SelectValue placeholder={t('sector')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{t('allSectors')}</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: sector.color }}
                  />
                  {sector.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select
        value={selectedAreaId ?? ALL_VALUE}
        onValueChange={(value) => onAreaChange(value === ALL_VALUE ? null : value)}
      >
        <SelectTrigger size="sm" className="flex-1 sm:w-auto sm:flex-none sm:max-w-[180px]">
          <SelectValue placeholder={t('area')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t('allAreas')}</SelectItem>
          {filteredAreas.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                {area.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
