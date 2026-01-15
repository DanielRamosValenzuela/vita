'use client'

import { useTranslations } from 'next-intl'

import type { ProfileValidationMessages } from '../../schemas/profile-schema'

export function useProfileValidationMessages(): ProfileValidationMessages {
  const t = useTranslations('validation')

  return {
    name: {
      required: t('name.required'),
      minLength: t('name.minLength'),
      maxLength: t('name.maxLength'),
    },
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
    confirmPassword: {
      required: t('confirmPassword.required'),
      mismatch: t('confirmPassword.mismatch'),
    },
    currentPassword: {
      required: t('currentPassword.required'),
    },
    description: {
      maxLength: (max: number) => t('description.maxLength', { max }),
    },
    document: {
      required: t('document.required'),
      invalid: t('document.invalid'),
    },
  }
}
