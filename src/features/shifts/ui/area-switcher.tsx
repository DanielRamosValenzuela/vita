'use client'

import { useTranslations } from 'next-intl'

import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui/tabs'
import { renderIcon } from '@/src/shared/ui/icon-picker'

interface AreaOption {
  id: string
  name: string
  color?: string
  icon?: string
}

interface AreaSwitcherProps {
  areas: AreaOption[]
  selectedAreaId: string | null
  onAreaChange: (areaId: string | null) => void
}

const ALL_AREAS_VALUE = '__all__'

export function AreaSwitcher({ areas, selectedAreaId, onAreaChange }: AreaSwitcherProps) {
  const t = useTranslations('shifts.areaSwitcher')

  if (areas.length === 0) 
    return (
      <p className="text-sm text-muted-foreground">{t('noAreas')}</p>
    )
  

  return (
    <Tabs
      value={selectedAreaId ?? ALL_AREAS_VALUE}
      onValueChange={(value) => onAreaChange(value === ALL_AREAS_VALUE ? null : value)}
    >
      <TabsList className="h-auto flex-wrap gap-1">
        <TabsTrigger value={ALL_AREAS_VALUE} className="text-sm">
          {t('allAreas')}
        </TabsTrigger>
        {areas.map((area) => (
          <TabsTrigger key={area.id} value={area.id} className="text-sm gap-1.5">
            {area.color && (
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: area.color }}
              />
            )}
            {!area.color && area.icon && renderIcon(area.icon, 'shrink-0', 14)}
            {area.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
