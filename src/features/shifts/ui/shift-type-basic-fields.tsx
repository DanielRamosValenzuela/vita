'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

import type { ShiftClassification, ShiftTypeFormData, ShiftTypesAction } from './shift-types-utils'

interface ShiftTypeBasicFieldsProps {
  formData: ShiftTypeFormData
  dispatch: Dispatch<ShiftTypesAction>
}

export function ShiftTypeBasicFields({ formData, dispatch }: ShiftTypeBasicFieldsProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <>
      <div className="grid gap-2 scroll-mt-4">
        <Label htmlFor="name">{t('form.name')}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => dispatch({ type: 'UPDATE_FORM', field: 'name', value: e.target.value })}
          placeholder={t('form.namePlaceholder')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="durationHours">{t('form.durationHours')}</Label>
          <Input
            id="durationHours"
            type="number"
            min={0}
            max={24}
            value={formData.durationHours}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_FORM', field: 'durationHours', value: e.target.value })
            }
            placeholder={t('form.durationPlaceholder')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="durationMinutes">{t('form.durationMinutes')}</Label>
          <Input
            id="durationMinutes"
            type="number"
            min={0}
            max={59}
            value={formData.durationMinutes}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FORM',
                field: 'durationMinutes',
                value: e.target.value,
              })
            }
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid gap-2 scroll-mt-4">
        <Label htmlFor="classification">{t('form.classification')}</Label>
        <Select
          value={formData.classification}
          onValueChange={(value) =>
            dispatch({
              type: 'UPDATE_FORM',
              field: 'classification',
              value: value as ShiftClassification,
            })
          }
        >
          <SelectTrigger id="classification" className="w-full">
            <SelectValue placeholder={t('form.classification')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAY">{t('classification.DAY')}</SelectItem>
            <SelectItem value="NIGHT">{t('classification.NIGHT')}</SelectItem>
            <SelectItem value="MIXED">{t('classification.MIXED')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
