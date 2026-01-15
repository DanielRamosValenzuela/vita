'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

import { updateProfileAction } from '../api/profile-actions'
import { useUpdateProfileSchema, type UpdateProfileInput } from '../lib/schemas'

interface ProfileFormProps {
  initialData: {
    name: string
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations('profile.basicInfo')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const updateProfileSchema = useUpdateProfileSchema()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setError(null)

    startTransition(async () => {
      const result = await updateProfileAction(data)

      if (result.success) {
        toast.success(t('success'))
      } else {
        setError(result.error || t('error'))
        toast.error(result.error || t('error'))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name.label')}</Label>
            <Input
              id="name"
              placeholder={t('name.placeholder')}
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email.label')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('email.placeholder')}
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
