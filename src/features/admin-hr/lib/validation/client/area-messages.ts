'use client'

import { useTranslations } from 'next-intl'

import type { AreaValidationMessages } from '../../schemas/admin-hr-schema'

export function useAreaValidationMessages(): AreaValidationMessages {
  const t = useTranslations('validation')

  return {
    name: {
      minLength: (min: number) => t('area.nameMinLength', { min }),
      maxLength: (max: number) => t('area.nameMaxLength', { max }),
    },
    description: {
      maxLength: (max: number) => t('area.descriptionMaxLength', { max }),
    },
  }
}
