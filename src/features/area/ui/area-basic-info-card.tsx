'use client'

import { useTranslations } from 'next-intl'

import { AREA_ICONS } from '@/src/shared/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconPicker } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'

import type { AreaFormAction } from './area-edit-utils'

export interface AreaBasicInfoCardProps {
  name: string
  description: string
  icon: string
  color: string
  dispatch: (action: AreaFormAction) => void
}

export function AreaBasicInfoCard({
  name,
  description,
  icon,
  color,
  dispatch,
}: AreaBasicInfoCardProps) {
  const t = useTranslations('adminHR.areas')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editForm.basicInfo')}</CardTitle>
        <CardDescription>{t('editForm.basicInfoDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{t('form.name')}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
            placeholder={t('form.namePlaceholder')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">{t('form.description')}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })
            }
            placeholder={t('form.descriptionPlaceholder')}
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t('form.icon')}</Label>
          <IconPicker
            value={icon}
            onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'icon', value: v })}
            icons={AREA_ICONS}
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
          <Label htmlFor="areaColor">{t('form.color')}</Label>
          <div className="flex items-center gap-2">
            <input
              id="areaColor"
              type="color"
              value={color}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'color', value: e.target.value })
              }
              className="h-10 w-20 cursor-pointer rounded-md border"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'color', value: e.target.value })
              }
              className="font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
