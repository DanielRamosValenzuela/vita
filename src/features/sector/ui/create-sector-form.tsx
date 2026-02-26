'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Spinner } from '@/src/shared/ui/atoms'
import { useFormAction } from '@/src/shared/hooks'
import { AREA_ICONS } from '@/src/shared/lib/constants'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconPicker } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'

import { useRouter } from '@/i18n/navigation'

import { createSectorAction } from '../api'
import { useCreateSectorSchema } from '../lib/helpers/client'
import type { CreateSectorInput } from '../lib/types'

export function CreateSectorForm() {
  const t = useTranslations('adminHR.sectors')
  const router = useRouter()
  const createSchema = useCreateSectorSchema()

  const { execute, isPending, error } = useFormAction({
    action: createSectorAction,
    successMessage: t('createSuccess'),
    errorMessage: t('createError'),
    redirectTo: '/dashboard/sectors',
  })

  const form = useForm<CreateSectorInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'Layers',
      color: '#3b82f6',
    },
  })

  const [icon, setIcon] = useState('Layers')
  const [color, setColor] = useState('#3b82f6')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form

  const onIconChange = (v: string) => {
    setIcon(v)
    setValue('icon', v)
  }

  const onColorChange = (v: string) => {
    setColor(v)
    setValue('color', v)
  }

  const onSubmit = (data: CreateSectorInput) => {
    execute({ ...data, icon, color })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('createTitle')}</CardTitle>
          <CardDescription>{t('createDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              placeholder={t('form.namePlaceholder')}
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea
              id="description"
              placeholder={t('form.descriptionPlaceholder')}
              {...register('description')}
              rows={4}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('form.icon')}</Label>
            <IconPicker
              value={icon}
              onChange={onIconChange}
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

          <div className="space-y-2">
            <Label htmlFor="color">{t('form.color')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Spinner size="sm" className="mr-2" />}
              {t('create')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/sectors')}
            >
              {t('cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
