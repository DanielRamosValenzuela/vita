'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'
import { Switch } from '@/src/shared/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { createAreaAction } from '../api/area-actions'
import { createAreaSchema, type CreateAreaInput } from '../lib/schemas'
import { toast } from 'sonner'

export function CreateAreaForm() {
  const t = useTranslations('adminHR.areas')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateAreaInput>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form

  const isActive = watch('isActive')

  const onSubmit = async (data: CreateAreaInput) => {
    setError(null)

    startTransition(async () => {
      const result = await createAreaAction(data)

      if (result.success) {
        toast.success(t('createSuccess'))
        router.push('/dashboard/areas')
      } else {
        setError(result.error || t('createError'))
        toast.error(result.error || t('createError'))
      }
    })
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

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">{t('form.status')}</Label>
              <p className="text-muted-foreground text-sm">{t('form.statusDescription')}</p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('create')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/areas')}>
              {t('cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
