'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

import type { ShiftTypeFormData, ShiftTypesAction } from './shift-types-utils'
import { PREDEFINED_COLORS } from './shift-types-utils'

interface ShiftTypeColorPickerProps {
  formData: ShiftTypeFormData
  dispatch: Dispatch<ShiftTypesAction>
}

export function ShiftTypeColorPicker({ formData, dispatch }: ShiftTypeColorPickerProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <div className="grid gap-2">
      <Label htmlFor="color">{t('form.color')}</Label>
      <div className="flex items-center gap-2">
        <Input
          id="color"
          type="color"
          value={formData.color}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_FORM', field: 'color', value: e.target.value })
          }
          className="h-10 w-20"
        />
        <div className="flex gap-1">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="w-6 h-6 cursor-pointer rounded-full border-2 border-transparent hover:border-gray-300"
              style={{ backgroundColor: color }}
              onClick={() =>
                dispatch({ type: 'UPDATE_FORM', field: 'color', value: color })
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
