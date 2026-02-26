'use client'

import { useTranslations } from 'next-intl'

import type { SectorValidationMessages } from '../../schemas/sector-schema'

export function useSectorValidationMessages(): SectorValidationMessages {
  const t = useTranslations('validation')

  return {
    name: {
      minLength: (min: number) => t('sector.nameMinLength', { min }),
      maxLength: (max: number) => t('sector.nameMaxLength', { max }),
    },
    description: {
      maxLength: (max: number) => t('sector.descriptionMaxLength', { max }),
    },
  }
}
