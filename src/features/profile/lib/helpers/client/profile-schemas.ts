'use client'

import type { Country } from '@prisma/client'

import {
  createChangePasswordSchema,
  createUpdateDocumentSchema,
} from '../../schemas/profile-schema'
import { useProfileValidationMessages } from '../../validation/client/profile-messages'

export function useChangePasswordSchema() {
  const messages = useProfileValidationMessages()
  return createChangePasswordSchema(messages)
}

export function useUpdateDocumentSchema(country: Country) {
  const messages = useProfileValidationMessages()
  return createUpdateDocumentSchema(country, messages)
}
