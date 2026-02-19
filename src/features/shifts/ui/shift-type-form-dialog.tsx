'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'

import { SHIFT_TYPE_ICONS } from '@/src/shared/lib/constants'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { IconPicker } from '@/src/shared/ui/icon-picker'
import { Label } from '@/src/shared/ui/label'

import type {
  AreaOption,
  ShiftType,
  ShiftTypeFormData,
  ShiftTypesAction,
} from './shift-types-utils'
import { ShiftTypeAreaAssignment } from './shift-type-area-assignment'
import { ShiftTypeBasicFields } from './shift-type-basic-fields'
import { ShiftTypeColorPicker } from './shift-type-color-picker'
import { ShiftTypeStaffFields } from './shift-type-staff-fields'

interface ShiftTypeFormDialogProps {
  isOpen: boolean
  formData: ShiftTypeFormData
  editingShiftType: ShiftType | null
  dispatch: Dispatch<ShiftTypesAction>
  isPending: boolean
  hasChanges: boolean
  areas: AreaOption[]
  onSave: () => void
}

export function ShiftTypeFormDialog({
  isOpen,
  formData,
  editingShiftType,
  dispatch,
  isPending,
  hasChanges,
  areas,
  onSave,
}: ShiftTypeFormDialogProps) {
  const t = useTranslations('shifts.shiftTypes')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'CLOSE_DIALOG' })
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingShiftType ? t('edit.title') : t('createModal.title')}</DialogTitle>
          <DialogDescription>
            {editingShiftType ? t('edit.description') : t('createModal.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-5 max-h-[70vh] overflow-y-auto overflow-x-hidden overscroll-contain pt-px">
          <ShiftTypeBasicFields formData={formData} dispatch={dispatch} />
          <div className="grid gap-2">
            <Label>{t('form.icon')}</Label>
            <IconPicker
              value={formData.icon}
              onChange={(v) => dispatch({ type: 'UPDATE_FORM', field: 'icon', value: v })}
              icons={SHIFT_TYPE_ICONS}
              ariaLabel={t('form.iconAria')}
              searchPlaceholder={t('form.iconSearch')}
              statusLabel={(showing, total, hasSearch) =>
                hasSearch
                  ? t('form.iconShowing', { showing, total })
                  : t('form.iconTotal', { total })
              }
            />
          </div>
          <ShiftTypeColorPicker formData={formData} dispatch={dispatch} />
          <ShiftTypeStaffFields formData={formData} dispatch={dispatch} />
          <ShiftTypeAreaAssignment formData={formData} dispatch={dispatch} areas={areas} />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FORM', field: 'isActive', value: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">{t('form.active')}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}>
            {t('form.cancel')}
          </Button>
          <Button onClick={onSave} disabled={!hasChanges || isPending}>
            {isPending ? t('form.saving') : t('form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
