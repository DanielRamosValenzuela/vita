import { getTranslations } from 'next-intl/server'

import type { SectorValidationMessages } from '../../schemas/sector-schema'

export async function getSectorValidationMessages(
  locale: string
): Promise<SectorValidationMessages> {
  const t = await getTranslations({ locale, namespace: 'validation' })

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
