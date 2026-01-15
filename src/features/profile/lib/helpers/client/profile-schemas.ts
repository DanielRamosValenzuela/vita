'use client'

import type { Country } from '@prisma/client'

import {
  createChangePasswordSchema,
  createUpdateDocumentSchema,
  createUpdateProfileSchema,
} from '../../schemas/profile-schema'
import { useProfileValidationMessages } from '../../validation/client/profile-messages'

export function useUpdateProfileSchema() {
  const messages = useProfileValidationMessages()
  return createUpdateProfileSchema(messages)
}

export function useChangePasswordSchema() {
  const messages = useProfileValidationMessages()
  return createChangePasswordSchema(messages)
}

export function useUpdateDocumentSchema(country: Country) {
  const messages = useProfileValidationMessages()
  return createUpdateDocumentSchema(country, messages)
}
