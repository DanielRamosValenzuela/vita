'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
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

import { createOrganizationAction } from '../api/organization-actions'
import {
  PLAN_LIMITS,
  useCreateOrganizationSchema,
  type CreateOrganizationInput,
} from '../lib/schemas'
import { OrgBasicInfoCard, OrgContactCard } from './organization-form-cards'

const PLAN_CODES = ['BASIC', 'PRO', 'ENTERPRISE'] as const

export function CreateOrganizationForm() {
  const t = useTranslations('superAdmin.createOrganization')
  const tOrgs = useTranslations('superAdmin.organizations')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const createOrganizationSchema = useCreateOrganizationSchema()

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      country: 'CL',
      plan: 'BASIC',
      monthlyFee: 28600,
      maxAdminHR: 5,
      maxChiefs: 10,
      maxStaff: 50,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = form

  const selectedCountry = useWatch({ control, name: 'country' })
  const selectedPlan = useWatch({ control, name: 'plan' })
  const planLimits = PLAN_LIMITS[selectedPlan]

  const onSubmit = async (data: CreateOrganizationInput) => {
    setError(null)

    startTransition(async () => {
      const result = await createOrganizationAction(data)

      if (result.success) {
        toast.success(result.message || t('success'))
        router.push('/dashboard/organizations')
      } else {
        const errorMessage = result.error || t('error')
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <OrgBasicInfoCard
        register={register}
        errors={errors}
        setValue={setValue}
        selectedCountry={selectedCountry as string}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('form.billingInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan">{t('form.plan.label')}</Label>
            <Select
              value={selectedPlan}
              onValueChange={(value) => setValue('plan', value as CreateOrganizationInput['plan'])}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.plan.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {PLAN_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {tOrgs(`plans.${code}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">{t('form.plan.description')}</p>
            {errors.plan && <p className="text-destructive text-sm">{errors.plan.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyFee">{t('form.monthlyFee.label')}</Label>
            <Input
              id="monthlyFee"
              type="number"
              placeholder={t('form.monthlyFee.placeholder')}
              {...register('monthlyFee', { valueAsNumber: true })}
              aria-invalid={!!errors.monthlyFee}
            />
            <p className="text-muted-foreground text-sm">{t('form.monthlyFee.description')}</p>
            {errors.monthlyFee && (
              <p className="text-destructive text-sm">{errors.monthlyFee.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxAdminHR">{t('form.maxAdminHR.label')}</Label>
              <Input
                id="maxAdminHR"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="5"
                maxLength={4}
                {...register('maxAdminHR', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                aria-invalid={!!errors.maxAdminHR}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxAdminHR.description')}{' '}
                {t('form.maxSuffix', { max: planLimits.maxAdminHR })}
              </p>
              {errors.maxAdminHR && (
                <p className="text-destructive text-sm">{errors.maxAdminHR.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChiefs">{t('form.maxChiefs.label')}</Label>
              <Input
                id="maxChiefs"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="10"
                maxLength={4}
                {...register('maxChiefs', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                aria-invalid={!!errors.maxChiefs}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxChiefs.description')}{' '}
                {t('form.maxSuffix', { max: planLimits.maxChiefs })}
              </p>
              {errors.maxChiefs && (
                <p className="text-destructive text-sm">{errors.maxChiefs.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStaff">{t('form.maxStaff.label')}</Label>
              <Input
                id="maxStaff"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="50"
                maxLength={4}
                {...register('maxStaff', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                aria-invalid={!!errors.maxStaff}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxStaff.description')}{' '}
                {t('form.maxSuffix', { max: planLimits.maxStaff })}
              </p>
              {errors.maxStaff && (
                <p className="text-destructive text-sm">{errors.maxStaff.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <OrgContactCard
        register={register}
        errors={errors}
        tNamespace="superAdmin.createOrganization"
        titleKey="contactInfo"
      />

      {error && (
        <div className="bg-destructive/15 rounded-md p-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {t('form.submitting')}
            </>
          ) : (
            t('form.submit')
          )}
        </Button>
      </div>
    </form>
  )
}
