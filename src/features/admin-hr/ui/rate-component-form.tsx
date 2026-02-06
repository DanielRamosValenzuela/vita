'use client'

import { useTranslations } from 'next-intl'
import { Trash2, GripVertical, Info } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/shared/ui/tooltip'
import { CurrencyInput } from '@/src/shared/ui/atoms'
import type { Currency } from '@prisma/client'
import {
  COMPONENT_TYPES,
  COMPONENT_UNITS,
  APPLY_CONDITIONS,
  type ComponentType,
  type ComponentUnit,
  type ApplyCondition,
} from '@/src/shared/lib/constants'
import type { RateComponentData } from '../api/rate-template-actions'

interface RateComponentFormProps {
  component: RateComponentData
  index: number
  currency: Currency
  onUpdate: (index: number, data: Partial<RateComponentData>) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

export function RateComponentForm({
  component,
  index,
  currency,
  onUpdate,
  onRemove,
  canRemove,
}: RateComponentFormProps) {
  const t = useTranslations('adminHR.rates.componentForm')

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card relative group">
      <div className="absolute left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
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

      <div className="grid gap-4 pl-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>{t('type')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('typeTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
            <div className="flex items-center gap-2 mb-2">
              <Label>{t('unit')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('unitTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={component.unit}
              onValueChange={(value) => onUpdate(index, { unit: value as ComponentUnit })}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>{t('value')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('valueTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {component.unit === COMPONENT_UNITS.MULTIPLIER || component.unit === COMPONENT_UNITS.PERCENTAGE ? (
              <Input
                type="number"
                step="0.1"
                value={component.value}
                onChange={(e) => onUpdate(index, { value: parseFloat(e.target.value) || 0 })}
                placeholder={component.unit === COMPONENT_UNITS.MULTIPLIER ? '1.5' : '10'}
              />
            ) : (
              <CurrencyInput
                currency={currency}
                value={component.value}
                onChange={(value) => onUpdate(index, { value })}
                showSymbol
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>{t('applyCondition')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('applyConditionTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
