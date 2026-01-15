'use client'

import { useTranslations } from 'next-intl'

import type { OrganizationValidationMessages } from '../../schemas/organization-schema'

export function useOrganizationValidationMessages(): OrganizationValidationMessages {
  const t = useTranslations('validation')

  return {
    name: {
      minLength: (min: number) => t('organization.nameMinLength', { min }),
      maxLength: (max: number) => t('organization.nameMaxLength', { max }),
    },
    contactName: {
      minLength: (min: number) => t('organization.contactNameMinLength', { min }),
      maxLength: (max: number) => t('organization.contactNameMaxLength', { max }),
    },
    email: {
      required: t('email.required'),
      invalid: t('email.invalid'),
      maxLength: (max: number) => t('organization.contactEmailMaxLength', { max }),
    },
    phone: {
      minLength: (min: number) => t('organization.contactPhoneMinLength', { min }),
      maxLength: (max: number) => t('organization.contactPhoneMaxLength', { max }),
    },
    address: {
      maxLength: (max: number) => t('organization.addressMaxLength', { max }),
    },
    taxId: {
      required: t('taxId.required'),
      invalid: t('taxId.invalid'),
      minLength: (min: number) => t('organization.taxIdMinLength', { min }),
      maxLength: (max: number) => t('organization.taxIdMaxLength', { max }),
    },
    monthlyFee: {
      min: t('organization.monthlyFeeMin'),
      max: t('organization.monthlyFeeMax'),
    },
    limit: {
      integer: t('organization.limitInteger'),
      min: t('organization.limitMin'),
      max: (max: number) => t('organization.limitMax', { max }),
    },
    planLimit: {
      maxAdminHRExceeded: t('organization.planLimitMaxAdminHRExceeded'),
      maxChiefsExceeded: t('organization.planLimitMaxChiefsExceeded'),
      maxStaffExceeded: t('organization.planLimitMaxStaffExceeded'),
    },
    reason: {
      minLength: (min: number) => t('reason.minLength', { min }),
      maxLength: (max: number) => t('reason.maxLength', { max }),
    },
  }
}
