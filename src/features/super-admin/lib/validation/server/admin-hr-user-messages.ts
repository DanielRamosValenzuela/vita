import { getTranslations } from 'next-intl/server'

import type { AdminHRUserValidationMessages } from '../../schemas/admin-hr-user-schema'

export async function getAdminHRUserValidationMessages(
  locale: string
): Promise<AdminHRUserValidationMessages> {
  const t = await getTranslations({ locale, namespace: 'validation' })

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
