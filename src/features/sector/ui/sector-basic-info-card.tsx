'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { AREA_ICONS } from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'

import { useRouter } from '@/i18n/navigation'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconDisplay, IconPicker } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'

import { updateSectorAction } from '../api'

const DEFAULT_SECTOR_ICON = 'Layers'

interface SectorBasicInfoCardProps {
  sector: {
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
  }
  canEdit?: boolean
}

export function SectorBasicInfoCard({ sector, canEdit = true }: SectorBasicInfoCardProps) {
  const t = useTranslations('adminHR.sectors')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(sector.name)
  const [description, setDescription] = useState(sector.description ?? '')
  const [icon, setIcon] = useState(sector.icon ?? 'Layers')
  const [color, setColor] = useState(sector.color)

  const hasChanges =
    name !== sector.name ||
    description !== (sector.description ?? '') ||
    icon !== (sector.icon ?? 'Layers') ||
    color !== sector.color

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSectorAction(sector.id, {
        name,
        description,
        icon,
        color,
      })
      if (result.success) {
        toast.success(result.message)
        router.push('/dashboard/sectors')
      } else
        toast.error(result.error)
    })
  }

  if (!canEdit)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('editForm.basicInfo')}</CardTitle>
          <CardDescription>{t('editForm.basicInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>{t('form.name')}</Label>
            <p className="text-sm">{sector.name}</p>
          </div>
          {sector.description && (
            <div className="grid gap-2">
              <Label>{t('form.description')}</Label>
              <p className="text-muted-foreground text-sm">{sector.description}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label>{t('form.icon')}</Label>
            <Badge variant="secondary" className="w-fit gap-1.5 px-2 py-1">
              <span style={{ color: sector.color }}>
                <IconDisplay iconName={sector.icon ?? DEFAULT_SECTOR_ICON} size={16} />
              </span>
              <span className="text-xs">{sector.icon ?? DEFAULT_SECTOR_ICON}</span>
            </Badge>
          </div>
          <div className="grid gap-2">
            <Label>{t('form.color')}</Label>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: sector.color }}
              />
              <span className="font-mono text-sm">{sector.color}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )

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
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.namePlaceholder')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">{t('form.description')}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t('form.icon')}</Label>
          <IconPicker
            value={icon}
            onChange={setIcon}
            icons={AREA_ICONS}
            ariaLabel={t('editForm.iconAria')}
            searchPlaceholder={t('form.iconSearch')}
            statusLabel={(showing, total, hasSearch) =>
              hasSearch
                ? t('form.iconShowing', { showing, total })
                : t('form.iconTotal', { total })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sectorColor">{t('form.color')}</Label>
          <div className="flex items-center gap-2">
            <input
              id="sectorColor"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded-md border"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending && <Spinner size="sm" className="mr-2" />}
          {t('save')}
        </Button>
      </CardContent>
    </Card>
  )
}
