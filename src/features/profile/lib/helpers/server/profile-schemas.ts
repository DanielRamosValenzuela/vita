import type { Country } from '@prisma/client'

import {
  createChangePasswordSchema,
  createUpdateDocumentSchema,
} from '../../schemas/profile-schema'
import { getProfileValidationMessages } from '../../validation/server/profile-messages'

export async function getChangePasswordSchema(locale: string) {
  const messages = await getProfileValidationMessages(locale)
  return createChangePasswordSchema(messages)
}

export async function getUpdateDocumentSchema(locale: string, country: Country) {
  const messages = await getProfileValidationMessages(locale)
  return createUpdateDocumentSchema(country, messages)
}
