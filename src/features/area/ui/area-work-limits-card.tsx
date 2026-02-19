'use client'

import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import type { AreaFormAction } from './area-edit-utils'

interface AreaWorkLimitsCardProps {
  maxConsecutiveHours: string
  minRestHours: string
  dayStartTime: string
  dayEndTime: string
  dispatch: (action: AreaFormAction) => void
}

export function AreaWorkLimitsCard({
  maxConsecutiveHours,
  minRestHours,
  dayStartTime,
  dayEndTime,
  dispatch,
}: AreaWorkLimitsCardProps) {
  const t = useTranslations('adminHR.areas')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.workLimits')}</CardTitle>
        <CardDescription>{t('editForm.workLimitsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="maxConsecutiveHours">{t('editForm.maxConsecutiveHours')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                    aria-hidden
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {t('editForm.maxConsecutiveHoursTooltip')}
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="maxConsecutiveHours"
              type="number"
              min={1}
              max={99}
              maxDigits={2}
              placeholder={t('editForm.maxConsecutiveHoursPlaceholder')}
              value={maxConsecutiveHours}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'maxConsecutiveHours', value: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="minRestHours">{t('editForm.minRestHours')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                    aria-hidden
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {t('editForm.minRestHoursTooltip')}
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="minRestHours"
              type="number"
              min={0}
              max={99}
              maxDigits={2}
              placeholder={t('editForm.minRestHoursPlaceholder')}
              value={minRestHours}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'minRestHours', value: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-1.5">
            <Label>{t('editForm.dayNightConfig')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help"
                  aria-hidden
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {t('editForm.dayNightConfigTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-muted-foreground text-xs">{t('editForm.dayNightConfigHelper')}</p>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
            <div className="grid gap-1.5">
              <Label htmlFor="dayStartTime" className="text-xs sm:text-sm">
                {t('editForm.dayStart')}
              </Label>
              <Input
                id="dayStartTime"
                type="time"
                value={dayStartTime}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'dayStartTime', value: e.target.value })
                }
              />
            </div>
            <span className="hidden sm:flex items-center justify-center text-muted-foreground text-sm">
              {t('editForm.separator')}
            </span>
            <div className="grid gap-1.5">
              <Label htmlFor="dayEndTime" className="text-xs sm:text-sm">
                {t('editForm.dayEnd')}
              </Label>
              <Input
                id="dayEndTime"
                type="time"
                value={dayEndTime}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'dayEndTime', value: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
