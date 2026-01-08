'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/shared/ui/card'
import { Badge } from '@/src/shared/ui/badge'
import { updateOrganizationAction } from '../api/organization-actions'
import { updateOrganizationSchema, PLAN_LIMITS, type UpdateOrganizationInput } from '../lib/schemas'
import { toast } from 'sonner'
import { getTaxIdConfig, formatTaxId } from '@/src/shared/lib/utils/tax-id-config'
import type { Organization, Country } from '@prisma/client'

interface EditOrganizationFormProps {
  organization: Organization & {
    users: Array<{ role: string }>
  }
}

export function EditOrganizationForm({ organization }: EditOrganizationFormProps) {
  const t = useTranslations('superAdmin.editOrganization')
  const tCommon = useTranslations('superAdmin.createOrganization')
  const tOrgs = useTranslations('superAdmin.organizations')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const currentAdminHR = organization.users.filter((u) => u.role === 'ADMIN_HR').length
  const currentChiefs = organization.users.filter((u) => u.role === 'CHIEF_AREA').length
  const currentStaff = organization.users.filter((u) => u.role === 'STAFF_HEALTH').length

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
  const taxIdConfig = getTaxIdConfig(selectedCountry as Country)

  const onSubmit = async (data: UpdateOrganizationInput) => {
    setError(null)

    startTransition(async () => {
      const result = await updateOrganizationAction(data)

      if (result.success) {
        toast.success(t('success'))
        router.push(`/super-admin/organizations/${organization.id}`)
      } else {
        setError(result.error || t('error'))
        toast.error(result.error || t('error'))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push(`/super-admin/organizations/${organization.id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('form.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name.label')}</Label>
            <Input
              id="name"
              placeholder={t('form.name.placeholder')}
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">{taxIdConfig.label}</Label>
            <Input
              id="taxId"
              placeholder={taxIdConfig.placeholder}
              {...register('taxId', {
                onChange: (e) => {
                  const formatted = formatTaxId(e.target.value, selectedCountry as Country)
                  e.target.value = formatted
                  setValue('taxId', formatted)
                },
              })}
              aria-invalid={!!errors.taxId}
            />
            {errors.taxId && <p className="text-destructive text-sm">{errors.taxId.message}</p>}
            <p className="text-muted-foreground text-sm">{taxIdConfig.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{tCommon('form.country.label')}</Label>
            <Select
              onValueChange={(value: Country) => setValue('country', value)}
              defaultValue={selectedCountry}
            >
              <SelectTrigger id="country" aria-invalid={!!errors.country}>
                <SelectValue placeholder={tCommon('form.country.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tOrgs.raw('countries')).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {String(name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-sm">{errors.country.message}</p>}
          </div>
        </CardContent>
      </Card>

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
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
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
            ⚠️ {t('form.limitsWarning')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxAdminHR">
                {t('form.maxAdminHR.label')}
                <Badge variant="secondary" className="ml-2">
                  {currentAdminHR} actuales
                </Badge>
              </Label>
              <Input
                id="maxAdminHR"
                type="number"
                min={currentAdminHR}
                max={planLimits.maxAdminHR}
                {...register('maxAdminHR', { valueAsNumber: true })}
                aria-invalid={!!errors.maxAdminHR}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxAdminHR.description')} (Mín: {currentAdminHR}, Máx:{' '}
                {planLimits.maxAdminHR})
              </p>
              {errors.maxAdminHR && (
                <p className="text-destructive text-sm">{errors.maxAdminHR.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChiefs">
                {t('form.maxChiefs.label')}
                <Badge variant="secondary" className="ml-2">
                  {currentChiefs} actuales
                </Badge>
              </Label>
              <Input
                id="maxChiefs"
                type="number"
                min={currentChiefs}
                max={planLimits.maxChiefs}
                {...register('maxChiefs', { valueAsNumber: true })}
                aria-invalid={!!errors.maxChiefs}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxChiefs.description')} (Mín: {currentChiefs}, Máx: {planLimits.maxChiefs}
                )
              </p>
              {errors.maxChiefs && (
                <p className="text-destructive text-sm">{errors.maxChiefs.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStaff">
                {t('form.maxStaff.label')}
                <Badge variant="secondary" className="ml-2">
                  {currentStaff} actuales
                </Badge>
              </Label>
              <Input
                id="maxStaff"
                type="number"
                min={currentStaff}
                max={planLimits.maxStaff}
                {...register('maxStaff', { valueAsNumber: true })}
                aria-invalid={!!errors.maxStaff}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxStaff.description')} (Mín: {currentStaff}, Máx: {planLimits.maxStaff})
              </p>
              {errors.maxStaff && (
                <p className="text-destructive text-sm">{errors.maxStaff.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('form.contact')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contactName">{t('form.contactName.label')}</Label>
              <Input
                id="contactName"
                placeholder={t('form.contactName.placeholder')}
                {...register('contactName')}
                aria-invalid={!!errors.contactName}
              />
              {errors.contactName && (
                <p className="text-destructive text-sm">{errors.contactName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">{t('form.contactEmail.label')}</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder={t('form.contactEmail.placeholder')}
                {...register('contactEmail')}
                aria-invalid={!!errors.contactEmail}
              />
              {errors.contactEmail && (
                <p className="text-destructive text-sm">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t('form.contactPhone.label')}</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder={t('form.contactPhone.placeholder')}
                {...register('contactPhone')}
                aria-invalid={!!errors.contactPhone}
              />
              {errors.contactPhone && (
                <p className="text-destructive text-sm">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('form.address.label')}</Label>
            <Input
              id="address"
              placeholder={t('form.address.placeholder')}
              {...register('address')}
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/super-admin/organizations/${organization.id}`)}
          disabled={isPending}
        >
          {t('form.cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('form.submit')}
        </Button>
      </div>
    </form>
  )
}
