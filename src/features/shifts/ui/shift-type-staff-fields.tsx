'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'

import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { ShiftTypeFormData, ShiftTypesAction } from './shift-types-utils'

interface ShiftTypeStaffFieldsProps {
  formData: ShiftTypeFormData
  dispatch: Dispatch<ShiftTypesAction>
}

export function ShiftTypeStaffFields({ formData, dispatch }: ShiftTypeStaffFieldsProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="description">{t('form.description')}</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_FORM', field: 'description', value: e.target.value })
          }
          placeholder={t('form.descriptionPlaceholder')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="minStaffRequired">{t('form.minStaffRequired')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                  aria-hidden
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {t('form.minStaffRequiredTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="minStaffRequired"
            type="number"
            min={1}
            value={formData.minStaffRequired}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FORM',
                field: 'minStaffRequired',
                value: e.target.value,
              })
            }
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="idealStaffCount">{t('form.idealStaffCount')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                  aria-hidden
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {t('form.idealStaffCountTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="idealStaffCount"
            type="number"
            min={1}
            value={formData.idealStaffCount}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FORM',
                field: 'idealStaffCount',
                value: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="maxStaffAllowed">{t('form.maxStaffAllowed')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                  aria-hidden
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {t('form.maxStaffAllowedTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="maxStaffAllowed"
            type="number"
            min={1}
            value={formData.maxStaffAllowed}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FORM',
                field: 'maxStaffAllowed',
                value: e.target.value,
              })
            }
          />
        </div>
      </div>
    </>
  )
}
