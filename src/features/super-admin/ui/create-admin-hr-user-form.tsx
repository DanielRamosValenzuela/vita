'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Organization } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

import { useRouter } from '@/i18n/navigation'

import { createAdminHRUserAction } from '../api/admin-hr-user-actions'
import { useCreateAdminHRUserSchema, type CreateAdminHRUserInput } from '../lib/schemas'

interface CreateAdminHRUserFormProps {
  organizations: Organization[]
  onSuccess?: () => void
}

export function CreateAdminHRUserForm({ organizations, onSuccess }: CreateAdminHRUserFormProps) {
  const t = useTranslations('superAdmin.createAdminHRUser')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const createAdminHRUserSchema = useCreateAdminHRUserSchema()

  const form = useForm<CreateAdminHRUserInput>({
    resolver: zodResolver(createAdminHRUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      organizationId: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = form

  const selectedOrganizationId = useWatch({ control, name: 'organizationId' })

  const onSubmit = async (data: CreateAdminHRUserInput) => {
    setError(null)

    startTransition(async () => {
      const result = await createAdminHRUserAction(data)

      if (result.success) {
        toast.success(t('success'))
        if (onSuccess) onSuccess()
        else router.push('/dashboard/admin-hr-users')
      } else {
        setError(result.error || t('error'))
        toast.error(result.error || t('error'))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
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
            <Label htmlFor="email">{t('form.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form.emailPlaceholder')}
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('form.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('form.passwordPlaceholder')}
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <p className="text-muted-foreground text-xs">{t('form.passwordDescription')}</p>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationId">{t('form.organization')}</Label>
            <Select
              value={selectedOrganizationId}
              onValueChange={(value) => setValue('organizationId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.organizationPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizationId && (
              <p className="text-destructive text-sm">{errors.organizationId.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('create')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/admin-hr-users')}
            >
              {t('cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
