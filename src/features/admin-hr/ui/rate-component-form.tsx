'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Currency } from '@prisma/client'
import { GripVertical, Info, Search, Trash2 } from 'lucide-react'

import {
  APPLY_CONDITIONS,
  COMPONENT_TYPES,
  COMPONENT_UNITS,
  type ApplyCondition,
  type ComponentType,
  type ComponentUnit,
} from '@/src/shared/lib/constants'
import { getCurrencyMask } from '@/src/shared/lib/utils/input-masks'
import { Button } from '@/src/shared/ui/button'
import { Checkbox } from '@/src/shared/ui/checkbox'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { RateComponentData } from '../api/rate-template-actions'
import type { ShiftTypeOption } from './rate-template-form'

interface AreaOption {
  id: string
  name: string
}

interface RateComponentFormProps {
  component: RateComponentData
  index: number
  currency: Currency
  shiftTypes: ShiftTypeOption[]
  areas?: AreaOption[]
  onUpdate: (index: number, data: Partial<RateComponentData>) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

const FILTER_ALL = '__all__'
const EMPTY_AREAS: AreaOption[] = []

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Label>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function TypeUnitRow({
  component,
  index,
  onUpdate,
  t,
}: {
  component: RateComponentData
  index: number
  onUpdate: (index: number, data: Partial<RateComponentData>) => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <LabelWithTooltip label={t('type')} tooltip={t('typeTooltip')} />
        <Select
          value={component.type}
          onValueChange={(value) => onUpdate(index, { type: value as ComponentType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COMPONENT_TYPES).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {t(`types.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <LabelWithTooltip label={t('unit')} tooltip={t('unitTooltip')} />
        <Select
          value={component.unit}
          onValueChange={(value) => {
            const unit = value as ComponentUnit
            const isPeriodic =
              unit === COMPONENT_UNITS.MONTHLY ||
              unit === COMPONENT_UNITS.BIWEEKLY ||
              unit === COMPONENT_UNITS.WEEKLY ||
              unit === COMPONENT_UNITS.DAILY
            onUpdate(index, { unit, ...(isPeriodic && { extraOnly: false }) })
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COMPONENT_UNITS).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {t(`units.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ValueConditionRow({
  component,
  index,
  currency,
  onUpdate,
  t,
}: {
  component: RateComponentData
  index: number
  currency: Currency
  onUpdate: (index: number, data: Partial<RateComponentData>) => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <LabelWithTooltip label={t('value')} tooltip={t('valueTooltip')} />
        {component.unit === COMPONENT_UNITS.MULTIPLIER ||
        component.unit === COMPONENT_UNITS.PERCENTAGE ? (
          <Input
            type="number"
            step="0.1"
            value={component.value}
            onChange={(e) => onUpdate(index, { value: parseFloat(e.target.value) || 0 })}
            placeholder={component.unit === COMPONENT_UNITS.MULTIPLIER ? '1.5' : '10'}
          />
        ) : (
          <Input
            type="text"
            mask={getCurrencyMask(currency, true)}
            value={component.value.toString()}
            onChange={(e) => onUpdate(index, { value: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        )}
      </div>

      <div>
        <LabelWithTooltip label={t('applyCondition')} tooltip={t('applyConditionTooltip')} />
        <Select
          value={component.applyCondition}
          onValueChange={(value) => onUpdate(index, { applyCondition: value as ApplyCondition })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(APPLY_CONDITIONS).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {t(`conditions.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ShiftTypePicker({
  component,
  index,
  shiftTypes,
  areas,
  onUpdate,
  t,
}: {
  component: RateComponentData
  index: number
  shiftTypes: ShiftTypeOption[]
  areas: AreaOption[]
  onUpdate: (index: number, data: Partial<RateComponentData>) => void
  t: ReturnType<typeof useTranslations>
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [areaFilterId, setAreaFilterId] = useState<string>(FILTER_ALL)

  const filteredShiftTypes = useMemo(() => {
    let list = shiftTypes
    const q = searchQuery.trim().toLowerCase()
    if (q) list = list.filter((st) => st.name.toLowerCase().includes(q))
    if (areaFilterId !== FILTER_ALL)
      list = list.filter((st) => st.isGlobal || st.areas.some((a) => a.id === areaFilterId))
    return list
  }, [shiftTypes, searchQuery, areaFilterId])

  const handleShiftTypeToggle = (shiftTypeId: string, checked: boolean) => {
    const currentIds = component.applicableShiftTypeIds || []
    const newIds = checked
      ? [...currentIds, shiftTypeId]
      : currentIds.filter((id) => id !== shiftTypeId)
    onUpdate(index, { applicableShiftTypeIds: newIds })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>{t('applicableShiftTypes')}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t('applicableShiftTypesTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {shiftTypes.length === 0 ? (
        <div className="text-sm text-muted-foreground p-3 sm:p-4 border rounded-md bg-muted/30">
          {t('noShiftTypes')}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchShiftTypes')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                aria-label={t('searchShiftTypes')}
              />
            </div>
            {areas.length > 0 && (
              <Select value={areaFilterId} onValueChange={setAreaFilterId}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('filterByArea')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>{t('filterAllAreas')}</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="border rounded-md p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-48 overflow-y-auto">
            {filteredShiftTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noMatchingShiftTypes')}</p>
            ) : (
              filteredShiftTypes.map((shiftType) => (
                <div key={shiftType.id} className="flex items-center gap-2 sm:gap-3">
                  <Checkbox
                    id={`shift-type-${index}-${shiftType.id}`}
                    checked={component.applicableShiftTypeIds?.includes(shiftType.id) || false}
                    onCheckedChange={(checked) =>
                      handleShiftTypeToggle(shiftType.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`shift-type-${index}-${shiftType.id}`}
                    className="flex flex-wrap items-center gap-2 cursor-pointer flex-1 text-sm sm:text-base"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: shiftType.color }}
                    />
                    <span className="wrap-break-word">{shiftType.name}</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      {shiftType.isGlobal
                        ? `(${t('global')})`
                        : shiftType.areas.length > 0
                          ? `(${shiftType.areas.map((a) => a.name).join(', ')})`
                          : ''}
                    </span>
                  </Label>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function RateComponentForm({
  component,
  index,
  currency,
  shiftTypes,
  areas = EMPTY_AREAS,
  onUpdate,
  onRemove,
  canRemove,
}: RateComponentFormProps) {
  const t = useTranslations('adminHR.rates.componentForm')

  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-4 bg-card relative group">
      <div className="hidden sm:block absolute left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-destructive hover:text-destructive"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid gap-4 sm:pl-6">
        <TypeUnitRow component={component} index={index} onUpdate={onUpdate} t={t} />

        <ValueConditionRow
          component={component}
          index={index}
          currency={currency}
          onUpdate={onUpdate}
          t={t}
        />

        {component.unit !== COMPONENT_UNITS.MONTHLY &&
          component.unit !== COMPONENT_UNITS.BIWEEKLY &&
          component.unit !== COMPONENT_UNITS.WEEKLY &&
          component.unit !== COMPONENT_UNITS.DAILY && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`extra-only-${index}`}
                checked={component.extraOnly ?? false}
                onCheckedChange={(checked) => onUpdate(index, { extraOnly: checked === true })}
              />
              <Label htmlFor={`extra-only-${index}`} className="cursor-pointer text-sm">
                {t('extraOnly')}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('extraOnlyTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

        {component.type === COMPONENT_TYPES.CUSTOM && (
          <div>
            <Label>{t('customName')}</Label>
            <Input
              value={component.customName || ''}
              onChange={(e) => onUpdate(index, { customName: e.target.value })}
              placeholder={t('customNamePlaceholder')}
            />
          </div>
        )}

        {component.applyCondition === APPLY_CONDITIONS.SPECIFIC_SHIFT_TYPE && (
          <ShiftTypePicker
            component={component}
            index={index}
            shiftTypes={shiftTypes}
            areas={areas}
            onUpdate={onUpdate}
            t={t}
          />
        )}

        <div>
          <Label>{t('description')}</Label>
          <Input
            value={component.description || ''}
            onChange={(e) => onUpdate(index, { description: e.target.value })}
            placeholder={t('descriptionPlaceholder')}
          />
        </div>
      </div>
    </div>
  )
}
