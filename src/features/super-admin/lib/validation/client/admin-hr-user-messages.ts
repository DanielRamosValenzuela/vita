'use client'

import { useTranslations } from 'next-intl'

import type { AdminHRUserValidationMessages } from '../../schemas/admin-hr-user-schema'

export function useAdminHRUserValidationMessages(): AdminHRUserValidationMessages {
  const t = useTranslations('validation')

  return {
    name: {
      required: t('name.required'),
      minLength: t('name.minLength'),
      maxLength: t('name.maxLength'),
    },
    email: {
      invalid: t('adminHRUser.emailInvalid'),
    },
    password: {
      required: t('password.required'),
      minLength: t('password.minLength'),
      maxLength: t('password.maxLength'),
      uppercase: t('password.uppercase'),
      lowercase: t('password.lowercase'),
      number: t('password.number'),
    },
    organization: {
      required: t('organization.required'),
    },
  }
}
