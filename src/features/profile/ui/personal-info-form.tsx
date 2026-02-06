'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import { Calendar } from '@/src/shared/ui/calendar'
import { cn } from '@/src/shared/lib/utils'

import { updatePersonalInfoAction } from '../api/personal-info-actions'
import { updatePersonalInfoSchema, type UpdatePersonalInfoInput } from '../lib/schemas/personal-info-schema'

interface PersonalInfoFormProps {
  initialData: {
    name: string
    phone?: string | null
    address?: string | null
    additionalInfo?: string | null
    birthDate?: Date | null
  }
}

export function PersonalInfoForm({ initialData }: PersonalInfoFormProps) {
  const t = useTranslations('profile.personalInfo')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    initialData.birthDate ? new Date(initialData.birthDate) : undefined
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdatePersonalInfoInput>({
    resolver: zodResolver(updatePersonalInfoSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone || '',
      address: initialData.address || '',
      additionalInfo: initialData.additionalInfo || '',
    },
  })

  const onSubmit = async (data: UpdatePersonalInfoInput) => {
    setError(null)

    startTransition(async () => {
      const result = await updatePersonalInfoAction({
        ...data,
        birthDate: birthDate || null,
      })

      if (result.success) 
        toast.success(t('success'))
       else {
        setError(result.error || t('error'))
        toast.error(result.error || t('error'))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
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
              <Label htmlFor="phone">{t('phone.label')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('phone.placeholder')}
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">{t('birthDate.label')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !birthDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, 'PPP') : <span>{t('birthDate.placeholder')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={(date) => {
                      setBirthDate(date)
                      setValue('birthDate', date)
                    }}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{t('address.label')}</Label>
              <Input
                id="address"
                placeholder={t('address.placeholder')}
                {...register('address')}
                aria-invalid={!!errors.address}
              />
              {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="additionalInfo">{t('additionalInfo.label')}</Label>
              <Textarea
                id="additionalInfo"
                placeholder={t('additionalInfo.placeholder')}
                rows={3}
                {...register('additionalInfo')}
                aria-invalid={!!errors.additionalInfo}
              />
              {errors.additionalInfo && (
                <p className="text-destructive text-sm">{errors.additionalInfo.message}</p>
              )}
              <p className="text-muted-foreground text-xs">{t('additionalInfo.hint')}</p>
            </div>
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
