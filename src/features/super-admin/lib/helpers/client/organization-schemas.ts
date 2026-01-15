'use client'

import {
  createOrganizationSchema,
  createUpdateOrganizationSchema,
} from '../../schemas/organization-schema'
import { useOrganizationValidationMessages } from '../../validation/client/organization-messages'

export function useCreateOrganizationSchema() {
  const messages = useOrganizationValidationMessages()
  return createOrganizationSchema(messages)
}

export function useUpdateOrganizationSchema() {
  const messages = useOrganizationValidationMessages()
  return createUpdateOrganizationSchema(messages)
}
