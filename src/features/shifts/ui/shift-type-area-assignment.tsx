'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'

import { Label } from '@/src/shared/ui/label'
import { SearchableAddableList } from '@/src/shared/ui/molecules'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { AreaOption, ShiftTypeFormData, ShiftTypesAction } from './shift-types-utils'

interface ShiftTypeAreaAssignmentProps {
  formData: ShiftTypeFormData
  dispatch: Dispatch<ShiftTypesAction>
  areas: AreaOption[]
  canCreateGlobal?: boolean
}

export function ShiftTypeAreaAssignment({
  formData,
  dispatch,
  areas,
  canCreateGlobal = true,
}: ShiftTypeAreaAssignmentProps) {
  const t = useTranslations('shifts.shiftTypes')
  const showAreasSelector = !canCreateGlobal || !formData.isGlobal

  return (
    <>
      {canCreateGlobal && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isGlobal"
            checked={formData.isGlobal}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_FORM', field: 'isGlobal', value: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <div className="flex items-center gap-1.5">
            <Label htmlFor="isGlobal">{t('form.isGlobal')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground inline-flex cursor-help rounded p-0.5"
                >
                  <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="sr-only">{t('form.isGlobal')}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {t('form.isGlobalTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      {showAreasSelector && (
        <div className="grid gap-2">
          <Label id="areas-label">{t('form.areasLabel')}</Label>
          <SearchableAddableList<AreaOption>
            items={areas}
            selectedIds={new Set(formData.areaConfigs.map((c) => c.areaId))}
            onSelectionChange={(ids) => {
              dispatch({
                type: 'SET_FORM_DATA',
                formData: {
                  ...formData,
                  areaConfigs: [
                    ...formData.areaConfigs.filter((c) => ids.has(c.areaId)),
                    ...Array.from(ids)
                      .filter((id) => !formData.areaConfigs.some((c) => c.areaId === id))
                      .map((areaId) => ({ areaId, isActive: true })),
                  ],
                },
              })
            }}
            getItemId={(a) => a.id}
            getSearchableText={(a) => a.name}
            renderItem={(a) => <span className="text-sm font-medium">{a.name}</span>}
            searchPlaceholder={t('form.areasPlaceholder')}
            searchLabel={t('form.areasSearchLabel')}
            emptyMessage={t('form.areasEmpty')}
            noResultsMessage={t('form.areasNoResults')}
            selectedLabel={t('form.areasSelected')}
            removeItemAriaLabel={(a) => t('form.areasRemoveArea', { name: a.name })}
          />
        </div>
      )}
    </>
  )
}
