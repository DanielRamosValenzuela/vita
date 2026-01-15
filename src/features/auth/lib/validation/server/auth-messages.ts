import { getTranslations } from 'next-intl/server'

import type { ValidationMessages } from '../../schemas/auth-schema'

export async function getValidationMessages(locale: string): Promise<ValidationMessages> {
  const t = await getTranslations({ locale, namespace: 'validation' })

  return {
    email: {
      required: t('email.required'),
      invalid: t('email.invalid'),
    },
    password: {
      required: t('password.required'),
      minLength: t('password.minLength'),
      maxLength: t('password.maxLength'),
      uppercase: t('password.uppercase'),
      lowercase: t('password.lowercase'),
      number: t('password.number'),
    },
    name: {
      required: t('name.required'),
      minLength: t('name.minLength'),
      maxLength: t('name.maxLength'),
    },
    docNumber: {
      required: t('docNumber.required'),
      minLength: (min: number) => t('docNumber.minLength', { min }),
      maxLength: (max: number) => t('docNumber.maxLength', { max }),
      invalid: (label: string) => t('docNumber.invalid', { label }),
    },
    confirmPassword: {
      required: t('confirmPassword.required'),
      mismatch: t('confirmPassword.mismatch'),
    },
    docType: {
      mismatch: (expected: string, country: string) => t('docType.mismatch', { expected, country }),
    },
  }
}
