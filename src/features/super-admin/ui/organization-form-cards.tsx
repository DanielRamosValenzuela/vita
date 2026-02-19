'use client'

import type { Country } from '@prisma/client'
import { useTranslations } from 'next-intl'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { formatTaxId, getTaxIdConfig } from '@/src/shared/lib/utils/tax-id-config'
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

import type { CreateOrganizationInput } from '../lib/schemas'

const DEFAULT_COUNTRY_CODES = ['CL', 'AR', 'PE', 'CO', 'MX'] as const

export interface OrgBasicInfoCardProps {
  register: UseFormRegister<CreateOrganizationInput>
  errors: FieldErrors<CreateOrganizationInput>
  setValue: UseFormSetValue<CreateOrganizationInput>
  selectedCountry: string
  countryCodes?: readonly string[]
  countrySelectMode?: 'controlled' | 'default'
}

export function OrgBasicInfoCard({
  register,
  errors,
  setValue,
  selectedCountry,
  countryCodes = DEFAULT_COUNTRY_CODES,
  countrySelectMode = 'controlled',
}: OrgBasicInfoCardProps) {
  const t = useTranslations('superAdmin.createOrganization')
  const tOrgs = useTranslations('superAdmin.organizations')
  const taxIdConfig = getTaxIdConfig(selectedCountry as Country)

  return (
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
          {errors.name && (
            <p className="text-destructive text-sm">{String(errors.name.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">{taxIdConfig.label}</Label>
          <Input
            id="taxId"
            placeholder={taxIdConfig.placeholder}
            maxLength={taxIdConfig.maxLength}
            {...register('taxId', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatTaxId(e.target.value, selectedCountry as Country)
                e.target.value = formatted
                setValue('taxId', formatted)
              },
            })}
            aria-invalid={!!errors.taxId}
          />
          {errors.taxId && (
            <p className="text-destructive text-sm">{String(errors.taxId.message)}</p>
          )}
          <p className="text-muted-foreground text-sm">{taxIdConfig.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">{t('form.country.label')}</Label>
          <Select
            {...(countrySelectMode === 'default'
              ? { defaultValue: selectedCountry }
              : { value: selectedCountry })}
            onValueChange={(value) => setValue('country', value as Country)}
          >
            <SelectTrigger id="country" aria-invalid={!!errors.country}>
              <SelectValue placeholder={t('form.country.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {tOrgs(`countries.${code}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-destructive text-sm">{String(errors.country.message)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export interface OrgContactCardProps {
  register: UseFormRegister<CreateOrganizationInput>
  errors: FieldErrors<CreateOrganizationInput>
  tNamespace: 'superAdmin.createOrganization' | 'superAdmin.editOrganization'
  titleKey: string
  gridLayout?: boolean
}

export function OrgContactCard({
  register,
  errors,
  tNamespace,
  titleKey,
  gridLayout = false,
}: OrgContactCardProps) {
  const t = useTranslations(tNamespace)

  const nameField = (
    <div className="space-y-2">
      <Label htmlFor="contactName">{t('form.contactName.label')}</Label>
      <Input
        id="contactName"
        placeholder={t('form.contactName.placeholder')}
        {...register('contactName')}
        aria-invalid={!!errors.contactName}
      />
      {errors.contactName && (
        <p className="text-destructive text-sm">{String(errors.contactName.message)}</p>
      )}
    </div>
  )

  const emailField = (
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
        <p className="text-destructive text-sm">{String(errors.contactEmail.message)}</p>
      )}
    </div>
  )

  const phoneField = (
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
        <p className="text-destructive text-sm">{String(errors.contactPhone.message)}</p>
      )}
    </div>
  )

  const addressField = (
    <div className="space-y-2">
      <Label htmlFor="address">{t('form.address.label')}</Label>
      <Input
        id="address"
        placeholder={t('form.address.placeholder')}
        {...register('address')}
        aria-invalid={!!errors.address}
      />
      {errors.address && (
        <p className="text-destructive text-sm">{String(errors.address.message)}</p>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(`form.${titleKey}`)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gridLayout ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {nameField}
            {emailField}
            {phoneField}
          </div>
        ) : (
          <>
            {nameField}
            {emailField}
            {phoneField}
          </>
        )}
        {addressField}
      </CardContent>
    </Card>
  )
}
