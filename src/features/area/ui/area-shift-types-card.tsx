'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconDisplay } from '@/src/shared/ui/icon-picker'
import { SearchableAddableList } from '@/src/shared/ui/molecules'

import type { AreaFormAction } from './area-edit-utils'

export interface ShiftTypeOption {
  id: string
  name: string
  durationMinutes: number
  classification: string
  color: string
  icon?: string | null
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface AreaShiftTypesCardProps {
  shiftTypes: ShiftTypeOption[]
  selectedShiftTypeIds: Set<string>
  dispatch: (action: AreaFormAction) => void
}

export function AreaShiftTypesCard({
  shiftTypes,
  selectedShiftTypeIds,
  dispatch,
}: AreaShiftTypesCardProps) {
  const t = useTranslations('adminHR.areas')
  const tShifts = useTranslations('shifts.shiftTypes')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.shiftTypes')}</CardTitle>
        <CardDescription>{t('editForm.shiftTypesDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {shiftTypes.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('editForm.noShiftTypes')}</p>
        ) : (
          <SearchableAddableList<ShiftTypeOption>
            items={shiftTypes}
            selectedIds={selectedShiftTypeIds}
            onSelectionChange={(ids) => dispatch({ type: 'SET_SHIFT_TYPES', value: ids })}
            getItemId={(st) => st.id}
            getSearchableText={(st) =>
              `${st.name} ${formatDuration(st.durationMinutes)} ${tShifts(`classification.${st.classification}`)}`
            }
            renderItem={(st) => (
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: st.color }}
                  aria-hidden
                />
                {st.icon && (
                  <span style={{ color: st.color }}>
                    <IconDisplay iconName={st.icon} size={16} />
                  </span>
                )}
                <span className="font-medium">{st.name}</span>
                <span className="text-muted-foreground text-sm">
                  {formatDuration(st.durationMinutes)} {t('editForm.separator')}{' '}
                  {tShifts(`classification.${st.classification}`)}
                </span>
              </span>
            )}
            searchPlaceholder={t('editForm.shiftTypesSearch')}
            emptyMessage={t('editForm.allAssigned')}
            noResultsMessage={t('editForm.noMatch')}
            selectedLabel={t('editForm.assignedLabel')}
            removeItemAriaLabel={(st) => t('editForm.removeShiftType', { name: st.name })}
          />
        )}
        <p className="text-muted-foreground mt-4 text-sm">
          {t('editForm.assignedCount', { count: selectedShiftTypeIds.size })}
        </p>
      </CardContent>
    </Card>
  )
}
