'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { createOrganizationAction } from '../api/organization-actions'
import { createOrganizationSchema, PLAN_LIMITS, type CreateOrganizationInput } from '../lib/schemas'
import { toast } from 'sonner'
import { getTaxIdConfig, formatTaxId } from '@/src/shared/lib/utils/tax-id-config'
import type { Country } from '@prisma/client'

export function CreateOrganizationForm() {
  const t = useTranslations('superAdmin.createOrganization')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

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
  const taxIdConfig = getTaxIdConfig(selectedCountry as Country)

  const onSubmit = async (data: CreateOrganizationInput) => {
    setError(null)

    startTransition(async () => {
      const result = await createOrganizationAction(data)

      if (result.success) {
        toast.success(t('success'))
        router.push('/super-admin/organizations')
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
            <p className="text-muted-foreground text-xs">{taxIdConfig.description}</p>
            {errors.taxId && <p className="text-destructive text-sm">{errors.taxId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t('form.country.label')}</Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) =>
                setValue('country', value as CreateOrganizationInput['country'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.country.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CL">Chile</SelectItem>
                <SelectItem value="AR">Argentina</SelectItem>
                <SelectItem value="PE">Perú</SelectItem>
                <SelectItem value="CO">Colombia</SelectItem>
                <SelectItem value="MX">México</SelectItem>
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-sm">{errors.country.message}</p>}
          </div>
        </CardContent>
      </Card>

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
                <SelectItem value="BASIC">Básico</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
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
                type="number"
                placeholder="5"
                max={planLimits.maxAdminHR}
                {...register('maxAdminHR', { valueAsNumber: true })}
                aria-invalid={!!errors.maxAdminHR}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxAdminHR.description')} (Máx: {planLimits.maxAdminHR})
              </p>
              {errors.maxAdminHR && (
                <p className="text-destructive text-sm">{errors.maxAdminHR.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChiefs">{t('form.maxChiefs.label')}</Label>
              <Input
                id="maxChiefs"
                type="number"
                placeholder="10"
                max={planLimits.maxChiefs}
                {...register('maxChiefs', { valueAsNumber: true })}
                aria-invalid={!!errors.maxChiefs}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxChiefs.description')} (Máx: {planLimits.maxChiefs})
              </p>
              {errors.maxChiefs && (
                <p className="text-destructive text-sm">{errors.maxChiefs.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStaff">{t('form.maxStaff.label')}</Label>
              <Input
                id="maxStaff"
                type="number"
                placeholder="50"
                max={planLimits.maxStaff}
                {...register('maxStaff', { valueAsNumber: true })}
                aria-invalid={!!errors.maxStaff}
              />
              <p className="text-muted-foreground text-xs">
                {t('form.maxStaff.description')} (Máx: {planLimits.maxStaff})
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
          <CardTitle>{t('form.contactInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder={t('form.contactPhone.placeholder')}
              {...register('contactPhone')}
              aria-invalid={!!errors.contactPhone}
            />
            {errors.contactPhone && (
              <p className="text-destructive text-sm">{errors.contactPhone.message}</p>
            )}
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
