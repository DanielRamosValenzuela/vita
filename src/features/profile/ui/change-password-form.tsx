'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'

import { changePasswordAction } from '../api/profile-actions'
import { useChangePasswordSchema, type ChangePasswordInput } from '../lib/schemas'

export function ChangePasswordForm() {
  const t = useTranslations('profile.password')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const changePasswordSchema = useChangePasswordSchema()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setError(null)

    startTransition(async () => {
      const result = await changePasswordAction(data)

      if (result.success) {
        toast.success(t('success'))
        reset()
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
            <Label htmlFor="currentPassword">{t('currentPassword.label')}</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder={t('currentPassword.placeholder')}
              {...register('currentPassword')}
              aria-invalid={!!errors.currentPassword}
            />
            {errors.currentPassword && (
              <p className="text-destructive text-sm">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPassword.label')}</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder={t('newPassword.placeholder')}
              {...register('newPassword')}
              aria-invalid={!!errors.newPassword}
            />
            {errors.newPassword && (
              <p className="text-destructive text-sm">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword.label')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPassword.placeholder')}
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner size="sm" className="mr-2" />}
            {t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
