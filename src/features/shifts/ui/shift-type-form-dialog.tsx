'use client'

import type { Dispatch } from 'react'
import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'

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
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { SearchableAddableList } from '@/src/shared/ui/molecules'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import {
  PREDEFINED_COLORS,
  type AreaOption,
  type ShiftClassification,
  type ShiftType,
  type ShiftTypeFormData,
  type ShiftTypesAction,
} from './shift-types-utils'

export interface ShiftTypeFormDialogProps {
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
          <div className="grid gap-2 scroll-mt-4">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FORM', field: 'name', value: e.target.value })
              }
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
          {!formData.isGlobal && (
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
