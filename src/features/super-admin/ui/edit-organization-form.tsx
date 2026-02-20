'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Organization } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { toast } from 'sonner'

import { Spinner } from '@/src/shared/ui/atoms'
import { ROLES } from '@/src/shared/lib/constants'
import { Badge } from '@/src/shared/ui/badge'
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

import { updateOrganizationAction } from '../api/organization-actions'
import {
  PLAN_LIMITS,
  useUpdateOrganizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
} from '../lib/schemas'
import { OrgBasicInfoCard, OrgContactCard } from './organization-form-cards'

const ALL_COUNTRY_CODES = ['CL', 'AR', 'PE', 'CO', 'MX', 'US'] as const

interface EditOrganizationFormProps {
  organization: Organization & {
    users: Array<{ role: string }>
  }
}

export function EditOrganizationForm({ organization }: EditOrganizationFormProps) {
  const t = useTranslations('superAdmin.editOrganization')
  const tOrgs = useTranslations('superAdmin.organizations')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const updateOrganizationSchema = useUpdateOrganizationSchema()

  const currentAdminHR = organization.users.filter((u) => u.role === ROLES.ADMIN_HR).length
  const currentChiefs = organization.users.filter((u) => u.role === ROLES.CHIEF_AREA).length
  const currentStaff = organization.users.filter((u) => u.role === ROLES.STAFF_HEALTH).length

  const form = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      id: organization.id,
      name: organization.name,
      taxId: organization.taxId,
      country: organization.country,
      plan: organization.plan,
      monthlyFee: organization.monthlyFee,
      maxAdminHR: organization.maxAdminHR,
      maxChiefs: organization.maxChiefs,
      maxStaff: organization.maxStaff,
      contactName: organization.contactName ?? '',
      contactEmail: organization.contactEmail ?? '',
      contactPhone: organization.contactPhone ?? '',
      address: organization.address ?? '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = form

  const selectedCountry = useWatch({ control, name: 'country' }) ?? organization.country
  const selectedPlan = useWatch({ control, name: 'plan' }) ?? organization.plan
  const planLimits = PLAN_LIMITS[selectedPlan as 'BASIC' | 'PRO' | 'ENTERPRISE']

  const onSubmit = async (data: UpdateOrganizationInput) => {
    setError(null)

    startTransition(async () => {
      const result = await updateOrganizationAction(data)

      if (result.success) {
        toast.success(result.message || t('success'))
        router.push(`/dashboard/organizations/${organization.id}`)
      } else {
        const errorMessage = result.error || t('error')
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push(`/dashboard/organizations/${organization.id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      <OrgBasicInfoCard
        register={register as unknown as UseFormRegister<CreateOrganizationInput>}
        errors={errors as unknown as FieldErrors<CreateOrganizationInput>}
        setValue={setValue as unknown as UseFormSetValue<CreateOrganizationInput>}
        selectedCountry={selectedCountry as string}
        countryCodes={ALL_COUNTRY_CODES}
        countrySelectMode="default"
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('form.billing')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan">{t('form.plan.label')}</Label>
              <Select
                value={selectedPlan}
                onValueChange={(value) => setValue('plan', value as 'BASIC' | 'PRO' | 'ENTERPRISE')}
              >
                <SelectTrigger id="plan" aria-invalid={!!errors.plan}>
                  <SelectValue placeholder={t('form.plan.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">{tOrgs('plans.BASIC')}</SelectItem>
                  <SelectItem value="PRO">{tOrgs('plans.PRO')}</SelectItem>
                  <SelectItem value="ENTERPRISE">{tOrgs('plans.ENTERPRISE')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.plan && <p className="text-destructive text-sm">{errors.plan.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyFee">{t('form.monthlyFee.label')}</Label>
              <Input
                id="monthlyFee"
                type="number"
                step="0.01"
                placeholder={t('form.monthlyFee.placeholder')}
                {...register('monthlyFee', { valueAsNumber: true })}
                aria-invalid={!!errors.monthlyFee}
              />
              {errors.monthlyFee && (
                <p className="text-destructive text-sm">{errors.monthlyFee.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('form.accountLimits')}</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-500">
            {'⚠️'} {t('form.limitsWarning')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxAdminHR">
                {t('form.maxAdminHR.label')}
                <Badge variant="secondary" className="ml-2">
                  {t('form.currentCount', { count: currentAdminHR })}
                </Badge>
              </Label>
              <Input
                id="maxAdminHR"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                {...register('maxAdminHR', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                aria-invalid={!!errors.maxAdminHR}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxAdminHR.description')}{' '}
                {t('form.minMaxDescription', { min: currentAdminHR, max: planLimits.maxAdminHR })}
              </p>
              {errors.maxAdminHR && (
                <p className="text-destructive text-sm">{errors.maxAdminHR.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChiefs">
                {t('form.maxChiefs.label')}
                <Badge variant="secondary" className="ml-2">
                  {t('form.currentCount', { count: currentChiefs })}
                </Badge>
              </Label>
              <Input
                id="maxChiefs"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                {...register('maxChiefs', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                aria-invalid={!!errors.maxChiefs}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxChiefs.description')}{' '}
                {t('form.minMaxDescription', { min: currentChiefs, max: planLimits.maxChiefs })}
              </p>
              {errors.maxChiefs && (
                <p className="text-destructive text-sm">{errors.maxChiefs.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStaff">
                {t('form.maxStaff.label')}
                <Badge variant="secondary" className="ml-2">
                  {t('form.currentCount', { count: currentStaff })}
                </Badge>
              </Label>
              <Input
                id="maxStaff"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                {...register('maxStaff', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                aria-invalid={!!errors.maxStaff}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxStaff.description')}{' '}
                {t('form.minMaxDescription', { min: currentStaff, max: planLimits.maxStaff })}
              </p>
              {errors.maxStaff && (
                <p className="text-destructive text-sm">{errors.maxStaff.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <OrgContactCard
        register={register as unknown as UseFormRegister<CreateOrganizationInput>}
        errors={errors as unknown as FieldErrors<CreateOrganizationInput>}
        tNamespace="superAdmin.editOrganization"
        titleKey="contact"
        gridLayout
      />

      {error && (
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/organizations/${organization.id}`)}
          disabled={isPending}
        >
          {t('form.cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner size="sm" className="mr-2" />}
          {t('form.submit')}
        </Button>
      </div>
    </form>
  )
}
