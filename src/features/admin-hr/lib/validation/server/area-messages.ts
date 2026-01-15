import { getTranslations } from 'next-intl/server'

import type { AreaValidationMessages } from '../../schemas/admin-hr-schema'

export async function getAreaValidationMessages(locale: string): Promise<AreaValidationMessages> {
  const t = await getTranslations({ locale, namespace: 'validation' })

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
